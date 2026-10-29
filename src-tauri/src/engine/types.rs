use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum TrackKind {
    Audio,
    Subtitle,
    Video,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct TrackInfo {
    pub id: String,
    pub kind: TrackKind,
    pub label: String,
    pub language: Option<String>,
    pub codec: Option<String>,
    pub selected: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct ChapterInfo {
    pub id: String,
    pub title: String,
    pub start_time_ms: i64,
    pub end_time_ms: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct PlaybackState {
    pub position_ms: i64,
    pub duration_ms: i64,
    pub buffered_ms: i64,
    pub is_paused: bool,
    pub is_buffering: bool,
    pub playback_rate: f64,
    pub volume: i64,
    pub is_muted: bool,
    pub audio_tracks: Vec<TrackInfo>,
    pub subtitle_tracks: Vec<TrackInfo>,
    pub chapters: Vec<ChapterInfo>,
}

impl Default for PlaybackState {
    fn default() -> Self {
        Self {
            position_ms: 0,
            duration_ms: 0,
            buffered_ms: 0,
            is_paused: true,
            is_buffering: false,
            playback_rate: 1.0,
            volume: 100,
            is_muted: false,
            audio_tracks: Vec::new(),
            subtitle_tracks: Vec::new(),
            chapters: Vec::new(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct VideoShaderConfig {
    pub ambient_glow_enabled: bool,
    pub sharpness: f32, // 0.0 to 1.0
    pub contrast: f32,  // 0.5 to 1.5
    pub saturation: f32, // 0.0 to 2.0
    pub upscale_mode: String, // "none", "anime4k-fast", "anime4k-hq"
}

impl Default for VideoShaderConfig {
    fn default() -> Self {
        Self {
            ambient_glow_enabled: true,
            sharpness: 0.2,
            contrast: 1.0,
            saturation: 1.0,
            upscale_mode: "none".into(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct AudioDspConfig {
    pub eq_gains_db: [f32; 10],
    pub night_mode_enabled: bool,
    pub audio_delay_ms: i64,
}

impl Default for AudioDspConfig {
    fn default() -> Self {
        Self {
            eq_gains_db: [0.0; 10],
            night_mode_enabled: false,
            audio_delay_ms: 0,
        }
    }
}
