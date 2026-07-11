# Chapter 1 Depth & Exploration Pass — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a thin light-RPG layer (items, pickups, examines, errands, `I`-key overlay) plus a curated book-anchored content pass over all five Chapter 1 zones, per the approved spec at `docs/superpowers/specs/2026-07-11-ch1-depth-design.md`.

**Architecture:** New declarative data files (`items.js`, `quests.js`) mirror the existing zone/dialogue pattern; WorldScene gains pickup rendering, walk-over collection, a coordinate-first examine lookup, and an overlay panel. Content lands zone by zone on top: an enlarged Shire (48×44 via programmatic extension of the hand-authored core), a doubled Woody End (64×28), and a wider Marish (56×30) with the ferry/rider event coordinates de-hardcoded into zone exports. All art stays procedural.

**Tech Stack:** Phaser 3, Vite, Vitest, Playwright. JSDoc typedefs enforced by `npm run typecheck`.

**Read first:** `CLAUDE.md` (build commands, QA gotchas), the spec, `src/data/types.js`, `tests/zones.test.js`.

**Conventions for every task:**
- Run `npm test` before starting (must be green) and after finishing (must be green).
- Run `npm run typecheck && npm run lint` before each commit.
- Commit after each task with the message given in the task.
- Dialogue lines are hand-wrapped with `\n` at ~26 chars/line, 3 lines max per box (match `src/data/dialogues.js`).

---

## Phase 1 — The reusable layer

### Task 1: Item state in GameState

**Files:**
- Modify: `src/state/GameState.js`
- Test: `tests/gameState.test.js`

- [ ] **Step 1: Write failing tests** — append to `tests/gameState.test.js`:

```js
import { addItem, removeItem, itemCount, collect, isCollected } from '../src/state/GameState.js';

describe('items and pickups', () => {
  it('addItem/itemCount track counts, removeItem floors at zero', () => {
    expect(itemCount('mushroom')).toBe(0);
    addItem('mushroom');
    addItem('mushroom', 2);
    expect(itemCount('mushroom')).toBe(3);
    removeItem('mushroom');
    expect(itemCount('mushroom')).toBe(2);
    removeItem('mushroom', 5);
    expect(itemCount('mushroom')).toBe(0);
  });

  it('collect/isCollected record pickup ids', () => {
    expect(isCollected('shire_mathom_1')).toBe(false);
    collect('shire_mathom_1');
    expect(isCollected('shire_mathom_1')).toBe(true);
  });
});
```

Note: `tests/gameState.test.js` currently resets state between tests — follow its existing `beforeEach` pattern and reset `gameState.items = {}` and `gameState.collected = {}` there too.

- [ ] **Step 2: Run** `npx vitest run tests/gameState.test.js` — expect FAIL (no such exports).
- [ ] **Step 3: Implement** in `src/state/GameState.js`: add to the singleton

```js
  /** @type {Record<string, number>} item key → count carried */
  items: {},
  /** @type {Record<string, boolean>} pickup ids already collected */
  collected: {},
```

and the helpers:

```js
/** @param {string} key @param {number} [n] */
export function addItem(key, n = 1) {
  gameState.items[key] = (gameState.items[key] || 0) + n;
}
/** @param {string} key @param {number} [n] */
export function removeItem(key, n = 1) {
  gameState.items[key] = Math.max(0, (gameState.items[key] || 0) - n);
}
/** @param {string} key */
export function itemCount(key) {
  return gameState.items[key] || 0;
}
/** @param {string} id */
export function collect(id) {
  gameState.collected[id] = true;
}
/** @param {string} id */
export function isCollected(id) {
  return !!gameState.collected[id];
}
```

- [ ] **Step 4: Run** `npx vitest run tests/gameState.test.js` — expect PASS. Then `npm test`.
- [ ] **Step 5: Commit** — `feat: item counts and collected-pickup state in GameState`

### Task 2: Item registry + icons

**Files:**
- Create: `src/data/items.js`, `src/art/items.js`
- Modify: `src/scenes/BootScene.js`, `.prettierignore` (add `src/art/items.js` — pixel art is format-exempt)
- Test: `tests/items.test.js`

- [ ] **Step 1: Write failing test** `tests/items.test.js`:

```js
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
```

- [ ] **Step 2: Run** `npx vitest run tests/items.test.js` — expect FAIL.
- [ ] **Step 3: Create `src/data/items.js`:**

```js
// Item registry — collectibles and errand goods. Icon draw order in
// src/art/items.js must match ITEM_KEYS.

/** @type {Record<string, { name: string, desc: string }>} */
export const ITEMS = {
  mushroom: { name: 'Mushroom', desc: 'A fat field mushroom. A hobbit delicacy.' },
  mathom: { name: 'Mathom', desc: "One of Bilbo's old curios, of no use and every value." },
  silver_spoons: { name: 'Silver Spoons', desc: "Bilbo's labelled parting gift for Lobelia." },
  ale_mug: { name: 'Half-pint', desc: 'A foaming mug from the Green Dragon, for the Gaffer.' },
  firework_crate: { name: 'Firework Crate', desc: "Gandalf's — SQUIBS, handle with care." },
  elven_provisions: { name: 'Elven Provisions', desc: "Bread and fruit left by Gildor's folk." },
  maggot_basket: { name: "Mrs. Maggot's Basket", desc: 'Mushrooms, packed in straw.' },
};

export const ITEM_KEYS = Object.keys(ITEMS);
```

- [ ] **Step 4: Create `src/art/items.js`** — 12×12 icons on a strip, same pattern as `src/art/tiles.js` (import `px`, `rc` from `./helpers.js`). One function per item, `export const ICON_FNS = [drawMushroom, drawMathom, drawSpoons, drawAleMug, drawCrate, drawProvisions, drawBasket];` **in ITEM_KEYS order**, and:

```js
const IS = 12;
export function makeItemIconsDataURL() {
  const canvas = document.createElement('canvas');
  canvas.width = ICON_FNS.length * IS;
  canvas.height = IS;
  const c = canvas.getContext('2d');
  ICON_FNS.forEach((fn, i) => fn(c, i * IS));
  return canvas.toDataURL();
}
```

Icon guidance (keep each ~10 lines, dark `#241a10` outline pixels around a simple silhouette): mushroom = tan stalk + red-brown `#a5523c` cap with `#e8d8c0` flecks; mathom = small gold `#e0c050` trinket-box with `#8a6b3d` band; spoons = two grey `#c0c8d0` spoon shapes crossed; ale mug = `#8a6b3d` tankard, `#f0e6c8` foam top; crate = `#a5823c` box with an `#e04040` rocket sticking out; provisions = `#f0e6c8` bread loaf on a `#4e7030` leaf; basket = `#b08c48` woven basket with mushroom tops peeking out.

- [ ] **Step 5: Register in BootScene** (`src/scenes/BootScene.js`): import `makeItemIconsDataURL` and in `preload()`:

```js
this.load.spritesheet('items', makeItemIconsDataURL(), { frameWidth: 12, frameHeight: 12 });
```

- [ ] **Step 6: Run** `npx vitest run tests/items.test.js` (PASS), then `npm test`, then `npm run build`. Open `npm run dev` → `/art-test.html` is tiles/characters only; visual check of icons happens in Task 4's browser QA.
- [ ] **Step 7: Commit** — `feat: item registry and procedural 12px item icons`

### Task 3: Dialogue effects `give`/`take` + item-aware stage predicates

**Files:**
- Modify: `src/data/dialogues.js` (resolveDialogue signature), `src/data/types.js`, `src/scenes/WorldScene.js`
- Test: `tests/dialogues.test.js`

- [ ] **Step 1: Write failing tests** — append to `tests/dialogues.test.js`:

```js
import { resolveDialogue } from '../src/data/dialogues.js';

describe('item-aware stages', () => {
  it('passes an item-count fn through to stage predicates', () => {
    const dlg = {
      name: 'X',
      stages: [
        { when: (f, count) => count('mushroom') >= 3, lines: ['plenty'] },
        { lines: ['few'] },
      ],
    };
    // resolveDialogue works off the registry; test the stage-matching core
    // via a temporary registry entry:
    const { DIALOGUES } = await import('../src/data/dialogues.js');
    DIALOGUES.__test = dlg;
    expect(resolveDialogue('__test', {}, () => 5).lines).toEqual(['plenty']);
    expect(resolveDialogue('__test', {}, () => 0).lines).toEqual(['few']);
    delete DIALOGUES.__test;
  });
});
```

(Adapt to the file's existing import style — top-level import, not dynamic, if simpler.)

- [ ] **Step 2: Run** — expect FAIL (predicate receives one arg; count is undefined → throws).
- [ ] **Step 3: Implement:**
  - `resolveDialogue(key, flags, count = () => 0)`; stage match becomes `dlg.stages.find((s) => !s.when || s.when(flags, count))`.
  - `src/data/types.js`: DialogueStage `when` gains the second param in its typedef; add `@property {string} [give] item key granted when the dialogue closes` and `@property {string} [take] item key removed when the dialogue closes`.
  - `src/scenes/WorldScene.js`: `startDialogue` passes `itemCount` (import from GameState): `resolveDialogue(key, gameState.flags, itemCount)`. In `closeDialogue()`, after the `set` block:

```js
    if (stage.give) {
      addItem(stage.give);
      sfx.jingle();
      this.showBanner(`Got: ${ITEMS[stage.give].name}!`);
    }
    if (stage.take) removeItem(stage.take);
```

(import `ITEMS` from `../data/items.js`, `addItem`/`removeItem`/`itemCount` from GameState). Note `stage.objective` also calls `showBanner` — when both fire, let the objective banner win by keeping the `give` banner **before** the objective block.

- [ ] **Step 4: Run** `npm test` — PASS. `npm run typecheck` — clean.
- [ ] **Step 5: Commit** — `feat: dialogue stages can give/take items and read item counts`

### Task 4: Zone pickups — render + walk-over collection

**Files:**
- Modify: `src/data/types.js`, `src/scenes/WorldScene.js`
- Test: `tests/zones.test.js` (integrity rules), browser QA

- [ ] **Step 1: Typedef** in `src/data/types.js`:

```js
/**
 * @typedef {Object} PickupDef
 * @property {string} id globally unique (prefix with zone key)
 * @property {number} x tile column
 * @property {number} y tile row
 * @property {string} item key in ITEMS
 * @property {(flags: Record<string, boolean>) => boolean} [when] spawn condition
 * @property {string} [onCollect] dialogue key auto-started after collection
 */
```

Zone typedef gains `@property {PickupDef[]} [pickups]`.

- [ ] **Step 2: Write failing integrity tests** — add to `tests/zones.test.js`:

```js
import { ITEMS } from '../src/data/items.js';

describe('pickups', () => {
  const all = zones.flatMap((z) => (z.pickups ?? []).map((p) => ({ zone: z, p })));

  it('every pickup has a unique id, a real item, and a walkable in-bounds tile', () => {
    const ids = all.map(({ p }) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const { zone, p } of all) {
      expect(ITEMS[p.item], `${p.id} references unknown item ${p.item}`).toBeTruthy();
      expect(inBounds(zone, p.x, p.y), `${p.id} out of bounds`).toBe(true);
      expect(walkable(zone, p.x, p.y), `${p.id} on solid tile`).toBe(true);
      if (p.onCollect) expect(DIALOGUES[p.onCollect], `${p.id} onCollect`).toBeTruthy();
    }
  });
});
```

This passes vacuously now (no pickups exist) — that's fine; it's the contract for Phases 2–4. Run `npm test` to confirm green.

- [ ] **Step 3: Implement in WorldScene.** In `create()` after the NPC block:

```js
    /* ── pickups ─────────────────────────────────────── */
    this.pickups = [];
    for (const def of zone.pickups ?? []) {
      if (isCollected(def.id)) continue;
      if (def.when && !def.when(gameState.flags)) continue;
      const spr = this.add.image(def.x * TILE_SIZE + 8, def.y * TILE_SIZE + 8, 'items',
        ITEM_KEYS.indexOf(def.item));
      spr.setDepth(def.y * TILE_SIZE); // under characters standing below
      this.pickups.push({ def, spr });
    }
```

In `update()` right after the movement block (player position is settled, not during dialogue/inputLocked):

```js
    /* ── pickup collection (walk-over) ───────────────── */
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const { def, spr } = this.pickups[i];
      if (Phaser.Math.Distance.Between(this.player.x, this.player.y + 8, spr.x, spr.y) > 10)
        continue;
      this.pickups.splice(i, 1);
      spr.destroy();
      collect(def.id);
      addItem(def.item);
      sfx.jingle();
      const n = itemCount(def.item);
      this.showBanner(`Got: ${ITEMS[def.item].name}${n > 1 ? ` (${n})` : ''}!`);
      if (def.onCollect) this.startDialogue(def.onCollect);
    }
```

Imports: `collect`, `isCollected` from GameState; `ITEM_KEYS` from items data.

- [ ] **Step 4: Browser QA.** Temporarily add to `shire.js`: `pickups: [{ id: 'qa_test', x: 21, y: 8, item: 'mushroom' }]`. Run `npm run dev`, start the game (preset `window.__state.flags.prologueDone = true` on the title screen per CLAUDE.md), walk over it: icon visible → jingle → "Got: Mushroom!" banner → gone; leave and re-enter the zone → still gone. **Remove the QA pickup.**
- [ ] **Step 5:** `npm test && npm run typecheck && npm run lint` — green.
- [ ] **Step 6: Commit** — `feat: zone pickups with walk-over collection`

### Task 5: Examines — coordinate-first sign lookup

**Files:**
- Modify: `src/scenes/WorldScene.js:400-407`, `tests/zones.test.js:117-131`

- [ ] **Step 1: Update the integrity rule first** (it will now express the new contract). In `tests/zones.test.js`, replace the "every sign sits on a SIGN tile" test body:

```js
  it('every sign/examine sits on a SIGN or solid tile and has a dialogue entry', () => {
    for (const zone of zones) {
      for (const sign of zone.signs) {
        const tile = zone.map[sign.y][sign.x];
        expect(
          tile === T.SIGN || solid.has(tile),
          `${zone.key} sign (${sign.x},${sign.y}) on walkable non-sign tile — unreachable`,
        ).toBe(true);
        expect(
          DIALOGUES[sign.dialogue],
          `${zone.key} sign references unknown dialogue ${sign.dialogue}`,
        ).toBeTruthy();
      }
    }
  });
```

- [ ] **Step 2: Engine change** in `checkTileInteraction()` — replace the `if (tile === T.SIGN)` block with a lookup that works on any solid tile (doors keep priority above it):

```js
      if (tile === T.SIGN || COLLISION_TILES.includes(tile)) {
        const sign = this.zone.signs.find((s) => s.x === tx && s.y === ty);
        if (sign) {
          this.startDialogue(sign.dialogue);
          return;
        }
      }
```

- [ ] **Step 3: QA** — in the running game, face the Bag End sign and the Bywater sign: both still talk. Face a fence: nothing happens (no entry). `npm test` green.
- [ ] **Step 4: Commit** — `feat: examines — signs array works on any solid tile`

### Task 6: Quests registry + overlay panel (I key)

**Files:**
- Create: `src/data/quests.js`
- Modify: `src/data/types.js`, `src/scenes/WorldScene.js`
- Test: `tests/quests.test.js`

- [ ] **Step 1: Write failing test** `tests/quests.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { QUESTS } from '../src/data/quests.js';

const none = () => 0;
const lots = () => 99;
const allFlags = new Proxy({}, { get: () => true });

describe('quest registry', () => {
  it('every quest has key/title/hint and total-function predicates', () => {
    const keys = QUESTS.map((q) => q.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const q of QUESTS) {
      expect(q.title, q.key).toBeTruthy();
      expect(q.hint, q.key).toBeTruthy();
      // predicates must not throw on empty or saturated state
      expect(typeof q.active({}, none)).toBe('boolean');
      expect(typeof q.done({}, none)).toBe('boolean');
      expect(typeof q.active(allFlags, lots)).toBe('boolean');
      expect(typeof q.done(allFlags, lots)).toBe('boolean');
    }
  });
  it('no quest is done before it is active on a fresh game', () => {
    for (const q of QUESTS) expect(q.done({}, none), q.key).toBe(false);
  });
});
```

- [ ] **Step 2: Run** — FAIL (module missing).
- [ ] **Step 3: Create `src/data/quests.js`** — quests are a pure view over flags/items (typedef in types.js: `QuestDef` with `key`, `title`, `hint`, `active(flags, count)`, `done(flags, count)`):

```js
// Errand registry — a read-only view over story flags and item counts.
// Nothing here gates the main story.

/** @type {import('./types.js').QuestDef[]} */
export const QUESTS = [
  {
    key: 'crates',
    title: "Gandalf's fireworks",
    hint: 'Fetch the three misplaced crates around the Party Field.',
    active: (f) => !!f.cratesAsked && !f.prologueDone,
    done: (f, count) => count('firework_crate') >= 3,
  },
  {
    key: 'spoons',
    title: "Lobelia's spoons",
    hint: 'Bilbo left Lobelia a labelled gift. Find it in Bag End.',
    active: (f) => !!f.prologueDone && !!f.metGandalf,
    done: (f) => !!f.gaveSpoons,
  },
  {
    key: 'halfpint',
    title: "The Gaffer's half-pint",
    hint: 'Run the mug from the Green Dragon down to Bagshot Row.',
    active: (f) => !!f.halfPintTaken,
    done: (f) => !!f.halfPintDelivered,
  },
  {
    key: 'dogs',
    title: "Maggot's dogs",
    hint: 'Grip, Fang and Wolf are hiding in the marsh. Send them home.',
    active: (f) => !!f.dogsAsked,
    done: (f) => !!f.gotBasket,
  },
];
```

- [ ] **Step 4: Overlay in WorldScene.** In `create()` (after the banner block) build a hidden panel; on `keydown-I` toggle it. Content is rebuilt on every open. No pause — the world keeps running behind it.

```js
    /* ── inventory/errand overlay (I) ────────────────── */
    this.overlayVisible = false;
    this.overlayBg = this.add.rectangle(160, 120, 260, 168, 0x000000, 0.92)
      .setScrollFactor(0).setDepth(1100).setVisible(false)
      .setStrokeStyle(1, 0xc8a84e);
    this.overlayText = this.add.text(40, 46, '', {
      fontFamily: '"Press Start 2P"', fontSize: '6px', color: '#f0ead6', lineSpacing: 6,
    }).setScrollFactor(0).setDepth(1101).setVisible(false);
    this.overlayIcons = [];
    this.input.keyboard.on('keydown-I', () => this.toggleOverlay());
```

New methods (bottom of the class):

```js
  toggleOverlay() {
    this.overlayVisible = !this.overlayVisible;
    this.overlayBg.setVisible(this.overlayVisible);
    this.overlayText.setVisible(this.overlayVisible);
    for (const icon of this.overlayIcons) icon.destroy();
    this.overlayIcons = [];
    if (!this.overlayVisible) return;
    sfx.confirm();

    // Possessions with icons down the left
    const lines = [];
    let row = 0;
    for (const key of ITEM_KEYS) {
      const n = itemCount(key);
      if (!n) continue;
      const icon = this.add.image(48, 58 + row * 14, 'items', ITEM_KEYS.indexOf(key))
        .setScrollFactor(0).setDepth(1101);
      this.overlayIcons.push(icon);
      lines.push(`   ${ITEMS[key].name}${n > 1 ? ` x${n}` : ''}`);
      row++;
    }
    if (!lines.length) lines.push('(nothing carried)');

    // Errands
    lines.push('');
    const count = itemCount;
    for (const q of QUESTS) {
      if (!q.active(gameState.flags, count) && !q.done(gameState.flags, count)) continue;
      lines.push(`${q.done(gameState.flags, count) ? '[x]' : '[ ]'} ${q.title}`);
    }

    // Completion tallies from the pickup registry
    lines.push('');
    lines.push(this.tallyLine());
    this.overlayText.setText(lines.join('\n'));
  }

  tallyLine() {
    const totals = {};
    const found = {};
    for (const z of Object.values(ZONES)) {
      for (const p of z.pickups ?? []) {
        totals[p.item] = (totals[p.item] || 0) + 1;
        if (isCollected(p.id)) found[p.item] = (found[p.item] || 0) + 1;
      }
    }
    const parts = [];
    for (const key of ['mathom', 'mushroom']) {
      if (totals[key]) parts.push(`${ITEMS[key].name}s ${found[key] || 0}/${totals[key]}`);
    }
    return parts.join(' · ');
  }
```

Also: opening dialogue while the overlay is up should close it — first line of `startDialogue`: `if (this.overlayVisible) this.toggleOverlay();`.

- [ ] **Step 5: QA in browser** — press I: panel shows "(nothing carried)"; give yourself an item in the console (`window.__state.items.mushroom = 2`), reopen: listed with icon. `npm test && npm run typecheck && npm run lint`.
- [ ] **Step 6: Commit** — `feat: errand registry and I-key inventory overlay`

---

## Phase 2 — Hobbiton, Bag End, the Green Dragon

### Task 7: Map utils + Shire growth to 48×44

**Files:**
- Create: `src/data/zones/mapUtils.js`
- Modify: `src/data/zones/shire.js`, `tests/zones.test.js`
- Test: `tests/mapUtils.test.js`

- [ ] **Step 1: Write failing tests** `tests/mapUtils.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { extendMap, stamp } from '../src/data/zones/mapUtils.js';

describe('extendMap', () => {
  it('appends east columns and south rows with the fill tile', () => {
    const m = extendMap([[1, 1], [1, 1]], { east: 2, south: 1, fill: 0 });
    expect(m).toEqual([[1, 1, 0, 0], [1, 1, 0, 0], [0, 0, 0, 0]]);
  });
  it('does not mutate the source map', () => {
    const src = [[1]];
    extendMap(src, { east: 1, south: 0, fill: 0 });
    expect(src).toEqual([[1]]);
  });
});

describe('stamp', () => {
  it('writes non-null cells at the offset, skips nulls', () => {
    const m = [[0, 0, 0], [0, 0, 0]];
    stamp(m, 1, 0, [[7, null], [8, 9]]);
    expect(m).toEqual([[0, 7, 0], [0, 8, 9]]);
  });
});
```

- [ ] **Step 2:** Create `src/data/zones/mapUtils.js`:

```js
// Helpers for growing and decorating hand-authored zone maps.

/**
 * Copy `map` and append `east` columns / `south` rows of `fill`.
 * @param {number[][]} map @param {{east?: number, south?: number, fill: number}} opts
 */
export function extendMap(map, { east = 0, south = 0, fill }) {
  const out = map.map((row) => [...row, ...Array(east).fill(fill)]);
  const w = out[0].length;
  for (let i = 0; i < south; i++) out.push(Array(w).fill(fill));
  return out;
}

/**
 * Stamp a block of tiles onto `map` at (x0, y0); null cells are skipped.
 * Mutates map. @param {number[][]} map @param {number} x0 @param {number} y0
 * @param {(number|null)[][]} rows
 */
export function stamp(map, x0, y0, rows) {
  rows.forEach((row, dy) =>
    row.forEach((t, dx) => {
      if (t !== null) map[y0 + dy][x0 + dx] = t;
    }),
  );
}
```

Run the test — PASS. Commit — `feat: map extend/stamp utilities`.

- [ ] **Step 3: Grow the Shire.** In `shire.js`, rename the literal to `BASE` (leave every row untouched) and build the real map below it. New geography: **48 wide × 44 tall**; the East Road exit moves to x=47; The Water extends east; Sandyman's Mill sits on the south bank below the bridge; the Ivy Bush sits south of the extended East Road on the new eastern land; an orchard fills the south-east.

```js
function buildMap() {
  // 40×40 hand-authored core → 48×44
  const map = extendMap(BASE, { east: 8, south: 4, fill: G });

  // Open the old east and south tree borders (now interior)
  for (let y = 1; y < 39; y++) if (map[y][39] === R) map[y][39] = G;
  for (let x = 1; x < 39; x++) if (map[39][x] === R) map[39][x] = G;

  // The Water flows on east; the East Road runs to the new edge
  for (const y of [36, 37]) for (let x = 40; x < 48; x++) map[y][x] = W;
  for (const y of [19, 20]) for (let x = 39; x < 48; x++) map[y][x] = P;

  // New borders (gap where the road leaves; the river hits the edge solid)
  for (let x = 0; x < 48; x++) {
    map[0][x] = R;
    map[43][x] = R;
  }
  for (let y = 0; y < 44; y++) {
    if (!(y === 19 || y === 20 || y === 36 || y === 37)) map[y][47] = R;
  }

  // ── Sandyman's Mill on the south bank ─────────────
  // Wheel in the river beside the building; lane west from the bridge
  map[37][2] = T.WHEEL;
  map[38][2] = T.WHEEL;
  stamp(map, 3, 38, [
    [S, K, O, N, S],
    [S, L, D, J, S],
  ]);
  map[39][8] = X; // mill sign
  for (let x = 4; x <= 17; x++) map[40][x] = P; // mill lane
  map[39][18] = P; // joins the bridge path at (18,38)
  map[40][18] = P;

  // ── The Ivy Bush, on the Bywater road ─────────────
  stamp(map, 40, 22, [
    [S, K, O, O, O, N, S],
    [S, L, D, D, D, J, S],
  ]);
  map[24][40] = X; // inn sign
  map[24][46] = M; // lantern by the benches
  for (const x of [42, 43]) map[24][x] = P; // doorstep

  // ── Orchard rows in the south-east ────────────────
  for (const y of [28, 30, 32]) {
    for (let x = 33; x <= 45; x += 3) map[y][x] = T.TREE2;
  }
  for (const [x, y] of [[35, 29], [40, 31], [44, 29]]) map[y][x] = f;

  return map;
}
```

(Uses the file's existing single-letter aliases; add `T.WHEEL` in Task 8 — **write Task 8's tile first if running strictly in order, or land Tasks 7+8 together; the plan intends 7 and 8 as one commit if WHEEL blocks this**. To keep tasks independent: use `S` (STONE) as a placeholder for the wheel in this task and swap to `T.WHEEL` in Task 8.)

Zone updates in the same file: `map: buildMap()`, exits → `{ x: 47, y: 19, ... }` / `{ x: 47, y: 20, ... }` (same `requires`/`denied`), spawn `fromWoodyEnd: { x: 46, y: 19, dir: 'left' }`.

- [ ] **Step 4: Update `tests/zones.test.js`** — the East Road test: columns 30..47 and exits `['47,19', '47,20']`. Add assertions for the new landmarks:

```js
  it('the mill and the Ivy Bush stand where the doors say', () => {
    expect(shire.map[39][5]).toBe(T.DOOR); // mill door
    expect(shire.map[23][42]).toBe(T.DOOR); // Ivy Bush door
    expect(shire.map[24][40]).toBe(T.SIGN);
  });
```

- [ ] **Step 5:** `npm test` — the Party Field tests (tree at 4–5×21–23, spur row 27, NPC staging) must still pass untouched; only the East Road test changes. `npm run build`.
- [ ] **Step 6: Browser QA** — walk the whole perimeter: no holes in the border, bridge still crosses, road exits east at the new edge, prologue still plays (fireworks land over the Party Field — `partyEvent` BURST coords are in the untouched west). Screenshot the mill and the Ivy Bush.
- [ ] **Step 7: Commit** — `feat: the Shire grows to 48×44 — mill bank, Ivy Bush, orchard`

### Task 8: Seven new tiles

**Files:**
- Modify: `src/data/tileTypes.js`, `src/art/tiles.js`, `src/data/zones/shire.js` (swap wheel placeholder)

- [ ] **Step 1:** Append to `T` (order matters): `WHEEL: 44, CRATE: 45, WELL: 46, BARN: 47, FEAST: 48, DITCH: 49, WAGGON: 50`. All seven are solid → append to `COLLISION_TILES`.
- [ ] **Step 2:** Draw functions appended to `src/art/tiles.js` and `TILE_FNS` **in the same order**. Style guide per tile (16×16, reuse existing palette hexes from neighbours in the file):
  - `drawWheel` — brown `#5a3a1c` ring with `#8a6b3d` spokes over water base (`#3b7dd8`), white foam pixels at the rim.
  - `drawCrate` — `#a5823c` planked box on grass, `#e04040` rocket tips poking from the open top, stenciled dark band.
  - `drawWell` — grey `#7a7a88` stone ring, dark `#14141a` hole, `#8a6b3d` posts + crossbar.
  - `drawBarn` — like `drawStone` but warm timber `#7a5530` planking with a `#5a3a1c` cross-brace (barn wall segments; compose barns from BARN + ROOF rows).
  - `drawFeast` — white `#f0ece4` cloth on grass with bread/fruit dabs (`#e8d070`, `#c04060`, `#f0e6c8`).
  - `drawDitch` — dark trench: `#3e6070` water line sunk between `#4a6a2c` banks.
  - `drawWaggon` — side-on cart: `#8a6b3d` bed, two `#5a3a1c` wheels, hay `#e8d070`.
- [ ] **Step 3:** In `shire.js` swap the two wheel placeholder `S` cells to `T.WHEEL`.
- [ ] **Step 4:** `npm test` (tiles.test length contract now passes at 51), `npm run dev` → `/art-test.html` → eyeball all seven at zoom. Screenshot.
- [ ] **Step 5: Commit** — `feat: mill wheel, crate, well, barn, feast, ditch, waggon tiles`

### Task 9: New Hobbiton NPCs — Sandyman, Old Noakes, Daddy Twofoot

**Files:**
- Modify: `src/art/characters.js` (3 palettes), `src/data/dialogues.js`, `src/data/zones/shire.js`, `src/data/zones/greendragon.js`

- [ ] **Step 1: Palettes** in `CHAR_DEFS`, all `maps: MALE`, `feet: ['#d0ac82', '#b08c62']` — copy an existing entry and change hues:
  - `sandyman`: floury pale clothes — C `#e8e4d8`/c `#c8c4b0`, dusty grey-brown hair H `#6a5a48`/h `#8a7a64`/l `#a89a84`, drab waistcoat V `#7a7460`/v `#928c74`/G `#5a5648`, P `#4a4438`/p `#322e24`.
  - `noakes`: aged — white hair like gaffer's (H `#909090`/h `#b8b8b8`/l `#d8d8d8`), russet waistcoat V `#8a5a2a`/v `#a87038`/G `#66421e`, C `#d8ccb0`/c `#b8ac90`, P `#3a3428`/p `#282418`.
  - `twofoot`: round and cheerful — mustard V `#a08030`/v `#c0a040`/G `#786020`, C `#e0d4c0`/c `#c0b4a0`, brown hair H `#4a3520`/h `#6a4e2c`/l `#8a6a3c`, P `#5a4030`/p `#3e2c20`.
  Include `o: OUTLINE, ...HOBBIT_SKIN` in each `pal` like the other hobbits.
- [ ] **Step 2: Dialogues** (book-anchored gossip; staged pre/post time skip):
  - `sandyman` (name `Sandyman the Miller`): pre-skip: grumbles about the party crowd wanting flour for seed-cakes; post-skip: "Queer folk you and your\nuncle draw to Hobbiton,\nMr. Baggins." + a line echoing Ted's scorn of Hal's tales.
  - `noakes` (name `Old Noakes`): pre-skip (outside the Ivy Bush): "A very nice well-spoken\ngentlehobbit, Mr. Bilbo --\nbut queer, mark you." post-skip (Green Dragon): "They fool about with boats\non that big river -- and\nthat isn't natural!"
  - `twofoot` (name `Daddy Twofoot`): pre-skip: next-door-neighbour pride, "The Gaffer and I have been\nsaying it for years: strange\ndoings at Bag End."; post-skip: chimes in on the walking-trees rumor.
- [ ] **Step 3: Placement.**
  - `shire.js` npcs: `{ key: 'sandyman', x: 6, y: 41, dir: 'up', when: (f) => f.prologueDone }` (mill yard), `{ key: 'noakes', x: 41, y: 24, dir: 'right', when: (f) => !f.prologueDone }`, `{ key: 'twofoot', x: 45, y: 24, dir: 'left', when: (f) => !f.prologueDone }` (Ivy Bush benches).
  - `greendragon.js` npcs: `{ key: 'noakes', x: 12, y: 8, dir: 'left', when: (f) => f.prologueDone }`, `{ key: 'twofoot', x: 14, y: 8, dir: 'right', when: (f) => f.prologueDone }`.
- [ ] **Step 4:** New signs: `sign_mill` ("SANDYMAN'S MILL"), `sign_ivybush` ("THE IVY BUSH\n~ on the Bywater Road ~") in dialogues + `shire.js` signs array at (8,39) and (40,24).
- [ ] **Step 5:** `npm test` (zones integrity validates sprite+dialogue+position for each), `/art-test.html` for the three sheets, browser QA both eras (preset `prologueDone` or not). Screenshot.
- [ ] **Step 6: Commit** — `feat: Sandyman, Old Noakes and Daddy Twofoot with staged gossip`

### Task 10: Mathoms, Bag End examines, and the three Hobbiton errands

**Files:**
- Modify: `src/data/zones/shire.js`, `src/data/zones/bagend.js`, `src/data/zones/greendragon.js`, `src/data/dialogues.js`, `src/events/partyEvent.js` (no change expected — verify only)

- [ ] **Step 1: Mathom pickups (6)** — add `pickups` arrays:
  - `shire.js`: `shire_mathom_1` (5,30 — under the Party Tree's field, among the tents), `shire_mathom_2` (36,31 — orchard), `shire_mathom_3` (2,16 — behind Bagshot Row), `shire_mathom_4` (10,41 — mill lane), `shire_mathom_5` (45,21 — behind the Ivy Bush).
  - `bagend.js`: `bagend_mathom_1` (15,10 — the far corner of the smial).
  All `item: 'mathom'`, no `when`. Adjust any coordinate that lands on a solid tile — the integrity test will catch it.
- [ ] **Step 2: Bag End examines** — `bagend.js` signs array (these sit on solid interior tiles; the Task 5 engine change makes them interactive):

```js
  signs: [
    { x: 13, y: 6, dialogue: 'examine_desk' },
    { x: 3, y: 3, dialogue: 'examine_books' },
    { x: 7, y: 3, dialogue: 'examine_fireplace' },
    { x: 12, y: 3, dialogue: 'examine_chest' },
  ],
```

Dialogues: `examine_desk` (name `Bilbo's Desk`): the unfinished *There and Back Again* manuscript, ink long dry; `examine_books` (name `Bookshelf`): maps of the Wilderland with Bilbo's marginal notes, "not all those who wander are lost" flavor kept verbatim-safe (use: 'Maps of distant lands,\nannotated in a thin,\nspidery hand.'); `examine_fireplace` (name `Hearth`): 'This is where the letters\nof fire were revealed.\nThe grate is cold now.'
- [ ] **Step 3: Errand — Lobelia's spoons.** `examine_chest` (name `Old Chest`), staged:

```js
  examine_chest: {
    name: 'Old Chest',
    stages: [
      {
        when: (f) => f.metGandalf && !f.foundSpoons,
        lines: [
          'Under old party invitations:\na case of silver spoons.',
          "The label reads: 'For\nLOBELIA, as a PRESENT.'\nBilbo's little joke, still waiting.",
        ],
        set: 'foundSpoons',
        give: 'silver_spoons',
      },
      { lines: ['Old invitations, older\nmothballs. Nothing else\nof note.'] },
    ],
  },
```

Lobelia gains a stage **above** her current lines: `when: (f) => f.foundSpoons && !f.gaveSpoons` → she snatches them ('Well! At least SOMEONE\nin this family knows\nwhat is owed to me.'), `set: 'gaveSpoons'`, `take: 'silver_spoons'`. Convert her static `lines` entry to `stages` form (existing lines become the fallback stage).
- [ ] **Step 4: Errand — the Gaffer's half-pint.** Rosie gains a stage after her prologue stage, before her others: `when: (f) => f.prologueDone && !f.halfPintTaken` → her current "Good morning" lines plus: "Would you run a half-pint\ndown to the Gaffer? He's\ntoo proud to ask." — `set: 'halfPintTaken'`, `give: 'ale_mug'`. The Gaffer gains a stage above his post-skip lines: `when: (f) => f.halfPintTaken && !f.halfPintDelivered` → "Ah! Rosie Cotton's a\ntreasure. Mind you tell\nher I said so." — `set: 'halfPintDelivered'`, `take: 'ale_mug'`.
- [ ] **Step 5: Errand — Gandalf's crates (prologue).** Gandalf's prologue stage gains `set: 'cratesAsked'` and one extra line: 'But see here -- three of\nmy crates went astray in\nthe field. Fetch them, eh?'. Three pickups in `shire.js`: `party_crate_1` (2,31), `party_crate_2` (7,25), `party_crate_3` (3,34), all `item: 'firework_crate'`, `when: (f) => f.cratesAsked && !f.prologueDone`. Gandalf gains a prologue thanks stage **above** the crates ask: `when: (f, count) => !f.prologueDone && count('firework_crate') >= 3` → 'Every squib and cracker\naccounted for! This will\nbe a night to remember.'
- [ ] **Step 6: Green Dragon dressing** — signs: `{ x: 4, y: 4, dialogue: 'examine_casks' }`, `{ x: 16, y: 3, dialogue: 'examine_shelf_gd' }` (name `Ale Casks` / `Shelf`, one flavor line each — e.g. casks: '1418 was a fine year\nfor beer, they will say.\nNot yet, though.' → keep it book-safe: 'Rows of casks from the\nCotton farm. The Dragon\nnever runs dry.').
- [ ] **Step 7:** `npm test` — all integrity suites green (pickups, signs, dialogue refs). Browser QA: full spoons loop, half-pint loop, and a prologue run collecting the crates before Bilbo's speech (verify the party still flows into the time skip cleanly). Press I after each errand — ticks appear.
- [ ] **Step 8: Commit** — `feat: mathoms, Bag End examines, and the three Hobbiton errands`

---

## Phase 3 — The Woody End

### Task 11: The long road — 64×28, tree-tunnel, fir hollow

**Files:**
- Modify: `src/data/zones/woodyend.js`, `src/events/riderEvent.js`, `tests/riderEvent.test.js`, `tests/zones.test.js`

- [ ] **Step 1: De-hardcode the rider event.** In `woodyend.js` export the tuning the event needs; in `riderEvent.js` import them (delete the local literals):

```js
// woodyend.js
export const WIDTH = 64, HEIGHT = 28;
export const RIDER_EXIT_X = 50; // he gives up before the elf clearing
export const GILDOR_SPOT = { x: 56, y: 15 };
// riderEvent.js — r.x > 34 * TILE_SIZE becomes:
if (dx > 110 || r.x > RIDER_EXIT_X * TILE_SIZE) { ... scene.spawnNpc({ key: 'gildor', ...GILDOR_SPOT, dir: 'down' }); }
```

Check `tests/riderEvent.test.js` for coordinate assumptions (trigger x=11, give-up threshold) and update the give-up test to use the imported `RIDER_EXIT_X`.
- [ ] **Step 2: Regenerate the map.** New `ROAD_Y` (still exported, length 64): `x<8→13, x<18→15, x<30→11, x<40→14, x<52→10, else→12`. In `generateMap()`:
  - Tree-tunnel: after the grove-thickening pass, for `x` in 40..48 force `map[ROAD_Y[x]-1][x] = T.TREE` and `map[ROAD_Y[x]+2][x] = T.TREE` (canopy closes right up to the verge; skip any cell the road bend carved to PATH).
  - Fir hollow: a cleared pocket south of the road — for y 20..24, x 20..26 set GRASS, ring it with TREE except a 2-tile gap at (23,20)-(24,20); centre gets 4 FERN tiles. Export `HOLLOW = { x0: 20, y0: 20, x1: 26, y1: 24 }`.
  - Gildor's clearing moves east: clear GRASS for y 13..17, x 52..59; FEAST tiles at (55,17) and (56,17).
  - Keep the guaranteed fern-brake loop as is (it scales with WIDTH automatically) and the border/exit logic (east exits move to x=63).
- [ ] **Step 3: Zone data** — gildor npc → `GILDOR_SPOT`, exits → x 63 (rows per new ROAD_Y at the edge: 12,13), spawns `east: { x: 62, y: 12 }`, `west` unchanged at road height 13.
- [ ] **Step 4: Tests.** `tests/zones.test.js` Woody End suite: the fern-brake loop bound `x0 < 32` → `x0 < 56`; the exit assertion `exit.x === 39` → `63`. Add:

```js
  it('the tree-tunnel closes over the road mid-forest', () => {
    for (let x = 41; x <= 47; x++) {
      expect(map[ROAD_Y[x] - 1][x]).toBe(T.TREE);
      expect(map[ROAD_Y[x] + 2][x]).toBe(T.TREE);
    }
  });
```

- [ ] **Step 5:** `npm test` (rider suite green with imports), browser QA: walk the full road west→east; the rider set piece triggers and is escapable in the first stretch; the tunnel section reads dark and close; the hollow is enterable. `npm run test:e2e` — the marish e2e enters from woodyend and must still pass.
- [ ] **Step 6: Commit** — `feat: the Woody End doubles — long road, tree-tunnel, fir hollow`

### Task 12: Walking song + the fox

**Files:**
- Create: `src/events/foxEvent.js`
- Modify: `src/art/characters.js` (fox sheet + `noFeet` support), `src/data/dialogues.js`, `src/data/zones/woodyend.js`
- Test: `tests/foxEvent.test.js`

- [ ] **Step 1: `noFeet` in the sheet builder.** In `makeCharSheet`, wrap the feet block: `if (!def.noFeet) { ... }`. Quadruped defs draw their own legs per frame via `extra(c, x, y, dir, frame)` (the hook already receives `frame`).
- [ ] **Step 2: Fox sprite.** Add a 4-direction 10-row `FOX` template (16 wide; orange `#c06a28` body, `#e8e4d8` chest/tail-tip, `#14141a` outline; left/right are the read direction — down/up can be simple). `CHAR_DEFS.fox = { maps: FOX, pal: {...}, noFeet: true, extra }` where `extra` draws 4 thin legs with the standard `legOff` shuffle. Verify on `/art-test.html`.
- [ ] **Step 3: Walking song.** Dialogue `walking_song` (name `Frodo`):

```
'The Road goes ever on\nand on, down from the door\nwhere it began...',
'Now far ahead the Road\nhas gone, and I must\nfollow, if I can.',
'Bilbo made that one up,\nwalking this very road.\nIt feels different today.',
```

`woodyend.js` gains `onCreate`: if `!hasFlag('walkingSong')`, `scene.time.delayedCall(900, () => { setFlag('walkingSong'); scene.startDialogue('walking_song'); })` (import from GameState). One-time across the whole game because the flag persists.
- [ ] **Step 4: Fox event.** `src/events/foxEvent.js`, same shape as the other event modules:

```js
// The fox of the Woody End — it passes the sleeping hobbits and
// wonders. One-time trigger when the player steps into the fir hollow.
import { TILE_SIZE } from '../data/tileTypes.js';
import { hasFlag, setFlag } from '../state/GameState.js';
import { HOLLOW } from '../data/zones/woodyend.js';

export function foxEventUpdate(scene) {
  if (hasFlag('foxSeen') || scene.foxEvent) return;
  const tx = Math.floor(scene.player.x / TILE_SIZE);
  const ty = Math.floor(scene.player.y / TILE_SIZE);
  if (tx < HOLLOW.x0 || tx > HOLLOW.x1 || ty < HOLLOW.y0 || ty > HOLLOW.y1) return;

  setFlag('foxSeen');
  const y = (HOLLOW.y0 + 2) * TILE_SIZE + 8;
  const fox = scene.add.sprite(HOLLOW.x0 * TILE_SIZE - 8, y, 'fox', 7); // right-facing
  fox.setDepth(y);
  scene.foxEvent = fox;
  fox.anims.play('fox-walk-right');
  scene.tweens.chain({
    targets: fox,
    tweens: [
      { x: (HOLLOW.x0 + 3) * TILE_SIZE, duration: 1400 },
      {
        x: fox.x, duration: 900, // pause: stop and look
        onStart: () => {
          fox.anims.play('fox-idle-right');
          scene.startDialogue('fox_thought');
        },
      },
      {
        x: (HOLLOW.x1 + 1) * TILE_SIZE + 8, duration: 1400,
        onStart: () => fox.anims.play('fox-walk-right'),
        onComplete: () => fox.destroy(),
      },
    ],
  });
}
```

Dialogue `fox_thought` (name `A Fox`): "'Hobbits!' he thought.\n'Well, what next? I have\nheard of strange doings...'", "'...but I have seldom heard\nof a hobbit sleeping out of\ndoors under a tree.'", "'There is something mighty\nqueer behind this.' He was\nquite right, but he never\nfound out any more about it." — split that last one into two boxes to respect the 3-line limit.

Compose in `woodyend.js`: `onUpdate: (scene, delta) => { riderEventUpdate(scene, delta); foxEventUpdate(scene); }`.
- [ ] **Step 5: Unit test** `tests/foxEvent.test.js` in the style of `tests/riderEvent.test.js` (fake scene with `add.sprite`, `tweens.chain`, `startDialogue` recorders): entering the hollow sets `foxSeen`, spawns one sprite, and does nothing on subsequent frames; standing outside the hollow does nothing.
- [ ] **Step 6:** `npm test`, browser QA: enter the zone (song plays once), walk into the hollow (fox crosses, pauses, thinks, trots off). Re-enter zone: neither repeats.
- [ ] **Step 7: Commit** — `feat: the walking song and the fox of the Woody End`

### Task 13: The hall of trees — Gildor's company, the feast, the elf-song

**Files:**
- Modify: `src/art/characters.js` (3 elf recolors), `src/data/dialogues.js`, `src/data/zones/woodyend.js`, `src/audio/sound.js`

- [ ] **Step 1: Elf company palettes** — `elf_a`, `elf_b`, `elf_c` in `CHAR_DEFS`, `maps: ELF`, copying gildor's pal with shifted robe hues (a: silver-blue V `#b8c8d8`/v `#d8e4ee`, b: pale gold V `#d8cca0`/v `#ece4c0`, c: twilight grey V `#a8a8bc`/v `#c4c4d4`; hair: a+c dark `#3a3a4a`-based, b golden like gildor).
- [ ] **Step 2: Dialogues** (one each, name `Elf of Gildor's Company`; use distinct keys):
  - `elf_a`: 'We are Exiles. Most of our\nkindred have long departed,\nand we too tarry here but\na while.' (split to fit) + a line naming the Havens west.
  - `elf_b`: the hymn — 'Snow-white! Snow-white!\nO Lady clear! O Queen\nbeyond the Western Seas!' + 'We sing to Elbereth,\nwho kindled the stars.'
  - `elf_c`: 'The starlight was on your\nface when you slept, Master\nSamwise.' → better book-safe: 'Eat, and be merry. Even\nthe wandering Companies\nkeep a good table.'
- [ ] **Step 3: Zone data** — npcs (all `when: (f) => f.escapedRider`): `elf_a` (54,14, right), `elf_b` (58,13, down), `elf_c` (57,16, left). Feast examine — signs: `{ x: 55, y: 17, dialogue: 'elf_feast' }`, `{ x: 56, y: 17, dialogue: 'elf_feast' }`. Dialogue:

```js
  elf_feast: {
    name: 'The Feast',
    stages: [
      {
        when: (f) => f.metGildor && !f.tookProvisions,
        lines: [
          'Bread surpassing white\nloaves, fruits sweet as\nwildberries -- laid for guests.',
          "Gildor's folk have set\naside a share for your\nroad tomorrow.",
        ],
        set: 'tookProvisions',
        give: 'elven_provisions',
      },
      { lines: ['A hall of living trees,\nand a table under\nthe stars.'] },
    ],
  },
```

- [ ] **Step 4: Elf-song motif** — add to `sfx` in `sound.js` (soft rising triangle phrase, E major-ish shimmer):

```js
  elfsong() {
    if (!ctx) return;
    const t = ctx.currentTime;
    [[0, 76], [0.3, 80], [0.6, 83], [0.9, 88], [1.4, 83], [1.9, 88]].forEach(([dt, m]) =>
      tone(m, t + dt, 0.7, 'triangle', 0.22, master));
  },
```

Trigger in `woodyend.js` `onUpdate` (session-scoped, replays per visit — the elves are still singing):

```js
  if (hasFlag('escapedRider') && !scene._elfsongPlayed) {
    const tx = Math.floor(scene.player.x / TILE_SIZE);
    if (tx >= 48) {
      scene._elfsongPlayed = true;
      sfx.elfsong();
      scene.showBanner('Singing drifts through\nthe trees ahead...');
    }
  }
```

- [ ] **Step 5:** `npm test` (integrity covers the 3 npcs + feast dialogue), browser QA: escape the rider → banner+motif approaching the clearing → talk to all four elves → examine the feast after Gildor (provisions granted, second examine gives the fallback). Overlay lists provisions.
- [ ] **Step 6: Commit** — `feat: the hall of trees — Gildor's company, feast, elf-song`

---

## Phase 4 — The Marish

### Task 14: Wider Marish + de-hardcoded ferry event

**Files:**
- Modify: `src/data/zones/marish.js`, `src/events/ferryEvent.js`, `tests/ferryEvent.test.js`, `tests/zones.test.js`, `e2e/smoke.spec.js`

- [ ] **Step 1: Export the geometry from `marish.js`** and resize: `WIDTH 56, HEIGHT 30`; `LANE_Y: x<8→14, x<29→10, else→15`; `RIVER_X = 46`, `BANK_X = 52`; `FARM = { x0: 14, x1: 29, y0: 14, y1: 24, gateX: 24 }`. Export for the event and tests:

```js
export const PIER_X = RIVER_X; // 46
export const LANE_ROW = LANE_Y[RIVER_X - 1]; // 15
export const RAFT_X = RIVER_X + 1; // 47
export const BANK_LAND_X = BANK_X; // 52
export const RIDER_START_X = RIVER_X - 18;
```

- [ ] **Step 2: `ferryEvent.js`** — delete its local `PIER_X/LANE_ROW/RAFT_X/BANK_LAND_X` and the rider start literal `28`; import the five exports from `../data/zones/marish.js`. Merry's spawn/repositioning x-coords (32, 40, 12-row) become derived: landing merry at `{ x: PIER_X - 2, y: LANE_ROW - 1 }`, far-bank merry at `{ x: BANK_LAND_X, y: LANE_ROW - 1 }`. Update `marish.js` npcs/spawns/signs to the same derived spots (landing spawn `{ x: PIER_X - 4, y: LANE_ROW }`, ferry sign at `(PIER_X - 1, LANE_ROW - 1)`, buckland sign at `(BANK_X + 1, LANE_ROW - 1)`).
- [ ] **Step 3: Causeway.** In `generateMap()`, after carving the lane: for x 34..45, set `map[LANE_Y[x] + 2][x] = T.DITCH` and `map[LANE_Y[x] - 1][x] = T.DITCH` where the cell isn't already PATH (raised causeway between dikes, book Ch. 4). Ensure the farm gate stub (gateX 24) is west of 34 — untouched.
- [ ] **Step 4: Tests.** `tests/zones.test.js` Marish suite: lane loop bound `x < 34` → `x < RIVER_X` (import it), pier/raft/bank coordinates → the imported consts, npc x-positions in the staging test → derived values. `tests/ferryEvent.test.js`: replace literal coordinates with the same imports (the fake-scene logic is unchanged). `e2e/smoke.spec.js` marish test: Maggot gateway teleport `(23,15)` → `(FARM.gateX, FARM.y0 + 1)` = `(24,15)`; landing x expectation `30` → `PIER_X - 4 = 42`; merry talk position `(32,13)` → `(44,15)`; pier threshold `>= 34` → `>= 46`; final `tileX >= 40` → `>= 52`. (e2e can't import the module — write the resolved numbers with a comment.)
- [ ] **Step 5:** `npm test && npm run test:e2e` — the full crossing must pass. Browser QA: walk the causeway, ride the waggon, cross; the halting Rider still arrives on the lane.
- [ ] **Step 6: Commit** — `feat: wider Marish with causeway; ferry event reads zone geometry`

### Task 15: Bamfurlong depth — barn, well, waggon, Mrs. Maggot

**Files:**
- Modify: `src/data/zones/marish.js`, `src/art/characters.js`, `src/data/dialogues.js`

- [ ] **Step 1: Farm dressing** in `generateMap()` after the farmhouse: barn (`stamp` rows `[[T.ROOF_L, T.ROOF, T.ROOF, T.ROOF_R],[T.BARN, T.BARN, T.BARN, T.BARN]]` at (25,15)), well at (21,17), waggon at (27,20) (`T.WAGGON`), extra GARDEN rows kept clear of all three. Signs: `{ x: 27, y: 20, dialogue: 'examine_waggon' }` ('Maggot's waggon, packed\nfor the Ferry road.'), `{ x: 21, y: 17, dialogue: 'examine_well' }`, barn examine on a BARN tile ('Hay, harness, and the\nsmell of good earth.'). Stock signpost: SIGN tile at (10,16) + `sign_stock` ('STOCK ½ mile\n~ mind the dikes ~'). Brandy Hall examine on the far bank: signs entry on the TREE at `(BANK_X + 1, LANE_ROW - 3)` → `examine_brandyhall` ('Across the water, lights\nglimmer on the hill:\nBrandy Hall, Buckland.').
- [ ] **Step 2: Mrs. Maggot** — `CHAR_DEFS.mrsmaggot` (`maps: FEMALE`, warm apron palette: V `#a05838`/v `#c07048`/G `#7a4028`, C `#f0e8d0`, hair greying brown H `#5a4a35`/h `#7a6a50`/l `#9a8a6c`). NPC at the farmhouse door `{ key: 'mrsmaggot', x: 20, y: 16, dir: 'down' }` (no `when` — she's home throughout). Dialogue staged (the dogs errand hangs off her — Maggot himself despawns after the waggon ride):

```js
  mrsmaggot: {
    name: 'Mrs. Maggot',
    stages: [
      {
        when: (f) => !f.dogsAsked,
        lines: [
          'Welcome, dears! Any friend\nof Maggot's is welcome at\nBamfurlong.',
          'Only -- our dogs! Grip, Fang\nand Wolf bolted when that\nblack creature came asking.',
          'Still hiding out in the\nmarsh, poor things. Send\nthem home if you find them?',
        ],
        set: 'dogsAsked',
        objective: 'Find Grip, Fang and Wolf in the marsh',
      },
      {
        when: (f) => f.dogGrip && f.dogFang && f.dogWolf && !f.gotBasket,
        lines: [
          'All three home and fed!\nYou have a farmer's way\nwith beasts, Mr. Baggins.',
          'Take this -- mushrooms,\npacked proper. And mind\nthe missus said so.',
        ],
        set: 'gotBasket',
        give: 'maggot_basket',
      },
      { lines: ['Mind the dikes on the\ncauseway, dears.'] },
    ],
  },
```

Note: the `dogsAsked` stage must not steal the objective from the main story mid-critical-path — it's fine: `Q` recalls whichever objective is current, and the ferry objective is reasserted by Maggot/Merry stages.
- [ ] **Step 3:** `npm test`, browser QA, screenshot the farm.
- [ ] **Step 4: Commit** — `feat: Bamfurlong grows — barn, well, waggon, Mrs. Maggot`

### Task 16: Grip, Fang and Wolf

**Files:**
- Create: `src/events/dogsEvent.js`
- Modify: `src/art/characters.js`, `src/data/dialogues.js`, `src/data/zones/marish.js`
- Test: `tests/dogsEvent.test.js`

- [ ] **Step 1: Dog sprites** — a 10-row `DOG` quadruped template (side view left + mirrored right; down/up compact), `noFeet: true`, legs via `extra` shuffle (same approach as the fox). Three `CHAR_DEFS` entries sharing `DOG`: `grip` (black `#2a2a30` coat), `fang` (brindle `#6a4a2a`), `wolf` (grey `#8a8a90`). Check `/art-test.html`.
- [ ] **Step 2: Placement + dialogue.** NPCs in `marish.js` (each `when: (f) => f.dogsAsked && !f.dogGrip` etc.): grip by the west pool (6,21), fang in the north-east reeds (30,4), wolf near the causeway (38,18). Dialogues, name per dog, e.g.:

```js
  grip: {
    name: 'Grip',
    lines: ['*a low growl, then a\nwhine -- he knows you\nfor a friend*', '*Grip streaks off home\nacross the fields*'],
    // staged not needed: the flag despawns him
  },
```

Convert to staged form with `set: 'dogGrip'` on the single stage (fang → `dogFang`, wolf → `dogWolf`).
- [ ] **Step 3: The run home.** `src/events/dogsEvent.js`: watch for each flag; when set and the NPC sprite still exists, tween it to the farm gate and remove it (instead of it just vanishing on zone re-entry):

```js
import { TILE_SIZE } from '../data/tileTypes.js';
import { hasFlag } from '../state/GameState.js';
import { FARM } from '../data/zones/marish.js';

const DOGS = ['grip', 'fang', 'wolf'];
const FLAG = { grip: 'dogGrip', fang: 'dogFang', wolf: 'dogWolf' };

export function dogsEventUpdate(scene) {
  for (const key of DOGS) {
    if (!hasFlag(FLAG[key])) continue;
    const npc = scene.npcs.find((n) => n.getData('key') === key);
    if (!npc || npc.getData('runningHome')) continue;
    npc.setData('runningHome', true);
    scene.tweens.add({
      targets: npc,
      x: FARM.gateX * TILE_SIZE + 8,
      y: (FARM.y0 + 2) * TILE_SIZE + 8,
      duration: 2200,
      onComplete: () => scene.removeNpc(key),
    });
  }
}
```

Compose into `marish.js`: `onUpdate: (scene, delta) => { ferryEventUpdate(scene, delta); dogsEventUpdate(scene); }`.
- [ ] **Step 4: Unit test** `tests/dogsEvent.test.js` (fake scene à la riderEvent tests): flag set → tween added once toward the farm gate and `removeNpc` called on complete; no flag → untouched; already-running dog not double-tweened.
- [ ] **Step 5:** `npm test`, browser QA: full loop — Mrs. Maggot ask → find all three (each barks, runs home) → basket + tick in the overlay.
- [ ] **Step 6: Commit** — `feat: Grip, Fang and Wolf — the dogs errand`

### Task 17: Mushrooms everywhere + the trespass scold

**Files:**
- Modify: `src/data/zones/woodyend.js`, `src/data/zones/marish.js`, `src/data/dialogues.js`

- [ ] **Step 1: Woody End (4)** — pickups off-road: `woody_mush_1` (44,6), `woody_mush_2` (49,18), `woody_mush_3` (57,20), `woody_mush_4` (60,7). Nudge any coordinate the integrity test rejects (generated trees) — prefer moving the pickup, never carving the forest.
- [ ] **Step 2: Marish (8)** — `marish_mush_1..6` scattered: two easy by the lane (10,12 / 31,8), two behind the west pool reeds (4,22 / 7,24), two deep in bog pockets (34,25 / 41,4), and **two inside Maggot's fence** (17,20 / 26,22) with `onCollect: 'maggot_scold'`:

```js
  maggot_scold: {
    name: 'Farmer Maggot',
    stages: [
      {
        when: (f) => !f.rodeWaggon,
        lines: [
          '"OI! Out of my crop, you\nyoung rascal, or I\'ll set\nthe dogs on you!"',
          'Some things about the\nMarish never change.',
        ],
      },
      { lines: ['You pick a fine fat one.\nThe farmer would only\nlaugh, these days.'] },
    ],
  },
```

- [ ] **Step 3: Totals check** — 12 world mushrooms exactly (4 + 8). The overlay tally (Task 6 `tallyLine`) derives 12 automatically. `npm test`.
- [ ] **Step 4: Browser QA** — pick a fenced mushroom before the waggon ride: scold fires after the "Got" banner; pick the rest late-game: fallback line. Overlay reads `Mushrooms 12/12` when done.
- [ ] **Step 5: Commit** — `feat: twelve mushrooms and the trespass scolding`

### Task 18: The 100% nod + exploration e2e + final sweep

**Files:**
- Modify: `src/data/dialogues.js` (merry), `docs/PRD.md` or `CLAUDE.md` current-state note, `e2e/smoke.spec.js`

- [ ] **Step 1: Merry's completion stage** — insert into `merry.stages` ABOVE his fallback, AFTER the `!merryMet` stage:

```js
      {
        when: (f, count) =>
          f.crossedFerry &&
          f.gaveSpoons && f.halfPintDelivered && f.gotBasket &&
          count('mathom') >= 6 && count('mushroom') >= 12,
        lines: [
          'Spoons for Lobelia, ale for\nthe Gaffer, and every dog\nat Bamfurlong fed?',
          "You've seen more of the\nShire in a week than most\nhobbits see in a lifetime.",
          'Whatever road we take from\nhere -- I could ask for no\nbetter company.',
        ],
      },
```

(Uses possession counts; mathoms are never spent so `count` works. The crates errand is intentionally absent — missable by design per the spec.)
- [ ] **Step 2: Exploration e2e** — append to `e2e/smoke.spec.js`:

```js
test('exploration: pickups collect and the overlay tallies them', async ({ page }) => {
  await startGame(page);
  // Walk over the Bagshot Row mathom (3,16 area — use the exact pickup tile)
  await page.evaluate(() => {
    const scene = window.__game.scene.getScene('WorldScene');
    scene.player.setPosition(2 * 16 + 8, 16 * 16 + 8);
  });
  await page.waitForFunction(() => (window.__state.items.mathom || 0) >= 1, null, {
    timeout: 5_000,
  });
  await press(page, 'i');
  const overlay = await page.evaluate(() => {
    const scene = window.__game.scene.getScene('WorldScene');
    return { visible: scene.overlayVisible, text: scene.overlayText.text };
  });
  expect(overlay.visible).toBe(true);
  expect(overlay.text).toMatch(/Mathom/);
  expect(overlay.text).toMatch(/Mathoms 1\/6/);
});
```

(Teleport position must match the final `shire_mathom_3` coordinates from Task 10 — adjust to whatever landed.)
- [ ] **Step 3: Docs.** Update the "Current State" paragraph in `CLAUDE.md`: mention the exploration layer (items/errands/overlay), the enlarged zones, and strike the "real pickup/inventory treatment for the mushrooms" wishlist line.
- [ ] **Step 4: Full sweep** — `npm test && npm run typecheck && npm run lint && npm run format && npm run build && npm run test:e2e`. Fix anything that surfaces. Browser QA: one full playthrough, prologue to Buckland, collecting everything; confirm Merry's nod fires.
- [ ] **Step 5: Commit** — `feat: completion nod from Merry, exploration e2e, docs`

---

## Post-plan

Run the superpowers:requesting-code-review flow, then superpowers:finishing-a-development-branch (branch: work continues on `ch1-marish-ferry` or a new `ch1-depth-pass` branch off it — prefer the new branch, created before Task 1).
