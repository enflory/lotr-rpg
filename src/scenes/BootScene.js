import Phaser from 'phaser';

const TS = 16;
const TILE_COUNT = 15;

/* ── tiny drawing helpers ────────────────────────────── */
function px(c, x, y, col) { c.fillStyle = col; c.fillRect(x, y, 1, 1); }
function rc(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(x, y, w, h); }
function circle(c, cx, cy, r, col) {
  c.fillStyle = col;
  for (let dy = -r; dy <= r; dy++)
    for (let dx = -r; dx <= r; dx++)
      if (dx * dx + dy * dy <= r * r) c.fillRect(cx + dx, cy + dy, 1, 1);
}

/* ── tile drawing (each tile drawn at ox,0 on a 16-high strip) ── */

function drawGrass(c, ox) {
  rc(c, ox, 0, 16, 16, '#5a9e3a');
  for (const [dx, dy, col] of [[3,4,'#4a8630'],[10,2,'#4a8630'],[7,9,'#4a8630'],[1,12,'#6eb848'],[13,7,'#6eb848'],[5,14,'#4a8630'],[12,11,'#6eb848'],[8,1,'#4a8630']])
    px(c, ox + dx, dy, col);
}

function drawGrass2(c, ox) {
  rc(c, ox, 0, 16, 16, '#4e9235');
  for (const [dx, dy, col] of [[5,3,'#3d7a2a'],[11,6,'#3d7a2a'],[2,10,'#5ea840'],[8,13,'#3d7a2a'],[14,1,'#5ea840'],[6,8,'#3d7a2a'],[0,5,'#5ea840']])
    px(c, ox + dx, dy, col);
}

function drawPath(c, ox) {
  rc(c, ox, 0, 16, 16, '#c4a265');
  for (const [dx, dy, col] of [[2,3,'#b09050'],[9,7,'#b09050'],[5,12,'#d4b278'],[13,5,'#b09050'],[7,1,'#d4b278'],[11,14,'#b09050'],[3,9,'#d4b278'],[14,11,'#b09050']])
    px(c, ox + dx, dy, col);
}

function drawWater(c, ox) {
  rc(c, ox, 0, 16, 16, '#3b7dd8');
  // Lighter wave lines
  for (let x = 0; x < 16; x += 3) {
    px(c, ox + x, 4, '#6bb8e0');
    px(c, ox + x + 1, 9, '#6bb8e0');
    px(c, ox + x + 2, 14, '#6bb8e0');
  }
  // Deeper spots
  for (const [dx, dy] of [[2,2],[10,6],[5,11],[13,3]])
    px(c, ox + dx, dy, '#2a5ca8');
}

function drawTree(c, ox) {
  // Grass base
  rc(c, ox, 0, 16, 16, '#5a9e3a');
  // Trunk
  rc(c, ox + 6, 11, 4, 5, '#6b4423');
  rc(c, ox + 7, 12, 2, 4, '#8a6b3d');
  // Canopy
  circle(c, ox + 8, 6, 6, '#2d5a1e');
  circle(c, ox + 8, 6, 5, '#3a6e28');
  // Highlights
  rc(c, ox + 5, 4, 2, 2, '#4a8630');
  rc(c, ox + 9, 3, 2, 2, '#4a8630');
  px(c, ox + 7, 7, '#5a9e3a');
}

function drawHill(c, ox) {
  // Green top (grass on cliff edge)
  rc(c, ox, 0, 16, 4, '#3d7a2a');
  px(c, ox + 3, 3, '#2d5a1e');
  px(c, ox + 11, 2, '#4e8e35');
  // Cliff face
  rc(c, ox, 4, 16, 12, '#8a6b3d');
  // Texture lines
  for (let y = 5; y < 16; y += 3)
    rc(c, ox + 1, y, 14, 1, '#7a5d30');
  // Darker edge at top of cliff
  rc(c, ox, 4, 16, 1, '#5a4020');
}

function drawHillTop(c, ox) {
  rc(c, ox, 0, 16, 16, '#3d7a2a');
  for (const [dx, dy, col] of [[4,3,'#2d5a1e'],[10,7,'#2d5a1e'],[7,12,'#4e8e35'],[2,8,'#4e8e35'],[13,2,'#2d5a1e'],[6,5,'#4e8e35']])
    px(c, ox + dx, dy, col);
}

function drawDoor(c, ox) {
  // Hill face background
  rc(c, ox, 0, 16, 3, '#3d7a2a');
  rc(c, ox, 3, 16, 13, '#8a6b3d');
  rc(c, ox, 3, 16, 1, '#5a4020');
  // Large round green door — fills most of the tile
  circle(c, ox + 8, 9, 6, '#2d5a1e');   // dark frame
  circle(c, ox + 8, 9, 5, '#3d7a2a');   // door outer
  circle(c, ox + 8, 9, 4, '#4a8630');   // door inner (lighter green)
  // Horizontal plank lines on door
  rc(c, ox + 4, 7, 8, 1, '#3d7a2a');
  rc(c, ox + 4, 11, 8, 1, '#3d7a2a');
  // Vertical center line
  rc(c, ox + 8, 5, 1, 9, '#3d7a2a');
  // Doorknob — bright yellow, bigger
  rc(c, ox + 10, 8, 2, 2, '#e8c840');
  px(c, ox + 10, 9, '#ffd700');
  // Highlight on door
  px(c, ox + 6, 6, '#5a9e3a');
  px(c, ox + 7, 6, '#5a9e3a');
}

function drawBridge(c, ox) {
  // Water edges
  rc(c, ox, 0, 2, 16, '#3b7dd8');
  rc(c, ox + 14, 0, 2, 16, '#3b7dd8');
  // Bridge planks
  rc(c, ox + 2, 0, 12, 16, '#8a6b3d');
  // Plank lines
  for (let y = 0; y < 16; y += 4)
    rc(c, ox + 2, y, 12, 1, '#6b4423');
  // Side rails
  rc(c, ox + 2, 0, 1, 16, '#6b4423');
  rc(c, ox + 13, 0, 1, 16, '#6b4423');
  // Nail dots
  for (let y = 2; y < 16; y += 4) {
    px(c, ox + 3, y, '#4a3015');
    px(c, ox + 12, y, '#4a3015');
  }
}

function drawFence(c, ox) {
  // Grass base
  rc(c, ox, 0, 16, 16, '#5a9e3a');
  // Fence posts
  rc(c, ox + 2, 3, 2, 12, '#8a6b3d');
  rc(c, ox + 12, 3, 2, 12, '#8a6b3d');
  // Top caps
  rc(c, ox + 1, 2, 4, 2, '#6b4423');
  rc(c, ox + 11, 2, 4, 2, '#6b4423');
  // Horizontal rails
  rc(c, ox + 2, 6, 12, 2, '#a0703c');
  rc(c, ox + 2, 11, 12, 2, '#a0703c');
}

function drawBush(c, ox) {
  rc(c, ox, 0, 16, 16, '#5a9e3a');
  circle(c, ox + 8, 9, 5, '#2d5a1e');
  circle(c, ox + 8, 8, 4, '#3a6e28');
  // Highlights
  px(c, ox + 6, 6, '#4a8630');
  px(c, ox + 10, 7, '#4a8630');
  px(c, ox + 7, 10, '#2d5a1e');
}

function drawStone(c, ox) {
  rc(c, ox, 0, 16, 16, '#9a9a9a');
  // Stone outlines
  rc(c, ox, 0, 16, 1, '#707070');
  rc(c, ox, 8, 16, 1, '#707070');
  rc(c, ox + 8, 0, 1, 8, '#707070');
  rc(c, ox + 5, 8, 1, 8, '#707070');
  rc(c, ox + 11, 8, 1, 8, '#707070');
  // Shade variation
  rc(c, ox + 1, 1, 7, 7, '#a8a8a8');
  rc(c, ox + 6, 9, 5, 7, '#8a8a8a');
}

function drawFlowers(c, ox) {
  // Grass base
  rc(c, ox, 0, 16, 16, '#5a9e3a');
  for (const [dx, dy, col] of [[3,3,'#4a8630'],[10,9,'#4a8630'],[7,14,'#6eb848']])
    px(c, ox + dx, dy, col);
  // Flowers
  px(c, ox + 4, 6, '#e83030'); px(c, ox + 3, 5, '#e83030');
  px(c, ox + 10, 3, '#e8e040'); px(c, ox + 11, 4, '#e8e040');
  px(c, ox + 7, 11, '#d060d0'); px(c, ox + 6, 10, '#d060d0');
  px(c, ox + 13, 8, '#f0f0f0'); px(c, ox + 14, 9, '#e83030');
  // Stems
  px(c, ox + 4, 7, '#3d7a2a'); px(c, ox + 10, 4, '#3d7a2a');
  px(c, ox + 7, 12, '#3d7a2a'); px(c, ox + 13, 9, '#3d7a2a');
}

function drawGarden(c, ox) {
  rc(c, ox, 0, 16, 16, '#4a3015');
  // Furrows
  for (let y = 0; y < 16; y += 4) {
    rc(c, ox, y, 16, 2, '#5a3d1f');
    rc(c, ox, y + 2, 16, 2, '#3d2510');
  }
  // Plants
  for (let x = 2; x < 16; x += 4) {
    px(c, ox + x, 1, '#5a9e3a');
    px(c, ox + x, 0, '#6eb848');
    px(c, ox + x, 5, '#5a9e3a');
    px(c, ox + x, 4, '#4a8630');
    px(c, ox + x, 9, '#5a9e3a');
    px(c, ox + x, 8, '#6eb848');
    px(c, ox + x, 13, '#5a9e3a');
    px(c, ox + x, 12, '#4a8630');
  }
}

function drawRoof(c, ox) {
  // Grassy hobbit-hill mound with a rounder, more prominent shape
  rc(c, ox, 0, 16, 16, '#8a6b3d');
  // Rounded green mound — taller and more visible
  for (let x = 0; x < 16; x++) {
    const h = Math.round(10 - ((x - 8) * (x - 8)) / 8);
    if (h > 0) rc(c, ox + x, 0, 1, h, '#3d7a2a');
  }
  // Grass highlights on mound
  for (const [dx, dy] of [[3,2],[6,1],[10,1],[13,2],[5,3],[9,2]])
    px(c, ox + dx, dy, '#4e8e35');
  // Darker edge where grass meets dirt
  for (let x = 1; x < 15; x++) {
    const h = Math.round(10 - ((x - 8) * (x - 8)) / 8);
    if (h > 0) px(c, ox + x, h, '#5a4020');
  }
  // Texture on brown cliff
  for (const [dx, dy] of [[3,12],[10,11],[7,14],[12,13]])
    px(c, ox + dx, dy, '#7a5d30');
  // Round window
  circle(c, ox + 8, 12, 2, '#4a3015');
  px(c, ox + 8, 12, '#6b8cc0');
  // Chimney
  rc(c, ox + 12, 0, 2, 5, '#6b4423');
  px(c, ox + 12, 0, '#c0c0c0');
  px(c, ox + 13, 0, '#d0d0d0');
}

/* ── character drawing ───────────────────────────────── */

const CHARS = {
  frodo:   { hair: '#6b3a1f', skin: '#e8c8a0', shirt: '#3d7a2a', pants: '#6b4423', belt: '#3d2817', shoe: '#3d2817' },
  gandalf: { hair: '#909090', skin: '#e0c8a8', shirt: '#808080', pants: '#707070', belt: '#505050', shoe: '#4a3828', hat: '#707070', beard: '#c0c0c0', staff: true },
  sam:     { hair: '#8a5a2a', skin: '#e8c8a0', shirt: '#7a5a30', pants: '#6b4423', belt: '#4a3015', shoe: '#3d2817' },
  gaffer:  { hair: '#b0b0b0', skin: '#d8b890', shirt: '#6b5a3a', pants: '#5a4a30', belt: '#4a3a20', shoe: '#3d2817' },
  lobelia: { hair: '#3a2a1a', skin: '#e8c8a0', shirt: '#6a3a7a', pants: '#6a3a7a', belt: '#4a2a5a', shoe: '#3d2817', hatSmall: '#3a2a3a' },
  rosie:   { hair: '#b08040', skin: '#e8c8a0', shirt: '#4a70a0', pants: '#4a70a0', belt: '#3a5878', shoe: '#3d2817' },
};

function drawCharDown(c, x, y, frame, ch) {
  const legOff = frame === 0 ? 0 : frame === 1 ? -1 : 1;
  const isWiz = !!ch.hat;
  const topY = isWiz ? y : y + 3; // hobbits are shorter

  if (isWiz) {
    // Pointed hat
    rc(c, x + 6, topY, 4, 1, ch.hat);
    rc(c, x + 5, topY + 1, 6, 1, ch.hat);
    rc(c, x + 4, topY + 2, 8, 1, ch.hat);
    // Face
    rc(c, x + 5, topY + 3, 6, 3, ch.skin);
    px(c, x + 6, topY + 4, '#222');
    px(c, x + 9, topY + 4, '#222');
    // Beard
    rc(c, x + 6, topY + 6, 4, 2, ch.beard);
    // Robe
    rc(c, x + 4, topY + 8, 8, 4, ch.shirt);
    rc(c, x + 3, topY + 9, 1, 3, ch.shirt); // sleeve
    rc(c, x + 12, topY + 9, 1, 3, ch.shirt);
    // Staff
    rc(c, x + 13, topY + 3, 1, 10, '#8a6b3d');
    px(c, x + 13, topY + 2, '#e8c840');
    // Lower robe
    rc(c, x + 4, topY + 12, 8, 2, ch.pants);
    // Boots
    rc(c, x + 5 + legOff, topY + 14, 2, 1, ch.shoe);
    rc(c, x + 9 - legOff, topY + 14, 2, 1, ch.shoe);
  } else {
    // Hair
    if (ch.hatSmall) {
      rc(c, x + 5, topY - 1, 6, 1, ch.hatSmall);
      rc(c, x + 4, topY, 8, 1, ch.hatSmall);
    }
    rc(c, x + 5, topY, 6, 2, ch.hair);
    rc(c, x + 4, topY + 1, 8, 1, ch.hair);
    // Face
    rc(c, x + 5, topY + 2, 6, 3, ch.skin);
    px(c, x + 6, topY + 3, '#222');
    px(c, x + 9, topY + 3, '#222');
    // Body
    rc(c, x + 4, topY + 5, 8, 3, ch.shirt);
    rc(c, x + 3, topY + 6, 1, 2, ch.shirt);
    rc(c, x + 12, topY + 6, 1, 2, ch.shirt);
    rc(c, x + 4, topY + 7, 8, 1, ch.belt);
    // Pants
    rc(c, x + 5, topY + 8, 3, 2, ch.pants);
    rc(c, x + 8, topY + 8, 3, 2, ch.pants);
    // Big hobbit feet
    rc(c, x + 4 + legOff, topY + 10, 3, 2, ch.shoe);
    rc(c, x + 9 - legOff, topY + 10, 3, 2, ch.shoe);
  }
}

function drawCharUp(c, x, y, frame, ch) {
  const legOff = frame === 0 ? 0 : frame === 1 ? -1 : 1;
  const isWiz = !!ch.hat;
  const topY = isWiz ? y : y + 3;

  if (isWiz) {
    rc(c, x + 6, topY, 4, 1, ch.hat);
    rc(c, x + 5, topY + 1, 6, 1, ch.hat);
    rc(c, x + 4, topY + 2, 8, 1, ch.hat);
    rc(c, x + 5, topY + 3, 6, 3, ch.hair);
    rc(c, x + 4, topY + 6, 8, 6, ch.shirt);
    rc(c, x + 13, topY + 3, 1, 10, '#8a6b3d');
    px(c, x + 13, topY + 2, '#e8c840');
    rc(c, x + 4, topY + 12, 8, 2, ch.pants);
    rc(c, x + 5 + legOff, topY + 14, 2, 1, ch.shoe);
    rc(c, x + 9 - legOff, topY + 14, 2, 1, ch.shoe);
  } else {
    rc(c, x + 5, topY, 6, 3, ch.hair);
    rc(c, x + 4, topY + 1, 8, 2, ch.hair);
    rc(c, x + 4, topY + 5, 8, 3, ch.shirt);
    rc(c, x + 4, topY + 7, 8, 1, ch.belt);
    rc(c, x + 5, topY + 8, 3, 2, ch.pants);
    rc(c, x + 8, topY + 8, 3, 2, ch.pants);
    rc(c, x + 4 + legOff, topY + 10, 3, 2, ch.shoe);
    rc(c, x + 9 - legOff, topY + 10, 3, 2, ch.shoe);
  }
}

function drawCharSide(c, x, y, frame, ch, flip) {
  const legOff = frame === 0 ? 0 : frame === 1 ? -1 : 1;
  const isWiz = !!ch.hat;
  const topY = isWiz ? y : y + 3;
  const faceX = flip ? x + 3 : x + 7;

  if (isWiz) {
    rc(c, x + 6, topY, 4, 1, ch.hat);
    rc(c, x + 5, topY + 1, 6, 1, ch.hat);
    rc(c, x + 4, topY + 2, 8, 1, ch.hat);
    rc(c, x + 5, topY + 3, 6, 3, ch.skin);
    px(c, faceX, topY + 4, '#222');
    rc(c, x + (flip ? 4 : 8), topY + 6, 3, 2, ch.beard);
    rc(c, x + 4, topY + 8, 8, 4, ch.shirt);
    rc(c, x + 13, topY + 3, 1, 10, '#8a6b3d');
    px(c, x + 13, topY + 2, '#e8c840');
    rc(c, x + 4, topY + 12, 8, 2, ch.pants);
    rc(c, x + 5 + legOff, topY + 14, 2, 1, ch.shoe);
    rc(c, x + 9 - legOff, topY + 14, 2, 1, ch.shoe);
  } else {
    rc(c, x + 5, topY, 6, 2, ch.hair);
    rc(c, x + 5, topY + 2, 6, 3, ch.skin);
    px(c, faceX, topY + 3, '#222');
    rc(c, x + 4, topY + 5, 8, 3, ch.shirt);
    rc(c, x + 4, topY + 7, 8, 1, ch.belt);
    rc(c, x + 5, topY + 8, 3, 2, ch.pants);
    rc(c, x + 8, topY + 8, 3, 2, ch.pants);
    rc(c, x + 4 + legOff, topY + 10, 3, 2, ch.shoe);
    rc(c, x + 9 - legOff, topY + 10, 3, 2, ch.shoe);
  }
}

function drawCharFrame(c, col, row, frame, ch) {
  const x = col * TS;
  const y = row * TS;
  // row 0=down, 1=left, 2=right, 3=up
  if (row === 0) drawCharDown(c, x, y, frame, ch);
  else if (row === 1) drawCharSide(c, x, y, frame, ch, true);
  else if (row === 2) drawCharSide(c, x, y, frame, ch, false);
  else drawCharUp(c, x, y, frame, ch);
}

function makeCharSheet(ch) {
  const canvas = document.createElement('canvas');
  canvas.width = 3 * TS;  // 3 frames
  canvas.height = 4 * TS; // 4 directions
  const c = canvas.getContext('2d');
  for (let dir = 0; dir < 4; dir++)
    for (let frame = 0; frame < 3; frame++)
      drawCharFrame(c, frame, dir, frame, ch);
  return canvas.toDataURL();
}

/* ── interaction hint sprite ───────────────────────────── */

function makeHintSprite() {
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

/* ── the scene ───────────────────────────────────────── */

export class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  preload() {
    // ── tileset ──
    const tileCanvas = document.createElement('canvas');
    tileCanvas.width = TILE_COUNT * TS;
    tileCanvas.height = TS;
    const tc = tileCanvas.getContext('2d');

    const tileFns = [
      drawGrass, drawGrass2, drawPath, drawWater, drawTree,
      drawHill, drawHillTop, drawDoor, drawBridge, drawFence,
      drawBush, drawStone, drawFlowers, drawGarden, drawRoof,
    ];
    tileFns.forEach((fn, i) => fn(tc, i * TS));

    this.load.spritesheet('tileset', tileCanvas.toDataURL(), {
      frameWidth: TS,
      frameHeight: TS,
    });

    // ── characters ──
    for (const [name, cfg] of Object.entries(CHARS)) {
      this.load.spritesheet(name, makeCharSheet(cfg), {
        frameWidth: TS,
        frameHeight: TS,
      });
    }

    // ── hint icon ──
    this.load.image('hint', makeHintSprite());
  }

  create() {
    // Create walk animations for each character
    for (const name of Object.keys(CHARS)) {
      const dirs = ['down', 'left', 'right', 'up'];
      dirs.forEach((dir, di) => {
        this.anims.create({
          key: `${name}-walk-${dir}`,
          frames: this.anims.generateFrameNumbers(name, {
            start: di * 3,
            end: di * 3 + 2,
          }),
          frameRate: 6,
          repeat: -1,
        });
        // Standing frame (middle of the 3)
        this.anims.create({
          key: `${name}-idle-${dir}`,
          frames: [{ key: name, frame: di * 3 + 1 }],
          frameRate: 1,
        });
      });
    }

    this.scene.start('TitleScene');
  }
}
