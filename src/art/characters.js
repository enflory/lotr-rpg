// Character spritesheets — 16×24 frames, 3 walk frames × 4 directions
// (rows: down, left, right, up). JRPG-outlined pixel-map style.
//
// Hobbits share two 18-row body templates (male / female) recolored by a
// per-character palette. Gandalf has his own 20-row template. Feet (bare
// hobbit feet or boots) are appended programmatically so the walk cycle
// can shuffle them.

import { px, rc, drawPixelMap, mirrorRows, validateRows } from './helpers.js';

export const CH = 24; // frame height
const TS = 16;        // frame width

/* ── male hobbit template (18 rows) ─────────────────────── */

const M_DOWN = validateRows('M_DOWN', [
  '.....oooooo.....',
  '....oHHhhHHo....',
  '...oHhhlhlhHo...',
  '..ooHhhhhhHhoo..',
  '..oHhSSSSSShHo..',
  '..ohSWESSEWSho..',
  '..osSSSNNSSSso..',
  '...osSSSSSSso...',
  '....osCCCCso....',
  '...oVVCccCVVo...',
  '..oVVvVVVVvVVo..',
  '..oGVVVVVVVVGo..',
  '..oGVVVBBVVVGo..',
  '...oVVBbbBVVo...',
  '...oPPPPPPPPo...',
  '...oPPpPPpPPo...',
  '....oPPPPPPo....',
  '.....opPPpo.....',
]);

const M_UP = validateRows('M_UP', [
  '.....oooooo.....',
  '....oHHhhHHo....',
  '...oHhhlhlhHo...',
  '..ooHhhhhhHhoo..',
  '..oHHhHhHhHHHo..',
  '..oHHHHHHHHHHo..',
  '..ohHHhHhHHhho..',
  '...ohHHHHHHho...',
  '....osCCCCso....',
  '...oVVCccCVVo...',
  '..oVVVVVVVVVVo..',
  '..oGVVVVVVVVGo..',
  '..oGVVVBBVVVGo..',
  '...oVVBBBBVVo...',
  '...oPPPPPPPPo...',
  '...oPPpPPpPPo...',
  '....oPPPPPPo....',
  '.....opPPpo.....',
]);

const M_LEFT = validateRows('M_LEFT', [
  '.....oooooo.....',
  '....oHHhhHHo....',
  '...oHhhlhlhHo...',
  '..ooHhhhhhHhoo..',
  '..oHhSSSSSHHHo..',
  '..oSESSSSSHHho..',
  '..osSNSSSSssho..',
  '...osSSSSSSso...',
  '....osCCCCso....',
  '...oVVCccCVVo...',
  '..oVVvVVVVvVVo..',
  '..oGVVVVVVVVGo..',
  '..oGVVVBBVVVGo..',
  '...oVVBbbBVVo...',
  '...oPPPPPPPPo...',
  '...oPPpPPpPPo...',
  '....oPPPPPPo....',
  '.....opPPpo.....',
]);

const M_RIGHT = mirrorRows(M_LEFT);

/* ── female hobbit template (18 rows) ───────────────────── */

const F_DOWN = validateRows('F_DOWN', [
  '.....oooooo.....',
  '....oHHhhHHo....',
  '...oHhhlhlhHo...',
  '..oHhhhhhhhhHo..',
  '..oHhSSSSSShHo..',
  '..oHSWESSEWSHo..',
  '..oHsSSNNSSsHo..',
  '...oHSSSSSSHo...',
  '....osCCCCso....',
  '...oVVCccCVVo...',
  '..oVVvVVVVvVVo..',
  '..oGVVBbbBVVGo..',
  '..oGVVVVVVVVGo..',
  '..oVVVVVVVVVVo..',
  '.oVvVVVVVVVVvVo.',
  '.oVVVVVVVVVVVVo.',
  '.oGVVGVVVVGVVGo.',
  '..oooooooooooo..',
]);

const F_UP = validateRows('F_UP', [
  '.....oooooo.....',
  '....oHHhhHHo....',
  '...oHhhlhlhHo...',
  '..oHhhhhhhhhHo..',
  '..oHHhHhHhHHHo..',
  '..oHHHHHHHHHHo..',
  '..oHhHHhhHHhHo..',
  '...oHHHHHHHHo...',
  '....oHHHHHHo....',
  '...oVVVVVVVVo...',
  '..oVVvVVVVvVVo..',
  '..oGVVBBBBVVGo..',
  '..oGVVVVVVVVGo..',
  '..oVVVVVVVVVVo..',
  '.oVvVVVVVVVVvVo.',
  '.oVVVVVVVVVVVVo.',
  '.oGVVGVVVVGVVGo.',
  '..oooooooooooo..',
]);

const F_LEFT = validateRows('F_LEFT', [
  '.....oooooo.....',
  '....oHHhhHHo....',
  '...oHhhlhlhHo...',
  '..oHhhhhhhhhHo..',
  '..oHhSSSSSHHHo..',
  '..oHSESSSSHHho..',
  '..oHsSNSSSssho..',
  '...oHSSSSSHHo...',
  '....osCCCCso....',
  '...oVVVCcVVVo...',
  '..oVVvVVVVVVVo..',
  '..oGVVBbBVVVGo..',
  '..oGVVVVVVVVGo..',
  '..oVVVVVVVVVVo..',
  '.oVvVVVVVVVVvVo.',
  '.oVVVVVVVVVVVVo.',
  '.oGVVGVVVVGVVGo.',
  '..oooooooooooo..',
]);

const F_RIGHT = mirrorRows(F_LEFT);

/* ── Gandalf template (20 rows) ─────────────────────────── */

const GD_DOWN = validateRows('GD_DOWN', [
  '.......oo.......',
  '......oAAo......',
  '......oAAo......',
  '.....oAAAAo.....',
  '.....oaAAao.....',
  '....oAAAAAAo....',
  '..ooaaAAAAaaoo..',
  '...oSSESSESSo...',
  '...oWsSNNSsWo...',
  '..oWWWWWWWWWWo..',
  '..oWWwWWWWwWWo..',
  '..oRRWWWWWWRRo..',
  '..oRRrWWWWrRRo..',
  '..oRRrWwwWrRRo..',
  '..oRRRRwwRRRRo..',
  '..oXRRRRRRRRXo..',
  '..oXRRRRRRRRXo..',
  '..oRRRRRRRRRRo..',
  '..oXRRRRRRRRXo..',
  '...oXXXXXXXXo...',
]);

const GD_UP = validateRows('GD_UP', [
  '.......oo.......',
  '......oAAo......',
  '......oAAo......',
  '.....oAAAAo.....',
  '.....oaAAao.....',
  '....oAAAAAAo....',
  '..ooaaAAAAaaoo..',
  '...owwwwwwwwo...',
  '...owwwwwwwwo...',
  '..oRRwwwwwwRRo..',
  '..oRRRwwwwRRRo..',
  '..oRRRRRRRRRRo..',
  '..oRRrRRRRrRRo..',
  '..oRRrRRRRrRRo..',
  '..oRRRRRRRRRRo..',
  '..oXRRRRRRRRXo..',
  '..oXRRRRRRRRXo..',
  '..oRRRRRRRRRRo..',
  '..oXRRRRRRRRXo..',
  '...oXXXXXXXXo...',
]);

const GD_LEFT = validateRows('GD_LEFT', [
  '.......oo.......',
  '......oAAo......',
  '......oAAo......',
  '.....oAAAAo.....',
  '.....oaAAao.....',
  '....oAAAAAAo....',
  '..ooaaAAAAaaoo..',
  '...oSSESWWWWo...',
  '...oWWWWWWWWo...',
  '..oWWWWWWWWWWo..',
  '..oWWwWWWWwWWo..',
  '..oRRWWWWWWRRo..',
  '..oRRrWWWWrRRo..',
  '..oRRrWwwWrRRo..',
  '..oRRRRwwRRRRo..',
  '..oXRRRRRRRRXo..',
  '..oXRRRRRRRRXo..',
  '..oRRRRRRRRRRo..',
  '..oXRRRRRRRRXo..',
  '...oXXXXXXXXo...',
]);

const GD_RIGHT = mirrorRows(GD_LEFT);

/* ── palettes ───────────────────────────────────────────── */
// Shared slots: o outline · H/h/l hair dark/mid/light · S/s skin/shade ·
// E eye · W eye-white · N mouth · C/c collar/vest · V/v/G shirt or dress
// mid/light/dark · B/b belt+buckle or sash · P/p pants/shade.

const HOBBIT_SKIN = { S: '#f0c8a0', s: '#d0a878', E: '#181830', W: '#e0d8d0', N: '#c09070' };
const OUTLINE = '#181008';

const MALE = { down: M_DOWN, left: M_LEFT, right: M_RIGHT, up: M_UP };
const FEMALE = { down: F_DOWN, left: F_LEFT, right: F_RIGHT, up: F_UP };
const WIZARD = { down: GD_DOWN, left: GD_LEFT, right: GD_RIGHT, up: GD_UP };

export const CHAR_DEFS = {
  frodo: {
    maps: MALE,
    pal: {
      o: OUTLINE, ...HOBBIT_SKIN,
      H: '#4a2510', h: '#6a3a1a', l: '#8a5528',
      C: '#e0d4c0', c: '#c0b098',
      V: '#287028', v: '#389838', G: '#185018',
      B: '#301810', b: '#c09030',
      P: '#6a4828', p: '#4a3018',
    },
    feet: ['#d8b080', '#b89060'],
  },

  sam: {
    maps: MALE,
    pal: {
      o: OUTLINE, ...HOBBIT_SKIN,
      H: '#5a3a15', h: '#8a5c28', l: '#b07c38',
      C: '#c8a868', c: '#a88848',
      V: '#96702e', v: '#b08838', G: '#6a4e1e',
      B: '#301810', b: '#c09030',
      P: '#5a6030', p: '#3e4420',
    },
    feet: ['#d8b080', '#b89060'],
  },

  gaffer: {
    maps: MALE,
    pal: {
      o: OUTLINE,
      S: '#e0bc92', s: '#c09c72', E: '#181830', W: '#ded6cc', N: '#b08a64',
      H: '#888888', h: '#b0b0b0', l: '#d0d0d0',
      C: '#b0a080', c: '#908060',
      V: '#6a6a45', v: '#828a58', G: '#4e4e30',
      B: '#301810', b: '#8a8a70',
      P: '#4a3a28', p: '#32281a',
    },
    feet: ['#d0ac82', '#b08c62'],
  },

  lobelia: {
    maps: FEMALE,
    pal: {
      o: OUTLINE, ...HOBBIT_SKIN,
      H: '#2a1e12', h: '#4a3520', l: '#6a5030',
      C: '#d8c8e0', c: '#b8a0c8',
      V: '#6a3a7a', v: '#8a55a0', G: '#4a2858',
      B: '#3a1f48', b: '#c8a040',
    },
    feet: ['#d8b080', '#b89060'],
    // Prim little dark hat perched on top.
    extra(c, x, y) {
      rc(c, x + 5, y, 6, 1, '#181008');
      rc(c, x + 5, y + 1, 6, 1, '#3a2a3a');
      rc(c, x + 4, y + 2, 8, 1, '#4a3549');
      px(c, x + 10, y + 1, '#c04060'); // hat flower
    },
  },

  rosie: {
    maps: FEMALE,
    pal: {
      o: OUTLINE, ...HOBBIT_SKIN,
      H: '#8a5c20', h: '#c08838', l: '#e0a848',
      C: '#f0e8d0', c: '#d0c4a8',
      V: '#4a70a0', v: '#6a90c4', G: '#345078',
      B: '#2e4868', b: '#e0d0b0',
    },
    feet: ['#d8b080', '#b89060'],
  },

  gandalf: {
    maps: WIZARD,
    pal: {
      o: '#14141a',
      S: '#e0c8a8', s: '#c0a888', E: '#1a1a20',
      A: '#6a6a78', a: '#8a8a98',
      W: '#d8d8dd', w: '#b4b4bc',
      R: '#7a7a88', r: '#9595a2', X: '#585866',
      N: '#c09070',
    },
    feet: ['#4a3828', '#32281c'],
    // Staff held at his side, in every facing.
    extra(c, x, y, dir) {
      const sx = dir === 'left' ? x + 1 : x + 14;
      rc(c, sx, y + 7, 1, 15, '#8a6b3d');
      px(c, sx, y + 12, '#6a4f2d');
      px(c, sx, y + 17, '#6a4f2d');
      px(c, sx, y + 6, '#e8c840');
      px(c, sx, y + 5, '#f8e880');
    },
  },
};

export const CHAR_NAMES = Object.keys(CHAR_DEFS);

/* ── sheet builder ──────────────────────────────────────── */

const DIR_ORDER = ['down', 'left', 'right', 'up']; // sheet row order

export function makeCharSheet(name) {
  const def = CHAR_DEFS[name];
  const canvas = document.createElement('canvas');
  canvas.width = 3 * TS;
  canvas.height = 4 * CH;
  const c = canvas.getContext('2d');
  const ol = def.pal.o;

  for (let di = 0; di < 4; di++) {
    const dir = DIR_ORDER[di];
    const body = def.maps[dir];
    const bodyTop = CH - 4 - body.length; // feet take 2 rows, 2px bottom margin

    for (let frame = 0; frame < 3; frame++) {
      const fx = frame * TS;
      const fy = di * CH;

      drawPixelMap(c, fx, fy + bodyTop, body, def.pal);

      // Feet (bare hobbit feet or boots) with simple shuffle animation.
      const legOff = frame === 0 ? 0 : frame === 1 ? -1 : 1;
      const footY = fy + bodyTop + body.length;
      const [fc, fs] = def.feet;
      for (const bx of [3 + legOff, 8 - legOff]) {
        px(c, fx + bx, footY, ol);
        rc(c, fx + bx + 1, footY, 3, 1, fc);
        px(c, fx + bx + 4, footY, ol);
        px(c, fx + bx, footY + 1, ol);
        rc(c, fx + bx + 1, footY + 1, 3, 1, fs);
        px(c, fx + bx + 4, footY + 1, ol);
      }

      if (def.extra) def.extra(c, fx, fy + bodyTop, dir, frame);
    }
  }

  return canvas.toDataURL();
}
