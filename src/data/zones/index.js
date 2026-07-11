// Zone registry. Every zone: { key, label, music, map, spawns, npcs,
// doors, signs, exits, onCreate?, onUpdate? }

import { shire } from './shire.js';
import { bagend } from './bagend.js';
import { greendragon } from './greendragon.js';
import { woodyend } from './woodyend.js';
import { marish } from './marish.js';

export const ZONES = { shire, bagend, greendragon, woodyend, marish };

// Guard against ragged hand-authored maps
for (const zone of Object.values(ZONES)) {
  const w = zone.map[0].length;
  zone.map.forEach((row, y) => {
    if (row.length !== w) {
      throw new Error(`zone ${zone.key} row ${y} has ${row.length} tiles (expected ${w})`);
    }
  });
}
