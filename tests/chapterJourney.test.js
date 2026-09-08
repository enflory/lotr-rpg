import { describe, it, expect } from 'vitest';
import { ZONES } from '../src/data/zones/index.js';
import { resolveDialogue } from '../src/data/dialogues.js';
import { COLLISION_TILES } from '../src/data/tileTypes.js';

const journey = [
  'crickhollow',
  'crickhollowhouse',
  'hedgetunnel',
  'forestgate',
  'forestheart',
  'withywindle',
  'tomclearing',
  'tomhouse',
  'downs',
  'barrow',
  'barrowhill',
  'eastroad',
];
function flood(zone, spawn) {
  const seen = new Set(),
    queue = [[spawn.x, spawn.y]];
  for (let i = 0; i < queue.length; i++) {
    const [x, y] = queue[i],
      key = `${x},${y}`;
    if (seen.has(key) || zone.map[y]?.[x] === undefined || COLLISION_TILES.includes(zone.map[y][x]))
      continue;
    seen.add(key);
    queue.push([x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]);
  }
  return seen;
}
describe('beyond the hedge playable routes', () => {
  it('connects the ferry to Crickhollow and all the way to the East Road', () => {
    expect(ZONES.marish.exits.some((e) => e.zone === 'crickhollow')).toBe(true);
    for (const key of journey) expect(ZONES[key], key).toBeTruthy();
  });
  it('each entry can reach every exit and approach every interaction', () => {
    for (const key of journey) {
      const z = ZONES[key];
      expect(z, key).toBeTruthy();
      for (const s of Object.values(z.spawns)) {
        const seen = flood(z, s);
        for (const e of z.exits)
          expect(seen.has(`${e.x},${e.y}`), `${key} exit ${e.zone}`).toBe(true);
        for (const p of [...(z.interactions ?? []), ...z.signs, ...z.npcs]) {
          expect(
            [
              [p.x, p.y],
              [p.x - 1, p.y],
              [p.x + 1, p.y],
              [p.x, p.y - 1],
              [p.x, p.y + 1],
            ].some(([x, y]) => seen.has(`${x},${y}`)),
            `${key} interaction ${p.dialogue ?? p.key}`,
          ).toBe(true);
        }
      }
    }
  });
});
describe('the downs close behind you', () => {
  it('blocks the way back to Tom once the mist is down', () => {
    const back = ZONES.downs.exits.find((e) => e.zone === 'tomclearing');
    expect(back).toBeTruthy();
    // Before the mist it is an ordinary way out; afterwards, leaving would
    // hand the player back the three companions the story has just taken.
    expect(back.blockedWhen({})).toBe(false);
    expect(back.blockedWhen({ downsFog: true })).toBe(true);
    expect(back.blockedWhen({ downsFog: true, downsSeparated: true })).toBe(true);
    expect(back.denied).toBeTruthy();
  });
});
describe('book sequence gates', () => {
  function finish(key, flags) {
    const d = resolveDialogue(key, flags);
    expect(d, key).toBeTruthy();
    for (const f of [].concat(d.set ?? [])) flags[f] = true;
    return d;
  }
  it('requires rescue before releasing the Willow and gives the song only after the stay', () => {
    const f = {};
    finish('willow_trunk', f);
    expect(f.willowFreed).toBeFalsy();
    finish('willow_sleep', f);
    finish('willow_trunk', f);
    expect(f.willowFireFailed).toBe(true);
    finish('willow_help', f);
    finish('willow_tom', f);
    expect(f.willowFreed).toBe(true);
    expect(f.learnedSong).toBeFalsy();
  });
  it('keeps barrow courage, the call and the blades in order without duplicate rewards', () => {
    const f = { barrowTaken: true };
    finish('barrow_call', f);
    expect(f.barrowRescued).toBeFalsy();
    finish('barrow_courage', f);
    expect(f.barrowCourage).toBe(true);
    finish('barrow_call', f);
    expect(f.barrowRescued).toBe(true);
    expect(f.barrowBlades).toBeFalsy();
    expect(finish('barrow_treasure', f).give).toBe('barrow_blades');
    expect(finish('barrow_treasure', f).give).toBeUndefined();
  });
});
