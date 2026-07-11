// Cross-reference integrity for the zone registry: every door, exit,
// sign, NPC, and spawn must point at things that actually exist.

import { describe, it, expect } from 'vitest';
import { ZONES } from '../src/data/zones/index.js';
import { ROAD_Y, woodyend } from '../src/data/zones/woodyend.js';
import { LANE_Y, FARM, marish } from '../src/data/zones/marish.js';
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

describe('the Party Field (western Shire)', () => {
  const shire = ZONES.shire;

  it('the Party Tree 2×3 composite is intact', () => {
    expect(shire.map[21][4]).toBe(T.PARTY_NL);
    expect(shire.map[21][5]).toBe(T.PARTY_NR);
    expect(shire.map[22][4]).toBe(T.PARTY_TL);
    expect(shire.map[22][5]).toBe(T.PARTY_TR);
    expect(shire.map[23][4]).toBe(T.PARTY_BL);
    expect(shire.map[23][5]).toBe(T.PARTY_BR);
  });

  it('the East Road leaves Hobbiton two tiles tall', () => {
    for (let x = 30; x <= 39; x++) {
      expect(shire.map[19][x], `road missing at (${x},19)`).toBe(T.PATH);
      expect(shire.map[20][x], `road missing at (${x},20)`).toBe(T.PATH);
    }
    const east = shire.exits.filter((e) => e.zone === 'woodyend');
    expect(east.map((e) => `${e.x},${e.y}`).sort()).toEqual(['39,19', '39,20']);
  });

  it('the field spur connects the party spawn to the north-south road', () => {
    for (let x = 2; x <= 10; x++) {
      expect(shire.map[27][x], `spur broken at (${x},27)`).toBe(T.PATH);
    }
  });

  it('prologue NPCs appear only before the time skip', () => {
    const at = (flags) =>
      shire.npcs
        .filter((n) => !n.when || n.when(flags))
        .map((n) => n.key)
        .sort();
    expect(at({})).toEqual(['bilbo', 'gaffer', 'gandalf', 'rosie', 'ted']);
    expect(at({ prologueDone: true })).toEqual(['gaffer', 'gandalf', 'lobelia', 'sam']);
    expect(at({ prologueDone: true, samJoined: true })).toEqual(['gaffer', 'gandalf', 'lobelia']);
  });

  it('no NPC key is duplicated for any flag state', () => {
    for (const flags of [{}, { prologueDone: true }]) {
      const keys = shire.npcs.filter((n) => !n.when || n.when(flags)).map((n) => n.key);
      expect(new Set(keys).size, `duplicate NPC at ${JSON.stringify(flags)}`).toBe(keys.length);
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

  it('the East Road is carved two tiles tall across the full width', () => {
    for (let x = 0; x < map[0].length; x++) {
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

  it('the road runs out the east edge toward the Marish, gated on Gildor', () => {
    const east = woodyend.exits.filter((e) => e.zone === 'marish');
    expect(east.length).toBe(2);
    for (const exit of east) {
      expect(exit.x).toBe(39);
      expect(exit.requires).toBe('metGildor');
    }
    // No river remains in the Woody End — the Brandywine moved to the Marish
    map.forEach((row, y) =>
      row.forEach((t, x) => {
        expect(t, `stray water/pier tile at (${x},${y})`).not.toBe(T.WATER);
        expect(t, `stray water/pier tile at (${x},${y})`).not.toBe(T.DOCK);
      }),
    );
  });

  it('gildor only appears after escaping the Rider', () => {
    const gildor = woodyend.npcs.find((n) => n.key === 'gildor');
    expect(gildor.when({})).toBeFalsy();
    expect(gildor.when({ escapedRider: true })).toBeTruthy();
  });
});

describe('the Marish (generated map)', () => {
  const map = marish.map;

  it('LANE_Y covers the map width with sane values', () => {
    expect(LANE_Y.length).toBe(map[0].length);
    for (const y of LANE_Y) expect(y).toBeGreaterThan(1);
    for (const y of LANE_Y) expect(y).toBeLessThan(map.length - 2);
  });

  it('the lane is carved two tiles tall up to the river', () => {
    for (let x = 0; x < 34; x++) {
      expect(map[LANE_Y[x]][x], `lane missing at (${x},${LANE_Y[x]})`).toBe(T.PATH);
      expect(map[LANE_Y[x] + 1][x], `lane missing at (${x},${LANE_Y[x] + 1})`).toBe(T.PATH);
    }
  });

  it('the farm fence is closed except for the gate, which meets the lane', () => {
    for (let x = FARM.x0; x <= FARM.x1; x++) {
      if (x === FARM.gateX || x === FARM.gateX + 1) {
        expect(map[FARM.y0][x], `gate blocked at (${x},${FARM.y0})`).toBe(T.PATH);
      } else {
        expect(map[FARM.y0][x], `north fence broken at (${x},${FARM.y0})`).toBe(T.FENCE);
      }
      expect(map[FARM.y1][x], `south fence broken at (${x},${FARM.y1})`).toBe(T.FENCE);
    }
    for (let y = FARM.y0; y <= FARM.y1; y++) {
      expect(map[y][FARM.x0], `west fence broken at (${FARM.x0},${y})`).toBe(T.FENCE);
      expect(map[y][FARM.x1], `east fence broken at (${FARM.x1},${y})`).toBe(T.FENCE);
    }
    // Path stub connects the gate up to the lane's bottom row
    for (let y = LANE_Y[FARM.gateX] + 1; y <= FARM.y0; y++) {
      expect(map[y][FARM.gateX], `gate path broken at (${FARM.gateX},${y})`).toBe(T.PATH);
    }
  });

  it('the pier stands at lane height with six tiles of open water beyond', () => {
    expect(map[13][34]).toBe(T.DOCK);
    expect(map[14][34]).toBe(T.DOCK_S);
    for (const y of [13, 14]) {
      for (let x = 35; x <= 39; x++) {
        expect(map[y][x], `raft channel at (${x},${y})`).toBe(T.WATER);
      }
    }
  });

  it('the Buckland shore is walkable where the raft lands', () => {
    for (const y of [12, 13, 14]) {
      expect(solid.has(map[y][40]), `far bank blocked at (40,${y})`).toBe(false);
    }
  });

  it('maggot and merry come and go with the story flags', () => {
    const at = (flags) =>
      marish.npcs.filter((n) => !n.when || n.when(flags)).map((n) => `${n.key}@${n.x}`);
    expect(at({})).toEqual(['maggot@23']);
    expect(at({ rodeWaggon: true })).toEqual(['merry@32']);
    expect(at({ rodeWaggon: true, crossedFerry: true })).toEqual(['merry@40']);
  });
});
