import { describe, it, expect, beforeEach } from 'vitest';
import {
  gameState,
  setFlag,
  hasFlag,
  setObjective,
  addItem,
  removeItem,
  itemCount,
  collect,
  isCollected,
} from '../src/state/GameState.js';

// gameState is a module singleton, so reset it between tests.
beforeEach(() => {
  gameState.flags = {};
  gameState.follower = null;
  gameState.objective = 'Speak with Gandalf outside Bag End';
  gameState.items = {};
  gameState.collected = {};
});

describe('flags', () => {
  it('hasFlag is false for a flag never set', () => {
    expect(hasFlag('metGandalf')).toBe(false);
  });

  it('setFlag makes hasFlag true', () => {
    setFlag('metGandalf');
    expect(hasFlag('metGandalf')).toBe(true);
    expect(hasFlag('samJoined')).toBe(false);
  });

  it('setting a flag twice is harmless', () => {
    setFlag('samJoined');
    setFlag('samJoined');
    expect(hasFlag('samJoined')).toBe(true);
  });
});

describe('objective', () => {
  it('starts with the opening objective', () => {
    expect(gameState.objective).toMatch(/Gandalf/);
  });

  it('setObjective replaces the current objective', () => {
    setObjective('Find Sam in his garden');
    expect(gameState.objective).toBe('Find Sam in his garden');
  });
});

describe('items and pickups', () => {
  it('addItem/itemCount track counts, removeItem floors at zero', () => {
    expect(itemCount('mushroom')).toBe(0);
    addItem('mushroom');
    addItem('mushroom', 2);
    expect(itemCount('mushroom')).toBe(3);
    removeItem('mushroom');
    expect(itemCount('mushroom')).toBe(2);
    removeItem('mushroom', 5);
    expect(itemCount('mushroom')).toBe(0);
  });

  it('collect/isCollected record pickup ids', () => {
    expect(isCollected('shire_mathom_1')).toBe(false);
    collect('shire_mathom_1');
    expect(isCollected('shire_mathom_1')).toBe(true);
  });
});
