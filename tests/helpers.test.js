// Canvas drawing helpers — tested against a fake 2D context that
// records fillRect calls, so no real canvas is needed.

import { describe, it, expect } from 'vitest';
import { px, rc, circle, drawPixelMap, mirrorRows, validateRows } from '../src/art/helpers.js';

function fakeCtx() {
  const calls = [];
  return {
    calls,
    fillStyle: null,
    fillRect(x, y, w, h) {
      calls.push({ x, y, w, h, col: this.fillStyle });
    },
  };
}

describe('px / rc', () => {
  it('px fills a single pixel with the given color', () => {
    const c = fakeCtx();
    px(c, 3, 5, '#fff');
    expect(c.calls).toEqual([{ x: 3, y: 5, w: 1, h: 1, col: '#fff' }]);
  });

  it('rc fills the given rectangle', () => {
    const c = fakeCtx();
    rc(c, 1, 2, 10, 4, '#abc');
    expect(c.calls).toEqual([{ x: 1, y: 2, w: 10, h: 4, col: '#abc' }]);
  });
});

describe('circle', () => {
  it('fills only pixels within the radius', () => {
    const c = fakeCtx();
    circle(c, 0, 0, 1, '#f00');
    const pts = c.calls.map(({ x, y }) => `${x},${y}`).sort();
    expect(pts).toEqual(['-1,0', '0,-1', '0,0', '0,1', '1,0']);
  });

  it('radius 0 fills exactly the center pixel', () => {
    const c = fakeCtx();
    circle(c, 4, 7, 0, '#f00');
    expect(c.calls).toEqual([{ x: 4, y: 7, w: 1, h: 1, col: '#f00' }]);
  });
});

describe('drawPixelMap', () => {
  it('maps palette characters to pixels at the given offset', () => {
    const c = fakeCtx();
    drawPixelMap(c, 10, 20, ['ab', 'ba'], { a: '#111', b: '#222' });
    expect(c.calls).toEqual([
      { x: 10, y: 20, w: 1, h: 1, col: '#111' },
      { x: 11, y: 20, w: 1, h: 1, col: '#222' },
      { x: 10, y: 21, w: 1, h: 1, col: '#222' },
      { x: 11, y: 21, w: 1, h: 1, col: '#111' },
    ]);
  });

  it('treats characters missing from the palette as transparent', () => {
    const c = fakeCtx();
    drawPixelMap(c, 0, 0, ['.a.', '...'], { a: '#111' });
    expect(c.calls).toEqual([{ x: 1, y: 0, w: 1, h: 1, col: '#111' }]);
  });
});

describe('mirrorRows', () => {
  it('reverses each row horizontally', () => {
    expect(mirrorRows(['abc', 'de.'])).toEqual(['cba', '.ed']);
  });

  it('is an involution (mirroring twice restores the original)', () => {
    const rows = ['.oSSo.', 'oHHHHo'];
    expect(mirrorRows(mirrorRows(rows))).toEqual(rows);
  });
});

describe('validateRows', () => {
  it('returns the rows when every row matches the width', () => {
    const rows = ['aaaa', 'bbbb'];
    expect(validateRows('ok', rows, 4)).toBe(rows);
  });

  it('defaults to width 16', () => {
    expect(() => validateRows('def', ['x'.repeat(16)])).not.toThrow();
  });

  it('throws with the map name and row index on a ragged row', () => {
    expect(() => validateRows('bad', ['aaaa', 'bbb'], 4)).toThrow(
      /bad row 1 is 3 chars \(expected 4\)/,
    );
  });
});
