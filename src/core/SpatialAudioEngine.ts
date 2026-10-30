/**
 * 3D Spatial Audio & Multi-Speaker Sound System Engine
 * 
 * Powered by Web Audio API HRTF (Head-Related Transfer Function) PannerNode
 * and discrete 6-channel multi-speaker virtualizer (Front Left, Center, Front Right,
 * Surround Left, Surround Right, Subwoofer LFE).
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
  lfeCrossoverHz: number; // 60 to 160Hz
  reverbAmount: number;   // 0.0 to 1.0
}

export const DEFAULT_SPATIAL_STATE: SpatialAudioState = {
  enabled: true,
  profile: 'imax_3d',
  coordinates: { x: 0, y: 0, z: 0.5 },
  speakers: {
    frontLeft: 1.0,
    center: 1.2,
    frontRight: 1.0,
    surroundLeft: 1.1,
    surroundRight: 1.1,
    subwoofer: 1.35,
  },
  lfeCrossoverHz: 120,
  reverbAmount: 0.25,
};

export class SpatialAudioEngine {
  private audioCtx: AudioContext | null = null;
  private pannerNode: PannerNode | null = null;
  private flGain: GainNode | null = null;
  private cGain: GainNode | null = null;
  private frGain: GainNode | null = null;
  private slGain: GainNode | null = null;
  private srGain: GainNode | null = null;
  private lfeGain: GainNode | null = null;
  private lfeFilter: BiquadFilterNode | null = null;
  private masterGain: GainNode | null = null;

  private state: SpatialAudioState = { ...DEFAULT_SPATIAL_STATE };

  public init(audioCtx: AudioContext, sourceNode: AudioNode, destinationNode: AudioNode): void {
    this.audioCtx = audioCtx;

    try {
      // 1. HRTF 3D Spatial Panner Node
      this.pannerNode = audioCtx.createPanner();
      this.pannerNode.panningModel = 'HRTF';
      this.pannerNode.distanceModel = 'inverse';
      this.pannerNode.refDistance = 1;
      this.pannerNode.maxDistance = 10000;
      this.pannerNode.rolloffFactor = 1;
      this.pannerNode.coneInnerAngle = 360;

      // 2. Discrete Multi-Speaker Gain Nodes
      this.flGain = audioCtx.createGain();
      this.cGain = audioCtx.createGain();
      this.frGain = audioCtx.createGain();
      this.slGain = audioCtx.createGain();
      this.srGain = audioCtx.createGain();
      this.lfeGain = audioCtx.createGain();

      // 3. Subwoofer Low-Pass Filter
      this.lfeFilter = audioCtx.createBiquadFilter();
      this.lfeFilter.type = 'lowpass';
      this.lfeFilter.frequency.setValueAtTime(this.state.lfeCrossoverHz, audioCtx.currentTime);

      this.masterGain = audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(1.0, audioCtx.currentTime);

      // Connect source into panner and multi-speaker graph
      sourceNode.connect(this.pannerNode);

      // Connect speakers to destination
      this.pannerNode.connect(this.flGain);
      this.pannerNode.connect(this.cGain);
      this.pannerNode.connect(this.frGain);
      this.pannerNode.connect(this.slGain);
      this.pannerNode.connect(this.srGain);

      // Subwoofer chain
      this.pannerNode.connect(this.lfeFilter);
      this.lfeFilter.connect(this.lfeGain);

      // Sum all speaker nodes into master
      this.flGain.connect(this.masterGain);
      this.cGain.connect(this.masterGain);
      this.frGain.connect(this.masterGain);
      this.slGain.connect(this.masterGain);
      this.srGain.connect(this.masterGain);
      this.lfeGain.connect(this.masterGain);

      this.masterGain.connect(destinationNode);

      this.applyState(this.state);
    } catch (e) {
      console.warn('[SpatialAudioEngine] Failed to initialize WebAudio spatial nodes:', e);
    }
  }

  public setCoordinates(x: number, y: number, z: number): void {
    this.state.coordinates = { x, y, z };
    if (!this.pannerNode || !this.audioCtx) return;

    const time = this.audioCtx.currentTime;
    // Map -1..1 to 3D room coordinates
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
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(enabled ? 1.0 : 0.0, this.audioCtx.currentTime);
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
  }
}
