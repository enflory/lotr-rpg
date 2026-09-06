import { describe, it, expect } from 'vitest';
import { findWalkablePath, trailPosition } from '../src/state/partyMovement.js';
import { T } from '../src/data/tileTypes.js';

describe('party movement', () => {
  it('routes an entrance around solid scenery instead of through it', () => {
    const map = [
      [T.GRASS, T.TREE, T.GRASS],
      [T.GRASS, T.TREE, T.GRASS],
      [T.GRASS, T.GRASS, T.GRASS],
    ];
    const path = findWalkablePath(map, { x: 8, y: 0 }, (x, y) => x === 2 && y === 0);
    expect(path).toEqual([
      { x: 8, y: 0 },
      { x: 8, y: 16 },
      { x: 8, y: 32 },
      { x: 24, y: 32 },
      { x: 40, y: 32 },
      { x: 40, y: 16 },
      { x: 40, y: 0 },
    ]);
  });

  it('returns no route when the target is enclosed', () => {
    expect(findWalkablePath([[T.GRASS, T.TREE, T.GRASS]], { x: 8, y: 0 }, (x) => x === 2)).toEqual(
      [],
    );
  });

  it('keeps both followers spaced along the walked route, including corners', () => {
    // Newest first: Frodo walked right 40px, then down 20px.
    const path = [
      { x: 40, y: 20 },
      { x: 40, y: 0 },
      { x: 0, y: 0 },
    ];
    expect(trailPosition(path, 18)).toEqual({ x: 40, y: 2 });
    expect(trailPosition(path, 36)).toEqual({ x: 24, y: 0 });
  });

  it('handles a short or stationary trail without invalid positions', () => {
    expect(
      trailPosition(
        [
          { x: 8, y: 8 },
          { x: 8, y: 8 },
        ],
        36,
      ),
    ).toEqual({ x: 8, y: 8 });
  });
});
