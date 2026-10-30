# Miki Player Startup Audio, Mac Controls & Persistence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ensure startup video plays with sound, remove the skip button, fix text typing (YouTube URL / search) and file browsing on macOS Cocoa window, and implement persistent recent media history in localStorage.

**Architecture:**
1. Update `SplashScreen.tsx`: enable unmuted audio at volume 1.0, remove the skip button, and let the video transition naturally on completion.
2. Update `MikiPlayerApp.swift`:
   - Subclass `NSWindow` as `BorderlessKeyWindow` with `canBecomeKey = true` and `canBecomeMain = true` so borderless window receives keyboard input (fixes typing in inputs/YouTube URL).
   - Implement `WKUIDelegate`'s `runOpenPanelWith parameters` using native `NSOpenPanel` (fixes file browsing in macOS WebKit).
3. Update `playerStore.ts` & `App.tsx`:
   - Implement `localStorage` synchronization for `recentMedia` and resume positions (`miki_recent_media`, `miki_resume_map`).
   - Wire native input triggers with `inputRef.current?.click()`.
4. Recompile `MikiPlayer` and verify with tests.

**Tech Stack:** Swift (Cocoa, WebKit), TypeScript, React 19, Zustand, Tailwind CSS.

## Global Constraints

- Separate git branch: `feat/startup-audio-controls-persistence`.
- Startup video must play with sound (`muted: false`, volume: 1.0).
- No skip button in `SplashScreen.tsx`.
- Must allow typing in text inputs (YouTube, search) on macOS.
- Must open native file dialog on macOS.
- Recent media must persist across restarts.
- Zero TypeScript compiler errors (`npx tsc --noEmit`).

---

### Task 1: Startup Video Audio & Remove Skip Button

**Files:**
- Modify: `src/components/splash/SplashScreen.tsx`

- [ ] **Step 1: Set `<video>` to play with sound (`muted={false}`, volume 1.0) and remove skip button**
- [ ] **Step 2: Keep keyboard shortcuts (`Space`/`Esc`) and natural `onEnded` transition**
- [ ] **Step 3: Verify TypeScript compilation**
  Run: `npx tsc --noEmit`
  Expected: exit 0

---

### Task 2: Fix macOS Keyboard Typing & Native File Picker in Cocoa

**Files:**
- Modify: `MikiPlayerApp.swift`
- Recompile: `./MikiPlayer`

- [ ] **Step 1: Add `BorderlessKeyWindow: NSWindow` with `canBecomeKey: true` and `canBecomeMain: true`**
- [ ] **Step 2: Implement `WKUIDelegate.webView(_:runOpenPanelWith:initiatedByFrame:completionHandler:)`**
- [ ] **Step 3: Compile native app with `swiftc`**
  Run: `swiftc -O -o MikiPlayer MikiPlayerApp.swift -framework Cocoa -framework WebKit`
  Expected: exit 0

---

### Task 3: Implement Persistent Recent Media History & Local Storage

**Files:**
- Modify: `src/store/playerStore.ts`
- Modify: `src/components/hud/FileBrowserModal.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: In `playerStore.ts`, initialize `recentMedia` from `localStorage`**
- [ ] **Step 2: In `openMedia` and `togglePlay`, save recent media items and timestamps to `localStorage`**
- [ ] **Step 3: Ensure clicking "Browse Local Files" triggers `inputRef.current?.click()` reliably**
- [ ] **Step 4: Verify with `npx tsc --noEmit` and `npm run build`**

---

### Task 4: Verification & Git Commit on New Branch

- [ ] **Step 1: Run full verification suite**
- [ ] **Step 2: Commit changes to `feat/startup-audio-controls-persistence`**
- [ ] **Step 3: Push to `origin feat/startup-audio-controls-persistence`**

