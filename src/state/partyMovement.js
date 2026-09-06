import { COLLISION_TILES, TILE_SIZE } from '../data/tileTypes.js';

/** @typedef {{x: number, y: number}} Point */

/**
 * A shortest walkable tile route. Positions are sprite centres (feet at y+8).
 * Used for off-camera arrivals and safe formations after a zone change.
 * @param {number[][]} map
 * @param {Point} start
 * @param {(x: number, y: number) => boolean} accepts
 * @param {number[][]} [directions]
 * @returns {Point[]}
 */
export function findWalkablePath(
  map,
  start,
  accepts,
  directions = [
    [-1, 0],
    [0, 1],
    [1, 0],
    [0, -1],
  ],
) {
  const sx = Math.floor(start.x / TILE_SIZE),
    sy = Math.floor((start.y + 8) / TILE_SIZE);
  const queue = [{ x: sx, y: sy, parent: -1 }];
  const seen = new Set([`${sx},${sy}`]);
  for (let i = 0; i < queue.length; i++) {
    const cell = queue[i];
    if (accepts(cell.x, cell.y)) {
      const path = [];
      for (let at = i; at >= 0; at = queue[at].parent) {
        path.push({ x: queue[at].x * TILE_SIZE + 8, y: queue[at].y * TILE_SIZE });
      }
      return path.reverse();
    }
    for (const [dx, dy] of directions) {
      const x = cell.x + dx,
        y = cell.y + dy;
      const tile = map[y]?.[x];
      if (tile === undefined || COLLISION_TILES.includes(tile) || seen.has(`${x},${y}`)) continue;
      seen.add(`${x},${y}`);
      queue.push({ x, y, parent: i });
    }
  }
  return [];
}

/** Position a given distance back along a newest-first trail.
 * @param {Point[]} points @param {number} distance @returns {Point}
 */
export function trailPosition(points, distance) {
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1],
      b = points[i];
    const length = Math.hypot(b.x - a.x, b.y - a.y);
    if (length > 0 && distance <= length) {
      const t = distance / length;
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    }
    distance -= length;
  }
  return points.at(-1);
}
