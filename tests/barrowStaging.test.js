import { describe, expect, it } from 'vitest';
import { DOWNS_REST, DOWNS_STONE, BARROW_SONG } from '../src/data/barrowLandmarks.js';
import { downs, barrow } from '../src/data/zones/barrowdowns.js';
import { T, COLLISION_TILES } from '../src/data/tileTypes.js';

describe('barrow landmarks agree with the places the player can visit', () => {
  it('puts the rest beside the great stone beyond the unchanged outlook', () => {
    expect(DOWNS_REST).toEqual({ x: 43, y: 17 });
    expect(DOWNS_STONE).toEqual({ x: 43, y: 15 });
    expect(downs.spawns.stone).toMatchObject(DOWNS_REST);
    expect(downs.interactions.find((p) => p.dialogue === 'downs_stone')).toMatchObject(DOWNS_REST);
    expect(downs.interactions.find((p) => p.dialogue === 'downs_view')).toMatchObject({
      x: 37,
      y: 18,
    });
    expect(downs.map[DOWNS_STONE.y][DOWNS_STONE.x]).toBe(T.GREAT_STONE);
    expect(COLLISION_TILES).not.toContain(downs.map[DOWNS_REST.y][DOWNS_REST.x]);
  });

  it('replaces the courage interaction with the song beside the sleepers', () => {
    expect(BARROW_SONG).toEqual({ x: 15, y: 13 });
    const courage = barrow.interactions.find((p) => p.dialogue === 'barrow_courage');
    const call = barrow.interactions.find((p) => p.dialogue === 'barrow_call');
    expect(courage).toMatchObject(BARROW_SONG);
    expect(call).toMatchObject(BARROW_SONG);
    expect(courage.when({})).toBe(true);
    expect(call.when({})).toBeFalsy();
    expect(courage.when({ barrowCourage: true })).toBe(false);
    expect(call.when({ barrowCourage: true })).toBe(true);
    expect(COLLISION_TILES).not.toContain(barrow.map[BARROW_SONG.y][BARROW_SONG.x]);
  });
});
