import { describe, it, expect } from 'vitest';
import { resolveDialogue } from '../src/data/dialogues.js';
import { ZONES } from '../src/data/zones/index.js';

describe('the evening at Crickhollow', () => {
  it('connects the cottage door to a furnished supper room and back', () => {
    expect(ZONES.crickhollowhouse).toBeTruthy();
    expect(ZONES.crickhollow.doors.some((d) => d.zone === 'crickhollowhouse')).toBe(true);
    expect(ZONES.crickhollowhouse.exits.some((e) => e.zone === 'crickhollow')).toBe(true);
  });
  it('does not allow the dawn departure before supper and the morning gathering', () => {
    expect(resolveDialogue('crickhollow_departure', {}).set).toBeUndefined();
    expect(
      resolveDialogue('crickhollow_departure', { crickhollowSupper: true }).set,
    ).toBeUndefined();
    const dawn = { crickhollowSupper: true, crickhollowMorning: true, crickhollowReady: true };
    expect(resolveDialogue('crickhollow_departure', dawn).set).toContain('chapter2');
  });
  it('supper preserves the conspiracy and can only be completed once', () => {
    const supper = resolveDialogue('crickhollow_supper', {});
    expect(supper?.set).toBe('crickhollowSupper');
    expect(supper.lines.join(' ')).toMatch(/Sam/);
    expect(supper.lines.join(' ')).toMatch(/Gandalf/);
    expect(resolveDialogue('crickhollow_supper', { crickhollowSupper: true }).set).toBeUndefined();
  });
  it('older saves that already departed remain past the new dinner sequence', () => {
    expect(resolveDialogue('crickhollow_departure', { chapter2: true }).set).toBeUndefined();
    expect(resolveDialogue('crickhollow_supper', { chapter2: true })?.set).toBeUndefined();
  });
});
