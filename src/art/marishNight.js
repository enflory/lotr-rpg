// Night on the Marish. From the moment Maggot's waggon rolls out of his gate
// the low country is dark and the river fog is up — "there's a fog coming off
// the River tonight", as Merry says at the landing — and it stays that way
// through the crossing.
//
// Three pieces: a screen-fixed tint, wisps of fog lying on the land, and a
// warm pool under the lamp at the ferry landing. None of them touch the
// dialogue panel or the banner, which sit far above them.
import { T } from '../data/tileTypes.js';

// Screen-fixed art is placed in the old 320x240 coordinates and scaled about
// the centre of the 960x720 canvas, so it carries the same offset as the UI.
const UI_OX = 320;
const UI_OY = 240;

export const NIGHT = 0x0d1a2b;
export const NIGHT_ALPHA = 0.6;
const FOG = 0xdbe4ec;

/** Build the night layer for a zone, hidden until something raises it. */
export function createNight(scene) {
  const tint = scene.add
    .rectangle(160 + UI_OX, 120 + UI_OY, 340, 260, NIGHT, NIGHT_ALPHA)
    .setScrollFactor(0)
    .setDepth(850)
    .setAlpha(0);

  // Fog lies on the ground, so it belongs in world space: it slides past as
  // you walk, rather than hanging in front of the camera like a filter.
  const width = scene.mapWidth * 16,
    height = scene.mapHeight * 16;
  const wisps = [];
  for (let i = 0; i < 34; i++) {
    const x = ((i * 197 + 61) % width) + 8;
    const y = ((i * 137 + 43) % height) + 8;
    const wisp = scene.add
      .ellipse(x, y, 74 + (i % 4) * 30, 13 + (i % 3) * 6, FOG, 0.17)
      .setDepth(845)
      .setAlpha(0);
    wisps.push({ wisp, x, drift: 26 + (i % 5) * 9, span: 6400 + i * 260 });
  }

  // The lamp on its post at the landing, and any other lamp on the map.
  const lamps = [];
  for (let ty = 0; ty < scene.zone.map.length; ty++)
    for (let tx = 0; tx < scene.zone.map[ty].length; tx++) {
      if (scene.zone.map[ty][tx] !== T.LANTERN) continue;
      const glow = scene.add
        .ellipse(tx * 16 + 8, ty * 16 + 10, 74, 52, 0xffc46a, 0.22)
        .setDepth(852)
        .setBlendMode('ADD')
        .setAlpha(0);
      lamps.push(glow);
    }

  return { tint, wisps, lamps, risen: false };
}

/**
 * Raise the night. `duration` 0 puts it straight up, for a zone re-entered
 * after the ride or restored from a save.
 */
export function raiseNight(scene, night, duration = 1600) {
  if (!night || night.risen) return;
  night.risen = true;
  const up = (target, to) =>
    duration
      ? scene.tweens.add({ targets: target, alpha: to, duration, ease: 'Sine.easeInOut' })
      : target.setAlpha(to);
  up(night.tint, 1);
  for (const lamp of night.lamps) up(lamp, 1);
  for (const { wisp, x, drift, span } of night.wisps) {
    up(wisp, 1);
    // Each wisp crosses its own stretch of ground and starts again; the fog
    // never resolves into a pattern you can read the map by.
    scene.tweens.add({
      targets: wisp,
      x: x + drift,
      scaleX: 1.35,
      duration: span,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }
}
