pub mod commands;
pub mod db;
pub mod engine;
pub mod error;
pub mod platform;

use db::DatabaseManager;
use engine::audio_dsp::AudioDspManager;
use engine::mpv_controller::MpvController;
use engine::thumbnail_extractor::ThumbnailExtractor;
use parking_lot::Mutex;
use std::sync::Arc;
use tauri::Manager;

pub fn run() {
    let thumbnail_extractor = Arc::new(ThumbnailExtractor::new());
    let extractor_for_protocol = thumbnail_extractor.clone();
    let extractor_for_setup = thumbnail_extractor.clone();

    tauri::Builder::default()
        .register_uri_scheme_protocol("thumb", move |_app, request| {
            let path = request.uri().path().trim_start_matches('/');
            let mut parts = path.split('/');
            let media_id = parts.next().unwrap_or("unknown");
            let timestamp_ms: i64 = parts.next().and_then(|s| s.parse().ok()).unwrap_or(0);

            let jpeg_bytes = match extractor_for_protocol.get_or_extract_thumbnail("", media_id, timestamp_ms) {
                Ok(bytes) => bytes,
                Err(_) => vec![],
            };

            tauri::http::Response::builder()
                .header("Content-Type", "image/jpeg")
                .header("Access-Control-Allow-Origin", "*")
                .body(jpeg_bytes)
                .unwrap_or_else(|_| tauri::http::Response::builder().body(vec![]).unwrap())
        })
        .setup(move |app| {
            // Resolve local app data directory for SQLite database storage
            let app_data_dir = app
                .path()
                .app_data_dir()
                .unwrap_or_else(|_| std::path::PathBuf::from("./data"));
            std::fs::create_dir_all(&app_data_dir).ok();

            let db_path = app_data_dir.join("aether_player.sqlite3");
            let db_manager = DatabaseManager::new(&db_path).expect("Failed to initialize SQLite database");

            let mpv_controller = Arc::new(Mutex::new(MpvController::new()));
            let audio_dsp = Arc::new(Mutex::new(AudioDspManager::new()));

            // Register global thread-safe state in Tauri DI container
            app.manage(db_manager);
            app.manage(mpv_controller);
            app.manage(audio_dsp);
            app.manage(extractor_for_setup.clone());

            log::info!("AetherPlayer backend successfully initialized.");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::init_native_player,
            commands::subscribe_telemetry,
            commands::load_media_file,
            commands::player_play,
            commands::player_pause,
            commands::player_seek,
            commands::player_set_volume,
            commands::player_set_muted,
            commands::player_set_rate,
            commands::player_set_audio_track,
            commands::player_set_subtitle_track,
            commands::player_set_eq,
            commands::player_apply_shader,
            commands::destroy_native_player,
            commands::db_load_or_init_session,
            commands::db_update_progress,
            commands::db_save_preferences,
            commands::db_get_recent_media,
            commands::db_add_bookmark,
            commands::db_remove_recent
        ])
        .run(tauri::generate_context!())
        .expect("error while running AetherPlayer Tauri application");
}
