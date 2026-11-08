/**
 * playerFixes.ts  [version 2 - replaces the file from the first fix]
 *
 * Imported once from src/main.tsx. Corrects behaviour of WebMediaEngine and the player store
 * without re-pasting those two very large files.
 *
 * From version 1
 *  - Volume applied twice (50% sounded like ~14%): one stage now does the work.
 *  - Slider at 1% jumped to 100%.
 *  - Mute was lost on play / track change.
 *  - Volume and mute are remembered between launches.
 *  - Blocked autoplay left the element muted forever.
 *
 * New in version 2
 *  - SONG CUT OFF / STOPPED HALFWAY. If the audio element errors, stalls for 10 s, or ends
 *    before the track's real duration, the stream is reloaded at the same second (3 tries).
 *  - SONG STARTS AT THE END. Re-opening a song you played before resumed it from the saved
 *    position, which for a finished song is its last seconds. Music now starts from 0, and
 *    finished videos restart instead of resuming at the credits.
 *  - SOUND ENHANCEMENT (EQ / bass boost). Boosting bands raised the level into the limiter,
 *    which pumped and distorted. The output now drops by 70% of the largest boost, so
 *    "Bass Boost" sounds fuller instead of clipped.
 *  - NO SOUND AT ALL after the first click: the Web Audio context could stay suspended, and
 *    audio routed through a suspended context is silent. It is now resumed on the next
 *    click or key press if the browser refused to do it earlier.
 */

import { WebMediaEngine } from './PlayerEngine';
import { usePlayerStore } from '../store/playerStore';

const STORAGE_KEY_VOLUME = 'miki_volume_v1';
const GAMMA = 1.4;
const MAX_RECOVERIES = 3;
const STALL_LIMIT_MS = 10000;

/* ------------------------------------------------------------------ */
/* Output level (volume, mute, EQ headroom)                            */
/* ------------------------------------------------------------------ */

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

  // Once createMediaElementSource() has been called the element can never be
  // disconnected from the Web Audio graph, whatever the "bypass" flag says.
  const routedThroughGraph = Boolean(engine.mediaSourceNode && engine.audioCtx);

  el.muted = muted;
  if (routedThroughGraph) {
    const headroom = Math.pow(10, (engine.eqHeadroomDb || 0) / 20);
    const gain = muted ? 0 : percentToGain(percent) * headroom;
    el.volume = 1;
    try {
      engine.gainNode?.gain.setTargetAtTime(gain, engine.audioCtx.currentTime, 0.015);
    } catch {
      // gain node not ready yet
    }
    engine.spatialAudio?.setMasterVolume?.(gain);
  } else {
    el.volume = Math.max(0, Math.min(1, muted ? 0 : percentToGain(percent)));
  }
}

/** Audio routed through a suspended AudioContext is silent. Make sure it is running. */
function ensureContextRunning(engine: any): void {
  const ctx: AudioContext | null = engine.audioCtx;
  if (!ctx || ctx.state === 'running' || typeof window === 'undefined') return;
  ctx.resume().catch(() => {});
  if (engine.__resumeHookInstalled) return;
  engine.__resumeHookInstalled = true;
  const hook = () => {
    ctx
      .resume()
      .then(() => {
        if (ctx.state === 'running') {
          window.removeEventListener('pointerdown', hook, true);
          window.removeEventListener('keydown', hook, true);
          engine.__resumeHookInstalled = false;
        }
      })
      .catch(() => {});
  };
  window.addEventListener('pointerdown', hook, true);
  window.addEventListener('keydown', hook, true);
}

/* ------------------------------------------------------------------ */
/* Stream recovery                                                     */
/* ------------------------------------------------------------------ */

const recoveryAttached = new WeakSet<HTMLMediaElement>();

function attachStreamRecovery(el: HTMLMediaElement | null): void {
  if (!el || recoveryAttached.has(el)) return;
  recoveryAttached.add(el);

  let attempts = 0;
  let lastRecoverAt = 0;
  let goodTime = 0;
  let stallSince = 0;

  const isProxyStream = () => (el.currentSrc || el.src || '').includes('/api/stream-audio');

  const recover = (reason: string) => {
    if (!isProxyStream() || attempts >= MAX_RECOVERIES) return;
    if (Date.now() - lastRecoverAt < 1500) return;
    attempts += 1;
    lastRecoverAt = Date.now();

    const resumeAt = el.currentTime;
    const current = el.currentSrc || el.src;
    const base = current.replace(/([?&])r=\d+(&|$)/, '$1').replace(/[?&]$/, '');
    const next = `${base}${base.includes('?') ? '&' : '?'}r=${Date.now()}`;
    console.warn(`[Miki Music] Stream ${reason} at ${resumeAt.toFixed(1)}s, reconnecting (${attempts}/${MAX_RECOVERIES})`);

    usePlayerStore.setState({ isBuffering: true });
    const onMeta = () => {
      el.removeEventListener('loadedmetadata', onMeta);
      try {
        if (resumeAt > 0) el.currentTime = resumeAt;
      } catch {
        // seek not allowed yet
      }
      el.play().catch(() => {});
      const err = usePlayerStore.getState().lastError;
      if (err && (err.code === 'STREAM_ERROR' || err.code === 'STREAM_TIMEOUT' || err.code === 'MEDIA_NOT_FOUND')) {
        usePlayerStore.setState({ lastError: null });
      }
    };
    el.addEventListener('loadedmetadata', onMeta);
    el.src = next;
    el.load();
  };

  el.addEventListener('error', () => recover('error'));

  el.addEventListener('ended', () => {
    const d = el.duration;
    if (Number.isFinite(d) && d > 10 && el.currentTime < d - 3) recover('ended early');
  });

  el.addEventListener('timeupdate', () => {
    if (el.currentTime < goodTime) goodTime = el.currentTime; // user seeked back
    if (el.currentTime - goodTime > 20) {
      goodTime = el.currentTime;
      attempts = 0; // playing normally again
    }
  });

  el.addEventListener('loadstart', () => {
    const src = el.currentSrc || el.src || '';
    if (!/[?&]r=\d+/.test(src)) {
      attempts = 0; // a different track was loaded
      goodTime = 0;
    }
  });

  // Stall watchdog
  window.setInterval(() => {
    if (!el.paused && !el.ended && el.readyState < 3 && isProxyStream()) {
      if (!stallSince) stallSince = Date.now();
      else if (Date.now() - stallSince > STALL_LIMIT_MS) {
        stallSince = 0;
        recover('stalled');
      }
    } else {
      stallSince = 0;
    }
  }, 1000);
}

/* ------------------------------------------------------------------ */
/* Store helpers                                                       */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/* Install                                                             */
/* ------------------------------------------------------------------ */

export function installPlayerFixes(): void {
  const g = globalThis as unknown as { __mikiPlayerFixesInstalled?: string };
  if (g.__mikiPlayerFixesInstalled === 'v2') return;
  g.__mikiPlayerFixesInstalled = 'v2';

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

  // EQ / "sound enhancement": leave headroom for boosted bands.
  const originalSetEqualizer = proto.setEqualizer;
  proto.setEqualizer = async function (this: any, gainsDb: number[], nightMode: boolean): Promise<void> {
    await originalSetEqualizer.call(this, gainsDb, nightMode);
    const biggestBoost = Math.max(0, ...(gainsDb || []).map((v) => Math.min(20, Number(v) || 0)));
    this.eqHeadroomDb = -0.7 * biggestBoost;
    applyOutputLevel(this);
  };

  proto.play = async function (this: any): Promise<void> {
    const el: HTMLVideoElement | null = this.getVideoEl?.() ?? null;
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume().catch(() => {});
    }
    ensureContextRunning(this);
    if (el) {
      attachStreamRecovery(el);
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
    attachStreamRecovery(this.getVideoEl?.() ?? null);
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
    attachStreamRecovery(this.getVideoEl?.() ?? null);
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

  // Where playback starts when a song / video is opened again.
  const originalOpenMedia = getState().openMedia;
  const openMedia: typeof originalOpenMedia = (uri, title, autoResume = true, startPositionMs, artworkUrl, mediaType) => {
    let start = startPositionMs;
    if (start === undefined && autoResume) {
      const s = getState();
      const isMusic =
        mediaType === 'music' ||
        mediaType === 'radio' ||
        (mediaType === undefined && (s.lastActiveNav === 'music' || s.lastActiveCategory === 'Music'));
      const recent = s.recentMedia.find((m) => m.uri === uri);
      const nearlyFinished =
        !!recent &&
        (recent.isCompleted ||
          recent.progressPercent >= 90 ||
          (recent.durationMs > 0 && recent.durationMs - recent.lastPositionMs < 10000));
      if (isMusic || nearlyFinished) start = 0;
    }
    return originalOpenMedia(uri, title, autoResume, start, artworkUrl, mediaType);
  };

  usePlayerStore.setState({ setVolume, setMuted, togglePlay, openMedia });
}

installPlayerFixes();
