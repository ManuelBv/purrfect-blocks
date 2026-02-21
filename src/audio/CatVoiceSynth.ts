/**
 * CatVoiceSynth — Formant synthesis for cat-like vocal sounds
 *
 * Uses the Source-Filter model:
 *   Glottal source (sawtooth oscillator)
 *   → Pre-filter (lowpass anti-alias)
 *   → Vocal tract (3 parallel bandpass formant filters)
 *   → ADSR envelope
 *
 * All synthesis is procedural — no audio files required.
 */

export interface MeowParams {
  f0Start: number;      // Starting fundamental frequency (Hz)
  f0Peak: number;       // Peak fundamental frequency (Hz)
  f0End: number;        // Ending fundamental frequency (Hz)
  duration: number;     // Total duration (seconds)
  peakAt: number;       // Fraction of duration where F0 peak occurs (0–1)
  f1Start: number;      // Formant 1 start frequency (Hz) — mouth opening
  f1End: number;        // Formant 1 end frequency (Hz) — mouth closing
  f2: number;           // Formant 2 frequency (Hz)
  f3: number;           // Formant 3 frequency (Hz)
  vibratoRate: number;  // Vibrato LFO rate (Hz)
  vibratoDepth: number; // Vibrato depth as fraction of F0 (0.0–1.0)
  gain: number;         // Output gain (0.0–1.0)
}

export const MEOW_HAPPY: MeowParams = {
  f0Start: 420, f0Peak: 820, f0End: 560,
  duration: 0.42, peakAt: 0.5,
  f1Start: 500, f1End: 1300,
  f2: 1900, f3: 4000,
  vibratoRate: 6, vibratoDepth: 0.02,
  gain: 0.7,
};

export const MEOW_SAD: MeowParams = {
  f0Start: 680, f0Peak: 680, f0End: 320,
  duration: 0.55, peakAt: 0.1,
  f1Start: 900, f1End: 600,
  f2: 1850, f3: 3800,
  vibratoRate: 4, vibratoDepth: 0.01,
  gain: 0.6,
};

export const MEOW_EXCITED: MeowParams = {
  f0Start: 500, f0Peak: 1000, f0End: 650,
  duration: 0.30, peakAt: 0.45,
  f1Start: 550, f1End: 1500,
  f2: 2100, f3: 4500,
  vibratoRate: 8, vibratoDepth: 0.03,
  gain: 0.8,
};

export class CatVoiceSynth {
  private _ctx: AudioContext;
  private _masterGain: GainNode;

  constructor(ctx: AudioContext, masterGain: GainNode) {
    this._ctx = ctx;
    this._masterGain = masterGain;
  }

  /**
   * Synthesize a meow using the source-filter (formant) model.
   * Smooth pitch glide + 3 bandpass filters model the cat vocal tract.
   */
  meow(params: MeowParams): void {
    const ctx = this._ctx;
    const now = ctx.currentTime;
    const { f0Start, f0Peak, f0End, duration, peakAt,
            f1Start, f1End, f2, f3,
            vibratoRate, vibratoDepth, gain } = params;

    // ─── Glottal source oscillator ─────────────────────────────────
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(f0Start, now);
    osc.frequency.linearRampToValueAtTime(f0Peak, now + duration * peakAt);
    osc.frequency.linearRampToValueAtTime(f0End, now + duration);

    // ─── Vibrato LFO ───────────────────────────────────────────────
    const vibratoLfo = ctx.createOscillator();
    const vibratoGain = ctx.createGain();
    vibratoLfo.type = 'sine';
    vibratoLfo.frequency.value = vibratoRate;
    vibratoGain.gain.value = f0Start * vibratoDepth;
    vibratoLfo.connect(vibratoGain);
    vibratoGain.connect(osc.frequency);

    // ─── Pre-filter (anti-alias) ───────────────────────────────────
    const preFilter = ctx.createBiquadFilter();
    preFilter.type = 'lowpass';
    preFilter.frequency.value = 7000;
    preFilter.Q.value = 0.7;
    osc.connect(preFilter);

    // ─── ADSR envelope ─────────────────────────────────────────────
    const adsrGain = ctx.createGain();
    adsrGain.gain.setValueAtTime(0, now);
    adsrGain.gain.linearRampToValueAtTime(gain, now + 0.02);
    adsrGain.gain.linearRampToValueAtTime(gain * 0.85, now + 0.07);
    adsrGain.gain.setValueAtTime(gain * 0.85, now + duration - 0.12);
    adsrGain.gain.linearRampToValueAtTime(0, now + duration);

    // ─── 3 bandpass formant filters (vocal tract model) ────────────
    const formants = [
      { freqStart: f1Start, freqEnd: f1End, q: 8,  gainVal: 0.80 },
      { freqStart: f2,      freqEnd: f2,    q: 12, gainVal: 0.45 },
      { freqStart: f3,      freqEnd: f3,    q: 20, gainVal: 0.12 },
    ];

    for (const { freqStart, freqEnd, q, gainVal } of formants) {
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freqStart, now);
      filter.frequency.linearRampToValueAtTime(freqEnd, now + duration * 0.8);
      filter.Q.value = q;

      const fGain = ctx.createGain();
      fGain.gain.value = gainVal;

      preFilter.connect(filter);
      filter.connect(fGain);
      fGain.connect(adsrGain);
    }

    adsrGain.connect(this._masterGain);

    osc.start(now);
    vibratoLfo.start(now);
    osc.stop(now + duration + 0.05);
    vibratoLfo.stop(now + duration + 0.05);
  }

  /**
   * Synthesize a purr — layered 28 Hz sawtooth + AM noise.
   */
  purr(duration: number = 2.0): void {
    const ctx = this._ctx;
    const now = ctx.currentTime;

    // Layer 1: low sawtooth tonal core
    const purrOsc = ctx.createOscillator();
    purrOsc.type = 'sawtooth';
    purrOsc.frequency.value = 28;

    const purrLowpass = ctx.createBiquadFilter();
    purrLowpass.type = 'lowpass';
    purrLowpass.frequency.value = 200;

    const purrGain = ctx.createGain();
    purrGain.gain.setValueAtTime(0, now);
    purrGain.gain.linearRampToValueAtTime(0.35, now + 0.3);
    purrGain.gain.setValueAtTime(0.35, now + duration - 0.4);
    purrGain.gain.linearRampToValueAtTime(0, now + duration);

    purrOsc.connect(purrLowpass);
    purrLowpass.connect(purrGain);
    purrGain.connect(this._masterGain);

    // Layer 2: noise with 28 Hz amplitude modulation
    const bufferSize = Math.ceil(ctx.sampleRate * duration);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const noiseLowpass = ctx.createBiquadFilter();
    noiseLowpass.type = 'lowpass';
    noiseLowpass.frequency.value = 300;

    const amLfo = ctx.createOscillator();
    amLfo.type = 'sine';
    amLfo.frequency.value = 28;

    const amDepthGain = ctx.createGain();
    amDepthGain.gain.value = 0.42;

    const amBiasGain = ctx.createGain();
    amBiasGain.gain.value = 0.15;

    amLfo.connect(amDepthGain);
    amDepthGain.connect(amBiasGain.gain);

    noiseSource.connect(noiseLowpass);
    noiseLowpass.connect(amBiasGain);
    amBiasGain.connect(this._masterGain);

    purrOsc.start(now);
    noiseSource.start(now);
    amLfo.start(now);
    purrOsc.stop(now + duration);
    noiseSource.stop(now + duration);
    amLfo.stop(now + duration);
  }

  /**
   * Synthesize a hiss — highpass-filtered noise (sibilant "ssss" character).
   * Uses highpass (not lowpass) to capture the sharp fricative quality of a cat hiss.
   */
  hiss(duration: number = 0.15): void {
    const ctx = this._ctx;
    const now = ctx.currentTime;

    const bufferSize = Math.ceil(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const hipass = ctx.createBiquadFilter();
    hipass.type = 'highpass';
    hipass.frequency.value = 3000;
    hipass.Q.value = 0.7;

    const peak = ctx.createBiquadFilter();
    peak.type = 'peaking';
    peak.frequency.value = 5500;
    peak.Q.value = 1.5;
    peak.gain.value = 6;

    const envGain = ctx.createGain();
    envGain.gain.setValueAtTime(0.4, now);
    envGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    source.connect(hipass);
    hipass.connect(peak);
    peak.connect(envGain);
    envGain.connect(this._masterGain);

    source.start(now);
    source.stop(now + duration);
  }

  /**
   * Synthesize a chirp/trill — rapid FM warble, `count` repetitions.
   * Each chirp: sawtooth oscillator + 14 Hz LFO for ±180 Hz warble.
   */
  chirp(count: number = 3): void {
    const ctx = this._ctx;
    const now = ctx.currentTime;
    const chirpDuration = 0.07;
    const chirpGap = 0.025;

    for (let i = 0; i < count; i++) {
      const t = now + i * (chirpDuration + chirpGap);
      const baseFreq = 500 + i * 80;

      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = baseFreq;

      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.value = 14;
      lfoGain.gain.value = 180;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.5, t + 0.005);
      gain.gain.linearRampToValueAtTime(0, t + chirpDuration);

      osc.connect(gain);
      gain.connect(this._masterGain);

      osc.start(t);
      lfo.start(t);
      osc.stop(t + chirpDuration + 0.01);
      lfo.stop(t + chirpDuration + 0.01);
    }
  }
}
