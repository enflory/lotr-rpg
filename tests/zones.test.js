// Cross-reference integrity for the zone registry: every door, exit,
// sign, NPC, and spawn must point at things that actually exist.

import { describe, it, expect } from 'vitest';
import { ZONES } from '../src/data/zones/index.js';
import { ROAD_Y, woodyend } from '../src/data/zones/woodyend.js';
import { DIALOGUES } from '../src/data/dialogues.js';
import { CHAR_DEFS } from '../src/art/characters.js';
import { T, COLLISION_TILES } from '../src/data/tileTypes.js';

const zones = Object.values(ZONES);
const validTiles = new Set(Object.values(T));
const solid = new Set(COLLISION_TILES);

// Flags that gameplay can actually set (dialogue effects + the rider event)
const settableFlags = new Set(['escapedRider']);
for (const dlg of Object.values(DIALOGUES)) {
  for (const stage of dlg.stages ?? []) {
    if (stage.set) [].concat(stage.set).forEach((f) => settableFlags.add(f));
  }
}

const inBounds = (zone, x, y) =>
  Number.isInteger(x) &&
  Number.isInteger(y) &&
  y >= 0 &&
  y < zone.map.length &&
  x >= 0 &&
  x < zone.map[0].length;

const walkable = (zone, x, y) => !solid.has(zone.map[y][x]);

describe('zone maps', () => {
  it('every zone has key, label, music, and a rectangular map', () => {
    for (const zone of zones) {
      expect(zone.key).toBeTruthy();
      expect(zone.label).toBeTruthy();
      expect(typeof zone.music).toBe('string');
      const w = zone.map[0].length;
      zone.map.forEach((row, y) => {
        expect(row.length, `${zone.key} row ${y}`).toBe(w);
      });
    }
  });

  it('registry keys match zone.key', () => {
    for (const [key, zone] of Object.entries(ZONES)) expect(zone.key).toBe(key);
  });

  it('maps contain only valid tile indices', () => {
    for (const zone of zones) {
      zone.map.forEach((row, y) =>
        row.forEach((t, x) => {
          expect(validTiles.has(t), `${zone.key} (${x},${y}) has invalid tile ${t}`).toBe(true);
        }),
      );
    }
  });
});

describe('spawns', () => {
  it('every spawn is in bounds and on a walkable tile', () => {
    for (const zone of zones) {
      for (const [name, s] of Object.entries(zone.spawns)) {
        expect(inBounds(zone, s.x, s.y), `${zone.key}.spawns.${name} out of bounds`).toBe(true);
        expect(walkable(zone, s.x, s.y), `${zone.key}.spawns.${name} on solid tile`).toBe(true);
      }
    }
  });
});

describe('doors and exits', () => {
  it('every door sits on a DOOR tile and targets an existing zone spawn', () => {
    for (const zone of zones) {
      for (const door of zone.doors) {
        expect(inBounds(zone, door.x, door.y), `${zone.key} door out of bounds`).toBe(true);
        expect(
          zone.map[door.y][door.x],
          `${zone.key} door (${door.x},${door.y}) not on DOOR tile`,
        ).toBe(T.DOOR);
        const target = ZONES[door.zone];
        expect(target, `${zone.key} door targets unknown zone ${door.zone}`).toBeTruthy();
        expect(target.spawns[door.entry], `${door.zone} has no spawn ${door.entry}`).toBeTruthy();
      }
    }
  });

  it('every exit is in bounds, walkable, and targets an existing zone spawn', () => {
    for (const zone of zones) {
      for (const exit of zone.exits) {
        expect(inBounds(zone, exit.x, exit.y), `${zone.key} exit out of bounds`).toBe(true);
        expect(
          walkable(zone, exit.x, exit.y),
          `${zone.key} exit (${exit.x},${exit.y}) unreachable (solid tile)`,
        ).toBe(true);
        const target = ZONES[exit.zone];
        expect(target, `${zone.key} exit targets unknown zone ${exit.zone}`).toBeTruthy();
        expect(target.spawns[exit.entry], `${exit.zone} has no spawn ${exit.entry}`).toBeTruthy();
      }
    }
  });

  it('exit requirements reference flags the game can actually set', () => {
    for (const zone of zones) {
      for (const exit of zone.exits) {
        if (!exit.requires) continue;
        expect(
          settableFlags.has(exit.requires),
          `${zone.key} exit requires unreachable flag ${exit.requires}`,
        ).toBe(true);
      }
    }
  });
});

describe('signs and NPCs', () => {
  it('every sign sits on a SIGN tile and has a dialogue entry', () => {
    for (const zone of zones) {
      for (const sign of zone.signs) {
        expect(
          zone.map[sign.y][sign.x],
          `${zone.key} sign (${sign.x},${sign.y}) not on SIGN tile`,
        ).toBe(T.SIGN);
        expect(
          DIALOGUES[sign.dialogue],
          `${zone.key} sign references unknown dialogue ${sign.dialogue}`,
        ).toBeTruthy();
      }
    }
  });

  it('every NPC has a sprite definition, a dialogue entry, and a walkable position', () => {
    for (const zone of zones) {
      for (const npc of zone.npcs) {
        expect(CHAR_DEFS[npc.key], `${zone.key} NPC ${npc.key} has no sprite`).toBeTruthy();
        expect(DIALOGUES[npc.key], `${zone.key} NPC ${npc.key} has no dialogue`).toBeTruthy();
        expect(inBounds(zone, npc.x, npc.y), `${zone.key} NPC ${npc.key} out of bounds`).toBe(true);
        expect(walkable(zone, npc.x, npc.y), `${zone.key} NPC ${npc.key} on solid tile`).toBe(true);
      }
    }
  });
});

describe('the Woody End (generated map)', () => {
  const map = woodyend.map;

  it('ROAD_Y covers the full map width with sane values', () => {
    expect(ROAD_Y.length).toBe(map[0].length);
    for (const y of ROAD_Y) expect(y).toBeGreaterThan(1);
    for (const y of ROAD_Y) expect(y).toBeLessThan(map.length - 2);
  });

  it('the East Road is carved two tiles tall along ROAD_Y', () => {
    // Stop before the riverbank where the road becomes the ferry pier
    for (let x = 0; x < 36; x++) {
      expect(map[ROAD_Y[x]][x], `road missing at (${x},${ROAD_Y[x]})`).toBe(T.PATH);
      expect(map[ROAD_Y[x] + 1][x], `road missing at (${x},${ROAD_Y[x] + 1})`).toBe(T.PATH);
    }
  });

  it('has fern hiding spots adjacent to the road along the whole stretch', () => {
    // The Black Rider set piece is unwinnable without ferns to hide in.
    for (let x0 = 4; x0 < 32; x0 += 8) {
      let ferns = 0;
      for (let x = x0; x < x0 + 8; x++) {
        if (map[ROAD_Y[x] - 1][x] === T.FERN) ferns++;
        if (map[ROAD_Y[x] + 2][x] === T.FERN) ferns++;
      }
      expect(ferns, `no fern brake beside the road in columns ${x0}-${x0 + 7}`).toBeGreaterThan(0);
    }
  });

  it('the ferry pier juts into the Brandywine at road height', () => {
    for (let x = 37; x < 40; x++) {
      expect(map[ROAD_Y[36]][x]).toBe(T.DOCK);
      expect(map[ROAD_Y[36] + 1][x]).toBe(T.DOCK_S);
    }
  });

  it('the ferry sign stands on the bank beside the pier', () => {
    expect(map[ROAD_Y[36] - 1][36]).toBe(T.SIGN);
  });

  it('gildor only appears after escaping the Rider', () => {
    const gildor = woodyend.npcs.find((n) => n.key === 'gildor');
    expect(gildor.when({})).toBeFalsy();
    expect(gildor.when({ escapedRider: true })).toBeTruthy();
  });
});
