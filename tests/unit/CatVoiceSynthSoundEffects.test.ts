// Integration tests: SoundEffects ↔ CatVoiceSynth

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SoundEffects } from '../../src/audio/SoundEffects';
import { AudioEngine } from '../../src/audio/AudioEngine';

// Minimal mock AudioEngine that exposes a fake context + masterGain
function createMockAudioEngine() {
  const mockGain = {
    gain: { value: 1, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
    connect: vi.fn(),
  };

  const oscillators: unknown[] = [];
  const mockCtx = {
    currentTime: 0,
    sampleRate: 44100,
    createOscillator: vi.fn(() => {
      const osc = {
        type: 'sine',
        frequency: {
          value: 440,
          setValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn(),
        },
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      };
      oscillators.push(osc);
      return osc;
    }),
    createBiquadFilter: vi.fn(() => ({
      type: 'lowpass',
      frequency: { value: 350, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
      Q: { value: 1 },
      gain: { value: 0 },
      connect: vi.fn(),
    })),
    createGain: vi.fn(() => ({
      gain: { value: 1, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
    })),
    createBuffer: vi.fn((_ch: number, length: number) => ({
      getChannelData: vi.fn(() => new Float32Array(length)),
    })),
    createBufferSource: vi.fn(() => ({
      buffer: null,
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    })),
    _oscillators: oscillators,
  };

  const engine = {
    getContext: vi.fn(() => mockCtx),
    getMasterGain: vi.fn(() => mockGain),
    playNoise: vi.fn(),
    playTone: vi.fn(),
    playChord: vi.fn(),
    isMuted: vi.fn(() => false),
    _ctx: mockCtx,
  } as unknown as AudioEngine;

  return { engine, mockCtx };
}

describe('SoundEffects cat voice integration', () => {
  let soundEffects: SoundEffects;
  let mockCtx: ReturnType<typeof createMockAudioEngine>['mockCtx'];

  beforeEach(() => {
    const { engine, mockCtx: ctx } = createMockAudioEngine();
    soundEffects = new SoundEffects(engine);
    mockCtx = ctx;
  });

  it('playCatMeowHappy() does nothing (no throw) when initCatVoice() not called', () => {
    expect(() => soundEffects.playCatMeowHappy()).not.toThrow();
    // No oscillators should have been created
    expect(mockCtx.createOscillator).not.toHaveBeenCalled();
  });

  it('playCatMeowHappy() creates oscillators after initCatVoice() is called', () => {
    soundEffects.initCatVoice();
    soundEffects.playCatMeowHappy();
    expect(mockCtx.createOscillator).toHaveBeenCalled();
  });
});
