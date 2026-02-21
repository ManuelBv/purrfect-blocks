# Cat Voice Synth — Implementation Progress

**Date started:** 2026-02-21
**Status:** In Progress — TDD cycles

---

## Goal

Replace the current robotic oscillator-based cat sounds with formant synthesis
(source-filter model) using only the Web Audio API — no audio files.

Reference: `docs/research-cat-vocal-synthesis.md`

---

## Decisions

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | Use formant synthesis (source-filter model) as primary approach | Best quality-to-complexity ratio per research; ~100–150 lines TS |
| 2 | New cat sound methods are **separate** from existing SoundEffects methods | We need to hear and compare before replacing; old sounds stay until approved |
| 3 | Skip `purr()` unit tests for now | Most complex, least critical to verify mechanically; test by ear |
| 4 | Test behaviors: preset sanity, oscillator start/stop, chirp count, hiss highpass, SoundEffects integration | Verified behaviors that survive internal refactors |
| 5 | Mock AudioContext in tests (necessary boundary mock) | Web Audio API not available in Node.js/Vitest |
| 6 | New file: `src/audio/CatVoiceSynth.ts` | Self-contained class, minimal changes to existing files |
| 7 | Expose `getContext()` / `getMasterGain()` on AudioEngine | CatVoiceSynth needs these to connect to the audio graph |
| 8 | New dev panel "Cat Sounds (Formant)" in dev-tools-area | Separate from existing audio test buttons; for A/B comparison |

---

## Behaviors Under Test

| # | Behavior | Status |
|---|----------|--------|
| 1 | `MEOW_HAPPY.f0Peak` > `MEOW_SAD.f0Peak` (happy meow is higher pitched) | ✅ Done |
| 2 | `MEOW_EXCITED.duration` < `MEOW_SAD.duration` (excited is shorter) | ✅ Done |
| 3 | `meow()` creates an oscillator and starts/stops it | ✅ Done |
| 4 | `meow()` creates 3 bandpass formant filters (vocal tract modeled) | ✅ Done |
| 5 | `chirp(3)` creates 3× more oscillators than `chirp(1)` | ✅ Done |
| 6 | `hiss()` uses a highpass filter (not lowpass like current) | ✅ Done |
| 7 | `SoundEffects.playCatMeowHappy()` is a no-op when `initCatVoice()` not called | ✅ Done |
| 8 | `SoundEffects.playCatMeowHappy()` calls `meow` after `initCatVoice()` | ✅ Done |

---

## Files Changed

| File | Change | Status |
|------|--------|--------|
| `src/audio/CatVoiceSynth.ts` | New file — formant synthesizer | ✅ Done |
| `src/audio/AudioEngine.ts` | Add `getContext()`, `getMasterGain()` getters | ✅ Done |
| `src/audio/SoundEffects.ts` | Add `initCatVoice()` + 6 new cat methods | ✅ Done |
| `index.html` | Add "Cat Sounds (Formant)" dev panel | ✅ Done |
| `src/game/Game.ts` | Wire new buttons + call `initCatVoice()` | ✅ Done |
| `tests/unit/CatVoiceSynth.test.ts` | 6 behavioral tests | ✅ Done |
| `tests/unit/CatVoiceSynthSoundEffects.test.ts` | 2 SoundEffects integration tests | ✅ Done |

---

## TDD Log

_Each cycle: RED (test written, fails) → GREEN (minimal code, passes)_

### Cycle 1–2: Preset sanity (no mocks needed)
- RED: `MEOW_HAPPY.f0Peak > MEOW_SAD.f0Peak` and `MEOW_EXCITED.duration < MEOW_SAD.duration` fail (file doesn't exist)
- GREEN: Created `CatVoiceSynth.ts` with `MEOW_HAPPY` (f0Peak=820), `MEOW_SAD` (f0Peak=680), `MEOW_EXCITED` (duration=0.30), `MEOW_SAD` (duration=0.55)

### Cycle 3–4: meow() creates audio graph
- RED: `meow()` oscillator start/stop + 3 bandpass filters — fail (class not implemented)
- GREEN: Implemented `meow()` with sawtooth osc + vibrato LFO + lowpass pre-filter + 3× bandpass formant filters + ADSR

### Cycle 5: chirp(count) respects count
- RED: `chirp(3)` creates 3× oscillators as `chirp(1)` — fail
- GREEN: Implemented `chirp()` loop; each iteration creates 1 main osc + 1 LFO = 2 oscillators per chirp

### Cycle 6: hiss() uses highpass
- RED: `hiss()` has at least one highpass filter — fail
- GREEN: Implemented `hiss()` with highpass at 3kHz + peaking at 5.5kHz (research-backed fix from current lowpass)

### Cycle 7–8: SoundEffects integration
- RED: `playCatMeowHappy()` methods don't exist — fail
- GREEN: Added `initCatVoice()`, `playCatMeowHappy/Sad/Excited()`, `playCatPurr/Hiss/Chirp()` to SoundEffects

**Final state:** 327 tests passing, TypeScript compiles cleanly, dev panel added to UI

---

## Next Steps (awaiting user feedback)

- Run `npm run dev`, enable Dev Mode in settings, test each cat sound button
- Compare formant sounds vs existing sounds (A/B via dev buttons)
- Decide which new sounds to use in-game (replace existing `playLineClear`, `playGameOver`, etc.)
- Optional: replace sawtooth with `createPeriodicWave` glottal waveform for softer timbre (§9.3 in research)
- Optional: tune formant parameters (F1/F2/F3) by ear after hearing initial results
