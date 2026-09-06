import { T } from '../data/tileTypes.js';

// Static warm interior detail: every raised shape stays on existing furniture.
export function drawHouseScenery(scene) {
  if (scene.zoneKey !== 'tomhouse') return;
  const g = scene.add.graphics().setDepth(4);
  const r = (x, y, w, h, col) => g.fillStyle(col).fillRect(x, y, w, h);
  // Woven runner, a restrained gold border and small reed motifs.
  for (const y of [7, 9, 10]) for (let x = 9; x <= 16; x++) {
    r(x * 16, y * 16, 16, 16, 0x84513e);
    for (let n = 0; n < 4; n++) r(x * 16 + 2 + n * 4, y * 16 + 4, 1, 8, 0x926047);
    r(x * 16 + 6, y * 16 + 7, 4, 2, 0xb69a62);
  }
  r(144, 113, 128, 2, 0xc3a76d); r(144, 173, 128, 2, 0xc3a76d);
  r(145, 112, 2, 64, 0xc3a76d); r(269, 112, 2, 64, 0xc3a76d);
  // A continuous polished table, not eight round tables side by side.
  r(144, 128, 128, 16, 0x84513e);
  r(144, 129, 128, 13, 0x35251d);
  r(145, 130, 126, 9, 0x5e3e28);
  r(147, 130, 122, 1, 0xa47746);
  r(147, 134, 122, 1, 0x755135);
  r(147, 138, 122, 1, 0x271f19);
  // Rush seats tuck under the table's existing solid edge.
  for (let x = 151; x < 265; x += 22) {
    r(x, 140, 8, 4, 0x4c3823); r(x + 1, 140, 6, 2, 0xab955d);
    r(x + 3, 140, 1, 3, 0x776c43);
    r(x + 2, 131, 5, 2, 0xd8caa2); r(x + 3, 131, 3, 1, 0xf0e2b9);
  }
  for (const x of [160, 202, 250]) {
    r(x - 2, 134, 6, 2, 0xb59545); r(x, 129, 2, 6, 0xe0c574);
    r(x, 127, 2, 2, 0xea9b37); r(x, 126, 1, 2, 0xffe6a0);
  }
  // The lilies float in earthen bowls; remove the blue square of river tile.
  for (const tx of [20, 22]) {
    const x = tx * 16, y = 128;
    r(x, y, 16, 16, 0xa8804e);
    for (const dy of [3, 7, 11, 15]) r(x, y + dy, 16, 1, 0x8a6238);
    r(x + 2, y + 4, 12, 8, 0x684a2b); r(x + 4, y + 12, 8, 2, 0x684a2b);
    r(x + 3, y + 3, 10, 2, 0xc29b58); r(x + 3, y + 5, 10, 5, 0x45644c);
    r(x + 5, y + 6, 6, 2, 0x75845a); r(x + 7, y + 4, 2, 5, 0xf3edcc);
    r(x + 5, y + 6, 6, 1, 0xfaf5dc); r(x + 7, y + 6, 2, 1, 0xd5b254);
    r(x + 3, y + 10, 10, 1, 0x967039);
  }
  // Ceiling beam uses the solid northern wall; doors and windows stay visible.
  for (let x = 4; x < 24; x++) {
    if ([7, 19].includes(x)) continue;
    r(x * 16, 48, 16, 4, 0x543b26); r(x * 16, 49, 16, 1, 0x8a643c);
    if (x % 4 === 0) { r(x * 16 + 3, 51, 4, 11, 0x6b4b2d); r(x * 16 + 4, 52, 1, 9, 0x947045); }
  }
  // Hearth brickwork and a tiny warm spill, entirely flat against the floor.
  r(112, 48, 16, 16, 0x796249);
  for (const [dx, dy] of [[1,1],[9,1],[3,4],[10,4]]) r(112 + dx, 48 + dy, 5, 2, 0xa58962);
  r(115, 54, 10, 9, 0x30261d); r(118, 58, 5, 4, 0xc1762b);
  r(119, 56, 2, 5, 0xe3a446); r(120, 57, 1, 3, 0xffdf7e);
  r(116, 62, 8, 1, 0x573a22); r(113, 64, 14, 1, 0xc09355);
  r(115, 66, 10, 1, 0xb68b50); r(117, 68, 6, 1, 0xaf844b);
}

// Turf scarps replace dungeon masonry but retain exactly the same blockers.
export function drawDownsRelief(scene) {
  if (scene.zoneKey !== 'downs') return;
  const g = scene.add.graphics().setDepth(3);
  const map = scene.zone.map;
  for (let y = 0; y < map.length; y++) for (let x = 0; x < map[y].length; x++) {
    if (map[y][x] !== T.BARROW_WALL) continue;
    const px = x * 16, py = y * 16;
    const r = (dx, dy, w, h, col) => g.fillStyle(col).fillRect(px + dx, py + dy, w, h);
    r(0, 0, 16, 16, 0x606e55); r(0, 0, 16, 5, 0x929c76);
    r(0, 5, 16, 2, 0x7d8867); r(0, 14, 16, 2, 0x53634f);
    for (let n = 0; n < 5; n++) {
      const dx = (x * 7 + n * 3) % 15, dy = 6 + (x + n * 3) % 7;
      r(dx, dy, 1, 3, 0x7f8364); r(dx, 4, 1, 2 + n % 2, 0x929c76);
    }
    r((x * 3) % 11, 1, 4, 1, 0xb0b58c);
    if (x % 5 === 1) r(4, 10, 5, 2, 0xb4b298);
  }
}
