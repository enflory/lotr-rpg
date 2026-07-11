import { describe, it, expect } from 'vitest';
import { T, COLLISION_TILES, TILE_SIZE } from '../src/data/tileTypes.js';
import { TILE_FNS } from '../src/art/tiles.js';

describe('tile registry invariants', () => {
  it('T indices are unique and contiguous from 0', () => {
    const values = Object.values(T).sort((a, b) => a - b);
    expect(values).toEqual(values.map((_, i) => i));
  });

  it('TILE_FNS has a draw function for every tile in T (order contract)', () => {
    // tileTypes.js promises "order must match TILE_FNS" — a length
    // mismatch means a tile was added to one file but not the other.
    expect(TILE_FNS.length).toBe(Object.keys(T).length);
    for (const fn of TILE_FNS) expect(typeof fn).toBe('function');
  });

  it('COLLISION_TILES contains only valid, unique tile indices', () => {
    const valid = new Set(Object.values(T));
    expect(new Set(COLLISION_TILES).size).toBe(COLLISION_TILES.length);
    for (const t of COLLISION_TILES) expect(valid.has(t)).toBe(true);
  });

  it('tiles the player must walk on are not solid', () => {
    for (const t of [
      T.GRASS,
      T.GRASS2,
      T.PATH,
      T.BRIDGE,
      T.FLOOR,
      T.RUG,
      T.FERN,
      T.DOCK,
      T.DOCK_S,
      T.DOOR,
      T.BOG,
    ]) {
      expect(COLLISION_TILES, `tile ${t} should be walkable`).not.toContain(t);
    }
  });

  it('TILE_SIZE is 16 (the whole art pipeline assumes it)', () => {
    expect(TILE_SIZE).toBe(16);
  });
});
