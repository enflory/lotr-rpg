import { describe, it, expect } from 'vitest';
import { LONG_ROAD_BEATS, nextRoadBeat, isRoadBeat } from '../src/state/longRoadProgress.js';
import { BREE_BEATS } from '../src/state/breeProgress.js';
import { resolveDialogue, DIALOGUES } from '../src/data/dialogues.js';
import { LONG_ROAD_DIALOGUES } from '../src/data/longRoadDialogues.js';
import { ZONES } from '../src/data/zones/index.js';
import { findWalkablePath } from '../src/state/partyMovement.js';
import { COLLISION_TILES } from '../src/data/tileTypes.js';
import { AT, RIDE } from '../src/events/longRoadStaging.js';
import { RIDERS_AT } from '../src/events/longRoadEvent.js';
import { CHAR_DEFS } from '../src/art/characters.js';

const afterBree = Object.fromEntries([
  ...BREE_BEATS.map((b) => [b.flag, true]),
  ['striderJoined', true],
]);
const open = (zone, x, y) => !COLLISION_TILES.includes(ZONES[zone].map[y]?.[x] ?? -1);
const reach = (zone, from, to) =>
  findWalkablePath(
    ZONES[zone].map,
    { x: from.x * 16 + 8, y: from.y * 16 },
    (x, y) => x === to.x && y === to.y,
  ).length > 0;

describe('Chapter 5: the long road', () => {
  it('opens only once Bree is finished, then runs in strict order', () => {
    expect(nextRoadBeat({})?.key).toBe('road_marsh');
    expect(isRoadBeat({}, 'road_marsh')).toBe(false);
    const flags = { ...afterBree };
    for (const [index, beat] of LONG_ROAD_BEATS.entries()) {
      expect(nextRoadBeat(flags)).toBe(beat);
      for (const later of LONG_ROAD_BEATS.slice(index + 1))
        expect(resolveDialogue(later.key, flags).set).toBeUndefined();
      const stage = resolveDialogue(beat.key, flags);
      expect(stage.set).toBe(beat.flag);
      flags[beat.flag] = true;
      expect(resolveDialogue(beat.key, flags).set).toBeUndefined();
    }
    expect(nextRoadBeat(flags)).toBeNull();
    expect(flags.chapter5Complete).toBe(true);
  });

  it('ends on the Ford, after the Morgul wound and the meeting with Glorfindel', () => {
    const flags = LONG_ROAD_BEATS.map((b) => b.flag);
    expect(flags.indexOf('frodoWounded')).toBeGreaterThan(flags.indexOf('wraithsCame'));
    expect(flags.indexOf('athelasFound')).toBeGreaterThan(flags.indexOf('frodoWounded'));
    expect(flags.indexOf('glorfindelMet')).toBeGreaterThan(flags.indexOf('trollsSeen'));
    expect(flags.at(-1)).toBe('chapter5Complete');
  });

  it('gives each beat exactly one reachable cue', () => {
    const flags = { ...afterBree };
    for (const beat of LONG_ROAD_BEATS) {
      const zone = ZONES[beat.zone];
      const cues = zone.interactions.filter(
        (p) => LONG_ROAD_BEATS.some((b) => b.key === p.dialogue) && p.when?.(flags),
      );
      // The wound starts by itself; its cue is only a fallback if that is ever missed.
      expect(
        cues.map((p) => p.dialogue),
        beat.key,
      ).toEqual([beat.key]);
      expect(open(beat.zone, cues[0].x, cues[0].y), `${beat.key} cue on open ground`).toBe(true);
      for (const [name, spawn] of Object.entries(zone.spawns))
        expect(reach(beat.zone, spawn, cues[0]), `${beat.key} from ${name}`).toBe(true);
      flags[beat.flag] = true;
    }
  });

  it('chains the zones from Bree to the Ford, each exit gated by the story', () => {
    const exitTo = (from, to) => ZONES[from].exits.find((e) => e.zone === to);
    const chain = [
      ['breeroad', 'midgewater', 'chapter4Complete'],
      ['midgewater', 'weathertop', 'midgesEndured'],
      ['weathertop', 'trollshaws', 'frodoWounded'],
      ['trollshaws', 'bruinen', 'glorfindelMet'],
    ];
    for (const [from, to, gate] of chain) {
      const e = exitTo(from, to);
      expect(e.requires, `${from} -> ${to}`).toBe(gate);
      expect(ZONES[to].spawns[e.entry]).toBeTruthy();
      // From the arrival spawn the whole way to the next exit is walkable.
      const next = ZONES[to].exits.find(
        (x) => x.requires && chain.some((c) => c[0] === to && c[1] === x.zone),
      );
      if (next) expect(reach(to, ZONES[to].spawns[e.entry], next), `${to} to its exit`).toBe(true);
    }
    // The way back is always open, so no one is ever stranded ahead of the story.
    for (const [from, to] of [
      ['midgewater', 'breeroad'],
      ['weathertop', 'midgewater'],
      ['trollshaws', 'weathertop'],
      ['bruinen', 'trollshaws'],
    ])
      expect(exitTo(from, to).requires).toBeUndefined();
  });

  it('keeps every scripted mark on open ground and within reach of the spawns', () => {
    for (const [name, at] of Object.entries(AT)) {
      if (name === 'gladeEdge') continue; // camera target only
      expect(open(at.zone, at.x, at.y), name).toBe(true);
    }
    for (const [x, y] of RIDERS_AT) expect(open('bruinen', x, y), `rider ${x},${y}`).toBe(true);
    // The ride runs along one straight, open row from the start to the far bank.
    for (let x = RIDE.from; x <= RIDE.across; x++)
      expect(open('bruinen', x, RIDE.y), `ride tile ${x}`).toBe(true);
    expect(reach('bruinen', ZONES.bruinen.spawns.east, { x: 45, y: 11 })).toBe(true);
    expect(reach('bruinen', ZONES.bruinen.spawns.west, ZONES.bruinen.spawns.east)).toBe(true);
  });

  it('never spawns anyone with solid ground under their feet', () => {
    // The feet-only body reaches two pixels into the row below the spawn tile.
    for (const k of ['midgewater', 'weathertop', 'trollshaws', 'bruinen'])
      for (const [name, sp] of Object.entries(ZONES[k].spawns))
        expect(open(k, sp.x, sp.y + 1), `${k}.${name}`).toBe(true);
  });

  it('puts the camp, the dell exit and the return spawn where the night happens', () => {
    const w = ZONES.weathertop;
    expect(
      reach(
        'weathertop',
        w.spawns.dell,
        w.exits.find((e) => e.zone === 'trollshaws'),
      ),
    ).toBe(true);
    expect(reach('weathertop', w.spawns.west, w.spawns.dell)).toBe(true);
    const cue = w.interactions.find((p) => p.dialogue === 'road_fire');
    expect(reach('weathertop', w.spawns.dell, cue)).toBe(true);
  });

  it('writes every page as at most three lines of forty characters', () => {
    for (const [key, dlg] of Object.entries(LONG_ROAD_DIALOGUES)) {
      const pages = (dlg.lines ? [dlg.lines] : dlg.stages.map((s) => s.lines)).flat();
      for (const page of pages) {
        const lines = page.split('\n');
        expect(lines.length, key).toBeLessThanOrEqual(3);
        for (const line of lines) expect(line.length, `${key}: ${line}`).toBeLessThanOrEqual(40);
      }
    }
  });

  it('registers the dialogues every interaction names, and Glorfindel’s sprite', () => {
    for (const k of ['midgewater', 'weathertop', 'trollshaws', 'bruinen'])
      for (const p of ZONES[k].interactions) expect(DIALOGUES[p.dialogue], p.dialogue).toBeTruthy();
    expect(CHAR_DEFS.glorfindel).toBeTruthy();
  });
});
