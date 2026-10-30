# Miki Player 🌌🎬

[![Cross-Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Windows%20%7C%20Linux%20%7C%20iOS%20%7C%20Android-blueviolet?style=for-the-badge)](https://github.com)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2.0-24C8DB?style=for-the-badge&logo=tauri&logoColor=white)](https://v2.tauri.app/)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Swift Cocoa](https://img.shields.io/badge/macOS-Swift%20Cocoa%20WebKit-F05138?style=for-the-badge&logo=swift&logoColor=white)](https://apple.com)
[![VLC Boost](https://img.shields.io/badge/Audio-200%25%20VLC%20Overdrive-FFA500?style=for-the-badge)](https://videolan.org)

**Miki Player** is an ultra-modern, cross-platform multimedia player designed from the ground up for high-performance video playback, rich audio DSP, luxury UI customizability, and native OS integration. Engineered with a **Hybrid Dual-Engine Architecture**, it unifies native hardware GPU acceleration (macOS Cocoa + Tauri Rust + libmpv) with a high-fidelity Web Media Engine (React 19 + HLS.js + WebAudio DSP + WebGL Shaders).

---

## 🚀 Key Highlights & Architectural Features

```
┌────────────────────────────────────────────────────────────────────────┐
│                      Miki Player Application HUD                       │
│    (Frameless Undecorated Window • 5s Auto-Hide • 10 Luxury Themes)    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
               ┌────────────────────┴────────────────────┐
               ▼                                         ▼
   [ Native OS Hardware Pipeline ]            [ Web & Network Optimizer ]
     macOS Cocoa / Tauri v2 / libmpv             WebMediaEngine & HLS.js
  ┌─────────────────────────────┐           ┌─────────────────────────────┐
  │  Borderless Key Window      │           │   HTTP 206 Partial Stream   │
  │  Zero-Latency Direct Blit   │           │   YouTube Stream Optimizer  │
  ├─────────────────────────────┤           ├─────────────────────────────┤
  │  VLC 200% Audio Gain Node   │           │   10-Band Parametric DSP    │
  │  Anime4K & Shaders Pipeline │           │   Real-Time Ambient Glow    │
  └─────────────────────────────┘           └─────────────────────────────┘
               ▲                                         ▲
               └────────────────────┬────────────────────┘
                                    │
                 [ Unified Storage & Diagnostic Layer ]
              • LocalStorage & SQLite WAL State Engine
              • Java Smart Media Validator (AetherPlayerLauncher)
              • Enhanced Alert System for Moved / Deleted Files
```

### 1. 🎨 10 Luxury Switchable Player Themes
Miki Player features 10 handcrafted visual themes with synchronized gradients, timeline tracks, glowing thumb knobs, and glassmorphic panels stored in persistent state:
- **Cyberpunk Neon:** High-contrast neon cyan and hot magenta laser glow.
- **Midnight OLED:** Ultra-deep obsidian black with pure silver frost accents.
- **Tokyo Violet:** Cinematic deep indigo and fluorescent purple glow.
- **Matrix Emerald:** Deep dark forest with vibrant electric emerald green.
- **Sunset Horizon:** Warm golden amber, coral, and glowing rose red.
- **Glacier Frost:** Arctic blue, crystalline ice cyan, and pure silver.
- **Royal Obsidian:** Prestige obsidian black and champagne gold luxury.
- **Crimson Velvet:** Bold ruby crimson and deep dark neon burgundy.
- **Retro Synthwave:** 80s arcade neon pink, laser cyan, and deep purple.
- **Nordic Frost:** Minimalist Scandinavian matte steel and fog glass.

### 2. 🔊 200% VLC Audio Overdrive & 10-Band Parametric DSP
- **VLC-Style 200% Overdrive Slider:** Boosts quiet dialogues and weak audio tracks up to +6dB beyond 100% using WebAudio `GainNode` and dynamic headroom limiting.
- **10-Band Parametric Equalizer:** Full frequency spectrum control (31Hz, 62Hz, 125Hz, 250Hz, 500Hz, 1kHz, 2kHz, 4kHz, 8kHz, 16kHz) with gain clamping (-20dB to +20dB).
- **Night Mode (Dynamic Range Compression):** Tames abrupt explosions while boosting quiet whispering for late-night viewing.

### 3. ✨ Anime4K & Shaders Video Quality Enhancers
1-click instant visual enhancement presets powered by GPU-accelerated CSS and WebGL shader matrix:
- **Anime4K Sharp:** Crisp edge enhancement and line art contrast clarity.
- **Cinematic HDR:** Expanded dynamic range, deep rich blacks, and balanced highlights.
- **Vivid Vibrance:** Color punch and saturation lift for nature and music videos.
- **Night Vision Boost:** Shadow detail enhancement for underexposed video files.
- **Studio Crisp Hi-Fi:** High-fidelity master color calibration and neutral tone mapping.
- **YouTube-Style Ambient Glow:** Projects real-time blurred peripheral colors behind the screen.

### 4. 🎬 Jump Back In (Recently Viewed Cards)
When opening Miki Player, if media was viewed recently, the home screen renders an interactive card grid:
- Exact **Timeline Percentage badge** (e.g., `45% watched`).
- Interactive progress bar styled with the active theme gradient.
- Last viewed position vs total duration (`04:12 / 18:30`).
- **1-Click Resume Playback** button.
- Clean **Remove from Recents** button to prune deleted or finished files.

### 5. 📺 YouTube & URL Stream Cards
- Supports pasting any standard YouTube URL (`youtube.com/watch?v=...`, `youtu.be/...`, shorts, embeds) and direct HLS/DASH/MP4 network links.
- Automatically saves streamed videos into rich preview cards with video thumbnails (`img.youtube.com/vi/{id}/mqdefault.jpg`), title, and 1-click replay.

### 6. 🛡️ Java Smart Error Handling & Diagnostics
- Integrated with `AetherPlayerLauncher.java`:
  ```bash
  java AetherPlayerLauncher --validate "/path/to/video.mp4"
  ```
- If a user moves or deletes a previously played video file, Miki Player displays an **Enhanced Smart Alert Modal** offering a 1-click `[Remove from Recents]` button instead of a cryptic crash toast.

---

## 🌐 Universal Cross-Platform Architecture & Path Handling

Miki Player is architected for uniform operation across desktop, mobile, and web targets.

### Universal Path Resolver
Different operating systems represent file systems differently:
- **Windows:** Drive letters and backslashes (e.g. `C:\Users\User\Videos\movie.mp4` or `file:///C:/Users/...`). Miki Player normalizes Windows paths, handles URI escaping, and bridges local files via HTTP 206 byte-range streaming.
- **macOS & Linux:** Standard POSIX root paths (e.g. `/Users/username/Movies/video.mkv` or `/home/user/Videos/...`).
- **Android & iOS:** Sandboxed document directories and Android Content Provider URIs (`content://...`).
- **Web & Cloud:** Standard HTTP/HTTPS CORS streams, HLS playlists (`.m3u8`), and DASH manifests (`.mpd`).

---

## 🖥️ Operating System Deployment Guide

### 🍎 macOS Standalone Application Bundle (`Miki Player.app`)
Miki Player includes a standalone, double-clickable macOS Application Bundle:
- **Location:** `./Miki Player.app`
- **To run directly:** Double-click `Miki Player.app` in Finder, or execute:
  ```bash
  open "Miki Player.app"
  ```
- **To rebuild the bundle anytime:**
  ```bash
  npm run package:mac
  ```
  This compiles `MikiPlayerApp.swift` with Cocoa + WebKit, renders the multi-resolution `AppIcon.icns`, and embeds production web assets.

### 🪟 Windows Standalone Executable (`.exe`)
To build on Windows (Windows 10 / 11):
1. **Prerequisites:** Install [Node.js](https://nodejs.org) and [Rust](https://rustup.rs).
2. **One-Click Build Script:**
   ```bat
   scripts\build-windows-exe.bat
   ```
   Or run:
   ```bash
   npm run package:win
   ```
3. **Output Executable:** Located in `src-tauri/target/release/` and `src-tauri/target/release/bundle/nsis/Miki_Player_x64-setup.exe`.

### 🐧 Linux (AppImage & Debian Package)
1. **Prerequisites:**
   ```bash
   sudo apt-get install -y libwebkit2gtk-4.1-dev build-essential curl wget libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
   ```
2. **Build Binary:**
   ```bash
   npm run build
   npx tauri build
   ```
3. **Output:** Located in `src-tauri/target/release/bundle/appimage/` and `src-tauri/target/release/bundle/deb/`.

### 🤖 Android & 📱 iOS
Miki Player supports mobile compilation through Tauri v2 Mobile CLI:
```bash
npx tauri android init && npx tauri android build
npx tauri ios init && npx tauri ios build
```

---

## ⚙️ CI/CD Workflow (`.github/workflows/build-crossplatform.yml`)

The repository includes an enterprise multi-OS GitHub Actions workflow that automatically builds and bundles:
- **Windows x64:** Compiles standalone `.exe` and NSIS installer.
- **macOS Universal:** Compiles Cocoa `.app` bundle, signs, and zips.
- **Linux x86_64:** Compiles `.AppImage` and `.deb` distribution packages.

---

## ⌨️ Keyboard Shortcuts & Touch Gestures

| Key / Gesture | Action |
|:---:|:---|
| <kbd>Space</kbd> | Toggle Play / Pause |
| <kbd>F</kbd> | Toggle Fullscreen (Native Window & HTML5) |
| <kbd>←</kbd> / <kbd>→</kbd> | Seek Backward / Forward 10 seconds |
| <kbd>M</kbd> | Toggle Mute / Restore Volume |
| <kbd>B</kbd> | Add Timestamp Bookmark |
| <kbd>E</kbd> | Open 10-Band Parametric Audio Equalizer |
| <kbd>S</kbd> | Open Video Settings, Shaders & 10 Themes |
| <kbd>L</kbd> | Toggle Video Repeat / Looping |
| **Double-Click Left / Right** | Quick Seek ±10s ripple |
| **Mouse Inactivity (5s)** | Auto-hide HUD & titlebar for immersive video |
| **Window Background Drag** | Seamless borderless window repositioning |

---

## 📁 Repository Structure

```
.
├── Miki Player.app/                   # Standalone macOS Application Bundle
│   └── Contents/
│       ├── Info.plist                 # Bundle identity & permissions
│       ├── MacOS/Miki Player          # Executable launcher
│       └── Resources/AppIcon.icns     # High-resolution native icon
├── src/                               # React 19 Frontend
│   ├── components/
│   │   ├── ambient/AmbientCanvas.tsx  # Real-time ambient glow sampler
│   │   ├── hud/ControlsOverlay.tsx    # Luxury HUD & Play/Pause controls
│   │   ├── hud/TimelineScrubber.tsx   # Magnetic scrubber with theme gradients
│   │   ├── hud/EqualizerModal.tsx     # 10-Band audio DSP equalizer
│   │   ├── hud/VideoSettingsModal.tsx # 10 Themes & Anime4K video shaders
│   │   ├── hud/FileBrowserModal.tsx   # Media explorer & YouTube stream cards
│   │   └── hud/ErrorToast.tsx         # Smart error & moved file alert system
│   ├── core/PlayerEngine.ts           # Hybrid Dual-Engine playback core
│   ├── types/theme.ts                 # 10 handcrafted luxury player themes
│   ├── store/playerStore.ts           # Zustand store with persistent state
│   └── App.tsx                        # Master UI, Recently Viewed cards & hotkeys
├── src-tauri/                         # Rust Tauri v2 Backend & libmpv engine
├── .github/workflows/                 # Automated cross-platform CI/CD
│   └── build-crossplatform.yml        # Windows .exe, macOS .app, Linux AppImage
├── scripts/
│   ├── package-mac.sh                 # macOS .app bundle packaging script
│   └── build-windows-exe.bat          # Windows .exe packaging script
├── AetherPlayerLauncher.java          # Java launcher & media validation diagnostic
├── MikiPlayerApp.swift                # Native Swift Cocoa borderless window
├── package.json                       # Project configuration & scripts
└── README.md                          # Comprehensive documentation
```

---

## 📜 License
Released under the MIT License. Built with ❤️ for next-generation multimedia playback.
