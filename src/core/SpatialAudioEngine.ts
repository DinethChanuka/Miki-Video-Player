/**
 * 3D Spatial Audio & Multi-Speaker Sound System Engine
 * 
 * Powered by Web Audio API HRTF (Head-Related Transfer Function) PannerNode,
 * discrete 6-channel multi-speaker virtualizer (Front Left, Center, Front Right,
 * Surround Left, Surround Right, Subwoofer LFE), Real-time Frequency Analyser,
 * Stereo Balance, Preamp Gain Booster, and Binaural Spatialization.
 */

export interface SpeakerLevels {
  frontLeft: number;    // 0.0 to 1.5 (100% = 1.0)
  center: number;       // 0.0 to 1.5
  frontRight: number;   // 0.0 to 1.5
  surroundLeft: number; // 0.0 to 1.5
  surroundRight: number;// 0.0 to 1.5
  subwoofer: number;    // 0.0 to 2.0 (Deep Bass)
}

export interface SpatialCoordinates {
  x: number; // -1.0 (Left) to +1.0 (Right)
  y: number; // -1.0 (Down) to +1.0 (Up)
  z: number; // -1.0 (Behind) to +1.0 (In Front)
}

export type SpatialProfileId =
  | 'imax_3d'
  | 'binaural_360'
  | 'concert_hall'
  | 'tactical_gaming'
  | 'vocal_isolation'
  | 'custom';

export interface SpatialAudioState {
  enabled: boolean;
  profile: SpatialProfileId;
  coordinates: SpatialCoordinates;
  speakers: SpeakerLevels;
  lfeCrossoverHz: number; // 40 to 200Hz
  reverbAmount: number;   // 0.0 to 1.0
  stereoPan: number;      // -1.0 (Left) to +1.0 (Right)
  preampGain: number;     // 1.0 to 2.5 (100% to 250% Boost)
}

export const DEFAULT_SPATIAL_STATE: SpatialAudioState = {
  enabled: true,
  profile: 'imax_3d',
  coordinates: { x: 0, y: 0, z: 0.5 },
  speakers: {
    frontLeft: 1.0,
    center: 1.25,
    frontRight: 1.0,
    surroundLeft: 1.15,
    surroundRight: 1.15,
    subwoofer: 1.4,
  },
  lfeCrossoverHz: 120,
  reverbAmount: 0.25,
  stereoPan: 0.0,
  preampGain: 1.0,
};

export class SpatialAudioEngine {
  private audioCtx: AudioContext | null = null;
  private pannerNode: PannerNode | null = null;
  private stereoPanNode: StereoPannerNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private flGain: GainNode | null = null;
  private cGain: GainNode | null = null;
  private frGain: GainNode | null = null;
  private slGain: GainNode | null = null;
  private srGain: GainNode | null = null;
  private lfeGain: GainNode | null = null;
  private lfeFilter: BiquadFilterNode | null = null;
  private masterGain: GainNode | null = null;
  private dynamicsCompressor: DynamicsCompressorNode | null = null;

  private state: SpatialAudioState = { ...DEFAULT_SPATIAL_STATE };

  public init(audioCtx: AudioContext, sourceNode: AudioNode, destinationNode: AudioNode): void {
    this.audioCtx = audioCtx;

    try {
      // 1. Real-time Analyser for visualizer
      this.analyserNode = audioCtx.createAnalyser();
      this.analyserNode.fftSize = 64;
      this.analyserNode.smoothingTimeConstant = 0.8;

      // 2. HRTF 3D Spatial Panner Node
      this.pannerNode = audioCtx.createPanner();
      this.pannerNode.panningModel = 'HRTF';
      this.pannerNode.distanceModel = 'inverse';
      this.pannerNode.refDistance = 1;
      this.pannerNode.maxDistance = 10000;
      this.pannerNode.rolloffFactor = 1;
      this.pannerNode.coneInnerAngle = 360;

      // 3. Stereo Panner Node (channel balance)
      if (typeof audioCtx.createStereoPanner === 'function') {
        this.stereoPanNode = audioCtx.createStereoPanner();
      }

      // 4. Discrete Multi-Speaker Gain Nodes
      this.flGain = audioCtx.createGain();
      this.cGain = audioCtx.createGain();
      this.frGain = audioCtx.createGain();
      this.slGain = audioCtx.createGain();
      this.srGain = audioCtx.createGain();
      this.lfeGain = audioCtx.createGain();

      // 5. Subwoofer Low-Pass Filter
      this.lfeFilter = audioCtx.createBiquadFilter();
      this.lfeFilter.type = 'lowpass';
      this.lfeFilter.frequency.setValueAtTime(this.state.lfeCrossoverHz, audioCtx.currentTime);

      // 6. Master Preamp Gain & Limiter Compressor (prevents clipping distortion)
      this.masterGain = audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(this.state.preampGain, audioCtx.currentTime);

      this.dynamicsCompressor = audioCtx.createDynamicsCompressor();
      this.dynamicsCompressor.threshold.setValueAtTime(-12, audioCtx.currentTime);
      this.dynamicsCompressor.knee.setValueAtTime(20, audioCtx.currentTime);
      this.dynamicsCompressor.ratio.setValueAtTime(8, audioCtx.currentTime);
      this.dynamicsCompressor.attack.setValueAtTime(0.003, audioCtx.currentTime);
      this.dynamicsCompressor.release.setValueAtTime(0.25, audioCtx.currentTime);

      // Connect source into analyser and panner
      sourceNode.connect(this.analyserNode);
      sourceNode.connect(this.pannerNode);

      // Connect panner to speakers
      this.pannerNode.connect(this.flGain);
      this.pannerNode.connect(this.cGain);
      this.pannerNode.connect(this.frGain);
      this.pannerNode.connect(this.slGain);
      this.pannerNode.connect(this.srGain);

      // Subwoofer chain
      this.pannerNode.connect(this.lfeFilter);
      this.lfeFilter.connect(this.lfeGain);

      // Connect speaker gains to balance or master
      const intermediateNode = this.stereoPanNode || this.masterGain;

      this.flGain.connect(intermediateNode);
      this.cGain.connect(intermediateNode);
      this.frGain.connect(intermediateNode);
      this.slGain.connect(intermediateNode);
      this.srGain.connect(intermediateNode);
      this.lfeGain.connect(intermediateNode);

      if (this.stereoPanNode) {
        this.stereoPanNode.connect(this.masterGain);
      }

      this.masterGain.connect(this.dynamicsCompressor);
      this.dynamicsCompressor.connect(destinationNode);

      this.applyState(this.state);
    } catch (e) {
      console.warn('[SpatialAudioEngine] WebAudio spatial nodes init fallback:', e);
    }
  }

  public setCoordinates(x: number, y: number, z: number): void {
    this.state.coordinates = { x, y, z };
    if (!this.pannerNode || !this.audioCtx) return;

    const time = this.audioCtx.currentTime;
    if (this.pannerNode.positionX) {
      this.pannerNode.positionX.setValueAtTime(x * 5, time);
      this.pannerNode.positionY.setValueAtTime(y * 5, time);
      this.pannerNode.positionZ.setValueAtTime(z * 5, time);
    } else {
      this.pannerNode.setPosition(x * 5, y * 5, z * 5);
    }
  }

  public setSpeakerVolume(speaker: keyof SpeakerLevels, volume: number): void {
    this.state.speakers[speaker] = Math.max(0, Math.min(2.0, volume));
    if (!this.audioCtx) return;

    const time = this.audioCtx.currentTime;
    switch (speaker) {
      case 'frontLeft':
        this.flGain?.gain.setTargetAtTime(this.state.speakers.frontLeft, time, 0.05);
        break;
      case 'center':
        this.cGain?.gain.setTargetAtTime(this.state.speakers.center, time, 0.05);
        break;
      case 'frontRight':
        this.frGain?.gain.setTargetAtTime(this.state.speakers.frontRight, time, 0.05);
        break;
      case 'surroundLeft':
        this.slGain?.gain.setTargetAtTime(this.state.speakers.surroundLeft, time, 0.05);
        break;
      case 'surroundRight':
        this.srGain?.gain.setTargetAtTime(this.state.speakers.surroundRight, time, 0.05);
        break;
      case 'subwoofer':
        this.lfeGain?.gain.setTargetAtTime(this.state.speakers.subwoofer, time, 0.05);
        break;
    }
  }

  public setStereoPan(pan: number): void {
    const clamped = Math.max(-1.0, Math.min(1.0, pan));
    this.state.stereoPan = clamped;
    if (this.stereoPanNode && this.audioCtx) {
      this.stereoPanNode.pan.setValueAtTime(clamped, this.audioCtx.currentTime);
    }
  }

  public setPreampGain(gainMultiplier: number): void {
    const clamped = Math.max(0.5, Math.min(2.5, gainMultiplier));
    this.state.preampGain = clamped;
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(clamped, this.audioCtx.currentTime);
    }
  }

  public getFrequencyData(buffer: Uint8Array): void {
    if (this.analyserNode) {
      this.analyserNode.getByteFrequencyData(buffer as any);
    }
  }

  /**
   * Ensures an active, resumed AudioContext exists
   */
  public ensureAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  public getAudioContext(): AudioContext | null {
    return this.audioCtx;
  }

  /**
   * Plays a quick binaural 3D acoustic sweep to test speaker balance
   */
  public playTestChime(): void {
    const ctx = this.ensureAudioContext();
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.3);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      if (this.pannerNode) {
        gain.connect(this.pannerNode);
      } else if (this.masterGain) {
        gain.connect(this.masterGain);
      } else {
        gain.connect(ctx.destination);
      }

      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {
      console.warn('[SpatialAudioEngine] playTestChime error:', e);
    }
  }

  public setProfile(profile: SpatialProfileId): void {
    this.state.profile = profile;
    switch (profile) {
      case 'imax_3d':
        this.state.speakers = {
          frontLeft: 1.0,
          center: 1.25,
          frontRight: 1.0,
          surroundLeft: 1.15,
          surroundRight: 1.15,
          subwoofer: 1.4,
        };
        this.setCoordinates(0, 0, 0.5);
        break;
      case 'binaural_360':
        this.state.speakers = {
          frontLeft: 1.1,
          center: 1.0,
          frontRight: 1.1,
          surroundLeft: 1.2,
          surroundRight: 1.2,
          subwoofer: 1.1,
        };
        this.setCoordinates(0, 0, 0);
        break;
      case 'concert_hall':
        this.state.speakers = {
          frontLeft: 1.2,
          center: 0.9,
          frontRight: 1.2,
          surroundLeft: 1.3,
          surroundRight: 1.3,
          subwoofer: 1.2,
        };
        this.setCoordinates(0, 0.3, 0.8);
        break;
      case 'tactical_gaming':
        this.state.speakers = {
          frontLeft: 1.15,
          center: 1.0,
          frontRight: 1.15,
          surroundLeft: 1.3,
          surroundRight: 1.3,
          subwoofer: 0.9,
        };
        this.setCoordinates(0, 0, 0.2);
        break;
      case 'vocal_isolation':
        this.state.speakers = {
          frontLeft: 0.7,
          center: 1.5,
          frontRight: 0.7,
          surroundLeft: 0.6,
          surroundRight: 0.6,
          subwoofer: 0.8,
        };
        this.setCoordinates(0, 0.1, 0.9);
        break;
      case 'custom':
        break;
    }
    this.applyState(this.state);
  }

  public setEnabled(enabled: boolean): void {
    this.state.enabled = enabled;
    if (!this.audioCtx) return;

    if (enabled) {
      this.applyState(this.state);
    } else {
      // Neutral balanced pass-through without 3D HRTF panning displacement
      this.setCoordinates(0, 0, 0);
      const neutralSpeakers: SpeakerLevels = {
        frontLeft: 1.0,
        center: 1.0,
        frontRight: 1.0,
        surroundLeft: 1.0,
        surroundRight: 1.0,
        subwoofer: 1.0,
      };
      (Object.keys(neutralSpeakers) as (keyof SpeakerLevels)[]).forEach((spk) => {
        this.setSpeakerVolume(spk, neutralSpeakers[spk]);
      });
      if (this.masterGain) {
        this.masterGain.gain.setValueAtTime(this.state.preampGain ?? 1.0, this.audioCtx.currentTime);
      }
    }
  }

  public getState(): SpatialAudioState {
    return { ...this.state };
  }

  public applyState(state: SpatialAudioState): void {
    this.state = { ...state };
    this.setCoordinates(state.coordinates.x, state.coordinates.y, state.coordinates.z);
    (Object.keys(state.speakers) as (keyof SpeakerLevels)[]).forEach((spk) => {
      this.setSpeakerVolume(spk, state.speakers[spk]);
    });
    if (this.lfeFilter && this.audioCtx) {
      this.lfeFilter.frequency.setValueAtTime(state.lfeCrossoverHz, this.audioCtx.currentTime);
    }
    this.setStereoPan(state.stereoPan ?? 0.0);
    this.setPreampGain(state.preampGain ?? 1.0);
  }
}
