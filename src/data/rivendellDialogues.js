import { RIVENDELL_BEATS, isRvBeat, councilNow } from '../state/rivendellProgress.js';

// Original paraphrases: Fellowship Book I ch. 12 and Book II ch. 1–3. No film
// staging; poems and songs are summarised, never quoted. Each page is wrapped to
// at most three lines of forty characters (the tests hold every page to that).

/** Wrap one page of prose to the dialogue box: 40 columns, 3 rows at most. */
export function wrap(text, width = 40) {
  const out = [];
  for (const para of text.split('\n')) {
    let line = '';
    for (const word of para.split(/\s+/).filter(Boolean)) {
      const next = line ? `${line} ${word}` : word;
      if (next.length > width && line) {
        out.push(line);
        line = word;
      } else line = next;
    }
    if (line) out.push(line);
  }
  return out.join('\n');
}
/**
 * Split prose into pages that fit the box. A page breaks after a sentence where
 * it can, and inside one only if a single sentence is longer than three rows.
 */
function fit(text) {
  const sentences = text.match(/[^.!?]+[.!?]+["”’]?\s*|[^.!?]+$/g) ?? [text];
  const out = [];
  let page = '';
  const rows = (t) => wrap(t).split('\n').length;
  for (const raw of sentences) {
    const sentence = raw.trim();
    if (rows(page ? `${page} ${sentence}` : sentence) <= 3)
      page = page ? `${page} ${sentence}` : sentence;
    else {
      if (page) out.push(wrap(page));
      page = sentence;
      while (rows(page) > 3) {
        const cut = wrap(page).split('\n');
        out.push(cut.slice(0, 3).join('\n'));
        page = cut.slice(3).join(' ');
      }
    }
  }
  if (page) out.push(wrap(page));
  return out;
}

/** Named pages the choreography hangs on: PAGE.rv_flood.sword is a page index. */
export const PAGE = {};
/**
 * Items are text, or [id, text] to name the first page of that text.
 * @param {string} key
 * @param {(string | [string, string])[]} items
 */
function pagesOf(key, items) {
  const lines = [];
  PAGE[key] = {};
  for (const item of items) {
    const [id, text] = Array.isArray(item) ? item : [null, item];
    if (id) PAGE[key][id] = lines.length;
    lines.push(...fit(text));
  }
  return lines;
}
const pages = (...texts) => texts.flatMap(fit);

/** @type {Record<string, [string, string[]]>} */
const scenes = {
  rv_flood: [
    'The Nine at the Ford',
    pagesOf('rv_flood', [
      [
        'turn',
        'On the far bank Frodo turns. The Nine sit their horses at the water’s edge, black and still.',
      ],
      [
        'enter',
        'The foremost spurs his horse into the stream. Frodo cannot move, and the Ring tugs at him to go back.',
      ],
      'Frodo cries out that they must turn back to Mordor and follow him no more. His voice is thin in his own ears.',
      'The Riders halt a moment, then laugh. THE RIDER: Come back! Come back to Mordor! We will take you there!',
      [
        'sword',
        'FRODO: I will not! You shall have neither the Ring nor me! His sword is in his hand before he knows it.',
      ],
      [
        'ride',
        'The three nearest ride on into the Ford. The foremost mocks him and lifts a hand to take what he came for.',
      ],
      [
        'roar',
        'Then a roaring comes down the valley: a rush of waters, rolling many stones. The Ford begins to rise.',
      ],
      [
        'horses',
        'Out of the flood come waves like white horses with shining riders, and the Nine are swept into the stream.',
      ],
      [
        'dark',
        'Frodo sees a figure of shining white, and behind it small dim shapes that wave red flames. Then darkness takes him.',
      ],
    ]),
  ],
  rv_wake: [
    'The house of Elrond',
    pagesOf('rv_wake', [
      [
        'open',
        'Frodo wakes in a soft bed. Sunlight lies along the ceiling, and he hears the sound of falling water.',
      ],
      'FRODO: Where am I? And what is the time? GANDALF: You are in the house of Elrond. It is mid-morning, the twenty-fourth of October, if you must know.',
      'FRODO: Gandalf! Why did you not come to Bree? GANDALF: I was delayed, and it nearly cost us all. I will tell it in due time.',
      'GANDALF: You have lain here for days. A splinter of the Riders’ blade worked toward your heart. Elrond drew it out.',
      [
        'gandalf',
        'GANDALF: A little longer and you would have become a wraith like them, and a servant of the Dark Lord.',
      ],
      'FRODO: And the Riders? The water? GANDALF: The river here answers to Elrond. It rose at his word, and I added the stones, I confess.',
      'GANDALF: The Riders have lost their horses, and the Nine are scattered. They will be no danger for a while.',
      [
        'sam',
        'The door opens and Sam comes in. SAM: Mr. Frodo! You’re awake at last! I sat by you till they sent me off to bed.',
      ],
      [
        'rest',
        'FRODO: Dear Sam. GANDALF: Rest, both of you. There is a feast tonight, and many to meet. Someone has been asking after you.',
      ],
    ]),
  ],
  rv_feast: [
    'The feast',
    pagesOf('rv_feast', [
      [
        'hall',
        'The hall is full of light and the low sound of voices. Lamps hang from the carven beams between the pillars.',
      ],
      [
        'welcome',
        'ELROND: Welcome to my house, Frodo. You have borne a great deal, and we are glad to see you at table.',
      ],
      [
        'arwen',
        'At his side sits Arwen, his daughter. Young she looks and yet not young, with the light of stars in her grey eyes.',
      ],
      [
        'gloin',
        'Beside Frodo sits a Dwarf in white and silver. GLOIN: Gloin son of Groin, at your service. FRODO: Frodo Baggins, at yours.',
      ],
      'GLOIN: I knew your uncle in his adventuring days. The Mountain prospers, and Dale is rebuilt. He is well remembered at Dain’s hall.',
      [
        'strider',
        'Among the lords sits Strider, so changed in his fine raiment that Frodo scarcely knows him.',
      ],
      [
        'bilbo',
        'A small voice calls from the bench. BILBO: Frodo, my lad! So you got here at last. I always said you would manage it!',
      ],
      'Bilbo is older than Frodo remembers: thin and white-haired, with the same bright eyes. Frodo takes his hand and cannot speak.',
      'The feast goes late. The Elves sing in the sweet, dim voices of the West, and a weariness lifts from Frodo that he did not know he bore.',
      [
        'end',
        'GANDALF: Come, Frodo. Bilbo will be in the Hall of Fire by now, and no feast ever ended better than with a song.',
      ],
    ]),
  ],
  rv_song: [
    'The Hall of Fire',
    pagesOf('rv_song', [
      [
        'fire',
        'The Hall of Fire is quiet. A great fire burns between carven pillars, and only a few lamps are lit.',
      ],
      'Bilbo is dozing in a corner. He wakes at Frodo’s step. BILBO: Ah, Frodo! Come to hear the song? I have made a new one.',
      [
        'recite',
        'He rises and speaks it to the hall: of Earendil the mariner, who sailed beyond the shadows to seek help for the world.',
      ],
      'The verses run on, of a ship, a jewel on a mariner’s brow and a lamp lit in the western heavens. Frodo’s eyes close.',
      [
        'lindir',
        'LINDIR: A fair song. But which lines are yours, Master Baggins, and which the Dunadan’s? Mortals are hard to tell apart.',
      ],
      'BILBO: Well, the Dunadan had a hand in it, I confess. But you will sing it again, I hope. Elves never tire of a song.',
      [
        'peep',
        'Later, when the hall is quiet, Bilbo leans close. BILBO: Frodo, my lad, might I see it? Only a peep, for old times’ sake.',
      ],
      [
        'shadow',
        'Frodo draws out the chain. A shadow falls between them, and for a moment Bilbo is a wrinkled creature with hungry, groping hands.',
      ],
      'Frodo closes his hand on the Ring and wants to strike. BILBO: I am sorry, dear boy. Sorry you are burdened with it. Do adventures never end? Someone else must carry on the story.',
      [
        'sleep',
        'Bilbo’s head sinks, and he sleeps by the fire. Gandalf stands in the door. GANDALF: Rest well. Elrond calls a Council at dawn.',
      ],
    ]),
  ],
  rv_council1: [
    'The Council of Elrond',
    pagesOf('rv_council1', [
      [
        'dawn',
        'Morning on the porch above the river. The sun climbs over the far mountains, and the dew glitters on the yellow leaves.',
      ],
      'Elrond sits among them with Gandalf at his side. Elves, Dwarves and Men have come from far away. Frodo is called to a seat near.',
      'ELROND: You are called, friends, for a matter that touches every people under the sun. Hear one another, and let none speak alone.',
      [
        'gloin',
        'GLOIN: Dain sent me with grave news. A messenger from the Dark Land came to Erebor, offering rings and friendship.',
      ],
      'GLOIN: He asked only for word of a hobbit named Baggins, and of a small ring. Dain refused, and fear has grown in our halls.',
      'GLOIN: And Balin went long ago to Moria to reclaim it. No word has come from him since.',
      [
        'history',
        'ELROND: The Enemy seeks the One Ring. Hear its tale now, for it is not told in Mordor.',
      ],
      'ELROND: In the Second Age Sauron forged it in the Mountain of Fire. Elves and Men rose against him: the Last Alliance.',
      'ELROND: I stood on the slopes of Orodruin and saw Gil-galad and Elendil fall. Sauron was overthrown, and Isildur cut the Ring from his hand.',
      'ELROND: Isildur would not destroy it. It betrayed him at the Gladden Fields and was lost in the great river for an age.',
      [
        'boromir',
        'A pause falls. At the edge of the ring a tall, dark-haired Man rises, proud and stern. The next voice is Boromir’s.',
      ],
    ]),
  ],
  rv_council2: [
    'The Council of Elrond',
    pagesOf('rv_council2', [
      [
        'boromir',
        'BOROMIR: I come from Gondor, which stands against the Dark Land. In a dream my brother and I heard a voice: seek the Sword that was broken.',
      ],
      'BOROMIR: It spoke of Imladris, of Isildur’s Bane, and of a Halfling who should stand forth. I have ridden many days to find it.',
      [
        'aragorn',
        'Aragorn rises and lays a broken blade on the stone. ARAGORN: Here is the Sword that was Broken. I am Isildur’s heir.',
      ],
      'Boromir looks long at the shards. BOROMIR: Gondor needs the strength of Men in arms more than an old claim. ELROND: His line has kept the borders for years.',
      [
        'bilbo',
        'Bilbo tells, briefly and a little ashamed, how he found the Ring in a goblin-hole in the dark, and how a riddle won it.',
      ],
      [
        'ring',
        'ELROND: Bring it forth, Frodo. Frodo lays the Ring on the stone. A hush falls. Elrond names it: the Ruling Ring, Isildur’s Bane.',
      ],
      'Boromir stares at the golden circle as if he would take it. Gandalf’s hand rests, quiet, on the stone beside it.',
      [
        'saruman',
        'GANDALF: I sought the Ring’s tale with Saruman, whom I trusted most. But Saruman has turned. He holds Orthanc, and he too wants the Ring.',
      ],
      'GANDALF: He held me prisoner on the pinnacle. Gwaihir the Eagle bore me away. After that I rode hard, but days were lost. That is why I was late.',
      'GANDALF: Gollum was taken and made to speak. That is how the Nine learned the name Baggins, and the Shire.',
      [
        'legolas',
        'LEGOLAS: I am Legolas, from my father’s halls in Mirkwood. Gollum, whom Aragorn gave into our keeping, has slipped his guards. I came to tell you.',
      ],
    ]),
  ],
  rv_council3: [
    'The Council of Elrond',
    pagesOf('rv_council3', [
      [
        'debate',
        'Long they debate what is to be done. Some would send the Ring over the Sea, some would hide it, some would use it.',
      ],
      'BOROMIR: Why not use it against the Enemy? Gondor’s captains would hold it as a sword.',
      'ELROND: It cannot be used. It answers to its maker alone. GANDALF: To wield it is to be mastered by it. The strongest would fall soonest.',
      'ERESTOR: Then give it to Tom Bombadil, whom the Ring cannot master. GANDALF: He would lose it or forget it. It means nothing to him.',
      'GALDOR: Then send it over the Sea. GANDALF: Neither sea nor deep place will keep it. It must be unmade.',
      'ELROND: There is one way only: to cast it into the Fire of Orodruin, in Mordor, where it was made. The road is long and the choice hard.',
      [
        'silence',
        'A long silence falls over the porch. None will speak. Frodo is seized by a great dread, as if awaiting a doom.',
      ],
      [
        'speak',
        'At last, unwilling, Frodo speaks into the silence. FRODO: I will take the Ring, though I do not know the way.',
      ],
      'ELROND: This task is appointed for you, Frodo, if for anyone. The burden is yours, but you shall not go alone.',
      [
        'sam',
        'A rustle in the bushes under the window, and Sam bursts out. SAM: Mr. Frodo, you can’t leave me out of it!',
      ],
      [
        'end',
        'ELROND: Hardly can we part you from your master, even when he is summoned to a council and you are not. You shall go with him.',
      ],
    ]),
  ],
  rv_weeks: [
    'The turning of the year',
    pagesOf('rv_weeks', [
      [
        'fall',
        'The days go by in Rivendell, and the autumn gold fades. Leaves fall from the beeches, and a cold wind comes down from the mountains.',
      ],
      [
        'scouts',
        'Elrond’s scouts go out to the four quarters and come back one by one in the dark of the year.',
      ],
      'ELROND: They have found no sign of the Riders east of the river. Their horses lie drowned at the Ford, and the Nine are gone.',
      [
        'hobbits',
        'Merry and Pippin come up the garden path, grave for once. PIPPIN: We hear the Company is chosen, and we are not in it.',
      ],
      'PIPPIN: You may lock us up or send us home, but we shall follow. Will you leave us in a valley while Frodo goes into the Shadow?',
      'MERRY: We are friends of Frodo’s and will go with him, whatever the road. GANDALF: Faithful friends are wiser than their counsel. Let them go.',
      'ELROND: Then so be it. Nine shall be the Company, against the Nine Riders. Its members shall be Frodo’s companions.',
      [
        'snow',
        'The year turns. Snow lies on the high peaks, and the valley is silver and still. Bilbo has asked to see Frodo in his room before they go.',
      ],
    ]),
  ],
  rv_gifts: [
    'Bilbo’s room',
    pagesOf('rv_gifts', [
      [
        'room',
        'Bilbo’s room is warm with a small fire and the smell of old paper. He sits among his notes, older than before.',
      ],
      'BILBO: I am too old for the road. I would have come, you know. But someone must finish my book, and I fear it will be you.',
      [
        'sting',
        'BILBO: Here. He sets a sword in a worn sheath on the table. This is Sting. Its blade glows when Orcs are near.',
      ],
      [
        'mail',
        'BILBO: And this, from the Dwarves’ hoard, which Thorin gave me: a coat of mithril rings. Wear it under your clothes.',
      ],
      'Frodo tries to refuse. BILBO: Take them, my boy. I should like to think they went with you. Let no one see it.',
      'Frodo puts on the mail beneath his shirt. It is light as linen, cold as ice, and does not weigh at all.',
      [
        'snow',
        'They sit awhile by the fire, saying little. Outside, the first snow of the year comes down over Rivendell.',
      ],
    ]),
  ],
  rv_company: [
    'The Company of the Ring',
    pagesOf('rv_company', [
      [
        'gather',
        'On the twenty-fifth of December the Company gathers at the southern gate of Rivendell as the day dies.',
      ],
      [
        'names',
        'ELROND: Those who go are nine: Frodo and Sam; Merry and Pippin; Gandalf; Aragorn; Legolas, Gimli and Boromir. The Nine Walkers, against the Nine Riders.',
      ],
      'ELROND: Frodo, you alone bear the Ring. Do not cast it away, nor give it to the Enemy, nor let any touch it, save in direst need.',
      'ELROND: No oath binds you to go further than you will. Do not trust yourselves too far on the road.',
      'GIMLI: Faithless is he that says farewell when the road darkens. ELROND: Perhaps. But let no one swear to walk in the dark who has never seen night come.',
      [
        'sword',
        'At Aragorn’s side hangs the Sword that was Broken, forged anew. ARAGORN: Anduril, Flame of the West. It will be needed.',
      ],
      'Bilbo stands wrapped in a cloak at the edge of the gate, and says nothing. Frodo does not look back for long.',
      [
        'depart',
        'The Company sets out into the dusk, a long way south. Behind them the lamps of Rivendell burn, and the sound of the river fades.',
      ],
      [
        'end',
        'CHAPTER SIX COMPLETE\nThe Company of nine stands at the gate of Rivendell. The road south lies ahead.',
      ],
    ]),
  ],
};

const DONE = 'Chapter six complete · the Company of nine stands at the gate of Rivendell';

/** @type {Record<string, import('./types.js').Dialogue>} */
export const RIVENDELL_DIALOGUES = {};
for (const b of RIVENDELL_BEATS) {
  const [name, lines] = scenes[b.key];
  const next = RIVENDELL_BEATS[RIVENDELL_BEATS.indexOf(b) + 1];
  RIVENDELL_DIALOGUES[b.key] = {
    name,
    stages: [
      {
        when: (f) => isRvBeat(f, b.key),
        lines,
        set: b.flag,
        objective: next?.objective ?? DONE,
        ...(b.key === 'rv_gifts' ? { give: ['sting', 'mithril_coat'] } : {}),
      },
      {
        lines: [
          'There is no more to do here now.\nRecall your objective to find\nthe next step of the journey.',
        ],
      },
    ],
  };
}

/** A guest's talk changes with the story. First matching stage wins. */
const guest = (name, ...stages) => ({
  name,
  stages: stages.map(([when, text]) => ({
    ...(when ? { when } : {}),
    lines: pages(...[].concat(text)),
  })),
});
const done = (f) => f.chapter6Complete;
const chosen = (f) => f.ringBearerChosen;
const winter = (f) => f.weeksPassed;

Object.assign(RIVENDELL_DIALOGUES, {
  elrond: guest(
    'Elrond',
    [done, 'ELROND: Go now with my blessing. Whatever befalls, you will not walk unremembered.'],
    [
      winter,
      'ELROND: The road will not be easier for waiting. Choose the day when the wind is in the right quarter, and then do not delay.',
    ],
    [
      chosen,
      'ELROND: You have spoken, and I will not unsay it for you. Rest, and let us think who should go.',
    ],
    [councilNow, 'ELROND: Sit, Frodo. All will be heard before this day is out.'],
    [(f) => f.feastHeld, 'ELROND: The valley is yours as long as you stay. Do not hurry.'],
    [null, 'ELROND: You are welcome in this house. Eat, and let the rest wait.'],
  ),
  arwen: guest(
    'Arwen',
    [done, 'ARWEN: May the light of the stars go with you, Frodo.'],
    [
      chosen,
      'ARWEN: My father listens longer than he speaks. He has heard you, and he is troubled for you.',
    ],
    [null, 'ARWEN: Be at rest here, Frodo. Rivendell is a house of healing.'],
  ),
  gloin: guest(
    'Gloin',
    [
      done,
      'GLOIN: My son goes with you. I have asked him to keep his axe sharp and his temper short.',
    ],
    [
      chosen,
      'GLOIN: So the Ring is the thing. Strange that a Baggins should be mixed in it twice.',
    ],
    [councilNow, 'GLOIN: I have said my piece. Now it is for the wiser heads.'],
    [
      null,
      'GLOIN: Our halls are rich again, though not as rich as an old Dwarf remembers. I am glad of the ale here.',
    ],
  ),
  gimli: guest(
    'Gimli',
    [done, 'GIMLI: My axe is yours, Master Frodo, so long as I live.'],
    [chosen, 'GIMLI: If it comes to Moria, I will show you halls the Elves never dreamed of.'],
    [null, 'GIMLI: Ask me nothing yet. The Council has not heard all the Dwarves have to say.'],
  ),
  legolas: guest(
    'Legolas',
    [done, 'LEGOLAS: The road is long. A good light step carries a heavy load.'],
    [
      chosen,
      'LEGOLAS: Gollum is gone from my father’s halls, and I must tell my people. But I will go with you, I think.',
    ],
    [null, 'LEGOLAS: I came to tell the Council something it did not wish to hear.'],
  ),
  boromir: guest(
    'Boromir',
    [
      done,
      'BOROMIR: I will see you to the end of the road, Frodo. Or to the gates of Minas Tirith, as you wish.',
    ],
    [
      chosen,
      'BOROMIR: A hard counsel. I hold that Gondor can use any weapon it is offered. But I will not oppose the Council.',
    ],
    [null, 'BOROMIR: I have walked a hundred days to hear this. I do not regret it.'],
  ),
  lindir: guest(
    'Lindir',
    [
      chosen,
      'LINDIR: Master Baggins sings tolerably. The Dunadan sings better, but do not tell him I said so.',
    ],
    [null, 'LINDIR: A hall of song is best at evening. Sit by the fire, if you will.'],
  ),
  erestor: guest(
    'Erestor',
    [
      chosen,
      'ERESTOR: I proposed two paths and both were found wanting. It is the third path that remains.',
    ],
    [null, 'ERESTOR: The Council will not be short, and I fear it will not be sweet.'],
  ),
  galdor: guest(
    'Galdor',
    [
      chosen,
      'GALDOR: I came from the Havens on Cirdan’s errand. I did not expect to leave with a heavier heart.',
    ],
    [null, 'GALDOR: The Sea is far, and the Shadow is near. I will say what must be said.'],
  ),
  bilboelder: guest(
    'Bilbo',
    [done, 'BILBO: Off you go, then. And mind: no adventures before breakfast.'],
    [
      (f) => f.giftsGiven,
      'BILBO: Wear it under your shirt and tell no one. A good coat is its own best secret.',
    ],
    [
      chosen,
      'BILBO: I hear you are going. I shall be here, finishing the book. Come and see me before you go.',
    ],
    [(f) => f.hallOfFire, 'BILBO: Ah, Frodo. I am dozing a good deal, I find. Come when you like.'],
    [(f) => f.feastHeld, 'BILBO: Songs are best at night, my boy. And Elves are best at songs.'],
    [null, 'BILBO: Frodo, my lad! Sit by me and eat. There is plenty, and no one is hurrying us.'],
  ),
  gandalfrv: guest(
    'Gandalf',
    [done, 'GANDALF: Keep close, and keep your wits. I shall be near.'],
    [
      chosen,
      'GANDALF: A hard road lies ahead, but you will not walk it alone. Rest while you can.',
    ],
    [councilNow, 'GANDALF: Listen well, Frodo. There is more to this than any one tale can tell.'],
    [null, 'GANDALF: Eat, drink and be merry, Frodo. The road will come to us soon enough.'],
  ),
  dunadan: guest(
    'Aragorn',
    [
      done,
      'ARAGORN: I have a long road behind me and a longer one ahead. We shall walk it together.',
    ],
    [
      chosen,
      'ARAGORN: I was Strider to you at Bree. Here I am something else, and I do not know which of us finds it stranger.',
    ],
    [councilNow, 'ARAGORN: Sit quietly, Frodo. You will know soon enough what is asked of you.'],
    [
      null,
      'ARAGORN: In Bree I was a stranger and a ranger. Here I am called by another name, and I do not wear it easily.',
    ],
  ),
});

Object.assign(RIVENDELL_DIALOGUES, {
  rv_window: {
    name: 'The open window',
    lines: pages(
      'Through the open window comes the sound of falling water and a faint scent of trees and flowers, as if summer lingered.',
    ),
  },
  rv_book: {
    name: 'A heap of papers',
    lines: pages(
      'Papers lie in careful heaps, written in Bilbo’s neat hand: tales of the Shire, Elvish verses, and a half-finished account of his road.',
    ),
  },
  rv_pillars: {
    name: 'Carved pillars',
    lines: pages(
      'The pillars are carved with climbing leaves and stars. Firelight moves on them as if the carvings were alive.',
    ),
  },
  rv_hearth: {
    name: 'The great hearth',
    lines: pages(
      'The fire in the hall is never out, winter or summer. Few come here, except to sit and think or listen to a song.',
    ),
  },
  rv_bridge: {
    name: 'The narrow bridge',
    lines: pages(
      'A narrow bridge of stone crosses the river. Below it the water runs fast and clear over its stones.',
    ),
  },
  rv_falls: {
    name: 'The falls',
    lines: pages(
      'Far across the gorge a stream falls in a long white ribbon between dark firs. The sound is a constant murmur.',
    ),
  },
  rv_garden: {
    name: 'The garden beds',
    lines: pages(
      'Late flowers still hold their colour here, as if the cold had agreed to wait. A faint scent of herbs rises from the beds.',
    ),
  },
  rv_beech: {
    name: 'A golden beech',
    lines: pages(
      'A beech tree stands in full gold. Its leaves drift down onto the grass and are gone by morning.',
    ),
  },
  rv_roadsouth: {
    name: 'The road south',
    lines: pages(
      'Beyond the gate the road runs south into the dusk, toward the Misty Mountains and a land the hobbits have only heard of.',
      'That part of the journey is not yet playable. The Company will set out in the next chapter.',
    ),
  },
});
