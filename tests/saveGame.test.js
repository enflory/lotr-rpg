import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { gameState } from '../src/state/GameState.js';
import { SAVE_KEY, save, load, clearSave, applySave } from '../src/state/saveGame.js';

// Minimal Storage fake — Vitest's Node env has no localStorage.
function fakeStorage() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
  };
}

beforeEach(() => {
  globalThis.localStorage = fakeStorage();
  gameState.flags = {};
  gameState.follower = null;
  gameState.objective = 'Speak with Gandalf outside Bag End';
  gameState.items = {};
  gameState.collected = {};
});
afterEach(() => {
  delete globalThis.localStorage;
});

describe('save/load round trip', () => {
  it('returns null when nothing is saved', () => {
    expect(load()).toBeNull();
  });

  it('round-trips gameState plus the checkpoint location', () => {
    gameState.flags = { prologueDone: true, samJoined: true };
    gameState.follower = 'sam';
    gameState.objective = 'Follow the East Road';
    gameState.items = { mushroom: 3 };
    gameState.collected = { shire_mathom_1: true };
    save('woodyend', 'west');

    const p = load();
    expect(p).not.toBeNull();
    expect(p.zone).toBe('woodyend');
    expect(p.entry).toBe('west');
    expect(p.flags).toEqual({ prologueDone: true, samJoined: true });
    expect(p.follower).toBe('sam');
    expect(p.objective).toBe('Follow the East Road');
    expect(p.items).toEqual({ mushroom: 3 });
    expect(p.collected).toEqual({ shire_mathom_1: true });
    expect(p.version).toBe(1);
  });

  it('clearSave removes the save', () => {
    save('shire', 'default');
    clearSave();
    expect(load()).toBeNull();
  });
});

describe('load validation', () => {
  it('clears the key and returns null on unparseable JSON', () => {
    globalThis.localStorage.setItem(SAVE_KEY, '{not json');
    expect(load()).toBeNull();
    expect(globalThis.localStorage.getItem(SAVE_KEY)).toBeNull();
  });

  it('ignores (but keeps) a future-version save', () => {
    save('shire', 'default');
    const raw = JSON.parse(globalThis.localStorage.getItem(SAVE_KEY));
    raw.version = 2;
    globalThis.localStorage.setItem(SAVE_KEY, JSON.stringify(raw));
    expect(load()).toBeNull();
    expect(globalThis.localStorage.getItem(SAVE_KEY)).not.toBeNull();
  });

  it('returns null for a zone that no longer exists', () => {
    save('shire', 'default');
    const raw = JSON.parse(globalThis.localStorage.getItem(SAVE_KEY));
    raw.zone = 'mordor';
    globalThis.localStorage.setItem(SAVE_KEY, JSON.stringify(raw));
    expect(load()).toBeNull();
  });

  it('falls back to the default spawn for an unknown entry', () => {
    save('shire', 'default');
    const raw = JSON.parse(globalThis.localStorage.getItem(SAVE_KEY));
    raw.entry = 'trapdoor';
    globalThis.localStorage.setItem(SAVE_KEY, JSON.stringify(raw));
    expect(load()?.entry).toBe('default');
  });

  it('returns null for an unknown entry in a zone with no default spawn', () => {
    // woodyend has only west/east spawns — no fallback exists, so the save
    // must be rejected rather than booting WorldScene into undefined
    save('woodyend', 'west');
    const raw = JSON.parse(globalThis.localStorage.getItem(SAVE_KEY));
    raw.entry = 'trapdoor';
    globalThis.localStorage.setItem(SAVE_KEY, JSON.stringify(raw));
    expect(load()).toBeNull();
  });

  it('returns null when flags/items/collected are not objects', () => {
    save('shire', 'default');
    const raw = JSON.parse(globalThis.localStorage.getItem(SAVE_KEY));
    raw.flags = 'oops';
    globalThis.localStorage.setItem(SAVE_KEY, JSON.stringify(raw));
    expect(load()).toBeNull();
  });
});

describe('without localStorage (private-browsing fallback)', () => {
  it('save/load/clear silently no-op', () => {
    delete globalThis.localStorage;
    expect(() => save('shire', 'default')).not.toThrow();
    expect(load()).toBeNull();
    expect(() => clearSave()).not.toThrow();
  });
});

describe('applySave', () => {
  it('assigns the payload onto the gameState singleton', () => {
    gameState.flags = { prologueDone: true };
    gameState.follower = 'sam';
    gameState.items = { mushroom: 2 };
    save('marish', 'west');
    // simulate a page reload
    gameState.flags = {};
    gameState.follower = null;
    gameState.items = {};

    applySave(load());
    expect(gameState.flags).toEqual({ prologueDone: true });
    expect(gameState.follower).toBe('sam');
    expect(gameState.items).toEqual({ mushroom: 2 });
  });
});
