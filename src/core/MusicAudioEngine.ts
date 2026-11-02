/**
 * Dedicated Hi-Fi Music Audio Engine
 * Lightweight, optimized audio DSP pipeline specifically tuned for music playback.
 * Provides a 10-band graphic equalizer, low-shelf dynamic bass boost,
 * and real-time Fast Fourier Transform (FFT) spectrum analysis for visualizers.
 */

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
  durationSec: number;
  albumArt?: string;
}

export type MusicEqualizerPreset =
  | 'Flat'
  | 'Bass Boost'
  | 'Vocal Boost'
  | 'Electronic'
  | 'Rock'
  | 'Jazz'
  | 'Classical';

export const MUSIC_EQ_FREQUENCIES = [
  32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000,
];

export const MUSIC_PRESETS: Record<MusicEqualizerPreset, number[]> = {
  Flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  'Bass Boost': [6, 5, 4, 2, 0, 0, 0, 1, 2, 3],
  'Vocal Boost': [-2, -2, -1, 1, 4, 4, 3, 1, 0, -1],
  Electronic: [5, 4, 2, 0, -1, 2, 1, 3, 4, 4],
  Rock: [4, 3, 2, 0, -1, 0, 2, 3, 4, 4],
  Jazz: [3, 2, 1, 2, -1, -1, 0, 1, 2, 3],
  Classical: [4, 3, 2, 2, -1, -1, 0, 2, 3, 3],
};

export class MusicAudioEngine {
  private audioCtx: AudioContext | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private eqFilters: BiquadFilterNode[] = [];
  private bassBoostFilter: BiquadFilterNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private limiterNode: DynamicsCompressorNode | null = null;
  private masterGain: GainNode | null = null;
  private isInitialized = false;

  public currentTrack: MusicTrack | null = null;
  public isPlaying = false;
  public volume = 1.0;
  public isBassBoostEnabled = true;
  public activePreset: MusicEqualizerPreset = 'Bass Boost';

  constructor() {
    // Lazy AudioContext initialization on first user interaction
  }

  public init(): void {
    if (this.isInitialized) return;
    if (typeof window === 'undefined') return;

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    this.audioCtx = new AudioContextClass();
    this.audioElement = new Audio();
    this.audioElement.crossOrigin = 'anonymous';

    // 1. Media Element Source Node
    this.sourceNode = this.audioCtx.createMediaElementSource(this.audioElement);

    // 2. 10-Band Peaking Equalizer Filters
    let previousNode: AudioNode = this.sourceNode;
    this.eqFilters = MUSIC_EQ_FREQUENCIES.map((freq) => {
      const filter = this.audioCtx!.createBiquadFilter();
      filter.type = freq <= 32 ? 'lowshelf' : freq >= 16000 ? 'highshelf' : 'peaking';
      filter.frequency.setValueAtTime(freq, this.audioCtx!.currentTime);
      filter.gain.setValueAtTime(0, this.audioCtx!.currentTime);
      filter.Q.setValueAtTime(1.4, this.audioCtx!.currentTime);

      previousNode.connect(filter);
      previousNode = filter;
      return filter;
    });

    // 3. Dynamic Low-Shelf Bass Boost Filter
    this.bassBoostFilter = this.audioCtx.createBiquadFilter();
    this.bassBoostFilter.type = 'lowshelf';
    this.bassBoostFilter.frequency.setValueAtTime(80, this.audioCtx.currentTime);
    this.bassBoostFilter.gain.setValueAtTime(this.isBassBoostEnabled ? 6.0 : 0.0, this.audioCtx.currentTime);
    previousNode.connect(this.bassBoostFilter);
    previousNode = this.bassBoostFilter;

    // 4. Realtime FFT Spectrum Analyser Node for Visualizers
    this.analyserNode = this.audioCtx.createAnalyser();
    this.analyserNode.fftSize = 256;
    this.analyserNode.smoothingTimeConstant = 0.82;
    previousNode.connect(this.analyserNode);
    previousNode = this.analyserNode;

    // 5. Studio Peak Limiter Compressor
    this.limiterNode = this.audioCtx.createDynamicsCompressor();
    this.limiterNode.threshold.setValueAtTime(-1.0, this.audioCtx.currentTime);
    this.limiterNode.knee.setValueAtTime(0.0, this.audioCtx.currentTime);
    this.limiterNode.ratio.setValueAtTime(20.0, this.audioCtx.currentTime);
    this.limiterNode.attack.setValueAtTime(0.003, this.audioCtx.currentTime);
    this.limiterNode.release.setValueAtTime(0.1, this.audioCtx.currentTime);
    previousNode.connect(this.limiterNode);
    previousNode = this.limiterNode;

    // 6. Master Gain Node
    this.masterGain = this.audioCtx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
    previousNode.connect(this.masterGain);
    this.masterGain.connect(this.audioCtx.destination);

    this.applyPreset(this.activePreset);
    this.isInitialized = true;
  }

  public async loadTrack(track: MusicTrack): Promise<void> {
    this.init();
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }

    this.currentTrack = track;
    if (this.audioElement) {
      this.audioElement.src = track.url;
      await this.audioElement.play();
      this.isPlaying = true;
    }
  }

  public async togglePlay(): Promise<void> {
    if (!this.audioElement || !this.currentTrack) return;
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }

    if (this.isPlaying) {
      this.audioElement.pause();
      this.isPlaying = false;
    } else {
      await this.audioElement.play();
      this.isPlaying = true;
    }
  }

  public seek(positionSec: number): void {
    if (this.audioElement) {
      this.audioElement.currentTime = positionSec;
    }
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(2.0, vol));
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
    }
  }

  public setBassBoost(enabled: boolean): void {
    this.isBassBoostEnabled = enabled;
    if (this.bassBoostFilter && this.audioCtx) {
      this.bassBoostFilter.gain.setValueAtTime(
        enabled ? 6.0 : 0.0,
        this.audioCtx.currentTime
      );
    }
  }

  public applyPreset(presetName: MusicEqualizerPreset): void {
    this.activePreset = presetName;
    const gains = MUSIC_PRESETS[presetName];
    if (!gains || !this.audioCtx) return;

    this.eqFilters.forEach((filter, index) => {
      const gain = gains[index] || 0;
      filter.gain.setValueAtTime(gain, this.audioCtx!.currentTime);
    });
  }

  /**
   * Retrieves real-time frequency data bytes (0-255) for spectrum canvas rendering
   */
  public getByteFrequencyData(): Uint8Array {
    if (!this.analyserNode) {
      return new Uint8Array(128);
    }
    const data = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteFrequencyData(data);
    return data;
  }

  public getCurrentTime(): number {
    return this.audioElement?.currentTime || 0;
  }

  public getDuration(): number {
    return this.audioElement?.duration || this.currentTrack?.durationSec || 0;
  }
}
