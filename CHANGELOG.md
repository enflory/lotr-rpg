# Changelog

Versions track chapter milestones: `0.<chapter>.x` while a chapter is in
progress, `1.0.0` when all ten chapters of _Fellowship_ are playable.

## 0.6.0 — 2026-10-04

Chapter 6, "Rivendell": from Frodo's stand at the Ford to the Company of nine
at the southern gate.

### Game

- Three new zones (the valley with its bridge, gardens, east porch and gate;
  the room-wing; the hall with the Hall of Fire at its far end) and the Ford of
  Bruinen gains the flood
- Ten story beats in order (Fellowship Book I ch. 12 and Book II ch. 1–3): the
  flood, the waking, the feast, the Hall of Fire, the Council of Elrond in three
  parts, the turning of the year, Bilbo's gifts, the Company at the gate
- One player prompt at the Ford ("Draw your sword") and one at the Council
  ("Rise and speak"); the Ring on the stone is a transient prop and never a
  usable power
- Twelve new characters (Elrond, Arwen, Glóin, Gimli, Legolas, Boromir, Lindir,
  Erestor, Galdor, elder Bilbo, Gandalf and Aragorn as guests); every guest's
  talk changes with the story
- Eleven new tiles (carved pillar, inlaid floor, falls, balustrade, carved wall,
  great hearth, fir, steps, lamp, slate roof, long table), four original songs
  (rivendell, hallfire, council, parting), two story items (Sting, the mithril
  coat); dusk, dawn, noon and winter skies; falling leaf then snow
- No combat, no stamina, no timer, no dialogue choices; decisions are recorded in
  `docs/lore/rivendell-adaptation.md`
- Continue works from the end of chapter five and at every checkpoint in the
  chapter; save format unchanged (v1)

### Infrastructure

- `dialogue stage .give` accepts a list; the interior light bake knows the great
  hearth, lamps and long tables
- `e2e/phone.js` shares the thumb-pad helpers between chapters 5 and 6
- Route spec (two segments), staging spec and iPhone 13 portrait/landscape
  spec for the chapter; two new CI shards

## 0.5.0 — 2026-09-30

Chapter 5, "The Long Road": from the road out of Bree to the Ford of Bruinen.

### Game

- Four new zones: Midgewater Marshes, Weathertop (ruined ring, camp dell),
  the Trollshaws (three stone trolls, the Last Bridge) and the Ford of Bruinen
- Eleven story beats in order (Fellowship Book I, chapters 11–12): off the
  Road, a night of midges, the hill and Gandalf's mark, the tale of Tinuviel,
  the five Riders, the wound, athelas, the trolls, Glorfindel, the ride
- Staged Weathertop attack with two player prompts; the Ring is a transient
  tableau (pale Riders seen through it), never a usable power
- Glorfindel (new character) and Asfaloth (new mounted sprite sheet); Nine
  Riders chase Frodo across the Ford
- Six new tiles (ruin, rubble, leaf litter, autumn beech, ford shallows, fire
  pit) and four original songs (midgewater, weathertop, trollshaws, ford)
- No combat, no stamina, no timer; the wound is a cold tint that eases with
  athelas. Decisions are recorded in `docs/lore/long-road-adaptation.md`
- Continue works from the end of chapter four and at the camp, the start of
  the ride and the eastern bank; save format unchanged (v1)

### Infrastructure

- `storyFlow.js`: beat/lock/restore plumbing shared by Bree and the road
- Route spec (two segments), staging spec and iPhone 13 portrait/landscape
  spec for the chapter; two new CI shards

## 0.2.0 — 2026-07-10

Chapter 1 vertical slice, playable end to end, plus repo formalization.

### Game

- Zone system: Bag End (interior + exterior), Hobbiton, the Green Dragon
  interior, and the Woody End, connected by doors and walk-on exits
- Staged dialogue with story flags: Gandalf reveals the Ring, Sam joins
  as a follower, Gildor sends you to the Bucklebury Ferry
- The Black Rider set piece: hide in the fern brakes or be caught
- Procedural chiptune audio (three looping songs + SFX) and fully
  procedural pixel art (34 tiles, 8 characters, mounted Black Rider)
- Title screen with chapter card; objective banners (Q recalls, M mutes)

### Infrastructure

- Vitest suite (60 tests): dialogue staging, zone cross-reference
  integrity, tile registry contract, art helpers, rider state machine
- Playwright smoke tests driving the real game through QA hooks
- GitHub Actions CI: lint, format check, unit tests, build, e2e
- ESLint + Prettier (hand-aligned maps and pixel art exempted)

## 0.1.0

- First prototype: the Shire with 5 NPCs, dialogue, and procedural art
