use serde::{Serialize, Serializer};
use thiserror::Error;

#[derive(Debug, Clone, Copy, Serialize, PartialEq, Eq)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum ErrorCode {
    MpvLibMissing,
    MpvInitFailed,
    GpuSurfaceLost,
    HwDecFailed,
    MediaNotFound,
    CodecUnsupported,
    StreamTimeout,
    AudioDspInvalid,
    DbInitFailed,
    DbQueryFailed,
    ThumbnailExtractFailed,
    IpcChannelClosed,
}

#[derive(Debug, Clone, Copy, Serialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum ErrorSeverity {
    Warning,
    Recoverable,
    Critical,
}

#[derive(Debug, Clone, Copy, Serialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum RecoveryStrategy {
    None,
    RetryWithBackoff,
    RetrySoftwareDecode,
    FallbackToWebEngine,
    ResetAudioFilters,
    SkipToNextTrack,
}

#[derive(Debug, Clone, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct PlayerErrorEnvelope {
    pub code: ErrorCode,
    pub message: String,
    pub details: Option<String>,
    pub severity: ErrorSeverity,
    pub recovery: RecoveryStrategy,
    pub timestamp_ms: i64,
}

#[derive(Debug, Error)]
pub enum PlayerError {
    #[error("libmpv shared library could not be loaded: {0}")]
    MpvLibraryMissing(String),

    #[error("Failed to initialize mpv render context: {0}")]
    MpvInitFailed(String),

    #[error("Native GPU surface attachment failed on {platform}: {reason}")]
    GpuSurfaceLost { platform: String, reason: String },

    #[error("Media source not found or inaccessible: {path}")]
    MediaNotFound { path: String },

    #[error("Unsupported or corrupted media stream: {0}")]
    CodecUnsupported(String),

    #[error("Network stream timed out: {url}")]
    StreamTimeout { url: String },

    #[error("Invalid audio DSP parameter: {0}")]
    AudioDspInvalid(String),

    #[error("Database operation failed: {0}")]
    DatabaseError(#[from] rusqlite::Error),

    #[error("Filesystem I/O error: {0}")]
    IoError(#[from] std::io::Error),

    #[error("Thumbnail extraction failed at {timestamp_ms}ms: {reason}")]
    ThumbnailError { timestamp_ms: u64, reason: String },

    #[error("IPC channel was closed: {0}")]
    IpcError(String),
}

impl PlayerError {
    pub fn to_envelope(&self) -> PlayerErrorEnvelope {
        let now = chrono::Utc::now().timestamp_millis();
        match self {
            Self::MpvLibraryMissing(details) => PlayerErrorEnvelope {
                code: ErrorCode::MpvLibMissing,
                message: "Native media engine (libmpv) was not found on this system.".into(),
                details: Some(details.clone()),
                severity: ErrorSeverity::Recoverable,
                recovery: RecoveryStrategy::FallbackToWebEngine,
                timestamp_ms: now,
            },
            Self::MpvInitFailed(details) => PlayerErrorEnvelope {
                code: ErrorCode::MpvInitFailed,
                message: "Hardware video engine failed to initialize.".into(),
                details: Some(details.clone()),
                severity: ErrorSeverity::Recoverable,
                recovery: RecoveryStrategy::FallbackToWebEngine,
                timestamp_ms: now,
            },
            Self::GpuSurfaceLost { platform, reason } => PlayerErrorEnvelope {
                code: ErrorCode::GpuSurfaceLost,
                message: format!("Video surface lost on {platform}."),
                details: Some(reason.clone()),
                severity: ErrorSeverity::Recoverable,
                recovery: RecoveryStrategy::RetrySoftwareDecode,
                timestamp_ms: now,
            },
            Self::MediaNotFound { path } => PlayerErrorEnvelope {
                code: ErrorCode::MediaNotFound,
                message: "The requested media file could not be found.".into(),
                details: Some(path.clone()),
                severity: ErrorSeverity::Warning,
                recovery: RecoveryStrategy::None,
                timestamp_ms: now,
            },
            Self::CodecUnsupported(details) => PlayerErrorEnvelope {
                code: ErrorCode::CodecUnsupported,
                message: "Media format or codec is corrupted or unsupported.".into(),
                details: Some(details.clone()),
                severity: ErrorSeverity::Warning,
                recovery: RecoveryStrategy::SkipToNextTrack,
                timestamp_ms: now,
            },
            Self::StreamTimeout { url } => PlayerErrorEnvelope {
                code: ErrorCode::StreamTimeout,
                message: "Network stream connection timed out.".into(),
                details: Some(url.clone()),
                severity: ErrorSeverity::Recoverable,
                recovery: RecoveryStrategy::RetryWithBackoff,
                timestamp_ms: now,
            },
            Self::AudioDspInvalid(details) => PlayerErrorEnvelope {
                code: ErrorCode::AudioDspInvalid,
                message: "Audio filter parameters were out of bounds and reset.".into(),
                details: Some(details.clone()),
                severity: ErrorSeverity::Warning,
                recovery: RecoveryStrategy::ResetAudioFilters,
                timestamp_ms: now,
            },
            Self::DatabaseError(err) => PlayerErrorEnvelope {
                code: ErrorCode::DbQueryFailed,
                message: "Failed to persist media state to local SQLite database.".into(),
                details: Some(err.to_string()),
                severity: ErrorSeverity::Warning,
                recovery: RecoveryStrategy::None,
                timestamp_ms: now,
            },
            Self::IoError(err) => PlayerErrorEnvelope {
                code: ErrorCode::MediaNotFound,
                message: "Filesystem I/O error occurred.".into(),
                details: Some(err.to_string()),
                severity: ErrorSeverity::Warning,
                recovery: RecoveryStrategy::None,
                timestamp_ms: now,
            },
            Self::ThumbnailError { timestamp_ms, reason } => PlayerErrorEnvelope {
                code: ErrorCode::ThumbnailExtractFailed,
                message: format!("Could not generate preview frame at {timestamp_ms}ms."),
                details: Some(reason.clone()),
                severity: ErrorSeverity::Warning,
                recovery: RecoveryStrategy::None,
                timestamp_ms: now,
            },
            Self::IpcError(reason) => PlayerErrorEnvelope {
                code: ErrorCode::IpcChannelClosed,
                message: "Telemetry IPC channel communication failure.".into(),
                details: Some(reason.clone()),
                severity: ErrorSeverity::Warning,
                recovery: RecoveryStrategy::None,
                timestamp_ms: now,
            },
        }
    }
}

// Required by Tauri v2 #[tauri::command] so Result<T, PlayerError> serializes as structured JSON
impl Serialize for PlayerError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        self.to_envelope().serialize(serializer)
    }
}

pub type PlayerResult<T> = Result<T, PlayerError>;
