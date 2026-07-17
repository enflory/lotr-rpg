# Save System + Public Deployment — Design

**Date:** 2026-07-17
**Status:** Approved (user review 2026-07-17; reviewer subagent approved)
**Scope:** Two features shipped as one push: (1) an autosave/continue system backed by
localStorage, (2) public hosting on GitHub Pages under a lonelymtnlabs.com subdomain,
plus a project tile on the lonelymtnlabs.com homepage.

## Goals

- A visitor can play the game from a public URL with no install.
- Progress survives a page reload or a return visit: closing the tab mid-chapter and
  coming back resumes at the last zone entered.
- Chapter 2 (and any future chapter) inherits the save system for free.
- No backend, no accounts. Each browser's localStorage is its own isolated save.

## Non-goals (deliberately out of scope)

- Serializing mid-event state: the Black Rider state machine, party-event phases,
  ferry-event phases, the follower position-trail queue, exact player coordinates.
  Checkpoint-at-zone-entry makes all of these unnecessary.
- Named save slots / multiple saves per browser. The storage key is versioned so slots
  can be added later without migration pain. (Assumption made while the user was away:
  "multiple individuals" is served by per-browser isolation; revisit if device-sharing
  is a real use case.)
- Server-backed or cross-device saves. Deferred until the public deploy generates
  actual demand signal.
- Save-file export/import.

## Part 1 — Save system

### Architecture

A new module `src/state/saveGame.js` with three functions and no state of its own:

- `save(zoneKey, entryKey)` — snapshot `gameState` + checkpoint location to localStorage.
- `load()` — parse, validate, and return the saved payload, or `null`.
- `clearSave()` — remove the key.

`GameState.js` stays untouched: it remains a plain module-singleton of serializable
data (`flags`, `follower`, `objective`, `items`, `collected`), which is what makes
this design small.

### Storage format

One localStorage key: `lotr-rpg.save.v1`

```json
{
  "version": 1,
  "savedAt": 1752770000000,
  "zone": "woodyend",
  "entry": "default",
  "flags": { "prologueDone": true, "samJoined": true },
  "follower": "sam",
  "objective": "Follow the East Road",
  "items": { "mushroom": 3 },
  "collected": { "mathom-millpond": true }
}
```

### Validation (in `load()`)

Treat anything suspect as "no save" — worst case is a fresh start, never a broken
title screen:

- JSON parse failure → clear the key, return `null`.
- `version !== 1` → return `null` (future-version saves are not destroyed).
- `zone` missing from `ZONES`, or `entry` missing from that zone's `spawns` →
  fall back to the zone's `default` spawn if the zone is valid; otherwise `null`.
- Non-object `flags`/`items`/`collected` → `null`.
- localStorage unavailable (private browsing edge cases) → all three functions no-op;
  the game simply behaves as it does today.

### Autosave trigger

Exactly one call site: the top of `WorldScene.create()`, after the zone is resolved —
`save(this.zoneKey, this.entryKey)`. Every zone transition already restarts the scene,
so every zone entry checkpoints automatically.

The party prologue's time skip restarts the scene after setting `prologueDone`
(verified: `src/events/partyEvent.js` calls `scene.restart` right after the flag is
set), so the post-prologue state is checkpointed without special-casing.

### Restore flow (TitleScene)

- No save present → exactly today's behavior (ENTER/SPACE starts a new game).
- Save present → two options rendered on the title screen:
  - **ENTER — Continue** (SPACE mirrors ENTER, matching today's start behavior): assign the saved `flags`/`follower`/`objective`/`items`/
    `collected` onto `gameState`, then `scene.start('WorldScene', { zone, entry })`.
    State is restored *before* WorldScene boots, so NPC `when` conditions, the Sam
    follower, and gated exits all resolve correctly with zero changes to WorldScene.
  - **N — New Game**: `clearSave()`, then today's fresh-start path (prologue included).
- Restoring always spawns at the saved zone's entry spawn — never mid-event, so the
  Rider/party/ferry set pieces always initialize clean.

### QA / e2e

- Playwright creates a fresh browser context per test (empty localStorage), so the
  existing e2e suite and the `prologueDone`-preset QA hook are unaffected.
- New unit tests (`tests/saveGame.test.js`, Vitest with a localStorage stub):
  round-trip save/load, malformed JSON, unknown zone, unknown entry, future version,
  storage unavailable.
- One new e2e case: start, transition zones, reload the page, assert Continue is
  offered and restores the zone and flags.

## Part 2 — Deployment

### Pipeline

Append a `deploy` job to the existing `.github/workflows/ci.yml`:

- `needs:` the existing check jobs; runs only on `github.ref == 'refs/heads/main'`
  push events (PRs still get checks only).
- Steps: build (`npm run build`), `actions/configure-pages`,
  `actions/upload-pages-artifact` with `dist/`, `actions/deploy-pages`.
- The job needs `permissions: { pages: write, id-token: write }` and
  `environment: github-pages`, or `deploy-pages` fails.
- Repo Pages setting: "GitHub Actions" as the source. Repo is already public.

`vite.config.js` already sets `base: './'`, so the build works both on the
`enflory.github.io/lotr-rpg` subpath and on the custom domain — no config change.

### Custom domain

- Subdomain (user-confirmed): **`lotr.lonelymtnlabs.com`**.
- IP posture (user asked; not legal advice): a non-monetized fan project has no
  legal safe harbor, but realistic worst case is a takedown request to comply with.
  Keep the profile low: never monetize, and show a short "unaffiliated fan project"
  disclaimer line on the title screen (add to this push — one text object in
  TitleScene).
- One-time manual steps (user):
  1. DNS: add a CNAME record `lotr` → `enflory.github.io` in Squarespace
     (which hosts DNS for lonelymtnlabs.com per the website repo's CLAUDE.md).
  2. GitHub: set the custom domain in the lotr-rpg repo's Pages settings and enable
     "Enforce HTTPS" once the cert provisions.
- The deploy artifact needs a `CNAME` file containing the subdomain (place it in
  `public/` so Vite copies it into `dist/`), otherwise Pages drops the domain
  binding on each deploy.
- This does not affect the main website: subdomain Pages sites coexist with the
  apex-domain site under the same account.

### Website tile (recommended: small follow-on in the website repo)

The website repo is `~/Documents/Projects/lonely_mountain_labs`
(github.com/enflory/lonely-mountain-labs), a React/Vite/Tailwind site deployed by
building and copying `dist/public/` into `docs/` on `main`. Project cards live in a
data array in `client/src/components/sections/Projects.tsx` (`title`, `description`,
`link`), and each card renders an animated mini-visual from `ProjectVisuals.tsx`.

Adding the tile is therefore one array entry, a link to the game subdomain, and a
small pixel-art-flavored mini-visual to match the other cards — a self-contained
change in the other repo with its own build/deploy step. Recommendation: keep this
push's implementation plan scoped to the lotr-rpg repo and do the tile as an
immediate follow-on, using the repo-saved-preview workflow if the mini-visual
warrants design iteration.

## Error handling summary

| Failure | Behavior |
| --- | --- |
| Failed-parse save | Key cleared; title screen behaves as fresh install |
| Parseable but invalid shape / newer version | Ignored, not destroyed; behaves as fresh install |
| Saved zone/entry no longer exists (content renamed) | Fall back to zone default spawn, else fresh start |
| localStorage unavailable | Save system silently no-ops; game plays as today |
| Deploy fails | Pages keeps serving the previous deployment; CI shows red |

## Testing summary

- Unit: serializer round-trip + all validation branches (Vitest, Node env).
- e2e: reload-and-continue flow (Playwright).
- Manual: full playthrough on the live URL after first deploy; confirm HTTPS,
  audio init on first keypress, and Continue across a browser restart.

## Decisions (user review, 2026-07-17)

1. Subdomain: **`lotr.lonelymtnlabs.com`** (user-chosen; noted that `shire.` would
   use the mark marginally less prominently).
2. Save model: **single autosave slot per browser** (defaulted to the
   recommendation after options were explained; named slots remain an additive
   later change — revisit if shared-device play becomes real).
3. Website tile: **separate follow-on effort in the website repo** (user-confirmed).
4. Added at review: title-screen "unaffiliated fan project" disclaimer line.
