// Zone registry. Every zone: { key, label, music, map, spawns, npcs,
// doors, signs, exits, onCreate?, onUpdate? }

import { shire } from './shire.js';
import { bagend } from './bagend.js';
import { greendragon } from './greendragon.js';
import { woodyend } from './woodyend.js';
import { marish } from './marish.js';

import { crickhollow, crickhollowhouse, hedgetunnel, tomclearing, tomhouse } from './beyondHedge.js';
import { forestgate, forestheart, withywindle } from './oldforest.js';
import { downs, barrow, barrowhill, eastroad } from './barrowdowns.js';
import { breegate, bree, ponycommon, ponyparlour, ponyrooms, breeroad } from './bree.js';
import { midgewater, weathertop, trollshaws, bruinen } from './longroad.js';
import { rivendell, rivendellroom, rivendellhall } from './rivendell.js';

export const ZONES = { shire, bagend, greendragon, woodyend, marish, crickhollow, crickhollowhouse, hedgetunnel, forestgate, forestheart, withywindle, tomclearing, tomhouse, downs, barrow, barrowhill, eastroad, breegate, bree, ponycommon, ponyparlour, ponyrooms, breeroad, midgewater, weathertop, trollshaws, bruinen, rivendell, rivendellroom, rivendellhall };

// Guard against ragged hand-authored maps
for (const zone of Object.values(ZONES)) {
  const w = zone.map[0].length;
  zone.map.forEach((row, y) => {
    if (row.length !== w) {
      throw new Error(`zone ${zone.key} row ${y} has ${row.length} tiles (expected ${w})`);
    }
  });
}
