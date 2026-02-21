// Game sound effects using Web Audio API

import { AudioEngine } from './AudioEngine';
import { CatVoiceSynth, MEOW_HAPPY, MEOW_SAD, MEOW_EXCITED } from './CatVoiceSynth';

export class SoundEffects {
  private audioEngine: AudioEngine;
  private _catVoice: CatVoiceSynth | null = null;

  constructor(audioEngine: AudioEngine) {
    this.audioEngine = audioEngine;
  }

  /**
   * Initialize the formant-based cat voice synthesizer.
   * Must be called after AudioEngine.init() (requires AudioContext to exist).
   */
  initCatVoice(): void {
    const ctx = this.audioEngine.getContext();
    const masterGain = this.audioEngine.getMasterGain();
    if (ctx && masterGain) {
      this._catVoice = new CatVoiceSynth(ctx, masterGain);
    }
  }

  // ─── New formant-based cat sounds (separate from existing methods) ──────────

  playCatMeowHappy(): void {
    this._catVoice?.meow(MEOW_HAPPY);
  }

  playCatMeowSad(): void {
    this._catVoice?.meow(MEOW_SAD);
  }

  playCatMeowExcited(): void {
    this._catVoice?.meow(MEOW_EXCITED);
  }

  playCatPurr(duration?: number): void {
    this._catVoice?.purr(duration);
  }

  playCatHiss(duration?: number): void {
    this._catVoice?.hiss(duration);
  }

  playCatChirp(count?: number): void {
    this._catVoice?.chirp(count);
  }

  /**
   * Soft thud when piece is placed
   */
  playPiecePlaced(): void {
    // Low frequency noise burst
    this.audioEngine.playNoise(0.08, 300);
  }

  /**
   * Happy meow/purr when line is cleared - "Mrrreow!" sound
   */
  playLineClear(): void {
    // "Mrrreow!" - rising then falling pitch like a cat meow (high-pitched)
    const meowPattern = [
      { freq: 500, duration: 0.06 },  // "Mrr" - higher start
      { freq: 600, duration: 0.05 },  // Rising
      { freq: 750, duration: 0.07 },  // "eee" - peak
      { freq: 900, duration: 0.08 },  // Higher peak
      { freq: 700, duration: 0.06 },  // "ow" - falling
      { freq: 550, duration: 0.05 },  // Falling more
    ];

    let delay = 0;
    meowPattern.forEach(({ freq, duration }) => {
      setTimeout(() => {
        this.audioEngine.playTone(freq, duration, 'triangle');
      }, delay);
      delay += duration * 1000 * 0.7; // 70% overlap for smooth transition
    });
  }

  /**
   * Escalating excited meows for cascade combos
   */
  playCascade(cascadeLevel: number): void {
    // Increasing pitch and complexity with cascade level
    const baseFreq = 500;
    const pitchIncrease = cascadeLevel * 100;

    // Play ascending chord
    const chord = [
      baseFreq + pitchIncrease,
      baseFreq + pitchIncrease + 200,
      baseFreq + pitchIncrease + 400
    ];

    this.audioEngine.playChord(chord, 0.15, 'triangle');

    // Add extra high note for excitement
    setTimeout(() => {
      this.audioEngine.playTone(baseFreq + pitchIncrease + 600, 0.1, 'sine');
    }, 80);
  }

  /**
   * Game over sound
   */
  playGameOver(): void {
    // Descending sad tones
    const frequencies = [500, 400, 300, 250];
    let delay = 0;

    frequencies.forEach(freq => {
      setTimeout(() => {
        this.audioEngine.playTone(freq, 0.2, 'triangle');
      }, delay);
      delay += 150;
    });
  }

  /**
   * Success/positive feedback sound
   */
  playSuccess(): void {
    // Rising major chord
    this.audioEngine.playChord([523, 659, 784], 0.3, 'sine'); // C, E, G
  }

  /**
   * Invalid placement sound
   */
  playInvalid(): void {
    // Short low buzz
    this.audioEngine.playTone(150, 0.1, 'square');
  }

  /**
   * Bomb explosion - cat hiss and claw attack sound
   * Sharp hissing noise followed by rapid scratching
   */
  playBombExplosion(): void {
    // Hiss: High-frequency noise burst (like air escaping / cat hissing)
    this.audioEngine.playNoise(0.15, 4000); // High-pass filtered noise for "sssss" hiss

    // Claw swipe 1: Quick descending tone (swipe sound)
    setTimeout(() => {
      this.audioEngine.playTone(800, 0.04, 'sawtooth');
      this.audioEngine.playTone(600, 0.04, 'sawtooth');
    }, 50);

    // Claw swipe 2: Another quick swipe
    setTimeout(() => {
      this.audioEngine.playTone(750, 0.04, 'sawtooth');
      this.audioEngine.playTone(550, 0.04, 'sawtooth');
    }, 100);

    // Claw swipe 3: Final rapid swipe with impact
    setTimeout(() => {
      this.audioEngine.playTone(700, 0.05, 'sawtooth');
      this.audioEngine.playTone(500, 0.05, 'sawtooth');
      // Impact thud
      this.audioEngine.playNoise(0.06, 200);
    }, 150);
  }
}
