# Rivendell: adaptation notes

Source: J. R. R. Tolkien, _The Fellowship of the Ring_, the end of Book I chapter 12 (“Flight to the Ford”), and Book II chapters 1–3 (“Many Meetings,” “The Council of Elrond,” “The Ring Goes South”). Local reference extracts are in `lotr_fellowship_places.md` (the Ford, Rivendell) and `lotr_fellowship_characters.md` (Elrond, Arwen, Glóin, Boromir, Legolas, Gimli, Lindir, Erestor, Galdor). All dialogue is original paraphrase. The only phrases kept close to the text are short and iconic: “Isildur’s Bane”, “the Sword that was Broken”, “the Nine Walkers”, “I will take the Ring, though I do not know the way”, “Faithless is he that says farewell when the road darkens”, and the names (Imladris, Orodruin, Orthanc, Andúril). The Eärendil poem, the Rhyme of Rings and the Sindarin songs are summarised, never quoted.

## Beat list

The chapter begins from the end of the long road (`chapter5Complete`: Frodo across the Ford, the Nine on the western bank) and ends at the gate of Rivendell at dusk on 25 December, the Company of nine standing ready, with the road south “not yet playable”.

| #   | Beat (flag)                          | Zone             | Book anchor                                                                                                                                  |
| --- | ------------------------------------ | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `rv_flood` (`fordFlooded`)           | `bruinen`        | Bk I ch. 12: Frodo turns at the water, defies the Nine; the flood; the white horses; he is swept into dark.                                  |
| 2   | `rv_wake` (`rivendellWoke`)          | `rivendellroom`  | Bk II ch. 1: Frodo wakes on 24 October; Gandalf at the window; the splinter; the flood explained; Sam.                                       |
| 3   | `rv_feast` (`feastHeld`)             | `rivendellhall`  | Bk II ch. 1: the feast, Elrond’s table, Arwen, Glóin, Bilbo, Strider in his own array.                                                       |
| 4   | `rv_song` (`hallOfFire`)             | `rivendellhall`  | Bk II ch. 1: Bilbo dozing in the Hall of Fire; the song of Eärendil; Lindir; the peep at the Ring and the shadow between them.               |
| 5   | `rv_council1` (`councilOpened`)      | `rivendell`      | Bk II ch. 2: the morning of 25 October; the porch above the river; Elrond opens; Glóin’s embassy; the history of the Ring and Isildur.       |
| 6   | `rv_council2` (`councilTales`)       | `rivendell`      | Bk II ch. 2: Boromir’s dream; the Sword that was Broken; Bilbo and the Ring; Gandalf and Saruman; Legolas on Gollum.                         |
| 7   | `rv_council3` (`ringBearerChosen`)   | `rivendell`      | Bk II ch. 2: the debate (use it, hide it, send it over the Sea); Elrond’s judgement; the long silence; “I will take the Ring”; Sam.          |
| 8   | `rv_weeks` (`weeksPassed`)           | `rivendell`      | Bk II ch. 3: the scouts go out and return; the year turns to winter; Merry and Pippin; the company is chosen as the Nine.                    |
| 9   | `rv_gifts` (`giftsGiven`)            | `rivendellroom`  | Bk II ch. 3: Bilbo’s gifts of Sting and the mithril coat; his book; Narsil reforged.                                                         |
| 10  | `rv_company` (`chapter6Complete`)    | `rivendell`      | Bk II ch. 3: Elrond’s charge; Gimli’s “Faithless is he…”; the Company sets out at dusk on 25 December.                                       |

## Deliberate compression and reordering

- **Three zones for the Last Homely House.** The house is one exterior (`rivendell`: bridge, gardens, the east porch, the south gate), one room-wing (`rivendellroom`: Frodo’s chamber, the passage and Bilbo’s room) and one hall (`rivendellhall`: the dinner and, at its far end, the Hall of Fire). In the book the dinner hall and the Hall of Fire are separate rooms; here they are two ends of one hall so that a single interior can be lit, and the two beats still happen in the order the book gives.
- **The flood is shown from the near bank.** Frodo’s view in the book is of a “shining figure of white light” and small shadowy forms with flame. The game shows the rising river, white horses of foam and the Riders swept down the channel, ending in a white flash and a fade. Nothing is shown of Glorfindel, Strider or Gandalf at the water (the book has them arrive across the ford with fire as Frodo goes under). Elrond’s role is told afterwards by Gandalf, as in the book.
- **The Witch-king is not singled out.** The foremost of the Nine enters the water first; the game has no separate sprite for the captain.
- **Bilbo’s request for the Ring** happens in the book in Bilbo’s own room on a later day. The game keeps it at the hearth at the close of the evening so that the Hall of Fire beat ends on its most important moment: the shadow between the two hobbits, and Bilbo’s apology.
- **The Council is one scene in three parts.** The book’s Council runs through a long morning and an afternoon. Speeches are compressed to what each speaker contributes: Glóin (Dáin’s embassy, the messenger of Sauron, Balin and Moria), Elrond (the Last Alliance and Isildur’s fall), Boromir (the dream and Gondor’s war), Aragorn (the broken sword), Bilbo (the finding of the Ring, told briefly), Frodo (shows the Ring), Gandalf (Saruman, the Nine, Orthanc, his escape), Legolas (Gollum slipped his guards). Gandalf’s account of the Ring’s inscription (the Black Speech, read once) and the Ring’s heating in the fire is omitted. Mentions of Gil-galad and Elendil are limited to Elrond’s history. Galdor’s and Glorfindel’s speeches are folded into one short exchange of proposals (the Sea, Tom Bombadil, the Fire).
- **Tom Bombadil** is named by Erestor at the Council as a possible keeper and dismissed by Gandalf, as in the book. The player has already met him in chapters 2 and 3.
- **No dialogue choices.** The PRD offers “occasional choices”. The Council is a witnessed scene; the single player action is the prompt “Rise and speak” before Frodo says the words he says in the book. No choice alters any outcome.
- **Time passes by tint and talk.** The book gives two months (24 October to 25 December). The game shows the passing as a separate beat on the terrace and in the gardens: leaf-fall, snow motes and a silver light replace the autumn gold, the scouts return, and Elrond’s decision on the Nine is read. Nothing is lost by lingering at any time.
- **The scouts.** The book sends scouts to the four quarters and reports them back in December with the news that the Black Riders are scattered and the horses are gone from the land. The game gives them one conversation (Elrond and Gandalf) rather than a separate sequence.
- **Merry and Pippin.** In the book they are in Rivendell throughout. The game brings them in only at the weeks beat, where Pippin argues his case (to be sent along), and Elrond gives way on Gandalf’s counsel. This keeps the Council itself to its book attendance.
- **Narsil reforged.** The book places the reforging in Rivendell during the winter and names the sword Andúril on its presentation. The game has Elrond hand the blade over at the departure; the name is spoken once.
- **Bilbo’s gifts** (Sting; the mail-coat from the Lonely Mountain) are given in Bilbo’s own room, as in the book. They enter the inventory as story items and have no combat effect, because no chapter has a combat system. Bilbo’s book (the memoir) is mentioned, not shown.
- **The Company.** Elrond’s nine, in the order the book names them: Frodo and Sam; Merry and Pippin; Gandalf; Aragorn; Legolas; Gimli; Boromir. They stand together at the gate on 25 December; the departure itself and the road to Hollin belong to chapter seven. Bill the pony and the sending of Sam’s pony are not shown.
- **The Evenstar.** Arwen sits at the high table and says one line; Appendix scenes (the gift of her jewel, the Tale of Aragorn and Arwen) are not in the book’s main text and are not shown.
- **No combat, no stamina, no timer.** The wound is healed at the start of the chapter, so no “cure” mechanic is needed. The reference doc’s “rest hub, equipment, deep lore” list is met conservatively: the valley is freely explorable, every guest has a conversation that changes with the story, and two items are given. “Upgrades” are not built.

## Saves and recovery

The v1 save format is unchanged. A save from the end of chapter five (`bruinen`, entry `east`, `chapter5Complete`) continues into the chapter: Frodo stands on the east bank, and the Nine are on the western. Every beat completes only when its dialogue closes, and every tableau is rebuilt from flags:

- After the flood dialogue the game fades into the room; a reload in the gap finds `fordFlooded` and carries on to the room.
- `rv_wake` starts by itself when Frodo opens his eyes in the chamber; the checkpoint is the bed until it ends, then the passage.
- The Hall of Fire beat sets its checkpoint at the hearth; the Council’s three parts each end with the stable checkpoint `porch`.
- `weeksPassed` switches the outdoors to its winter sky for good.
- The departure leaves the checkpoint at the gate, `gate`, with the nine placed from the flag.
- Transient scenery (the flood’s white horses, the swept riders, the Ring’s shadow, the walkers entering) is never saved and is rebuilt only from the persistent flags.

## Decisions worth a second look

- Companions are not followers in Rivendell. Sam, Merry, Pippin and Strider are hidden from the follow trail from the Ford onward and appear as scripted actors in the scenes they belong to. This avoids a nine-strong follow chain on narrow floors.
- A single prompt, “Rise and speak”, is the whole of the chapter’s player input beyond walking and reading.
- Gifts are inventory entries only; the inventory overlay shows them with the rest of the errand goods.
