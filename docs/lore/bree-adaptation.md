# Bree adaptation notes

Source: J. R. R. Tolkien, _The Fellowship of the Ring_, Book I, chapters 9, “At the Sign of the Prancing Pony”; 10, “Strider”; and the opening of 11, “A Knife in the Dark”. Local reference extracts are in `lotr_fellowship_places.md` (Bree) and `lotr_fellowship_characters.md` (Harry, Butterbur, Nob, Ferny, Aragorn). All new dialogue and music are original paraphrases or compositions.

## Preserved sequence

The four hobbits enter through the western gate under Frodo's alias. Butterbur escorts all four to a private supper before inviting them into the common room. Merry stays behind and cautions his friends; Pippin suggests he stay indoors. Frodo presents his interest in hobbit history, while Pippin entertains a gathering. Strider warns Frodo about Pippin's account of Bilbo's birthday. Frodo interrupts with an awkward speech; the company asks for a song. During the encore he dances, falls and vanishes. Ferny, the southerner and Harry slip out while Frodo is invisible. Frodo removes the Ring near Strider, hears his request for a private talk, and gives the remaining company an unconvincing explanation.

Strider offers help in private; Butterbur remembers Gandalf's delayed letter; Aragorn identifies himself and shows the broken sword. Nob brings Merry back, and Merry tells of the Black Breath. Bolsters and woollen mats make decoys; the party spends the night in the parlour. Damaged rooms and the missing ponies are discovered in the morning. Butterbur pays Ferny's inflated twelve pennies and makes restitution. Sam befriends Bill and throws an apple at Ferny on departure.

The ordering of supper, Merry's decision, Pippin's audience, Frodo's speech, the requested song and the spies' departure was also cross-checked against the [chapter synopsis](https://tolkiengateway.net/wiki/At_the_Sign_of_the_Prancing_Pony). The novel remains the source; this is a secondary continuity aid.

The chapter ends on the road beyond Bree. Midgewater, Weathertop, the Morgul wound and Glorfindel belong to the next chapter.

## Deliberate compression

- Bree is a navigable street with hillside houses, crossroads, a gate, an inn and a stable yard, not a literal map of the hundred-house village. The inn's arch/frontage is the entrance; its private parlour and north-wing rooms are separate maps. The stable yard is an inspection point rather than another interior.
- The common room's Men, hobbits and dwarf stand for a larger company. Their optional remarks supply atmosphere without inventing named quests or alternative plot outcomes.
- The song is described rather than reproducing Tolkien's lyrics. The letter's message and identity test are paraphrased. The broken blade stays visible while the player considers Strider's identity; it is not Andúril.
- Merry's excursion remains outside Frodo's viewpoint. His return is animated and his account is dialogue. The attackers are never shown. Slashed bolsters are evidence discovered at dawn, not a movie-style combat scene or a claim that a particular intruder was seen.
- Bill's purchase is a story event, with no invented money grind. The pony follows on walkable routes as a pack animal. Strider becomes the fourth visible follower after the purchase, although trust is established earlier in the parlour.
- The apple throw is staged at a hedge on the road out. This compresses Ferny's roadside house and the purchase location into two adjoining village views.

## Checkpoints and input

Every milestone completes only when its conversation closes. Continue retries interrupted choreography. The welcome, supper and gathering move the actual party sprites along walkable routes. Pippin remains visibly with his audience after the gathering and across Continue. Merry is visible through supper, then waits in the parlour until his off-screen excursion. The song pauses for the player's action to interrupt Pippin; the crowd recoils and the spies leave during the disappearance. The Ring is transient and never becomes an equippable ability. The watch advances from night to dawn without a real-time wait. Existing keyboard and touch actions drive the same scenes. No combat system, health penalty, failing social-stealth meter or invented Ring power is added.

Saves made before the supper scenes were added can join supper after Butterbur's welcome. Saves already past the Ring accident skip the new earlier milestones, preserving completed progress without changing the v1 format.

The later scenes use the same actual sprites and collision-aware routes: Butterbur enters through the door and hands Frodo a folded letter; Nob brings a pale Merry through the doorway; the player helps Nob lay four decoy beds. The hobbits lie down on mats while Strider watches the parlour door, then rise at dawn. Broken windows and scattered bedding appear only in the morning. Butterbur visibly pays Ferny, Sam approaches Bill, and the player loads the pony's packs before the company walks east. Sam's apple is a player-triggered action. These actions stage the book's events without adding a combat encounter or an alternative story branch.

On release, the cast walks into the same spacing used by normal following, so completing dialogue does not snap companions into place. Continue reconstructs completed milestones, including the letter's absence, Nob's waiting position, the decoys, and Bill's packs. An interrupted letter reading or night scene restarts from its last completed conversation. Regression tests sample the visible cast each frame and exercise these recovery paths.

## Visual scale and character treatment

The private parlour is 18×15 tiles, compared with the 30×23 common room. Its smaller floor plan keeps supper, the letter, Merry's return and the night watch around one table and one hearth. All entrances, scene positions and Continue checkpoints use the same compact layout.

The human sprites have separate front, profile and rear heads with readable eyes and hair. Butterbur follows the book's bald crown, red face, broad apron and short build; Strider has dark hair with grey highlights, grey eyes and a worn green cloak. Harry's hairstyle is an art choice because the text does not describe it. The village uses timber-and-plaster facades, complete shingled roofs, smaller irregular paving and worn approaches to the south-facing doors; scenery footprints remain solid in the navigation map.
