// NPC dialogues — drawn from or closely paraphrasing The Lord of the Rings.
//
// Each entry is either { name, lines } (always the same) or
// { name, stages: [...] } where the FIRST stage whose `when(flags)` is
// true (or that has no `when`) is shown. A stage may carry effects that
// fire when its dialogue finishes:
//   set:       flag name (or array) to set
//   objective: new objective banner text
//   join:      character key that becomes the player's follower

/** @type {Record<string, import('./types.js').Dialogue>} */
export const DIALOGUES = {
  gandalf: {
    name: 'Gandalf',
    stages: [
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
    lines: [
      'Frodo Baggins! I suppose\nyou think you own\nBag End now?',
      "Bilbo should never have\nleft it to you. It's\na Sackville-Baggins home!",
      'I shall be watching you,\nFrodo Baggins. Mark my\nwords!',
    ],
  },

  rosie: {
    name: 'Rosie Cotton',
    stages: [
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
    lines: [
      'Queer things you do hear\nthese days, to be sure.',
      "Tree-men, giants beyond\nthe North Moors? Half of\nit's your cousin Hal's tales.",
      "There's only one Dragon in\nBywater, and that's Green!\nHa ha!",
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
          'Be brave, Frodo son of\nDrogo. Elves shall watch\nyour road where they may.',
        ],
        set: 'metGildor',
        objective: 'Reach the Bucklebury Ferry sign, far east',
      },
      {
        lines: ['The stars will be out soon.\nGo east, and take our good\nwishes with you.'],
      },
    ],
  },

  sign_greendragon: {
    name: 'Sign',
    lines: ['THE GREEN DRAGON INN\n~ Fine Ales & Good Company ~'],
  },

  sign_bagend: {
    name: 'Sign',
    lines: ['BAG END\n~ No Admittance\n  Except on Party Business ~'],
  },

  sign_bywater: {
    name: 'Sign',
    lines: ['BYWATER\nHobbiton 1 mile north'],
  },

  door_locked: {
    name: 'Door',
    lines: ['The round door is shut\nfast. Nobody seems to\nbe at home.'],
  },

  sign_ferry: {
    name: 'Sign',
    lines: [
      'BUCKLEBURY FERRY\n~ across the Brandywine ~',
      'The ferry raft is moored on\nthe far shore. Chapter Two\nlies across the river.',
      'TO BE CONTINUED...',
    ],
  },
};

/**
 * Resolve which stage of a dialogue applies for the current flags.
 * @param {string} key
 * @param {Record<string, boolean>} flags
 * @returns {({ name: string } & import('./types.js').DialogueStage) | null}
 */
export function resolveDialogue(key, flags) {
  const dlg = DIALOGUES[key];
  if (!dlg) return null;
  if (dlg.lines) return { name: dlg.name, lines: dlg.lines };
  const stage = dlg.stages.find((s) => !s.when || s.when(flags));
  if (!stage) return null;
  return { name: dlg.name, ...stage };
}
