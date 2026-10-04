import { describe, it, expect } from 'vitest';
import {
  RIVENDELL_BEATS,
  nextRvBeat,
  isRvBeat,
  rvObjective,
  skyFor,
  councilNow,
} from '../src/state/rivendellProgress.js';
import { LONG_ROAD_BEATS } from '../src/state/longRoadProgress.js';
import { resolveDialogue, DIALOGUES } from '../src/data/dialogues.js';
import { RIVENDELL_DIALOGUES, PAGE, wrap } from '../src/data/rivendellDialogues.js';
import { ZONES } from '../src/data/zones/index.js';
import { findWalkablePath } from '../src/state/partyMovement.js';
import { COLLISION_TILES, T } from '../src/data/tileTypes.js';
import { AT, WALKERS, FAREWELL, COUNCIL_SEATS } from '../src/events/rivendellStaging.js';
import { CHAR_DEFS } from '../src/art/characters.js';
import { ITEMS } from '../src/data/items.js';

const afterRoad = Object.fromEntries([
  ...LONG_ROAD_BEATS.map((b) => [b.flag, true]),
  ['chapter4Complete', true],
  ['striderJoined', true],
]);
const open = (zone, x, y) => !COLLISION_TILES.includes(ZONES[zone].map[y]?.[x] ?? -1);
const reach = (zone, from, to) =>
  findWalkablePath(
    ZONES[zone].map,
    { x: from.x * 16 + 8, y: from.y * 16 },
    (x, y) => x === to.x && y === to.y,
  ).length > 0;
const RV = ['rivendell', 'rivendellroom', 'rivendellhall'];

/** Every flag a player holds just before `key`, on top of the end of chapter five. */
const through = (key) => ({
  ...afterRoad,
  ...Object.fromEntries(
    RIVENDELL_BEATS.slice(
      0,
      RIVENDELL_BEATS.findIndex((b) => b.key === key),
    ).map((b) => [b.flag, true]),
  ),
});

describe('Chapter 6: Rivendell', () => {
  it('opens only once the Ford ride is over, then runs in strict order', () => {
    const early = { ...afterRoad, chapter5Complete: false };
    expect(isRvBeat(early, 'rv_flood')).toBe(false);
    const flags = { ...afterRoad };
    for (const [index, beat] of RIVENDELL_BEATS.entries()) {
      expect(nextRvBeat(flags)).toBe(beat);
      for (const later of RIVENDELL_BEATS.slice(index + 1))
        expect(resolveDialogue(later.key, flags).set).toBeUndefined();
      expect(resolveDialogue(beat.key, flags).set).toBe(beat.flag);
      flags[beat.flag] = true;
      expect(resolveDialogue(beat.key, flags).set).toBeUndefined();
    }
    expect(nextRvBeat(flags)).toBeNull();
    expect(flags.chapter6Complete).toBe(true);
    expect(rvObjective(flags)).toMatch(/Chapter six complete/);
  });

  it('follows the book: flood, healing, feast, song, Council, weeks, gifts, Company', () => {
    expect(RIVENDELL_BEATS.map((b) => b.flag)).toEqual([
      'fordFlooded',
      'rivendellWoke',
      'feastHeld',
      'hallOfFire',
      'councilOpened',
      'councilTales',
      'ringBearerChosen',
      'weeksPassed',
      'giftsGiven',
      'chapter6Complete',
    ]);
  });

  it('gives each beat one reachable cue on open ground, except the self-starting wake', () => {
    for (const beat of RIVENDELL_BEATS) {
      const flags = through(beat.key);
      const zone = ZONES[beat.zone];
      const cues = (zone.interactions ?? []).filter(
        (p) => RIVENDELL_BEATS.some((b) => b.key === p.dialogue) && p.when?.(flags),
      );
      if (beat.key === 'rv_wake') {
        // Frodo opens his eyes by himself; no cue is ever shown for it.
        expect(cues).toEqual([]);
        continue;
      }
      expect(
        cues.map((p) => p.dialogue),
        beat.key,
      ).toEqual([beat.key]);
      expect(open(beat.zone, cues[0].x, cues[0].y), `${beat.key} cue on open ground`).toBe(true);
      for (const [name, spawn] of Object.entries(zone.spawns))
        expect(reach(beat.zone, spawn, cues[0]), `${beat.key} from ${name}`).toBe(true);
    }
  });

  it('chains the house, gating the evening until the Hall of Fire is done', () => {
    const exitTo = (from, to) => ZONES[from].exits.filter((e) => e.zone === to);
    for (const e of exitTo('rivendellroom', 'rivendellhall')) expect(e.requires).toBe('rivendellWoke');
    for (const e of exitTo('rivendellroom', 'rivendell')) expect(e.requires).toBe('hallOfFire');
    for (const e of exitTo('rivendellhall', 'rivendell')) expect(e.requires).toBe('hallOfFire');
    // The way back to the rooms is always open, so no one is stranded.
    for (const e of exitTo('rivendellhall', 'rivendellroom')) expect(e.requires).toBeUndefined();
    for (const door of ZONES.rivendell.doors) expect(ZONES[door.zone].spawns[door.entry]).toBeTruthy();
    // Every part of the valley a beat needs can be reached from every way in.
    for (const key of ['bridge', 'door', 'porch', 'gate'])
      for (const to of [AT.councilCue, AT.benchCue, AT.gateCue])
        expect(reach('rivendell', ZONES.rivendell.spawns[key], to), `${key} to ${to.x},${to.y}`).toBe(
          true,
        );
  });

  it('keeps every scripted mark and every guest on open, distinct ground', () => {
    for (const [name, at] of Object.entries(AT)) expect(open(at.zone, at.x, at.y), name).toBe(true);
    for (const w of [...WALKERS, ...FAREWELL, ...COUNCIL_SEATS])
      expect(open('rivendell', w.x, w.y), `${w.key} at ${w.x},${w.y}`).toBe(true);
    // Whatever the phase, nobody stands on another guest, on a cue, or on a spawn.
    for (const beat of [{ key: 'start' }, ...RIVENDELL_BEATS]) {
      const flags = beat.key === 'start' ? afterRoad : through(beat.key);
      for (const k of RV) {
        const zone = ZONES[k];
        const here = zone.npcs.filter((d) => !d.when || d.when(flags));
        const seen = new Set();
        for (const d of here) {
          const id = `${d.x},${d.y}`;
          expect(open(k, d.x, d.y), `${k} ${d.key} ${id}`).toBe(true);
          expect(seen.has(id), `${k} two people at ${id} before ${beat.key}`).toBe(false);
          seen.add(id);
          expect(CHAR_DEFS[d.key], d.key).toBeTruthy();
          expect(DIALOGUES[d.key], `${d.key} has dialogue`).toBeTruthy();
          for (const p of zone.interactions ?? [])
            expect(p.x === d.x && p.y === d.y, `${d.key} on cue ${p.dialogue}`).toBe(false);
          for (const [n, sp] of Object.entries(zone.spawns))
            expect(sp.x === d.x && sp.y === d.y, `${d.key} on spawn ${n}`).toBe(false);
        }
      }
    }
  });

  it('never spawns anyone on an exit or with solid ground under their feet', () => {
    for (const k of [...RV, 'bruinen'])
      for (const [name, sp] of Object.entries(ZONES[k].spawns)) {
        // The feet row is the spawn row plus one; that row must be open and not an exit.
        expect(open(k, sp.x, sp.y + 1), `${k}.${name} feet`).toBe(true);
        expect(
          ZONES[k].exits.some((e) => e.x === sp.x && e.y === sp.y + 1),
          `${k}.${name} stands on an exit`,
        ).toBe(false);
      }
  });

  it('wins the Ring-bearer his companions and his gifts at the right beats', () => {
    const gifts = resolveDialogue('rv_gifts', through('rv_gifts'));
    expect([].concat(gifts.give)).toEqual(['sting', 'mithril_coat']);
    for (const item of [].concat(gifts.give)) expect(ITEMS[item]).toBeTruthy();
    // Nine walk at the end, as the book names them.
    const names = new Set([...WALKERS.map((w) => w.key), 'frodo']);
    expect(names.size).toBe(9);
    for (const k of ['gandalfrv', 'dunadan', 'legolas', 'gimli', 'boromir', 'merry', 'pippin', 'sam'])
      expect(names.has(k)).toBe(true);
  });

  it('keeps every page inside the dialogue box', () => {
    for (const [key, d] of Object.entries(RIVENDELL_DIALOGUES)) {
      const pages = [...(d.lines ?? []), ...(d.stages ?? []).flatMap((s) => s.lines)];
      for (const [i, page] of pages.entries()) {
        const rows = page.split('\n');
        expect(rows.length, `${key} page ${i}`).toBeLessThanOrEqual(3);
        for (const row of rows) expect(row.length, `${key} p${i}: ${row}`).toBeLessThanOrEqual(40);
      }
    }
    expect(wrap('a '.repeat(30).trim()).split('\n').every((l) => l.length <= 40)).toBe(true);
  });

  it('names real pages for the choreography to hang on', () => {
    for (const [key, ids] of Object.entries(PAGE)) {
      const lines = RIVENDELL_DIALOGUES[key].stages[0].lines;
      for (const [id, index] of Object.entries(ids))
        expect(index, `${key}.${id}`).toBeLessThan(lines.length);
      const values = Object.values(ids);
      expect(values, `${key} ids in order`).toEqual([...values].sort((a, b) => a - b));
    }
    // The two player prompts and Sam's entrances have pages.
    expect(PAGE.rv_flood.sword).toBeGreaterThan(PAGE.rv_flood.enter);
    expect(PAGE.rv_council3.speak).toBeGreaterThan(PAGE.rv_council3.silence);
  });

  it('gives every guest a line whatever the story state', () => {
    for (const k of RV)
      for (const d of ZONES[k].npcs) {
        const dialogue = DIALOGUES[d.key];
        for (const flags of [{}, afterRoad, through('rv_council1'), through('rv_company')]) {
          expect(resolveDialogue(d.key, flags), `${d.key}`).toBeTruthy();
        }
        expect(dialogue.stages.at(-1).when, `${d.key} has a default stage`).toBeUndefined();
      }
  });

  it('turns the sky with the story: evening, dawn, autumn noon, winter, dusk', () => {
    expect(skyFor(afterRoad, 'bruinen')).toBeNull();
    expect(skyFor(through('rv_council1'), 'rivendellhall')).toBeNull();
    const at = (key) => skyFor(through(key), 'rivendell');
    const colours = ['rv_feast', 'rv_council1', 'rv_weeks', 'rv_gifts', 'rv_company'].map((k) => at(k).color);
    expect(new Set(colours).size).toBe(colours.length);
    expect(at('rv_weeks').alpha).toBeLessThan(at('rv_gifts').alpha);
    expect(councilNow(through('rv_council2'))).toBe(true);
    expect(councilNow(through('rv_weeks'))).toBe(false);
  });

  it('keeps tiles for the valley solid or open as drawn', () => {
    for (const t of [T.ELF_FLOOR, T.STEPS]) expect(COLLISION_TILES).not.toContain(t);
    for (const t of [T.ELF_PILLAR, T.FALLS, T.BALUSTRADE, T.ELF_WALL, T.GREAT_HEARTH, T.FIR, T.ELF_LAMP, T.ELF_ROOF, T.ELF_TABLE])
      expect(COLLISION_TILES).toContain(t);
  });
});
