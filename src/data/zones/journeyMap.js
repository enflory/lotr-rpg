// Deterministic woodland geometry: designed routes with irregular clearings.
// Every passage is carved last so scenic scatter cannot seal a trail.
import { T } from '../tileTypes.js';

export function field(w, h, tile, border = T.OLD_TREE) {
  return Array.from({ length: h }, (_, y) => Array.from({ length: w }, (_, x) =>
    x === 0 || y === 0 || x === w - 1 || y === h - 1 ? border : tile));
}
export function grove(w, h) {
  return Array.from({ length: h }, (_, y) => Array.from({ length: w }, (_, x) =>
    (x * 37 + y * 61 + x * y * 7) % 17 < 2 ? T.DEAD_TREE : T.OLD_TREE));
}
export function clearing(map, cx, cy, rx, ry, tile = T.FOREST_FLOOR) {
  for (let y = Math.max(1, cy - ry); y <= Math.min(map.length - 2, cy + ry); y++)
    for (let x = Math.max(1, cx - rx); x <= Math.min(map[0].length - 2, cx + rx); x++)
      if (((x-cx)/rx)**2 + ((y-cy)/ry)**2 <= 1) map[y][x] = tile;
}
export function trail(map, points, radius = 1, tile = T.FOREST_FLOOR) {
  const stamp = (x, y) => {
    for (let dy = -radius; dy <= radius; dy++) for (let dx = -radius; dx <= radius; dx++)
      if (map[y+dy]?.[x+dx] !== undefined) map[y+dy][x+dx] = tile;
  };
  for (let i=1;i<points.length;i++) {
    let [x,y] = points[i-1]; const [ex,ey] = points[i];
    stamp(x,y);
    while (x !== ex || y !== ey) {
      if (x !== ex) x += Math.sign(ex-x); else y += Math.sign(ey-y);
      stamp(x,y);
    }
  }
}
// Like `trail`, but steps both axes at once instead of turning square corners,
// so a carved route reads as a path worn by feet rather than a staircase.
export function wind(map, points, radius = 1, tile = T.FOREST_FLOOR) {
  const stamp = (x, y) => {
    for (let dy = -radius; dy <= radius; dy++) for (let dx = -radius; dx <= radius; dx++)
      if (map[y+dy]?.[x+dx] !== undefined) map[y+dy][x+dx] = tile;
  };
  for (let i = 1; i < points.length; i++) {
    let [x, y] = points[i-1];
    const [ex, ey] = points[i];
    const dx = Math.abs(ex - x), dy = Math.abs(ey - y);
    const sx = Math.sign(ex - x), sy = Math.sign(ey - y);
    let err = dx - dy;
    stamp(x, y);
    while (x !== ex || y !== ey) {
      const e2 = 2 * err;
      if (e2 > -dy && x !== ex) { err -= dy; x += sx; }
      if (e2 < dx && y !== ey) { err += dx; y += sy; }
      stamp(x, y);
    }
  }
}
export function cottage(map, x, y, width = 9) {
  for (let dx=0; dx<width; dx++) {
    map[y][x+dx] = dx===0 ? T.ROOF_L : dx===width-1 ? T.ROOF_R : T.ROOF;
    map[y+1][x+dx] = dx===Math.floor(width/2) ? T.DOOR : dx%3===1 ? T.WINDOW_F : T.BARN;
  }
}
export const point = (x,y,dialogue,label,when) => ({ x,y,dialogue,label, ...(when ? {when} : {}) });
export const edge = (x,y,zone,entry,requires,denied) => ({x,y,zone,entry,...(requires ? {requires,denied} : {})});

// Deterministic value noise. Smooth over `scale` tiles, so summing two octaves
// gives rolling ground rather than the per-tile speckle `grove` produces.
const hash = (x, y) => {
  let n = Math.imul(x + 1013, 374761393) ^ Math.imul(y + 3067, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
};
export function smoothNoise(x, y, scale) {
  const fx = x / scale, fy = y / scale;
  const ix = Math.floor(fx), iy = Math.floor(fy);
  const ease = (t) => t * t * (3 - 2 * t);
  const u = ease(fx - ix), v = ease(fy - iy);
  return (
    (hash(ix, iy) * (1 - u) + hash(ix + 1, iy) * u) * (1 - v) +
    (hash(ix, iy + 1) * (1 - u) + hash(ix + 1, iy + 1) * u) * v
  );
}
