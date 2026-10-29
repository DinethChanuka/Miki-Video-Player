# AetherPlayer Architecture & Design Specification

**Date:** 2026-10-29  
**Status:** Approved  
**Author:** Principal Systems Architect & Lead Multimedia Engineer  

---

## 1. Executive Summary & Goals
AetherPlayer is a high-performance, cross-platform multimedia player engineered with **Tauri v2 (Rust)** and **React 19 (TypeScript + Vite + Tailwind CSS)**. It targets macOS, Windows, Linux, Android, iOS, and Web/PWA.

### Goals
- Native 4K/60fps+ playback of complex containers (MKV, MP4, WebM) and codecs (HEVC, AV1, VP9, 10-bit H.264, ProRes) with zero IPC video frame copying.
- Direct hardware decoding (`VideoToolbox` on Apple, `D3D11VA`/`NVDEC` on Windows, `VAAPI` on Linux, `MediaCodec` on Android) via `libmpv`.
- Seamless transparent window compositing: video renders directly onto a native OS surface behind a transparent Tauri WebView hosting the glassmorphic HUD.
- Dynamic Web engine fallback with WebGL2 fragment shaders (real-time ambient glow, sharpening, color grading).
- 10-band parametric audio equalizer, night mode dynamic range compression, and audio delay offset.
- Real-time thumbnail scrubbing previews via custom URI scheme `thumb://localhost/<timestamp>`.
- High-frequency 60Hz telemetry throttling over Tauri v2 typed Channels (`tauri::ipc::Channel`).

### Non-Goals
- Re-encoding video files or non-linear video editing.
- Heavy Electron-style IPC frame transfer across the JS bridge.

---

## 2. Approaches & Tradeoffs

### Approach A: Rust Frame-Copy via Shared Memory / Base64 IPC
- **Mechanism:** Decode frames in Rust with FFmpeg, copy raw YUV/RGB buffers to WebGL texture via Tauri IPC.
- **Tradeoff:** Severely bottlenecks at 4K60 (requires transferring >1 GB/s across process boundaries). High CPU/memory overhead. Rejected.

### Approach B: Pure Web Technologies (HTML5 `<video>` + WebCodecs WASM)
- **Mechanism:** Rely solely on browser media stack with WebAssembly demuxers.
- **Tradeoff:** Browser engines fail on 10-bit MKV, AC3/TrueHD, complex ASS/SSA subtitles, and local file access restrictions. Rejected as sole engine.

### Approach C (Selected): Hybrid Dual-Engine Architecture
- **Mechanism:**
  - **Native Engine:** `libmpv` renders directly into a native window/metal surface (`raw-window-handle`) placed under a transparent, undecorated Tauri v2 WebView (`transparent: true`, `decorations: false`). Telemetry passes via typed `tauri::ipc::Channel`.
  - **Web Engine:** For browser/PWA builds and cloud streams, fallback to `<video>` + WebGL2 shader pipeline.
- **Tradeoff:** Requires OS-specific window surface binding (`NSView`/`CAMetalLayer` on macOS, `HWND` on Windows, `X11`/`Wayland` on Linux), but guarantees zero-latency, zero-IPC-overhead 4K60 HDR playback.

---

## 3. Subsystem Architecture

### 3.1 Rust Backend (`src-tauri/`)
- **`src-tauri/src/platform/window_compositor.rs`**: Hooks into Tauri's window creation via `raw-window-handle` to position and resize the native player surface underneath the webview.
- **`src-tauri/src/engine/mpv_controller.rs`**: Safe abstraction over `libmpv` instance, setting `hwdec=auto-safe`, `vo=gpu-next`, and configuring property change observers. Emits high-frequency playback state (time-pos, duration, pause, cache) throttled to 60Hz via Tauri Channel.
- **`src-tauri/src/engine/audio_dsp.rs`**: Dispatches audio filter commands (`lavfi=[equalizer=...]`, `alimiter`, `rubberband`) to `libmpv`.
- **`src-tauri/src/engine/thumbnail_extractor.rs`**: Background worker utilizing lightweight keyframe extraction and serving JPEG/WebP buffers through Tauri's `register_uri_scheme_protocol("thumb", ...)`.

### 3.2 Frontend Architecture (`src/`)
- **Unified Engine Contract (`src/core/PlayerEngine.ts`)**: `IPlayerEngine` standardizing playback controls, track selection, and shader filter pipelines.
- **Concrete Implementations**:
  - `TauriMpvEngine`: Communicates with Rust commands and listens to `tauri::ipc::Channel` state streams.
  - `WebMediaEngine`: Drives HTML5 `<video>` element with WebGL2 shader compositor.
- **State Store (`src/store/playerStore.ts`)**: Zustand store keeping UI optimistic and synchronized with telemetry events.
- **Glassmorphic HUD & Ambient Mode**: Framer motion controls, SVG magnetic chapter bar, WebGL2 ambient lighting sampler canvas.

