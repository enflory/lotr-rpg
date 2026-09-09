// Original paraphrase of Fellowship, Book I, chapters 5–8.
// Each string is one page; effects occur only when that page sequence closes.

/** @type {Record<string, import('./types.js').Dialogue>} */
export const CHAPTER_DIALOGUES = {
  crickhollow_departure: {
    name: 'Merry',
    stages: [
      {
        when: (f) => f.chapter2,
        lines: ['All ready. Take the eastern path\nto the tunnel under the hedge.'],
      },
      {
        when: (f) => !f.crickhollowReady,
        lines: [
          'There is supper waiting indoors.\nGo through the round door.\nWe have a good deal to talk about.',
        ],
      },
      {
        lines: [
          'The air is cool and the grass wet.\nThe ponies are ready; Fatty will\nkeep the house looking lived in.',
          'We settled it together last night.\nOur way lies under the High Hay,\nthrough the tunnel east of here.',
        ],
        set: ['chapter2', 'merryJoined'],
        join: 'merry',
        objective: 'Find the tunnel under the High Hay',
      },
    ],
  },
  crickhollow_supper: {
    name: 'At the Supper Table',
    stages: [
      {
        when: (f) => f.crickhollowSupper || f.chapter2,
        lines: [
          'The dishes have been cleared.\nThe warmth of that evening\nlingers in the quiet room.',
        ],
      },
      {
        lines: [
          "Steam rises from the dishes.\nMrs. Maggot's mushrooms are here,\nand there is room for everyone.",
          'A bath, dry clothes, and supper!\nFor a little while, the ferry\nand the dark road seem far away.',
          'You mean to leave the Shire, Frodo.\nWe have been fitting the clues\ntogether for quite some time.',
          'I meant to slip away quietly.\nHow could I ask you to share\nsomething so dangerous?',
          'Sam has been helping us.\nWe know more than you supposed,\nand our own packs are ready.',
          'I could not let you go alone, sir.\nNot even if you told me to.\nI hope you can forgive the secret.',
          'I will stay and keep the lamps lit.\nIf Gandalf comes, I can tell him\nwhere you have gone.',
          'The road may be watched.\nWe can pass under the High Hay\nand enter the forest at dawn.',
          'Then we shall go together.\nFor the first time tonight,\nthe road feels less lonely.',
        ],
        set: 'crickhollowSupper',
        objective: 'Rest at Crickhollow before the morning departure',
      },
    ],
  },
  crickhollow_baths: {
    name: 'Hot Water and Dry Towels',
    lines: [
      'Steam curls above the waiting tubs.\nAfter the road and the river,\neven the soap smells welcoming.',
    ],
  },
  crickhollow_belongings: {
    name: 'A Little of Bag End',
    lines: [
      'Familiar cups and well-used books\nhave travelled ahead of you.\nFor a moment, this feels like home.',
    ],
  },
  crickhollow_hearth: {
    name: 'The Hearth',
    lines: [
      'The fire settles with a soft crack.\nCrockery clinks behind you;\nsomeone is laying another place.',
    ],
  },
  crickhollow_garden: {
    name: 'The Kitchen Garden',
    lines: [
      'Neat beds lie inside the low hedge.\nHerbs brush the path, and late\nflowers lean toward the cottage.',
    ],
  },
  crickhollow_hedge: {
    name: 'A Sheltered Lawn',
    lines: [
      'The house sits quietly among grass\nand a few trees. Beyond the hedge,\nBuckland grows still for the night.',
    ],
  },
  fatty: {
    name: 'Fredegar Bolger',
    lines: [
      'I can face an empty house better\nthan that forest. Leave the lamps\nand the pretending to me.',
      'If Gandalf comes, I will tell him\nwhich way you went. Take care\nof each other out there.',
    ],
  },
  hedge_gate: {
    name: 'Under the High Hay',
    stages: [
      {
        when: (f) => !f.hedgeEntered,
        lines: [
          'Dew drips above the tunnel mouth.\nMerry opens the iron gate;\nthe ponies hesitate behind him.',
          'Beyond the hedge, wet trunks stand\nclose together. Even your footsteps\nseem to be listened to.',
        ],
        set: 'hedgeEntered',
        objective: 'Explore the paths of the Old Forest',
      },
      { lines: ['The gate is behind you now.\nA pale path winds between\nthe crowded trees.'] },
    ],
  },
  forest_glade: {
    name: 'Bonfire Glade',
    stages: [
      {
        when: (f) => !f.bonfireSeen,
        lines: [
          'Grass opens around blackened stumps.\nAbove them, a patch of sky\nlooks almost startlingly blue.',
          'Merry recalls trees crowding the\nhedge, and Bucklanders burning them.\nThe forest has kept the scar.',
        ],
        set: 'bonfireSeen',
      },
      {
        lines: [
          'No young tree grows among\nthese old scars. The path\ncontinues toward higher ground.',
        ],
      },
    ],
  },
  forest_hill: {
    name: 'Above the Trees',
    stages: [
      {
        when: (f) => !f.hillSeen,
        lines: [
          'The hill lifts you into sunlight.\nBeyond the treetops, the downs\nstand faint against the east.',
          'Below, the paths vanish in leaves.\nThe ponies crop the short grass\nwhile Merry studies the land.',
        ],
        set: 'hillSeen',
        objective: 'Find a way onward through the forest',
      },
      {
        lines: [
          'The eastern hills look near.\nBetween you and them lies\na whole sea of branches.',
        ],
      },
    ],
  },
  forest_north: {
    name: 'The Northern Path',
    stages: [
      {
        when: (f) => !f.northTried,
        lines: [
          'You try to turn north. Brambles\nclose the rising ground; the only\nclear footing bends downhill.',
          'Merry checks the sun again.\nSomehow, every easy turning\nhas led you farther south.',
        ],
        set: 'northTried',
        objective: 'Follow the descending hollows toward the river',
      },
      { lines: ['The northern slope is choked.\nFollow the open hollow downhill.'] },
    ],
  },
  forest_hollow: {
    name: 'The Descending Hollow',
    stages: [
      {
        when: (f) => !f.hollowSeen,
        lines: [
          'The banks rise on either side.\nRoots grip the earth overhead;\nthe air grows warm and still.',
          'Water murmurs somewhere below.\nThe narrow way keeps drawing\nyou toward that sound.',
        ],
        set: 'hollowSeen',
        objective: 'Reach the Withywindle',
      },
      { lines: ['Under the hush of the leaves,\nyou can hear running water.'] },
    ],
  },
  forest_song: {
    name: 'Frodo',
    stages: [
      {
        when: (f) => !f.forestSong,
        lines: [
          'You try a walking tune to hearten\nthe others. Your voice sounds small\nunder the motionless branches.',
          'The final note dies quickly.\nNobody starts the next verse.',
        ],
        set: 'forestSong',
      },
      { lines: ['You listen instead. A leaf falls;\nfor a moment, it is the only sound.'] },
    ],
  },
  forest_roots: {
    name: 'Knotted Roots',
    lines: [
      'Roots cross the trail like ropes\nleft out overnight. There is room\nto step carefully between them.',
    ],
  },
  forest_pool: {
    name: 'A Still Pool',
    lines: [
      'The pool holds an upside-down sky.\nA falling leaf breaks it into\nsmall, trembling pieces.',
    ],
  },
  forest_oaks: {
    name: 'Old Oaks',
    lines: [
      'Moss fills the deep folds of bark.\nYou cannot find a face there\nuntil you stop looking for one.',
    ],
  },
  forest_track: {
    name: 'A Fading Track',
    lines: [
      'For a few yards the way is plain.\nThen fern and fallen twigs\nmake a secret of it again.',
    ],
  },
  river_lilies: {
    name: 'Water-lilies',
    lines: [
      'White flowers float beyond the bank.\nTheir stems bend with a current\nthat hardly wrinkles the surface.',
    ],
  },
  river_reeds: {
    name: 'The Reeds',
    lines: [
      'Something rustles in the reeds.\nThe sound travels beside you,\nthen stops when you stop.',
    ],
  },
  willow_sleep: {
    name: 'Old Man Willow',
    stages: [
      {
        when: (f) => f.willowFreed,
        lines: ['The shade is empty of your friends.\nKeep together and go east.'],
      },
      {
        when: (f) => !f.willowTrapped,
        lines: [
          'The leaves whisper of cool water.\nYour eyelids sink. Frodo slips\nforward into the river.',
          'Sam catches Frodo by the jacket.\nHelp him pull against the root!',
          'Their voices come through the bark.\nExamine the split in the trunk.',
        ],
        set: 'willowTrapped',
        objective: 'Examine the willow trunk to help Merry and Pippin',
      },
      { lines: ['Merry and Pippin are inside!\nExamine the willow trunk.'] },
    ],
  },
  willow_trunk: {
    name: 'The Closing Trunk',
    stages: [
      {
        when: (f) => f.willowFreed,
        lines: [
          "Only bark and a narrow crack remain.\nYour friends are safe. Go east\ntoward Tom and Goldberry's house.",
        ],
      },
      {
        when: (f) => !f.willowTrapped,
        lines: [
          'A dark split marks the trunk.\nThe heavy shade beside it\nlooks dangerously inviting.',
        ],
      },
      {
        when: (f) => !f.willowFireFailed,
        lines: [
          'Fallen twigs lie against the bark.\nPerhaps fire will open the cracks.',
          'Merry cries out: the tree tightens!\nPut out the fire before it hurts him.',
          'Strength and fire have failed.\nRun west along the river\nand call for help.',
        ],
        set: 'willowFireFailed',
        objective: 'Run west along the river and call for help',
      },
      { lines: ['The bark will not yield.\nRun west and call for help.'] },
    ],
  },
  willow_help: {
    name: 'A Voice on the River Path',
    stages: [
      {
        when: (f) => !f.willowFireFailed,
        lines: [
          'The path follows the river.\nReturn to the willow; your\nfriends may need you there.',
        ],
      },
      {
        when: (f) => !f.tomArrived,
        lines: [
          'The reeds rustle beside the path.\nCall out for anyone who can help!',
          'A blue-coated man comes striding\nwith yellow boots and an armful\nof lilies for Goldberry.',
          'Tom hears you out, then hurries\ntoward the willow. Follow him\nback to the trunk.',
        ],
        set: 'tomArrived',
        objective: 'Return to the willow trunk with Tom',
      },
      { lines: ['Tom has gone to the willow.\nReturn to the trunk.'] },
    ],
  },
  willow_tom: {
    name: 'Tom Bombadil',
    stages: [
      {
        when: (f) => !f.tomArrived,
        lines: ['No answering voice here yet.\nSeek help on the river path\nwest of the willow.'],
      },
      {
        when: (f) => !f.willowFreed,
        lines: [
          'Tom lays a hand against the bark.\nHis song turns stern; each word\nfalls clear through the rustling.',
          "The cracks open at Tom's command.\nMerry and Pippin are within reach!",
          'Tom gathers his lilies again.\nFollow the river east: a warm\nhouse waits beyond the trees.',
        ],
        set: 'willowFreed',
        objective: "Follow the river east to Tom and Goldberry's house",
      },
      {
        lines: [
          'Stay together, little travellers.\nGo east to the house beyond\nthe edge of the forest.',
        ],
      },
    ],
  },
  tom: {
    name: 'Tom Bombadil',
    lines: [
      'Boots by the hearth, rain on the roof!\nThere is time here for listening,\nand time for a comfortable meal.',
    ],
  },
  goldberry: {
    name: 'Goldberry',
    lines: [
      'The river has brought you safely.\nLet the water and the lamplight\ntake some of your weariness.',
    ],
  },
  house_welcome: {
    name: 'Goldberry',
    stages: [
      {
        when: (f) => !f.houseWelcomed,
        lines: [
          'Among bowls of floating lilies,\na woman rises to greet you.\nHer green gown catches the light.',
          'The door closes on the forest.\nGoldberry welcomes all four\nof you to the waiting table.',
        ],
        set: 'houseWelcomed',
        objective: 'Join Tom and Goldberry for supper at the table',
      },
      { lines: ['You are welcome here.\nThe table is ready.'] },
    ],
  },
  house_supper: {
    name: 'The Supper Table',
    stages: [
      {
        when: (f) => !f.houseWelcomed,
        lines: ['Goldberry waits to welcome you.\nGreet her before sitting down.'],
      },
      {
        when: (f) => !f.houseSupper,
        lines: [
          'Bread, cream and honey crowd\nthe polished table. Clear water\nseems to warm you like wine.',
          'Talk comes easily again.\nAfter supper, clean beds wait\nbeyond the lamplit room.',
        ],
        set: 'houseSupper',
        objective: 'Sleep in the guest beds',
      },
      { lines: ['The dishes have been cleared.\nYour beds are ready.'] },
    ],
  },
  house_bed: {
    name: 'The Guest Beds',
    stages: [
      {
        when: (f) => f.houseRested,
        lines: ['Morning light fills the room.\nSpeak with Tom before leaving\nfor the downs.'],
      },
      {
        when: (f) => !f.houseSupper,
        lines: ['Clean sheets can wait a little.\nFirst join your hosts for supper.'],
      },
      {
        when: (f) => !f.houseNightOne,
        lines: [
          'On the first night, Frodo dreams\nof a great tower and a prisoner\nunder a troubled sky.',
          'Wings cross the darkness.\nHe wakes to rain at the windows\nand the smell of breakfast.',
        ],
        set: 'houseNightOne',
        objective: "Listen to Tom's stories while the rain falls",
      },
      {
        when: (f) => f.houseStories && f.houseRing,
        lines: [
          "On the second night, a grey veil\nin Frodo's dream thins to reveal\na green land under new sunlight.",
          'Morning comes clear. The forest\nseems distant now, though its\nwet leaves shine below the house.',
        ],
        set: ['houseRested', 'chapter2Complete'],
        objective: 'Ask Tom for farewell counsel before crossing the downs',
      },
      {
        lines: ['It is still the rainy morning.\nJoin Tom by the hearth;\nthere is more to hear.'],
      },
    ],
  },
  house_stories: {
    name: "Tom's Stories",
    stages: [
      {
        when: (f) => f.houseRing,
        lines: ['The Ring is safely put away.\nThe guest beds are ready\nfor your second night.'],
      },
      {
        when: (f) => !f.houseNightOne,
        lines: ['There will be time for old tales.\nEat and sleep first.'],
      },
      {
        when: (f) => !f.houseStories,
        lines: [
          'Rain threads the windows as Tom\nspeaks of roots, rivers, and trees\nolder than the roads of Men.',
          'His tales reach beyond the forest\nto forgotten kings on the downs.\nOutside, the whole day grows wet.',
          'Frodo finds himself speaking\nof his own road, and of the\nsmall burden in his pocket.',
        ],
        set: 'houseStories',
        objective: 'Show Tom the Ring by the hearth',
      },
      {
        lines: [
          'The rain is easing. Frodo still\nhas something to show Tom:\nthe Ring he carries.',
        ],
      },
    ],
  },
  house_ring: {
    name: "The Ring in Tom's Hand",
    stages: [
      {
        when: (f) => !f.houseStories,
        lines: [
          'Tom is not yet asking about\nyour burden. Listen to his\nstories after your first night.',
        ],
      },
      {
        when: (f) => !f.houseRing,
        lines: [
          'Tom turns the Ring in his fingers\nand slips it on. He remains\nplainly visible, smiling.',
          'When Frodo tries it himself,\nTom looks straight at him.\nThe hiding has not worked on Tom.',
          'Frodo puts it safely away.\nNight settles on the house again;\nreturn to the guest beds.',
        ],
        set: 'houseRing',
        objective: 'Return to bed for the second night',
      },
      {
        lines: [
          "The Ring is back in your keeping.\nTom's strange freedom from it\noffers no answer for your road.",
        ],
      },
    ],
  },
  house_farewell: {
    name: "Tom's Farewell Counsel",
    stages: [
      {
        when: (f) => !f.houseRested,
        lines: [
          'Do not hurry away unrested.\nThere are two nights of shelter\nhere before the road resumes.',
        ],
      },
      {
        when: (f) => !f.learnedSong,
        lines: [
          'Tom gives Frodo a verse to call him\nby, if trouble finds them while they\nare still inside his own country.',
          'Ho! Tom, old Tom, Tom of the meadow!\nBy fern and fountain, by sun and\nshadow,',
          'By the green of your door, by your\nfire, hear us and help us: our\nneed is dire!',
          'Frodo says it over until the words\nsit easily, and Tom nods at him\nlike a man closing a gate.',
          'Keep to the green grass, he says.\nDo not go near cold stone, and do\nnot sleep in the shadow of it.',
        ],
        set: ['learnedSong', 'chapter3'],
        give: 'tom_song',
        objective: 'Cross the downs toward the East Road',
      },
      { lines: ['You remember the summoning verse.\nThe downs await beyond the house.'] },
    ],
  },
  house_lilies: {
    name: "Goldberry's Lilies",
    lines: [
      'The white flowers Tom carried\nfloat in earthen bowls. River light\nseems to linger on their petals.',
    ],
  },
  downs_farewell: {
    name: 'The Way You Came',
    stages: [
      {
        when: (f) => !f.goldberryFarewell,
        lines: [
          'Turning back, you can still see the\ngreen edge of the valley, and a small\nbright figure standing above it.',
          'Goldberry lifts her hand and points\neast along the chalk. Then a fold of\nthe hills takes the house away.',
        ],
        set: 'goldberryFarewell',
      },
      {
        lines: [
          'Only hills behind you now, one\nbehind another, and the track\nrunning white between them.',
        ],
      },
    ],
  },
  downs_view: {
    name: 'The Open Downs',
    lines: [
      'The turf runs bare to every skyline.\nAfter the roof of the forest you can\nsee a very long way, and it is empty.',
      'Ridge behind ridge, going grey with\ndistance, and on the far ones the\nsmall dark teeth of standing stones.',
    ],
  },
  downs_mounds: {
    name: 'Grassy Mounds',
    lines: [
      'Round green mounds lie in the hollow,\neach ringed with worn kerbstones\nnearly swallowed by the turf.',
      'Somebody was buried here, long\nenough ago that nobody remembers\nwho, or minded them being forgotten.',
      'A bird calls once above them. The\nsilence that answers is deeper than\nthe silence before it.',
    ],
  },
  downs_heather: {
    name: 'In the Heather',
    lines: [
      'Below the wind, the heather holds\na little warmth. Tiny flowers crowd\ntogether between the blades of grass.',
      'From here the chalk track is hidden.\nYou can hear the wind moving over\nthe ridge above your heads.',
    ],
  },
  downs_weathered: {
    name: 'Weathered Stone',
    lines: [
      'Pale lichen fills the cracks. One\nedge has crumbled into the turf;\nthe other still catches the sun.',
      'From the track it was a small grey\nmark. Standing beside it, you have\nto look up.',
    ],
  },
  downs_stone: {
    name: 'The Great Stone',
    stages: [
      {
        when: (f) => !f.downsFog,
        lines: [
          'The track climbs to a single stone,\ntaller and darker than the rest,\nstanding alone on the hilltop.',
          'It is cold under your hand, though\nthe sun is high. Its shadow points\nnorth, and it is very good to sit in.',
          'You eat, and the warmth makes you\nheavy, and one after another the\nfour of you fall asleep against it.',
          'You wake to a roof of mist. The sun\nis gone, the ponies are gone, and\nthe cold has got into your clothes.',
          'Somewhere out in the white your\nfriends are calling. The chalk runs\nnorth-east. Follow it.',
        ],
        set: 'downsFog',
        objective: 'Follow the chalk north-east to the two stones',
      },
      {
        lines: [
          'The stone goes up into blank mist\nand does not end. Keep to the chalk;\nit runs north-east to two stones.',
        ],
      },
    ],
  },
  downs_gate: {
    name: 'The Two Stones',
    stages: [
      {
        when: (f) => !f.downsFog,
        lines: [
          'Two stones stand on the shoulder\nof the hill, leaning a little\ntoward one another.',
          'They are set like the posts of a\ndoor with no lintel over it and\nnothing at all on the far side.',
        ],
      },
      {
        when: (f) => !f.downsSeparated,
        lines: [
          'The two stones show black and close\nin the mist. Beyond them the voices\nof your friends are calling.',
          'They go by you in the white, one\nafter another, and each call comes\nfrom further off than the last.',
          'You go through after them. The mist\nshuts behind you like a door, and\nthere is nobody there at all.',
        ],
        set: 'downsSeparated',
        objective: 'Follow the voices north-east into the mist',
      },
      {
        lines: ['The stones are behind you now.\nThe voices went on north-east.'],
      },
    ],
  },
  downs_voices: {
    name: 'Voices in the Mist',
    stages: [
      {
        when: (f) => !f.downsSeparated,
        lines: ['The hills lie quiet. Whatever you\nheard, it is not out here now.'],
      },
      {
        when: (f) => !f.barrowTaken,
        lines: [
          'A voice calls, thin and a long way\noff. You run at it, and the ground\nrises where you did not expect it.',
          'The mist closes. Something cold\ntakes hold of your arm, and a tall\nshape leans down over you.',
          'The hillside goes out from under\nyour feet, and the dark comes\ntogether over your head.',
        ],
        set: 'barrowTaken',
        objective: 'Find your companions inside the barrow',
      },
      { lines: ['The voices have fallen silent.'] },
    ],
  },
  barrow_wake: {
    name: 'Waking in the Dark',
    stages: [
      {
        when: (f) => f.barrowTaken && !f.barrowWoke,
        lines: [
          'You come round flat on your back on\ncold stone, in a light that is green\nand comes from nowhere in the wall.',
          'Sam, Merry and Pippin lie in a row\nbeside you, white-dressed and\ncircleted, with their hands folded.',
          'A long naked sword has been laid\nacross the three of them at the neck.\nNone of them is breathing hard.',
          'From the far end of the chamber a\nvoice begins to sing, slow and cold,\nabout dead things staying dead.',
        ],
        set: 'barrowWoke',
        objective: 'Do not leave your friends where they lie',
      },
      { lines: ['The cold song goes on at the far\nend of the chamber.'] },
    ],
  },
  barrow_courage: {
    name: 'Frodo in the Barrow',
    stages: [
      { when: (f) => !f.barrowTaken, lines: ['There is no danger to face here yet.'] },
      {
        when: (f) => !f.barrowCourage,
        lines: [
          'You could put on the Ring. You are\nfairly sure it would hide you, and\nthat you could find the way out.',
          'Round the corner of the wall comes\nan arm with no body behind it,\nwalking on its fingers.',
          'It drags itself toward the row of\nsleepers, and then past them,\ntoward you, and it is in no hurry.',
          'There is a short sword lying loose\non the stones beside your hand.\nThe Ring stays in your pocket.',
        ],
        set: 'barrowCourage',
        objective: 'Sing the verse Tom taught you',
      },
      {
        lines: [
          'The severed hand lies still where\nyou struck it. Now call Tom, in the\nwords he gave you in his house.',
        ],
      },
    ],
  },
  barrow_hoard: {
    name: 'The Heaped Treasure',
    stages: [
      {
        when: (f) => !f.barrowCourage,
        lines: ['Not yet. There is something moving\nat that end of the chamber.'],
      },
      {
        lines: [
          'Gold and pale silver are heaped\nalong the far wall, with spears\nstacked against it, going to rust.',
          'Nothing here has been touched for\na very long time, and none of it\nlooks as though it wants to be.',
        ],
      },
    ],
  },
  barrow_call: {
    name: 'The Verse Tom Taught',
    stages: [
      {
        when: (f) => !f.barrowCourage,
        lines: ['Your friends are lying under a\nsword. Deal with that first.'],
      },
      {
        when: (f) => !f.barrowRescued,
        lines: [
          'The cold singing starts again and\nthe dark leans in. Frodo stands up\nin it and remembers a small tune.',
          'Ho! Tom, old Tom, Tom of the meadow!\nBy fern and fountain, by sun and\nshadow,',
          'By the green of your door, by your\nfire, hear us and help us: our\nneed is dire!',
          'Nothing. Then, a long way off and\ncoming quickly, somebody is singing\nback through the solid earth.',
          'The end of the chamber falls in.\nDaylight comes through the gap all\nat once, and the cold song stops.',
          'Tom stoops in with the sun behind\nhim, and the dark goes out of the\nbarrow the way water leaves a cup.',
        ],
        set: 'barrowRescued',
        objective: 'Examine the treasures Tom brought into daylight',
      },
      { lines: ['Daylight fills the broken roof.\nYour companions are safe.'] },
    ],
  },
  barrow_broken: {
    name: 'The Broken Mound',
    lines: [
      'The mound stands open behind you,\nits turf roof thrown back and its\ninside quite ordinary in daylight.',
      'It is hard to believe how big the\ndark in there felt an hour ago.\nIt is only a hole in a hill.',
    ],
  },
  barrow_treasure: {
    name: 'Blades from the Barrow',
    stages: [
      {
        when: (f) => !f.barrowRescued,
        lines: ['The cold treasure offers no help.\nCall Tom before touching it.'],
      },
      {
        when: (f) => !f.barrowBlades,
        lines: [
          'Tom carries the hoard out and lays\nit on the grass, and leaves it there\nfor anyone or anything to take.',
          'Out of it he picks four short blades,\nleaf-shaped, damasked in red and\ngold, one for each of you.',
          'They were forged against a kingdom\nin the north that has been gone a\nlong time. The edges are still keen.',
        ],
        set: 'barrowBlades',
        give: 'barrow_blades',
        objective: 'Find Tom and the missing ponies outside',
      },
      {
        lines: [
          'Each of you has a blade already.\nThe rest of the treasure lies open\nin the grass, and nobody takes it.',
        ],
      },
    ],
  },
  barrow_memory: {
    name: "Merry's Memory",
    stages: [
      { when: (f) => !f.barrowRescued, lines: ['Merry lies still.\nHe cannot answer you yet.'] },
      {
        lines: [
          'Merry sits up talking about a spear\nin his side, and men coming out of\nthe dark, and a king who fell here.',
          'Then it goes, the way a dream goes,\nand he cannot say a word of it back.\nHe looks at the three of you.',
          'He draws a long unsteady breath and\nasks, quite reasonably, what any of\nyou think you were doing.',
        ],
      },
    ],
  },
  barrow_ponies: {
    name: 'The Recovered Ponies',
    stages: [
      {
        when: (f) => !f.barrowBlades,
        lines: [
          'Before you leave, examine\nthe blades Tom has laid out\nwith the barrow treasure.',
        ],
      },
      {
        when: (f) => !f.poniesRecovered,
        lines: [
          'Tom whistles once, and the ponies\ncome up over the shoulder of the\nhill with his own fat pony leading.',
          'He calls them Sharp-ears, Wise-nose,\nSwish-tail, Bumpkin and White-socks,\nand they answer as if always so.',
          'The packs are on them and nothing\nis missing. Tom will come as far\nas the Road, and no further.',
        ],
        set: 'poniesRecovered',
        objective: 'Follow Tom to the East Road for his farewell',
      },
      { lines: ['The ponies are fed and ready.\nTom waits beside the East Road.'] },
    ],
  },
  road_farewell: {
    name: 'Tom at the East Road',
    stages: [
      {
        when: (f) => !f.poniesRecovered,
        lines: [
          'The ponies and your packs must\nbe recovered before you travel.\nFind Tom back by the barrow.',
        ],
      },
      {
        when: (f) => !f.chapter3Complete,
        lines: [
          'Tom stops where the grass meets\nthe road. His journeys remain\nwithin his own country.',
          'He advises the Prancing Pony\nin Bree. Beyond this boundary,\nyou must find other help.',
          'The four of you turn east together.\nBehind, Tom rides away singing.\nAhead lies the road to Bree.',
        ],
        set: 'chapter3Complete',
        objective: 'The East Road: next chapter not yet playable',
      },
      {
        lines: ['Tom has gone home.\nThe East Road leads toward Bree;\nthis chapter is complete.'],
      },
    ],
  },
  road_east: {
    name: 'The East Road',
    stages: [
      {
        when: (f) => !f.chapter3Complete,
        lines: [
          'Before you take the road east,\nspeak to Tom where the path\nfrom the downs meets the road.',
        ],
      },
      {
        lines: [
          'CHAPTER THREE COMPLETE\nThe road to Bree lies ahead.',
          'The next chapter is not yet playable.\nYou can rest here or revisit\nthe sunlit barrow hill.',
        ],
      },
    ],
  },
};
