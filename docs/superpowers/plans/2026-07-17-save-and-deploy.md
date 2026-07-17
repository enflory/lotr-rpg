# Save System + GitHub Pages Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Autosave-at-zone-entry with a Continue/New Game title screen, and public hosting at lotr.lonelymtnlabs.com via GitHub Pages.

**Architecture:** A three-function checkpoint module (`saveGame.js`) writes one versioned localStorage key at every `WorldScene.create()`; `TitleScene` restores the singleton `gameState` _before_ starting `WorldScene`, so no scene code changes for restore. Deployment is a `deploy` job appended to the existing CI workflow, publishing `dist/` to GitHub Pages on green main.

**Tech Stack:** Vanilla JS (JSDoc-typechecked), Phaser 3, Vitest, Playwright, GitHub Actions + Pages.

**Spec:** `docs/superpowers/specs/2026-07-17-save-and-deploy-design.md`

---

## File Structure

| File                       | Action | Responsibility                                                                                          |
| -------------------------- | ------ | ------------------------------------------------------------------------------------------------------- |
| `src/state/saveGame.js`    | Create | `save`/`load`/`clearSave`/`applySave` — all localStorage logic lives here, nothing else touches storage |
| `tests/saveGame.test.js`   | Create | Serializer round-trip + every validation branch (fake localStorage; Node env)                           |
| `src/scenes/WorldScene.js` | Modify | One `save()` call at the top of `create()`                                                              |
| `src/scenes/TitleScene.js` | Modify | Continue/New Game prompts, restore flow, fan-project disclaimer line                                    |
| `e2e/save.spec.js`         | Create | Reload→Continue and New Game flows in the real game                                                     |
| `.github/workflows/ci.yml` | Modify | Append `deploy` job (main-push only, needs test+e2e)                                                    |
| `public/CNAME`             | Create | Custom-domain file copied into `dist/` by Vite                                                          |
| `CLAUDE.md`, `README.md`   | Modify | Record the save system and the live URL                                                                 |

Notes for the implementer:

- `src/state/` is covered by `npm run typecheck` (JSDoc) — keep the `@type`/`@param` annotations shown below. `src/scenes/` is not typechecked.
- Vitest runs in Node env with no `localStorage`; the module must tolerate its absence (that's also the private-browsing fallback), and tests install a fake on `globalThis`.
- Prettier formats these files (only zone maps/pixel art are exempt) — run `npm run format` before each commit.

---

### Task 0: Branch

- [ ] **Step 0.1:** `git checkout -b feat/save-and-deploy` (from up-to-date `main`).

---

### Task 1: saveGame module (TDD)

**Files:**

- Create: `tests/saveGame.test.js`
- Create: `src/state/saveGame.js`

- [ ] **Step 1.1: Write the failing tests**

```js
// tests/saveGame.test.js
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { gameState } from '../src/state/GameState.js';
import { SAVE_KEY, save, load, clearSave, applySave } from '../src/state/saveGame.js';

// Minimal Storage fake — Vitest's Node env has no localStorage.
function fakeStorage() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
  };
}

beforeEach(() => {
  globalThis.localStorage = fakeStorage();
  gameState.flags = {};
  gameState.follower = null;
  gameState.objective = 'Speak with Gandalf outside Bag End';
  gameState.items = {};
  gameState.collected = {};
});
afterEach(() => {
  delete globalThis.localStorage;
});

describe('save/load round trip', () => {
  it('returns null when nothing is saved', () => {
    expect(load()).toBeNull();
  });

  it('round-trips gameState plus the checkpoint location', () => {
    gameState.flags = { prologueDone: true, samJoined: true };
    gameState.follower = 'sam';
    gameState.objective = 'Follow the East Road';
    gameState.items = { mushroom: 3 };
    gameState.collected = { shire_mathom_1: true };
    save('woodyend', 'west');

    const p = load();
    expect(p).not.toBeNull();
    expect(p.zone).toBe('woodyend');
    expect(p.entry).toBe('west');
    expect(p.flags).toEqual({ prologueDone: true, samJoined: true });
    expect(p.follower).toBe('sam');
    expect(p.objective).toBe('Follow the East Road');
    expect(p.items).toEqual({ mushroom: 3 });
    expect(p.collected).toEqual({ shire_mathom_1: true });
    expect(p.version).toBe(1);
  });

  it('clearSave removes the save', () => {
    save('shire', 'default');
    clearSave();
    expect(load()).toBeNull();
  });
});

describe('load validation', () => {
  it('clears the key and returns null on unparseable JSON', () => {
    globalThis.localStorage.setItem(SAVE_KEY, '{not json');
    expect(load()).toBeNull();
    expect(globalThis.localStorage.getItem(SAVE_KEY)).toBeNull();
  });

  it('ignores (but keeps) a future-version save', () => {
    save('shire', 'default');
    const raw = JSON.parse(globalThis.localStorage.getItem(SAVE_KEY));
    raw.version = 2;
    globalThis.localStorage.setItem(SAVE_KEY, JSON.stringify(raw));
    expect(load()).toBeNull();
    expect(globalThis.localStorage.getItem(SAVE_KEY)).not.toBeNull();
  });

  it('returns null for a zone that no longer exists', () => {
    save('shire', 'default');
    const raw = JSON.parse(globalThis.localStorage.getItem(SAVE_KEY));
    raw.zone = 'mordor';
    globalThis.localStorage.setItem(SAVE_KEY, JSON.stringify(raw));
    expect(load()).toBeNull();
  });

  it('falls back to the default spawn for an unknown entry', () => {
    save('shire', 'default');
    const raw = JSON.parse(globalThis.localStorage.getItem(SAVE_KEY));
    raw.entry = 'trapdoor';
    globalThis.localStorage.setItem(SAVE_KEY, JSON.stringify(raw));
    expect(load()?.entry).toBe('default');
  });

  it('returns null for an unknown entry in a zone with no default spawn', () => {
    // woodyend has only west/east spawns — no fallback exists, so the save
    // must be rejected rather than booting WorldScene into undefined
    save('woodyend', 'west');
    const raw = JSON.parse(globalThis.localStorage.getItem(SAVE_KEY));
    raw.entry = 'trapdoor';
    globalThis.localStorage.setItem(SAVE_KEY, JSON.stringify(raw));
    expect(load()).toBeNull();
  });

  it('returns null when flags/items/collected are not objects', () => {
    save('shire', 'default');
    const raw = JSON.parse(globalThis.localStorage.getItem(SAVE_KEY));
    raw.flags = 'oops';
    globalThis.localStorage.setItem(SAVE_KEY, JSON.stringify(raw));
    expect(load()).toBeNull();
  });
});

describe('without localStorage (private-browsing fallback)', () => {
  it('save/load/clear silently no-op', () => {
    delete globalThis.localStorage;
    expect(() => save('shire', 'default')).not.toThrow();
    expect(load()).toBeNull();
    expect(() => clearSave()).not.toThrow();
  });
});

describe('applySave', () => {
  it('assigns the payload onto the gameState singleton', () => {
    gameState.flags = { prologueDone: true };
    gameState.follower = 'sam';
    gameState.items = { mushroom: 2 };
    save('marish', 'west');
    // simulate a page reload
    gameState.flags = {};
    gameState.follower = null;
    gameState.items = {};

    applySave(load());
    expect(gameState.flags).toEqual({ prologueDone: true });
    expect(gameState.follower).toBe('sam');
    expect(gameState.items).toEqual({ mushroom: 2 });
  });
});
```

- [ ] **Step 1.2: Run the tests — expect failure**

Run: `npx vitest run tests/saveGame.test.js`
Expected: FAIL — cannot resolve `../src/state/saveGame.js`.

- [ ] **Step 1.3: Implement the module**

```js
// src/state/saveGame.js
// Checkpoint save system: one versioned localStorage key, written at every
// zone entry. Anything malformed loads as "no save" — worst case is a fresh
// start, never a broken title screen.

import { gameState } from './GameState.js';
import { ZONES } from '../data/zones/index.js';

export const SAVE_KEY = 'lotr-rpg.save.v1';

/**
 * @typedef {Object} SavePayload
 * @property {number} version
 * @property {number} savedAt
 * @property {string} zone
 * @property {string} entry
 * @property {Record<string, boolean>} flags
 * @property {string|null} follower
 * @property {string} objective
 * @property {Record<string, number>} items
 * @property {Record<string, boolean>} collected
 */

function storage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null; // some privacy modes throw on access
  }
}

/**
 * Snapshot gameState plus the checkpoint location.
 * @param {string} zoneKey
 * @param {string} entryKey
 */
export function save(zoneKey, entryKey) {
  const s = storage();
  if (!s) return;
  /** @type {SavePayload} */
  const payload = {
    version: 1,
    savedAt: Date.now(),
    zone: zoneKey,
    entry: entryKey,
    flags: gameState.flags,
    follower: gameState.follower,
    objective: gameState.objective,
    items: gameState.items,
    collected: gameState.collected,
  };
  try {
    s.setItem(SAVE_KEY, JSON.stringify(payload));
  } catch {
    // quota or privacy failure: play on without saving
  }
}

/** @returns {SavePayload|null} validated payload, or null if absent/unusable */
export function load() {
  const s = storage();
  if (!s) return null;
  const raw = s.getItem(SAVE_KEY);
  if (raw == null) return null;
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    clearSave(); // unreadable — clear so the next boot starts clean
    return null;
  }
  if (!data || typeof data !== 'object' || data.version !== 1) return null;
  const zone = ZONES[data.zone];
  if (!zone) return null;
  for (const field of ['flags', 'items', 'collected']) {
    if (!data[field] || typeof data[field] !== 'object') return null;
  }
  if (typeof data.objective !== 'string') return null;
  if (data.follower != null && typeof data.follower !== 'string') return null;
  if (!zone.spawns[data.entry]) {
    // Not every zone has a 'default' spawn (woodyend/marish don't) — with no
    // safe landing spot, reject the save rather than boot into undefined
    if (!zone.spawns.default) return null;
    data.entry = 'default';
  }
  return data;
}

export function clearSave() {
  const s = storage();
  if (!s) return;
  try {
    s.removeItem(SAVE_KEY);
  } catch {
    // nothing to do — absence of a save is always safe
  }
}

/**
 * Assign a validated payload onto the gameState singleton. Call before
 * starting WorldScene so NPC `when` conditions and exits resolve correctly.
 * @param {SavePayload} p
 */
export function applySave(p) {
  gameState.flags = p.flags;
  gameState.follower = p.follower ?? null;
  gameState.objective = p.objective;
  gameState.items = p.items;
  gameState.collected = p.collected;
}
```

- [ ] **Step 1.4: Run the tests — expect pass**

Run: `npx vitest run tests/saveGame.test.js`
Expected: PASS (all tests).

- [ ] **Step 1.5: Full unit suite + typecheck + format, then commit**

Run: `npm test && npm run typecheck && npm run format`
Expected: all green; format may rewrite the new files.

```bash
git add src/state/saveGame.js tests/saveGame.test.js
git commit -m "feat: checkpoint save module (localStorage, versioned key)"
```

---

### Task 2: Autosave at zone entry

**Files:**

- Modify: `src/scenes/WorldScene.js` (imports ~line 15; `create()` ~line 43)

- [ ] **Step 2.1: Add the single save call**

Add to the imports:

```js
import { save } from '../state/saveGame.js';
```

In `create()`, immediately after `this.zone = zone;`:

```js
save(this.zoneKey, this.entryKey); // checkpoint: every zone entry
```

This is the only save call site. Every transition (doors, exits, the prologue
time-skip restart, the waggon/ferry teleports that call `goToZone`) funnels
through `scene.restart` → `create()`, so all of them checkpoint automatically.

- [ ] **Step 2.2: Verify nothing broke**

Run: `npm test && npm run build`
Expected: PASS / clean build. (WorldScene has no unit tests; the e2e test in Task 4 exercises this line for real.)

- [ ] **Step 2.3: Commit**

```bash
git add src/scenes/WorldScene.js
git commit -m "feat: autosave at every zone entry"
```

---

### Task 3: Title screen — Continue / New Game + disclaimer

**Files:**

- Modify: `src/scenes/TitleScene.js`

- [ ] **Step 3.1: Rework the prompt block and start handlers**

In `create()`, replace the prompt text object, the two `keyboard.once` lines at the bottom, and `startGame()` with the following. Keep everything else (title, subtitle, ring, controls, version) as is.

```js
// (replace the PRESS ENTER prompt block)
const saved = load();
const prompt = this.add
  .text(cx, cy + 225, saved ? 'ENTER ~ CONTINUE' : 'PRESS ENTER', {
    fontFamily: '"Press Start 2P"',
    fontSize: '24px',
    color: '#f0ead6',
    align: 'center',
  })
  .setOrigin(0.5);
if (saved) {
  this.add
    .text(cx, cy + 265, 'N ~ NEW GAME', {
      fontFamily: '"Press Start 2P"',
      fontSize: '14px',
      color: '#8a8a8a',
      align: 'center',
    })
    .setOrigin(0.5);
}
```

Add the disclaimer above the controls line (y=600 — clear of the N-hint line, whose
14px text at cy+265 spans ~618–632; controls sit at 654, version at 690):

```js
this.add
  .text(cx, 600, 'An unaffiliated, non-commercial fan project', {
    fontFamily: '"Press Start 2P"',
    fontSize: '12px',
    color: '#4a4a4a',
  })
  .setOrigin(0.5);
```

Replace the two `keyboard.once` registrations:

```js
// ENTER/SPACE continue a saved game if one exists; N always starts fresh.
this.starting = false;
const begin = saved ? () => this.continueGame(saved) : () => this.startGame();
this.input.keyboard.on('keydown-ENTER', begin);
this.input.keyboard.on('keydown-SPACE', begin);
if (saved) this.input.keyboard.on('keydown-N', () => this.startGame(true));
```

Replace/extend the methods (both guard against double-fires since multiple keys are live):

```js
/** @param {boolean} [fresh] true when N wipes an existing save */
startGame(fresh = false) {
  if (this.starting) return;
  this.starting = true;
  if (fresh) clearSave();
  initAudio(); // must happen inside a user-gesture handler
  // A fresh game opens at Bilbo's farewell party; presetting
  // `prologueDone` (QA hooks) boots straight into the main story.
  const prologue = !hasFlag('prologueDone');
  if (prologue) setObjective('Speak with Bilbo beneath the Party Tree');
  this.cameras.main.fadeOut(800, 0, 0, 0);
  this.cameras.main.once('camerafadeoutcomplete', () => {
    this.scene.start('WorldScene', { zone: 'shire', entry: prologue ? 'party' : 'default' });
  });
}

/** @param {import('../state/saveGame.js').SavePayload} saved */
continueGame(saved) {
  if (this.starting) return;
  this.starting = true;
  initAudio();
  applySave(saved); // restore state BEFORE WorldScene boots
  this.cameras.main.fadeOut(800, 0, 0, 0);
  this.cameras.main.once('camerafadeoutcomplete', () => {
    this.scene.start('WorldScene', { zone: saved.zone, entry: saved.entry });
  });
}
```

Update the imports:

```js
import { load, clearSave, applySave } from '../state/saveGame.js';
```

- [ ] **Step 3.2: Manual check in the dev server**

Run: `npm run dev`, open the game. Fresh browser profile → "PRESS ENTER" plus the disclaimer line. Play into Hobbiton, reload → "ENTER ~ CONTINUE / N ~ NEW GAME"; ENTER resumes at the zone entrance; N replays the prologue.

- [ ] **Step 3.3: Lint, format, commit**

Run: `npm run lint && npm run format`

```bash
git add src/scenes/TitleScene.js
git commit -m "feat: continue/new-game title flow and fan-project disclaimer"
```

---

### Task 4: e2e coverage for the reload→continue loop

**Files:**

- Create: `e2e/save.spec.js`

- [ ] **Step 4.1: Write the spec**

```js
// e2e/save.spec.js
// Autosave/continue across a real page reload. Playwright gives each test a
// fresh browser context, so localStorage starts empty and tests can't leak
// saves into each other (or into smoke.spec.js).

import { test, expect } from '@playwright/test';

async function press(page, key, hold = 60) {
  await page.keyboard.down(key);
  await page.waitForTimeout(hold);
  await page.keyboard.up(key);
}

async function bootToTitle(page) {
  await page.goto('/');
  await page.waitForFunction(() => window.__game?.scene.isActive('TitleScene'));
}

test('autosave at zone entry survives a reload and Continue restores it', async ({ page }) => {
  await bootToTitle(page);
  await page.evaluate(() => {
    window.__state.flags.prologueDone = true;
    window.__state.flags.timeskipShown = true;
  });
  await press(page, 'Enter');
  await page.waitForFunction(() => window.__game?.scene.isActive('WorldScene'));

  // Advance the story and change zones — the woodyend entry autosaves
  await page.evaluate(() => {
    Object.assign(window.__state.flags, { metGandalf: true, samJoined: true });
    window.__state.follower = 'sam';
    window.__game.scene.getScene('WorldScene').goToZone('woodyend', 'west');
  });
  await page.waitForFunction(
    () => window.__game.scene.getScene('WorldScene').zone?.key === 'woodyend',
  );

  // Reload: module state is wiped, localStorage survives
  await page.reload();
  await page.waitForFunction(() => window.__game?.scene.isActive('TitleScene'));
  await press(page, 'Enter'); // Continue
  await page.waitForFunction(() => window.__game?.scene.isActive('WorldScene'));

  const state = await page.evaluate(() => ({
    zone: window.__game.scene.getScene('WorldScene').zone.key,
    samJoined: !!window.__state.flags.samJoined,
    follower: window.__state.follower,
    objective: window.__state.objective,
  }));
  expect(state.zone).toBe('woodyend');
  expect(state.samJoined).toBe(true);
  expect(state.follower).toBe('sam');
});

test('N starts a new game, discarding the save', async ({ page }) => {
  await bootToTitle(page);
  await page.evaluate(() => {
    window.__state.flags.prologueDone = true;
    window.__state.flags.timeskipShown = true;
  });
  await press(page, 'Enter');
  await page.waitForFunction(() => window.__game?.scene.isActive('WorldScene'));

  await page.reload();
  await page.waitForFunction(() => window.__game?.scene.isActive('TitleScene'));
  await press(page, 'n'); // New Game
  await page.waitForFunction(() => window.__game?.scene.isActive('WorldScene'));

  const state = await page.evaluate(() => ({
    objective: window.__state.objective,
    prologueDone: !!window.__state.flags.prologueDone,
  }));
  // Fresh start: back at Bilbo's party, saved flags gone
  expect(state.prologueDone).toBe(false);
  expect(state.objective).toMatch(/Bilbo/);
});
```

- [ ] **Step 4.2: Run the e2e suite**

Run: `npm run test:e2e`
Expected: PASS, including the pre-existing smoke tests (they run in fresh contexts, so the save system must not change their behavior — if a smoke test fails, that is a real regression, not test flake).

- [ ] **Step 4.3: Commit**

```bash
git add e2e/save.spec.js
git commit -m "test: e2e coverage for autosave, continue, and new game"
```

---

### Task 5: GitHub Pages deployment

**Files:**

- Modify: `.github/workflows/ci.yml`
- Create: `public/CNAME`

- [ ] **Step 5.1: Create the CNAME file**

`public/CNAME` (no trailing newline requirements; one line):

```
lotr.lonelymtnlabs.com
```

Vite copies `public/` verbatim into `dist/`, keeping the custom-domain binding with every deploy.

- [ ] **Step 5.2: Verify it lands in the build**

Run: `npm run build && cat dist/CNAME`
Expected: `lotr.lonelymtnlabs.com`

- [ ] **Step 5.3: Append the deploy job to ci.yml**

```yaml
deploy:
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'
  needs: [test, e2e]
  runs-on: ubuntu-latest
  permissions:
    pages: write
    id-token: write
  environment:
    name: github-pages
    url: ${{ steps.deployment.outputs.page_url }}
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: 22
        cache: npm
    - run: npm ci
    - run: npm run build
    - uses: actions/configure-pages@v5
    - uses: actions/upload-pages-artifact@v4
      with:
        path: dist
    - id: deployment
      uses: actions/deploy-pages@v4
```

PRs still run only `test` and `e2e`; the deploy fires on pushes to main (i.e., PR merges).

- [ ] **Step 5.4: Commit**

```bash
git add .github/workflows/ci.yml public/CNAME
git commit -m "ci: deploy to GitHub Pages at lotr.lonelymtnlabs.com on green main"
```

**Manual steps for the user (before merging this branch):**

1. Repo Settings → Pages → Source: **GitHub Actions**. Without this the deploy job fails.
2. Squarespace DNS (lonelymtnlabs.com): add a CNAME record, host `lotr`, value `enflory.github.io`.
3. After the first successful deploy: Settings → Pages → Custom domain → `lotr.lonelymtnlabs.com`, then enable **Enforce HTTPS** once the certificate provisions (can take a few minutes after DNS propagates).

---

### Task 6: Docs + final verification

**Files:**

- Modify: `CLAUDE.md` (Current State section)
- Modify: `README.md`

- [ ] **Step 6.1: Update CLAUDE.md**

In **Current State**, note: autosave/continue system (one localStorage key `lotr-rpg.save.v1`, written at every zone entry, restored from the title screen; `src/state/saveGame.js`), and public deployment (GitHub Pages at https://lotr.lonelymtnlabs.com, deploy job in ci.yml). Remove "a save system (flags → localStorage)" from the wants list.

- [ ] **Step 6.2: Update README.md**

Add a "Play it" line near the top: `**Play it in the browser:** https://lotr.lonelymtnlabs.com` (note it goes live once the branch merges and DNS is set).

- [ ] **Step 6.3: Full verification suite**

Run: `npm run lint && npm run typecheck && npm run format:check && npm test && npm run build && npm run test:e2e`
Expected: everything green.

- [ ] **Step 6.4: Commit and open the PR**

```bash
git add CLAUDE.md README.md
git commit -m "docs: record save system and live deployment URL"
git push -u origin feat/save-and-deploy
gh pr create --title "Save system + GitHub Pages deployment" --body "..."
```

PR body should summarize the spec, list the three manual steps from Task 5, and end with the standard generation footer.

---

## Post-merge manual QA (user + agent)

1. Watch the first deploy run; confirm the Pages URL serves the game.
2. Full playthrough on https://lotr.lonelymtnlabs.com: audio starts on first keypress, Continue works across a browser restart, HTTPS padlock present.
3. Then: website tile follow-on in `lonely_mountain_labs` (separate effort, per spec).
