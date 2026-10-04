# The Long Road: adaptation notes

Source: J. R. R. Tolkien, _The Fellowship of the Ring_, Book I, chapter 11, “A Knife in the Dark,” and chapter 12, “Flight to the Ford.” Local reference extracts are in `lotr_fellowship_places.md` (Midgewater, Weathertop, the Trollshaws, the Ford) and `lotr_fellowship_characters.md` (Glorfindel, the Nazgûl). All dialogue is original paraphrase; the tale of Tinúviel and Sam's troll rhyme are summarised, never quoted. Only short iconic phrases appear: “O Elbereth! Gilthoniel!”, “Mae govannen”, “Noro lim, Asfaloth”, and the names neekerbreekers, athelas and kingsfoil.

## Beat list

| #   | Beat (flag)                                | Book anchor                                                                                                       |
| --- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| 1   | `road_marsh` (`marshEntered`)              | Ch. 11: Strider leaves the Road and leads the hobbits into the Midgewater Marshes.                                |
| 2   | `road_midges` (`midgesEndured`)            | Ch. 11: the bites, the neekerbreekers, two sleepless nights; Strider promises the hills.                          |
| 3   | `road_hill` (`hillSighted`)                | Ch. 11: the Weather Hills and Weathertop; Strider's doubt that it is safe and his judgement that it is useful.    |
| 4   | `road_rune` (`runeRead`)                   | Ch. 11: the burnt ring of Amon Sûl, Gandalf's scratched mark (a G and three strokes), the empty view.             |
| 5   | `road_fire` (`fireTale`)                   | Ch. 11: the dell, a small fire, Strider's tale of Beren and Lúthien.                                              |
| 6   | `road_attack` (`wraithsCame`)              | Ch. 11: the five Riders; Frodo puts on the Ring and sees them; “O Elbereth!”; the stab at the nearest one's foot. |
| 7   | `road_wound` (`frodoWounded`)              | Ch. 11: Strider's brands, the knife that melts, the sliver in the wound, the need to reach Elrond.                |
| 8   | `road_athelas` (`athelasFound`)            | Ch. 12: kingsfoil on the roadside; Strider's hot-water dressing; his small skill.                                 |
| 9   | `road_trolls` (`trollsSeen`)               | Ch. 12: the three stone trolls in the glade; Sam's rhyme; the hobbits laugh.                                      |
| 10  | `road_glorfindel` (`glorfindelMet`)        | Ch. 12: hoofbeats, the white horse, Glorfindel's greeting, his warning of Riders before and behind.               |
| 11  | `road_ford` (`chapter5Complete`)           | Ch. 12: Frodo set on Asfaloth, the Nine chasing, the crossing, Frodo turning on the far bank.                     |

The chapter begins from the end of Bree (`chapter4Complete`) and ends with Frodo across the water and the Nine gathered on the western bank. The flood of the Bruinen, Frodo's words at the water, his healing and Rivendell belong to the next chapter, which is now playable (see `rivendell-adaptation.md`). `docs/game-reference.md` places “Flood at the Ford” in chapter six, and the game honours that.

## Deliberate compression and reordering

- **Geography is diagrammatic.** Midgewater is one marsh map, Weathertop one hill with its ring on the crown, the dell on its flank and two exits; the Trollshaws one wood with the Last Bridge (over the Hoarwell) in the middle; the Ford one bank-to-bank map. The days of walking between them are not shown. The book puts the dell on the western flank of the hill; the map puts it on the eastern slope, which is where the route leaves. The road from Bree to Weathertop is reduced to the marsh.
- **Strider's scouting is offstage.** In the book he is away from the fire during the attack. The game has him climb to the dell's rim at the start of the scene and return with the brands at the end, so that the party is not left unguarded without explanation.
- **Gil-galad is omitted.** Sam's request for an elf-tale first draws a fragment about Gil-galad in the book; the game goes straight to the tale of Beren and Lúthien, which is what the chapter summary in `docs/game-reference.md` names.
- **The Riders at Weathertop.** The hobbits fall on their faces and Frodo alone acts, as in the book. Through the Ring they are pale, grey-robed and helmed; the tallest is crowned. Unseen they are black cloaks. There is no combat system: the two prompts (“Slip on the Ring”, “Strike and cry out”) are story beats, and the Ring is a transient tableau, never a power the player can use.
- **The wound is a cue, not a timer.** `docs/game-reference.md` lists a wound mechanic as a ticking clock. The book has Frodo grow steadily worse, but no deadline is written on the page, and a timer would punish the exploration-first loop. The game shows the wound as a pale cold tint that deepens after Weathertop and eases (but does not clear) once the athelas is used. Nothing is lost by lingering.
- **No endurance system.** Midgewater's misery is carried by the haze, the midges and the dialogue, not by a stamina meter. The same applies to the long march in the Trollshaws.
- **Athelas.** The book has Strider find kingsfoil some days after Weathertop and use it more than once on the way. The game shows it once, on the roadside before the Last Bridge.
- **One wood for the Hoarwell Road and the Trollshaws.** The Hoarwell and the Last Bridge are at the western edge of the map; the stone trolls lie east of the bridge and Glorfindel meets the party further along the Road, as in the book. The Trollshaws proper begin east of the river; the one map carries the name for both halves. Glorfindel rides in from the east rather than from behind so the player sees him arrive. The green beryl Strider finds at the Bridge is omitted.
- **Glorfindel stays with the company in the book** and Frodo rides Asfaloth for a day or more before the Ford; the game has him set Frodo on the horse and skips straight to the ride. Riders also spring out of the trees ahead in the book; the game shows the pursuit from behind only. Strider's naming of Gandalf's part in the trolls' fate is drawn from Bilbo's tale, which the hobbits know.
- **Midgewater takes two nights in the book;** the game shows one night and one dawn, and Strider says the marsh ends in a day or two.
- **Bill the pony** follows the company as in earlier chapters, through the marsh, up the hill and into the Trollshaws. He is not shown at the Ford; in the book he stays with the company, and the game simply leaves the company out of sight until the next chapter.
- **The ride is one continuous scripted run**, not a player-controlled chase. Nine Riders chase Frodo along a straight road to the water; they stop at the edge as he crosses. The sprites are the established black horse-and-rider sheet; Asfaloth and Glorfindel are new.
- **The Nine are not all seen at the Ford in the book until they enter the water.** The game shows nine waiting on the bank once the ride is done, which is the chapter's last image.

## Saves and recovery

The v1 save format is unchanged. A save from the end of Bree (breeroad, `chapter4Complete`) continues into the marsh, and the earlier `west` spawn on the Bree road still works. Each beat completes only when its dialogue closes. Every tableau (night, wraiths, brands, the steed, the riders) is transient and is rebuilt from flags:

- After the fire-side tale the party's checkpoint is the dell (`entryKey = 'dell'`), so Continue returns to the camp.
- The wound begins by itself when the stabbing ends. If the game is closed between the two, Continue starts the wound again.
- A reload in the middle of the ride restores Frodo, Glorfindel and the white horse at the start of the Ford; the ride replays from its first page.
- After the ride the checkpoint is `east`, so Continue puts Frodo on the eastern bank with the nine riders on the western, and the companions (who are not with him at this moment in the book) are out of sight until the next chapter gathers the company.

## Decisions worth a second look

- Frodo's mounted sprite is small beside the white horse. It is a deliberate scale for a hobbit on a great horse.
- The ring prompt is deliberately short (“Slip on the Ring”). It is a player-triggered beat in the spirit of Bree's “Interrupt Pippin”; the Ring is not something the player may use again.
