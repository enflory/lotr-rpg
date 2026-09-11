// Interiors are lit, not merely drawn. A smial is a hole in a hill: the only
// light in it comes from the deep-set round windows and from the fire, and
// everything the light does not reach goes brown and dim. Two layers do it:
//
//   shadow — one baked overlay, darkest in the corners, opened out around
//            every window, hearth and lamp.
//   glow   — additive pools at the fire itself, breathing a little, so the
//            hearth reads as the warmest thing in the room.
//
// Neither layer touches the characters: a hobbit in a dim corner stays legible.
//
// No Phaser import: the bake is pure, so the light map can be checked in the
// unit tests without a browser or a canvas.
import { T } from '../data/tileTypes.js';

const SOURCES = new Map([
  [T.FIREPLACE, { reach: 82, strength: 1.1 }],
  [T.WINDOW_I, { reach: 64, strength: 0.9 }],
  [T.LANTERN, { reach: 52, strength: 0.75 }],
  // A candle on every table: an inn full of them is an inn full of small lights.
  [T.TABLE, { reach: 46, strength: 0.6 }],
]);
const SHADOW = 0x120c07;
const AMBIENT = 0.42; // how much of the room is lit before any source

/**
 * Pure bake: the alpha channel is how dark each pixel is.
 * @param {number[][]} map
 */
export function bakeInteriorShadow(map) {
  const cols = map[0].length,
    rows = map.length;
  const width = cols * 16,
    height = rows * 16;
  const pixels = new Uint8ClampedArray(width * height * 4);
  const lamps = [];
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < cols; x++) {
      const source = SOURCES.get(map[y][x]);
      // Light falls into the room, so a source on a wall is treated as
      // standing one cell inside it rather than on the wall itself.
      if (source) lamps.push({ x: x * 16 + 8, y: y * 16 + 14, ...source });
    }
  if (!lamps.length) return { width, height, pixels };

  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      if (map[y >> 4][x >> 4] === T.VOID) continue;
      let light = AMBIENT;
      for (const lamp of lamps) {
        const d = Math.hypot(x - lamp.x, y - lamp.y);
        if (d >= lamp.reach) continue;
        const fall = 1 - d / lamp.reach;
        light += lamp.strength * fall ** 1.5;
      }
      const dark = Math.max(0, Math.min(1, 1 - light));
      const i = (y * width + x) * 4;
      pixels[i] = SHADOW >> 16;
      pixels[i + 1] = (SHADOW >> 8) & 255;
      pixels[i + 2] = SHADOW & 255;
      // Quantised, so the falloff reads as pixel art rather than a gradient.
      pixels[i + 3] = Math.round((dark * 178) / 8) * 8;
    }
  return { width, height, pixels };
}

// Chapter 1's two interiors. The houses in the later chapters stage their own
// light as part of their set pieces (the hearth at Crickhollow, the fire and
// the dream in Tom's house), so a second baked layer is left off them.
export const LIT_INTERIORS = new Set(['bagend', 'greendragon']);

export function drawInteriorLight(scene) {
  if (!LIT_INTERIORS.has(scene.zoneKey)) return;
  const map = scene.zone.map;

  const key = `interior-shadow-${scene.zoneKey}`;
  if (!scene.textures.exists(key)) {
    const { width, height, pixels } = bakeInteriorShadow(map);
    const canvas = scene.textures.createCanvas(key, width, height);
    const ctx = canvas.getContext();
    const image = ctx.createImageData(width, height);
    image.data.set(pixels);
    ctx.putImageData(image, 0, 0);
    canvas.refresh();
  }
  scene.add.image(0, 0, key).setOrigin(0).setDepth(5);

  // The fire itself. One pool per hearth, however many cells it spans.
  const hearths = [];
  for (let y = 0; y < map.length; y++)
    for (let x = 0; x < map[y].length; x++) {
      if (map[y][x] !== T.FIREPLACE) continue;
      if (map[y][x - 1] === T.FIREPLACE) continue; // the same fire, one cell on
      let span = 1;
      while (map[y][x + span] === T.FIREPLACE) span++;
      hearths.push({ x: x * 16 + span * 8, y: y * 16 + 16 });
    }
  for (const { x, y } of hearths) {
    const glow = scene.add
      .ellipse(x, y, 104, 74, 0xff9a3c, 0.18)
      .setDepth(6)
      .setBlendMode('ADD');
    const core = scene.add
      .ellipse(x, y - 4, 46, 34, 0xffd07a, 0.2)
      .setDepth(6)
      .setBlendMode('ADD');
    scene.tweens.add({
      targets: [glow, core],
      scaleX: 1.07,
      scaleY: 1.1,
      alpha: '-=0.05',
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }
}
