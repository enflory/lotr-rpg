# The Lord of the Rings RPG

A top-down pixel art RPG covering _The Fellowship of the Ring_, faithful to Tolkien's books. Game Boy / Link's Awakening aesthetic — all art and audio generated procedurally in code, with no external assets.

Play as Frodo Baggins from the round green door of Bag End to the breaking of the Fellowship at Parth Galen.

**Play it in the browser: https://lotr.lonelymtnlabs.com**

> Plays on a desktop keyboard or on a phone/tablet: touch devices get an on-screen thumb pad and buttons. Landscape gives the biggest view.

![Frodo, Sam, and Gandalf on the lane below Bag End](assets/screenshots/hobbiton.png)

| ![The Party Field, laid out for a hundred and forty-four guests](assets/screenshots/party-field.png) | ![Gandalf walking away down the Hill](assets/screenshots/gandalf-leaves.png) |
| :--------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------: |
|                                The Party Field, under the Party Tree                                 |                     Gandalf goes, and does not look back                     |

| ![The hall and parlour of Bag End](assets/screenshots/bagend.png) | ![Gildor's company feasting in the Woody End](assets/screenshots/woodyend.png) |
| :---------------------------------------------------------------: | :----------------------------------------------------------------------------: |
|                    Inside Bag End, by the fire                    |                   Gildor's company feasting in the Woody End                   |

| ![Bamfurlong farm in the Marish](assets/screenshots/marish.png) | ![Farmer Maggot's waggon on the causeway at night](assets/screenshots/waggon-ride.png) |
| :-------------------------------------------------------------: | :------------------------------------------------------------------------------------: |
|         Farmer Maggot's Bamfurlong, down in the Marish          |                    Maggot drives them to the Ferry through the fog                     |

|  ![Crickhollow's cottage, lawn and kitchen garden](assets/screenshots/crickhollow.png)   |            ![Captivity at Old Man Willow](assets/screenshots/willow.png)             |
| :--------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------: |
|                                The garden at Crickhollow                                 |                                    Old Man Willow                                    |
| ![The four hobbits in Tom and Goldberry’s house](assets/screenshots/tomhouse-supper.png) | ![Chalk paths and standing stones in the Barrow-downs](assets/screenshots/downs.png) |
|                                Tom and Goldberry’s house                                 |                                   The Barrow-downs                                   |

| ![Strider kneels by Gandalf's mark on Weathertop](assets/screenshots/long-road-weathertop.png) |   ![The Riders seen through the Ring](assets/screenshots/long-road-attack.png)   |
| :--------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------: |
|                                 The ruined ring on Weathertop                                  |                      The five Riders, seen through the Ring                      |
|  ![Three stone trolls in a glade of the Trollshaws](assets/screenshots/long-road-trolls.png)   | ![Asfaloth and the Nine at the Ford](assets/screenshots/long-road-ford-ride.png) |
|                               The stone trolls of the Trollshaws                               |                         The ride to the Ford of Bruinen                          |

|   ![The Nine swept away by white horses of foam at the Ford](assets/screenshots/rivendell-flood.png)   | ![Frodo wakes in the house of Elrond, Gandalf at the window](assets/screenshots/rivendell-wake.png) |
| :----------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------: |
|                                    The flood at the Ford of Bruinen                                    |                                    Waking in the house of Elrond                                    |
| ![The high table at the feast: Elrond, Arwen, Glóin and Bilbo](assets/screenshots/rivendell-feast.png) |    ![Bilbo reciting his song by the great hearth](assets/screenshots/rivendell-hall-of-fire.png)    |
|                                         The feast in the hall                                          |                                          The Hall of Fire                                           |
|    ![The Council of Elrond on the porch above the gorge](assets/screenshots/rivendell-council.png)     |          ![The Last Homely House and its gardens](assets/screenshots/rivendell-valley.png)          |
|                                         The Council of Elrond                                          |                                   The house and gardens in autumn                                   |
|     ![Rivendell in winter, snow falling over the garden](assets/screenshots/rivendell-winter.png)      |        ![The Company of nine at the southern gate](assets/screenshots/rivendell-company.png)        |
|                                        The turning of the year                                         |                                       The Company at the gate                                       |
|       ![Rise and speak, on a phone in portrait](assets/screenshots/rivendell-phone-portrait.png)       |   ![The Council prompt on a phone in landscape](assets/screenshots/rivendell-phone-landscape.png)   |
|                             "Rise and speak" with the thumb pad, portrait                              |                                    The same prompt in landscape                                     |

## Running Locally

```bash
npm install
npm run dev
```

Open the URL shown in your terminal.

| Key           | Touch          | Action                     |
| ------------- | -------------- | -------------------------- |
| Arrow keys    | Thumb pad      | Move                       |
| SPACE / ENTER | **A** button   | Talk / interact / advance  |
| I             | **I** button   | Inventory & errand overlay |
| Q             | **Q** button   | Recall current objective   |
| M             | **M** button   | Mute audio                 |
| ENTER / N     | Tap / NEW GAME | Continue / start over      |

The on-screen controls appear only on touch devices (a coarse pointer, or the
first touch on a hybrid laptop), so the desktop presentation is unchanged. In
portrait the game pins to the top of the screen and the pad takes the empty
band below it; in landscape the widgets float over the side letterboxes.

## Status

**Chapters 1–6** are playable from Bilbo's farewell party through Bree and the long road to the Ford of Bruinen, and on through the house of Elrond to the Company of nine at the gate of Rivendell. The published site updates when changes reach `main`.

Chapter 1 follows the Shire, the Black Rider, Gildor, Maggot, and the Brandywine ferry. Chapter 2 begins with an evening at Crickhollow: a secluded garden, hot baths, supper with all five hobbits, and the friends revealing their preparations. A night-to-morning cutscene brings the party back outside; Merry joins the travelling party, the tunnel opens beneath the High Hay, and the journey winds through the Bonfire Glade, a grassy knoll, misleading northern paths, deep hollows, and the Withywindle. Old Man Willow's capture and rescue use measured cutscene walking and continuous character animation, moving tree cracks, and player actions to help Sam, extinguish the fire, and reach for the prisoners. Tom skips ahead along the river after the rescue. His house guides one active cue at a time through supper with all six characters seated, two nights in bed with dimmed lights and dream vignettes, rainy tales, the Ring demonstration and farewell. The Ring returns to Frodo's pocket after the demonstration.

Chapter 3 opens with chalk paths, heather hollows and ancient stones to explore across the downs. Beyond the panoramic lookout, the hobbits rest beside a cold standing stone, wake together in mist, and become separated at the gate stones before Frodo is taken into the barrow. Frodo defends his friends and calls Tom; the four blades and recovered ponies carry the party to the East Road.

Chapter 4 follows Bree's western gate into the Prancing Pony: the common-room song and Ring accident, Strider's offer, Gandalf's delayed letter, Merry's return, decoy beds and a watch in the parlour. Morning reveals the damaged bedrooms and lost ponies. Butterbur helps acquire Bill; Sam's apple and departure east close the chapter. Six new maps bring the total to twenty-three. Strider and the pack pony travel with the hobbits, and Continue reconstructs every completed story checkpoint. [Bree adaptation notes](docs/lore/bree-adaptation.md) describe the book chronology and gameplay compression.

Chapter 5 leaves the Road with Strider and crosses the Midgewater Marshes (midges, haze, a night on a dry bank), then climbs Weathertop to the burnt ring on its crown and the flat stone scratched with Gandalf's mark. In the dell below, Strider tells the tale of Beren and Lúthien beside a small fire; the five Riders come, Frodo slips on the Ring, cries out to Elbereth and is stabbed, and Strider drives them off with brands. Athelas eases the wound on the long walk; the stone trolls of the Trollshaws make the hobbits laugh; Glorfindel rides in on Asfaloth and sets Frodo on the white horse for the ride to the Ford, with the Nine at his back. The chapter ends with Frodo across the water and the Nine on the far bank. Four new maps bring the total to twenty-seven. Continue returns to the camp, to the start of the ride, or to the eastern bank. There is no combat and no timer; the wound shows as a cold tint. [Long road adaptation notes](docs/lore/long-road-adaptation.md) describe the book chronology and gameplay compression.

Chapter 6 opens with Frodo's stand at the Ford: he turns on the far bank, the Nine ride into the water, and the river answers in a rush of white horses. He wakes in the Last Homely House with Gandalf at the window and Sam at the door, is led to the feast (Elrond, Arwen, Glóin, Bilbo, Strider in a lord's array), and sits in the Hall of Fire while Bilbo recites his song of Eärendil and asks to see the Ring. At dawn on the porch above the gorge the Council of Elrond meets in three parts (Glóin's embassy and the history of the Ring, Boromir's dream and the Sword that was Broken, Gandalf's tale of Saruman and the debate that ends in silence); the player's only act is "Rise and speak": _I will take the Ring, though I do not know the way_. The weeks pass into winter, Merry and Pippin win their place, Bilbo gives Sting and the mithril coat, and on the evening of 25 December the nine walkers stand at the southern gate. Three new maps (twelve new guests, eleven new tiles, four songs) bring the total to thirty. Continue works from the end of chapter five and at every checkpoint on the way. There is still no combat, stamina or timer. [Rivendell adaptation notes](docs/lore/rivendell-adaptation.md) record what was compressed. The road south (Hollin and the Misty Mountains) is not yet playable.

The new chapters use original paraphrased dialogue and procedural art/music. [Adaptation notes](docs/lore/old-forest-adaptation.md) distinguish book chronology from gameplay compression. Five animated ponies follow the hobbits from Crickhollow through the forest, wait outside Tom’s house, and follow again until the company becomes separated at the gate stones on the downs. The four hobbits use the existing walking controls. Forest paths are deliberately winding and fixed, with optional places to inspect. Gold glints mark interactions; nearby prompts name the action.

Continue checkpoints preserve completed conversations, encounters, and both nights at the house, including older v1 saves. The `I` overlay pauses walking, and `Q` recalls the current objective.

On top of the main story sits an exploration layer: book-anchored side-errands (Lobelia's spoons, the Gaffer's half-pint, Gandalf's fireworks crates, Maggot's dogs) and two collectible tallies — mathoms and mushrooms — tracked in the `I`-key inventory overlay, with a soft nod from Merry for completionists who cross to Buckland with everything done.

The full game is planned as 10 chapters covering all of _Fellowship_. See `docs/PRD.md` for product requirements, `docs/game-reference.md` for the chapter breakdown, and `CHANGELOG.md` for release history.

## Development

```bash
npm run dev         # Vite dev server with HMR
npm run build       # production build → dist/
npm run preview     # preview the build
npm test            # Vitest unit suite
npm run test:watch  # unit tests in watch mode
npm run test:e2e    # Playwright smoke tests (boots the real game)
npm run lint        # ESLint
npm run typecheck   # tsc over the JSDoc data-layer contracts
npm run format      # Prettier (zone maps & pixel art are exempt)
npm run og-image    # re-render public/og-image.png, the link-preview card
```

- **Unit tests** (`tests/`) cover dialogue staging, zone map integrity (every door, exit, sign, and NPC cross-checked against what it references), the tile registry, the procedural art helpers, and the scripted set pieces (the Black Rider, the fox of the Woody End, Maggot's dogs).
- **Smoke tests** (`e2e/`) drive the actual game in a browser through the `window.__game` / `window.__state` QA hooks.
- **Art QA**: the dev server serves `art-test.html`, which renders the full tileset and every character spritesheet at high zoom.
- CI runs lint, typecheck, format check, unit tests, build, and e2e on pull requests and pushes to `main`.

## Tech

- [Phaser 3](https://phaser.io/) game engine
- [Vite](https://vite.dev/) build tool, [Vitest](https://vitest.dev/) + [Playwright](https://playwright.dev/) for tests
- All pixel art (tiles and character sprites) generated at runtime via Canvas 2D
- All music and SFX synthesized at runtime via WebAudio
- 320×240 gameplay view on a 960×720 canvas (3× camera zoom keeps the pixels chunky while text renders crisply), 16×16 tiles, scaled to fit the browser

## License

Code is [ISC licensed](LICENSE). This is an unofficial, non-commercial fan project, not affiliated with or endorsed by the Tolkien Estate or any rights holder of J.R.R. Tolkien's works.
