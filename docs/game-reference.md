# LOTR RPG — Game Reference

A synthesis of world structure, chapter breakdown, character roster, and zone design for use when building the PRD and implementation plans.

---

## Grand Vision

A top-down pixel art RPG covering the full story of The Fellowship of the Ring in 10 shippable chapters. Each chapter is an independently playable zone with its own tileset, NPCs, story beats, and mechanics. Chapters connect into a linear progression but are built, polished, and shipped iteratively — one zone at a time.

**Architecture**: Hub zones (freely explorable areas) connected by a world map. Each zone has a distinct visual palette, ambient mood, and at least one signature gameplay mechanic drawn from the source material.

---

## Chapter Breakdown

### Chapter 1: The Shire

**Places**: Bag End, Hobbiton, Bagshot Row, The Green Dragon, Party Field, The Water, Green Hill Country, Woody End
**Key characters**: Frodo, Bilbo, Gandalf, Sam, Merry, Pippin, Gaffer, Lobelia, Lotho, Fatty Bolger, Rosie, Gildor Inglorion
**Story beats**: Bilbo's farewell party, Gandalf reveals the Ring's nature, Frodo sells Bag End, departure at dusk, encounter with Gildor's Elves, first Black Rider sighting
**Signature mechanics**: Domestic exploration (enter hobbit holes, talk to everyone), night travel (Woody End starlight sequence)
**Visual palette**: Lush greens, warm yellows, round doors, hedgerows, lanterns, flowers. Tolkien's "cultivated, gentle, domestic beauty."
**Status**: Prototype exists (Bag End → Hobbiton → Party Field → The Water). Needs expansion south through Green Hill Country and Woody End.

### Chapter 2: Into the Wild

**Places**: Crickhollow, High Hay tunnel, Bonfire Glade, Old Forest knoll and hollows, Withywindle, Old Man Willow, Tom Bombadil's house
**Key characters**: Merry (joins the travelling party), Fredegar Bolger, Tom Bombadil, Goldberry
**Story beats**: Dawn farewell after the conspiracy, tunnel under the hedge, forest march, Old Man Willow traps Merry and Pippin, Sam rescues Frodo, failed fire, Tom's rescue, two nights and a rainy day at Tom's house, Ring demonstration
**Signature mechanics**: Fixed winding paths and northern dead ends lead toward the Withywindle; interactive Willow rescue; Tom's house as a safe haven with ordered supper, dreams, stories, and farewell. No randomized maze, conventional boss fight, or health system.
**Visual palette**: Boggy farmland (Marish) → dark hostile forest (dense canopy, gnarled roots, slimy moss) → sudden warmth (Tom's house: firelight, golden meadow, water-lilies)

### Chapter 3: Ancient Terrors

**Places**: Barrow-downs, road to Bree
**Key characters**: Barrow-wight, Tom Bombadil (rescue)
**Story beats**: Crossing the downs, fog rolls in, separation from companions, wight captures the hobbits, Frodo's courage (singing for Tom), Tom breaks the spell, ancient blades given to each hobbit
**Signature mechanics**: Fog/visibility system (shrinking sight radius), companion separation (you lose Merry/Pippin/Sam and must navigate alone), barrow interior (corpse-light, defence of companions, remembered summoning verse), item acquisition (the four Barrow-blades — first real weapons)
**Visual palette**: Treeless green hills with standing stones → grey fog → pale greenish corpse-light inside barrow → sudden daylight on rescue

### Chapter 4: The Prancing Pony

**Places**: Bree (village, gate, The Prancing Pony inn), Bill Ferny's house
**Key characters**: Harry Goatleaf (gatekeeper), Barliman Butterbur, Nob, Bill Ferny, Aragorn/Strider
**Story beats**: Arrival at Bree gate, the common room (Frodo's accidental Ring slip), Strider reveals himself, Gandalf's delayed letter, Nazgul raid the inn, pony Bill acquired, departure east
**Signature mechanics**: Social/stealth gameplay (don't draw attention in the common room — the Ring "accident" as a triggered event), first town with Men (scale contrast — three-storey buildings), information gathering (talking to locals, piecing together Strider's identity)
**Visual palette**: Stone houses on a hillside, warm inn interiors (lanterns, log fire, smoky common room), nighttime danger outside. First environment with human-scale architecture.

### Chapter 5: The Long Road

**Places**: Midgewater Marshes, Weathertop, Trollshaws, road toward Bruinen
**Key characters**: Aragorn, Nazgul (Witch-king), Glorfindel
**Story beats**: Miserable marsh crossing, campfire on Weathertop (Aragorn tells the tale of Beren and Luthien), Nazgul attack (Frodo stabbed by Morgul-blade), stone trolls comic relief, Glorfindel's arrival, desperate ride to the Ford
**Signature mechanics**: Endurance/survival (marshes drain stamina, Neekerbreekers prevent rest), Weathertop battle (first major combat — Frodo uses the Ring, sees the wraiths' true forms), wound mechanic (Frodo weakened after stabbing, ticking clock to reach Rivendell), mounted escape sequence (riding Asfaloth)
**Visual palette**: Brown/grey bogland → windswept hilltop ruins → autumn woodland (red/gold Trollshaws) → rushing river. Mood shifts from misery → dread → brief humor → desperate flight.

### Chapter 6: Rivendell

**Places**: Ford of Bruinen, Rivendell (Hall of Fire, Bilbo's room, Council terrace, gardens)
**Key characters**: Elrond, Bilbo (aged), Arwen, Gloin, Gimli, Legolas, Boromir, Gandalf (reunited), Lindir, Erestor, Galdor
**Story beats**: Flood at the Ford (Elrond's power), Frodo healed, reunion with Bilbo, the feast, Hall of Fire (Bilbo's poem), Council of Elrond (the full history revealed), "I will take the Ring", Fellowship formed
**Signature mechanics**: Rest/recovery hub (heal, upgrade equipment, deep lore conversations), Council as narrative set-piece (player witnesses the debate — key dialogue choices?), party formation (choose/confirm the Nine Walkers), time passage (weeks pass — seasonal shift from autumn to winter)
**Visual palette**: Hidden valley, waterfalls, fir/beech/oak on slopes, warm interiors with carved pillars, firelight in the Hall of Fire. Colors shift from autumn gold to silver-grey to winter chill during the stay.

### Chapter 7: The Dark Below

**Places**: Hollin, Caradhras (Redhorn Pass), Doors of Durin, Moria (halls, mines, Bridge of Khazad-dum), Dimrill Dale
**Key characters**: Full Fellowship, Watcher in the Water, cave troll, orcs, Balrog
**Story beats**: Silent march through Hollin, crebain spotted, Caradhras defeats them, retreat to Moria, riddle of the Doors, Watcher attacks, four days underground, Chamber of Mazarbul (Balin's tomb, "They are coming"), running battle, Bridge of Khazad-dum, Gandalf falls, grief in Dimrill Dale
**Signature mechanics**: Mountain weather system (Caradhras: blizzard visibility, endurance drain, forced retreat), darkness mechanic (Moria: tiny light radius around Gandalf's staff — lose him, lose the light), puzzle (Doors of Durin riddle), dungeon crawl (Moria's branching paths, wells, chasms), boss sequence (Balrog on the Bridge), party loss (Gandalf dies — the light goes out permanently)
**Visual palette**: Grey/brown emptiness (Hollin) → blood-red mountain (Caradhras) → black stone, corpse-dust, and faint phosphorescence (Moria) → sudden daylight and Mirrormere's deep blue. The most dramatic visual range of any chapter.

### Chapter 8: Through the Mountains

**Places**: Nimrodel stream, Lothlórien forest (border → Cerin Amroth → Caras Galadhon), Mirror of Galadriel
**Key characters**: Haldir (+ Rumil, Orophin), Celeborn, Galadriel
**Story beats**: Crossing Nimrodel (healing), blindfolded march, Cerin Amroth (timeless beauty), meeting Celeborn and Galadriel (the searching gaze), rest and grief, Mirror of Galadriel (Frodo sees the Eye, offers Galadriel the Ring), gifts given, departure by boat
**Signature mechanics**: Healing/restoration (Nimrodel cleanses status effects, Lorien restores the party after Moria), time dilation (days pass without noticing — calendar jumps), the Mirror as a vision sequence (player sees flash-forwards to future chapters), Ring temptation scene (Galadriel's test — the "terrible and beautiful" moment)
**Visual palette**: Silver-grey bark, golden leaves (floor and canopy), white niphredil and gold elanor flowers, green/gold/silver lamps at night. No blemish or stain. The most beautiful zone in the game — deliberate contrast with Moria's darkness.

### Chapter 9: The Great River

**Places**: Anduin (river journey), Brown Lands (east bank), Sarn Gebir rapids, the Argonath, Nen Hithoel
**Key characters**: Full Fellowship (minus Gandalf), orc archers
**Story beats**: Departure from Lorien (looking back at the golden wood fading), days on the river, orc arrows at Sarn Gebir, portage, the Argonath (Aragorn's moment of awe), camp at Parth Galen, growing tension (Boromir's strange behavior)
**Signature mechanics**: River navigation (boat controls, current/rapids), stealth (avoid detection from east bank), the Argonath as an awe moment (camera pulls back to show scale), mounting tension system (Boromir's corruption tracked through dialogue shifts)
**Visual palette**: Grey water, brown/dead eastern shores, green western plains, overcast skies. Then the monumental grey stone of the Argonath. Muted, wide, melancholy — "the grey and leafless world" after Lorien's gold.

### Chapter 10: The Breaking

**Places**: Parth Galen, Amon Hen (Hill of Seeing), the shore
**Key characters**: Full Fellowship, Boromir (fall and redemption), orc warband
**Story beats**: The choice (which way to go?), Boromir confronts Frodo (the Ring's corruption), Frodo puts on the Ring (Seat of Seeing — sees all of Middle-earth and the Eye), Frodo decides to go alone, Sam refuses to stay behind, Boromir's last stand, the two hobbits push off in a boat
**Signature mechanics**: Seat of Seeing vision (panoramic view of the full game world — every zone you've traversed), Ring temptation (Boromir boss encounter — non-lethal, he comes to his senses), the final choice (player agency moment), companion separation (party permanently splits — you leave with only Sam)
**Visual palette**: Green lawn, ancient flagstones, rowan trees on the hilltop. The vision from the Seat shows the whole world in miniature. Ends with grey water and the far shore ahead — open, uncertain, quiet.

---

## Character Roster by Chapter

| Chapter                  | Party Members                      | Major NPCs                      | Minor NPCs                                   |
| ------------------------ | ---------------------------------- | ------------------------------- | -------------------------------------------- |
| 1. The Shire             | Frodo, Sam, Merry, Pippin          | Gandalf, Bilbo                  | Gaffer, Lobelia, Lotho, Fatty, Rosie, Gildor |
| 2. Into the Wild         | Frodo, Sam, Merry, Pippin          | Tom Bombadil, Goldberry         | Farmer Maggot                                |
| 3. Ancient Terrors       | Frodo, Sam, Merry, Pippin          | Tom Bombadil (rescue)           | Barrow-wight                                 |
| 4. The Prancing Pony     | Frodo, Sam, Merry, Pippin, Aragorn | Butterbur, Bill Ferny           | Harry Goatleaf, Nob                          |
| 5. The Long Road         | Frodo, Sam, Merry, Pippin, Aragorn | Glorfindel, Nazgul              | —                                            |
| 6. Rivendell             | Frodo (+ Fellowship forms)         | Elrond, Bilbo, Gandalf, Boromir | Arwen, Gloin, Lindir, Erestor, Galdor        |
| 7. The Dark Below        | Full Fellowship                    | Balrog                          | Watcher, orcs                                |
| 8. Through the Mountains | Fellowship (minus Gandalf)         | Galadriel, Celeborn             | Haldir, Rumil, Orophin                       |
| 9. The Great River       | Fellowship (minus Gandalf)         | —                               | Orc archers                                  |
| 10. The Breaking         | Frodo, Sam (end)                   | Boromir                         | Orc warband                                  |

---

## Character Design Tiers

**Tier 1 — Full portrait, multi-conversation dialogue trees, unique sprite animations:**
Frodo, Sam, Gandalf, Aragorn, Bilbo, Merry, Pippin, Boromir, Galadriel, Tom Bombadil

**Tier 2 — Detailed sprite, 1-3 conversation sequences:**
Legolas, Gimli, Elrond, Goldberry, Glorfindel, Farmer Maggot, Butterbur, Celeborn, Arwen, Lobelia

**Tier 3 — Simple sprite, brief dialogue:**
Gaffer, Rosie, Fatty Bolger, Lotho, Nob, Harry Goatleaf, Bill Ferny, Gildor, Haldir, Lindir, Erestor, Galdor

---

## Zone Visual Identity

| Zone         | Dominant Colors                           | Tile Signature                           | Mood                    |
| ------------ | ----------------------------------------- | ---------------------------------------- | ----------------------- |
| The Shire    | Green, yellow, warm brown                 | Round doors, hedgerows, flowers          | Cozy, domestic          |
| Old Forest   | Dark green, brown, black                  | Gnarled trunks, dense canopy, roots      | Hostile, claustrophobic |
| Tom's House  | Gold, warm orange, green                  | Firelight, water-lilies, stone           | Safe, magical           |
| Barrow-downs | Grey-green, pale, fog-white               | Standing stones, green mounds            | Eerie, exposed          |
| Bree         | Brown stone, warm interior, dark exterior | Stone walls, thatched roofs, human scale | Crossroads, suspicion   |
| Wilderness   | Brown, grey, muted autumn                 | Bog, ruins, wind-swept hilltops          | Misery, endurance       |
| Rivendell    | Gold→silver→grey (seasonal)               | Waterfalls, carved stone, arches         | Peace, wisdom           |
| Moria        | Black, faint red, dust                    | Pillars, chasms, darkness                | Dread, awe              |
| Lothlórien   | Gold, silver, white, pale green           | Mallorn trunks, star-flowers, lamps      | Transcendent beauty     |
| Great River  | Grey, brown, muted green                  | Water, stone statues, flat banks         | Melancholy, vastness    |

---

## Signature Mechanics Summary

Each chapter introduces or emphasizes a distinct gameplay layer:

1. **Shire**: Exploration, dialogue, domestic charm
2. **Into the Wild**: Environmental misdirection (forest shifts paths)
3. **Ancient Terrors**: Visibility/fog, companion separation, dungeon
4. **Prancing Pony**: Social stealth, information gathering
5. **Long Road**: Survival/endurance, major combat, mounted escape
6. **Rivendell**: Rest hub, lore, party formation, time passage
7. **The Dark Below**: Darkness/light mechanic, dungeon crawl, boss fights, permanent party loss
8. **Through the Mountains**: Healing/restoration, vision sequences, Ring temptation
9. **Great River**: Navigation, stealth, tension building
10. **The Breaking**: Final choice, vision panorama, party split

---

## Shipping Philosophy

- Build one chapter at a time, polish it, ship it
- Each chapter is independently playable but connects forward
- Architecture from day one supports save/load across chapters
- Tileset and sprite system designed for extensibility (new zones = new tile palette + character configs)
- The Shire prototype is Chapter 1's seed — expand from there
- Optimize the build pipeline on Chapter 1 before scaling

---

## Source Material

- `lore/lotr_fellowship_places.md` — 25 environments with Tolkien's exact visual descriptions
- `lore/lotr_fellowship_characters.md` — 32+ named characters with physical descriptions, speech patterns, personality
- `idea.md` — Original game concept and references
