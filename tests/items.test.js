import { describe, it, expect } from 'vitest';
import { ITEMS, ITEM_KEYS } from '../src/data/items.js';
import { ICON_FNS } from '../src/art/items.js';

describe('item registry invariants', () => {
  it('every item has a name and description', () => {
    for (const [key, item] of Object.entries(ITEMS)) {
      expect(item.name, key).toBeTruthy();
      expect(item.desc, key).toBeTruthy();
    }
  });
  it('ICON_FNS matches ITEM_KEYS one-to-one (order contract, like tiles)', () => {
    expect(ICON_FNS.length).toBe(ITEM_KEYS.length);
    for (const fn of ICON_FNS) expect(typeof fn).toBe('function');
  });
});
