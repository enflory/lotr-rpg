// UI sprites (interaction hint bubble, etc.)

import { px, rc } from './helpers.js';

export function makeHintSprite() {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const c = canvas.getContext('2d');
  // Small speech bubble with "..."
  rc(c, 2, 4, 12, 8, '#f0ead6');
  rc(c, 3, 3, 10, 10, '#f0ead6');
  rc(c, 7, 12, 2, 2, '#f0ead6');
  // Outline
  rc(c, 3, 3, 10, 1, '#222');
  rc(c, 3, 12, 10, 1, '#222');
  rc(c, 2, 4, 1, 8, '#222');
  rc(c, 13, 4, 1, 8, '#222');
  // Arrow
  rc(c, 7, 13, 1, 1, '#222');
  rc(c, 8, 13, 1, 1, '#222');
  rc(c, 8, 14, 1, 1, '#222');
  // Dots
  px(c, 5, 7, '#222');
  px(c, 8, 7, '#222');
  px(c, 11, 7, '#222');
  return canvas.toDataURL();
}
