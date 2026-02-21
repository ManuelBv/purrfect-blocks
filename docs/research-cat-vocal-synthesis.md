# Research: Cat Vocal Timbre Synthesis via Web Audio API

**Date:** 2026-02-21
**Status:** Research complete — ready for implementation decision
**Scope:** Replacing the current robotic oscillator-based sounds with programmatic cat vocal synthesis using no audio files (no MP3/WAV), purely via the Web Audio API, deployable on GitHub Pages.

---

## Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [Current Implementation Analysis](#2-current-implementation-analysis)
3. [Cat Vocal Acoustics](#3-cat-vocal-acoustics)
4. [The Source-Filter Model](#4-the-source-filter-model)
5. [Synthesis Approaches — Ranked](#5-synthesis-approaches--ranked)
6. [Web Audio API Capabilities](#6-web-audio-api-capabilities)
7. [Concrete Starting Parameters](#7-concrete-starting-parameters)
8. [Node Graph Designs](#8-node-graph-designs)
9. [Full TypeScript Code Examples](#9-full-typescript-code-examples)
10. [Performance Analysis](#10-performance-analysis)
11. [Quality Expectations](#11-quality-expectations)
12. [Risks and Limitations](#12-risks-and-limitations)
13. [Recommendation](#13-recommendation)
14. [Sources](#14-sources)

---

## 1. Problem Statement

The game currently generates cat sounds using stepped triangle/sine/sawtooth wave tones at fixed frequencies. These sound robotic and mechanical — they carry no cat-like vocal timbre.

**Constraints:**
- No MP3 or WAV files (copyright risk + GitHub Pages size concerns)
- Must run entirely in-browser via Web Audio API
- Must not impact 60fps game performance
- Deployed on GitHub Pages (static hosting only)
- TypeScript codebase

**Goal:** Sounds that are clearly recognizable as cat vocalizations, not just pitched beeps.

---

## 2. Current Implementation Analysis

### `src/audio/AudioEngine.ts` — Primitives Available

```typescript
// Current capabilities:
playTone(frequency: number, duration: number, type: OscillatorType): void
// → Single oscillator + ADSR gain envelope. Waveforms: sine, triangle, square, sawtooth.

playChord(frequencies: number[], duration: number, type: OscillatorType): void
// → Multiple simultaneous tones (calls playTone in a loop).

playNoise(duration: number, filterFreq: number): void
// → White noise buffer + lowpass BiquadFilter + exponential gain decay.
```

### `src/audio/SoundEffects.ts` — Current Cat Sound Attempts

```typescript
// "Mrrreow!" — currently just stepped triangle wave tones:
playLineClear(): void {
  const meowPattern = [
    { freq: 500, duration: 0.06 },
    { freq: 600, duration: 0.05 },
    { freq: 750, duration: 0.07 },
    { freq: 900, duration: 0.08 },
    { freq: 700, duration: 0.06 },
    { freq: 550, duration: 0.05 },
  ];
  // Plays each segment with 70% overlap via setTimeout
}
```

**Why this sounds robotic:**
1. A triangle wave has only odd harmonics with fast rolloff — no spectral richness
2. Stepped discrete frequencies instead of a smooth continuous glide
3. No vocal tract filtering (formants) — the spectral shape never changes
4. No vibrato
5. No mouth-opening formant transition

---

## 3. Cat Vocal Acoustics

### 3.1 Meow

From peer-reviewed bioacoustics studies (Schotz 2014, 2019; ScienceDirect 2023):

| Parameter | Value |
|-----------|-------|
| Fundamental frequency (F0) | 200–1200 Hz, mean ~500–700 Hz adult domestic cats |
| Duration | 0.15–3 seconds, mean ~0.42 seconds |
| Harmonic content | Strong harmonics at integer multiples of F0 |
| Vibrato | Natural ±3–5% F0 variation at 5–8 Hz |

**Pitch contour (most distinctive feature):**
- **Positive/begging contexts:** Rising F0 arc (e.g., 400 → 800 → 550 Hz)
- **Negative/stressed contexts:** Falling F0 arc (e.g., 700 → 400 Hz)
- The melodic shape is the primary cue humans use to perceive context/emotion in meows

**Mouth opening/closing effect:**
A cat meow is produced with the mouth opening and then gradually closing. This changes the vocal tract length mid-sound, causing formant frequencies (especially F1) to shift — this movement is acoustically the most "cat-like" feature and is absent from the current implementation.

**Why domestic cats sound different from wild cats:**
Domestic cats have higher mean F0 and higher mean formant frequencies than wild cats (feral/African wild cat), likely due to domestication selecting for sounds humans perceive as appealing.

### 3.2 Purr

From Current Biology (2023) and Purr research:

| Parameter | Value |
|-----------|-------|
| Fundamental frequency | 25–30 Hz (domestic cats), up to 50 Hz |
| Harmonics | Strong series at 25, 50, 75, 100, 125... Hz |
| Mechanism | Glottis alternately dilates/constricts at 25–30 Hz during both inhalation and exhalation |
| Character | Continuous rhythmic amplitude modulation — like a low rumble |

**Key insight:** The purr is essentially an amplitude-modulated noise/buzz at ~25–30 Hz. The 2023 Cell Biology paper confirms the larynx can produce this passively (no muscular nerve input), which explains why cats can purr continuously without effort.

### 3.3 Hiss

- Broadband noise emphasizing 3–8 kHz (sibilant/fricative range)
- Very fast attack (<5ms), medium exponential decay (100–200ms)
- The current `playNoise(0.15, 4000)` uses a lowpass filter — hiss actually needs a **highpass or bandpass** filter to get the "ssss" quality

### 3.4 Chirp / Trill

- Rapid frequency modulation of F0 (warbling between ~400–800 Hz)
- LFO rate: 10–15 Hz (very fast warble)
- Each unit: ~50–80ms duration
- Used when cats see birds — hunting context

### 3.5 What Makes Sound "Cat-Like" — The Key Identifiers

1. **F0 in 400–900 Hz range** (much higher than human voice)
2. **Smooth F0 glide** (not stepped) — rising or falling arc
3. **Formant movement** — F1 rises as mouth closes (500 Hz → 1500 Hz transition)
4. **Vibrato** — natural biological variation in F0
5. **Harmonic richness** — buzz-like source, not pure tone
6. **Decay envelope** — not abrupt cutoff

---

## 4. The Source-Filter Model

This is the established acoustic model for all mammalian vocalization, including cats:

```
[Glottal Source] → [Vocal Tract Filter] → [Output]
```

### 4.1 The Source

The **glottal source** is the sound produced by the vibrating vocal folds — a periodic buzz at the fundamental frequency F0. It is spectrally rich (lots of harmonics). The best waveform approximation is a **sawtooth wave** (has all integer harmonics: F0, 2F0, 3F0...).

A more natural approximation uses a **custom harmonic series** (via `createPeriodicWave`) with amplitudes that roll off as 1/n² (steeper than sawtooth's 1/n), giving a softer, less harsh buzz closer to a real glottal pulse:

```typescript
// Custom glottal-like waveform with 1/n² harmonic rolloff
const harmonics = 16;
const real = new Float32Array(harmonics + 1);
const imag = new Float32Array(harmonics + 1);
real[0] = 0; // no DC offset
for (let n = 1; n <= harmonics; n++) {
  imag[n] = 1 / (n * n); // 1/n² rolloff — softer than sawtooth (1/n)
}
const glottalWave = audioContext.createPeriodicWave(real, imag);
oscillator.setPeriodicWave(glottalWave);
```

### 4.2 The Vocal Tract Filter

The vocal tract (throat, mouth, lips) acts as a resonant tube. It has natural resonance peaks — **formants** — at frequencies F1, F2, F3... Each formant is modeled as a **bandpass filter**.

In Web Audio API: `BiquadFilterNode` with `type = 'bandpass'`.

**Key formant filter parameters:**
- `frequency`: center frequency of the resonance peak (in Hz)
- `Q`: sharpness of the peak. Higher Q = narrower, more resonant peak. Vocal formants typically use Q = 5–40.
- `gain`: relative amplitude of this formant

**Signal path:**
```
[source oscillator]
  → [lowpass pre-filter, ~6kHz]   ← removes harsh aliasing
  → [F1 bandpass filter] → [gain node]  ↘
  → [F2 bandpass filter] → [gain node]  → [sum] → [ADSR gain] → output
  → [F3 bandpass filter] → [gain node]  ↗
```

### 4.3 Why Cats Need Different Formant Values Than Humans

Formant frequencies scale inversely with vocal tract length. A domestic cat's vocal tract is roughly ¼ the length of an adult human's. This means cat formants are roughly 3–4× higher in frequency than the equivalent human vowel formants.

**Human vocal formants (from Hillenbrand 1994, as used in AppGeo Web Audio example):**

| Vowel | F1 (Hz) | F2 (Hz) | F3 (Hz) | Q1 | Q2 | Q3 |
|-------|---------|---------|---------|----|----|-----|
| "beat" (ee) | 270 | 2300 | 3000 | 8 | 35 | 40 |
| "par" (ah)  | 710 | 1100 | 2640 | 8 | 35 | 40 |
| "boot" (oo) | 300 | 870  | 2240 | 8 | 35 | 40 |

**Estimated cat formants (scaled ×3-4 from above, supported by "higher formant frequencies" noted in bioacoustics literature for domestic vs wild cats):**

| Cat Sound | F1 (Hz) | F2 (Hz) | F3 (Hz) | Q1 | Q2 | Q3 |
|-----------|---------|---------|---------|----|----|-----|
| Meow open (mouth open) | 500 | 2000 | 4500 | 8 | 15 | 25 |
| Meow close (mouth closing) | 1200 | 2200 | 4800 | 8 | 15 | 25 |
| Meow peak (fully open) | 700 | 1800 | 4200 | 8 | 15 | 25 |

Note: these are derived estimates, not measured values from published cat formant studies. Empirical tuning will be needed. The bioacoustics literature focuses on F0 and melodic contour rather than formant analysis, so no published cat F1/F2/F3 tables were found.

---

## 5. Synthesis Approaches — Ranked

### ✅ #1 — Formant Synthesis (Source-Filter) — RECOMMENDED

**Quality:** Clearly cat-like and recognizable
**Complexity:** Medium (~100–150 lines TypeScript)
**Performance:** Negligible (Web Audio runs off main thread)
**Precedent:** The AppGeo web-audio-examples repo (`formant.html`) implements this for human vowels using identical Web Audio API primitives

**How it works:**
- Sawtooth/custom oscillator (source) → lowpass → 3 parallel bandpass filters (vocal tract)
- Animate F0 with `linearRampToValueAtTime` for smooth pitch glide
- Animate F1 with `linearRampToValueAtTime` for mouth opening/closing
- Add vibrato via a secondary 6 Hz LFO oscillator modulating main oscillator frequency

**What it produces:** A buzzy, resonant sound with smooth pitch movement and formant transitions. Clearly distinguishable from the current beeping.

---

### ✅ #2 — `createPeriodicWave` (Better Glottal Source)

**Quality:** Marginal improvement on top of formant synthesis
**Complexity:** Low (5 extra lines)
**Use case:** Replace the built-in `sawtooth` type with a custom waveform having 1/n² harmonic rolloff — softer and more organic than raw sawtooth

Best used as a refinement on top of approach #1, not as a standalone approach.

---

### ⚠️ #3 — FM Synthesis

**Quality:** Somewhat cat-like for specific sounds (chirps, vocal fry)
**Complexity:** Medium
**Limitation:** FM creates sidebands that can approximate formant peaks, but the mapping between FM parameters (carrier/modulator ratio, modulation index) and perceived formant frequencies is indirect and hard to tune. Better for texture augmentation than primary synthesis.

**Useful for:** Chirp/trill sounds (fast frequency warble), adding breathiness/fry texture to the formant-synthesized meow.

---

### ⚠️ #4 — AudioWorklet with Klatt Synthesizer

**Quality:** Highest possible (professional-grade voice synthesis)
**Complexity:** Very high (200–500+ lines, separate JS file, async loading)
**Reference implementation:** [github.com/proteusvacuum/KlattSynth](https://github.com/proteusvacuum/KlattSynth)
**Verdict:** Overkill for game sound effects. The formant synthesis approach (#1) achieves ~80% of the quality at ~20% of the complexity. Not recommended unless #1 proves unsatisfying after tuning.

---

### ❌ #5 — Additive Synthesis (many oscillators)

Running 15–20 OscillatorNodes simultaneously for a single sound is harder to tune to specific formant patterns than using bandpass filters on a rich source. `createPeriodicWave` gives better harmonic control in a single node. Not recommended as primary approach.

---

### ❌ #6 — Karplus-Strong / Physical Modeling

Designed for string and plucked instrument synthesis. Not applicable to vocal sounds.

---

## 6. Web Audio API Capabilities

### Nodes Used in This Approach

| Node | Purpose | Cat Sound Use |
|------|---------|---------------|
| `OscillatorNode` | Periodic waveform generator | Glottal source (F0), vibrato LFO, purr rhythm |
| `BiquadFilterNode` (bandpass) | Resonant bandpass | Formant filters F1/F2/F3 |
| `BiquadFilterNode` (lowpass) | Anti-aliasing | Pre-filter before formants |
| `BiquadFilterNode` (highpass) | High-freq emphasis | Hiss synthesis |
| `GainNode` | Amplitude control | ADSR envelope, formant amplitudes, LFO depth |
| `AudioBufferSourceNode` | Noise playback | Purr breathiness, hiss base |
| `PeriodicWave` | Custom waveform | Glottal pulse approximation |

### AudioParam Automation (the key to smooth glides)

All AudioParam values can be scheduled with sub-millisecond precision:

```typescript
const now = ctx.currentTime;

// Smooth pitch glide from 400 → 800 → 550 Hz over 0.4 seconds
osc.frequency.setValueAtTime(400, now);
osc.frequency.linearRampToValueAtTime(800, now + 0.2);  // rising arc
osc.frequency.linearRampToValueAtTime(550, now + 0.4);  // falling resolution

// Formant F1 transition (mouth opening → closing)
f1Filter.frequency.setValueAtTime(500, now);            // mouth open
f1Filter.frequency.linearRampToValueAtTime(1200, now + 0.35); // mouth closing

// ADSR envelope
gainNode.gain.setValueAtTime(0, now);
gainNode.gain.linearRampToValueAtTime(0.7, now + 0.02);   // attack
gainNode.gain.linearRampToValueAtTime(0.5, now + 0.07);   // decay
gainNode.gain.setValueAtTime(0.5, now + 0.32);            // sustain
gainNode.gain.linearRampToValueAtTime(0, now + 0.45);     // release
```

### BiquadFilterNode as Formant Filter

```typescript
const formant = ctx.createBiquadFilter();
formant.type = 'bandpass';
formant.frequency.value = 700;  // center frequency Hz
formant.Q.value = 10;           // bandwidth: freq/Q = 70 Hz bandwidth
// Higher Q = narrower, more resonant peak
// Vocal formants: Q typically 5–40
```

### Performance: AudioWorklet vs Native Nodes

Web Audio API processing runs in a **dedicated audio thread**, separate from the JavaScript/rendering main thread. Even 20 nodes playing simultaneously will not impact 60fps game performance. The audio graph processes asynchronously at the hardware level.

---

## 7. Concrete Starting Parameters

These are empirically derived starting points for tuning. They are informed by acoustic scaling laws from the bioacoustics literature, not measured from actual cat recordings (which haven't been published with full formant tables).

### 7.1 Meow — "Happy" (Line Clear)

```
Source:
  Waveform:     sawtooth (or custom PeriodicWave with 1/n² rolloff)
  F0 start:     420 Hz
  F0 peak:      820 Hz   (at ~55% through duration)
  F0 end:       560 Hz
  Duration:     0.42 seconds

Vibrato:
  LFO rate:     6 Hz
  LFO depth:    ±2% of F0 (connect to oscillator.frequency via GainNode)

Formant Filters (3 × bandpass BiquadFilterNode):
  F1: start=500 Hz → end=1300 Hz  (Q=8,  gain=0.8)   ← mouth closing
  F2: start=1800 Hz → end=2100 Hz (Q=12, gain=0.45)  ← slight rise
  F3: 4000 Hz (fixed)             (Q=20, gain=0.12)  ← upper resonance

Pre-filter:
  Lowpass at 7000 Hz (Q=0.7)

ADSR Envelope:
  Attack:   0.02s
  Decay:    0.05s  (to 0.65 sustain level)
  Sustain:  0.65
  Release:  0.12s

Total duration: ~0.42s
```

### 7.2 Meow — "Sad" (Game Over)

```
Source:
  F0 start:     680 Hz
  F0 peak:      680 Hz   (flat → falling arc)
  F0 end:       320 Hz
  Duration:     0.55 seconds

Formant Filters:
  F1: 900 Hz → 600 Hz  (Q=8,  gain=0.8)   ← mouth opening (different arc)
  F2: 2000 Hz → 1700 Hz (Q=12, gain=0.4)
  F3: 3800 Hz (fixed)   (Q=20, gain=0.10)

Vibrato: reduced — 4 Hz, ±1% depth

ADSR:
  Attack:  0.03s
  Decay:   0.08s
  Sustain: 0.55
  Release: 0.20s  (longer, droopy release)
```

### 7.3 Purr (Idle / Background)

```
METHOD A — Noise AM (simplest, most convincing for texture):
  White noise buffer
  → BiquadFilter lowpass at 300 Hz
  → GainNode (amplitude LFO at 28 Hz, depth 0.85, bias 0.15)
  Result: rhythmic pulsing noise at 28 Hz

METHOD B — Low sawtooth (tonal core):
  OscillatorNode: type=sawtooth, frequency=28 Hz
  → BiquadFilter lowpass at 200 Hz
  → GainNode (ADSR: slow attack 0.3s, long sustain, slow release 0.5s)
  Result: low buzzy rumble with harmonics at 56, 84, 112 Hz

RECOMMENDED: Layer both methods (60% Method B + 40% Method A)
for a purr that has both tonal buzz and breath texture.

Total nodes: 8
```

### 7.4 Hiss (Bomb Explosion / Angry)

```
White noise buffer (same as current playNoise())
→ BiquadFilter HIGHPASS at 3000 Hz  ← CHANGE from current lowpass
   (Q=0.7 — broad, not resonant)
→ BiquadFilter peaking at 5500 Hz, gain=+6dB  ← optional emphasis
→ GainNode:
   Attack:  0.004s (very fast — hiss is immediate)
   Decay:   0.12s (exponential)
   Release: 0.05s

Duration: ~0.15s (same as current)
```

### 7.5 Chirp / Trill (Cascade Bonus)

```
OscillatorNode: type=sawtooth, base frequency=550 Hz
→ LFO OscillatorNode at 14 Hz → GainNode (depth=200 Hz) → osc.frequency
  (creates rapid frequency warble between 350–750 Hz)

3 repetitions, each 70ms, gap 20ms between, slightly rising base pitch

No formant filters (too short to benefit)
ADSR per chirp: attack 0.005s, decay 0.06s, no sustain
```

---

## 8. Node Graph Designs

### 8.1 Meow Node Graph

```
                    [LFO Osc: 6Hz sine]
                           |
                    [LFO Gain: depth]
                           |
[Main Osc: sawtooth] ←(frequency param)
         |
[LowPass Filter: 7kHz]
         |
    ┌────┴─────────────┬────────────────┐
    ↓                  ↓                ↓
[BP Filter F1]   [BP Filter F2]   [BP Filter F3]
[freq: 500→1300] [freq: 1800→2100] [freq: 4000]
[Q: 8]           [Q: 12]           [Q: 20]
    |                  |                |
[Gain: 0.8]      [Gain: 0.45]     [Gain: 0.12]
    └────┬─────────────┴────────────────┘
         ↓
  [ADSR GainNode]
         ↓
  [AudioEngine.masterGain]
         ↓
  [AudioContext.destination]

Node count: 11
```

### 8.2 Purr Node Graph (Layered)

```
[Osc: sawtooth 28Hz] ──→ [LowPass: 200Hz] ──→ [Gain: 0.6] ──┐
                                                               ↓
[Noise Buffer] ──→ [LowPass: 300Hz] ──→ [AM GainNode] ──→ [Mix Gain] ──→ [Master]
                                              ↑
                                     [LFO: sine 28Hz]
                                     → [LFO Gain: 0.85]

Node count: 8
```

### 8.3 Hiss Node Graph

```
[Noise Buffer] → [HighPass: 3kHz] → [Peaking: 5.5kHz +6dB] → [ADSR Gain] → [Master]

Node count: 4
```

---

## 9. Full TypeScript Code Examples

### 9.1 `CatVoiceSynth` Class (Proposed New File: `src/audio/CatVoiceSynth.ts`)

```typescript
/**
 * CatVoiceSynth — Formant synthesis for cat-like vocal sounds
 *
 * Uses Source-Filter model:
 *   Glottal source (sawtooth oscillator)
 *   → Pre-filter (lowpass anti-alias)
 *   → Vocal tract (3 parallel bandpass formant filters)
 *   → ADSR envelope
 *
 * All synthesis is procedural — no audio files required.
 */

interface MeowParams {
  f0Start: number;       // Starting fundamental frequency (Hz)
  f0Peak: number;        // Peak fundamental frequency (Hz)
  f0End: number;         // Ending fundamental frequency (Hz)
  duration: number;      // Total duration (seconds)
  peakAt: number;        // Fraction of duration where peak occurs (0–1)
  f1Start: number;       // Formant 1 start frequency (Hz) — mouth opening
  f1End: number;         // Formant 1 end frequency (Hz) — mouth closing
  f2: number;            // Formant 2 frequency (Hz)
  f3: number;            // Formant 3 frequency (Hz)
  vibratoRate: number;   // Vibrato LFO rate (Hz)
  vibratoDepth: number;  // Vibrato depth as fraction of F0 (0.0–1.0)
  gain: number;          // Output gain (0.0–1.0)
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
   * Synthesize a meow sound using source-filter (formant) model.
   */
  meow(params: MeowParams): void {
    const ctx = this._ctx;
    const now = ctx.currentTime;
    const {
      f0Start, f0Peak, f0End, duration, peakAt,
      f1Start, f1End, f2, f3,
      vibratoRate, vibratoDepth, gain,
    } = params;

    // ─── Source: Glottal oscillator ──────────────────────────────
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(f0Start, now);
    osc.frequency.linearRampToValueAtTime(f0Peak, now + duration * peakAt);
    osc.frequency.linearRampToValueAtTime(f0End, now + duration);

    // ─── Vibrato LFO ─────────────────────────────────────────────
    const vibratoLfo = ctx.createOscillator();
    const vibratoGain = ctx.createGain();
    vibratoLfo.type = 'sine';
    vibratoLfo.frequency.value = vibratoRate;
    vibratoGain.gain.value = f0Start * vibratoDepth;
    vibratoLfo.connect(vibratoGain);
    vibratoGain.connect(osc.frequency);

    // ─── Pre-filter (anti-alias) ──────────────────────────────────
    const preFilter = ctx.createBiquadFilter();
    preFilter.type = 'lowpass';
    preFilter.frequency.value = 7000;
    preFilter.Q.value = 0.7;
    osc.connect(preFilter);

    // ─── Formant filters (vocal tract model) ─────────────────────
    const formants = [
      { freqStart: f1Start, freqEnd: f1End, q: 8,  gainVal: 0.80 },
      { freqStart: f2,      freqEnd: f2,    q: 12, gainVal: 0.45 },
      { freqStart: f3,      freqEnd: f3,    q: 20, gainVal: 0.12 },
    ];

    // ─── Output ADSR envelope ─────────────────────────────────────
    const adsrGain = ctx.createGain();
    adsrGain.gain.setValueAtTime(0, now);
    adsrGain.gain.linearRampToValueAtTime(gain, now + 0.02);        // attack
    adsrGain.gain.linearRampToValueAtTime(gain * 0.85, now + 0.07); // decay
    adsrGain.gain.setValueAtTime(gain * 0.85, now + duration - 0.12);
    adsrGain.gain.linearRampToValueAtTime(0, now + duration);        // release

    // ─── Connect formant filter bank ──────────────────────────────
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

    // ─── Start / stop ─────────────────────────────────────────────
    osc.start(now);
    vibratoLfo.start(now);
    osc.stop(now + duration + 0.05);
    vibratoLfo.stop(now + duration + 0.05);
  }

  /**
   * Synthesize a purr — layered tonal + noise approach.
   */
  purr(duration: number = 2.0): void {
    const ctx = this._ctx;
    const now = ctx.currentTime;

    // ─── Layer 1: Low sawtooth (tonal core at 28 Hz) ──────────────
    const purrOsc = ctx.createOscillator();
    purrOsc.type = 'sawtooth';
    purrOsc.frequency.value = 28;

    const purrLowpass = ctx.createBiquadFilter();
    purrLowpass.type = 'lowpass';
    purrLowpass.frequency.value = 200;

    const purrGain = ctx.createGain();
    purrGain.gain.setValueAtTime(0, now);
    purrGain.gain.linearRampToValueAtTime(0.35, now + 0.3);           // slow fade in
    purrGain.gain.setValueAtTime(0.35, now + duration - 0.4);
    purrGain.gain.linearRampToValueAtTime(0, now + duration);          // slow fade out

    purrOsc.connect(purrLowpass);
    purrLowpass.connect(purrGain);
    purrGain.connect(this._masterGain);

    // ─── Layer 2: Noise with 28 Hz amplitude modulation ───────────
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

    // AM modulator at 28 Hz (simulates glottal open/close rhythm)
    const amLfo = ctx.createOscillator();
    amLfo.type = 'sine';
    amLfo.frequency.value = 28;

    const amDepthGain = ctx.createGain();
    amDepthGain.gain.value = 0.42;  // depth (half of AM range)

    const amBiasGain = ctx.createGain();
    amBiasGain.gain.value = 0.15;   // baseline (never fully silent)

    amLfo.connect(amDepthGain);
    amDepthGain.connect(amBiasGain.gain);  // modulate the bias gain's gain param

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
   * Synthesize a hiss — highpass-filtered noise (sibilant character).
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

    // Highpass for sibilant "sss" character (unlike current lowpass)
    const hipass = ctx.createBiquadFilter();
    hipass.type = 'highpass';
    hipass.frequency.value = 3000;
    hipass.Q.value = 0.7;

    // Optional peak emphasis around 5.5kHz
    const peak = ctx.createBiquadFilter();
    peak.type = 'peaking';
    peak.frequency.value = 5500;
    peak.Q.value = 1.5;
    peak.gain.value = 6; // +6dB

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
   * Synthesize a chirp/trill — rapid FM warble.
   */
  chirp(count: number = 3): void {
    const ctx = this._ctx;
    const now = ctx.currentTime;
    const chirpDuration = 0.07;
    const chirpGap = 0.025;

    for (let i = 0; i < count; i++) {
      const t = now + i * (chirpDuration + chirpGap);
      const baseFreq = 500 + i * 80; // slightly rising pitch with each chirp

      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = baseFreq;

      // Fast warble LFO
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.value = 14;
      lfoGain.gain.value = 180; // ±180 Hz warble depth
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
```

### 9.2 Updated `SoundEffects.ts` Integration Pattern

```typescript
import { AudioEngine } from './AudioEngine';
import { CatVoiceSynth, MEOW_HAPPY, MEOW_SAD, MEOW_EXCITED } from './CatVoiceSynth';

export class SoundEffects {
  private audioEngine: AudioEngine;
  private catVoice: CatVoiceSynth | null = null;

  constructor(audioEngine: AudioEngine) {
    this.audioEngine = audioEngine;
  }

  // Call after AudioEngine.init()
  initCatVoice(ctx: AudioContext, masterGain: GainNode): void {
    this.catVoice = new CatVoiceSynth(ctx, masterGain);
  }

  playLineClear(): void {
    this.catVoice?.meow(MEOW_HAPPY);
  }

  playCascade(cascadeLevel: number): void {
    const excited = {
      ...MEOW_EXCITED,
      f0Peak: MEOW_EXCITED.f0Peak + cascadeLevel * 100,
      duration: 0.25,
    };
    this.catVoice?.meow(excited);
    // Chirp after for extra excitement
    setTimeout(() => this.catVoice?.chirp(cascadeLevel + 1), 120);
  }

  playGameOver(): void {
    this.catVoice?.meow(MEOW_SAD);
  }

  playBombExplosion(): void {
    this.catVoice?.hiss(0.18);
    // Optionally add a distressed meow after the hiss
    setTimeout(() => {
      this.catVoice?.meow({
        ...MEOW_SAD,
        f0Start: 600, f0Peak: 550, f0End: 300,
        duration: 0.28,
      });
    }, 80);
  }

  // Piece placed — keep existing playNoise approach, it's fine for a thud
  playPiecePlaced(): void {
    this.audioEngine.playNoise(0.08, 300);
  }
}
```

### 9.3 Custom Glottal Waveform (Optional Refinement)

```typescript
/**
 * Creates a custom oscillator waveform approximating a glottal pulse
 * (vocal fold vibration). Uses 1/n² harmonic rolloff for softer buzz
 * compared to built-in sawtooth (1/n rolloff).
 */
function createGlottalWave(ctx: AudioContext): PeriodicWave {
  const harmonics = 20;
  const real = new Float32Array(harmonics + 1);
  const imag = new Float32Array(harmonics + 1);

  real[0] = 0; // No DC offset
  for (let n = 1; n <= harmonics; n++) {
    // 1/n² rolloff: softer than sawtooth (1/n), more voice-like
    imag[n] = 1 / (n * n);
  }

  return ctx.createPeriodicWave(real, imag, { disableNormalization: false });
}

// Usage inside CatVoiceSynth.meow():
// Replace: osc.type = 'sawtooth';
// With:
const glottalWave = createGlottalWave(ctx);
osc.setPeriodicWave(glottalWave);
```

---

## 10. Performance Analysis

| Sound | Node Count | Duration | Nodes Active Simultaneously | Thread |
|-------|-----------|----------|----------------------------|--------|
| Meow  | 11        | ~0.5s    | 11 (auto-GC after stop)    | Audio  |
| Purr  | 8         | 1–3s     | 8 continuous               | Audio  |
| Hiss  | 4         | ~0.15s   | 4 (auto-GC after stop)     | Audio  |
| Chirp | 5×3=15    | ~0.3s    | 5 per chirp                | Audio  |

**Web Audio API guarantees:** All audio graph processing runs in the browser's dedicated audio rendering thread, entirely separate from the JavaScript/canvas main thread. Even 50 simultaneous nodes would not cause frame drops.

**Memory:** Each completed sound's nodes are automatically garbage-collected after `stop()` is called. No manual cleanup required.

**Current implementation overhead:** `playNoise()` creates a new `AudioBuffer` every call (CPU cost to fill random data). For performance-sensitive paths, the noise buffer could be pre-generated once and reused.

---

## 11. Quality Expectations

| Quality Level | Description | Achievable? |
|---------------|-------------|-------------|
| Indistinguishable from real cat | Requires actual cat recordings or ML model | ❌ Not with synthesis alone |
| Clearly cat-like | Listener immediately thinks "cat" | ✅ Yes, with formant synthesis + vibrato + pitch glide |
| Somewhat cat-like | Has cat-like character but obviously synthetic | ✅ Minimum viable with just pitch glide improvement |
| Better than current | Less robotic, more organic | ✅ Achievable with just vibrato + smooth glide (no formants) |

**Honest assessment:** The formant synthesis approach should produce sounds in the "clearly cat-like" category — much better than current robotic beeping. The listener will know it's synthesized, but the sound will evoke cat vocalizations rather than an 8-bit computer. For a cozy puzzle game aesthetic, this quality level is appropriate and probably preferable to hyper-realistic cat sounds.

---

## 12. Risks and Limitations

| Risk | Detail | Mitigation |
|------|--------|-----------|
| Formant parameters need tuning | No published cat F1/F2/F3 tables found — estimated from scaling laws | Start with provided values, tune by ear iteratively |
| Browser AudioContext initialization | Must be triggered by user interaction (browser policy) | Already handled in existing AudioEngine |
| Safari quirks | Safari has historically had AudioWorklet delays; not relevant here since no AudioWorklet used | N/A |
| Purr noise buffer cost | Creating a 2-second noise buffer on every purr call allocates ~350KB | Pre-generate once and reuse |
| Meow sounds different per device | Speaker frequency response varies (phone vs desktop) | Test on multiple devices; adjust filter Q values if needed |
| "Uncanny valley" risk | Halfway-convincing cat sounds can be more distracting than stylized beeps | Consider: stylized cat-like sounds may be more appropriate than near-realistic synthesis |

---

## 13. Recommendation

**Implement `CatVoiceSynth.ts` using the formant synthesis approach (source-filter model).**

Rationale:
1. Directly addresses the identified problem (robotic sound character)
2. Uses only existing Web Audio API primitives — no new dependencies
3. Zero runtime performance impact on game (audio runs off main thread)
4. No files required — fully procedural
5. Well-understood approach with a working reference implementation (AppGeo formant.html)
6. ~100–150 lines of TypeScript total
7. Modular: `CatVoiceSynth` is a self-contained class, `SoundEffects.ts` changes are minimal
8. Tunable: all parameters are named constants (`MEOW_HAPPY`, `MEOW_SAD`, etc.) and easy to adjust

**Implementation order:**
1. Create `src/audio/CatVoiceSynth.ts` with `meow()`, `purr()`, `hiss()`, `chirp()` methods
2. Update `AudioEngine.ts` to expose `context` and `masterGain` for `CatVoiceSynth` to connect to
3. Update `SoundEffects.ts` to instantiate and delegate to `CatVoiceSynth`
4. Test and tune formant parameters by ear (F1/F2/F3 start/end values are the primary tuning knobs)
5. (Optional) Replace sawtooth with `createPeriodicWave` glottal approximation for softer timbre

**When ready:** use the `orchestrator` or `implementer` agent to pick up the implementation.

---

## 14. Sources

- [Context effects on cat meow F0 and duration (ScienceDirect, 2023)](https://www.sciencedirect.com/science/article/pii/S0168159123003180)
- [Duration and F0 values for cat meows in two contexts (ResearchGate)](https://www.researchgate.net/figure/Duration-sec-and-F0-Hz-values-for-the-12-meows-in-two-contexts-Food-Vet-by-two_tbl1_263194103)
- [Melody Matters: Cat Meow Acoustics in Six Contexts (PeerJ Preprints)](https://peerj.com/preprints/27926/)
- [Domestic cat larynges produce purring without neural input (Cell Biology, 2023)](https://www.cell.com/current-biology/fulltext/S0960-9822(23)01230-7)
- [Purr — Wikipedia (frequency ranges)](https://en.wikipedia.org/wiki/Purr)
- [Formant Synthesis — Sound On Sound (technique overview)](https://www.soundonsound.com/techniques/formant-synthesis)
- [AppGeo Web Audio Formant Example — GitHub (working code reference)](https://github.com/AppGeo/web-audio-examples/blob/master/formant.html)
- [BiquadFilterNode — MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode)
- [createPeriodicWave — MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createPeriodicWave)
- [Amplitude Modulation Synthesis — IRCAM WebAudio Tutorials](https://ircam-ismm.github.io/webaudio-tutorials/basics/amplitude-modulation-synthesis.html)
- [KlattSynth — Klatt formant synthesizer implementation (GitHub)](https://github.com/proteusvacuum/KlattSynth)
- [Vowel Formant Frequency Discrimination in Cats — PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC3627498/)
- [Bioacoustics — Spectrographic analysis of cat Felis catus vocalisations](https://www.bioacoustics.info/article/spectrographic-analysis-cat-felis-catus-vocalisations-during-early-months-life-abstract)
- [Purrli — Custom cat purr sound engine (reference implementation)](https://purrli.com/)
- [Meow Synth with resonant filter — Gearspace discussion](https://gearspace.com/board/electronic-music-instruments-and-electronic-music-production/1379907-whats-quot-meow-sound.html)
- [AudioWorklet — MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet)
- [FM Synthesis in Browser with Rust/WASM — Casey Primozic](https://cprimozic.net/blog/fm-synth-rust-wasm-simd/)
