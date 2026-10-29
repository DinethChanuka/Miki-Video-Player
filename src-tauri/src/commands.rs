use crate::db::{DatabaseManager, MediaBookmark, MediaHistoryItem, MediaPreferences, MediaSessionBundle};
use crate::engine::audio_dsp::AudioDspManager;
use crate::engine::mpv_controller::MpvController;
use crate::engine::types::{PlaybackState, VideoShaderConfig};
use crate::error::{PlayerError, PlayerResult};
use crate::platform::window_compositor::WindowCompositor;
use parking_lot::Mutex;
use std::sync::Arc;
use tauri::ipc::Channel;
use tauri::{State, WebviewWindow};

#[tauri::command]
pub async fn init_native_player(
    window: WebviewWindow,
    controller: State<'_, Arc<Mutex<MpvController>>>,
) -> PlayerResult<()> {
    let surface_info = WindowCompositor::extract_surface_id(&window)?;
    let mut guard = controller.lock();
    guard.initialize(surface_info.surface_id)
}

#[tauri::command]
pub async fn subscribe_telemetry(
    channel: Channel<PlaybackState>,
    controller: State<'_, Arc<Mutex<MpvController>>>,
) -> PlayerResult<()> {
    MpvController::start_telemetry_loop(controller.inner().clone(), channel);
    Ok(())
}

#[tauri::command]
pub async fn load_media_file(
    uri: String,
    start_position_ms: i64,
    controller: State<'_, Arc<Mutex<MpvController>>>,
) -> PlayerResult<()> {
    let guard = controller.lock();
    guard.load_file(&uri, start_position_ms)
}

#[tauri::command]
pub async fn player_play(controller: State<'_, Arc<Mutex<MpvController>>>) -> PlayerResult<()> {
    let guard = controller.lock();
    guard.play()
}

#[tauri::command]
pub async fn player_pause(controller: State<'_, Arc<Mutex<MpvController>>>) -> PlayerResult<()> {
    let guard = controller.lock();
    guard.pause()
}

#[tauri::command]
pub async fn player_seek(
    timestamp_ms: i64,
    exact: bool,
    controller: State<'_, Arc<Mutex<MpvController>>>,
) -> PlayerResult<()> {
    let guard = controller.lock();
    guard.seek(timestamp_ms, exact)
}

#[tauri::command]
pub async fn player_set_volume(
    volume: i64,
    controller: State<'_, Arc<Mutex<MpvController>>>,
) -> PlayerResult<()> {
    let guard = controller.lock();
    guard.set_volume(volume)
}

#[tauri::command]
pub async fn player_set_muted(
    muted: bool,
    controller: State<'_, Arc<Mutex<MpvController>>>,
) -> PlayerResult<()> {
    let guard = controller.lock();
    guard.set_property_string("mute", if muted { "yes" } else { "no" })
}

#[tauri::command]
pub async fn player_set_rate(
    rate: f64,
    controller: State<'_, Arc<Mutex<MpvController>>>,
) -> PlayerResult<()> {
    let guard = controller.lock();
    guard.set_playback_rate(rate)
}

#[tauri::command]
pub async fn player_set_audio_track(
    track_id: String,
    controller: State<'_, Arc<Mutex<MpvController>>>,
) -> PlayerResult<()> {
    let guard = controller.lock();
    guard.set_audio_track(&track_id)
}

#[tauri::command]
pub async fn player_set_subtitle_track(
    track_id: Option<String>,
    controller: State<'_, Arc<Mutex<MpvController>>>,
) -> PlayerResult<()> {
    let guard = controller.lock();
    guard.set_subtitle_track(track_id.as_deref())
}

#[tauri::command]
pub async fn player_set_eq(
    gains_db: Vec<f32>,
    night_mode: bool,
    dsp: State<'_, Arc<Mutex<AudioDspManager>>>,
    controller: State<'_, Arc<Mutex<MpvController>>>,
) -> PlayerResult<()> {
    let filter_str = {
        let mut dsp_guard = dsp.lock();
        dsp_guard.build_composite_af_filter(&gains_db, night_mode)?
    };

    let controller_guard = controller.lock();
    controller_guard.set_audio_filter(&filter_str)
}

#[tauri::command]
pub async fn player_apply_shader(
    config: VideoShaderConfig,
    controller: State<'_, Arc<Mutex<MpvController>>>,
) -> PlayerResult<()> {
    let guard = controller.lock();
    // Configure mpv built-in filters corresponding to shader adjustments
    let contrast_val = (config.contrast * 100.0).round() as i64 - 100; // -100 to 100
    let saturation_val = (config.saturation * 100.0).round() as i64 - 100;
    let _ = guard.set_property_string("contrast", &contrast_val.to_string());
    let _ = guard.set_property_string("saturation", &saturation_val.to_string());
    Ok(())
}

#[tauri::command]
pub async fn destroy_native_player(
    controller: State<'_, Arc<Mutex<MpvController>>>,
) -> PlayerResult<()> {
    let mut guard = controller.lock();
    guard.destroy();
    Ok(())
}

// SQLite Database Operations

#[tauri::command]
pub async fn db_load_or_init_session(
    uri: String,
    title: String,
    db: State<'_, DatabaseManager>,
) -> PlayerResult<MediaSessionBundle> {
    db.load_or_init_session(&uri, &title)
}

#[tauri::command]
pub async fn db_update_progress(
    media_id: String,
    position_ms: i64,
    duration_ms: i64,
    db: State<'_, DatabaseManager>,
) -> PlayerResult<()> {
    db.update_playback_progress(&media_id, position_ms, duration_ms)
}

#[tauri::command]
pub async fn db_save_preferences(
    prefs: MediaPreferences,
    db: State<'_, DatabaseManager>,
) -> PlayerResult<()> {
    db.save_preferences(&prefs)
}

#[tauri::command]
pub async fn db_get_recent_media(
    limit: usize,
    db: State<'_, DatabaseManager>,
) -> PlayerResult<Vec<MediaHistoryItem>> {
    db.get_recent_media(limit)
}

#[tauri::command]
pub async fn db_add_bookmark(
    media_id: String,
    timestamp_ms: i64,
    label: String,
    db: State<'_, DatabaseManager>,
) -> PlayerResult<MediaBookmark> {
    db.add_bookmark(&media_id, timestamp_ms, &label)
}

#[tauri::command]
pub async fn db_remove_recent(
    media_id: String,
    db: State<'_, DatabaseManager>,
) -> PlayerResult<()> {
    db.remove_recent_item(&media_id)
}
