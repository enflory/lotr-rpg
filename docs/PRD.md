# LOTR RPG — Product Requirements Document

**Version**: 0.1 (Draft)
**Last updated**: 2026-04-08
**Status**: Open questions flagged — not yet final

---

## 1. Product Overview

### 1.1 Vision
A top-down pixel art RPG covering The Lord of the Rings: The Fellowship of the Ring, faithful to Tolkien's published text. GBA / A Link to the Past and Four Swords aesthetic. The player controls Frodo Baggins from Bag End to the breaking of the Fellowship at Parth Galen.

### 1.2 Core Principles
- **Book-faithful**: Follow Tolkien's text. Include what adaptations cut (Tom Bombadil, Barrow-downs, the Woody End). No invented lore.
- **Retro aesthetic**: 16×16 pixel tiles, limited palette per zone, procedurally generated art. Looks and feels like a lost Game Boy Color / early GBA title.
- **Exploration-first**: The joy is wandering Middle-earth. Talking to characters, discovering locations, absorbing atmosphere.
- **Iterative shipping**: 10 chapters, each a standalone playable zone. Build, polish, and ship one at a time.

### 1.3 Target Audience

> **[DECISION NEEDED]** Who is the primary audience?
>
> Options:
> - **A) Tolkien fans who enjoy games** — Leans into lore depth, dialogue, atmosphere. Combat and RPG mechanics are lighter. The draw is "experience the book as a game."
> - **B) Retro RPG players** — Leans into traditional RPG mechanics (stats, combat, inventory management). The draw is "a well-made retro RPG set in a great world."
> - **C) Broad/casual** — Accessible to non-gamers. Very simple controls, forgiving difficulty, short sessions. The draw is "I can play through LOTR on my phone."
>
> This choice cascades into almost every system design decision below. Current prototype leans toward A.

---

## 2. Platform & Distribution

### 2.1 Runtime
**Web-based** (runs in browser). Phaser 3 game engine, Vite build tool, deployed as static files.

### 2.2 Distribution

> **[DECISION NEEDED]** Where does this ship?
>
> Options:
> - **Web-only** (hosted site, shareable URL) — Lowest friction. Anyone can play instantly. Limits monetization.
> - **itch.io** — Good for indie games. Supports pay-what-you-want and chapter-based pricing. Web embed + downloadable.
> - **Electron wrapper → Steam** — Desktop app. Enables Steam community, achievements, etc. More setup.
> - **Hybrid** — Free web demo (Chapter 1), paid full game on itch.io or similar.
>
> Recommendation: Start web-only for Chapter 1 (zero friction, easy to share), decide distribution for later chapters once there's traction.

### 2.3 Mobile Support

> **[DECISION NEEDED]** Support mobile/touch?
>
> The 320×240 resolution and simple controls (d-pad + action button) map naturally to mobile. But touch controls need explicit design (virtual d-pad? swipe? tap-to-move?).
>
> Options:
> - **Desktop-only** for now, add mobile later
> - **Mobile-first** with virtual d-pad overlay
> - **Both from the start** (responsive layout + touch controls)
>
> If targeting audience C (casual), mobile is probably essential. If A or B, desktop-first is fine.

---

## 3. Technical Architecture

### 3.1 Current Stack
| Component | Technology | Notes |
|-----------|-----------|-------|
| Engine | Phaser 3.90 | Arcade physics, tilemap support |
| Build | Vite 8 | Fast dev server, static output |
| Art | Canvas 2D → data URLs | All sprites/tiles generated in code |
| Font | Press Start 2P (Google) | Retro pixel font |
| Resolution | 320×240, scaled via FIT | 20×15 tiles visible at once |

### 3.2 Scene Architecture
Current: `BootScene → TitleScene → ShireScene` (linear).

Full game needs:
```
BootScene (generate textures)
  → TitleScene
    → WorldMapScene (chapter select / zone transitions)
      → ShireScene (Chapter 1)
      → OldForestScene (Chapter 2)
      → BarrowDownsScene (Chapter 3)
      → BreeScene (Chapter 4)
      → WildernessScene (Chapter 5)
      → RivendellScene (Chapter 6)
      → MoriaScene (Chapter 7)
      → LothlórienScene (Chapter 8)
      → RiverScene (Chapter 9)
      → AmonHenScene (Chapter 10)
```

### 3.3 Zone Data Model
Each zone needs:
- **Tileset**: Zone-specific tile palette (new tile indices and draw functions per zone)
- **Map data**: 2D array, variable dimensions per zone (The Shire may be 60×60, Moria may be 100×80 with multiple sub-levels)
- **NPC spawns**: Positions, directions, dialogue keys
- **Collision layer**: Which tiles block movement
- **Trigger zones**: Tile regions that fire events (zone transitions, cutscenes, encounters)
- **Dialogue data**: Per-zone dialogue sets
- **Event flags**: Track story progression (has the player talked to Gandalf? Has the party scene played?)

### 3.4 Save System

> **[DECISION NEEDED]** How does save/load work?
>
> Options:
> - **Auto-save only** (localStorage) — Save on zone transition and key events. No manual save. Simplest to build, but players can't maintain multiple saves.
> - **Manual save points** (specific locations like beds, campfires) — More traditional RPG feel. Adds tension (can you reach the next save?).
> - **Save anywhere** — Most player-friendly. Most complex to implement (need to serialize full game state at any moment).
>
> Recommendation: Auto-save on zone transitions + key story events, stored in localStorage. Add manual save slots later if needed.

### 3.5 State Management
Need a global game state object that persists across scenes:
```
GameState {
  chapter: number           // current chapter (1-10)
  zone: string              // current zone scene key
  playerPosition: {x, y}   // tile coordinates
  partyMembers: string[]    // who's in the active party
  inventory: Item[]         // carried items
  eventFlags: {             // story progression
    [flagName]: boolean
  }
  npcDialogueState: {       // tracks which dialogue stage each NPC is at
    [npcKey]: number
  }
  playTime: number          // total seconds
}
```

### 3.6 Art Generation at Scale

The prototype generates all art procedurally in `BootScene.js` via Canvas 2D. This is currently 19 tiles + 6 characters = ~800 lines of drawing code.

The full game needs ~10 tilesets (15-25 tiles each) + 32+ character sprites = significantly more.

> **[DECISION NEEDED]** Continue with fully procedural art, or shift to sprite sheet assets?
>
> **Procedural (current approach)**:
> - Pro: Zero external dependencies, everything lives in code, easy to iterate
> - Pro: Guaranteed pixel-perfect consistency
> - Con: Drawing 150+ tiles and 32+ characters in code is extremely verbose
> - Con: Hard to hand-tune visual details at scale
> - Con: BootScene load time grows with each zone
>
> **Sprite sheet assets (PNG files)**:
> - Pro: Standard approach, tools exist (Aseprite, Piskel, Tiled)
> - Pro: Easier to iterate on visuals without touching code
> - Pro: Can be loaded on-demand per zone (no boot-time penalty)
> - Con: Requires maintaining image assets alongside code
> - Con: Need a pixel art tool workflow
>
> **Hybrid**: Generate base art procedurally for prototyping, export to PNGs for polish passes. Best of both but more complex pipeline.
>
> Recommendation: Continue procedural for Chapter 1 (it works), but plan the architecture so swapping to sprite sheets is straightforward. Each zone should load its own tileset independently.

---

## 4. Core Gameplay Systems

### 4.1 Movement & Exploration
**Established in prototype**:
- 4-directional movement (arrow keys), diagonal supported
- Speed: 72 pixels/sec
- Tile-based collision
- Camera follows player with lerp (0.08)

**Needed**:
- Zone transitions (walk to edge of map → fade → load next zone or world map)
- Interior/exterior transitions (enter a building → load interior map → exit returns to overworld position)
- Running (hold button to move faster?)

> **[DECISION NEEDED]** Interior maps — how deep?
>
> Can the player enter Bag End, the Prancing Pony, Tom's house, Elrond's hall? If so, each is its own small tilemap. This multiplies art/map work significantly but adds tremendous atmosphere.
>
> Options:
> - **No interiors** — All interaction happens at the door (current approach with door signs)
> - **Key interiors only** — Bag End, Prancing Pony, Tom's house, Rivendell great hall, Chamber of Mazarbul. ~8-10 total interior maps across the whole game.
> - **All buildings enterable** — Every hobbit hole, every room. Massive scope.
>
> Recommendation: Key interiors only. Bag End is essential for Chapter 1. Budget ~1-2 interior maps per chapter.

### 4.2 Combat

> **[DECISION NEEDED — CRITICAL]** What is the combat system?
>
> This is the single biggest design decision in the game. The book has specific combat encounters (Weathertop, Moria, Amon Hen) but Frodo is not a fighter — he's a Ring-bearer who survives through courage, friendship, and luck.
>
> **Option A: No traditional combat**
> Combat encounters are scripted narrative events (cutscenes with player choices). Weathertop plays out as a tension sequence — you choose when to put on the Ring, you choose to stand or flee. Moria's battle is a chase sequence, not a fight. The Balrog is a set-piece, not a boss you "beat."
> - Pro: True to the book (Frodo doesn't fight much). Unique. Keeps development scope manageable.
> - Con: May feel thin to RPG players. Less "game" in the game.
>
> **Option B: Simple real-time combat (A Link to the Past style)**
> Frodo can swing Sting, companions attack nearby enemies. Enemies have HP, you have HP. Simple and immediate.
> - Pro: Familiar, satisfying. Leverages the retro aesthetic.
> - Con: Frodo-with-a-sword doesn't match the book well. Needs careful balancing.
>
> **Option C: Turn-based encounters (Pokemon/Final Fantasy style)**
> Random or scripted encounters trigger a battle screen. Party members take turns. Each character has abilities.
> - Pro: Deep, strategic. Party system shines. Classic RPG feel.
> - Con: Heaviest to build. Random encounters can feel grindy. Slows exploration.
>
> **Option D: Hybrid — narrative combat with light mechanics**
> Most encounters are scripted events, but key battles have simple mechanical elements. Weathertop: you control Frodo's movement and must reach the campfire / use the Ring at the right moment. Moria: real-time escape sequence with obstacles. Amon Hen: stealth/evasion from Boromir, then orcs.
> - Pro: Each combat encounter feels unique and hand-crafted. True to the book's variety.
> - Con: No reusable combat system — every encounter is bespoke. More design work per encounter.
>
> My instinct is D, but this needs a clear decision before building beyond Chapter 1 (which has no combat).

### 4.3 Party System

**How companions work on-screen**:

> **[DECISION NEEDED]** Do party members physically follow Frodo?
>
> **Option A: Follow formation** — Companions trail behind Frodo like a chain (Pokemon-style, or Chrono Trigger). Need AI pathfinding for followers.
> - Pro: Visually shows your party. Feels alive.
> - Con: Pathfinding complexity. Followers getting stuck on geometry. Need sprites for everyone walking in all 4 directions (already supported by current sprite system).
>
> **Option B: Abstracted party** — Party members are shown in a menu/HUD. On the map, only Frodo is visible. Companions appear in dialogue, cutscenes, and combat.
> - Pro: Simpler to build. No pathfinding issues.
> - Con: Feels lonely. Loses the fellowship feel.
>
> **Option C: Context-dependent** — Key companions follow you (Sam is always behind you). Others appear at camp, in cutscenes, and during encounters but don't follow on the overworld.
> - Pro: Compromise. Sam following you is emotionally important. Full Fellowship of 9 trailing Frodo might look absurd at 16px scale.
> - Con: Inconsistent — why does Sam follow but not Merry?
>
> Recommendation: Start with B for Chapter 1 (only Frodo on-screen), move to C by Chapter 4 when Aragorn joins. Sam should follow Frodo from the beginning of Chapter 2 onward.

**Party composition by chapter** (from the books):
| Chapter | Active Party |
|---------|-------------|
| 1 | Frodo (Sam, Merry, Pippin join by end) |
| 2 | Frodo, Sam, Merry, Pippin |
| 3 | Frodo, Sam, Merry, Pippin |
| 4 | Frodo, Sam, Merry, Pippin + Aragorn joins |
| 5 | Frodo, Sam, Merry, Pippin, Aragorn |
| 6 | Frodo (+ Fellowship forms: Sam, Merry, Pippin, Aragorn, Gandalf, Legolas, Gimli, Boromir) |
| 7 | Full Fellowship → Gandalf lost |
| 8 | Fellowship minus Gandalf |
| 9 | Fellowship minus Gandalf |
| 10 | Fellowship → Frodo + Sam only |

### 4.4 Dialogue System

**Established in prototype**:
- Typewriter text (28ms/char)
- Skip-ahead on button press
- Multi-line conversations
- NPC faces player when talked to
- Door/sign interaction for location descriptions

**Needed for full game**:
- **Dialogue progression**: NPCs say different things based on story state (event flags). The Gaffer's dialogue changes after Gandalf visits, after Frodo decides to leave, etc.
- **Dialogue portraits**: Character face close-ups during conversation?

> **[DECISION NEEDED]** Player dialogue choices?
>
> **Option A: Linear dialogue only** (current) — Player presses button to advance. All conversations are scripted sequences. Simple, book-faithful (Tolkien wrote the dialogue, not you).
> - Pro: Easiest to build. Ensures book-faithfulness. Every player gets the same story.
> - Con: Passive. Player is a reader, not a participant.
>
> **Option B: Occasional choices** — Most dialogue is linear, but at key moments the player picks from 2-3 options. These don't change the plot (the story follows the book) but affect tone, reveal optional lore, or unlock side content.
> - Pro: Player feels involved. Can ask questions, express Frodo's personality.
> - Con: Branching dialogue is exponentially more writing. Risk of non-canonical responses.
>
> **Option C: Full dialogue trees** — Every NPC conversation has choices, topics to explore, optional branches.
> - Pro: Deep. Replayable. Explores lore.
> - Con: Massive writing scope. Risk of "choose your own Tolkien" feeling wrong.
>
> Recommendation: B. Linear by default, with choices at ~3-5 key moments per chapter (e.g., Frodo can ask Gandalf about the Ring's history, or about Bilbo, or about the Black Riders — all canonical, but player picks the order).

### 4.5 Inventory & Items

> **[DECISION NEEDED]** How deep is the inventory system?
>
> **Option A: Key items only** — No inventory screen. Important items (the Ring, Sting, Mithril coat, Phial of Galadriel, Barrow-blades) are tracked as event flags and appear in story moments automatically.
> - Pro: No UI to build. No balance issues. Clean.
> - Con: No collectibles. No sense of progression through gear.
>
> **Option B: Simple inventory** — A menu screen showing key items + consumables (lembas bread, athelas, miruvor, mushrooms). Items have simple effects (heal, cure status). No equipment stats.
> - Pro: Adds a light RPG layer. Lembas-as-healing makes sense. Manageable scope.
> - Con: Need an inventory UI, item data, use-item logic.
>
> **Option C: Full RPG inventory** — Weapons, armor, accessories with stats. Equipment affects combat performance. Shops or loot.
> - Pro: Traditional RPG depth.
> - Con: Heavy to build. Doesn't fit the book well (hobbits don't shop for swords). Only makes sense if combat is Option B or C.
>
> Recommendation: B if combat exists (Options B/C/D), A if combat is Option A (narrative-only).

### 4.6 The Ring

> **[DECISION NEEDED]** How does the Ring work as a game mechanic?
>
> The Ring is the story's central object. In the book, wearing it makes Frodo invisible but attracts the Nazgul and Sauron's Eye, and slowly corrupts him.
>
> **Option A: Story-only** — The Ring appears in cutscenes and dialogue. The player never "uses" it directly. It's a narrative device, not a mechanic.
>
> **Option B: Usable with consequences** — Player can put on the Ring at any time. Effect: become invisible (enemies can't see you, NPCs can't interact). Cost: a corruption meter rises. Nazgul/Eye awareness increases. At certain thresholds, bad things happen (forced visions, enemies drawn to you, companions react with concern). Can't be overused or the game pushes back hard.
>
> **Option C: Context-specific** — The Ring can only be used at scripted moments (Weathertop, Amon Hen, etc.). At those moments, the player chooses whether to put it on, and it triggers a unique sequence.
>
> Option B is the most interesting but hardest to balance. Option C is the safest. Both are more engaging than A.

---

## 5. Narrative Design

### 5.1 Story Progression Model
The story follows the book linearly. Each chapter has:
- **Entry event**: Triggered on first entering the zone (e.g., location label, opening cutscene)
- **Required story beats**: Events that must happen to progress (talk to Gandalf, attend the party, etc.)
- **Optional content**: Side conversations, lore, hidden areas
- **Exit condition**: What must be completed before the player can leave the zone

Event flags track progression. NPCs and triggers check flags to determine what to show.

### 5.2 Cutscenes

> **[DECISION NEEDED]** What do cutscenes look like?
>
> Key moments (Bilbo's party, Weathertop attack, Bridge of Khazad-dum) need more than dialogue boxes.
>
> **Option A: In-engine choreography** — Characters move on the tilemap, camera pans, screen effects (flash, shake, fade). Like Link's Awakening cutscenes. All using existing sprites and maps.
> - Pro: Consistent visual style. No new art assets needed. Achievable.
> - Con: Limited expressiveness at 16×16 pixel scale.
>
> **Option B: Illustrated stills** — Key moments get a larger illustration (maybe 160×120 pixels) shown as a "CG" with text. Like visual novel moments.
> - Pro: More dramatic. Can show things the tilemap can't (close-ups, landscapes).
> - Con: Need to create these illustrations. Different art pipeline.
>
> **Option C: Text-heavy narration** — Major moments are told through narrated text with minimal visual accompaniment (screen dims, Tolkien's prose appears). Lean into the book.
> - Pro: Lets Tolkien's words do the work. Low art cost.
> - Con: Lots of reading. May feel like a book, not a game.
>
> Recommendation: A as the primary approach, with C for transitions between chapters (a brief narrated passage sets the scene for the next zone). B is nice-to-have for 2-3 truly iconic moments per chapter if budget allows.

### 5.3 Pacing
Each chapter should take roughly **20-40 minutes** to play, giving the full game a total play time of ~4-7 hours.

> **[DECISION NEEDED]** Is that the right target length?
>
> A shorter game (2-3 hours total) would mean ~15 minutes per chapter — brisk, focused, more likely to be completed.
> A longer game (8-12 hours) would mean ~1 hour per chapter — room for side content, exploration, deeper mechanics.
>
> The answer ties back to audience: casual players (C) want shorter, RPG players (B) want longer, Tolkien fans (A) will tolerate longer if the content is rich.

---

## 6. Audio

> **[DECISION NEEDED]** What is the audio strategy?
>
> The prototype has no audio. Options:
>
> **Option A: Chiptune soundtrack** — Original compositions in 8-bit / Game Boy style. Each zone gets a theme. Battle music, safe zone music, etc.
> - Pro: Authentic retro feel. Huge atmospheric impact.
> - Con: Need a composer or a procedural music tool. Licensing original compositions.
>
> **Option B: Ambient SFX only** — No music. Wind, water, footsteps, birdsong, fire crackling. Sparse and atmospheric.
> - Pro: Unique mood. Lets the environments breathe. Very Tolkien (nature as character).
> - Con: Can feel empty. No emotional cues from music.
>
> **Option C: AI-generated chiptune** — Use an AI music tool to generate zone themes in a retro style.
> - Pro: Fast. Low cost.
> - Con: Quality may be inconsistent. Licensing varies by tool.
>
> **Option D: Silent** — Ship Chapter 1 without audio. Add it later.
> - Pro: Focus on gameplay first.
> - Con: Missing a major dimension of the experience.
>
> Recommendation: D for initial Chapter 1 ship. Plan for A or B long-term. Audio is high-impact but can be layered in without changing game architecture.

---

## 7. UI & HUD

### 7.1 In-Game HUD
Minimal. The current prototype shows nothing on-screen except the dialogue box when active.

Potential HUD elements:
- **Location name** (on zone entry, fades out — already implemented)
- **Interaction prompt** (icon above NPCs — already implemented)
- **Menu access hint** (small text like "ESC: Menu")

### 7.2 Pause Menu

> **[DECISION NEEDED]** What's in the pause menu?
>
> Minimum viable:
> - Resume
> - Party (who's in the group)
> - Map (current zone overview?)
> - Save (if manual save)
> - Settings (volume, text speed)
> - Quit to title
>
> Extended:
> - Inventory
> - Quest log / current objective
> - Lore journal (entries unlock as you discover things)
> - Character details (if stats exist)

### 7.3 Zone Map

> **[DECISION NEEDED]** Does the player have a map?
>
> **Option A: No map** — Player navigates by exploration and landmarks. True to the "lost in Middle-earth" feel.
> **Option B: Fog-of-war map** — Map reveals as you explore. Shows visited areas.
> **Option C: Full zone map** — Accessible from the menu. Shows the whole zone with points of interest.
>
> Recommendation: A for hostile zones (Old Forest, Moria), B or C for friendly zones (Shire, Rivendell).

---

## 8. Chapter 1: The Shire — Detailed Spec

This is the first chapter to be fully built. It establishes all core systems that later chapters will reuse.

### 8.1 Scope
**Map area**: Bag End → Hobbiton → Bagshot Row → Green Dragon → Party Field → The Water → Green Hill Country → Woody End

Current prototype covers Bag End through The Water (40×40 tiles). Needs expansion south/southeast for Green Hill Country and Woody End.

### 8.2 Story Flow
1. **Opening**: Frodo at Bag End. Gandalf arrives with news of the Ring.
2. **Exploration**: Free to walk Hobbiton, talk to NPCs, visit the Green Dragon.
3. **Trigger: Talk to Gandalf** → Ring revelation dialogue. Event flag set.
4. **Post-revelation**: NPC dialogue changes (Sam overheard, Gaffer warns about strangers).
5. **Trigger: Preparation sequence** → Frodo prepares to leave. Sells Bag End to Lobelia (dialogue). Sam joins.
6. **Departure**: Leave Hobbiton heading south. Merry and Pippin join on the road.
7. **Green Hill Country**: Walking south at dusk. Pastoral but darkening.
8. **Woody End**: Night falls. Meet Gildor's Elves (starlight sequence). First Black Rider sighting (tension moment — shadow on the road, player must hide).
9. **Chapter end**: Transition to Chapter 2.

### 8.3 Map Zones
| Sub-zone | Approx Size | Tiles Needed |
|----------|-------------|-------------|
| Bag End exterior (The Hill) | 40×12 | Existing |
| Bagshot Row | 40×6 | Existing |
| Hobbiton village / Bywater Road | 40×4 | Existing |
| Green Dragon area | 40×4 | Existing |
| Party Field | 40×9 | Existing |
| The Water + bridge | 40×4 | Existing |
| South bank → Green Hill Country | New | Grass, path, gentle hills, fences, farms |
| Woody End | New | Dense woodland, forest path, starlight clearing |

Total estimated map: ~60×80 tiles (expanded from current 40×40), or split into 2-3 connected sub-maps.

### 8.4 NPCs
| NPC | Location | Dialogue Stages | Notes |
|-----|----------|----------------|-------|
| Gandalf | Bag End hilltop | 3 stages (pre-revelation, revelation, post) | Triggers main plot |
| Sam | Near Bag End | 2 stages (eavesdropping, joins party) | Becomes party member |
| Merry | Crickhollow road (late chapter) | 1 stage (joins party) | Appears after departure |
| Pippin | With Merry | 1 stage (joins party) | Appears after departure |
| Gaffer | Bagshot Row | 2 stages (gossip, warning) | |
| Lobelia | Bywater Road / Bag End | 2 stages (nosy, buying Bag End) | |
| Rosie | Green Dragon area | 1 stage | |
| Gildor | Woody End | 1 stage (long, lore-rich) | Night encounter |
| Bilbo | Bag End (early) | 1 stage (farewell) | Leaves after party |

### 8.5 Key Items Introduced
- The Ring (received from Gandalf's revelation — always in inventory)
- Sting? (Depends on timing — in the book, Bilbo gives it at Rivendell)

### 8.6 New Systems Needed (Beyond Prototype)
1. **Event flag system** — Track story state, gate NPC dialogues
2. **Zone transitions** — Walk off map edge → fade → load new sub-map or chapter
3. **Dialogue progression** — Same NPC says different things based on flags
4. **Day/night cycle** (at least for this chapter) — Departure happens at dusk, Woody End is at night. Could be story-driven (flag-based) rather than real-time.
5. **NPC spawning/despawning** — Bilbo leaves, Merry/Pippin appear, based on story state
6. **Scripted movement** — NPCs walk to positions during events (Gandalf arrives at the door, Sam runs to join Frodo)

### 8.7 What Chapter 1 Does NOT Need
- Combat (no enemies in the Shire section, Black Rider is a flee/hide moment)
- Party following (Frodo is alone until late in the chapter; Sam/Merry/Pippin join at the very end)
- Inventory UI (Ring is the only item, tracked as a flag)
- Stats/HP
- Complex menus

This is deliberate: Chapter 1 establishes exploration, dialogue, atmosphere, and story progression. Combat and party mechanics debut in later chapters.

---

## 9. Technical Milestones for Chapter 1

### M1: Core Systems
- [ ] Event flag system (set/check flags, gate content)
- [ ] Dialogue progression (NPC dialogue changes based on flags)
- [ ] Scene transition system (fade out → load new scene → fade in)
- [ ] Game state persistence (survive scene transitions)
- [ ] Save/load (localStorage, auto-save on transitions)

### M2: Map Expansion
- [ ] Expand or split the Shire map to include Green Hill Country and Woody End
- [ ] New tiles for southern Shire (farmland, road markers) and Woody End (dense forest, clearing)
- [ ] Zone transition points between sub-maps

### M3: Story Implementation
- [ ] Gandalf's full dialogue sequence (multi-stage, flag-gated)
- [ ] All NPC dialogue stages written and wired
- [ ] Departure sequence (scripted event chain)
- [ ] Woody End night sequence (Gildor encounter, Black Rider hide-moment)
- [ ] Bilbo farewell scene

### M4: Polish
- [ ] Title screen updates (chapter indicator?)
- [ ] Location labels for sub-zones (Hobbiton, Bywater, The Green Dragon, Woody End)
- [ ] Screen transitions and visual effects (dusk lighting shift, starlight in Woody End)
- [ ] Playtesting and pacing adjustments
- [ ] Audio (if not deferred)

---

## 10. Open Questions Summary

All decision points collected in one place for review:

| # | Question | Options | Impact | Section |
|---|----------|---------|--------|---------|
| 1 | **Target audience** | A) Tolkien fans, B) RPG players, C) Casual | Cascades into everything | 1.3 |
| 2 | **Distribution platform** | Web-only, itch.io, Steam, hybrid | Monetization, packaging | 2.2 |
| 3 | **Mobile support** | Desktop-only, mobile-first, both | UI design, controls | 2.3 |
| 4 | **Art pipeline** | Procedural, sprite sheets, hybrid | Dev workflow, scale | 3.6 |
| 5 | **Save system** | Auto-save, save points, save anywhere | UX, complexity | 3.4 |
| 6 | **Interior maps** | None, key interiors, all buildings | Art/map scope | 4.1 |
| 7 | **Combat system** | None, real-time, turn-based, hybrid/narrative | Core gameplay, scope | 4.2 |
| 8 | **Party on-screen** | Follow formation, abstracted, context-dependent | Art, AI, feel | 4.3 |
| 9 | **Dialogue choices** | Linear, occasional choices, full trees | Writing scope, agency | 4.4 |
| 10 | **Inventory depth** | Key items only, simple, full RPG | UI, balance | 4.5 |
| 11 | **Ring mechanic** | Story-only, usable with consequences, context-specific | Core identity | 4.6 |
| 12 | **Cutscene style** | In-engine, illustrated stills, text narration | Art pipeline, drama | 5.2 |
| 13 | **Chapter length** | ~15 min, ~30 min, ~60 min each | Total play time, depth | 5.3 |
| 14 | **Audio strategy** | Chiptune, ambient SFX, AI-generated, silent | Atmosphere, scope | 6 |
| 15 | **Zone map** | No map, fog-of-war, full map | Navigation UX | 7.3 |

**Priority order for decisions**: Questions 1, 7, and 11 are the most foundational — audience, combat, and the Ring mechanic shape everything else. Recommend deciding those first, then the rest will follow more naturally.

---

## 11. References

- `game-reference.md` — Chapter breakdown, character roster, zone design, visual palettes
- `lore/lotr_fellowship_places.md` — Tolkien's environmental descriptions for all 25 locations
- `lore/lotr_fellowship_characters.md` — Physical and personality descriptions for 32+ characters
- `idea.md` — Original game concept
- [LennyRPG build log](https://www.lennysnewsletter.com/p/how-i-built-lennyrpg) — Reference for indie RPG built with AI tooling
