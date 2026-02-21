// Unit tests for CatVoiceSynth — formant synthesis for cat vocal sounds

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CatVoiceSynth, MEOW_HAPPY, MEOW_SAD, MEOW_EXCITED } from '../../src/audio/CatVoiceSynth';

// ─── Mock AudioContext ─────────────────────────────────────────────────────────
// Web Audio API is not available in Node/Vitest — we mock the external boundary.

function makeAudioParam(initial = 0) {
  return {
    value: initial,
    setValueAtTime: vi.fn().mockReturnThis(),
    linearRampToValueAtTime: vi.fn().mockReturnThis(),
    exponentialRampToValueAtTime: vi.fn().mockReturnThis(),
  };
}

function createMockAudioContext() {
  const oscillators: ReturnType<typeof makeMockOscillator>[] = [];
  const filters: ReturnType<typeof makeMockFilter>[] = [];

  function makeMockOscillator() {
    return {
      type: 'sine' as OscillatorType,
      frequency: makeAudioParam(440),
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
  }

  function makeMockFilter() {
    return {
      type: 'lowpass' as BiquadFilterType,
      frequency: makeAudioParam(350),
      Q: makeAudioParam(1),
      gain: makeAudioParam(0),
      connect: vi.fn(),
    };
  }

  return {
    currentTime: 0,
    sampleRate: 44100,
    createOscillator: vi.fn(() => {
      const osc = makeMockOscillator();
      oscillators.push(osc);
      return osc;
    }),
    createBiquadFilter: vi.fn(() => {
      const filter = makeMockFilter();
      filters.push(filter);
      return filter;
    }),
    createGain: vi.fn(() => ({
      gain: makeAudioParam(1),
      connect: vi.fn(),
    })),
    createBuffer: vi.fn((_ch: number, length: number) => ({
      getChannelData: vi.fn(() => new Float32Array(length)),
    })),
    createBufferSource: vi.fn(() => ({
      buffer: null as unknown,
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    })),
    // Test inspection helpers
    _oscillators: oscillators,
    _filters: filters,
  };
}

type MockCtx = ReturnType<typeof createMockAudioContext>;
type MockGain = { gain: ReturnType<typeof makeAudioParam>; connect: ReturnType<typeof vi.fn> };

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('MeowParams presets', () => {
  it('MEOW_HAPPY has a higher F0 peak than MEOW_SAD', () => {
    expect(MEOW_HAPPY.f0Peak).toBeGreaterThan(MEOW_SAD.f0Peak);
  });

  it('MEOW_EXCITED has a shorter duration than MEOW_SAD', () => {
    expect(MEOW_EXCITED.duration).toBeLessThan(MEOW_SAD.duration);
  });
});

describe('CatVoiceSynth.meow()', () => {
  let ctx: MockCtx;
  let masterGain: MockGain;
  let synth: CatVoiceSynth;

  beforeEach(() => {
    ctx = createMockAudioContext();
    masterGain = { gain: makeAudioParam(1), connect: vi.fn() };
    synth = new CatVoiceSynth(ctx as unknown as AudioContext, masterGain as unknown as GainNode);
  });

  it('starts and stops an oscillator when called', () => {
    synth.meow(MEOW_HAPPY);
    const osc = ctx._oscillators[0];
    expect(osc.start).toHaveBeenCalledOnce();
    expect(osc.stop).toHaveBeenCalledOnce();
  });

  it('creates exactly 3 bandpass formant filters', () => {
    synth.meow(MEOW_HAPPY);
    const bandpassFilters = ctx._filters.filter(f => f.type === 'bandpass');
    expect(bandpassFilters).toHaveLength(3);
  });
});

describe('CatVoiceSynth.chirp()', () => {
  let ctx: MockCtx;
  let masterGain: MockGain;
  let synth: CatVoiceSynth;

  beforeEach(() => {
    ctx = createMockAudioContext();
    masterGain = { gain: makeAudioParam(1), connect: vi.fn() };
    synth = new CatVoiceSynth(ctx as unknown as AudioContext, masterGain as unknown as GainNode);
  });

  it('chirp(3) creates 3x more oscillators than chirp(1)', () => {
    const ctx1 = createMockAudioContext();
    const synth1 = new CatVoiceSynth(ctx1 as unknown as AudioContext, masterGain as unknown as GainNode);
    synth1.chirp(1);
    const countFor1 = ctx1._oscillators.length;

    synth.chirp(3);
    const countFor3 = ctx._oscillators.length;

    expect(countFor3).toBe(countFor1 * 3);
  });
});

describe('CatVoiceSynth.hiss()', () => {
  let ctx: MockCtx;
  let masterGain: MockGain;
  let synth: CatVoiceSynth;

  beforeEach(() => {
    ctx = createMockAudioContext();
    masterGain = { gain: makeAudioParam(1), connect: vi.fn() };
    synth = new CatVoiceSynth(ctx as unknown as AudioContext, masterGain as unknown as GainNode);
  });

  it('uses a highpass filter (sibilant hiss, not muffled lowpass)', () => {
    synth.hiss();
    const highpassFilters = ctx._filters.filter(f => f.type === 'highpass');
    expect(highpassFilters.length).toBeGreaterThanOrEqual(1);
  });
});
