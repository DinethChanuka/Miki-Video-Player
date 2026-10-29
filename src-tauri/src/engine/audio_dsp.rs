use crate::engine::types::AudioDspConfig;
use crate::error::{PlayerError, PlayerResult};

pub struct AudioDspManager {
    config: AudioDspConfig,
}

impl AudioDspManager {
    pub const EQ_FREQUENCIES: [u32; 10] = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
    pub const MIN_GAIN_DB: f32 = -20.0;
    pub const MAX_GAIN_DB: f32 = 20.0;

    pub fn new() -> Self {
        Self {
            config: AudioDspConfig::default(),
        }
    }

    pub fn config(&self) -> &AudioDspConfig {
        &self.config
    }

    /// Sets 10-band equalizer gains with boundary clamping and returns the complete mpv `af` filter string
    pub fn build_equalizer_filter(gains_db: &[f32]) -> PlayerResult<String> {
        if gains_db.len() != 10 {
            return Err(PlayerError::AudioDspInvalid(format!(
                "Expected exactly 10 EQ bands, received {}",
                gains_db.len()
            )));
        }

        let mut parts = Vec::with_capacity(10);
        for (idx, &freq) in Self::EQ_FREQUENCIES.iter().enumerate() {
            let gain = gains_db[idx].clamp(Self::MIN_GAIN_DB, Self::MAX_GAIN_DB);
            parts.push(format!("equalizer=f={freq}:width_type=o:w=1.41:g={gain:.2}"));
        }

        Ok(format!("lavfi=[{}]", parts.join(",")))
    }

    /// Generates dynamic range compressor filter (Night Mode) for dialog clarity and explosions softening
    pub fn build_night_mode_filter(enabled: bool) -> Option<String> {
        if enabled {
            Some("lavfi=[acompressor=threshold=-24dB:ratio=12:attack=20:release=250:knee=8:makeup=2dB]".into())
        } else {
            None
        }
    }

    /// Combines EQ and Night Mode into a composite mpv audio filter graph (`af`)
    pub fn build_composite_af_filter(&mut self, gains_db: &[f32], night_mode: bool) -> PlayerResult<String> {
        let eq_filter = Self::build_equalizer_filter(gains_db)?;
        
        let mut filters = vec![eq_filter];
        if let Some(drc) = Self::build_night_mode_filter(night_mode) {
            filters.push(drc);
        }

        for (i, &g) in gains_db.iter().enumerate() {
            self.config.eq_gains_db[i] = g.clamp(Self::MIN_GAIN_DB, Self::MAX_GAIN_DB);
        }
        self.config.night_mode_enabled = night_mode;

        Ok(filters.join(","))
    }

    pub fn set_audio_delay(&mut self, delay_ms: i64) -> f64 {
        self.config.audio_delay_ms = delay_ms;
        delay_ms as f64 / 1000.0 // mpv audio-delay property expects seconds
    }
}

impl Default for AudioDspManager {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_eq_filter_valid_generation() {
        let gains = [0.0, 1.5, -2.0, 3.0, 0.0, -1.0, 2.5, 4.0, -3.0, 0.0];
        let filter = AudioDspManager::build_equalizer_filter(&gains).unwrap();
        assert!(filter.starts_with("lavfi=["));
        assert!(filter.contains("equalizer=f=31:width_type=o:w=1.41:g=0.00"));
        assert!(filter.contains("equalizer=f=62:width_type=o:w=1.41:g=1.50"));
        assert!(filter.contains("equalizer=f=16000:width_type=o:w=1.41:g=0.00"));
    }

    #[test]
    fn test_eq_filter_gain_clamping() {
        let gains = [50.0, -100.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
        let filter = AudioDspManager::build_equalizer_filter(&gains).unwrap();
        assert!(filter.contains("g=20.00"));
        assert!(filter.contains("g=-20.00"));
    }

    #[test]
    fn test_eq_filter_invalid_band_count() {
        let gains = [0.0, 1.0];
        let res = AudioDspManager::build_equalizer_filter(&gains);
        assert!(res.is_err());
    }

    #[test]
    fn test_composite_filter_with_night_mode() {
        let mut dsp = AudioDspManager::new();
        let gains = [0.0; 10];
        let filter = dsp.build_composite_af_filter(&gains, true).unwrap();
        assert!(filter.contains("lavfi=[equalizer="));
        assert!(filter.contains("lavfi=[acompressor="));
    }
}
