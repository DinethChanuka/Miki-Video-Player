/**
 * playerFixes.ts
 *
 * Corrects the volume / mute behaviour of WebMediaEngine and the player store.
 * Import it once, early, from src/main.tsx (see EDITED/src/main.tsx).
 *
 * Problems fixed
 *  1. Volume was applied twice. For streamed audio the <video> element volume AND the
 *     Web Audio gain node both used the 1.4-power curve, so 50% sounded like ~14%.
 *     Now exactly one stage does the work: the gain node when audio is routed through
 *     Web Audio, the element volume otherwise.
 *  2. Dragging the slider to 1% jumped to 100%. The store treated any value in (0, 1]
 *     as a 0..1 fraction and multiplied it by 100.
 *  3. Muted state was lost: pressing play, changing track, or resuming from the store's
 *     togglePlay forced the element back to "unmuted".
 *  4. Volume / mute were not remembered between launches, and the engine always
 *     started at 100% while the store could say something else.
 *  5. If the browser blocked autoplay, the element stayed muted forever. Sound is now
 *     restored on the next click or key press.
 */

import { WebMediaEngine } from './PlayerEngine';
import { usePlayerStore } from '../store/playerStore';

const STORAGE_KEY_VOLUME = 'miki_volume_v1';
const GAMMA = 1.4;

/** 0..200 (%) to a linear gain. 100% is unity, above that the gain boosts past 1.0. */
function percentToGain(percent: number): number {
  const p = Math.max(0, percent);
  const base = Math.pow(Math.min(100, p) / 100, GAMMA);
  return p > 100 ? base * (p / 100) : base;
}

/** Applies volume + mute to the real audio path. Safe to call at any time. */
function applyOutputLevel(engine: any): void {
  const el: HTMLVideoElement | null = engine.getVideoEl?.() ?? engine.videoEl ?? null;
  if (!el) return;

  const percent: number = typeof engine.currentVolumePercent === 'number' ? engine.currentVolumePercent : 100;
  const muted = Boolean(engine.userMuted) || percent <= 0;
  const gain = muted ? 0 : percentToGain(percent);

  // Once createMediaElementSource() has been called the element can never be
  // disconnected from the Web Audio graph, whatever the "bypass" flag says.
  const routedThroughGraph = Boolean(engine.mediaSourceNode && engine.audioCtx);

  el.muted = muted;
  if (routedThroughGraph) {
    el.volume = 1;
    try {
      engine.gainNode?.gain.setTargetAtTime(gain, engine.audioCtx.currentTime, 0.015);
    } catch {
      // gain node not ready yet
    }
    engine.spatialAudio?.setMasterVolume?.(gain);
  } else {
    el.volume = Math.max(0, Math.min(1, gain));
  }
}

function persistVolume(volume: number, muted: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY_VOLUME, JSON.stringify({ volume, muted }));
  } catch {
    // storage unavailable
  }
}

function broadcastVolume(volume: number, isMuted: boolean): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('miki:volume-change', { detail: { volume, isMuted } }));
  const webkit = (window as unknown as {
    webkit?: { messageHandlers?: { browserViewAction?: { postMessage: (msg: unknown) => void } } };
  }).webkit;
  webkit?.messageHandlers?.browserViewAction?.postMessage({ action: 'setVolume', volume, isMuted });
}

/** Used only when no engine has booted yet. */
function applyToDomElement(volume: number, muted: boolean): void {
  if (typeof document === 'undefined') return;
  const video = document.getElementById('aether-video-viewport') as HTMLVideoElement | null;
  if (!video) return;
  video.muted = muted || volume <= 0;
  video.volume = Math.max(0, Math.min(1, percentToGain(volume)));
}

export function installPlayerFixes(): void {
  const g = globalThis as unknown as { __mikiPlayerFixesInstalled?: boolean };
  if (g.__mikiPlayerFixesInstalled) return;
  g.__mikiPlayerFixesInstalled = true;

  /* ---------------------------- engine ---------------------------- */
  const proto = WebMediaEngine.prototype as any;

  proto.setVolume = async function (this: any, volume: number): Promise<void> {
    const n = Number(volume);
    const clamped = Math.max(0, Math.min(200, Number.isFinite(n) ? n : 100));
    this.currentVolumePercent = clamped;
    this.userMuted = clamped === 0; // moving the slider up un-mutes, like every player
    this.setupWebAudioGraph?.();
    applyOutputLevel(this);
    this.notifyTelemetry?.();
  };

  proto.setMuted = async function (this: any, muted: boolean): Promise<void> {
    this.userMuted = Boolean(muted);
    this.setupWebAudioGraph?.();
    applyOutputLevel(this);
    this.notifyTelemetry?.();
  };

  proto.reapplyOutput = function (this: any): void {
    applyOutputLevel(this);
  };

  proto.play = async function (this: any): Promise<void> {
    const el: HTMLVideoElement | null = this.getVideoEl?.() ?? null;
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume().catch(() => {});
    }
    if (el) {
      applyOutputLevel(this); // respects the user's mute, unlike the old el.muted = false
      try {
        await el.play();
      } catch (err: unknown) {
        const e = err as Error;
        if (e?.name === 'NotAllowedError') {
          // Autoplay was blocked: start silently, bring the sound back on the next user input.
          el.muted = true;
          await el.play().catch(() => {});
          const restore = () => {
            applyOutputLevel(this);
            window.removeEventListener('pointerdown', restore, true);
            window.removeEventListener('keydown', restore, true);
          };
          window.addEventListener('pointerdown', restore, true);
          window.addEventListener('keydown', restore, true);
        } else {
          console.warn('[MikiPlayer] play() rejected:', e?.message);
        }
      }
    }
    this.notifyTelemetry?.();
  };

  const originalLoad = proto.load;
  proto.load = async function (this: any, ...args: unknown[]): Promise<void> {
    try {
      return await originalLoad.apply(this, args);
    } finally {
      applyOutputLevel(this);
    }
  };

  const originalInitialize = proto.initialize;
  proto.initialize = async function (this: any, ...args: unknown[]): Promise<void> {
    await originalInitialize.apply(this, args);
    const s = usePlayerStore.getState();
    this.currentVolumePercent = s.volume;
    this.userMuted = s.isMuted;
    applyOutputLevel(this);
  };

  /* ----------------------------- store ---------------------------- */
  // Restore the saved volume.
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VOLUME);
    if (raw) {
      const saved = JSON.parse(raw) as { volume?: number; muted?: boolean };
      const v = Math.max(0, Math.min(200, Math.round(Number(saved.volume ?? 100))));
      usePlayerStore.setState({ volume: v, isMuted: Boolean(saved.muted) || v === 0 });
    }
  } catch {
    // ignore corrupt storage
  }

  const getState = usePlayerStore.getState;

  const setVolume = async (raw: number): Promise<void> => {
    const n = Number(raw);
    const clamped = Math.round(Math.max(0, Math.min(200, Number.isFinite(n) ? n : 100)));
    const isMuted = clamped === 0;
    usePlayerStore.setState({ volume: clamped, isMuted });
    persistVolume(clamped, isMuted);

    const engine = getState().engine;
    if (engine) await engine.setVolume(clamped);
    else applyToDomElement(clamped, isMuted);

    broadcastVolume(clamped, isMuted);
  };

  const setMuted = async (muted: boolean): Promise<void> => {
    usePlayerStore.setState({ isMuted: muted });
    const { volume, engine } = getState();
    persistVolume(volume, muted);

    if (engine) await engine.setMuted(muted);
    else applyToDomElement(volume, muted);

    broadcastVolume(muted ? 0 : volume, muted);
  };

  // The store's togglePlay sets video.muted = false when it resumes; put the user's mute back.
  const originalTogglePlay = getState().togglePlay;
  const togglePlay = async (): Promise<void> => {
    await originalTogglePlay();
    (getState().engine as any)?.reapplyOutput?.();
  };

  usePlayerStore.setState({ setVolume, setMuted, togglePlay });
}

installPlayerFixes();
