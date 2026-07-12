// NPC dialogues — drawn from or closely paraphrasing The Lord of the Rings.
//
// Each entry is either { name, lines } (always the same) or
// { name, stages: [...] } where the FIRST stage whose `when(flags, count)` is
// true (or that has no `when`) is shown. `count(itemKey)` reports how many
// of an item the player is carrying. A stage may carry effects that
// fire when its dialogue finishes:
//   set:       flag name (or array) to set
//   objective: new objective banner text
//   join:      character key that becomes the player's follower
//   give:      item key granted to the player
//   take:      item key removed from the player

/** @type {Record<string, import('./types.js').Dialogue>} */
export const DIALOGUES = {
  bilbo: {
    name: 'Bilbo',
    stages: [
      {
        when: (f) => !f.bilboFarewell,
        lines: [
          'My dear Bagginses and\nBoffins, Tooks and\nBrandybucks!',
          'Today is my one hundred\nand eleventh birthday:\nI am eleventy-one today!',
          'I hope you are all enjoying\nyourselves as much as I am.',
          'I regret to announce that\nthis is the END.',
          'I am going. I am leaving\nNOW. GOOD-BYE!',
        ],
        set: 'bilboFarewell',
      },
      { lines: ['...'] },
    ],
  },

  gandalf: {
    name: 'Gandalf',
    stages: [
      {
        when: (f, count) => !f.prologueDone && count('firework_crate') >= 3,
        lines: ['Every squib and cracker\naccounted for! This will\nbe a night to remember.'],
      },
      {
        when: (f) => !f.prologueDone,
        lines: [
          'Ah, Frodo my boy! A fine\nnight for fireworks, and\nfiner ones you never saw.',
          'Keep an eye on your uncle\nat his speech. I fancy he\nhas a surprise in store.',
          'But see here -- three of\nmy crates went astray in\nthe field. Fetch them, eh?',
        ],
        set: 'cratesAsked',
      },
      {
        when: (f) => !f.metGandalf,
        lines: [
          'My dear Frodo! Good to see\nyou again at last.',
          'I have been away a long\ntime... but I have learned\nmuch.',
          'This ring you carry... it is\nthe One Ring. Made by the\nDark Lord Sauron himself.',
          'It must not stay in the\nShire. You must leave,\nand you must leave soon.',
          'Keep it secret.\nKeep it safe!',
          'And Frodo -- do not go\nalone. Young Samwise is\nin the garden. Fetch him.',
        ],
        set: 'metGandalf',
        objective: 'Find Sam in his garden',
      },
      {
        when: (f) => !f.samJoined,
        lines: ['Samwise is in the garden --\nor under the window, more\nlike. Go and fetch him.'],
      },
      {
        when: (f, count) => count('mathom') >= 6 && !f.mathomsPraised,
        lines: [
          "Six of Bilbo's old mathoms!\nThe museum at Michel Delving\nnever held a finer haul.",
        ],
        set: 'mathomsPraised',
      },
      {
        lines: [
          'Make for Bucklebury by way\nof the Woody End. Take the\nEast Road out of Hobbiton.',
          'And remember: do not use\nthe Ring! The Enemy has\nmany spies in the Shire.',
          'I must see Saruman, head\nof my order. I will meet\nyou in Bree if I can.',
        ],
      },
    ],
  },

  sam: {
    name: 'Samwise',
    stages: [
      {
        when: (f) => !f.metGandalf,
        lines: [
          "I ain't been dropping no\neaves, Mr. Frodo, honest!",
          'I was just trimming the\ngrass border, if you\nfollow me.',
          "Elves, Mr. Frodo! I'd\ndearly love to see them.",
        ],
      },
      {
        when: (f) => !f.samJoined,
        lines: [
          "Mr. Frodo! I heard it all --\nthe Ring, the Enemy, all\nof it. I couldn't help it!",
          "Please, Mr. Frodo, don't\nhurt me. And don't turn me\nout, not now.",
          "'Don't you leave him,\nSamwise Gamgee,' Gandalf\nsaid. And I don't mean to!",
          "I'm coming with you,\nMr. Frodo. Off to see\nElves and all!",
        ],
        set: 'samJoined',
        join: 'sam',
        objective: 'Leave by the East Road, east of Hobbiton',
      },
      {
        lines: ['Ready when you are,\nMr. Frodo. The East Road\nis east, past the inn turn.'],
      },
    ],
  },

  gaffer: {
    name: 'The Gaffer',
    stages: [
      {
        when: (f) => !f.prologueDone,
        lines: [
          "A very nice well-spoken\ngentlehobbit is Mr. Bilbo,\nas I've always said.",
          'Free beer and a feast for\nall comers! That IS a\nbirthday party, that is.',
        ],
      },
      {
        when: (f) => f.halfPintTaken && !f.halfPintDelivered,
        lines: [
          "Ah! Rosie Cotton's a\ntreasure. Mind you tell\nher I said so.",
          "A drop of the Dragon's\nbest. That'll see the\ngarden dug, that will.",
        ],
        set: 'halfPintDelivered',
        take: 'ale_mug',
      },
      {
        when: (f) => !f.samJoined,
        lines: [
          'Elves and Dragons! Cabbages\nand potatoes are better for\nme and you.',
          "Don't go getting mixed up\nin the business of your\nbetters, Samwise.",
          'Mr. Bilbo has taught him\nhis letters -- meaning no\nharm, mark you.',
        ],
      },
      {
        lines: [
          "So you're taking my Sam\noff on some mad errand,\nMr. Frodo?",
          'Well... look after him.\nAnd see he looks after\nyou, more like.',
        ],
      },
    ],
  },

  lobelia: {
    name: 'Lobelia',
    stages: [
      {
        when: (f) => f.foundSpoons && !f.gaveSpoons,
        lines: [
          'My spoons! I KNEW Bilbo\nhad them. Well -- at least\nsomeone remembers what is owed.',
          "Hand them over, then.\nDon't dawdle, Frodo Baggins.",
        ],
        set: 'gaveSpoons',
        take: 'silver_spoons',
      },
      {
        lines: [
          'Frodo Baggins! I suppose\nyou think you own\nBag End now?',
          "Bilbo should never have\nleft it to you. It's\na Sackville-Baggins home!",
          'I shall be watching you,\nFrodo Baggins. Mark my\nwords!',
        ],
      },
    ],
  },

  rosie: {
    name: 'Rosie Cotton',
    stages: [
      {
        when: (f) => !f.prologueDone,
        lines: [
          "Isn't it grand? Songs and\ndancing and fireworks\nover the Party Tree!",
          'A hundred and eleven years\nold, and still the best\nparties in the Shire.',
        ],
      },
      {
        when: (f) => f.prologueDone && !f.halfPintTaken,
        lines: [
          'Good morning, Mr. Frodo!\nThe ale is fresh from the cask.',
          "Would you run a half-pint\ndown to the Gaffer? He's\ntoo proud to come ask.",
        ],
        set: 'halfPintTaken',
        give: 'ale_mug',
      },
      {
        when: (f) => !f.samJoined,
        lines: [
          'Good morning, Mr. Frodo!\nWhat can I get you? The\nale is fresh from the cask.',
          "Sam's been tending your\ngarden again. He does\nwork hard at it.",
        ],
      },
      {
        lines: [
          'Off somewhere, are you?\nWith Sam Gamgee too, I\nhear. Well I never.',
          'You bring him back safe,\nMr. Frodo. Mind you do.',
        ],
      },
    ],
  },

  ted: {
    name: 'Ted Sandyman',
    stages: [
      {
        when: (f) => !f.prologueDone,
        lines: [
          "Mad Baggins and his\nfireworks! Still, I'll not\nsay no to free ale.",
          'A hundred and eleven?\nUnnatural, if you ask me.',
        ],
      },
      {
        lines: [
          'Queer things you do hear\nthese days, to be sure.',
          "Tree-men, giants beyond\nthe North Moors? Half of\nit's your cousin Hal's tales.",
          "There's only one Dragon in\nBywater, and that's Green!\nHa ha!",
        ],
      },
    ],
  },

  sandyman: {
    name: 'Sandyman the Miller',
    stages: [
      {
        when: (f) => !f.prologueDone,
        lines: [
          'All this party crowd\nwanting flour for seed-cakes\nand honey-cakes besides!',
          "I'll be grinding till\nmidnight, mark my words.",
        ],
      },
      {
        lines: [
          'Queer folk you and your\nuncle draw to Hobbiton,\nMr. Baggins.',
          "Walking trees now, is it?\nSounds like your cousin\nHal's tall tales to me.",
        ],
      },
    ],
  },

  noakes: {
    name: 'Old Noakes',
    stages: [
      {
        when: (f) => !f.prologueDone,
        lines: [
          'A very nice well-spoken\ngentlehobbit, Mr. Bilbo --\nbut queer, mark you.',
          "All that Baggins gold is\nburied in tunnels up at\nBag End, I'll be bound.",
        ],
      },
      {
        lines: ["They fool about with boats\non that big river -- and\nthat isn't natural!"],
      },
    ],
  },

  twofoot: {
    name: 'Daddy Twofoot',
    stages: [
      {
        when: (f) => !f.prologueDone,
        lines: [
          "I'm his next-door neighbour,\nyou know, so I ought to know.",
          'The Gaffer and I have been\nsaying it for years:\nstrange doings at Bag End.',
        ],
      },
      {
        lines: ['Walking trees, giants beyond\nthe North Moors -- queer\nfolk, this Baggins lot.'],
      },
    ],
  },

  gildor: {
    name: 'Gildor',
    stages: [
      {
        when: (f) => !f.metGildor,
        lines: [
          'Hail, Frodo! We are Elves\nof the House of Finrod.\nI am Gildor Inglorion.',
          'That black horseman hunts\nyou. He is a servant of\nthe Enemy. Do not meet him!',
          'The Shire is no longer any\nprotection to you. Make for\nBucklebury Ferry, and swiftly.',
          'The road runs east, down\ninto the Marish. Farmer\nMaggot dwells there -- a\nstout friend in need.',
          'Be brave, Frodo son of\nDrogo. Elves shall watch\nyour road where they may.',
        ],
        set: 'metGildor',
        objective: 'Make for Bucklebury Ferry, through the Marish',
      },
      {
        lines: ['The stars will be out soon.\nGo east, and take our good\nwishes with you.'],
      },
    ],
  },

  elf_a: {
    name: "Elf of Gildor's Company",
    lines: [
      'We are Exiles. Most of our\nkindred departed long ago,\nand we too tarry but a while.',
      'West, ever west, our hearts\ncall us -- to the Havens,\nand the Sea beyond.',
    ],
  },

  elf_b: {
    name: "Elf of Gildor's Company",
    lines: [
      'Snow-white! Snow-white!\nO Lady clear! O Queen\nbeyond the Western Seas!',
      'We sing to Elbereth\nGilthoniel, who kindled\nthe stars. Be at peace.',
    ],
  },

  elf_c: {
    name: "Elf of Gildor's Company",
    lines: [
      'Eat, and be merry! Even the\nwandering Companies of the\nEldar keep a good table.',
      'You walk in luck tonight,\nMaster Baggins. Few mortals\nsup with the Fair Folk.',
    ],
  },

  elf_feast: {
    name: 'The Feast',
    stages: [
      {
        when: (f) => f.metGildor && !f.tookProvisions,
        lines: [
          'Bread surpassing white\nloaves, fruits sweet as\nwildberries -- laid for guests.',
          "Gildor's folk have set\naside a share for your\nroad tomorrow.",
        ],
        set: 'tookProvisions',
        give: 'elven_provisions',
      },
      { lines: ['A hall of living trees,\nand a table set\nunder the stars.'] },
    ],
  },

  sign_greendragon: {
    name: 'Sign',
    lines: ['THE GREEN DRAGON INN\n~ Fine Ales & Good Company ~'],
  },

  examine_casks: {
    name: 'Ale Casks',
    lines: ['Rows of casks from the\nCotton farm. The Dragon\nnever runs dry.'],
  },

  examine_shelf_gd: {
    name: 'Shelf',
    lines: ['Pewter tankards, and a\ndusty fiddle nobody has\nplayed since last Yule.'],
  },

  sign_bagend: {
    name: 'Sign',
    lines: ['BAG END\n~ No Admittance\n  Except on Party Business ~'],
  },

  examine_desk: {
    name: "Bilbo's Desk",
    lines: ['On the desk, the unfinished\npages of THERE AND BACK\nAGAIN. The ink is long dry.'],
  },

  examine_books: {
    name: 'Bookshelf',
    lines: ['Maps of distant lands,\nannotated in a thin,\nspidery hand.'],
  },

  examine_fireplace: {
    name: 'Hearth',
    lines: ['This is where the letters\nof fire were revealed.\nThe grate is cold now.'],
  },

  examine_chest: {
    name: 'Old Chest',
    stages: [
      {
        when: (f) => f.metGandalf && !f.foundSpoons,
        lines: [
          'Under old party invitations:\na case of silver spoons.',
          "The label reads: 'For\nLOBELIA, as a PRESENT.'\nBilbo's little joke.",
        ],
        set: 'foundSpoons',
        give: 'silver_spoons',
      },
      { lines: ['Old invitations, older\nmothballs. Nothing else\nof note.'] },
    ],
  },

  sign_bywater: {
    name: 'Sign',
    lines: ['BYWATER\nHobbiton 1 mile north'],
  },

  sign_mill: {
    name: 'Sign',
    lines: ["SANDYMAN'S MILL\n~ Bywater ~"],
  },

  sign_ivybush: {
    name: 'Sign',
    lines: ['THE IVY BUSH\n~ on the Bywater Road ~'],
  },

  door_locked: {
    name: 'Door',
    lines: ['The round door is shut\nfast. Nobody seems to\nbe at home.'],
  },

  sign_ferry: {
    name: 'Sign',
    lines: ['BUCKLEBURY FERRY\n~ across the Brandywine ~'],
  },

  sign_buckland: {
    name: 'Sign',
    lines: [
      'BUCKLAND\n~ Crickhollow lies north ~',
      'You have crossed the\nBrandywine. Chapter Two\nlies ahead.',
      'TO BE CONTINUED...',
    ],
  },

  examine_waggon: {
    name: "Maggot's Waggon",
    lines: ['Piled with baskets and\nsacking, packed for the\nFerry road.'],
  },
  examine_well: {
    name: 'The Well',
    lines: ['Cold, clear water. A tin\ncup hangs from the\nwindlass on a chain.'],
  },
  examine_barn: {
    name: 'The Barn',
    lines: ['Hay, harness, and the good\nsmell of earth. Something\nrustles in the loft.'],
  },
  sign_stock: {
    name: 'Signpost',
    lines: ['STOCK  1/2 mile\n~ mind the dikes on\n  the causeway ~'],
  },
  examine_brandyhall: {
    name: 'The Far Shore',
    lines: ['Across the water, lights\nglimmer on the hill:\nBrandy Hall, in Buckland.'],
  },

  maggot: {
    name: 'Farmer Maggot',
    stages: [
      {
        when: (f) => !f.maggotRide,
        lines: [
          "You again! Off my land, or\nI'll set my dogs on--\n...wait. Mr. Frodo BAGGINS?",
          "It's years since you were\nround here after my\nmushrooms, you young rascal.",
          'Now listen. A queer black\nrider came by this very\nday, asking after BAGGINS.',
          'I sent him packing, but my\ndogs Grip, Fang and Wolf\nare still shivering.',
          "You shouldn't be walking\nthe lanes at night. Climb\nin my waggon.",
          "I'll run you to the Ferry\nmyself. And here --\nmushrooms, from the missus!",
        ],
        set: ['maggotRide', 'mushrooms'],
        objective: 'Ride with Farmer Maggot to the Ferry',
      },
      { lines: ['Up you get, Mr. Baggins.\nThe Ferry waits for no one.'] },
    ],
  },

  mrsmaggot: {
    name: 'Mrs. Maggot',
    stages: [
      {
        when: (f) => !f.dogsAsked,
        lines: [
          "Welcome, dears! Any friend\nof Maggot's is welcome\nhere at Bamfurlong.",
          'Only -- our dogs! Grip,\nFang and Wolf bolted when\nthat black rider came.',
          'Still out hiding in the\nmarsh, poor things. Send\nthem home if you find them?',
        ],
        set: 'dogsAsked',
        objective: 'Find Grip, Fang and Wolf in the marsh',
      },
      {
        when: (f) => f.dogGrip && f.dogFang && f.dogWolf && !f.gotBasket,
        lines: [
          "All three home and fed!\nYou have a farmer's way\nwith beasts, Mr. Baggins.",
          'Take this -- mushrooms,\npacked proper, from our\nown beds. Bless you.',
        ],
        set: 'gotBasket',
        give: 'maggot_basket',
      },
      { lines: ['Mind the dikes on the\ncauseway, dears.'] },
    ],
  },

  merry: {
    name: 'Merry',
    stages: [
      {
        when: (f) => !f.merryMet,
        lines: [
          "There you are at last! I've\nbeen watching this landing\nall evening.",
          'Merry Brandybuck, at your\nservice. The ferry raft\nis ready -- step aboard.',
          "Best be quick about it.\nThere's a fog coming off\nthe River tonight.",
        ],
        set: 'merryMet',
        objective: 'Board the ferry raft',
      },
      { lines: ['Step aboard! Buckland is\njust across the water.'] },
    ],
  },

  walking_song: {
    name: 'Frodo',
    lines: [
      'The Road goes ever on\nand on, down from the door\nwhere it began...',
      'Now far ahead the Road\nhas gone, and I must\nfollow, if I can.',
      'Bilbo made that one up,\nwalking this very road.\nIt feels different today.',
    ],
  },

  fox_thought: {
    name: 'A Fox',
    lines: [
      "'Hobbits!' he thought.\n'Well, what next? I have\nheard of strange doings...'",
      "'...but I have seldom heard\nof a hobbit sleeping out\nof doors under a tree.'",
      "'There is something mighty\nqueer behind this,' he\nthought. He was quite right,",
      'but he never found out\nany more about it.',
    ],
  },
};

/**
 * Resolve which stage of a dialogue applies for the current flags.
 * @param {string} key
 * @param {Record<string, boolean>} flags
 * @param {(item: string) => number} [count] item-count lookup, for item-aware predicates
 * @returns {({ name: string } & import('./types.js').DialogueStage) | null}
 */
export function resolveDialogue(key, flags, count = () => 0) {
  const dlg = DIALOGUES[key];
  if (!dlg) return null;
  if (dlg.lines) return { name: dlg.name, lines: dlg.lines };
  const stage = dlg.stages.find((s) => !s.when || s.when(flags, count));
  if (!stage) return null;
  return { name: dlg.name, ...stage };
}
