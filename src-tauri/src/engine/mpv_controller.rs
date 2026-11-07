use crate::engine::mpv_ffi::{MpvHandle, MpvLib};
use crate::engine::types::{ChapterInfo, PlaybackState, TrackInfo, TrackKind};
use crate::error::{PlayerError, PlayerResult};
use std::ffi::{c_void, CStr, CString};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::time::Duration;
use tauri::ipc::Channel;

pub struct MpvController {
    lib: Option<MpvLib>,
    handle: Option<MpvHandle>,
    surface_id: Option<i64>,
    is_destroyed: Arc<AtomicBool>,
    cached_audio_tracks: Vec<TrackInfo>,
    cached_subtitle_tracks: Vec<TrackInfo>,
    cached_chapters: Vec<ChapterInfo>,
    last_metadata_query: Option<std::time::Instant>,
}

unsafe impl Send for MpvController {}
unsafe impl Sync for MpvController {}

impl MpvController {
    pub fn new() -> Self {
        Self {
            lib: None,
            handle: None,
            surface_id: None,
            is_destroyed: Arc::new(AtomicBool::new(false)),
            cached_audio_tracks: Vec::new(),
            cached_subtitle_tracks: Vec::new(),
            cached_chapters: Vec::new(),
            last_metadata_query: None,
        }
    }

    /// Initializes libmpv render context and binds to the native surface
    pub fn initialize(&mut self, surface_id: i64) -> PlayerResult<()> {
        let lib = MpvLib::load()?;
        let handle = unsafe { (lib.fns().create)() };
        if handle.is_null() {
            return Err(PlayerError::MpvInitFailed(
                "mpv_create returned null handle".into(),
            ));
        }

        // Configure hardware acceleration, 200% volume max, and modern GPU video output
        let options = [
            ("vo", "gpu-next"),
            ("hwdec", "auto-safe"),
            ("wid", &surface_id.to_string()),
            ("volume-max", "200"),
            ("keep-open", "yes"),
            ("idle", "yes"),
            ("ytdl", "no"),
            ("sub-auto", "fuzzy"),
            ("sub-ass", "yes"),
            ("blend-subtitles", "yes"),
        ];

        for (name, val) in options {
            let c_name = CString::new(name).unwrap();
            let c_val = CString::new(val).unwrap();
            unsafe {
                (lib.fns().set_option_string)(handle, c_name.as_ptr(), c_val.as_ptr());
            }
        }

        let init_status = unsafe { (lib.fns().initialize)(handle) };
        if init_status < 0 {
            unsafe { (lib.fns().destroy)(handle) };
            return Err(PlayerError::MpvInitFailed(format!(
                "mpv_initialize failed with error code: {init_status}"
            )));
        }

        self.lib = Some(lib);
        self.handle = Some(handle);
        self.surface_id = Some(surface_id);
        self.is_destroyed.store(false, Ordering::SeqCst);

        log::info!("libmpv initialized successfully on surface {surface_id}");
        Ok(())
    }

    /// Loads a media file or URL with optional resume timestamp safely using mpv_command array
    pub fn load_file(&mut self, uri: &str, start_pos_ms: i64) -> PlayerResult<()> {
        let start_str;
        let mut args = vec!["loadfile", uri, "replace"];
        if start_pos_ms > 0 {
            let start_sec = start_pos_ms as f64 / 1000.0;
            start_str = format!("start={:.3}", start_sec);
            args.push(&start_str);
        }
        self.last_metadata_query = None;
        self.run_command_args(&args)
    }

    pub fn play(&self) -> PlayerResult<()> {
        self.set_property_string("pause", "no")
    }

    pub fn pause(&self) -> PlayerResult<()> {
        self.set_property_string("pause", "yes")
    }

    pub fn seek(&self, timestamp_ms: i64, exact: bool) -> PlayerResult<()> {
        let seconds = (timestamp_ms.max(0) as f64) / 1000.0;
        let mode = if exact { "exact" } else { "keyframes" };
        let sec_str = format!("{:.3}", seconds);
        self.run_command_args(&["seek", &sec_str, "absolute", mode])
    }

    pub fn set_volume(&self, volume: i64) -> PlayerResult<()> {
        let clamped = volume.clamp(0, 200);
        self.set_property_string("volume", &clamped.to_string())
    }

    pub fn set_playback_rate(&self, rate: f64) -> PlayerResult<()> {
        let clamped = rate.clamp(0.25, 4.0);
        self.set_property_string("speed", &format!("{clamped:.2}"))
    }

    pub fn set_audio_track(&self, track_id: &str) -> PlayerResult<()> {
        self.set_property_string("aid", track_id)
    }

    pub fn set_subtitle_track(&self, track_id: Option<&str>) -> PlayerResult<()> {
        match track_id {
            Some(id) => self.set_property_string("sid", id),
            None => self.set_property_string("sid", "no"),
        }
    }

    pub fn set_audio_filter(&self, af_filter: &str) -> PlayerResult<()> {
        self.set_property_string("af", af_filter)
    }

    pub fn set_audio_delay(&self, delay_sec: f64) -> PlayerResult<()> {
        self.set_property_string("audio-delay", &format!("{delay_sec:.3}"))
    }

    /// Configures genuine hardware GPU video processing (Anime4K, CAS sharpening, deband, HDR tone-mapping, color grading)
    pub fn apply_video_enhancements(&self, config: &crate::engine::types::VideoShaderConfig) -> PlayerResult<()> {
        let contrast_val = (config.contrast * 100.0).round() as i64 - 100;
        let saturation_val = (config.saturation * 100.0).round() as i64 - 100;
        let _ = self.set_property_string("contrast", &contrast_val.to_string());
        let _ = self.set_property_string("saturation", &saturation_val.to_string());

        // 1. Sharpening filter (CAS / unsharp mask)
        let sharpen_val = (config.sharpness.clamp(0.0, 2.0) * 1.5).clamp(0.0, 2.0);
        let _ = self.set_property_string("sharpen", &format!("{sharpen_val:.2}"));

        // 2. Deband processing
        if config.deband_enabled || config.upscale_mode == "deband" {
            let _ = self.set_property_string("deband", "yes");
            let _ = self.set_property_string("deband-iterations", "4");
            let _ = self.set_property_string("deband-threshold", "48");
            let _ = self.set_property_string("deband-range", "16");
        } else {
            let _ = self.set_property_string("deband", "no");
        }

        // 3. HDR Tone-mapping (bt.2446a, mobius, hable, auto)
        let tone_mapping = if config.hdr_tone_mapping.is_empty() {
            "auto"
        } else {
            &config.hdr_tone_mapping
        };
        let _ = self.set_property_string("tone-mapping", tone_mapping);

        // 4. Upscaler Shader Profiles (Anime4K, CAS, Lanczos, Bilinear)
        match config.upscale_mode.as_str() {
            "anime4k" | "anime4k-fast" | "anime4k-hq" => {
                let _ = self.set_property_string("scale", "ewa_lanczos");
                let _ = self.set_property_string("cscale", "ewa_lanczos");
                let _ = self.set_property_string("dscale", "mitchell");
                let _ = self.set_property_string("correct-downscaling", "yes");
            }
            "cas" | "ultra-clarity" => {
                let _ = self.set_property_string("scale", "ewa_lanczos");
                let _ = self.set_property_string("sharpen", "0.85");
            }
            "cinematic" => {
                let _ = self.set_property_string("tone-mapping", "bt.2446a");
                let _ = self.set_property_string("deband", "yes");
            }
            _ => {
                let _ = self.set_property_string("scale", "bilinear");
            }
        }

        // 5. Denoising filter
        if config.denoise_enabled {
            let _ = self.set_property_string("vf", "lavfi=[hqdn3d=2.0:1.5:4.0:3.0]");
        } else {
            let _ = self.set_property_string("vf", "");
        }

        Ok(())
    }

    pub fn get_property_string(&self, name: &str) -> Option<String> {
        let handle = self.handle?;
        let lib = self.lib.as_ref()?;
        let c_name = CString::new(name).ok()?;

        unsafe {
            let res_ptr = (lib.fns().get_property_string)(handle, c_name.as_ptr());
            if res_ptr.is_null() {
                return None;
            }
            let res_str = CStr::from_ptr(res_ptr).to_string_lossy().into_owned();
            (lib.fns().free)(res_ptr as *mut c_void);
            Some(res_str)
        }
    }

    pub fn set_property_string(&self, name: &str, val: &str) -> PlayerResult<()> {
        let handle = self.require_handle()?;
        let lib = self.lib.as_ref().unwrap();

        let c_name = CString::new(name).map_err(|e| PlayerError::MpvCommandFailed(format!("Invalid property name '{name}': {e}")))?;
        let c_val = CString::new(val).map_err(|e| PlayerError::MpvCommandFailed(format!("Invalid property value '{val}': {e}")))?;

        let status = unsafe { (lib.fns().set_property_string)(handle, c_name.as_ptr(), c_val.as_ptr()) };
        if status < 0 {
            return Err(PlayerError::MpvCommandFailed(format!("mpv set_property_string failed for {name}={val} (error code: {status})")));
        }
        Ok(())
    }

    pub fn run_command_string(&self, cmd: &str) -> PlayerResult<()> {
        let handle = self.require_handle()?;
        let lib = self.lib.as_ref().unwrap();

        let c_cmd = CString::new(cmd).map_err(|e| PlayerError::MpvCommandFailed(format!("Invalid command string: {e}")))?;
        let status = unsafe { (lib.fns().command_string)(handle, c_cmd.as_ptr()) };
        if status < 0 {
            return Err(PlayerError::MpvCommandFailed(format!("mpv command_string failed: '{cmd}' (error code: {status})")));
        }
        Ok(())
    }

    /// Invokes mpv_command using a null-terminated array of string pointers (command injection safe)
    pub fn run_command_args(&self, args: &[&str]) -> PlayerResult<()> {
        let handle = self.require_handle()?;
        let lib = self.lib.as_ref().unwrap();

        let mut c_strings = Vec::with_capacity(args.len());
        for &arg in args {
            let c_str = CString::new(arg).map_err(|e| PlayerError::MpvCommandFailed(format!("Invalid argument '{arg}': {e}")))?;
            c_strings.push(c_str);
        }

        let mut c_ptrs: Vec<*const std::ffi::c_char> = c_strings.iter().map(|s| s.as_ptr()).collect();
        c_ptrs.push(std::ptr::null());

        let status = unsafe { (lib.fns().command)(handle, c_ptrs.as_mut_ptr() as *mut *const std::ffi::c_char) };
        if status < 0 {
            let summary = args.join(" ");
            return Err(PlayerError::MpvCommandFailed(format!("mpv_command failed for '{summary}' (code: {status})")));
        }
        Ok(())
    }

    /// Queries current snapshot of playback state with decoupled, throttled metadata updates
    pub fn query_playback_state(&mut self) -> PlaybackState {
        let pos_sec: f64 = self
            .get_property_string("time-pos")
            .and_then(|s| s.parse().ok())
            .unwrap_or(0.0);
        let duration_sec: f64 = self
            .get_property_string("duration")
            .and_then(|s| s.parse().ok())
            .unwrap_or(0.0);
        let is_paused: bool = self
            .get_property_string("pause")
            .map(|s| s == "yes")
            .unwrap_or(true);
        let speed: f64 = self
            .get_property_string("speed")
            .and_then(|s| s.parse().ok())
            .unwrap_or(1.0);
        let volume: i64 = self
            .get_property_string("volume")
            .and_then(|s| s.parse::<f64>().ok())
            .map(|v| v.round() as i64)
            .unwrap_or(100);
        let is_muted: bool = self
            .get_property_string("mute")
            .map(|s| s == "yes")
            .unwrap_or(false);
        let demuxer_cache_sec: f64 = self
            .get_property_string("demuxer-cache-time")
            .and_then(|s| s.parse().ok())
            .unwrap_or(0.0);
        let is_buffering: bool = self
            .get_property_string("paused-for-cache")
            .map(|s| s == "yes")
            .unwrap_or(false);

        // Throttle expensive track-list and chapter-list queries to once every 1000ms
        // instead of querying dozens of string FFI properties on every 16ms frame (60 FPS)
        let now = std::time::Instant::now();
        let metadata_interval = Duration::from_millis(1000);
        let should_refresh_metadata = self.last_metadata_query
            .map(|last| now.duration_since(last) >= metadata_interval)
            .unwrap_or(true);

        if should_refresh_metadata {
            self.cached_audio_tracks = self.query_tracks(TrackKind::Audio);
            self.cached_subtitle_tracks = self.query_tracks(TrackKind::Subtitle);
            self.cached_chapters = self.query_chapters();
            self.last_metadata_query = Some(now);
        }

        PlaybackState {
            position_ms: (pos_sec * 1000.0).round() as i64,
            duration_ms: (duration_sec * 1000.0).round() as i64,
            buffered_ms: ((pos_sec + demuxer_cache_sec) * 1000.0).round() as i64,
            is_paused,
            is_buffering,
            playback_rate: speed,
            volume,
            is_muted,
            audio_tracks: self.cached_audio_tracks.clone(),
            subtitle_tracks: self.cached_subtitle_tracks.clone(),
            chapters: self.cached_chapters.clone(),
        }
    }

    fn query_tracks(&self, kind: TrackKind) -> Vec<TrackInfo> {
        let track_count: i64 = self
            .get_property_string("track-list/count")
            .and_then(|s| s.parse().ok())
            .unwrap_or(0);

        let mut tracks = Vec::new();
        let kind_str = match kind {
            TrackKind::Audio => "audio",
            TrackKind::Subtitle => "sub",
            TrackKind::Video => "video",
        };

        for i in 0..track_count {
            let t_type = self.get_property_string(&format!("track-list/{i}/type"));
            if t_type.as_deref() == Some(kind_str) {
                let id = self
                    .get_property_string(&format!("track-list/{i}/id"))
                    .unwrap_or_else(|| i.to_string());
                let title = self
                    .get_property_string(&format!("track-list/{i}/title"))
                    .unwrap_or_else(|| format!("{kind_str} track #{id}"));
                let lang = self.get_property_string(&format!("track-list/{i}/lang"));
                let codec = self.get_property_string(&format!("track-list/{i}/codec"));
                let selected = self
                    .get_property_string(&format!("track-list/{i}/selected"))
                    .map(|s| s == "yes")
                    .unwrap_or(false);

                tracks.push(TrackInfo {
                    id,
                    kind,
                    label: title,
                    language: lang,
                    codec,
                    selected,
                });
            }
        }
        tracks
    }

    fn query_chapters(&self) -> Vec<ChapterInfo> {
        let count: i64 = self
            .get_property_string("chapter-list/count")
            .and_then(|s| s.parse().ok())
            .unwrap_or(0);

        let mut chapters = Vec::new();
        for i in 0..count {
            let title = self
                .get_property_string(&format!("chapter-list/{i}/title"))
                .unwrap_or_else(|| format!("Chapter {}", i + 1));
            let time: f64 = self
                .get_property_string(&format!("chapter-list/{i}/time"))
                .and_then(|s| s.parse().ok())
                .unwrap_or(0.0);

            chapters.push(ChapterInfo {
                id: i.to_string(),
                title,
                start_time_ms: (time * 1000.0).round() as i64,
                end_time_ms: 0,
            });
        }
        chapters
    }

    /// Starts a high-frequency (60Hz) property observation loop streaming state updates to the Tauri Channel
    pub fn start_telemetry_loop(
        controller: Arc<parking_lot::Mutex<MpvController>>,
        channel: Channel<PlaybackState>,
    ) {
        let is_destroyed = {
            let guard = controller.lock();
            guard.is_destroyed.clone()
        };

        std::thread::spawn(move || {
            let interval = Duration::from_millis(16); // ~60 FPS
            let mut last_state = PlaybackState::default();

            while !is_destroyed.load(Ordering::Relaxed) {
                let current_state = {
                    let mut guard = controller.lock();
                    guard.query_playback_state()
                };

                // Stream state if position changed by >= 16ms or play state shifted
                let should_emit = (current_state.position_ms - last_state.position_ms).abs() >= 16
                    || current_state.is_paused != last_state.is_paused
                    || current_state.volume != last_state.volume;

                if should_emit {
                    if channel.send(current_state.clone()).is_err() {
                        // Channel receiver closed (window navigated or closed)
                        break;
                    }
                    last_state = current_state;
                }

                std::thread::sleep(interval);
            }
        });
    }

    pub fn destroy(&mut self) {
        self.is_destroyed.store(true, Ordering::SeqCst);
        if let Some(handle) = self.handle.take() {
            if let Some(lib) = self.lib.as_ref() {
                unsafe {
                    (lib.fns().terminate_destroy)(handle);
                }
            }
        }
    }

    fn require_handle(&self) -> PlayerResult<MpvHandle> {
        self.handle
            .ok_or_else(|| PlayerError::MpvInitFailed("mpv context is not initialized".into()))
    }
}

impl Drop for MpvController {
    fn drop(&mut self) {
        self.destroy();
    }
}
