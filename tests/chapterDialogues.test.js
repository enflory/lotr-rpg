import { describe, expect, it } from 'vitest';
import { CHAPTER_DIALOGUES } from '../src/data/chapterDialogues.js';

function journey(initialFlags = {}) {
  const flags = { ...initialFlags };
  const items = {};
  function finish(key) {
    const dialogue = CHAPTER_DIALOGUES[key];
    const stage = dialogue.lines
      ? dialogue
      : dialogue.stages.find((s) => !s.when || s.when(flags, (item) => items[item] ?? 0));
    for (const flag of [].concat(stage.set ?? [])) flags[flag] = true;
    if (stage.give) items[stage.give] = (items[stage.give] ?? 0) + 1;
    return stage;
  }
  return { flags, items, finish };
}

describe('chapter dialogue progression', () => {
  it('keeps the two dreams on separate nights around stories and the Ring', () => {
    const { flags, finish, items } = journey();
    for (const key of [
      'house_supper',
      'house_bed',
      'house_stories',
      'house_ring',
      'house_farewell',
    ]) {
      expect(finish(key).set).toBeUndefined();
    }
    finish('house_welcome');
    finish('house_supper');
    const firstNight = finish('house_bed');
    expect(firstNight.lines.join(' ')).toMatch(/tower/);
    expect(flags.houseNightOne).toBe(true);
    expect(flags.houseRested).toBeUndefined();
    expect(finish('house_bed').set).toBeUndefined();
    expect(finish('house_ring').set).toBeUndefined();
    finish('house_stories');
    expect(finish('house_bed').set).toBeUndefined();
    expect(finish('house_farewell').give).toBeUndefined();
    finish('house_ring');
    const secondNight = finish('house_bed');
    expect(secondNight.lines.join(' ')).toMatch(/green land/);
    expect(flags.houseRested).toBe(true);
    expect(flags.chapter2Complete).toBe(true);
    finish('house_farewell');
    finish('house_farewell');
    finish('house_bed');
    expect(flags.chapter3).toBe(true);
    expect(items.tom_song).toBe(1);
  });

  it('resumes from the saved first-night checkpoint without skipping the second night', () => {
    const { flags, finish } = journey({
      houseWelcomed: true,
      houseSupper: true,
      houseNightOne: true,
    });
    expect(finish('house_bed').set).toBeUndefined();
    finish('house_stories');
    finish('house_ring');
    expect(flags.houseRested).toBeUndefined();
    finish('house_bed');
    expect(flags.houseRested).toBe(true);
  });

  it('requires capture, courage, rescue and blades before recovering ponies', () => {
    const { flags, items, finish } = journey();
    for (const key of [
      'barrow_courage',
      'barrow_call',
      'barrow_treasure',
      'barrow_ponies',
      'road_farewell',
    ]) {
      expect(finish(key).set).toBeUndefined();
    }
    expect(finish('downs_voices').set).toBeUndefined();
    finish('downs_stone');
    finish('downs_voices');
    expect(flags.barrowTaken).toBe(true);
    expect(finish('barrow_call').set).toBeUndefined();
    finish('barrow_courage');
    expect(finish('barrow_treasure').give).toBeUndefined();
    finish('barrow_call');
    expect(finish('barrow_ponies').set).toBeUndefined();
    finish('barrow_treasure');
    finish('barrow_treasure');
    expect(items.barrow_blades).toBe(1);
    finish('barrow_ponies');
    finish('road_farewell');
    expect(flags.chapter3Complete).toBe(true);
  });

  it('does not summon or release Tom before the failed fire', () => {
    const { flags, finish } = journey();
    for (const key of ['willow_trunk', 'willow_help', 'willow_tom']) {
      expect(finish(key).set).toBeUndefined();
    }
    finish('willow_sleep');
    expect(finish('willow_help').set).toBeUndefined();
    finish('willow_trunk');
    expect(flags.willowFireFailed).toBe(true);
    expect(finish('willow_tom').set).toBeUndefined();
    finish('willow_help');
    finish('willow_tom');
    expect(flags.willowFreed).toBe(true);
    expect(finish('willow_sleep').set).toBeUndefined();
  });

  it('keeps chapter text within three lines per page and forty characters per line', () => {
    for (const [key, dialogue] of Object.entries(CHAPTER_DIALOGUES)) {
      for (const stage of dialogue.stages ?? [dialogue]) {
        for (const page of stage.lines) {
          const lines = page.split('\n');
          expect(lines.length, key).toBeLessThanOrEqual(3);
          for (const line of lines) expect(line.length, `${key}: ${line}`).toBeLessThanOrEqual(40);
        }
      }
    }
  });
});
