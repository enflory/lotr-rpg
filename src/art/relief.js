// Shared machinery for the baked landscape renderers (the Barrow-downs and
// the Shire). A tile-resolution mask, smoothed once, is the height field the
// shading is read from; sampling it per pixel rather than per tile is what
// stops a landscape reading as a terrace of squares.
//
// Flat Float32Array with a row stride: these are read several times per pixel
// over nearly a million pixels, and an array of arrays is far too slow.

/** @param {number[][]} map @param {(tile: number) => boolean} match */
export function maskOf(map, match) {
  const rows = map.length,
    cols = map[0].length;
  const raw = new Float32Array(rows * cols);
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < cols; x++) raw[y * cols + x] = match(map[y][x]) ? 1 : 0;
  const out = new Float32Array(rows * cols);
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < cols; x++) {
      const here = raw[y * cols + x];
      let sum = 0;
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx,
            ny = y + dy;
          const inside = nx >= 0 && nx < cols && ny >= 0 && ny < rows;
          sum += (inside ? raw[ny * cols + nx] : here) * (dx || dy ? 2 : 4);
        }
      out[y * cols + x] = sum / 20;
    }
  let any = false;
  for (let i = 0; i < out.length && !any; i++) any = out[i] > 0;
  return { data: out, cols, rows, any };
}

/** Bilinear read of a mask in tile units. */
export function sample(field, fx, fy) {
  const { data, cols, rows } = field;
  const x = fx < 0 ? 0 : fx > cols - 1.001 ? cols - 1.001 : fx;
  const y = fy < 0 ? 0 : fy > rows - 1.001 ? rows - 1.001 : fy;
  const ix = x | 0,
    iy = y | 0,
    u = x - ix,
    v = y - iy;
  const i = iy * cols + ix;
  const a = data[i],
    b = data[i + 1],
    c = data[i + cols],
    d = data[i + cols + 1];
  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
}

/** Deterministic broad variation, shared by outlines and ground patches. */
export function hash(a, b, s) {
  let n = Math.imul(a + s, 374761393) ^ Math.imul(b + 77, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296 - 0.5;
}

/** Smooth value noise in [-0.5, 0.5], with separate x/y wavelengths. */
export function wobble(x, y, sx, sy, s) {
  const fx = x / sx,
    fy = y / sy;
  const ix = Math.floor(fx),
    iy = Math.floor(fy);
  let u = fx - ix,
    v = fy - iy;
  u = u * u * (3 - 2 * u);
  v = v * v * (3 - 2 * v);
  return (
    (hash(ix, iy, s) * (1 - u) + hash(ix + 1, iy, s) * u) * (1 - v) +
    (hash(ix, iy + 1, s) * (1 - u) + hash(ix + 1, iy + 1, s) * u) * v
  );
}

/** Clamp an integer palette index into range. */
export function step(i, max) {
  return i < 0 ? 0 : i > max ? max : i;
}
