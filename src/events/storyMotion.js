// Shared collision-aware walking for short, player-visible story scenes.
import { findWalkablePath } from '../state/partyMovement.js';
const keyOf = (p) => p.getData('key') || p.texture.key;

export const tween = (s, targets, props, duration = 650) =>
  new Promise((resolve) => {
    s.tweens.add({ targets, ...props, duration, ease: 'Sine.easeInOut', onComplete: resolve });
  });

export async function move(s, p, dest, speed = 72) {
  const dx = dest.x - p.x,
    dy = dest.y - p.y;
  const dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : dy < 0 ? 'up' : 'down';
  p.play(`${keyOf(p)}-walk-${dir}`, true);
  await tween(
    s,
    p,
    { ...dest, onUpdate: () => p.setDepth(p.y + 20) },
    Math.max(100, (Math.hypot(dx, dy) / speed) * 1000),
  );
  p.play(`${keyOf(p)}-idle-${dir}`, true);
}
export async function walk(s, p, x, y, speed = 85) {
  const route = findWalkablePath(s.zone.map, p, (tx, ty) => tx === x && ty === y);
  // Collapse straight tile runs, preserving every corner and the starting pose.
  const stops = route.filter(
    (p, i) =>
      i === route.length - 1 ||
      (i > 0 &&
        (p.x - route[i - 1].x !== route[i + 1].x - p.x ||
          p.y - route[i - 1].y !== route[i + 1].y - p.y)),
  );
  for (const stop of stops) await move(s, p, stop, speed);
}
