// Chapter One's inspectable places and the Hobbiton folk who stand about in
// them. Everything here is drawn from "A Long-expected Party" and "Three is
// Company", or from the Prologue's account of the Shire: the pavilion with
// the tree inside it, the hundred and forty-four guests, Frodo's sale of Bag
// End to the Sackville-Bagginses, Folco Boffin and Fredegar Bolger helping
// him pack, the Gaffer at Number Three, and the stranger who came asking
// after Baggins. Nothing is invented beyond the furniture of a farm.

import { CHAPTER_DIALOGUES } from './chapterDialogues.js';

/** @type {Record<string, import('./types.js').Dialogue>} */
export const HOBBITON_DIALOGUES = {
  /* ── Hobbiton folk ─────────────────────────────────────────────────── */

  folco: {
    name: 'Folco Boffin',
    stages: [
      {
        // Gandalf used to say this, but he is gone long before anyone has
        // gathered six of them. A Boffin is the right hobbit for it anyway.
        when: (f, count) => f.prologueDone && count('mathom') >= 6 && !f.mathomsPraised,
        lines: [
          "Six of Bilbo's old mathoms!\nThe museum at Michel Delving\nnever held a finer haul.",
          'A Boffin knows a mathom\nwhen he sees one. Those are\nvery good mathoms.',
        ],
        set: 'mathomsPraised',
      },
      {
        when: (f) => !f.prologueDone,
        lines: [
          'One hundred and eleven!\nAnd not a grey hair on him.',
          'There is something queer\nabout that family, my\nmother always says.',
        ],
      },
      {
        when: (f) => f.metGandalf,
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

  // Fredegar is in two chapters at once. In Hobbiton he is helping Frodo
  // empty Bag End; at Crickhollow he stays behind to play the decoy, and those
  // are his lines in chapterDialogues. Without this he greeted Frodo on the
  // Hill by refusing to go into the Old Forest.
  fatty: {
    name: 'Fredegar Bolger',
    stages: [
      {
        when: (f) => !f.prologueDone,
        lines: ['Eleventy-one, and the whole\nShire invited. Trust a Baggins\nto do it properly.'],
      },
      {
        when: (f) => !f.crossedFerry && f.metGandalf,
        lines: [
          "I'm no walker, Frodo, and I\nsay so plainly. But I can\ncarry a box to a cart.",
          'Folco and I will have Bag End\nbare by Thursday. Lobelia can\nhave the dust.',
        ],
      },
      {
        when: (f) => !f.crossedFerry,
        lines: [
          'Buckland! You were born there,\nI know. It still seems a long\nway to go for a quiet life.',
        ],
      },
      // and at Crickhollow, the lines he already had
      { lines: CHAPTER_DIALOGUES.fatty.lines },
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
        when: (f) => f.metGandalf,
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
        when: (f) => f.metGandalf,
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

  /* ── The village, the fields and the Water ─────────────────────────── */

  examine_cornfield: {
    name: 'The Corn',
    lines: [
      'Shoulder-high to a hobbit\nand nearly ready. The ears\nrattle when the wind moves.',
      'Mostly for bread, some for\nbeer, and a little for the\nmill to argue over.',
    ],
  },

  examine_pool: {
    name: 'The Bywater Pool',
    lines: [
      'The Water widens here into\na still brown pool, ringed\nwith rushes.',
      'The mill draws from it, the\nducks own it, and small\nhobbits fall into it.',
    ],
  },

  examine_millwheel: {
    name: 'The Mill Wheel',
    lines: [
      'Old Sandyman grinds for\nthe whole of Hobbiton, and\ngrumbles at the rate.',
      'His son Ted thinks a bigger\nwheel and more of them\nwould suit better.',
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

  examine_hall: {
    name: 'The Hall',
    lines: [
      'A comfortable tunnel without\nsmoke: panelled walls, tiled\nfloor, and pegs, and pegs.',
      'It runs straight into the\nHill, and the best rooms all\nopen off the left of it.',
    ],
  },

  examine_ringspot: {
    name: 'The Envelope',
    stages: [
      {
        when: (f) => !f.metGandalf,
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

  examine_ferns: {
    name: 'The Fern Brake',
    lines: [
      'Bracken shoulder-high,\nthick enough to swallow\nthree hobbits whole.',
      'Good cover, if anything\never came down this road\nthat wanted avoiding.',
    ],
  },

  examine_hollow: {
    name: 'The Fir Hollow',
    lines: [
      'A carpet of wild flowers in\na ring of firs, and the\nsmell of resin.',
      'The kind of place a hobbit\nsleeps out under the stars\nand thinks nothing of it.',
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
};
