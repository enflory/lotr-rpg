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

  it('gandalf first meeting reveals the Ring and sets metGandalf', () => {
    const dlg = resolveDialogue('gandalf', {});
    expect(dlg.set).toBe('metGandalf');
    expect(dlg.objective).toMatch(/Sam/);
    expect(dlg.lines.join(' ')).toMatch(/One Ring/);
  });

  it('gandalf nudges toward Sam until he joins', () => {
    const dlg = resolveDialogue('gandalf', { metGandalf: true });
    expect(dlg.set).toBeUndefined();
    expect(dlg.lines.join(' ')).toMatch(/fetch him/i);
  });

  it('gandalf gives travel directions once Sam has joined', () => {
    const dlg = resolveDialogue('gandalf', { metGandalf: true, samJoined: true });
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
    const storyFlags = ['metGandalf', 'samJoined', 'escapedRider', 'metGildor'];
    for (let mask = 0; mask < 1 << storyFlags.length; mask++) {
      const flags = {};
      storyFlags.forEach((f, i) => { if (mask & (1 << i)) flags[f] = true; });
      for (const key of Object.keys(DIALOGUES)) {
        expect(resolveDialogue(key, flags), `${key} unresolvable at ${JSON.stringify(flags)}`).not.toBeNull();
      }
    }
  });
});
