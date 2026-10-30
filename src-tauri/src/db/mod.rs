use crate::error::PlayerResult;
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

#[derive(Clone)]
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_compute_media_id_deterministic() {
        let id1 = DatabaseManager::compute_media_id("/path/to/movie.mkv");
        let id2 = DatabaseManager::compute_media_id("/path/to/movie.mkv");
        let id3 = DatabaseManager::compute_media_id("/path/to/other.mkv");
        assert_eq!(id1, id2);
        assert_ne!(id1, id3);
        assert_eq!(id1.len(), 32);
    }
}
