# AetherPlayer Phase 1 & Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffolding the complete cross-platform Tauri v2 multimedia player project and implementing the high-performance Rust native engine (transparent window compositor, thread-safe `MpvController`, 60Hz telemetry Tauri Channel, Audio DSP, and custom `thumb://` URI thumbnail extractor).

**Architecture:** A hybrid dual-engine architecture where `libmpv` renders hardware-accelerated video frames directly to a native child surface beneath a transparent Tauri v2 WebView window. Playback telemetry is streamed to the frontend via zero-copy typed `tauri::ipc::Channel` instances at 60Hz, while audio filter graphs and thumbnail requests are processed through asynchronous Rust pipelines.

**Tech Stack:** Tauri v2, Rust (2024 edition, tokio runtime), `raw-window-handle`, `libloading`, `parking_lot`, `serde`, `serde_json`, TypeScript 5, React 19, Vite, Tailwind CSS.

**Spec:** `docs/superpowers/specs/2026-10-29-aether-player-design.md`

## Global Constraints
- Target Tauri v2 specification with mobile compatibility (`gen/android`, `gen/ios` readiness).
- Tauri window must be configured with `transparent: true`, `decorations: false`, and `shadow: false`.
- Telemetry from Rust to TypeScript must be throttled to 60Hz to prevent IPC saturation.
- Native surface rendering must support macOS (`CAMetalLayer`/`NSView`), Windows (`HWND`), and Linux (`X11`/`Wayland`).
- Custom URI scheme `thumb` must be registered via Tauri v2 protocol API for timeline thumbnail scrubbing.

## Review Focus
1. **Host without `libmpv` installed:** Rust engine must detect missing shared libraries gracefully and enter fallback/headless state rather than crashing.
2. **Window resizing and DPI scale changes:** Native video surface handle must resize synchronously with Tauri window resizes to prevent visual tearing.
3. **High-frequency scrubbing:** Rapid seek commands over IPC must not cause lock contention or deadlock in `Arc<Mutex<MpvController>>`.
4. **Invalid or out-of-range audio EQ frequencies:** Filter generation must sanitize input gains (-20dB to +20dB) and frequencies (20Hz to 20kHz).
5. **Non-existent or corrupted media paths:** Thumbnail extraction and media loading must return structured errors across the Tauri IPC boundary instead of panicking.

---

### Task 1: Project Scaffolding & Configuration (Phase 1)

**Files:**
- Create: `src-tauri/Cargo.toml`
- Create: `src-tauri/tauri.conf.json`
- Create: `src-tauri/build.rs`
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/index.css`

**Interfaces:**
- Consumes: None (project initialization)
- Produces: Tauri v2 workspace configuration, Rust crate dependencies, Vite/React build configuration.

- [ ] **Step 1: Write `package.json` and install/verify dependencies**
- [ ] **Step 2: Write `vite.config.ts`, `tsconfig.json`, `tailwind.config.ts`, and frontend root files**
- [ ] **Step 3: Write `src-tauri/Cargo.toml` with required crates (`tauri`, `tokio`, `raw-window-handle`, `libloading`, `serde`)**
- [ ] **Step 4: Write `src-tauri/tauri.conf.json` configured for transparent windowing, mobile, and custom URI protocols**
- [ ] **Step 5: Write `src-tauri/build.rs` and verify package compilation**

---

### Task 2: Native Window Compositor Subsystem

**Files:**
- Create: `src-tauri/src/platform/mod.rs`
- Create: `src-tauri/src/platform/window_compositor.rs`
- Test: `src-tauri/tests/test_compositor.rs`

**Interfaces:**
- Consumes: Tauri Window instance, `raw-window-handle`
- Produces: `NativeSurfaceInfo { surface_id: usize, platform: SurfacePlatform }` and `attach_video_surface` function.

- [ ] **Step 1: Write failing unit test for `window_compositor` surface handle extraction and validation**
- [ ] **Step 2: Implement platform-specific surface binding for macOS (`NSView`/`CAMetalLayer`), Windows (`HWND`), and Linux (`X11`/`Wayland`)**
- [ ] **Step 3: Implement window resize and surface synchronization hooks**
- [ ] **Step 4: Run tests to verify window compositor logic**

---

### Task 3: Thread-Safe `MpvController` Core & Zero-Copy Telemetry Channel

**Files:**
- Create: `src-tauri/src/engine/mod.rs`
- Create: `src-tauri/src/engine/mpv_controller.rs`
- Create: `src-tauri/src/engine/mpv_ffi.rs`
- Create: `src-tauri/src/engine/types.rs`
- Test: `src-tauri/tests/test_mpv_controller.rs`

**Interfaces:**
- Consumes: `NativeSurfaceInfo` from Task 2, `tauri::ipc::Channel`
- Produces: `MpvController` struct, `PlaybackState` telemetry events, property observers.

- [ ] **Step 1: Define `PlaybackState`, `TrackInfo`, `ChapterInfo` typed data structures in `types.rs`**
- [ ] **Step 2: Implement `mpv_ffi.rs` dynamic runtime FFI loader for `libmpv`**
- [ ] **Step 3: Implement thread-safe `MpvController` with `hwdec=auto-safe`, `vo=gpu-next`, and wid binding**
- [ ] **Step 4: Implement 60Hz throttled property observation loop streaming over `tauri::ipc::Channel`**
- [ ] **Step 5: Write unit tests verifying telemetry serialization, seek command queuing, and graceful library absence handling**

---

### Task 4: Audio DSP Subsystem

**Files:**
- Create: `src-tauri/src/engine/audio_dsp.rs`
- Test: `src-tauri/tests/test_audio_dsp.rs`

**Interfaces:**
- Consumes: `MpvController`
- Produces: `AudioDspManager` with 10-band EQ, night mode DRC, and audio delay offset.

- [ ] **Step 1: Write failing unit test for 10-band EQ filter string formatting and clamping**
- [ ] **Step 2: Implement `AudioDspManager` generating `lavfi=[equalizer=...]` audio filter graph strings**
- [ ] **Step 3: Implement dynamic range compression (Night Mode) and audio delay controls**
- [ ] **Step 4: Run unit tests to verify filter graphs and parameter boundaries**

---

### Task 5: Background Thumbnail Extractor & Custom `thumb://` URI Protocol

**Files:**
- Create: `src-tauri/src/engine/thumbnail_extractor.rs`
- Test: `src-tauri/tests/test_thumbnail_extractor.rs`

**Interfaces:**
- Consumes: Video file path, timestamp (ms)
- Produces: `ThumbnailExtractor`, JPEG/WebP buffer cache, Tauri URI scheme handler `thumb://localhost/...`.

- [ ] **Step 1: Write failing unit test for URI path parsing and timestamp calculation**
- [ ] **Step 2: Implement `ThumbnailExtractor` with background thread pool and LRU buffer cache**
- [ ] **Step 3: Implement Tauri v2 asynchronous URI protocol handler `thumb`**
- [ ] **Step 4: Run unit tests to verify thumbnail protocol responses and caching behavior**

---

### Task 6: Tauri Commands & Application Integration

**Files:**
- Create: `src-tauri/src/commands.rs`
- Create: `src-tauri/src/lib.rs`
- Create: `src-tauri/src/main.rs`
- Test: `src-tauri/tests/test_ipc_commands.rs`

**Interfaces:**
- Consumes: `MpvController`, `AudioDspManager`, `ThumbnailExtractor`, `WindowCompositor`
- Produces: Exposed Tauri IPC commands (`init_player`, `load_file`, `play`, `pause`, `seek`, `set_eq`, `subscribe_telemetry`).

- [ ] **Step 1: Implement typed Tauri commands in `commands.rs`**
- [ ] **Step 2: Wire `tauri::Builder` in `lib.rs` with plugins, state injection, and `thumb` protocol**
- [ ] **Step 3: Implement application entry point `main.rs`**
- [ ] **Step 4: Run integration test verifying command registration and state safety**

Task 8: SQLite WAL Persistence Engine (Recent Media, Auto-Resume, Per-Video Memory)Files:Create: src-tauri/src/db/mod.rsCreate: src-tauri/src/db/models.rsTest: src-tauri/tests/test_sqlite_persistence.rsInterfaces:Consumes: rusqlite (bundled feature), Tauri app_data_dir path resolver   Produces: Thread-safe DatabaseManager, automatic schema migrations (PRAGMA user_version), and Tauri CRUD commands.   [ ] Step 1: Configure rusqlite::Connection with WAL mode, foreign_keys = ON, and busy_timeout = 5000ms[ ] Step 2: Implement transactional schema migrations (user_version = 1) for media_history, media_preferences, eq_presets, bookmarks, and playlists[ ] Step 3: Implement upsert_playback_progress with smart completion detection (greater than 95% marks completed and resets resume point to 0)[ ] Step 4: Expose Tauri commands (get_recent_media, get_media_session, save_playback_progress, save_media_preferences, add_bookmark, clear_history)3. Rust Implementation: Error Engine & SQLite Persistencesrc-tauri/Cargo.toml (Updated Dependencies)Add rusqlite (with bundled SQLite so target machines never need system SQLite installed), thiserror, blake3, and chrono:Ini, TOML[package]
name = "aether-player"
version = "0.2.0"
edition = "2024"

[lib]
name = "aether_player_lib"
crate-type = ["staticlib", "cdylib", "rlib"]

[build-dependencies]
tauri-build = { version = "2.0", features = [] }

[dependencies]
tauri = { version = "2.0", features = ["protocol-asset", "macos-private-api"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
tokio = { version = "1.40", features = ["full"] }
parking_lot = "0.12"
thiserror = "2.0"
libloading = "0.8"
raw-window-handle = "0.6"
rusqlite = { version = "0.32", features = ["bundled", "chrono", "serde_json"] }
blake3 = "1.5"
chrono = { version = "0.4", features = ["serde"] }
log = "0.4"
src-tauri/src/error.rs (Structured Error Hierarchy & Recovery Hints)Rustuse serde::{Serialize, Serializer};
use thiserror::Error;

#[derive(Debug, Clone, Copy, Serialize)]
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

#[derive(Debug, Clone, Copy, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum ErrorSeverity {
    Warning,
    Recoverable,
    Critical,
}

#[derive(Debug, Clone, Copy, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum RecoveryStrategy {
    None,
    RetryWithBackoff,
    RetrySoftwareDecode,
    FallbackToWebEngine,
    ResetAudioFilters,
    SkipToNextTrack,
}

#[derive(Debug, Serialize)]
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

    #[error("I/O error: {0}")]
    IoError(#[from] std::io::Error),

    #[error("Thumbnail extraction failed at {timestamp_ms}ms: {reason}")]
    ThumbnailError { timestamp_ms: u64, reason: String },
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
src-tauri/src/db/mod.rs (SQLite WAL Manager, Recent Media, Resume & Bookmarks)Rustuse crate::error::{PlayerError, PlayerResult};
use parking_lot::Mutex;
use rusqlite::{params, Connection, OptionalExtension};
use serde::{Deserialize, Serialize};
use std::path::Path;
use std::sync::Arc;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MediaHistoryItem {
    pub media_id: String,
    pub uri: String,
    pub title: String,
    pub duration_ms: i64,
    pub last_position_ms: i64,
    pub progress_percent: f64,
    pub is_completed: bool,
    pub play_count: i64,
    pub thumbnail_uri: Option<String>,
    pub last_played_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MediaPreferences {
    pub media_id: String,
    pub audio_track_id: Option<String>,
    pub subtitle_track_id: Option<String>,
    pub audio_delay_ms: i64,
    pub subtitle_delay_ms: i64,
    pub playback_rate: f64,
    pub aspect_ratio: String,
    pub shader_preset: String,
    pub eq_gains_json: String, // JSON array of 10 f32 values
    pub night_mode_enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MediaBookmark {
    pub id: i64,
    pub media_id: String,
    pub timestamp_ms: i64,
    pub label: String,
    pub thumbnail_uri: Option<String>,
    pub created_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MediaSessionBundle {
    pub media_id: String,
    pub history: Option<MediaHistoryItem>,
    pub preferences: MediaPreferences,
    pub bookmarks: Vec<MediaBookmark>,
}

pub struct DatabaseManager {
    conn: Arc<Mutex<Connection>>,
}

impl DatabaseManager {
    pub fn new<P: AsRef<Path>>(db_path: P) -> PlayerResult<Self> {
        if let Some(parent) = db_path.as_ref().parent() {
            std::fs::create_dir_all(parent)?;
        }

        let conn = Connection::open(db_path)?;

        // Enable WAL mode for high-concurrency non-blocking reads/writes
        conn.execute_batch(
            "PRAGMA journal_mode = WAL;
             PRAGMA synchronous = NORMAL;
             PRAGMA foreign_keys = ON;
             PRAGMA temp_store = MEMORY;
             PRAGMA mmap_size = 30000000000;
             PRAGMA busy_timeout = 5000;",
        )?;

        let manager = Self {
            conn: Arc::new(Mutex::new(conn)),
        };
        manager.run_migrations()?;
        Ok(manager)
    }

    /// Generates a deterministic BLAKE3 hash ID for any local path or remote URL
    pub fn compute_media_id(uri: &str) -> String {
        blake3::hash(uri.trim().as_bytes()).to_hex()[..32].to_string()
    }

    fn run_migrations(&self) -> PlayerResult<()> {
        let mut conn = self.conn.lock();
        let version: i32 = conn.query_row("PRAGMA user_version", [], |row| row.get(0))?;

        if version < 1 {
            let tx = conn.transaction()?;
            tx.execute_batch(
                "CREATE TABLE IF NOT EXISTS media_history (
                    media_id TEXT PRIMARY KEY,
                    uri TEXT NOT NULL UNIQUE,
                    title TEXT NOT NULL,
                    duration_ms INTEGER NOT NULL DEFAULT 0,
                    last_position_ms INTEGER NOT NULL DEFAULT 0,
                    is_completed INTEGER NOT NULL DEFAULT 0,
                    play_count INTEGER NOT NULL DEFAULT 1,
                    thumbnail_uri TEXT,
                    last_played_at INTEGER NOT NULL
                );

                CREATE INDEX IF NOT EXISTS idx_media_history_last_played
                    ON media_history(last_played_at DESC);

                CREATE TABLE IF NOT EXISTS media_preferences (
                    media_id TEXT PRIMARY KEY,
                    audio_track_id TEXT,
                    subtitle_track_id TEXT,
                    audio_delay_ms INTEGER NOT NULL DEFAULT 0,
                    subtitle_delay_ms INTEGER NOT NULL DEFAULT 0,
                    playback_rate REAL NOT NULL DEFAULT 1.0,
                    aspect_ratio TEXT NOT NULL DEFAULT 'auto',
                    shader_preset TEXT NOT NULL DEFAULT 'ambient_default',
                    eq_gains_json TEXT NOT NULL DEFAULT '[0,0,0,0,0,0,0,0,0,0]',
                    night_mode_enabled INTEGER NOT NULL DEFAULT 0,
                    FOREIGN KEY (media_id) REFERENCES media_history(media_id) ON DELETE CASCADE
                );

                CREATE TABLE IF NOT EXISTS bookmarks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    media_id TEXT NOT NULL,
                    timestamp_ms INTEGER NOT NULL,
                    label TEXT NOT NULL,
                    thumbnail_uri TEXT,
                    created_at INTEGER NOT NULL,
                    FOREIGN KEY (media_id) REFERENCES media_history(media_id) ON DELETE CASCADE
                );

                CREATE INDEX IF NOT EXISTS idx_bookmarks_media
                    ON bookmarks(media_id, timestamp_ms ASC);

                CREATE TABLE IF NOT EXISTS eq_presets (
                    name TEXT PRIMARY KEY,
                    gains_json TEXT NOT NULL,
                    preamp_db REAL NOT NULL DEFAULT 0.0,
                    night_mode INTEGER NOT NULL DEFAULT 0
                );

                PRAGMA user_version = 1;",
            )?;
            tx.commit()?;
        }
        Ok(())
    }

    /// Loads or initializes the complete session bundle (resume position, saved tracks, EQ, bookmarks)
    pub fn load_or_init_session(&self, uri: &str, title: &str) -> PlayerResult<MediaSessionBundle> {
        let media_id = Self::compute_media_id(uri);
        let now = chrono::Utc::now().timestamp_millis();
        let conn = self.conn.lock();

        let existing_history: Option<MediaHistoryItem> = conn
            .query_row(
                "SELECT media_id, uri, title, duration_ms, last_position_ms, is_completed,
                        play_count, thumbnail_uri, last_played_at
                 FROM media_history WHERE media_id = ?1",
                params![media_id],
                |row| {
                    let duration: i64 = row.get(3)?;
                    let pos: i64 = row.get(4)?;
                    let progress = if duration > 0 {
                        ((pos as f64 / duration as f64) * 100.0).clamp(0.0, 100.0)
                    } else {
                        0.0
                    };
                    Ok(MediaHistoryItem {
                        media_id: row.get(0)?,
                        uri: row.get(1)?,
                        title: row.get(2)?,
                        duration_ms: duration,
                        last_position_ms: pos,
                        progress_percent: progress,
                        is_completed: row.get::<_, i64>(5)? != 0,
                        play_count: row.get(6)?,
                        thumbnail_uri: row.get(7)?,
                        last_played_at: row.get(8)?,
                    })
                },
            )
            .optional()?;

        if existing_history.is_some() {
            conn.execute(
                "UPDATE media_history
                 SET play_count = play_count + 1, last_played_at = ?2, title = ?3
                 WHERE media_id = ?1",
                params![media_id, now, title],
            )?;
        } else {
            conn.execute(
                "INSERT INTO media_history
                 (media_id, uri, title, duration_ms, last_position_ms, is_completed, play_count, thumbnail_uri, last_played_at)
                 VALUES (?1, ?2, ?3, 0, 0, 0, 1, ?4, ?5)",
                params![
                    media_id,
                    uri,
                    title,
                    format!("thumb://localhost/{media_id}/5000"),
                    now
                ],
            )?;
        }

        let preferences = conn
            .query_row(
                "SELECT media_id, audio_track_id, subtitle_track_id, audio_delay_ms,
                        subtitle_delay_ms, playback_rate, aspect_ratio, shader_preset,
                        eq_gains_json, night_mode_enabled
                 FROM media_preferences WHERE media_id = ?1",
                params![media_id],
                |row| {
                    Ok(MediaPreferences {
                        media_id: row.get(0)?,
                        audio_track_id: row.get(1)?,
                        subtitle_track_id: row.get(2)?,
                        audio_delay_ms: row.get(3)?,
                        subtitle_delay_ms: row.get(4)?,
                        playback_rate: row.get(5)?,
                        aspect_ratio: row.get(6)?,
                        shader_preset: row.get(7)?,
                        eq_gains_json: row.get(8)?,
                        night_mode_enabled: row.get::<_, i64>(9)? != 0,
                    })
                },
            )
            .optional()?
            .unwrap_or_else(|| MediaPreferences {
                media_id: media_id.clone(),
                audio_track_id: None,
                subtitle_track_id: None,
                audio_delay_ms: 0,
                subtitle_delay_ms: 0,
                playback_rate: 1.0,
                aspect_ratio: "auto".into(),
                shader_preset: "ambient_default".into(),
                eq_gains_json: "[0,0,0,0,0,0,0,0,0,0]".into(),
                night_mode_enabled: false,
            });

        let mut stmt = conn.prepare(
            "SELECT id, media_id, timestamp_ms, label, thumbnail_uri, created_at
             FROM bookmarks WHERE media_id = ?1 ORDER BY timestamp_ms ASC",
        )?;
        let bookmarks = stmt
            .query_map(params![media_id], |row| {
                Ok(MediaBookmark {
                    id: row.get(0)?,
                    media_id: row.get(1)?,
                    timestamp_ms: row.get(2)?,
                    label: row.get(3)?,
                    thumbnail_uri: row.get(4)?,
                    created_at: row.get(5)?,
                })
            })?
            .collect::<Result<Vec<_>, _>>()?;

        Ok(MediaSessionBundle {
            media_id,
            history: existing_history,
            preferences,
            bookmarks,
        })
    }

    /// Updates playback position; marks video completed and resets resume point if >= 95% watched
    pub fn update_playback_progress(
        &self,
        media_id: &str,
        position_ms: i64,
        duration_ms: i64,
    ) -> PlayerResult<()> {
        let now = chrono::Utc::now().timestamp_millis();
        let is_completed = duration_ms > 0 && (position_ms as f64 / duration_ms as f64) >= 0.95;
        let saved_position = if is_completed || position_ms < 3_000 {
            0
        } else {
            position_ms
        };

        let conn = self.conn.lock();
        conn.execute(
            "UPDATE media_history
             SET last_position_ms = ?2,
                 duration_ms = CASE WHEN ?3 > 0 THEN ?3 ELSE duration_ms END,
                 is_completed = ?4,
                 last_played_at = ?5
             WHERE media_id = ?1",
            params![
                media_id,
                saved_position,
                duration_ms,
                i64::from(is_completed),
                now
            ],
        )?;
        Ok(())
    }

    pub fn save_preferences(&self, prefs: &MediaPreferences) -> PlayerResult<()> {
        let conn = self.conn.lock();
        conn.execute(
            "INSERT INTO media_preferences (
                media_id, audio_track_id, subtitle_track_id, audio_delay_ms,
                subtitle_delay_ms, playback_rate, aspect_ratio, shader_preset,
                eq_gains_json, night_mode_enabled
             ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)
             ON CONFLICT(media_id) DO UPDATE SET
                audio_track_id = excluded.audio_track_id,
                subtitle_track_id = excluded.subtitle_track_id,
                audio_delay_ms = excluded.audio_delay_ms,
                subtitle_delay_ms = excluded.subtitle_delay_ms,
                playback_rate = excluded.playback_rate,
                aspect_ratio = excluded.aspect_ratio,
                shader_preset = excluded.shader_preset,
                eq_gains_json = excluded.eq_gains_json,
                night_mode_enabled = excluded.night_mode_enabled",
            params![
                prefs.media_id,
                prefs.audio_track_id,
                prefs.subtitle_track_id,
                prefs.audio_delay_ms,
                prefs.subtitle_delay_ms,
                prefs.playback_rate,
                prefs.aspect_ratio,
                prefs.shader_preset,
                prefs.eq_gains_json,
                i64::from(prefs.night_mode_enabled),
            ],
        )?;
        Ok(())
    }

    pub fn get_recent_media(&self, limit: usize) -> PlayerResult<Vec<MediaHistoryItem>> {
        let conn = self.conn.lock();
        let mut stmt = conn.prepare(
            "SELECT media_id, uri, title, duration_ms, last_position_ms, is_completed,
                    play_count, thumbnail_uri, last_played_at
             FROM media_history
             ORDER BY last_played_at DESC
             LIMIT ?1",
        )?;

        let items = stmt
            .query_map(params![limit as i64], |row| {
                let duration: i64 = row.get(3)?;
                let pos: i64 = row.get(4)?;
                let progress = if duration > 0 {
                    ((pos as f64 / duration as f64) * 100.0).clamp(0.0, 100.0)
                } else {
                    0.0
                };
                Ok(MediaHistoryItem {
                    media_id: row.get(0)?,
                    uri: row.get(1)?,
                    title: row.get(2)?,
                    duration_ms: duration,
                    last_position_ms: pos,
                    progress_percent: progress,
                    is_completed: row.get::<_, i64>(5)? != 0,
                    play_count: row.get(6)?,
                    thumbnail_uri: row.get(7)?,
                    last_played_at: row.get(8)?,
                })
            })?
            .collect::<Result<Vec<_>, _>>()?;

        Ok(items)
    }

    pub fn add_bookmark(
        &self,
        media_id: &str,
        timestamp_ms: i64,
        label: &str,
    ) -> PlayerResult<MediaBookmark> {
        let now = chrono::Utc::now().timestamp_millis();
        let thumb_uri = Some(format!("thumb://localhost/{media_id}/{timestamp_ms}"));
        let conn = self.conn.lock();
        conn.execute(
            "INSERT INTO bookmarks (media_id, timestamp_ms, label, thumbnail_uri, created_at)
             VALUES (?1, ?2, ?3, ?4, ?5)",
            params![media_id, timestamp_ms, label, thumb_uri, now],
        )?;
        let id = conn.last_insert_rowid();
        Ok(MediaBookmark {
            id,
            media_id: media_id.to_string(),
            timestamp_ms,
            label: label.to_string(),
            thumbnail_uri: thumb_uri,
            created_at: now,
        })
    }

    pub fn remove_recent_item(&self, media_id: &str) -> PlayerResult<()> {
        let conn = self.conn.lock();
        conn.execute(
            "DELETE FROM media_history WHERE media_id = ?1",
            params![media_id],
        )?;
        Ok(())
    }
}
4. Phase 3 Implementation: TypeScript Dual-Engine Adapter (IPlayerEngine) & Zustand Storesrc/core/PlayerEngine.ts (Unified Contract, TauriMpvEngine & WebMediaEngine)TypeScriptimport { invoke, Channel } from '@tauri-apps/api/core';
import Hls from 'hls.js';

export type EngineType = 'tauri-mpv' | 'web-media';

export type ErrorCode =
  | 'MPV_LIB_MISSING'
  | 'MPV_INIT_FAILED'
  | 'GPU_SURFACE_LOST'
  | 'HW_DEC_FAILED'
  | 'MEDIA_NOT_FOUND'
  | 'CODEC_UNSUPPORTED'
  | 'STREAM_TIMEOUT'
  | 'AUDIO_DSP_INVALID'
  | 'DB_QUERY_FAILED'
  | 'THUMBNAIL_EXTRACT_FAILED';

export type RecoveryStrategy =
  | 'none'
  | 'retry_with_backoff'
  | 'retry_software_decode'
  | 'fallback_to_web_engine'
  | 'reset_audio_filters'
  | 'skip_to_next_track';

export interface PlayerErrorEnvelope {
  code: ErrorCode;
  message: string;
  details?: string;
  severity: 'warning' | 'recoverable' | 'critical';
  recovery: RecoveryStrategy;
  timestampMs: number;
}

export interface TrackInfo {
  id: string;
  kind: 'audio' | 'subtitle' | 'video';
  label: string;
  language?: string;
  codec?: string;
  selected: boolean;
}

export interface ChapterInfo {
  id: string;
  title: string;
  startTimeMs: number;
  endTimeMs: number;
}

export interface VideoShaderConfig {
  ambientGlowEnabled: boolean;
  sharpness: number; // 0.0 to 1.0
  contrast: number;  // 0.5 to 1.5
  saturation: number; // 0.0 to 2.0
  upscaleMode: 'none' | 'anime4k-fast' | 'anime4k-hq';
}

export interface PlaybackTelemetry {
  positionMs: number;
  durationMs: number;
  bufferedMs: number;
  isPaused: boolean;
  isBuffering: boolean;
  playbackRate: number;
  volume: number;
  isMuted: boolean;
  audioTracks: TrackInfo[];
  subtitleTracks: TrackInfo[];
  chapters: ChapterInfo[];
}

export interface IPlayerEngine {
  readonly engineType: EngineType;
  initialize(container?: HTMLVideoElement): Promise<void>;
  load(uri: string, startPositionMs?: number): Promise<void>;
  play(): Promise<void>;
  pause(): Promise<void>;
  seek(timestampMs: number, exact?: boolean): Promise<void>;
  setVolume(volume: number): Promise<void>;
  setMuted(muted: boolean): Promise<void>;
  setPlaybackRate(rate: number): Promise<void>;
  setAudioTrack(trackId: string): Promise<void>;
  setSubtitleTrack(trackId: string | null): Promise<void>;
  setEqualizer(gainsDb: number[], nightMode: boolean): Promise<void>;
  applyVideoFilter(config: VideoShaderConfig): Promise<void>;
  onTelemetry(callback: (telemetry: PlaybackTelemetry) => void): () => void;
  onError(callback: (error: PlayerErrorEnvelope) => void): () => void;
  destroy(): Promise<void>;
}

/**
 * Helper to normalize any thrown Tauri IPC error or JS Error into a structured PlayerErrorEnvelope
 */
export function parsePlayerError(err: unknown): PlayerErrorEnvelope {
  if (typeof err === 'object' && err !== null && 'code' in err && 'recovery' in err) {
    return err as PlayerErrorEnvelope;
  }
  return {
    code: 'CODEC_UNSUPPORTED',
    message: err instanceof Error ? err.message : String(err),
    severity: 'recoverable',
    recovery: 'none',
    timestampMs: Date.now(),
  };
}

/**
 * 1. Native Rust + libmpv Engine (Zero-Copy Window Compositor + 60Hz Tauri v2 Channel)
 */
export class TauriMpvEngine implements IPlayerEngine {
  public readonly engineType: EngineType = 'tauri-mpv';
  private telemetryListeners = new Set<(t: PlaybackTelemetry) => void>();
  private errorListeners = new Set<(e: PlayerErrorEnvelope) => void>();
  private channel: Channel<PlaybackTelemetry> | null = null;

  async initialize(): Promise<void> {
    try {
      await invoke('init_native_player');
      this.channel = new Channel<PlaybackTelemetry>();
      this.channel.onmessage = (telemetry) => {
        this.telemetryListeners.forEach((cb) => cb(telemetry));
      };
      await invoke('subscribe_telemetry', { channel: this.channel });
    } catch (err) {
      const parsed = parsePlayerError(err);
      this.emitError(parsed);
      throw parsed;
    }
  }

  async load(uri: string, startPositionMs = 0): Promise<void> {
    try {
      await invoke('load_media_file', { uri, startPositionMs });
    } catch (err) {
      const parsed = parsePlayerError(err);
      this.emitError(parsed);
      throw parsed;
    }
  }

  async play(): Promise<void> {
    await invoke('player_play');
  }

  async pause(): Promise<void> {
    await invoke('player_pause');
  }

  async seek(timestampMs: number, exact = false): Promise<void> {
    await invoke('player_seek', { timestampMs: Math.max(0, Math.round(timestampMs)), exact });
  }

  async setVolume(volume: number): Promise<void> {
    await invoke('player_set_volume', { volume: Math.max(0, Math.min(100, volume)) });
  }

  async setMuted(muted: boolean): Promise<void> {
    await invoke('player_set_muted', { muted });
  }

  async setPlaybackRate(rate: number): Promise<void> {
    await invoke('player_set_rate', { rate: Math.max(0.25, Math.min(4.0, rate)) });
  }

  async setAudioTrack(trackId: string): Promise<void> {
    await invoke('player_set_audio_track', { trackId });
  }

  async setSubtitleTrack(trackId: string | null): Promise<void> {
    await invoke('player_set_subtitle_track', { trackId });
  }

  async setEqualizer(gainsDb: number[], nightMode: boolean): Promise<void> {
    try {
      await invoke('player_set_eq', { gainsDb, nightMode });
    } catch (err) {
      this.emitError(parsePlayerError(err));
    }
  }

  async applyVideoFilter(config: VideoShaderConfig): Promise<void> {
    await invoke('player_apply_shader', { config });
  }

  onTelemetry(callback: (telemetry: PlaybackTelemetry) => void): () => void {
    this.telemetryListeners.add(callback);
    return () => this.telemetryListeners.delete(callback);
  }

  onError(callback: (error: PlayerErrorEnvelope) => void): () => void {
    this.errorListeners.add(callback);
    return () => this.errorListeners.delete(callback);
  }

  private emitError(err: PlayerErrorEnvelope) {
    this.errorListeners.forEach((cb) => cb(err));
  }

  async destroy(): Promise<void> {
    this.telemetryListeners.clear();
    this.errorListeners.clear();
    await invoke('destroy_native_player').catch(() => {});
  }
}

/**
 * 2. Web & Cloud Streaming Engine (HTML5 Video + HLS.js + WebAudio 10-Band EQ)
 */
export class WebMediaEngine implements IPlayerEngine {
  public readonly engineType: EngineType = 'web-media';
  private videoEl: HTMLVideoElement | null = null;
  private hls: Hls | null = null;
  private audioCtx: AudioContext | null = null;
  private eqBands: BiquadFilterNode[] = [];
  private compressorNode: DynamicsCompressorNode | null = null;
  private rafId: number | null = null;

  private telemetryListeners = new Set<(t: PlaybackTelemetry) => void>();
  private errorListeners = new Set<(e: PlayerErrorEnvelope) => void>();

  private static readonly EQ_FREQUENCIES = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

  async initialize(container?: HTMLVideoElement): Promise<void> {
    this.videoEl = container ?? document.createElement('video');
    this.videoEl.crossOrigin = 'anonymous';
    this.videoEl.playsInline = true;
    this.setupWebAudioGraph();
    this.startTelemetryLoop();
  }

  private setupWebAudioGraph(): void {
    if (!this.videoEl || this.audioCtx) return;
    this.audioCtx = new AudioContext();
    const source = this.audioCtx.createMediaElementSource(this.videoEl);

    this.eqBands = WebMediaEngine.EQ_FREQUENCIES.map((freq) => {
      const filter = this.audioCtx!.createBiquadFilter();
      filter.type = 'peaking';
      filter.frequency.value = freq;
      filter.Q.value = 1.41;
      filter.gain.value = 0;
      return filter;
    });

    this.compressorNode = this.audioCtx.createDynamicsCompressor();
    this.compressorNode.threshold.value = -24;
    this.compressorNode.knee.value = 30;
    this.compressorNode.ratio.value = 1; // 1 = bypass unless Night Mode is active

    // Connect chain: source -> 10 EQ bands -> DRC compressor -> destination
    let currentNode: AudioNode = source;
    for (const band of this.eqBands) {
      currentNode.connect(band);
      currentNode = band;
    }
    currentNode.connect(this.compressorNode);
    this.compressorNode.connect(this.audioCtx.destination);
  }

  async load(uri: string, startPositionMs = 0): Promise<void> {
    if (!this.videoEl) throw new Error('WebMediaEngine not initialized');

    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }

    const isHls = uri.includes('.m3u8');
    if (isHls && Hls.isSupported()) {
      this.hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });
      this.hls.loadSource(uri);
      this.hls.attachMedia(this.videoEl);
      this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (startPositionMs > 0 && this.videoEl) {
          this.videoEl.currentTime = startPositionMs / 1000;
        }
      });
      this.hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          this.emitError({
            code: data.type === Hls.ErrorTypes.NETWORK_ERROR ? 'STREAM_TIMEOUT' : 'CODEC_UNSUPPORTED',
            message: `HLS stream error: ${data.details}`,
            severity: 'recoverable',
            recovery: data.type === Hls.ErrorTypes.NETWORK_ERROR ? 'retry_with_backoff' : 'none',
            timestampMs: Date.now(),
          });
        }
      });
    } else {
      this.videoEl.src = uri;
      this.videoEl.currentTime = startPositionMs / 1000;
    }
  }

  async play(): Promise<void> {
    if (this.audioCtx?.state === 'suspended') {
      await this.audioCtx.resume();
    }
    await this.videoEl?.play();
  }

  async pause(): Promise<void> {
    this.videoEl?.pause();
  }

  async seek(timestampMs: number): Promise<void> {
    if (this.videoEl) {
      this.videoEl.currentTime = Math.max(0, timestampMs / 1000);
    }
  }

  async setVolume(volume: number): Promise<void> {
    if (this.videoEl) {
      this.videoEl.volume = Math.max(0, Math.min(1, volume / 100));
    }
  }

  async setMuted(muted: boolean): Promise<void> {
    if (this.videoEl) {
      this.videoEl.muted = muted;
    }
  }

  async setPlaybackRate(rate: number): Promise<void> {
    if (this.videoEl) {
      this.videoEl.playbackRate = Math.max(0.25, Math.min(4.0, rate));
    }
  }

  async setAudioTrack(trackId: string): Promise<void> {
    if (this.hls) {
      this.hls.audioTrack = Number(trackId);
    }
  }

  async setSubtitleTrack(trackId: string | null): Promise<void> {
    if (this.hls) {
      this.hls.subtitleTrack = trackId === null ? -1 : Number(trackId);
    }
  }

  async setEqualizer(gainsDb: number[], nightMode: boolean): Promise<void> {
    this.eqBands.forEach((band, idx) => {
      const clamped = Math.max(-20, Math.min(20, gainsDb[idx] ?? 0));
      band.gain.value = clamped;
    });
    if (this.compressorNode) {
      this.compressorNode.ratio.value = nightMode ? 12 : 1;
    }
  }

  async applyVideoFilter(config: VideoShaderConfig): Promise<void> {
    if (!this.videoEl) return;
    this.videoEl.style.filter = `contrast(${config.contrast}) saturate(${config.saturation})`;
  }

  private startTelemetryLoop(): void {
    const tick = () => {
      if (this.videoEl) {
        const bufferedEnd =
          this.videoEl.buffered.length > 0
            ? this.videoEl.buffered.end(this.videoEl.buffered.length - 1) * 1000
            : 0;

        this.telemetryListeners.forEach((cb) =>
          cb({
            positionMs: Math.round(this.videoEl!.currentTime * 1000),
            durationMs: Math.round((this.videoEl!.duration || 0) * 1000),
            bufferedMs: Math.round(bufferedEnd),
            isPaused: this.videoEl!.paused,
            isBuffering: this.videoEl!.readyState < 3,
            playbackRate: this.videoEl!.playbackRate,
            volume: Math.round(this.videoEl!.volume * 100),
            isMuted: this.videoEl!.muted,
            audioTracks: [],
            subtitleTracks: [],
            chapters: [],
          })
        );
      }
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  onTelemetry(callback: (telemetry: PlaybackTelemetry) => void): () => void {
    this.telemetryListeners.add(callback);
    return () => this.telemetryListeners.delete(callback);
  }

  onError(callback: (error: PlayerErrorEnvelope) => void): () => void {
    this.errorListeners.add(callback);
    return () => this.errorListeners.delete(callback);
  }

  private emitError(err: PlayerErrorEnvelope) {
    this.errorListeners.forEach((cb) => cb(err));
  }

  async destroy(): Promise<void> {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.hls?.destroy();
    await this.audioCtx?.close();
    this.telemetryListeners.clear();
    this.errorListeners.clear();
  }
}
src/store/playerStore.ts (Zustand Store with SQLite Hydration, Auto-Resume & Self-Healing)TypeScriptimport { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import {
  IPlayerEngine,
  TauriMpvEngine,
  WebMediaEngine,
  EngineType,
  PlaybackTelemetry,
  PlayerErrorEnvelope,
  TrackInfo,
  ChapterInfo,
  VideoShaderConfig,
  parsePlayerError,
} from '../core/PlayerEngine';

export interface MediaHistoryItem {
  mediaId: string;
  uri: string;
  title: string;
  durationMs: number;
  lastPositionMs: number;
  progressPercent: number;
  isCompleted: boolean;
  playCount: number;
  thumbnailUri?: string;
  lastPlayedAt: number;
}

export interface MediaBookmark {
  id: number;
  mediaId: string;
  timestampMs: number;
  label: string;
  thumbnailUri?: string;
  createdAt: number;
}

interface MediaPreferences {
  mediaId: string;
  audioTrackId: string | null;
  subtitleTrackId: string | null;
  audioDelayMs: number;
  subtitleDelayMs: number;
  playbackRate: number;
  aspectRatio: string;
  shaderPreset: string;
  eqGainsJson: string;
  nightModeEnabled: boolean;
}

interface MediaSessionBundle {
  mediaId: string;
  history: MediaHistoryItem | null;
  preferences: MediaPreferences;
  bookmarks: MediaBookmark[];
}

interface PlayerStoreState {
  // Engine & Media Identity
  engine: IPlayerEngine | null;
  activeEngineType: EngineType;
  currentMediaId: string | null;
  currentUri: string | null;
  currentTitle: string;

  // Real-Time Playback Telemetry
  positionMs: number;
  durationMs: number;
  bufferedMs: number;
  isPaused: boolean;
  isBuffering: boolean;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  audioTracks: TrackInfo[];
  subtitleTracks: TrackInfo[];
  chapters: ChapterInfo[];

  // Audio DSP & Shaders
  eqGainsDb: number[];
  nightModeEnabled: boolean;
  shaderConfig: VideoShaderConfig;

  // SQLite Hydrated State
  recentMedia: MediaHistoryItem[];
  bookmarks: MediaBookmark[];
  resumeBannerPositionMs: number | null;

  // Error & Recovery State
  lastError: PlayerErrorEnvelope | null;
  retryCount: number;

  // Actions
  bootEngine: (preferred?: EngineType, videoEl?: HTMLVideoElement) => Promise<void>;
  openMedia: (uri: string, title?: string, autoResume?: boolean) => Promise<void>;
  togglePlay: () => Promise<void>;
  seek: (timestampMs: number, exact?: boolean) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  setPlaybackRate: (rate: number) => Promise<void>;
  setEqualizer: (gainsDb: number[], nightMode: boolean) => Promise<void>;
  addBookmark: (label: string) => Promise<void>;
  refreshRecentMedia: () => Promise<void>;
  dismissError: () => void;
}

const isTauriRuntime = () => typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

let lastSqliteSyncMs = 0;

export const usePlayerStore = create<PlayerStoreState>((set, get) => ({
  engine: null,
  activeEngineType: isTauriRuntime() ? 'tauri-mpv' : 'web-media',
  currentMediaId: null,
  currentUri: null,
  currentTitle: '',

  positionMs: 0,
  durationMs: 0,
  bufferedMs: 0,
  isPaused: true,
  isBuffering: false,
  volume: 100,
  isMuted: false,
  playbackRate: 1.0,
  audioTracks: [],
  subtitleTracks: [],
  chapters: [],

  eqGainsDb: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  nightModeEnabled: false,
  shaderConfig: {
    ambientGlowEnabled: true,
    sharpness: 0.2,
    contrast: 1.0,
    saturation: 1.0,
    upscaleMode: 'none',
  },

  recentMedia: [],
  bookmarks: [],
  resumeBannerPositionMs: null,

  lastError: null,
  retryCount: 0,

  bootEngine: async (preferred, videoEl) => {
    const current = get().engine;
    if (current) await current.destroy();

    const targetType: EngineType =
      preferred ?? (isTauriRuntime() ? 'tauri-mpv' : 'web-media');

    const engine: IPlayerEngine =
      targetType === 'tauri-mpv' ? new TauriMpvEngine() : new WebMediaEngine();

    engine.onTelemetry((telemetry: PlaybackTelemetry) => {
      set({
        positionMs: telemetry.positionMs,
        durationMs: telemetry.durationMs,
        bufferedMs: telemetry.bufferedMs,
        isPaused: telemetry.isPaused,
        isBuffering: telemetry.isBuffering,
        playbackRate: telemetry.playbackRate,
        volume: telemetry.volume,
        isMuted: telemetry.isMuted,
        audioTracks: telemetry.audioTracks,
        subtitleTracks: telemetry.subtitleTracks,
        chapters: telemetry.chapters,
      });

      // Throttled SQLite checkpoint every 2,000ms during active playback
      const now = Date.now();
      const mediaId = get().currentMediaId;
      if (isTauriRuntime() && mediaId && !telemetry.isPaused && now - lastSqliteSyncMs > 2000) {
        lastSqliteSyncMs = now;
        invoke('db_update_progress', {
          mediaId,
          positionMs: telemetry.positionMs,
          durationMs: telemetry.durationMs,
        }).catch(() => {});
      }
    });

    engine.onError(async (error: PlayerErrorEnvelope) => {
      set({ lastError: error });

      // Automated Self-Healing Recovery Execution
      if (error.recovery === 'fallback_to_web_engine' && get().activeEngineType !== 'web-media') {
        await get().bootEngine('web-media', videoEl);
        const uri = get().currentUri;
        if (uri) await get().openMedia(uri, get().currentTitle);
      } else if (error.recovery === 'retry_with_backoff' && get().retryCount < 3) {
        const nextRetry = get().retryCount + 1;
        set({ retryCount: nextRetry });
        const delayMs = Math.pow(2, nextRetry) * 500;
        setTimeout(() => {
          const uri = get().currentUri;
          if (uri) get().engine?.load(uri, get().positionMs);
        }, delayMs);
      } else if (error.recovery === 'reset_audio_filters') {
        await get().setEqualizer([0, 0, 0, 0, 0, 0, 0, 0, 0, 0], false);
      }
    });

    try {
      await engine.initialize(videoEl);
      set({ engine, activeEngineType: engine.engineType, lastError: null });
      if (isTauriRuntime()) {
        await get().refreshRecentMedia();
      }
    } catch (err) {
      const parsed = parsePlayerError(err);
      if (targetType === 'tauri-mpv') {
        // Automatic fallback to WebMediaEngine if libmpv fails to initialize
        await get().bootEngine('web-media', videoEl);
      } else {
        set({ lastError: parsed });
      }
    }
  },

  openMedia: async (uri, title, autoResume = true) => {
    const resolvedTitle = title ?? uri.split(/[\\/]/).pop() ?? 'Untitled Media';
    let startPos = 0;

    if (isTauriRuntime()) {
      try {
        const session = await invoke<MediaSessionBundle>('db_load_or_init_session', {
          uri,
          title: resolvedTitle,
        });

        const parsedEq: number[] = JSON.parse(session.preferences.eqGainsJson || '[0,0,0,0,0,0,0,0,0,0]');
        const savedPos = session.history?.lastPositionMs ?? 0;
        startPos = autoResume ? savedPos : 0;

        set({
          currentMediaId: session.mediaId,
          currentUri: uri,
          currentTitle: resolvedTitle,
          bookmarks: session.bookmarks,
          eqGainsDb: parsedEq,
          nightModeEnabled: session.preferences.nightModeEnabled,
          playbackRate: session.preferences.playbackRate,
          resumeBannerPositionMs: !autoResume && savedPos > 0 ? savedPos : null,
          retryCount: 0,
        });

        await get().engine?.load(uri, startPos);
        await get().engine?.setPlaybackRate(session.preferences.playbackRate);
        await get().engine?.setEqualizer(parsedEq, session.preferences.nightModeEnabled);

        if (session.preferences.audioTrackId) {
          await get().engine?.setAudioTrack(session.preferences.audioTrackId);
        }
        if (session.preferences.subtitleTrackId) {
          await get().engine?.setSubtitleTrack(session.preferences.subtitleTrackId);
        }

        await get().refreshRecentMedia();
        return;
      } catch (err) {
        set({ lastError: parsePlayerError(err) });
      }
    }

    // Browser-only fallback path
    set({ currentUri: uri, currentTitle: resolvedTitle, retryCount: 0 });
    await get().engine?.load(uri, startPos);
  },

  togglePlay: async () => {
    const { engine, isPaused, currentMediaId, positionMs, durationMs } = get();
    if (!engine) return;

    if (isPaused) {
      await engine.play();
      set({ isPaused: false });
    } else {
      await engine.pause();
      set({ isPaused: true });
      if (isTauriRuntime() && currentMediaId) {
        await invoke('db_update_progress', {
          mediaId: currentMediaId,
          positionMs,
          durationMs,
        }).catch(() => {});
      }
    }
  },

  seek: async (timestampMs, exact = false) => {
    set({ positionMs: timestampMs }); // Optimistic UI update
    await get().engine?.seek(timestampMs, exact);
  },

  setVolume: async (volume) => {
    set({ volume });
    await get().engine?.setVolume(volume);
  },

  setPlaybackRate: async (rate) => {
    set({ playbackRate: rate });
    await get().engine?.setPlaybackRate(rate);
  },

  setEqualizer: async (gainsDb, nightMode) => {
    set({ eqGainsDb: gainsDb, nightModeEnabled: nightMode });
    await get().engine?.setEqualizer(gainsDb, nightMode);

    const { currentMediaId, playbackRate } = get();
    if (isTauriRuntime() && currentMediaId) {
      await invoke('db_save_preferences', {
        prefs: {
          mediaId: currentMediaId,
          audioTrackId: null,
          subtitleTrackId: null,
          audioDelayMs: 0,
          subtitleDelayMs: 0,
          playbackRate,
          aspectRatio: 'auto',
          shaderPreset: 'ambient_default',
          eqGainsJson: JSON.stringify(gainsDb),
          nightModeEnabled: nightMode,
        },
      }).catch(() => {});
    }
  },

  addBookmark: async (label) => {
    const { currentMediaId, positionMs, bookmarks } = get();
    if (!isTauriRuntime() || !currentMediaId) return;

    const newBookmark = await invoke<MediaBookmark>('db_add_bookmark', {
      mediaId: currentMediaId,
      timestampMs: positionMs,
      label,
    });
    set({
      bookmarks: [...bookmarks, newBookmark].sort((a, b) => a.timestampMs - b.timestampMs),
    });
  },

  refreshRecentMedia: async () => {
    if (!isTauriRuntime()) return;
    const items = await invoke<MediaHistoryItem[]>('db_get_recent_media', { limit: 25 });
    set({ recentMedia: items });
  },

  dismissError: () => set({ lastError: null }),
}));
