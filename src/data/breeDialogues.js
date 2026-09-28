import { BREE_BEATS, isBreeBeat } from '../state/breeProgress.js';

// Original paraphrases: Fellowship Book I, 9–11. No film staging or quoted song.
/** @type {Record<string, [string, string[]]>} */
const scenes = {
  bree_gate: [
    'Harry Goatleaf',
    [
      'The gatekeeper raises his lantern.\nFour hobbits, coming up the Road\nafter dark? What brings you here?',
      'FRODO: We need beds for the night.\nMy name is Underhill. We were\ntold to try the Prancing Pony.',
      'HARRY: Butterbur will find room.\nFollow the road up into the village.\nMind you, folk will have questions.',
    ],
  ],
  bree_welcome: [
    'Barliman Butterbur',
    [
      'Hobbits from the Shire! Come in,\nMr Underhill. Supper and rooms\nin the north wing, just your size.',
      'Merry stays to enjoy the quiet.\nSam and Pippin follow Frodo toward\nthe fire and the gathering company.',
      'BARLIMAN: Men and hobbits, all\nunder one roof here. Have a word\nwith the company if you like.',
    ],
  ],
  bree_song: [
    'The common room',
    [
      'Pippin has an eager audience.\nHis story is coming dangerously\nclose to Bilbo’s farewell party.',
      'Frodo stands up to interrupt.\nHe offers a song: an old comic tale\nof a moonlit inn, a cat and a fiddle.',
      'They call for it again. Frodo\nclimbs up, leaps at the wrong\nmoment, and loses his footing.',
      'He is gone. A mug rolls across\nthe boards. The room falls silent.\nThe Ring is on his finger.',
      'Frodo crawls aside and removes it.\nHe returns to angry questions.\nHis explanation convinces few.',
      'STRIDER: That was a poor way\nto keep a secret. We must speak\nin your private parlour.',
    ],
  ],
  bree_strider: [
    'Strider',
    [
      'The weather-beaten stranger waits\nby the wall. His muddy boots and\ntravel-stained cloak are still on.',
      'STRIDER: Underhill will no longer\nhide you. Ferny and the southerner\nsaw more than you would wish.',
      'I can guide you through country\nwhere the Road is watched. But you\nmust decide whether to trust me.',
      'A knock interrupts him. Butterbur\nhas remembered something that\nshould have been delivered long ago.',
    ],
  ],
  bree_letter: [
    'Gandalf’s delayed letter',
    [
      'BARLIMAN: Gandalf left this in\nMidsummer. I meant to send it to\nthe Shire. Business drove it out.',
      'The letter urges Frodo to leave\nquickly and make for Rivendell.\nGandalf hoped to join him on the way.',
      'He recommends a friend called\nStrider, whose true name is Aragorn,\nand adds a verse about a hidden king.',
      'Frodo knows the handwriting.\nSam still wants proof that this\nstranger is the friend it describes.',
    ],
  ],
  bree_trust: [
    'Aragorn',
    [
      'Strider draws his sword. The blade\nis broken below the hilt; it is\nno ready weapon for a tavern brawl.',
      'ARAGORN: I am Aragorn, son of\nArathorn. I knew Gandalf, and I\nhave been watching for your coming.',
      'Frodo accepts his help. Sam\nremains cautious, but settles\ncloser to Frodo as they make plans.',
      'Then hurried feet sound outside.\nNob has found Merry in the street\nand brought him back to the inn.',
    ],
  ],
  bree_merry: [
    'Merry and Nob',
    [
      'Merry leans on Nob, pale and\nshivering. He had gone outside\nfor air and seen a dark shape.',
      'MERRY: I followed it toward\nFerny’s house. Something came\nbehind me. Then everything went cold.',
      'NOB: I found him lying there.\nI thought someone slipped away\nwhen I called, but I could not tell.',
      'STRIDER: The Black Breath.\nWe must stay together tonight.\nLeave the bedrooms looking occupied.',
    ],
  ],
  bree_decoys: [
    'Nob',
    [
      'Nob lays bolsters beneath the\nblankets and shapes brown woollen\nmats into four sleeping heads.',
      'The low beds look occupied\nfrom the windows. Packs and\nblankets go back to the parlour.',
      'NOB: Let them peep in here.\nYou will be beside the fire,\nwith the door barred.',
    ],
  ],
  bree_watch: [
    'A watch beside the fire',
    [
      'The hobbits settle in the parlour.\nStrider takes his place by the door.\nThe fire burns low.',
      'The hours pass. Outside, hoofbeats\nand frightened movement break the\nstillness. No one opens the door.',
      'Grey morning reaches the windows.\nThey are safe, but there is shouting\nin the yard and the stable is open.',
    ],
  ],
  bree_damage: [
    'The north wing',
    [
      'The windows have been forced.\nBedclothes lie torn and scattered;\nthe four bolsters are slashed.',
      'No one saw who entered these rooms.\nThe decoys bought a quiet night\nfor those beside the parlour fire.',
      'The ponies have been driven away.\nButterbur will make good the loss,\nbut only Ferny has a pony to sell.',
    ],
  ],
  bree_bill: [
    'Butterbur and Sam',
    [
      'Ferny demands twelve silver pennies\nfor a thin, neglected pony.\nButterbur pays and offers restitution.',
      'SAM: There is more kindness in\nthis poor beast than in its owner.\nCome along, Bill. We will see to you.',
      'They load the packs carefully.\nBill will carry the baggage;\nthe travellers will go on foot.',
      'Strider joins them on the road.\nBree is awake and watching as\nthe party turns toward the east gate.',
    ],
  ],
  bree_depart: [
    'Out of Bree',
    [
      'Ferny leans over his hedge with\na parting sneer. Sam has one last\nanswer for him: an apple.',
      'The apple strikes its mark.\nSam walks on with Bill, regretting\nthe fruit more than the throw.',
      'Beyond the last houses, Strider\nleads them away from prying eyes.\nThe country opens, wide and empty.',
      'CHAPTER FOUR COMPLETE\nBree falls behind. Ahead lie the\nmarshes and the distant Weather Hills.',
    ],
  ],
};

/** @type {Record<string, import('./types.js').Dialogue>} */
export const BREE_DIALOGUES = {};
for (const b of BREE_BEATS) {
  const [name, lines] = scenes[b.key];
  BREE_DIALOGUES[b.key] = {
    name,
    stages: [
      {
        when: (f) => isBreeBeat(f, b.key),
        lines,
        set: b.key === 'bree_bill' ? [b.flag, 'striderJoined'] : b.flag,
        objective:
          BREE_BEATS[BREE_BEATS.indexOf(b) + 1]?.objective ??
          'Chapter four complete · the wild road lies ahead',
      },
      {
        lines: [
          'There is no more to do here now.\nRecall your objective to find\nthe next step of the journey.',
        ],
      },
    ],
  };
}
Object.assign(BREE_DIALOGUES, {
  bree_sign: {
    name: 'The Prancing Pony',
    lines: [
      'A white pony rears on the sign.\nLight spills from three storeys\nof windows above the archway.',
    ],
  },
  bree_hill: {
    name: 'Bree-hill',
    lines: [
      'Stone houses climb the western\nslope. Higher up, hobbit windows\nglow low in the hillside.',
      'Big Folk and Little Folk live\nhere together, in an island of\nlamplight amid the empty lands.',
    ],
  },
  bree_crossroads: {
    name: 'The Greenway',
    lines: [
      'The north-south road crosses the\nEast Road beyond the western gate.\nGrass has claimed much of its length.',
    ],
  },
  bree_stable: {
    name: 'The stable yard',
    stages: [
      {
        when: (f) => f.breeMorning,
        lines: [
          'The stalls stand open. Hoofprints\ncriss-cross the yard and disappear\nthrough the gate.',
        ],
      },
      {
        lines: [
          'The ponies have hay and water.\nFor the first time since the downs,\nthe packs are under a sound roof.',
        ],
      },
    ],
  },
  bree_locals: {
    name: 'The company',
    lines: [
      'A local hobbit asks about the\nShire. Men discuss travellers from\nthe south and trouble on the roads.',
      'Sam marvels at the size of the\nroom. A dwarf listens from a table,\nhis tankard scarcely touched.',
    ],
  },
  bree_fern: {
    name: 'A whispering corner',
    lines: [
      'Ferny and a travelling southerner\nbend their heads together. Their\nconversation stops when you approach.',
    ],
  },
  bree_rooms: {
    name: 'Hobbit lodgings',
    lines: [
      'Low ceilings, round windows,\nsmall beds. Butterbur has thought\nof his Little Folk guests.',
    ],
  },
  bree_horizon: {
    name: 'The wild road',
    lines: [
      'The next chapter leads through\nMidgewater to the Weather Hills.\nFor now, rest here with the company.',
    ],
  },
});
