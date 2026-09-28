import { describe, it, expect } from 'vitest';
import { BREE_BEATS, nextBreeBeat } from '../src/state/breeProgress.js';
import { resolveDialogue } from '../src/data/dialogues.js';
import { ZONES } from '../src/data/zones/index.js';
import { findWalkablePath } from '../src/state/partyMovement.js';
import { CHAR_NAMES, CHAR_DEFS } from '../src/art/characters.js';

describe('Bree chapter', () => {
  it('registers every character for texture and animation generation', () => {
    expect(CHAR_NAMES.sort()).toEqual(Object.keys(CHAR_DEFS).sort());
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
      const cues = zone.interactions.filter((p) => p.when?.(flags));
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
  });
});
