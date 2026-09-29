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
      'Follow me! A little parlour\nto yourselves, and a hot meal.\nNob will see to your ponies.',
      'Butterbur ushers all four friends\nthrough the passage. For a moment,\nthe noise of the inn falls away.',
    ],
  ],
  bree_supper: [
    'Supper in the little parlour',
    [
      'Soup, bread and a welcome drink.\nAfter the empty downs, supper\nin a snug room feels wonderful.',
      'BUTTERBUR: There is company\nby the big fire, if you fancy it.\nPlenty of news, and ears for yours.',
      'MERRY: I shall stay here quietly.\nPerhaps a breath of air later.\nMind what you tell strangers.',
      'PIPPIN: There are hobbits of Bree\nto meet! Stay indoors, Merry.\nWe have had enough dark roads.',
      'Merry settles by the fire.\nFrodo, Sam and Pippin go back\nto the warmth and bustle outside.',
    ],
  ],
  bree_company: [
    'The company of the Pony',
    [
      'Butterbur introduces Mr Underhill.\nTwo local hobbits crowd nearer:\nthey have Underhills in Bree, too!',
      'FRODO: I am gathering accounts\nof hobbits beyond the Shire.\nPerhaps you can tell me about Bree.',
      'Questions become stories. Pippin\nsoon has a circle of listeners.\nFrodo notices a hooded man watching.',
    ],
  ],
  bree_song: [
    'The common room',
    [
      'PIPPIN: You should have seen\nBilbo’s birthday feast! The whole\nShire was talking about it...',
      'The stranger beckons Frodo over.\nSTRIDER: Your young friend has\na willing audience. Listen closely.',
      'PIPPIN: Then Bilbo stood up\nto make his farewell speech...\nFrodo cannot let the story go on.',
      'Frodo climbs onto the table.\nFRODO: Friends! We are very glad\nof your kindness to travellers.',
      'A SONG! someone calls. Frodo\nfinds a comic old tune about an inn,\na moonlit night, a cat and a fiddle.',
      'The company laughs and stamps.\nAgain! Frodo starts the song over,\nand his feet begin to dance.',
      'At the lively leap, his boot\nslips off the table. He topples;\na tankard rattles to the floor.',
      'Frodo is gone. The music stops.\nFaces turn on Sam and Pippin.\nThe whispering men slip away.',
      'Unseen, Frodo crawls to the dark\ncorner. He removes the Ring beside\nStrider, who has followed every move.',
      'STRIDER: A dangerous trick.\nI have something to tell you,\nin private, before you leave.',
      'FRODO: I fell under the table!\nHere I am. Butterbur hurries over;\nthe company is far from satisfied.',
      'The guests drift out, muttering.\nFrodo gathers Sam and Pippin.\nStrider goes ahead to the parlour.',
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
      'Butterbur brings out a letter.\nFrodo recognizes the writing\non the outside of the folded sheet.',
      'The letter urges Frodo to leave\nquickly and make for Rivendell.\nGandalf hoped to join him on the way.',
      'He recommends a friend called\nStrider, whose true name is Aragorn,\nand adds a verse about a hidden king.',
      'Frodo knows the handwriting.\nSam still wants proof that this\nstranger is the friend it describes.',
      'Butterbur goes to find Nob.\nFrodo returns to Strider,\nwith Sam close beside him.',
    ],
  ],
  bree_trust: [
    'Aragorn',
    [
      'Strider draws his sword. The blade\nis broken below the hilt; it is\nno ready weapon for a tavern brawl.',
      'ARAGORN: I am Aragorn, son of\nArathorn. I knew Gandalf, and I\nhave been watching for your coming.',
      'Gandalf trusts this man. Sam\nstudies the broken sword. Frodo\nmust decide whether to accept him.',
      'Frodo accepts his help. Sam\nstays close. Then hurried feet\nand a knock interrupt their plans.',
    ],
  ],
  bree_merry: [
    'Merry and Nob',
    [
      'Merry leans on Nob, pale and\nshivering. He had gone outside\nfor air and seen a dark shape.',
      'MERRY: I followed it toward\nFerny’s house. Something came\nbehind me. Then everything went cold.',
      'NOB: I found him lying there.\nI thought someone slipped away\nwhen I called, but I could not tell.',
      'STRIDER: The Black Breath.\nWe must stay together tonight.\nLeave the bedrooms looking occupied.',
      'Merry steadies himself among\nhis friends. Nob waits by the\npassage to the hobbit bedrooms.',
    ],
  ],
  bree_decoys: [
    'Nob',
    [
      'Nob brings bolsters and brown\nwoollen mats. A rounded pillow\ncan pass for a sleeping head.',
      'Frodo takes the first bolster.\nThe bed must look occupied\nfrom the dark window above it.',
      'Nob works along the other beds.\nFrodo carries the last bundle\nto the far end of the room.',
      'Four beds now seem occupied.\nNOB: Back to the parlour fire!\nLet them peep in here if they will.',
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
      'The packs must be secured gently.\nBill will carry the baggage;\nthe travellers will go on foot.',
      'Strider joins them on the road.\nBree is awake and watching as\nthe party turns toward the east gate.',
    ],
  ],
  bree_depart: [
    'Out of Bree',
    [
      'Ferny leans over his hedge with\na parting sneer. Sam has one last\nanswer for him: an apple.',
      'Sam weighs the apple in his hand.\nFerny waits behind the hedge,\nstill sneering at the travellers.',
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
