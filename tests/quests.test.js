import { describe, it, expect } from 'vitest';
import { QUESTS } from '../src/data/quests.js';

const none = () => 0;
const lots = () => 99;
const allFlags = new Proxy({}, { get: () => true });

describe('quest registry', () => {
  it('every quest has key/title/hint and total-function predicates', () => {
    const keys = QUESTS.map((q) => q.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const q of QUESTS) {
      expect(q.title, q.key).toBeTruthy();
      expect(q.hint, q.key).toBeTruthy();
      expect(typeof q.active({}, none)).toBe('boolean');
      expect(typeof q.done({}, none)).toBe('boolean');
      expect(typeof q.active(allFlags, lots)).toBe('boolean');
      expect(typeof q.done(allFlags, lots)).toBe('boolean');
    }
  });
  it('no quest is done before it is active on a fresh game', () => {
    for (const q of QUESTS) expect(q.done({}, none), q.key).toBe(false);
  });
});
