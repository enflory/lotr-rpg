import { describe, it, expect } from 'vitest';
import { ZONES } from '../src/data/zones/index.js';
import { resolveDialogue } from '../src/data/dialogues.js';
const active = (f) =>
  ZONES.tomhouse.interactions.filter((p) => !p.when || p.when(f)).map((p) => p.dialogue);
describe('Tom’s house guides one continuous stay', () => {
  it('offers exactly one cue through both nights and then removes every completed cue', () => {
    const f = {};
    for (const key of [
      'house_welcome',
      'house_supper',
      'house_bed',
      'house_stories',
      'house_ring',
      'house_bed',
      'house_farewell',
    ]) {
      expect(active(f)).toEqual([key]);
      const d = resolveDialogue(key, f);
      for (const flag of [].concat(d.set ?? [])) f[flag] = true;
    }
    expect(active(f)).toEqual([]);
    expect(f.learnedSong).toBe(true);
  });
  it('recovers an old Ring-complete save at the second night without asking for the Ring again', () => {
    const f = {
      houseWelcomed: true,
      houseSupper: true,
      houseNightOne: true,
      houseStories: true,
      houseRing: true,
    };
    expect(active(f)).toEqual(['house_bed']);
    expect(resolveDialogue('house_stories', f).lines.join(' ')).not.toMatch(
      /something to show|still.*Ring/,
    );
  });
  it('a completed old stay exposes no obsolete supper or Ring cues', () => {
    expect(active({ learnedSong: true })).toEqual([]);
    expect(active({ houseRested: true })).toEqual(['house_farewell']);
  });
});
