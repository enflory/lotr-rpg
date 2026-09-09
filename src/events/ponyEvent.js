import { gameState } from '../state/GameState.js';
import { findWalkablePath, trailPosition } from '../state/partyMovement.js';

const colors = [0x79533a, 0x9b805b, 0x66544a, 0x8a6550, 0x756454];
const travelZones = new Set([
  'crickhollow',
  'hedgetunnel',
  'forestgate',
  'forestheart',
  'withywindle',
  'tomclearing',
  'downs',
]);
function makePony(s, x, y, color) {
  const body = s.add.graphics();
  body.fillStyle(color).fillRect(-10, -9, 21, 9).fillRect(8, -17, 6, 13);
  body.fillStyle(0xb8a478).fillRect(-4, -10, 11, 6);
  body.fillStyle(0x302c24).fillRect(9, -20, 2, 4).fillRect(13, -20, 2, 4).fillRect(-13, -8, 3, 10);
  body.fillStyle(0xd5caaa).fillRect(12, -15, 1, 1);
  const legs = [-7, 7].map((x) => s.add.rectangle(x, 3, 3, 7, 0x302c24));
  const p = s.add.container(x, y, [...legs, body]).setDepth(y);
  p.setData({ body, legs, route: [], clock: 0, phase: 0, target: null, heading: 1 });
  return p;
}
export function createPonies(s) {
  if (!travelZones.has(s.zoneKey)) return;
  const pasture = s.zoneKey === 'crickhollow' || s.zoneKey === 'tomclearing';
  const entry = s.zone.exits.find(
    (e) =>
      Math.hypot(e.x * 16 + 8 - s.player.x, e.y * 16 - s.player.y) < 65 &&
      (e.x === 0 || e.y === 0 || e.x === s.mapWidth - 1 || e.y === s.mapHeight - 1),
  );
  const path = findWalkablePath(
    s.zone.map,
    s.player,
    (x, y) =>
      Math.abs(x - Math.floor(s.player.x / 16)) + Math.abs(y - Math.floor((s.player.y + 8) / 16)) >=
      15,
  );
  s.journey.ponies = colors.map((c, i) => {
    const pos = pasture
      ? {
          x: (s.zoneKey === 'crickhollow' ? 24 + i * 2.5 : 8 + i * 3) * 16,
          y: (s.zoneKey === 'crickhollow' ? 18 : 17) * 16,
        }
      : trailPosition(path.length ? path : [s.player], 90 + i * 30);
    const p = makePony(s, pos.x, pos.y, c);
    // The ponies stay with the party in the mist and vanish at the stones.
    if (s.zoneKey === 'downs' && gameState.flags.downsSeparated) p.setAlpha(0).setVisible(false);
    if (entry && !pasture) {
      const dx = entry.x === 0 ? -1 : entry.x === s.mapWidth - 1 ? 1 : 0;
      const dy = entry.y === 0 ? -1 : entry.y === s.mapHeight - 1 ? 1 : 0;
      const edge = { x: entry.x * 16 + 8, y: entry.y * 16 };
      p.setPosition(edge.x + dx * (30 + i * 30), edge.y + dy * (30 + i * 30));
      p.setData('entering', true).setData('route', [edge]);
    }
    return p;
  });
}
export function updatePonies(s, delta) {
  const ponies = s.journey.ponies;
  if (!ponies) return;
  const f = gameState.flags;
  // Waking into mist does not lose the ponies; separation at the stones does.
  const wanted = !(s.zoneKey === 'downs' && f.downsSeparated);
  const wait =
    (s.zoneKey === 'crickhollow' && !f.crickhollowReady && !f.chapter2) ||
    (s.zoneKey === 'tomclearing' && !f.learnedSong) ||
    (s.zoneKey === 'withywindle' && f.willowTrapped && !f.willowFreed);
  for (let i = 0; i < ponies.length; i++) {
    const p = ponies[i];
    const fade = Math.min(1, delta / 900);
    p.setAlpha(p.alpha + ((wanted ? 1 : 0) - p.alpha) * fade);
    p.setVisible(p.alpha > 0.02);
    if (!wanted || wait || s.storyBeat || s.dialogActive) continue;
    const leader = i ? ponies[i - 1] : s.followers.at(-1) || s.player;
    const distance = Math.hypot(leader.x - p.x, leader.y - p.y);
    const dt = Math.min(delta, 50);
    if (distance < 31) {
      p.getData('legs').forEach((l) => (l.y = 3));
      p.getData('body').y = 0;
      continue;
    }
    let clock = p.getData('clock') - dt,
      route = p.getData('route');
    const target = `${Math.floor(leader.x / 16)},${Math.floor((leader.y + 8) / 16)}`;
    if (!p.getData('entering') && clock <= 0 && (target !== p.getData('target') || !route.length)) {
      route = findWalkablePath(s.zone.map, p, (x, y) => `${x},${y}` === target).slice(1);
      p.setData('route', route).setData('target', target);
      clock = 250;
    }
    p.setData('clock', clock);
    const dest = route[0];
    if (!dest) continue;
    const dx = dest.x - p.x,
      dy = dest.y - p.y,
      d = Math.hypot(dx, dy),
      step = Math.min(d, (82 * dt) / 1000);
    if (d < 0.5) {
      route.shift();
      if (!route.length) p.setData('entering', false);
      continue;
    }
    p.x += (dx / d) * step;
    p.y += (dy / d) * step;
    p.setDepth(p.y + 5);
    // Face the way you are actually travelling. A route alternates axis-aligned
    // steps, so the instantaneous dx of a northward leg is noise: smooth it, and
    // only turn the pony round once the smoothed heading really has changed side.
    const heading = p.getData('heading') * 0.82 + (dx / d) * 0.18;
    p.setData('heading', heading);
    if (Math.abs(heading) > 0.28) p.scaleX = heading < 0 ? -1 : 1;
    const phase = p.getData('phase') + step / 5;
    p.setData('phase', phase);
    p.getData('legs').forEach((l, j) => (l.y = 3 + Math.sin(phase + j * Math.PI) * 2));
    p.getData('body').y = -Math.abs(Math.sin(phase)) * 0.7;
  }
}
