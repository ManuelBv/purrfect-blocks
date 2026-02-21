// Web Audio API engine for synthesizing game sounds

export class AudioEngine {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private volume: number = 0.5; // Default 50% volume
  private muted: boolean = false;

  /**
   * Initialize the audio context
   */
  init(): void {
    if (this.context) return; // Already initialized

    try {
      this.context = new AudioContext();
      this.masterGain = this.context.createGain();
      this.masterGain.connect(this.context.destination);
      this.masterGain.gain.value = this.volume;

      console.log('Audio engine initialized');
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  }

  /**
   * Resume audio context (required after user interaction)
   */
  async resume(): Promise<void> {
    if (this.context && this.context.state === 'suspended') {
      await this.context.resume();
      console.log('Audio context resumed');
    }
  }

  /**
   * Set master volume (0.0 to 1.0)
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));

    if (this.masterGain && !this.muted) {
      this.masterGain.gain.value = this.volume;
    }
  }

  /**
   * Get current volume
   */
  getVolume(): number {
    return this.volume;
  }

  /**
   * Mute/unmute audio
   */
  setMuted(muted: boolean): void {
    this.muted = muted;

    if (this.masterGain) {
      this.masterGain.gain.value = muted ? 0 : this.volume;
    }
  }

  /**
   * Check if audio is muted
   */
  isMuted(): boolean {
    return this.muted;
  }

  /**
   * Expose AudioContext for CatVoiceSynth to connect to the audio graph
   */
  getContext(): AudioContext | null {
    return this.context;
  }

  /**
   * Expose master gain node for CatVoiceSynth to connect to
   */
  getMasterGain(): GainNode | null {
    return this.masterGain;
  }

  /**
   * Play a simple tone
   */
  playTone(frequency: number, duration: number, type: OscillatorType = 'sine'): void {
    if (!this.context || !this.masterGain || this.muted) return;

    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    // ADSR envelope
    const now = this.context.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01); // Attack
    gainNode.gain.linearRampToValueAtTime(0.2, now + 0.05); // Decay
    gainNode.gain.setValueAtTime(0.2, now + duration - 0.05); // Sustain
    gainNode.gain.linearRampToValueAtTime(0, now + duration); // Release

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  /**
   * Play a multi-tone chord
   */
  playChord(frequencies: number[], duration: number, type: OscillatorType = 'sine'): void {
    frequencies.forEach(freq => this.playTone(freq, duration, type));
  }

  /**
   * Play a noise burst (for thud sounds)
   */
  playNoise(duration: number, filterFreq: number = 500): void {
    if (!this.context || !this.masterGain || this.muted) return;

    const bufferSize = this.context.sampleRate * duration;
    const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const data = buffer.getChannelData(0);

    // Generate white noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = this.context.createBufferSource();
    source.buffer = buffer;

    const filter = this.context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq;

    const gainNode = this.context.createGain();
    const now = this.context.currentTime;
    gainNode.gain.setValueAtTime(0.1, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);

    source.start(now);
    source.stop(now + duration);
  }
}
