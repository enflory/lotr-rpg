import { findWalkablePath, trailPosition } from '../state/partyMovement.js';
import { walk, move, tween } from './storyMotion.js';

export const friend = (s, key) => s.followers.find((p) => p.getData('key') === key);
export const pause = (s, ms) => new Promise((resolve) => s.time.delayedCall(ms, resolve));
export function face(p, dir) {
  p.setData('dir', dir);
  p.play(`${p.getData('key') || p.texture.key}-idle-${dir}`, true);
}
export const gesture = (s, p) => tween(s, p, { angle: 6, yoyo: true, repeat: 1 }, 150);
export function focus(s, x, y) {
  s.cameras.main.stopFollow();
  s.cameras.main.pan(x * 16 + 8, y * 16, 600, 'Sine.easeInOut');
}
export async function enter(s, p, x, y, doorX = 0, doorY = 16) {
  p.setPosition(doorX * 16 + 8, doorY * 16)
    .setAlpha(0)
    .setVisible(true)
    .setDepth(doorY * 16 + 20);
  await tween(s, p, { alpha: 1 }, 220);
  await walk(s, p, x, y, 65);
}
export async function leave(s, p, x, y) {
  await walk(s, p, x, y, 75);
  await tween(s, p, { alpha: 0 }, 180);
  p.setVisible(false).setAlpha(1);
}
// Walk into the exact 18px formation used by normal following. Merely seeding
// a trail from a wide tableau makes companions snap to new positions next frame.
export async function regroup(s, x, y, dir = 'right', extra = []) {
  const cast = [s.player, ...s.followers.filter((p) => p.visible), ...extra];
  const start = { x: x * 16 + 8, y: y * 16 };
  const behind = { right: [-1, 0], left: [1, 0], up: [0, 1], down: [0, -1] }[dir];
  const route = findWalkablePath(
    s.zone.map,
    start,
    (tx, ty) => Math.abs(tx - x) + Math.abs(ty - y) >= cast.length + 3,
    [behind, [-1, 0], [0, 1], [1, 0], [0, -1]],
  );
  const trail = [start, ...route];
  await Promise.all(
    cast.map(async (p, i) => {
      const dest = trailPosition(trail, i * 18);
      await walk(s, p, Math.floor(dest.x / 16), Math.floor((dest.y + 8) / 16), 70);
      await move(s, p, dest, 70);
      p.setAngle(0);
      face(p, dir);
    }),
  );
  s.lastDir = dir;
  s.bree.releaseTrail = trail;
  return trail;
}
export function packBill(p) {
  if (p.getData('loaded')) return;
  p.getData('body')
    .fillStyle(0x403025)
    .fillRect(-10, -16, 9, 9)
    .fillRect(1, -15, 9, 8)
    .fillStyle(0x92724b)
    .fillRect(-9, -15, 7, 6)
    .fillRect(2, -14, 7, 5)
    .fillStyle(0xd4bd83)
    .fillRect(-7, -15, 1, 7)
    .fillRect(5, -14, 1, 6);
  p.setData('loaded', true);
}
export function billPosition(s) {
  const last = s.followers.at(-1) || s.player;
  const x = Math.floor(last.x / 16),
    y = Math.floor((last.y + 8) / 16);
  const behind = { right: [-1, 0], left: [1, 0], up: [0, 1], down: [0, -1] }[s.lastDir];
  const route = findWalkablePath(
    s.zone.map,
    last,
    (tx, ty) => Math.abs(tx - x) + Math.abs(ty - y) >= 3,
    [behind, [-1, 0], [0, 1], [1, 0], [0, -1]],
  );
  return trailPosition([{ x: last.x, y: last.y }, ...route], 36);
}
export async function walkBill(s, p, dest) {
  const route = findWalkablePath(
    s.zone.map,
    p,
    (x, y) => x === Math.floor(dest.x / 16) && y === Math.floor((dest.y + 8) / 16),
  );
  const stops = route.filter(
    (p, i) =>
      i === route.length - 1 ||
      (i > 0 &&
        (p.x - route[i - 1].x !== route[i + 1].x - p.x ||
          p.y - route[i - 1].y !== route[i + 1].y - p.y)),
  );
  for (const target of [...stops, dest]) {
    const dx = target.x - p.x,
      dy = target.y - p.y,
      distance = Math.hypot(dx, dy);
    if (Math.abs(dx) > 1) p.scaleX = dx < 0 ? -1 : 1;
    await tween(
      s,
      p,
      {
        ...target,
        onUpdate: (t) => {
          const phase = (t.progress * distance) / 5;
          p.setDepth(p.y + 5);
          p.getData('legs').forEach((leg, i) => (leg.y = 3 + Math.sin(phase + i * Math.PI) * 2));
          p.getData('body').y = -Math.abs(Math.sin(phase)) * 0.7;
        },
      },
      Math.max(80, (distance / 70) * 1000),
    );
  }
  p.getData('legs').forEach((leg) => (leg.y = 3));
  p.getData('body').y = 0;
  p.setData('route', []).setData('target', null);
}
