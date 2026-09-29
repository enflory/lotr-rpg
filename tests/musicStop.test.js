import { afterEach, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

it('silences already scheduled music immediately, without silencing speech effects', async () => {
  vi.resetModules();
  vi.useFakeTimers();
  const gains = [],
    oscillators = [];
  const parameter = () => ({ value: 0, setValueAtTime() {}, linearRampToValueAtTime() {} });
  class AudioContext {
    currentTime = 0;
    state = 'running';
    destination = {};
    createGain() {
      const node = { gain: parameter(), connect: vi.fn(), disconnect: vi.fn() };
      gains.push(node);
      return node;
    }
    createOscillator() {
      const node = { frequency: parameter(), connect: vi.fn(), start: vi.fn(), stop: vi.fn() };
      oscillators.push(node);
      return node;
    }
  }
  vi.stubGlobal('window', { AudioContext });
  const { initAudio, playMusic, stopMusic, sfx } = await import('../src/audio/sound.js');
  initAudio();
  const master = gains[0],
    originalMusic = gains[1];
  playMusic('pony');
  // The scheduler has created notes that start well into the next few seconds.
  expect(oscillators.some((node) => node.start.mock.calls[0][0] > 1)).toBe(true);
  // playMusic may create a new bus when switching songs.
  const music = gains.findLast((node) =>
    node.connect.mock.calls.some(([target]) => target === master),
  );
  stopMusic();
  expect(music.disconnect).toHaveBeenCalled();
  expect(master.disconnect).not.toHaveBeenCalled();
  sfx.blip();
  expect(gains.at(-1).connect).toHaveBeenCalledWith(master);
  playMusic('breewatch');
  const nextMusic = gains.findLast((node) =>
    node.connect.mock.calls.some(([target]) => target === master && node !== gains.at(-1)),
  );
  expect(nextMusic).not.toBe(music);
  expect(originalMusic.gain.value).toBe(0.32);
  stopMusic();
});
