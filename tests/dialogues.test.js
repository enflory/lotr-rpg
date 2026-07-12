import { describe, it, expect } from 'vitest';
import { DIALOGUES, resolveDialogue } from '../src/data/dialogues.js';

describe('resolveDialogue staging', () => {
  it('returns null for an unknown key', () => {
    expect(resolveDialogue('sauron', {})).toBeNull();
  });

  it('static entries resolve the same regardless of flags', () => {
    const before = resolveDialogue('lobelia', {});
    const after = resolveDialogue('lobelia', { metGandalf: true, samJoined: true });
    expect(before.name).toBe('Lobelia');
    expect(before.lines).toEqual(after.lines);
  });

  it('bilbo gives the farewell speech once, at the party', () => {
    const speech = resolveDialogue('bilbo', {});
    expect(speech.set).toBe('bilboFarewell');
    expect(speech.lines.join(' ')).toMatch(/eleventy-one/);

    const after = resolveDialogue('bilbo', { bilboFarewell: true });
    expect(after.set).toBeUndefined();
  });

  it('party guests talk about the party until the time skip', () => {
    for (const key of ['gandalf', 'gaffer', 'rosie', 'ted']) {
      const party = resolveDialogue(key, {});
      if (key === 'gandalf') {
        // Gandalf's prologue-ask stage also sends Frodo after his crates.
        expect(party.set, 'gandalf party stage sets cratesAsked').toBe('cratesAsked');
      } else {
        expect(party.set, `${key} party stage must not set flags`).toBeUndefined();
      }
      const later = resolveDialogue(key, { prologueDone: true });
      expect(later.lines, `${key} must change after the prologue`).not.toEqual(party.lines);
    }
  });

  it('gandalf first meeting reveals the Ring and sets metGandalf', () => {
    const dlg = resolveDialogue('gandalf', { prologueDone: true });
    expect(dlg.set).toBe('metGandalf');
    expect(dlg.objective).toMatch(/Sam/);
    expect(dlg.lines.join(' ')).toMatch(/One Ring/);
  });

  it('gandalf nudges toward Sam until he joins', () => {
    const dlg = resolveDialogue('gandalf', { prologueDone: true, metGandalf: true });
    expect(dlg.set).toBeUndefined();
    expect(dlg.lines.join(' ')).toMatch(/fetch him/i);
  });

  it('gandalf gives travel directions once Sam has joined', () => {
    const dlg = resolveDialogue('gandalf', {
      prologueDone: true,
      metGandalf: true,
      samJoined: true,
    });
    expect(dlg.lines.join(' ')).toMatch(/Woody End/);
  });

  it('sam joins as follower only after Gandalf revealed the Ring', () => {
    const early = resolveDialogue('sam', {});
    expect(early.join).toBeUndefined();

    const joining = resolveDialogue('sam', { metGandalf: true });
    expect(joining.join).toBe('sam');
    expect(joining.set).toBe('samJoined');
    expect(joining.objective).toMatch(/East Road/);

    const joined = resolveDialogue('sam', { metGandalf: true, samJoined: true });
    expect(joined.join).toBeUndefined();
  });

  it('gildor sets metGildor and points to the ferry on first meeting only', () => {
    const first = resolveDialogue('gildor', { escapedRider: true });
    expect(first.set).toBe('metGildor');
    expect(first.objective).toMatch(/Ferry/i);

    const again = resolveDialogue('gildor', { escapedRider: true, metGildor: true });
    expect(again.set).toBeUndefined();
  });

  it('maggot offers the waggon and the mushrooms exactly once', () => {
    const first = resolveDialogue('maggot', {});
    expect(first.set).toEqual(['maggotRide', 'mushrooms']);
    expect(first.objective).toMatch(/Ferry/);
    expect(first.lines.join(' ')).toMatch(/BAGGINS/);

    const again = resolveDialogue('maggot', { maggotRide: true });
    expect(again.set).toBeUndefined();
  });

  it("Bilbo's desk points to Lobelia's spoons only while the errand is live", () => {
    // Before meeting Gandalf: just the book, no clue.
    const early = resolveDialogue('examine_desk', {});
    expect(early.lines.join(' ')).toMatch(/ink is long dry/i);
    expect(early.lines.join(' ')).not.toMatch(/spoons/i);

    // After Gandalf, before the spoons are found: the note names the chest.
    const clue = resolveDialogue('examine_desk', { metGandalf: true });
    expect(clue.lines.join(' ')).toMatch(/spoons/i);
    expect(clue.lines.join(' ')).toMatch(/old\s+chest/i);

    // Once found, the desk reverts to its plain description.
    const after = resolveDialogue('examine_desk', { metGandalf: true, foundSpoons: true });
    expect(after.lines.join(' ')).not.toMatch(/spoons/i);
  });

  it('merry readies the raft on first meeting only', () => {
    const first = resolveDialogue('merry', {});
    expect(first.set).toBe('merryMet');
    expect(first.objective).toMatch(/raft/i);

    const again = resolveDialogue('merry', { merryMet: true });
    expect(again.set).toBeUndefined();
  });
});

describe('dialogue data integrity', () => {
  const entries = Object.entries(DIALOGUES);

  it('every entry has a speaker name', () => {
    for (const [key, dlg] of entries) {
      expect(dlg.name, `${key} is missing a name`).toBeTruthy();
    }
  });

  it('every entry/stage has at least one non-empty line', () => {
    for (const [key, dlg] of entries) {
      const stages = dlg.stages ?? [dlg];
      stages.forEach((stage, i) => {
        expect(stage.lines?.length, `${key} stage ${i} has no lines`).toBeGreaterThan(0);
        for (const line of stage.lines) {
          expect(line, `${key} stage ${i} has an empty line`).toBeTruthy();
        }
      });
    }
  });

  it('every staged dialogue ends with an unconditional fallback stage', () => {
    // Without one, resolveDialogue can return null and the NPC goes mute.
    for (const [key, dlg] of entries) {
      if (!dlg.stages) continue;
      const last = dlg.stages[dlg.stages.length - 1];
      expect(last.when, `${key} has no fallback stage`).toBeUndefined();
    }
  });

  it('every staged dialogue resolves at every reachable flag combination', () => {
    const storyFlags = [
      'bilboFarewell',
      'prologueDone',
      'metGandalf',
      'samJoined',
      'escapedRider',
      'metGildor',
      'maggotRide',
      'merryMet',
    ];
    for (let mask = 0; mask < 1 << storyFlags.length; mask++) {
      const flags = {};
      storyFlags.forEach((f, i) => {
        if (mask & (1 << i)) flags[f] = true;
      });
      for (const key of Object.keys(DIALOGUES)) {
        expect(
          resolveDialogue(key, flags),
          `${key} unresolvable at ${JSON.stringify(flags)}`,
        ).not.toBeNull();
      }
    }
  });
});

describe('item-aware stages', () => {
  it('passes an item-count fn through to stage predicates', () => {
    DIALOGUES.__test = {
      name: 'X',
      stages: [
        { when: (f, count) => count('mushroom') >= 3, lines: ['plenty'] },
        { lines: ['few'] },
      ],
    };
    expect(resolveDialogue('__test', {}, () => 5).lines).toEqual(['plenty']);
    expect(resolveDialogue('__test', {}, () => 0).lines).toEqual(['few']);
    delete DIALOGUES.__test;
  });
});
