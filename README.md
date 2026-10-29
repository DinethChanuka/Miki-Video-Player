# AetherPlayer 🌌🎬

[![Tauri v2](https://img.shields.io/badge/Tauri-v2-24C8DB?logo=tauri&logoColor=white)](https://v2.tauri.app/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Rust 2024](https://img.shields.io/badge/Rust-2024-black?logo=rust&logoColor=white)](https://www.rust-lang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

**AetherPlayer** is an ultra-modern, cross-platform multimedia player engineered with **Tauri v2 (Rust)** and **React 19 (TypeScript + Vite + Tailwind CSS)**. It targets macOS, Windows, Linux, iOS, Android, and standalone Web/PWA with a unified, zero-latency playback architecture.

---

## 🚀 Core Architectural Paradigm: Hybrid Dual-Engine Playback

Standard browser WebViews cannot natively decode complex containers (e.g., 10-bit MKV, HEVC, AV1, TrueHD audio, SSA/ASS subtitles) and IPC frame copying introduces latency bottlenecks at 4K/60fps+. AetherPlayer resolves this through a **Hybrid Dual-Engine Architecture**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   AetherPlayer Application Layer                       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
               ┌────────────────────┴────────────────────┐
               ▼                                         ▼
   [ Desktop / Mobile Native ]               [ Web & Cloud Streaming ]
     Tauri v2 + libmpv Engine                  WebMediaEngine (HLS.js)
  ┌─────────────────────────────┐           ┌─────────────────────────────┐
  │  Transparent Tauri WebView  │           │   HTML5 Video + WebGL2      │
  │     (React 19 Glass HUD)    │           │    (Ambient Glow Shader)    │
  ├─────────────────────────────┤           ├─────────────────────────────┤
  │  Native Window Child Surface│           │   WebAudio DSP 10-Band EQ   │
  │ (CAMetalLayer / HWND / X11) │           │    + Dynamic Compressor     │
  └─────────────────────────────┘           └─────────────────────────────┘
               ▲                                         ▲
               └────────────────────┬────────────────────┘
                                    │
                     [ SQLite WAL Persistence Engine ]
                   (Auto-Resume, History, Preferences)
```

### 1. Native Desktop & Mobile Engine (`TauriMpvEngine`)
- **Zero-Copy Video Surface:** The Tauri main window is configured with `transparent: true` and `decorations: false`. `libmpv` renders hardware-accelerated frames (`VideoToolbox` on macOS, `D3D11VA`/`NVDEC` on Windows, `VAAPI` on Linux, `MediaCodec` on Android) directly onto a native child surface (`raw-window-handle`) positioned *behind* the transparent WebView HUD.
- **High-Frequency Telemetry:** Playback state, positions, chapters, and track lists are throttled to 60Hz and streamed to the frontend via zero-copy typed `tauri::ipc::Channel` instances.

### 2. Web & Cloud Streaming Engine (`WebMediaEngine`)
- **Browser Fallback & Adaptive Streams:** For web deployments or cloud streams (HLS/DASH/MP4 over CDN/R2), the player seamlessly activates a `<video>` + WebGL2 fragment shader pipeline.
- **Ambient Lighting Mode:** Real-time low-resolution downsampled frame projection blurred with custom shaders to project dynamic ambient glow behind the player viewport.

---

## ✨ Features

- 🎧 **Parametric Audio DSP:** 10-band equalizer (31Hz – 16kHz) with gain clamping (-20dB to +20dB) and Night Mode Dynamic Range Compression (DRC).
- 🎞️ **Magnetic Timeline Scrubber:** Hover thumbnail preview card streaming binary keyframes over custom URI scheme `thumb://localhost/<media_id>/<timestamp>`.
- 💾 **SQLite WAL Persistence:** Auto-resumes media, remembers audio/subtitle tracks, per-file EQ presets, and timestamps with smart completion detection (>= 95% resets to start).
- 🛡️ **Self-Healing Error Hierarchy:** Structured error envelopes with automated recovery strategies (`fallback_to_web_engine`, `retry_with_backoff`, `reset_audio_filters`).
- 👆 **Ergonomic Gestures & Hotkeys:**
  - Hold for 2x speed boost.
  - Double-tap edges for ±10s ripple seek.
  - Hotkeys: `Space`/`K` (Play/Pause), `J`/`L` (±10s seek), `Arrow` keys (seek & volume), `,`/`.` (Frame step), `F` (Fullscreen), `[`/`]` (Speed).

---

## 📁 Project Directory Structure

```
.
├── src/                               # React 19 Frontend
│   ├── components/
│   │   ├── ambient/
│   │   │   └── AmbientCanvas.tsx      # Real-time ambient glow sampler
│   │   └── hud/
│   │       ├── ControlsOverlay.tsx    # Glassmorphic floating control bar
│   │       ├── TimelineScrubber.tsx   # Magnetic chapter bar & thumbnail preview
│   │       ├── EqualizerModal.tsx     # 10-band DSP parametric EQ & Night Mode
│   │       └── ErrorToast.tsx         # Self-healing recovery notification
│   ├── core/
│   │   └── PlayerEngine.ts            # IPlayerEngine contract, TauriMpvEngine & WebMediaEngine
│   ├── hooks/
│   │   └── usePlayerGestures.ts       # Touch gestures & desktop hotkeys
│   ├── store/
│   │   └── playerStore.ts             # Zustand store with SQLite hydration
│   ├── App.tsx                        # Master application layout
│   ├── main.tsx                       # React DOM entry point
│   └── index.css                      # Tailwind & Glassmorphism styles
│
├── src-tauri/                         # Rust Tauri v2 Backend
│   ├── src/
│   │   ├── engine/
│   │   │   ├── mpv_controller.rs      # Thread-safe libmpv controller & 60Hz Channel
│   │   │   ├── mpv_ffi.rs             # Dynamic runtime FFI loader for libmpv
│   │   │   ├── audio_dsp.rs           # 10-band EQ & DRC audio filter builder
│   │   │   ├── thumbnail_extractor.rs # Fast keyframe extractor & LRU buffer cache
│   │   │   └── types.rs               # Playback state & telemetry structures
│   │   ├── platform/
│   │   │   └── window_compositor.rs   # raw-window-handle (macOS, Windows, Linux)
│   │   ├── db/
│   │   │   └── mod.rs                 # SQLite WAL persistence manager & migrations
│   │   ├── error.rs                   # Structured error envelopes & recovery hints
│   │   ├── commands.rs                # Typed Tauri IPC command handlers
│   │   ├── lib.rs                     # Tauri builder wiring & thumb:// protocol
│   │   └── main.rs                    # Application entry point
│   ├── Cargo.toml                     # Rust dependencies (rusqlite, libloading, tauri v2)
│   └── tauri.conf.json                # Transparent windowing & protocol permissions
│
├── package.json                       # Frontend dependencies & scripts
├── vite.config.ts                     # Vite bundler configuration
├── tailwind.config.ts                 # Glassmorphic theme styling
└── tsconfig.json                      # Strict TypeScript compiler options
```

---

## 🛠️ Getting Started

### Prerequisites
1. **Node.js**: v18+ (Node v20+ recommended).
2. **Rust**: v1.78+ (via `rustup`).
3. *(Optional for Native Mode)*: `libmpv` (e.g. `brew install mpv` on macOS, or Linux package manager). *If libmpv is absent, AetherPlayer automatically self-heals by falling back to the WebMediaEngine.*

### Setup & Run

1. **Install Frontend Dependencies:**
   ```bash
   npm install
   ```

2. **Run in Web Browser Mode:**
   ```bash
   npm run dev
   ```

3. **Run in Tauri v2 Desktop Mode:**
   ```bash
   npm run tauri dev
   ```

4. **Build Production Application:**
   ```bash
   npm run tauri build
   ```

---

## 📜 License
MIT License. Built with ❤️ for modern multimedia experiences.
