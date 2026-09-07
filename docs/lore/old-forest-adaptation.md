# Beyond the Hedge: adaptation notes

The chapter dialogues are original paraphrases of events in J. R. R. Tolkien's *The Fellowship of the Ring*, Book I, chapters 5–8. They reproduce neither the walking songs nor Tom's summoning poem. Names and places identify their source; the game does not present its new dialogue as a quotation from Tolkien.

## Source anchors

- **Chapter 5, “A Conspiracy Unmasked”:** the friends reveal their knowledge of Frodo's departure; Fredegar stays at Crickhollow; Merry accompanies the travellers and their ponies. The playable opening compresses the previous evening's discussion into a dawn farewell.
- **Chapter 6, “The Old Forest”:** tunnel and gate beneath the High Hay; Bonfire Glade and its remembered burning; hilltop outlook; frustrated northern route and descending hollows; Withywindle; Willow's sleep, Sam pulling Frodo from the water, Merry and Pippin imprisoned; the failed fire; Frodo running for help; Tom carrying lilies and freeing the prisoners through song.
- **Chapter 7, “In the House of Tom Bombadil”:** Goldberry and the lilies, supper, first sleep, rainy storytelling, the Ring demonstration, and second sleep. Frodo's tower/prisoner dream belongs to the **first** night. The vision of a green country beyond a grey veil belongs to the **second**. This deliberately corrects the compressed, conflated dream account in the existing local places survey. The dialogue does not explain Tom's nature or imply that the Ring is harmless outside his presence.
- **Chapter 8, “Fog on the Barrow-downs”:** Tom teaches a summoning verse before departure; Goldberry waves from the hill; midday sleep by a cold standing stone precedes the fog; separation precedes capture. Frodo sees his companions, rejects escape by the Ring, and strikes the crawling hand with a sword found in the barrow **before** calling Tom. Rescue precedes the four blades, recovered ponies and farewell at the East Road. Merry's remembered death is optional rather than a required exposition stop.

The existing `lotr_fellowship_places.md` and `lotr_fellowship_characters.md` inform atmosphere and characterization, but are secondary project summaries. Chapter-level anchors above take precedence where their compressed chronology is ambiguous. No page numbers are given because editions differ.

## Playable compression

Paths are fixed, legible routes. Their turns and inspectable landmarks suggest the forest's pressure without randomizing navigation or requiring every optional observation. The travelling group includes ponies in the prose and at rest points; walking is the control abstraction. The five named pack/riding ponies are distinguished from the four hobbits and from Tom's Fatty Lumpkin.

Danger advances through ordinary interactions without a reflex test. Dialogue effects represent completed story beats and can be restored from saved flags. Willow proceeds through sleep, attempted fire, seeking help, then Tom's rescue. The actual party sprites walk into the shade, slip into the cracks, and emerge again. Player-paced actions help Sam pull Frodo clear, kindle and extinguish the fire, call for help, and reach for the prisoners while Tom commands the tree. These actions have no timing window or failure penalty; animation finishes before the next dialogue beat can begin. The house preserves both nights and the intervening rainy day. The barrow preserves Frodo's choice before the rescue. Neither danger is an invented combat quest.

The summoning verse is a memory represented by `tom_song`, not a transcription of the poem or an expendable spell. Four blades are represented by one inventory set, `barrow_blades`, distributed in the prose among all four companions. Completion flags prevent repeated grants. Narrative prerequisites also prevent speaking to a later landmark from skipping its preceding beat.

Mandatory interactions use short sequences of two or three pages where possible; optional landmarks carry texture separately. Each page has at most three lines. Tom's dialogue uses energetic plain speech rather than imitating Tolkien's metrical songs. Goldberry's presence is expressed through water, light and hospitality without inventing a definite explanation of her nature.

The East Road is the explicit stopping point. Bree and the Prancing Pony are a destination and advice, not a promised playable entrance in this release.
