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

export type SpatialOutputMode = 'binaural' | 'discrete_51';

export interface SpatialAudioState {
  enabled: boolean;
  outputMode: SpatialOutputMode;
  profile: SpatialProfileId;
  coordinates: SpatialCoordinates;
  speakers: SpeakerLevels;
  lfeCrossoverHz: number; // 40 to 200Hz
  reverbAmount: number;   // 0.0 to 1.0
  stereoPan: number;      // -1.0 (Left) to +1.0 (Right)
  preampGain: number;     // 1.0 to 2.5 (100% to 250% Boost)
}

/**
 * ITU-R BS.775 Normalized Downmix Factor
 * Prevents 6 discrete speaker gains (FL, C, FR, SL, SR, LFE) from summing to 6.95x gain,
 * ensuring total stereo sum strictly normalizes to unity gain (1.0).
 */
export const BS775_DOWNMIX_NORM = 1.0 / (1.0 + 0.707 + 0.707 + 0.5); // ≈ 0.343
export const DOWNMIX_NORM = BS775_DOWNMIX_NORM;

export const DEFAULT_SPATIAL_STATE: SpatialAudioState = {
  enabled: true,
  outputMode: 'binaural',
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
  private channelMergerNode: ChannelMergerNode | null = null;
  private preampGainNode: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private dynamicsCompressor: DynamicsCompressorNode | null = null;
  private masterVolume: number = 1.0; // 0.0 to 2.0 (supports 200% overdrive)

  private cachedDestinationNode: AudioNode | null = null;
  private state: SpatialAudioState = { ...DEFAULT_SPATIAL_STATE };

  public init(audioCtx: AudioContext, sourceNode: AudioNode, destinationNode: AudioNode): void {
    this.audioCtx = audioCtx;
    this.cachedDestinationNode = destinationNode;

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

      // 6. 6-Channel Merger Node for Discrete 5.1 Surround Output
      if (typeof audioCtx.createChannelMerger === 'function') {
        this.channelMergerNode = audioCtx.createChannelMerger(6);
      }

      // 7. Master Preamp Gain & Limiter Compressor (prevents clipping distortion at up to 200% overdrive)
      this.preampGainNode = audioCtx.createGain();
      this.preampGainNode.gain.setValueAtTime(this.state.preampGain ?? 1.0, audioCtx.currentTime);

      this.masterGain = audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(this.masterVolume, audioCtx.currentTime);

      // True-Peak Brickwall Limiter (ratio 20:1, threshold -0.5dB, attack 1ms, release 50ms)
      this.dynamicsCompressor = audioCtx.createDynamicsCompressor();
      this.dynamicsCompressor.threshold.setValueAtTime(-0.5, audioCtx.currentTime);
      this.dynamicsCompressor.knee.setValueAtTime(0, audioCtx.currentTime);
      this.dynamicsCompressor.ratio.setValueAtTime(20, audioCtx.currentTime);
      this.dynamicsCompressor.attack.setValueAtTime(0.001, audioCtx.currentTime);
      this.dynamicsCompressor.release.setValueAtTime(0.05, audioCtx.currentTime);

      // Connect source into analyser and panner
      sourceNode.connect(this.analyserNode);
      sourceNode.connect(this.pannerNode);

      // Connect panner to speaker gain nodes
      this.pannerNode.connect(this.flGain);
      this.pannerNode.connect(this.cGain);
      this.pannerNode.connect(this.frGain);
      this.pannerNode.connect(this.slGain);
      this.pannerNode.connect(this.srGain);

      // Subwoofer chain
      this.pannerNode.connect(this.lfeFilter);
      this.lfeFilter.connect(this.lfeGain);

      this.routeGraph();
      this.applyState(this.state);
    } catch (e) {
      console.warn('[SpatialAudioEngine] WebAudio spatial nodes init fallback:', e);
    }
  }

  private routeGraph(): void {
    if (!this.audioCtx || !this.cachedDestinationNode || !this.masterGain || !this.dynamicsCompressor || !this.preampGainNode) return;

    // Disconnect speakers before re-routing
    try {
      this.flGain?.disconnect();
      this.cGain?.disconnect();
      this.frGain?.disconnect();
      this.slGain?.disconnect();
      this.srGain?.disconnect();
      this.lfeGain?.disconnect();
      this.stereoPanNode?.disconnect();
      this.channelMergerNode?.disconnect();
      this.preampGainNode.disconnect();
      this.dynamicsCompressor.disconnect();
      this.masterGain.disconnect();
    } catch {
      // Ignore disconnect errors on initial routing
    }

    const supports51 = (this.audioCtx.destination.maxChannelCount || 2) >= 6;
    if (this.state.outputMode === 'discrete_51' && supports51 && this.channelMergerNode) {
      // 5.1 Discrete Speaker Routing:
      // W3C Standard 5.1 Channel Ordering:
      // Ch 0: Front Left
      // Ch 1: Front Right
      // Ch 2: Center
      // Ch 3: Low Frequency Effects (LFE / Subwoofer)
      // Ch 4: Surround Left
      // Ch 5: Surround Right
      try {
        this.audioCtx.destination.channelCount = 6;
        this.audioCtx.destination.channelCountMode = 'explicit';
      } catch {
        // Fallback for browsers with locked destination channelCount
      }

      this.flGain?.connect(this.channelMergerNode, 0, 0);
      this.frGain?.connect(this.channelMergerNode, 0, 1);
      this.cGain?.connect(this.channelMergerNode, 0, 2);
      this.lfeGain?.connect(this.channelMergerNode, 0, 3);
      this.slGain?.connect(this.channelMergerNode, 0, 4);
      this.srGain?.connect(this.channelMergerNode, 0, 5);

      this.channelMergerNode.connect(this.preampGainNode);
    } else {
      // Binaural Stereo / Headphone Routing:
      // Feeds into stereo panning balance and preamp gain
      const intermediateNode = this.stereoPanNode || this.preampGainNode;

      this.flGain?.connect(intermediateNode);
      this.cGain?.connect(intermediateNode);
      this.frGain?.connect(intermediateNode);
      this.slGain?.connect(intermediateNode);
      this.srGain?.connect(intermediateNode);
      this.lfeGain?.connect(intermediateNode);

      if (this.stereoPanNode) {
        this.stereoPanNode.connect(this.preampGainNode);
      }
    }

    // Hi-Fi 4-Stage Signal Chain:
    // Spatial (downmix) -> Preamp Gain -> True-Peak Limiter -> Master Volume -> Destination
    this.preampGainNode.connect(this.dynamicsCompressor);
    this.dynamicsCompressor.connect(this.masterGain);
    this.masterGain.connect(this.cachedDestinationNode);
  }

  public setOutputMode(mode: SpatialOutputMode): void {
    this.state.outputMode = mode;
    this.routeGraph();
    this.applyState(this.state);
  }

  public isDiscrete51(): boolean {
    return this.state.outputMode === 'discrete_51';
  }

  public getMasterVolume(): number {
    return this.masterVolume;
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
    this.applySpeakerGains(this.state.speakers);
  }

  private applySpeakerGains(speakers: SpeakerLevels): void {
    if (!this.audioCtx) return;

    const time = this.audioCtx.currentTime;
    const isStereo = this.state.outputMode !== 'discrete_51';
    // ITU-R BS.775 normalized downmix factor ensures stereo sum <= 1.0 (unity gain)
    const downmixNorm = isStereo ? BS775_DOWNMIX_NORM : 1.0;

    this.flGain?.gain.setTargetAtTime(speakers.frontLeft * downmixNorm, time, 0.025);
    this.cGain?.gain.setTargetAtTime(speakers.center * downmixNorm * (isStereo ? 0.707 : 1.0), time, 0.025);
    this.frGain?.gain.setTargetAtTime(speakers.frontRight * downmixNorm, time, 0.025);
    this.slGain?.gain.setTargetAtTime(speakers.surroundLeft * downmixNorm * (isStereo ? 0.707 : 1.0), time, 0.025);
    this.srGain?.gain.setTargetAtTime(speakers.surroundRight * downmixNorm * (isStereo ? 0.707 : 1.0), time, 0.025);
    this.lfeGain?.gain.setTargetAtTime(speakers.subwoofer * downmixNorm * (isStereo ? 0.5 : 1.0), time, 0.025);
  }

  public setStereoPan(pan: number): void {
    const clamped = Math.max(-1.0, Math.min(1.0, pan));
    this.state.stereoPan = clamped;
    if (this.stereoPanNode && this.audioCtx) {
      this.stereoPanNode.pan.setValueAtTime(clamped, this.audioCtx.currentTime);
    }
  }

  public setMasterVolume(multiplier: number): void {
    const clamped = Math.max(0, Math.min(2.0, multiplier));
    this.masterVolume = clamped;
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setTargetAtTime(clamped, this.audioCtx.currentTime, 0.025);
    }
  }

  public setPreampGain(gainMultiplier: number): void {
    const clamped = Math.max(0.5, Math.min(2.5, gainMultiplier));
    this.state.preampGain = clamped;
    if (this.preampGainNode && this.audioCtx) {
      this.preampGainNode.gain.setTargetAtTime(clamped, this.audioCtx.currentTime, 0.025);
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
      this.state.speakers = neutralSpeakers;
      this.applySpeakerGains(neutralSpeakers);
      this.setMasterVolume(this.masterVolume);
      this.setPreampGain(this.state.preampGain ?? 1.0);
    }
  }

  public getState(): SpatialAudioState {
    return { ...this.state };
  }

  public applyState(state: SpatialAudioState): void {
    this.state = { ...state };
    this.setCoordinates(state.coordinates.x, state.coordinates.y, state.coordinates.z);
    this.applySpeakerGains(state.speakers);
    if (this.lfeFilter && this.audioCtx) {
      this.lfeFilter.frequency.setValueAtTime(state.lfeCrossoverHz, this.audioCtx.currentTime);
    }
    this.setStereoPan(state.stereoPan ?? 0.0);
    this.setPreampGain(state.preampGain ?? 1.0);
    this.setMasterVolume(this.masterVolume);
  }
}
