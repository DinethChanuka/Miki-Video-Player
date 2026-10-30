# Application Splash Loader Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a cinematic startup splash video loader for Miki Player that autoplays `/splash.mp4`, provides a smooth cross-fade transition into the main player UI upon video completion, and includes keyboard/mouse skip capability.

**Architecture:** A dedicated `SplashScreen.tsx` component mounted over the root viewport in `App.tsx` during initial startup. It renders a fullscreen hardware-accelerated video element sourcing `/splash.mp4`, manages auto-play with muted-state tolerance, triggers a fade-out animation when the video ends, and smoothly reveals the dashboard.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, HTML5 Video.

**Spec:** User request: "implement the complete splash loader with smooth auto-transition ,this is application loading screen".

## Global Constraints

- Sourced from `/splash.mp4` (verified in `public/splash.mp4`).
- Must handle browser/WebKit autoplay restrictions gracefully.
- Smooth cross-fade transition duration: ~600-700ms.
- Fallback timeout (max 10s) in case video decoding fails or stalls.
- Zero TypeScript warnings or compiler errors (`npx tsc --noEmit` must pass).

## Review Focus

1. Autoplay policy block: video element must use `playsInline` and `muted` so startup is never blocked by browser policy.
2. Video stall or missing file: fallback timer ensures splash screen fades out even if video fails to load.
3. Skip responsiveness: pressing `Escape`, `Space`, `Enter`, or clicking "Skip" fades out immediately.
4. Clean DOM unmount: splash unmounts after transition completes to avoid consuming GPU resources.
5. Window drag compatibility: titlebar window dragging remains operable without collision.

---

### Task 1: Create `SplashScreen.tsx` Component

**Files:**
- Create: `src/components/splash/SplashScreen.tsx`

**Interfaces:**
- Produces: `interface SplashScreenProps { onComplete: () => void; }`
- Component: `export const SplashScreen: React.FC<SplashScreenProps>`

- [ ] **Step 1: Create `SplashScreen.tsx` with video autoplay, cross-fade animation, skip action, and fallback timer**
- [ ] **Step 2: Verify component compiles with TypeScript**
  Run: `npx tsc --noEmit`
  Expected: exit 0
- [ ] **Step 3: Commit**
  ```bash
  git add src/components/splash/SplashScreen.tsx
  git commit -m "feat: add cinematic SplashScreen video loader component"
  ```

---

### Task 2: Integrate `SplashScreen` into `App.tsx`

**Files:**
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `<SplashScreen onComplete={() => setShowSplash(false)} />`

- [ ] **Step 1: Add splash state `const [showSplash, setShowSplash] = useState(true)` to `App.tsx`**
- [ ] **Step 2: Render `<SplashScreen>` conditionally at the root layer**
- [ ] **Step 3: Verify TypeScript compilation and Vite build**
  Run: `npx tsc --noEmit && npm run build`
  Expected: exit 0
- [ ] **Step 4: Commit**
  ```bash
  git add src/App.tsx
  git commit -m "feat: integrate splash loader with smooth auto-transition into App"
  ```

---

### Task 3: Full End-to-End Verification & Desktop Test

- [ ] **Step 1: Verify dev server and bundle assets**
  Run: `curl -s -I http://localhost:1420/splash.mp4 | head -n 5`
  Expected: HTTP 200 OK
- [ ] **Step 2: Push changes to branch `feat/hybrid-player-hud`**
  ```bash
  git push origin feat/hybrid-player-hud
  ```
