# Beyond the Hedge Implementation Plan

**Goal:** Build and verify two connected playable chapters from Crickhollow to the East Road.
**Architecture:** Existing WorldScene, new connected zone modules and chapter dialogue registry; per-zone story hooks derive encounter presentation from persistent flags. Procedural scenery and ambience are separate from progression.
**Tech Stack:** Phaser 3, JavaScript/JSDoc, Vite, Vitest, Playwright.
**Spec:** docs/superpowers/specs/2026-09-06-old-forest-design.md

## Global Constraints

- Preserve PR 28 and save format v1.
- No new dependencies or external art/audio assets.
- Original paraphrase anchored to Fellowship Book I chapters 5–8.
- All requested scenes playable in this branch; house is the chapter break.

## Tasks

- [x] 1. Procedural art/audio: append forest/downs tiles, Tom/Goldberry/Fatty sprites, song/blade icons, original ambience songs. Independent art worker; parent reviews registration and visuals.
- [x] 2. Progression contracts: failing tests for ordered story stages, one-time rewards and map reachability. Implement chapter dialogue registry; add inspectable interactions and dialogue checkpoint persistence to WorldScene. Add Merry follower on departure.
- [x] 3. Connected world: Crickhollow, hedge tunnel, forest edge/Bonfire Glade, hill and hollows, Withywindle/Willow, Tom's clearing and house, sunny/foggy downs, barrow, road. Link existing ferry ending forward. Add regional optional observations and clear traversal cues.
- [x] 4. Encounter presentation: sleep and trapped companions, failed fire, Tom arrival/rescue; house day/night/rain and Ring demonstration; fog separation, barrow hand and daylight rescue. Reconstruct all presentation on Continue from flags; no unsaved transient locks.
- [x] 5. End-to-end verification: play full journey via real keyboard interaction and collision-aware traversal; verify save/reload at Willow, house, fog and barrow; regression suite; screenshots using gstack browse. Fix discoveries and review whole diff before commit.

## Progress

Branch created from verified PR 28 head 3932dda. Architecture and dialogue gates implement the user's authorized full build request; no additional design approval needed. Art delegated while parent implements tightly coupled progression/maps/scenes.

## Verification completed

- 143 unit tests across 17 files pass.
- All 16 Playwright tests pass together (5.2 minutes), including the complete journey using keyboard movement and physics, six Continue reloads, Willow captivity, the iron gate, Ring presentation, and Chapter 1 regressions.
- Lint, typecheck, format check, production build and `git diff --check` pass. Vite reports the existing large Phaser bundle warning.
- gstack browser inspection covered forest traversal, Willow, the house, fog and the barrow. Review screenshots are in `assets/screenshots/`.
- Review discoveries corrected: persistent ferry bank checkpoint, foot-position exit detection, Willow escape gates, two-night house chronology, Ring visibility surviving fern updates, and physical gate collision. Static forest scenery is cached as a texture to reduce rendering cost.
- Eleven added zones are split at the house into Chapters 2 and 3. Original paraphrases, fixed forest paths and walking instead of pony riding are documented in `docs/lore/old-forest-adaptation.md`.
