# Global Channel Link Stream Fix & Games Loading System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a global self-healing channel stream engine with backup URL failover, expand to a verified 60+ channel directory mirroring VLC Player's IPTV catalog, fix all game iframe sandbox and loading failures with expanded zero-latency inbuilt engines and graceful error fallbacks, and add Channels tab to the Library modal.

**Architecture:** 
1. **Global Channel Stream Healing:** Enhance `LiveChannel` interface with `backupUrls: string[]` and health verification. In `PlayerEngine.ts`, enhance HLS.js error recovery for `levelLoadError`, `manifestLoadError`, and `networkError` to automatically downscale level and heal via backup mirror chains before surfacing errors. In `playerStore.ts`, hook automatic channel failover on stream timeout.
2. **Comprehensive VLC IPTV Channel Catalog:** Expand `src/utils/channelCatalog.ts` to 60+ verified 100% working live streams across News, Movies, Music, Sports, Tech/Science, Entertainment, and Kids with high-availability CDN endpoints and resilient fallback chains.
3. **Games Loading & Zero-Latency Offline Engines:** Add `allow-same-origin` to game iframe sandboxes so `localStorage` does not throw security exceptions. Add 7 new offline zero-latency canvas game engines (Pac-Man, Space Invaders, Solitaire, Sudoku, Simon Says, Space Defender, Whack-a-Mole) to `inbuiltGames.ts`. Add interactive iframe loading & error fallback cards in `FullWindowGamesModal.tsx` and `GamesSection.tsx`.
4. **Library Navigation & Preview UI:** Add a dedicated "Channels" tab to `FileBrowserModal.tsx` alongside Cinema, Social, Music, and Games. Ensure all game preview cards render with SVG previews, category pills, and full-window launch triggers.

**Tech Stack:** TypeScript, React 18, Hls.js, HTML5 Canvas, TailwindCSS, Vitest/Node test runner.

---

## Global Constraints
- All channel URLs in `channelCatalog.ts` must return HTTP 200 and valid `#EXTM3U` or audio streams.
- Iframe sandboxes must allow safe execution without breaking local storage or security policies.
- All existing 204+ tests must continue to pass without regressions.
- Preserve macOS native app build integrity (`./scripts/package-mac.sh`).

---

## Review Focus
1. HLS stream failures (`levelLoadError` on Akamai or dead variants): Engine must gracefully switch to a lower bitrate level or failover to `backupUrls` instead of hanging or displaying `STREAM_TIMEOUT`.
2. Iframe sandbox restrictions: External games requiring `localStorage` must not crash with `DOMException: The operation is insecure`.
3. Offline/Blocked games: If an external site blocks iframe embedding, the modal must display an informative fallback card with 1-click "Play Inbuilt Alternative" or "Launch in Web Browser" rather than a blank black screen.
4. Channel catalog diversity: All VLC categories (News, Movies, Music, Sports, Science, Entertainment, Kids) must contain actively streaming channels.
5. Library Modal Channels integration: Users must be able to switch to Channels right inside the Library modal without leaving the HUD.

---

### Task 1: Comprehensive VLC Channel Catalog with Backup Mirror Chains

**Files:**
- Modify: `src/utils/channelCatalog.ts`
- Test: `test/channelCatalogVerification.test.mjs`

**Interfaces:**
- `LiveChannel`: add `backupUrls?: string[]`
- `CURATED_CHANNELS`: expand from 20 to 60+ verified channels across News, Movies, Music, Sports, Tech/Science, Entertainment, Kids
- Export `getChannelByUri(uri: string): LiveChannel | undefined`
- Export `getChannelBackupUrl(uri: string, currentFailedUrl?: string): string | null`

- [ ] **Step 1: Write the test verifying channel catalog interfaces and backup URLs**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Update `src/utils/channelCatalog.ts` with 60+ verified channels, `backupUrls`, and helper functions**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 2: Global Channel Stream Healing & Automatic Level/Backup Failover

**Files:**
- Modify: `src/core/PlayerEngine.ts`
- Modify: `src/store/playerStore.ts`
- Test: `test/streamHealingFailoverAudit.test.mjs`

**Interfaces:**
- In `PlayerEngine.ts`:
  - Enhance `Hls.Events.ERROR` handling:
    - On `LEVEL_LOAD_ERROR` / `LEVEL_LOAD_TIMEOUT`: downscale `nextLevel` and reload instead of fatal crash.
    - On `NETWORK_ERROR`: call `hls.startLoad()`.
    - On `MEDIA_ERROR`: call `hls.recoverMediaError()`.
  - In `playerStore.ts`:
    - In `engine.onError`: detect if `curUri` belongs to a `LiveChannel`. If so, automatically attempt `getChannelBackupUrl(curUri)` before showing error banner, resetting retry counters and switching stream source transparently.

- [ ] **Step 1: Write test for stream healing error recovery and backup failover**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement stream healing in `PlayerEngine.ts` and `playerStore.ts`**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 3: Inbuilt Offline Canvas Games Expansion (Pac-Man, Space Invaders, Solitaire, Sudoku, etc.)

**Files:**
- Modify: `src/utils/inbuiltGames.ts`
- Modify: `src/utils/gamesCatalog.ts`
- Modify: `src/utils/gameThumbnails.ts`
- Test: `test/inbuiltGamesExpansionAudit.test.mjs`

**Interfaces:**
- Add zero-latency canvas implementations for:
  - `pacman` (Full canvas Pac-Man with maze, dots, ghosts, lives, score)
  - `space-invaders` (Canvas Space Invaders with bunkers, alien grid, player laser)
  - `solitaire` (Classic Klondike Solitaire card engine)
  - `sudoku` (Sudoku puzzle board with validation & difficulty)
  - `simon-says` (Audio-visual Simon memory sequence)
  - `space-defender` (Side-scrolling space defense shooter)
  - `whack-a-mole` (Reflex grid arcade game)
- Wire these into `GAMES_CATALOG` with `isInbuilt: true` and `srcDoc: getInbuiltGameSrcDoc(...)`.

- [ ] **Step 1: Write test checking that new games produce valid non-empty HTML `srcDoc`**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement canvas engines in `inbuiltGames.ts` and update `gamesCatalog.ts`**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 4: Fix Game Iframe Sandbox & Implement Graceful Fallback / Loading UI

**Files:**
- Modify: `src/components/games/FullWindowGamesModal.tsx`
- Modify: `src/components/games/GamesSection.tsx`
- Test: `test/gameSandboxAndFallbackAudit.test.mjs`

**Interfaces:**
- Update `sandbox` attributes to include `allow-same-origin` for non-srcDoc games so `localStorage` calls do not throw `SecurityError`.
- Add iframe loading spinner with 3.5s timeout.
- If external iframe triggers `onError` or timeout: render graceful fallback card with:
  - "Launch in Web Browser" (where iframe security restrictions are bypassed)
  - "Play Inbuilt Alternative" (switches directly to an offline canvas title)
  - "Reload Game"
- In `FullWindowGamesModal.tsx`, ensure `isCatalogDrawerOpen` defaults to `true` when no initial game is specified so user immediately sees game gallery rather than a black screen.

- [ ] **Step 1: Write test verifying sandbox attributes and error fallback structure**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Update `FullWindowGamesModal.tsx` and `GamesSection.tsx`**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 5: Add Channels Tab to Library Modal & Enhance Games Gallery

**Files:**
- Modify: `src/components/hud/FileBrowserModal.tsx`
- Test: `test/fileBrowserChannelsTabAudit.test.mjs`

**Interfaces:**
- In `FileBrowserModal.tsx`:
  - Add `channels` to `TabType` and top navigation tabs with live channel icon and count.
  - Render Channels view with category filters, search, and 1-click stream launcher.
  - In `Games` tab, display game grid with preview images and full-window launcher.

- [ ] **Step 1: Write test verifying Channels tab exists in FileBrowserModal and renders channels**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement Channels tab in `FileBrowserModal.tsx`**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit**

---

### Task 6: End-to-End Verification, macOS App Packaging & GitHub Push

**Files:**
- Test: Run all unit and audit test suites (`npm test`)
- Run typecheck: `npx tsc --noEmit`
- Build & Package: `./scripts/package-mac.sh`
- Push to GitHub branch: `origin feat/uiux-games-preview-and-keyboard-detection`

- [ ] **Step 1: Run full test suite (`npm test`) and TypeScript checks**
- [ ] **Step 2: Package macOS app and verify bundle**
- [ ] **Step 3: Commit all changes and push to GitHub**
