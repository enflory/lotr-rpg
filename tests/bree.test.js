import { describe, it, expect } from 'vitest';
import { BREE_BEATS, nextBreeBeat } from '../src/state/breeProgress.js';
import { resolveDialogue } from '../src/data/dialogues.js';
import { ZONES } from '../src/data/zones/index.js';
import { findWalkablePath } from '../src/state/partyMovement.js';
import { BREE_BUILDINGS } from '../src/data/zones/bree.js';
import { T } from '../src/data/tileTypes.js';
import { CHAR_NAMES, CHAR_DEFS } from '../src/art/characters.js';

describe('Bree chapter', () => {
  it('registers every character for texture and animation generation', () => {
    expect(CHAR_NAMES.sort()).toEqual(Object.keys(CHAR_DEFS).sort());
  });
  it('keeps the private parlour intimate and the exterior walls solid', () => {
    const area = (zone) => zone.map.flat().filter((tile) => tile === T.FLOOR).length;
    expect(area(ZONES.ponyparlour)).toBeLessThan(area(ZONES.ponycommon) / 2);
    for (const b of BREE_BUILDINGS)
      for (let y = b.y; y < b.y + b.h; y++)
        for (let x = b.x; x < b.x + b.w; x++) expect(ZONES.bree.map[y][x]).toBe(T.BARN);
  });
  it('takes a welcomed party to supper before joining the common-room company', () => {
    const flags = { breeAdmitted: true, ponyWelcomed: true };
    expect(nextBreeBeat(flags)?.key).toBe('bree_supper');
    flags.ponySupper = true;
    expect(nextBreeBeat(flags)?.key).toBe('bree_company');
    flags.breeCompany = true;
    expect(nextBreeBeat(flags)?.key).toBe('bree_song');
  });
  it('keeps older saves past the Ring accident past the new supper scenes', () => {
    const flags = { breeAdmitted: true, ponyWelcomed: true, breeRingSlip: true };
    expect(nextBreeBeat(flags)?.key).toBe('bree_strider');
  });
  it('requires the whole story in order, and cannot repeat a completed effect', () => {
    const flags = {};
    for (const [index, beat] of BREE_BEATS.entries()) {
      expect(nextBreeBeat(flags)).toBe(beat);
      for (const later of BREE_BEATS.slice(index + 1))
        expect(resolveDialogue(later.key, flags).set).toBeUndefined();
      const stage = resolveDialogue(beat.key, flags);
      for (const f of [].concat(stage.set)) flags[f] = true;
      expect(resolveDialogue(beat.key, flags).set).toBeUndefined();
    }
    expect(nextBreeBeat(flags)).toBeNull();
    expect(flags.striderJoined).toBe(true);
    expect(flags.chapter4Complete).toBe(true);
  });
  it('reconstructs one mandatory cue and reaches it from every zone entry at every checkpoint', () => {
    const flags = {};
    for (const beat of BREE_BEATS) {
      const zone = ZONES[beat.zone];
      const cues = zone.interactions.filter(
        (p) => BREE_BEATS.some((b) => b.key === p.dialogue) && p.when?.(flags),
      );
      expect(cues.map((p) => p.dialogue)).toEqual([beat.key]);
      for (const spawn of Object.values(zone.spawns)) {
        expect(
          findWalkablePath(
            zone.map,
            { x: spawn.x * 16 + 8, y: spawn.y * 16 },
            (x, y) => x === cues[0].x && y === cues[0].y,
          ).length,
          `${beat.key} from ${JSON.stringify(spawn)}`,
        ).toBeGreaterThan(0);
      }
      flags[beat.flag] = true;
    }
  });
  it('opens existing chapter-three terminal saves into Bree and gates departure on Bill', () => {
    const exit = ZONES.eastroad.exits.find((e) => e.zone === 'breegate');
    expect(exit.requires).toBe('chapter3Complete');
    expect(ZONES.bree.exits.find((e) => e.zone === 'breeroad').requires).toBe('billBought');
    expect(
      ZONES.ponycommon.exits.find((e) => e.zone === 'bree').blockedWhen({ breeRingSlip: true }),
    ).toBe(true);
    expect(
      ZONES.ponycommon.exits
        .find((e) => e.zone === 'bree')
        .blockedWhen({ breeRingSlip: true, breeMorning: true }),
    ).toBe(false);
    expect(
      ZONES.ponycommon.interactions
        .find((p) => p.dialogue === 'bree_fern')
        .when({ breeRingSlip: true }),
    ).toBe(false);
    expect(
      ZONES.breegate.exits.find((e) => e.zone === 'eastroad').blockedWhen({ striderJoined: true }),
    ).toBe(true);
  });
});
