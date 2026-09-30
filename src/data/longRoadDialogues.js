import { LONG_ROAD_BEATS, isRoadBeat } from '../state/longRoadProgress.js';

// Original paraphrases: Fellowship Book I, 11 ("A Knife in the Dark") and 12
// ("Flight to the Ford"). No film staging and no quoted verse; the rhyme and the
// tale are summarised. Each page is at most three lines of forty characters.
/** @type {Record<string, [string, string[]]>} */
const scenes = {
  road_marsh: [
    'Off the Road',
    [
      'Strider turns from the Road. The\nway east is watched, he says, so he\nwill lead them by a rougher path.',
      'STRIDER: We go by way of Midgewater.\nIt is poor country, but no one\nwill be waiting for us there.',
      'The ground softens underfoot. Reeds\ncrowd close on either side, and a\ncloud of midges hangs over the pools.',
      'SAM: Is there aught to eat in this\nplace, Mr. Frodo, besides the things\nthat are eating us?',
    ],
  ],
  road_midges: [
    'A night in Midgewater',
    [
      'Evening finds them on a low dry bank\namong the reeds. Strider will not\nhear of a fire in such country.',
      'The midges find them anyway. All night\nthe neekerbreekers shrill in the dark,\nand nobody sleeps.',
      'PIPPIN: There are more midges here\nthan water! SAM: What do they live\non when there is no hobbit handy?',
      'STRIDER: Patience. The marsh ends\nin a day or two. Then the hills, and\nwe shall see what lies ahead.',
      'Dawn comes at last. They rise stiff\nand itching, and pick their way\nthrough the reeds toward the hills.',
    ],
  ],
  road_hill: [
    'The hill in the wilderness',
    [
      'The marshes end. A long brown hill\nstands alone above the land, crowned\nwith a ring of broken stone.',
      'STRIDER: That is Amon Sul, which\nmen call Weathertop. A great watch-\ntower of the North stood on its crown.',
      'STRIDER: It is a dangerous place, for\nthe Enemy’s servants may watch from\nit too. But it gives a far view.',
      'FRODO: Then let us see what it shows.\nWe cannot hide in open country,\nand I would sooner know the danger.',
    ],
  ],
  road_rune: [
    'The summit of Weathertop',
    [
      'The hobbits climb the long slope.\nThe crown is a ring of fallen wall\naround a flat, wind-swept floor.',
      'Strider kneels by a flat stone.\nScratched upon it are a letter G\nand three small strokes beside it.',
      'STRIDER: Gandalf’s mark, it may be.\nIf so, he was here three days ago,\nand in a great hurry.',
      'The Road winds far below, empty\nunder the clouds. No rider is in\nsight. Yet the hill feels watched.',
      'STRIDER: We will not camp on the\ntop. There is a sheltered dell\nbelow. Come down, before dusk.',
    ],
  ],
  road_fire: [
    'A fire in the dell',
    [
      'Evening darkens. In the dell Sam\nlays a few sticks. Strider allows\na small fire at last, for comfort.',
      'The flames catch. Sam asks for a\ntale of the Elves, something to\nchase the gloom from the night.',
      'STRIDER: Then I will tell of Beren,\na mortal man, and Luthien, daughter\nof an elven king, fairest of all.',
      'He tells of their long road, the\njewel won from a dark throne and\na love that cost her deathlessness.',
      'The fire sinks. Frodo sees dim shapes\nat the dell’s rim. Strider stops\nspeaking and listens, stern-faced.',
    ],
  ],
  road_attack: [
    'The Riders on Weathertop',
    [
      'Strider climbs to the rim to listen.\nThe fire burns low and the hobbits\ncrowd together in the dell.',
      'The air grows cold. Something tall\nand dark stands on the slope. Then\nanother, and another.',
      'Five figures glide down through the\nshadows. The others fall on their\nfaces, shaking with fear.',
      'Terror grips Frodo. A voice in his\nmind urges him, more and more\nstrongly, to put on the Ring.',
      'Through the Ring he sees them true:\npale faces, grey robes, silver helms\non grey hair. The tallest is crowned.',
      'The Ring drags at him. But Frodo\nremembers Elves and starlight,\nand the sword in his hand.',
      '“O Elbereth! Gilthoniel!” he cries,\nand stabs at the foot of the nearest.\nA cold pain pierces his shoulder.',
      'Then fire blazes on the rim. Strider\ncomes down with a brand in each hand.\nThe shadows scatter before him.',
    ],
  ],
  road_wound: [
    'Strider and Frodo',
    [
      'Strider kneels by Frodo. A long knife\nlies in the grass; as he lifts it the\nblade withers away like smoke.',
      'STRIDER: A knife of the Enemy’s\nRiders. A sliver may remain in the\nwound, working toward his heart.',
      'Sam sits by his master, afraid to\ntouch him. Merry and Pippin lift\ntheir faces; the cold still lingers.',
      'STRIDER: My skill is small for such\nhurts. We must reach the house of\nElrond, and quickly.',
      'They will not stay another hour on\nthe hill. By the first grey light\nthey are gone from Weathertop.',
    ],
  ],
  road_athelas: [
    'Kingsfoil',
    [
      'Days pass in weary walking. Frodo\ngrows paler, and the cold in his\nshoulder spreads toward his chest.',
      'Strider stoops beside the way.\nSTRIDER: Athelas. Country folk call\nit kingsfoil. Western Men brought it.',
      'He bruises the leaves in hot water.\nA clean, sweet scent fills the air,\nand Frodo’s pain eases a little.',
      'STRIDER: I am no healer, and the\nwound is worse than any herb can mend.\nOnly Elrond can help him now.',
    ],
  ],
  road_trolls: [
    'Stone in the glade',
    [
      'In a glade beside the stream stand\nthree huge figures of grey stone, each\nbroad as a barn and twice as ugly.',
      'SAM: Trolls! Turned to stone, every\none, the sun catching them at\nsome wicked business.',
      'MERRY: They look like the trolls in\nBilbo’s tale. SAM: He had a rhyme\nabout one, too. I know it by heart.',
      'Sam hums it: a lonely troll, a bone\nhe will not share, and a stranger come\nfor his own leg. Even Frodo laughs.',
      'STRIDER: Whatever their names, they\nwill not stir again. But do not\nlinger. The day is short.',
    ],
  ],
  road_glorfindel: [
    'Hoofbeats on the Road',
    [
      'Hoofbeats! A horse comes fast down\nthe Road. Strider draws his sword\nand stands before the hobbits.',
      'A white horse, and a rider in a cloak\nof pale grey: an elf-lord, gold-\nhaired, with a face of keen joy.',
      'GLORFINDEL: Mae govannen, Aragorn!\nI am sent out from Rivendell to seek\nyou. Elrond knows the Nine are abroad.',
      'GLORFINDEL: There are Riders behind\nyou, and I fear others before you,\nnear the Ford. There is no time.',
      'He looks at Frodo and is grave.\nGLORFINDEL: Your hurt is deep. My\nhorse is swift. He will carry you.',
      'STRIDER: Go with him. We follow as\nfast as hobbits can walk. Do not\nstop until you are across the water.',
    ],
  ],
  road_ford: [
    'The Ford of Bruinen',
    [
      'The woods thin. The land tilts down\ntoward a valley, and the sound of\nrunning water.',
      'GLORFINDEL: Beyond the Ford lies the\nriver Bruinen, and beyond it the land\nof Elrond. Its waters know their own.',
      'Glorfindel lifts Frodo onto his white\nhorse. The wound burns, and the world\nturns grey and far away.',
      'GLORFINDEL: Ride, Frodo, and do not\nlook back. Noro lim, Asfaloth! We\nfollow on foot.',
      'Behind them, out of the trees, nine\nblack riders break onto the road.\nFrodo bends low and they are off.',
      'Asfaloth flies over the white track.\nThe Riders gain, each hoof a cold\ndrum. Ahead, the water gleams.',
      'Asfaloth plunges through the Ford and\nclimbs the far bank. Frodo turns.\nThe Nine crowd the water’s edge.',
      'CHAPTER FIVE COMPLETE\nThe Nine stand at the Ford, and Frodo\nis alone. Rivendell lies beyond.',
    ],
  ],
};

/** @type {Record<string, import('./types.js').Dialogue>} */
export const LONG_ROAD_DIALOGUES = {};
for (const b of LONG_ROAD_BEATS) {
  const [name, lines] = scenes[b.key];
  LONG_ROAD_DIALOGUES[b.key] = {
    name,
    stages: [
      {
        when: (f) => isRoadBeat(f, b.key),
        lines,
        set: b.flag,
        objective:
          LONG_ROAD_BEATS[LONG_ROAD_BEATS.indexOf(b) + 1]?.objective ??
          'Chapter five complete · the Nine wait at the Ford of Bruinen',
      },
      {
        lines: [
          'There is no more to do here now.\nRecall your objective to find\nthe next step of the journey.',
        ],
      },
    ],
  };
}
Object.assign(LONG_ROAD_DIALOGUES, {
  road_reeds: {
    name: 'The reed-beds',
    lines: [
      'Black pools lie between the reeds.\nSomething chirrups in the stems and\nfalls silent as you pass.',
    ],
  },
  road_pool: {
    name: 'A stagnant pool',
    lines: [
      'The water is still and brown, and\nfilmed with a rainbow skin. No step\nshould go near its edge.',
    ],
  },
  road_bill: {
    name: 'Bill the pony',
    lines: [
      'Bill plods on, ears flat against the\nmidges. Sam murmurs to him and\nsays he has had worse nights.',
    ],
  },
  road_view: {
    name: 'The view from the hill',
    lines: [
      'Brown country runs to every edge of\nthe sky. The Road is a thin pale\nthread, and Bree is out of sight.',
    ],
  },
  road_wall: {
    name: 'Broken wall',
    lines: [
      'Squared stones lie in the turf,\nblackened by old fire. Something great\nwas built here, and it was burnt.',
    ],
  },
  road_bridge: {
    name: 'The Last Bridge',
    lines: [
      'A stone bridge carries the Road\nover a fast stream. The masons are\nlong dead, but their work stands.',
    ],
  },
  road_beech: {
    name: 'A red-gold beech',
    lines: [
      'Autumn has turned the beeches to\ncopper and flame. Leaves drift down\nsoftly over a cold, dark stream.',
    ],
  },
  road_river: {
    name: 'The Bruinen',
    lines: [
      'The river runs clear and swift\nover white stones, with a low,\nsteady murmur like distant voices.',
    ],
  },
  road_nine: {
    name: 'The far bank',
    lines: [
      'The Riders wait in the shadow of the\ntrees beyond the water. There is no\nway back now. Only Rivendell.',
    ],
  },
});
