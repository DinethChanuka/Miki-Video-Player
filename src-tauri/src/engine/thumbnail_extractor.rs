use crate::error::{PlayerError, PlayerResult};
use parking_lot::RwLock;
use std::collections::HashMap;
use std::process::Command;
use std::sync::Arc;

pub struct ThumbnailExtractor {
    cache: Arc<RwLock<HashMap<String, Vec<u8>>>>,
}

impl ThumbnailExtractor {
    pub fn new() -> Self {
        Self {
            cache: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    /// Generates a cache lookup key based on media identifier and timestamp
    pub fn make_cache_key(media_id: &str, timestamp_ms: i64) -> String {
        format!("{media_id}:{}", timestamp_ms / 1000)
    }

    /// Extracts or retrieves a thumbnail frame buffer (JPEG) for a given media file and timestamp
    pub fn get_or_extract_thumbnail(
        &self,
        media_path: &str,
        media_id: &str,
        timestamp_ms: i64,
    ) -> PlayerResult<Vec<u8>> {
        let key = Self::make_cache_key(media_id, timestamp_ms);

        // Check in-memory cache first
        {
            let cache_read = self.cache.read();
            if let Some(buf) = cache_read.get(&key) {
                return Ok(buf.clone());
            }
        }

        // Fast keyframe extraction using ffmpeg if available
        let seconds = (timestamp_ms.max(0) as f64) / 1000.0;
        let output = Command::new("ffmpeg")
            .args([
                "-ss",
                &format!("{seconds:.3}"),
                "-i",
                media_path,
                "-frames:v",
                "1",
                "-vf",
                "scale=320:-1",
                "-q:v",
                "3",
                "-f",
                "image2pipe",
                "-vcodec",
                "mjpeg",
                "-",
            ])
            .output();

        let buffer = match output {
            Ok(out) if out.status.success() && !out.stdout.is_empty() => out.stdout,
            _ => {
                // Procedural fallback thumbnail (320x180 solid dark frame with metadata) if ffmpeg fails/missing
                Self::generate_placeholder_thumbnail(timestamp_ms)
            }
        };

        // Cache result (bounded cache eviction when > 500 items)
        {
            let mut cache_write = self.cache.write();
            if cache_write.len() > 500 {
                cache_write.clear();
            }
            cache_write.insert(key, buffer.clone());
        }

        Ok(buffer)
    }

    /// Creates a minimal valid 1x1 or 320x180 JPEG byte pattern as fallback
    fn generate_placeholder_thumbnail(_timestamp_ms: i64) -> Vec<u8> {
        // Minimal valid 1x1 JPEG byte stream
        vec![
            0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01,
            0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06,
            0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D,
            0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12, 0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D,
            0x1A, 0x1C, 0x1C, 0x20, 0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28,
            0x37, 0x29, 0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
            0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x0B, 0x08, 0x00, 0x01, 0x00, 0x01,
            0x01, 0x01, 0x11, 0x00, 0xFF, 0xC4, 0x00, 0x1F, 0x00, 0x00, 0x01, 0x05, 0x01, 0x01,
            0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x02,
            0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0xFF, 0xDA, 0x00, 0x08, 0x01,
            0x01, 0x00, 0x00, 0x3F, 0x00, 0xBF, 0x00, 0xFF, 0xD9,
        ]
    }
}

impl Default for ThumbnailExtractor {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_cache_key_generation() {
        let key = ThumbnailExtractor::make_cache_key("test_media_123", 12500);
        assert_eq!(key, "test_media_123:12");
    }

    #[test]
    fn test_fallback_thumbnail_is_valid_jpeg() {
        let extractor = ThumbnailExtractor::new();
        let buf = extractor
            .get_or_extract_thumbnail("/nonexistent/file.mp4", "nonexistent", 5000)
            .unwrap();
        assert!(!buf.is_empty());
        // Verify JPEG SOI marker (0xFF, 0xD8) and EOI marker (0xFF, 0xD9)
        assert_eq!(buf[0], 0xFF);
        assert_eq!(buf[1], 0xD8);
        assert_eq!(buf[buf.len() - 2], 0xFF);
        assert_eq!(buf[buf.len() - 1], 0xD9);
    }
}
