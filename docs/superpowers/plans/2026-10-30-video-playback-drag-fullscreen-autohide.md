# Video Playback, Window Drag, Fullscreen & 5-Second Inactivity Auto-Hide Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix local video playback via high-performance Vite HTTP streaming middleware, enable native window dragging on macOS Cocoa WKWebView, fix fullscreen toggle, make bookmark button work with persistence, and implement 5-second mouse inactivity auto-hiding for all HUD controls and mouse cursor.

**Architecture:**
1. `vite.config.ts`: Add `local-media-streamer` middleware at `/@media-stream?path=...` supporting HTTP 206 Partial Content (Range requests) so WebKit/Chromium never blocks local file paths with `CODEC_UNSUPPORTED` / security errors.
2. `src/store/playerStore.ts` & `src/core/PlayerEngine.ts`: Transform absolute file paths into `/@media-stream?path=...` when loading media; fix `addBookmark` to persist to `localStorage` and display feedback toast.
3. `MikiPlayerApp.swift`: Support `window.performDrag(with: currentEvent)` on `"startDrag"`, add `"toggleFullscreen"`, and enable element fullscreen in WKWebView.
4. `src/App.tsx` & `src/components/hud/ControlsOverlay.tsx`:
   - Implement 5-second mouse inactivity timer on the root container.
   - Smoothly fade out top titlebar, bottom HUD, center play button, and hide mouse cursor (`cursor-none`) after 5s of inactivity.
   - Instantly restore all controls and cursor on mouse move/click/key.
   - Attach window drag handler to top titlebar.

**Tech Stack:** React 19, TypeScript, Vite, Swift (Cocoa, WebKit), Zustand, Tailwind CSS.

**Spec:** User request: "not playong videos and showing erro . and ability to drag and move. window,video player full screen button not working ,book mark button also not working . when mouse cursor inactive for 5 seconds hide the buttons and time line and other to show properly video fully. when mouse pointer active again ,come everythooing again"

## Global Constraints

- Separate git branch: `feat/video-playback-drag-fullscreen-autohide`.
- Auto-hide timeout must be exactly 5 seconds (5000ms).
- Mouse cursor must hide (`cursor-none`) when controls hide.
- Native window dragging must feel responsive at 120fps.
- Bookmarks must work in standalone mode with persistence in `localStorage`.
- TypeScript check (`npx tsc --noEmit`) and Vite build (`npm run build`) must pass without errors.

---

### Task 1: Vite Local Media Streaming Middleware (`vite.config.ts`)

**Files:**
- Modify: `vite.config.ts`

- [ ] **Step 1: Add `local-media-streamer` plugin with HTTP 206 Range support to `vite.config.ts`**
- [ ] **Step 2: Verify streaming endpoint with curl**
  Run: `curl -s -I "http://localhost:1420/@media-stream?path=public/splash.mp4"`
  Expected: HTTP 200 OK or 206 Partial Content

---

### Task 2: URL Translation & Bookmark Persistence in `playerStore.ts`

**Files:**
- Modify: `src/store/playerStore.ts`
- Modify: `src/core/PlayerEngine.ts`

- [ ] **Step 1: Add `resolveMediaUri` helper that maps absolute file paths to `/@media-stream?path=...`**
- [ ] **Step 2: Update `addBookmark` to work in standalone mode, save to `localStorage`, and display toast**
- [ ] **Step 3: Update `FileBrowserModal.tsx` bookmarks tab to allow jumping to bookmark timestamps**
- [ ] **Step 4: Verify with `npx tsc --noEmit`**

---

### Task 3: macOS Native Window Dragging & Fullscreen in `MikiPlayerApp.swift`

**Files:**
- Modify: `MikiPlayerApp.swift`
- Recompile: `./MikiPlayer`

- [ ] **Step 1: Add `case "startDrag"` with `window.performDrag(with: currentEvent)`**
- [ ] **Step 2: Add `case "toggleFullscreen"` with `window.toggleFullScreen(nil)`**
- [ ] **Step 3: Enable `fullScreenEnabled` on WKWebView configuration**
- [ ] **Step 4: Recompile with `swiftc -O -o MikiPlayer MikiPlayerApp.swift -framework Cocoa -framework WebKit`**

---

### Task 4: 5-Second Inactivity Auto-Hide & Unified Controls in `App.tsx` and `ControlsOverlay.tsx`

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/hud/ControlsOverlay.tsx`

- [ ] **Step 1: Add 5-second inactivity timer on root container in `App.tsx`**
- [ ] **Step 2: Connect top titlebar to `areControlsVisible` and `handleStartWindowDrag`**
- [ ] **Step 3: Update `ControlsOverlay.tsx` to hide/show synchronously with 5-second timer**
- [ ] **Step 4: Toggle `cursor-none` / `cursor-default` on mouse inactivity**
- [ ] **Step 5: Connect fullscreen button in `ControlsOverlay.tsx` to native & browser fullscreen**
- [ ] **Step 6: Verify full build (`npx tsc --noEmit && npm run build`)**

---

### Task 5: Verification & Push to New Branch

- [ ] **Step 1: Run comprehensive verification**
- [ ] **Step 2: Commit all changes to `feat/video-playback-drag-fullscreen-autohide`**
- [ ] **Step 3: Push to `origin feat/video-playback-drag-fullscreen-autohide`**
