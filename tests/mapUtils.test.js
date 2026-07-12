import { describe, it, expect } from 'vitest';
import { extendMap, stamp } from '../src/data/zones/mapUtils.js';

describe('extendMap', () => {
  it('appends east columns and south rows with the fill tile', () => {
    const m = extendMap(
      [
        [1, 1],
        [1, 1],
      ],
      { east: 2, south: 1, fill: 0 },
    );
    expect(m).toEqual([
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [0, 0, 0, 0],
    ]);
  });
  it('does not mutate the source map', () => {
    const src = [[1]];
    extendMap(src, { east: 1, south: 0, fill: 0 });
    expect(src).toEqual([[1]]);
  });
});

describe('stamp', () => {
  it('writes non-null cells at the offset, skips nulls', () => {
    const m = [
      [0, 0, 0],
      [0, 0, 0],
    ];
    stamp(m, 1, 0, [
      [7, null],
      [8, 9],
    ]);
    expect(m).toEqual([
      [0, 7, 0],
      [0, 8, 9],
    ]);
  });
});
