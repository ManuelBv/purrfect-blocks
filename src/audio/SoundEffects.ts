// Game sound effects using Web Audio API

import { AudioEngine } from './AudioEngine';

export class SoundEffects {
  private audioEngine: AudioEngine;

  constructor(audioEngine: AudioEngine) {
    this.audioEngine = audioEngine;
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
}
