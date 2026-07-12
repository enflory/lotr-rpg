// Helpers for growing and decorating hand-authored zone maps.

/**
 * Copy `map` and append `east` columns / `south` rows of `fill`.
 * @param {number[][]} map @param {{east?: number, south?: number, fill: number}} opts
 */
export function extendMap(map, { east = 0, south = 0, fill }) {
  const out = map.map((row) => [...row, ...Array(east).fill(fill)]);
  const w = out[0].length;
  for (let i = 0; i < south; i++) out.push(Array(w).fill(fill));
  return out;
}

/**
 * Stamp a block of tiles onto `map` at (x0, y0); null cells are skipped.
 * Mutates map. @param {number[][]} map @param {number} x0 @param {number} y0
 * @param {(number|null)[][]} rows
 */
export function stamp(map, x0, y0, rows) {
  rows.forEach((row, dy) =>
    row.forEach((t, dx) => {
      if (t !== null) map[y0 + dy][x0 + dx] = t;
    }),
  );
}
