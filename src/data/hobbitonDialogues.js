// Chapter One's inspectable places and the Hobbiton folk who stand about in
// them. Everything here is drawn from "A Long-expected Party" and "Three is
// Company", or from the Prologue's account of the Shire: the pavilion with
// the tree inside it, the hundred and forty-four guests, Frodo's sale of Bag
// End to the Sackville-Bagginses, Folco Boffin and Fredegar Bolger helping
// him pack, the Gaffer at Number Three, and the stranger who came asking
// after Baggins. Nothing is invented beyond the furniture of a farm.

/** @type {Record<string, import('./types.js').Dialogue>} */
export const HOBBITON_DIALOGUES = {
  /* ── Hobbiton folk ─────────────────────────────────────────────────── */

  folco: {
    name: 'Folco Boffin',
    stages: [
      {
        when: (f) => !f.prologueDone,
        lines: [
          'One hundred and eleven!\nAnd not a grey hair on him.',
          'There is something queer\nabout that family, my\nmother always says.',
        ],
      },
      {
        when: (f) => f.ringRevealed,
        lines: [
          'Off to Buckland, is it?\nWell. Somebody has to\nempty the pantry first.',
          'Fredegar and I will see\nthe cart loaded. You just\nmind the road, Frodo.',
        ],
      },
      {
        lines: [
          'Selling up! To Lobelia,\nof all the hobbits in\nthe four Farthings.',
          'Still. A Baggins back in\nBuckland. Your mother\nwould have laughed.',
        ],
      },
    ],
  },

  lotho: {
    name: 'Lotho Sackville-Baggins',
    stages: [
      {
        when: (f) => !f.prologueDone,
        lines: [
          'Free food and fireworks.\nMother says we are to\nstay to the very end.',
          'And to take note of the\nsilver.',
        ],
      },
      {
        lines: [
          'Bag End will want a great\ndeal of putting right.\nNew tenants. New rules.',
          "There's money in leaf and\nin corn, Baggins, for a\nhobbit with an eye open.",
        ],
      },
    ],
  },

  rumble: {
    name: 'Widow Rumble',
    stages: [
      {
        when: (f) => f.ringRevealed,
        lines: [
          "I do for the Gaffer, and\nI'll go on doing for him\nwhen you're gone.",
          "Don't fret about Number\nThree. Fret about wherever\nit is you're going.",
        ],
      },
      {
        lines: [
          'Forty years I have watched\nthe smoke go up from that\nchimney of yours.',
          'A hobbit-hole with no\nsmoke is a sorry sight,\nMr. Baggins.',
        ],
      },
    ],
  },

  cotton: {
    name: 'Farmer Cotton',
    stages: [
      {
        when: (f) => f.dogsAsked || f.crossedFerry,
        lines: ['Maggot down in the Marish\nkeeps dogs. I keep a good\nstout gate. Cheaper.'],
      },
      {
        when: (f) => f.ringRevealed,
        lines: [
          'You want the Ferry road?\nEast along the Water, then\nsouth at the Stock turn.',
          'Mind the Marish. Soft\nground and softer\ntempers, down that way.',
        ],
      },
      {
        lines: [
          'Hay in, corn nearly, and\na fine crop of mushrooms\nif the rain holds off.',
          'My Rose is up at the\nDragon most evenings.\nSam Gamgee knows.',
        ],
      },
    ],
  },

  /* ── The Hill and Bag End ──────────────────────────────────────────── */

  examine_hilltop: {
    name: 'The Top of the Hill',
    lines: [
      'The whole of Hobbiton lies\nbelow: the Row, the Water,\nthe Mill, the bridge.',
      'Three generations of\nBagginses have looked out\nfrom this doorstep.',
    ],
  },

  examine_garden: {
    name: "Sam's Garden",
    stages: [
      {
        when: (f) => f.samJoined,
        lines: ['Weeded, staked and watered,\nas though he meant to be\nback by supper.'],
      },
      {
        lines: [
          'Beans up their poles, peas\nnetted, the taters earthed\nup in tidy ridges.',
          'The Gaffer taught his boy\nwell. Nothing in the Shire\nis better kept.',
        ],
      },
    ],
  },

  examine_bench: {
    name: 'The Bench',
    lines: [
      'Worn smooth by long sitting\nand longer talking.',
      'Bilbo sat here the evening\nhe came home with a ring\nin his pocket.',
    ],
  },

  examine_skep: {
    name: 'The Bee Skeps',
    lines: [
      'Straw skeps, humming in\nthe warm. Shire honey\nfor Shire bread.',
      'Somebody has told the bees\nthat the master of Bag End\nis going away.',
    ],
  },

  examine_hill_trees: {
    name: 'The Old Trees',
    lines: [
      'Two old trees stand over\nthe roof of Bag End, older\nthan the smial beneath.',
      'Bilbo used to say the Hill\nwas here long before any\nBaggins thought to dig it.',
    ],
  },

  /* ── The Party Field ───────────────────────────────────────────────── */

  examine_partytree: {
    name: 'The Party Tree',
    stages: [
      {
        when: (f) => !f.prologueDone,
        lines: [
          'The pavilion is built right\nround it — the tree stands\ninside the tent.',
          'Lanterns hang in every\nbough, waiting for dark.',
        ],
      },
      {
        lines: [
          'The great tree in the Party\nField. Seventeen years of\nleaves have fallen here.',
          'Lantern-hooks are still\nsunk in the bark, going\ngreen with moss.',
        ],
      },
    ],
  },

  examine_firepit: {
    name: 'The Fire-pit',
    stages: [
      {
        when: (f) => !f.prologueDone,
        lines: [
          "Gandalf's rockets are\nstacked in the ring of\nstones, fuses out.",
          'Squibs, crackers, backarappers,\nsparklers, torches, dwarf-candles,\nelf-fountains and goblin-barkers.',
        ],
      },
      {
        lines: [
          'A ring of blackened stones.\nGrass has grown back over\nseventeen winters.',
          'They still talk in Bywater\nabout the dragon that went\nover like an express train.',
        ],
      },
    ],
  },

  examine_trestle: {
    name: 'The Trestles',
    stages: [
      {
        when: (f) => !f.prologueDone,
        lines: [
          'Laid for a hundred and\nforty-four guests: a gross,\nas Bilbo would not have it.',
          'Three official meals are\npromised. Nobody intends\nto stop at three.',
        ],
      },
      { lines: ['Boards and trestles, stacked\nand strapped, waiting for\nthe next long party.'] },
    ],
  },

  examine_pavilion: {
    name: 'The Pavilion',
    lines: [
      'The specially large pavilion.\nThe tree grows up through\nthe middle of it.',
      'Invitations went out to\nevery family in Hobbiton\nand half of Bywater.',
    ],
  },

  /* ── The village, the fields and the Water ─────────────────────────── */

  examine_hedgerow: {
    name: 'The Hedge',
    lines: [
      'Hawthorn, laid and pleached\nthe slow way, so it grows\ninto its own fence.',
      'A well-ordered and\nwell-farmed countryside, and\nhobbits let it alone.',
    ],
  },

  examine_cornfield: {
    name: 'The Corn',
    lines: [
      'Shoulder-high to a hobbit\nand nearly ready. The ears\nrattle when the wind moves.',
      'Mostly for bread, some for\nbeer, and a little for the\nmill to argue over.',
    ],
  },

  examine_stook: {
    name: 'The Stooks',
    lines: [
      'Sheaves stood up in fours\nto dry. Harvest is close.',
      'Hobbits are slow to change\nbut quick to the field when\nthe weather turns.',
    ],
  },

  examine_pool: {
    name: 'The Bywater Pool',
    lines: [
      'The Water widens here into\na still brown pool, ringed\nwith rushes.',
      'The mill draws from it, the\nducks own it, and small\nhobbits fall into it.',
    ],
  },

  examine_bridge: {
    name: 'The Bridge',
    lines: [
      'Three arches over the Water,\nthe road to Bywater and\nall the East beyond.',
      'Every road out of Hobbiton\ncrosses here in the end.',
    ],
  },

  examine_millwheel: {
    name: 'The Mill Wheel',
    lines: [
      'Old Sandyman grinds for\nthe whole of Hobbiton, and\ngrumbles at the rate.',
      'His son Ted thinks a bigger\nwheel and more of them\nwould suit better.',
    ],
  },

  examine_milestone: {
    name: 'The Waymark',
    lines: [
      'A worn stone at the road-\nside. The letters were cut\nlong before any Baggins.',
      'East: to Bywater, Frogmorton,\nthe Bridge of Stonebows,\nand out of the Shire.',
    ],
  },

  examine_ducks: {
    name: 'The Duck Pond',
    lines: ['Brown ducks, tipping up\namong the reeds. They have\nnowhere else to be.'],
  },

  examine_innyard: {
    name: 'The Inn Yard',
    lines: [
      'Benches, a well, and a\nstable for the Bywater\ncarters\u2019 ponies.',
      'The Green Dragon has stood\nhere longer than anyone in\nBywater can remember.',
    ],
  },

  examine_paddock: {
    name: 'The Paddock',
    lines: [
      'Hay cut and turned, and a\ngate on the lane side for\nthe carts to come through.',
      'Grazing between the two\nroads. Somebody\u2019s pony has\nbeen at the hedge again.',
    ],
  },

  examine_allotment: {
    name: 'The Allotments',
    lines: [
      'Strips of dug ground along\nthe bank: onions, beans and\na great many potatoes.',
      'Half of Hobbiton keeps a\nrow here, and all of it\nkeeps an opinion.',
    ],
  },

  examine_bagshotrow: {
    name: 'Bagshot Row',
    lines: [
      'Three holes under the Hill.\nNumber Three is the Gaffer\nGamgee’s, and Sam’s.',
      'The Row was dug from the\nspoil of Bag End itself.\nHence the name.',
    ],
  },

  examine_cotton_sign: {
    name: 'Sign',
    lines: ['COTTON FARM\n~ South Lane, Bywater ~'],
  },

  /* ── Inside Bag End ────────────────────────────────────────────────── */

  examine_map: {
    name: 'The Map',
    lines: [
      'A map of Wilderland, pinned\nup and pencilled over: the\nMisty Mountains, Mirkwood.',
      'A small red mark far to the\neast, and beside it, in\nBilbo’s hand: "HOME".',
    ],
  },

  examine_pantry: {
    name: 'The Pantry',
    stages: [
      {
        when: (f) => f.ringRevealed,
        lines: [
          'Shelf after shelf, and all\nof it to be eaten, given\naway or left behind.',
          'Folco says he will take\nthe pickles off your hands\nas a personal favour.',
        ],
      },
      {
        lines: [
          'Seed-cake, raspberry jam,\nmince-pies, cheese, cold\nchicken, pork pie.',
          'Bilbo kept it stocked for\nunexpected parties. It\nhappened to him once.',
        ],
      },
    ],
  },

  examine_sticks: {
    name: 'The Walking Sticks',
    lines: [
      'A stand of them by the\ndoor, thorn and ash, each\none worn to a hand.',
      'The shortest has been cut\ndown twice. It went to the\nLonely Mountain and back.',
    ],
  },

  examine_chest: {
    name: 'The Chest',
    lines: [
      'Mathoms. Hobbits call\nanything a mathom if they\nhave no use for it',
      'and cannot bear to throw\nit away. Bag End is very\nfull of mathoms.',
    ],
  },

  examine_window_bagend: {
    name: 'The Round Window',
    lines: [
      'It looks west over the\ngarden and down the Hill,\nand it will not be yours.',
      'Bilbo wrote his book at\nthis window, most of it\nin the mornings.',
    ],
  },

  examine_ringspot: {
    name: 'The Envelope',
    stages: [
      {
        when: (f) => !f.ringRevealed,
        lines: [
          'A heavy envelope on the\nmantel, sealed, addressed\nto Frodo in a shaky hand.',
          'Gandalf said to leave it\nuntil he came. He has not\ncome yet.',
        ],
      },
      {
        lines: [
          'The envelope lies open and\nempty. What was in it is\nin your pocket now.',
          'It weighs no more than a\nring should. It weighs\nnothing like it.',
        ],
      },
    ],
  },

  /* ── The Green Dragon ──────────────────────────────────────────────── */

  examine_hearth_gd: {
    name: 'The Inn Fire',
    lines: [
      'Banked low for the season.\nThe settle beside it is\nthe best seat in Bywater.',
      'Talk here runs to weather,\ncrops, and the queer folk\nseen on the roads of late.',
    ],
  },

  examine_settle: {
    name: 'The Settle',
    lines: [
      'High-backed, to keep the\ndraught off and the gossip\nin.',
      'Sam heard about Elves\nhere, and was laughed at\nfor listening.',
    ],
  },

  /* ── The Woody End ─────────────────────────────────────────────────── */

  examine_road_woody: {
    name: 'The East Road',
    lines: [
      'The Road runs on, east\nand south, out of the Shire\naltogether.',
      'Bilbo used to say it was\ndangerous business, going\nout of your door.',
    ],
  },

  examine_ferns: {
    name: 'The Fern Brake',
    lines: [
      'Bracken shoulder-high,\nthick enough to swallow\nthree hobbits whole.',
      'Good cover, if anything\never came down this road\nthat wanted avoiding.',
    ],
  },

  examine_treetunnel: {
    name: 'The Tree Tunnel',
    lines: [
      'The boughs close right over\nthe Road. Green light, and\nno sky at all.',
      'Sound goes strange here.\nHoofbeats would carry a\nlong way.',
    ],
  },

  examine_hollow: {
    name: 'The Fir Hollow',
    lines: [
      'A carpet of wild flowers in\na ring of firs, and the\nsmell of resin.',
      'The kind of place a hobbit\nsleeps out under the stars\nand thinks nothing of it.',
    ],
  },

  examine_elfclearing: {
    name: 'The Hall of Trees',
    stages: [
      {
        when: (f) => f.metGildor,
        lines: [
          'Grass trodden in a wide\nring, and the scent of\nsomething like lamplight.',
          'Gildor’s people keep the\nhigh road east, and pass\nthis way but rarely.',
        ],
      },
      {
        lines: [
          'A wide clearing where the\nRoad runs straight. Trees\nstand about it like pillars.',
        ],
      },
    ],
  },

  /* ── The Marish ────────────────────────────────────────────────────── */

  examine_causeway: {
    name: 'The Causeway',
    lines: [
      'The lane is raised between\ntwo dikes. Step off it and\nyou are in the wet.',
      'The Marish folk build high\nand keep boats. They are\nreckoned queer for it.',
    ],
  },

  examine_dike: {
    name: 'The Dike',
    lines: ['Black water in a straight\ncut, and the frogs going\nquiet as you pass.'],
  },

  examine_mushroom_bed: {
    name: 'The Mushroom Beds',
    stages: [
      {
        when: (f, count) => count('mushroom') >= 6,
        lines: [
          'Row upon row under the\nstraw. You have taken a\nfair few already.',
          'Maggot grows the best\nmushrooms in the Eastfarthing\nand knows it.',
        ],
      },
      { lines: ['Row upon row, bedded in\nstraw. The best mushrooms\nin the Eastfarthing.'] },
    ],
  },

  examine_reeds: {
    name: 'The Rushes',
    lines: ['Rushes taller than a hobbit,\nand somewhere behind them\nthe river going by.'],
  },

  examine_ferrylanding: {
    name: 'The Landing',
    lines: [
      'A flat raft on a rope, and\na lamp on a post for those\nwho come after dark.',
      'Buckland is the far side.\nThe Brandywine is the\nShire’s eastern wall.',
    ],
  },
};
