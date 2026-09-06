// Item icons — 12×12 icons drawn onto one horizontal strip canvas.
// Order must match ITEM_KEYS in src/data/items.js.

import { px, rc } from './helpers.js';

const IS = 12;
const OUTLINE = '#241a10';

function drawMushroom(c, ox) {
  // Cap
  rc(c, ox + 2, 2, 8, 4, OUTLINE);
  rc(c, ox + 3, 3, 6, 2, '#a5523c');
  px(c, ox + 4, 3, '#e8d8c0');
  px(c, ox + 7, 4, '#e8d8c0');
  rc(c, ox + 2, 5, 8, 1, '#8a3e2c');
  // Stalk
  rc(c, ox + 4, 6, 4, 4, OUTLINE);
  rc(c, ox + 5, 7, 2, 3, '#e8d8c0');
  rc(c, ox + 3, 10, 6, 1, OUTLINE);
}

function drawMathom(c, ox) {
  rc(c, ox + 2, 3, 8, 6, OUTLINE);
  rc(c, ox + 3, 4, 6, 4, '#e0c050');
  rc(c, ox + 3, 6, 6, 1, '#8a6b3d');
  px(c, ox + 5, 2, OUTLINE);
  px(c, ox + 6, 2, '#e0c050');
  rc(c, ox + 4, 8, 4, 1, OUTLINE);
}

function drawSpoons(c, ox) {
  // Two crossed spoons — bowl + handle each, one diagonal one the other.
  for (const [dx, dy] of [
    [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7], [8, 8],
  ]) {
    px(c, ox + dx, dy, OUTLINE);
    px(c, ox + dx + 1, dy, '#c0c8d0');
  }
  rc(c, ox + 1, 1, 3, 3, OUTLINE);
  rc(c, ox + 2, 2, 1, 1, '#e0e6ec');
  for (const [dx, dy] of [
    [9, 2], [8, 3], [7, 4], [6, 5], [5, 6], [4, 7], [3, 8],
  ]) {
    px(c, ox + dx, dy, OUTLINE);
    px(c, ox + dx - 1, dy, '#c0c8d0');
  }
  rc(c, ox + 8, 1, 3, 3, OUTLINE);
  rc(c, ox + 9, 2, 1, 1, '#e0e6ec');
}

function drawAleMug(c, ox) {
  rc(c, ox + 3, 2, 6, 8, OUTLINE);
  rc(c, ox + 4, 4, 4, 5, '#8a6b3d');
  rc(c, ox + 4, 3, 4, 1, '#f0e6c8');
  px(c, ox + 5, 2, '#f0e6c8');
  px(c, ox + 6, 2, '#f0e6c8');
  // Handle
  rc(c, ox + 9, 3, 1, 4, OUTLINE);
  px(c, ox + 8, 3, OUTLINE);
  px(c, ox + 8, 6, OUTLINE);
  rc(c, ox + 3, 10, 6, 1, OUTLINE);
}

function drawCrate(c, ox) {
  rc(c, ox + 1, 5, 8, 6, OUTLINE);
  rc(c, ox + 2, 6, 6, 4, '#a5823c');
  rc(c, ox + 1, 8, 8, 1, '#8a6b3d');
  // Rocket sticking out the top
  rc(c, ox + 4, 1, 2, 4, OUTLINE);
  rc(c, ox + 5, 2, 1, 3, '#e04040');
  px(c, ox + 5, 0, '#e04040');
}

function drawProvisions(c, ox) {
  // Leaf underneath
  rc(c, ox + 1, 8, 10, 2, '#4e7030');
  px(c, ox + 0, 9, '#4e7030');
  px(c, ox + 11, 9, '#4e7030');
  // Loaf
  rc(c, ox + 2, 3, 8, 5, OUTLINE);
  rc(c, ox + 3, 4, 6, 3, '#f0e6c8');
  px(c, ox + 4, 4, '#e0d0a8');
  px(c, ox + 7, 4, '#e0d0a8');
  px(c, ox + 5, 5, '#e0d0a8');
}

function drawBasket(c, ox) {
  rc(c, ox + 1, 5, 10, 6, OUTLINE);
  rc(c, ox + 2, 6, 8, 4, '#b08c48');
  for (const dy of [7, 8]) rc(c, ox + 2, dy, 8, 1, '#8a6b3d');
  // Mushroom tops peeking out
  rc(c, ox + 3, 2, 3, 3, OUTLINE);
  rc(c, ox + 4, 3, 1, 1, '#a5523c');
  rc(c, ox + 7, 3, 3, 3, OUTLINE);
  rc(c, ox + 8, 4, 1, 1, '#a5523c');
}

function drawBarrowBlades(c,ox) {
  for(const x of [1,4,7,10]) {
    rc(c,ox+x,2,1,6,'#cfdbcd');
    px(c,ox+x,1,'#f4f0ce');
    rc(c,ox+x-1,7,3,1,'#c9a64f');
    rc(c,ox+x,8,1,3,'#9d5038');
  }
}
function drawTomSong(c,ox) {
  // A blue musical note with a gold echo; a memory token.
  rc(c,ox+4,2,1,7,'#68b4d8');
  rc(c,ox+4,2,6,2,'#68b4d8');
  rc(c,ox+9,3,1,5,'#68b4d8');
  rc(c,ox+2,8,3,2,'#edcf66');
  rc(c,ox+7,7,3,2,'#edcf66');
}

export const ICON_FNS = [
  drawMushroom,
  drawMathom,
  drawSpoons,
  drawAleMug,
  drawCrate,
  drawProvisions,
  drawBasket,
  drawBarrowBlades,
  drawTomSong,
];

export function makeItemIconsDataURL() {
  const canvas = document.createElement('canvas');
  canvas.width = ICON_FNS.length * IS;
  canvas.height = IS;
  const c = canvas.getContext('2d');
  ICON_FNS.forEach((fn, i) => fn(c, i * IS));
  return canvas.toDataURL();
}
