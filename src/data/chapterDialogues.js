// Original paraphrase of Fellowship, Book I, chapters 5–8.
// Each string is one page; effects occur only when that page sequence closes.

/** @type {Record<string, import('./types.js').Dialogue>} */
export const CHAPTER_DIALOGUES = {
  crickhollow_departure: {
    name: 'Merry',
    stages: [
      {
        when: (f) => !f.chapter2,
        lines: [
          'We guessed you meant to leave.\nSam helped us piece it together.\nYou need not carry this alone.',
          'Fatty will keep the house looking\nlived in. The ponies are saddled;\nI am coming with you three.',
          'The road is watched. Our way lies\nunder the High Hay, through\nthe tunnel east of here.',
        ],
        set: ['chapter2', 'merryJoined'],
        join: 'merry',
        objective: 'Find the tunnel under the High Hay',
      },
      { lines: ['All ready. Take the eastern path\nto the tunnel under the hedge.'] },
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
          'Sam hauls him clear of a root.\nBehind them the trunk has closed\naround Merry and Pippin!',
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
          'Sam and Frodo kindle fallen twigs\nagainst the bark. Smoke curls up;\nMerry cries out from inside.',
          'The tree is squeezing him!\nYou stamp out the fire and\nthrow water on the embers.',
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
          'Frodo runs shouting into the trees.\nAn answering voice bounces\nthrough the reeds in song.',
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
          'The crack opens. Merry tumbles out;\nPippin follows, shaken but alive.\nSam catches hold of them both.',
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
          'Tom teaches you a verse to recall\nif trouble finds you in his country.\nFrodo repeats it until it stays.',
          'Keep to the open grass, he warns;\ndo not linger by standing stones.\nThe downs lead to the East Road.',
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
    name: 'Goldberry on the Hill',
    stages: [
      {
        when: (f) => !f.goldberryFarewell,
        lines: [
          'Turning back, you see Goldberry\non the hill behind you. Her hand\nrises bright against the sky.',
          'She points you toward the road.\nThen the folds of the downs\nhide the house from sight.',
        ],
        set: 'goldberryFarewell',
      },
      { lines: ['The hill behind is empty now.\nSunlight runs over the grass.'] },
    ],
  },
  downs_stone: {
    name: 'The Cold Standing Stone',
    stages: [
      {
        when: (f) => !f.downsFog,
        lines: [
          'At midday you rest beside the stone.\nIt is cold beneath your hand,\nthough the sun is high.',
          'You sleep. When you wake, mist\nhas filled the hollows and drawn\na roof over the hill.',
          'The ponies stir uneasily.\nBeyond the northern stones,\nyour companions call.',
        ],
        set: 'downsFog',
        objective: 'Seek your companions beyond the northern stones',
      },
      {
        lines: [
          'The stone rises into blank mist.\nSeek your companions beyond\nthe northern stones.',
        ],
      },
    ],
  },
  downs_voices: {
    name: 'Voices in the Mist',
    stages: [
      {
        when: (f) => !f.downsFog,
        lines: [
          'The stones stand quiet in daylight.\nThe midday resting place\nlies back on the hill.',
        ],
      },
      {
        when: (f) => !f.barrowTaken,
        lines: [
          'Frodo passes between the stones.\nBehind him, the hoofbeats stop.\nHe calls; the mist gives no answer.',
          'A distant cry draws him onward.\nSomething cold catches his arm.\nThe hillside falls into darkness.',
        ],
        set: 'barrowTaken',
        objective: 'Find your companions inside the barrow',
      },
      { lines: ['The voices have fallen silent.'] },
    ],
  },
  downs_mounds: {
    name: 'Grassy Mounds',
    lines: [
      'Long grass covers the old graves.\nA bird calls once above them;\nthe answering silence feels deep.',
    ],
  },
  downs_view: {
    name: 'The Open Downs',
    lines: [
      'Wind combs the treeless slopes.\nFor the first time since the hedge,\nyou can see a long way ahead.',
    ],
  },
  barrow_courage: {
    name: 'Frodo in the Barrow',
    stages: [
      { when: (f) => !f.barrowTaken, lines: ['There is no danger to face here yet.'] },
      {
        when: (f) => !f.barrowCourage,
        lines: [
          'In a greenish glimmer, your friends\nlie pale, dressed in white. A blade\nstretches across their necks.',
          'A hand crawls toward them. The Ring\ncould hide you; you might escape.\nBut they would still be here.',
          "Frodo seizes a sword lying nearby\nand strikes the reaching hand.\nNow he must remember Tom's verse.",
        ],
        set: 'barrowCourage',
        objective: "Recall Tom's verse and call for help",
      },
      { lines: ["You have chosen to stay with them.\nRemember Tom's verse. Call him."] },
    ],
  },
  barrow_call: {
    name: 'The Remembered Verse',
    stages: [
      {
        when: (f) => !f.barrowCourage,
        lines: ['Your companions lie in danger.\nFind the courage to defend them.'],
      },
      {
        when: (f) => !f.barrowRescued,
        lines: [
          "Frodo recalls the verse from\nTom's house and raises his voice.\nAn answer comes through the earth.",
          'Stone breaks. Daylight pours in.\nTom drives the darkness away,\nthen wakes your three companions.',
          'You stumble together onto the grass.\nThe morning air feels like\nsomething given back to you.',
        ],
        set: 'barrowRescued',
        objective: 'Examine the treasures Tom brought into daylight',
      },
      { lines: ['Daylight fills the broken doorway.\nYour companions are safe.'] },
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
          'Tom spreads the treasure in sunlight\nand chooses four short blades,\none for each of you.',
          'Their makers opposed a northern\nkingdom of darkness long ago.\nThe old steel is still keen.',
        ],
        set: 'barrowBlades',
        give: 'barrow_blades',
        objective: 'Find Tom and the missing ponies outside',
      },
      {
        lines: [
          'Each of you has a blade already.\nThe remaining treasure lies\nopen to the daylight.',
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
          "Merry wakes remembering a spear\nand a lost prince, as though\nsomeone else's death were his.",
          'The memory fades in the sunlight.\nHe looks at his friends and\ndraws a long, unsteady breath.',
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
          'Tom returns with the missing ponies.\nFatty Lumpkin, his own sturdy pony,\nhas been keeping them company.',
          'He calls them Sharp-ears, Wise-nose,\nSwish-tail, Bumpkin and White-socks.\nThey answer as if always so named.',
          'With packs restored, you can\nfollow Tom toward the East Road.',
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
