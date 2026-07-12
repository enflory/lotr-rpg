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

/* ── Elf template (20 rows) — tall, slender, circlet ────── */

const EL_DOWN = validateRows('EL_DOWN', [
  '.....oooooo.....',
  '....ohhllhho....',
  '...ohhlhhlhho...',
  '..ohhhhhhhhhho..',
  '..ohbbbbbbbbho..',
  '..ohSWESSEWSho..',
  '..ohsSSNNSSsho..',
  '...ohSSSSSSho...',
  '...ohhVVVVhho...',
  '..ohVVvVVvVVho..',
  '..oGVVVVVVVVGo..',
  '..oGVVVBBVVVGo..',
  '..oGVVVVVVVVGo..',
  '..oXVVVVVVVVXo..',
  '..oXVVVVVVVVXo..',
  '..oVVVVVVVVVVo..',
  '..oXVVVVVVVVXo..',
  '..oXVVVVVVVVXo..',
  '..oVVVVVVVVVVo..',
  '...oXXXXXXXXo...',
]);

const EL_UP = validateRows('EL_UP', [
  '.....oooooo.....',
  '....ohhllhho....',
  '...ohhlhhlhho...',
  '..ohhhhhhhhhho..',
  '..ohbbbbbbbbho..',
  '..ohhhhhhhhhho..',
  '..ohhlhhhhlhho..',
  '...ohhhhhhhho...',
  '...ohhhhhhhho...',
  '..ohVVhhhhVVho..',
  '..oGVVVVVVVVGo..',
  '..oGVVVVVVVVGo..',
  '..oGVVVVVVVVGo..',
  '..oXVVVVVVVVXo..',
  '..oXVVVVVVVVXo..',
  '..oVVVVVVVVVVo..',
  '..oXVVVVVVVVXo..',
  '..oXVVVVVVVVXo..',
  '..oVVVVVVVVVVo..',
  '...oXXXXXXXXo...',
]);

const EL_LEFT = validateRows('EL_LEFT', [
  '.....oooooo.....',
  '....ohhllhho....',
  '...ohhlhhlhho...',
  '..ohhhhhhhhhho..',
  '..ohbbbbbbhhho..',
  '..ohSESSSShhho..',
  '..ohsSNSSSshho..',
  '...ohSSSSShho...',
  '...ohhVVVVhho...',
  '..ohVVvVVVVVho..',
  '..oGVVVVVVVVGo..',
  '..oGVVBBVVVVGo..',
  '..oGVVVVVVVVGo..',
  '..oXVVVVVVVVXo..',
  '..oXVVVVVVVVXo..',
  '..oVVVVVVVVVVo..',
  '..oXVVVVVVVVXo..',
  '..oXVVVVVVVVXo..',
  '..oVVVVVVVVVVo..',
  '...oXXXXXXXXo...',
]);

const EL_RIGHT = mirrorRows(EL_LEFT);

/* ── Fox template (no feet — stubby legs are drawn via `extra`) ──
   Side view: alert stance, brush tail curled over the back with a white
   tip; white chest and muzzle, dark nose. Down view: pricked ears with
   lighter inner, eyes, white muzzle band. Up view: tail tip peeks below. */

const FOX_DOWN = validateRows('FOX_DOWN', [
  '...oo....oo.....',
  '..oFfo..ofFo....',
  '..oFFooooFFo....',
  '..oFFFFFFFFo....',
  '..oFEFFFFEFo....',
  '..oFWWNNWWFo....',
  '..oFFWWWWFFo....',
  '...oFFFFFFo.....',
  '...oFFFFFFo.....',
  '....oFFFFo......',
]);

const FOX_UP = validateRows('FOX_UP', [
  '...oo....oo.....',
  '..oFFo..oFFo....',
  '..oFFooooFFo....',
  '..oFFFFFFFFo....',
  '..oFFFFFFFFo....',
  '..oFFFFFFFFo....',
  '...oFFFFFFo.....',
  '...oFFFFFFo.....',
  '....oFFFFo......',
  '.....oWWo.......',
]);

const FOX_LEFT = validateRows('FOX_LEFT', [
  '.oo.oo..........',
  '.oFooFo.....oo..',
  '.oFFFFo....oWWo.',
  'oFEFFFFo...oWWFo',
  'oNFFFFFo..oFFFo.',
  '.oWFFFFFooFFFo..',
  '.oWWFFFFFFFFo...',
  '..oFFFFFFFFFo...',
  '..oFFooooFFo....',
]);

const FOX_RIGHT = mirrorRows(FOX_LEFT);

/* ── Dog template (no feet — stubby legs are drawn via `extra`) ──
   Maggot's dogs are big and wolvish: pricked ears, deep white chest,
   blunt muzzle, raised tail with no white tip (that's the fox's mark). */

const DOG_DOWN = validateRows('DOG_DOWN', [
  '..oo......oo....',
  '.oDDo....oDDo...',
  '.oDDooooooDDo...',
  '..oDDDDDDDDo....',
  '..oDEDDDDEDo....',
  '..oDDWNNWDDo....',
  '..oDWWWWWWDo....',
  '..oDDDDDDDDo....',
  '...oDDDDDDo.....',
  '....oDDDDo......',
]);

const DOG_UP = validateRows('DOG_UP', [
  '..oo......oo....',
  '.oDDo....oDDo...',
  '.oDDooooooDDo...',
  '..oDDDDDDDDo....',
  '..oDDDDDDDDo....',
  '..oDDDDDDDDo....',
  '..oDDDDDDDDo....',
  '...oDDDDDDo.....',
  '....oDDDDo......',
  '.....oDo........',
]);

const DOG_LEFT = validateRows('DOG_LEFT', [
  '.oo.oo..........',
  '.oDooDo.........',
  '.oDDDDo.....oDDo',
  'oDEDDDDo...oDDo.',
  'oNDDDDDo...oDDo.',
  '.oWDDDDDDDDDDo..',
  '.oWWDDDDDDDDDo..',
  '..oDDDDDDDDDo...',
  '..oDDooooDDDo...',
]);

const DOG_RIGHT = mirrorRows(DOG_LEFT);

/* Four stubby legs (2×2) under a quadruped body, planted below the
   haunches, with the walk shuffle. Positions assume the left-facing
   template; the right facing mirrors them along with the body. */
function quadLegs(maps, color) {
  return (c, x, y, dir, frame) => {
    const legY = y + maps[dir].length;
    const legOff = frame === 0 ? 0 : frame === 1 ? -1 : 1;
    let xs =
      dir === 'left' || dir === 'right' ? [3 + legOff, 9 - legOff] : [4 + legOff, 8 - legOff];
    if (dir === 'right') xs = xs.map((lx) => 14 - lx);
    for (const lx of xs) rc(c, x + lx, legY, 2, 2, color);
  };
}

const DOG = { down: DOG_DOWN, left: DOG_LEFT, right: DOG_RIGHT, up: DOG_UP };

/* ── palettes ───────────────────────────────────────────── */
// Shared slots: o outline · H/h/l hair dark/mid/light · S/s skin/shade ·
// E eye · W eye-white · N mouth · C/c collar/vest · V/v/G shirt or dress
// mid/light/dark · B/b belt+buckle or sash · P/p pants/shade.

const HOBBIT_SKIN = { S: '#f0c8a0', s: '#d0a878', E: '#181830', W: '#e0d8d0', N: '#c09070' };
const OUTLINE = '#181008';

const MALE = { down: M_DOWN, left: M_LEFT, right: M_RIGHT, up: M_UP };
const FEMALE = { down: F_DOWN, left: F_LEFT, right: F_RIGHT, up: F_UP };
const WIZARD = { down: GD_DOWN, left: GD_LEFT, right: GD_RIGHT, up: GD_UP };
const FOX = { down: FOX_DOWN, left: FOX_LEFT, right: FOX_RIGHT, up: FOX_UP };
const ELF = { down: EL_DOWN, left: EL_LEFT, right: EL_RIGHT, up: EL_UP };

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

  bilbo: {
    maps: MALE,
    pal: {
      o: OUTLINE, ...HOBBIT_SKIN,
      H: '#6a5a40', h: '#8a7a58', l: '#a89a74', // greying curls
      C: '#f0e8d0', c: '#d0c4a8',
      V: '#3a6a2a', v: '#4e8a3a', G: '#2a4e1e', // green waistcoat
      B: '#301810', b: '#e0c050', // bright brass buttons
      P: '#7a3a28', p: '#552818', // plum breeches
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

  mrsmaggot: {
    maps: FEMALE,
    pal: {
      o: OUTLINE, ...HOBBIT_SKIN,
      H: '#5a4a35', h: '#7a6a50', l: '#9a8a6c',
      C: '#f0e8d0', c: '#d0c4a8',
      V: '#a05838', v: '#c07048', G: '#7a4028',
      B: '#2e4868', b: '#e0d0b0',
    },
    feet: ['#d8b080', '#b89060'],
  },

  ted: {
    maps: MALE,
    pal: {
      o: OUTLINE, ...HOBBIT_SKIN,
      H: '#3a2a15', h: '#5c4222', l: '#7a5c30',
      C: '#b8b0a0', c: '#989080',
      V: '#7a4028', v: '#96562e', G: '#582c1a',
      B: '#301810', b: '#909090',
      P: '#4a4438', p: '#322e24',
    },
    feet: ['#d8b080', '#b89060'],
  },

  sandyman: {
    maps: MALE,
    pal: {
      o: OUTLINE, ...HOBBIT_SKIN,
      H: '#6a5a48', h: '#8a7a64', l: '#a89a84',
      C: '#e8e4d8', c: '#c8c4b0',
      V: '#7a7460', v: '#928c74', G: '#5a5648',
      B: '#301810', b: '#8a8a70',
      P: '#4a4438', p: '#322e24',
    },
    feet: ['#d0ac82', '#b08c62'],
  },

  noakes: {
    maps: MALE,
    pal: {
      o: OUTLINE, ...HOBBIT_SKIN,
      H: '#909090', h: '#b8b8b8', l: '#d8d8d8',
      C: '#d8ccb0', c: '#b8ac90',
      V: '#8a5a2a', v: '#a87038', G: '#66421e',
      B: '#301810', b: '#a08030',
      P: '#3a3428', p: '#282418',
    },
    feet: ['#d0ac82', '#b08c62'],
  },

  twofoot: {
    maps: MALE,
    pal: {
      o: OUTLINE, ...HOBBIT_SKIN,
      H: '#4a3520', h: '#6a4e2c', l: '#8a6a3c',
      C: '#e0d4c0', c: '#c0b4a0',
      V: '#a08030', v: '#c0a040', G: '#786020',
      B: '#301810', b: '#c09030',
      P: '#5a4030', p: '#3e2c20',
    },
    feet: ['#d0ac82', '#b08c62'],
  },

  maggot: {
    maps: MALE,
    pal: {
      o: OUTLINE,
      S: '#e8b890', s: '#c89868', E: '#181830', W: '#e0d8d0', N: '#b08060', // ruddy farmer
      H: '#4a3520', h: '#6a4e2c', l: '#8a6a3c',
      C: '#d8c8a0', c: '#b8a880',
      V: '#8a4a2a', v: '#a86038', G: '#6a3a1e', // russet jerkin
      B: '#301810', b: '#a08030',
      P: '#4a4030', p: '#343024',
    },
    feet: ['#d0ac82', '#b08c62'],
    // Broad-brimmed straw hat.
    extra(c, x, y) {
      rc(c, x + 5, y, 6, 1, '#a08030');
      rc(c, x + 5, y + 1, 6, 1, '#c8a850');
      rc(c, x + 3, y + 2, 10, 1, '#b89440');
    },
  },

  merry: {
    maps: MALE,
    pal: {
      o: OUTLINE, ...HOBBIT_SKIN,
      H: '#7a5828', h: '#a87838', l: '#c89848',
      C: '#e8cc50', c: '#c8a840', // bright yellow scarf
      V: '#4a7a3a', v: '#5e9a4a', G: '#365c2a', // Brandybuck green
      B: '#301810', b: '#c09030',
      P: '#5a4a68', p: '#3e3448',
    },
    feet: ['#d8b080', '#b89060'],
  },

  gildor: {
    maps: ELF,
    pal: {
      o: '#1c1c22',
      S: '#f4dcc0', s: '#dcc0a0', E: '#28304a', W: '#f0ece4', N: '#c8a080',
      h: '#e8d070', l: '#f8ec9a', b: '#e8c840',
      V: '#c8d4dc', v: '#e4ecf2', G: '#98a8b4', X: '#7a8a98',
      B: '#8898a8',
    },
    feet: ['#8898a8', '#68788a'],
  },

  elf_a: {
    maps: ELF,
    pal: {
      o: '#1c1c22',
      S: '#f4dcc0', s: '#dcc0a0', E: '#28304a', W: '#f0ece4', N: '#c8a080',
      h: '#3a3a4a', l: '#55556a', b: '#e8c840',
      V: '#b8c8d8', v: '#d8e4ee', G: '#8ea0b0', X: '#7a8a98',
      B: '#8898a8',
    },
    feet: ['#8898a8', '#68788a'],
  },

  elf_b: {
    maps: ELF,
    pal: {
      o: '#1c1c22',
      S: '#f4dcc0', s: '#dcc0a0', E: '#28304a', W: '#f0ece4', N: '#c8a080',
      h: '#e8d070', l: '#f8ec9a', b: '#e8c840',
      V: '#d8cca0', v: '#ece4c0', G: '#a89870', X: '#7a8a98',
      B: '#8898a8',
    },
    feet: ['#8898a8', '#68788a'],
  },

  elf_c: {
    maps: ELF,
    pal: {
      o: '#1c1c22',
      S: '#f4dcc0', s: '#dcc0a0', E: '#28304a', W: '#f0ece4', N: '#c8a080',
      h: '#3a3a4a', l: '#55556a', b: '#e8c840',
      V: '#a8a8bc', v: '#c4c4d4', G: '#82828f', X: '#7a8a98',
      B: '#8898a8',
    },
    feet: ['#8898a8', '#68788a'],
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

  fox: {
    maps: FOX,
    pal: { o: '#14141a', F: '#c06a28', f: '#d88a4a', W: '#e8e4d8', E: '#181018', N: '#181018' },
    noFeet: true,
    extra: quadLegs(FOX, '#8a4a1e'),
  },

  // Farmer Maggot's dogs, loose in the marsh — Bamfurlong's errand.
  // Same quadruped idiom as the fox (noFeet + `extra` legs). Grip's coat
  // is near-black, so his eye is amber to keep the face readable.
  grip: {
    maps: DOG,
    pal: { o: '#14141a', D: '#34343c', W: '#e8e4d8', E: '#c8a850', N: '#0a0a0e' },
    noFeet: true,
    extra: quadLegs(DOG, '#181820'),
  },

  fang: {
    maps: DOG,
    pal: { o: '#14141a', D: '#6a4a2a', W: '#e8e4d8', E: '#181018', N: '#181018' },
    noFeet: true,
    extra: quadLegs(DOG, '#4a3218'),
  },

  wolf: {
    maps: DOG,
    pal: { o: '#14141a', D: '#8a8a90', W: '#e8e4d8', E: '#181018', N: '#0a0a0e' },
    noFeet: true,
    extra: quadLegs(DOG, '#5a5a60'),
  },
};

export const CHAR_NAMES = Object.keys(CHAR_DEFS);

/* ── sheet builder ──────────────────────────────────────── */

/* ── Black Rider — mounted, side view, 32×32, 2 gallop frames ── */
// Frame 0 faces right; ShireScene flips with setFlipX for leftward travel.

export function makeRiderSheet() {
  const FW = 32, FH = 32;
  const canvas = document.createElement('canvas');
  canvas.width = FW * 2;
  canvas.height = FH;
  const c = canvas.getContext('2d');

  const K = '#08080c';   // near-black outline
  const B = '#16161e';   // body black
  const b = '#26262f';   // highlight
  const M = '#101018';   // mane/tail

  for (let frame = 0; frame < 2; frame++) {
    const x = frame * FW;

    // Horse body — heavy black mass
    rc(c, x + 6, 14, 18, 8, K);
    rc(c, x + 7, 15, 16, 6, B);
    rc(c, x + 9, 15, 8, 2, b);
    rc(c, x + 23, 15, 3, 5, B);
    // Neck + head (rightward)
    rc(c, x + 22, 9, 4, 7, K);
    rc(c, x + 23, 10, 2, 6, B);
    rc(c, x + 24, 7, 5, 4, K);
    rc(c, x + 25, 8, 4, 2, B);
    px(c, x + 28, 8, b); // muzzle
    px(c, x + 26, 7, '#801818'); // baleful eye
    // Ears
    px(c, x + 24, 6, K); px(c, x + 26, 6, K);
    // Mane
    rc(c, x + 21, 8, 2, 7, M);
    // Tail streaming left
    rc(c, x + 4, 14, 3, 2, M);
    rc(c, x + 2, 15, 3, 2, M);
    px(c, x + 1, 17, M); px(c, x + 2, 17, M);

    // Legs — alternate gallop poses
    if (frame === 0) {
      rc(c, x + 8, 22, 2, 7, K);   // fore-back
      rc(c, x + 12, 22, 2, 6, K);
      rc(c, x + 18, 22, 2, 6, K);
      rc(c, x + 22, 22, 2, 7, K);  // hind-front
    } else {
      rc(c, x + 7, 22, 2, 6, K);
      rc(c, x + 11, 23, 2, 6, K);
      rc(c, x + 19, 23, 2, 6, K);
      rc(c, x + 23, 22, 2, 6, K);
    }

    // Rider — hooded black cloak
    rc(c, x + 12, 4, 6, 11, K);      // cloaked torso
    rc(c, x + 13, 5, 4, 9, B);
    rc(c, x + 13, 2, 5, 4, K);       // hood
    rc(c, x + 14, 3, 3, 2, B);
    px(c, x + 17, 4, '#000006');     // hood void — no face
    px(c, x + 16, 4, '#000006');
    // Cloak billowing behind
    rc(c, x + 9, 6, 3, 8, K);
    rc(c, x + 10, 7, 2, 6, B);
    // Arm/rein
    px(c, x + 18, 8, B); px(c, x + 19, 9, B); px(c, x + 20, 10, b);
  }

  return canvas.toDataURL();
}

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
      if (!def.noFeet) {
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
      }

      if (def.extra) def.extra(c, fx, fy + bodyTop, dir, frame);
    }
  }

  return canvas.toDataURL();
}
