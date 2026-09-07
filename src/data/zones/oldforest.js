import { T } from '../tileTypes.js';
import { grove, clearing, trail, point, edge } from './journeyMap.js';
import { journeyCreate, journeyUpdate, journeyDialogue } from '../../events/journeyEvent.js';

const gateMap = grove(64,44);
clearing(gateMap,16,14,9,7);
clearing(gateMap,43,30,8,6);
clearing(gateMap,11,34,6,5);
clearing(gateMap,43,9,6,4);
trail(gateMap,[[0,22],[9,22],[9,14],[28,14],[28,30],[43,30],[43,21],[63,21]]);
trail(gateMap,[[9,22],[11,22],[11,34]]);
trail(gateMap,[[28,14],[35,14],[35,9],[43,9]]);
for (const [x,y] of [[13,12],[19,15],[17,10],[12,17]]) gateMap[y][x]=T.ROOTS;

/** @type {import('../types.js').Zone} */
export const forestgate = {
  key:'forestgate', label:'The Old Forest', music:'oldforest', map:gateMap,
  spawns:{west:{x:2,y:22,dir:'right'},east:{x:61,y:21,dir:'left'}},
  npcs:[],doors:[],signs:[],
  interactions:[point(16,14,'forest_glade','The Bonfire Glade'),point(11,34,'forest_oaks','Old oaks'),point(43,9,'forest_pool','Still water'),point(43,30,'forest_song','Try a walking song')],
  exits:[edge(0,22,'hedgetunnel','east'),edge(63,21,'forestheart','west')],
  onCreate:journeyCreate,onUpdate:journeyUpdate,onDialogueLine:journeyDialogue,
};

const heartMap = grove(72,52);
clearing(heartMap,18,18,9,7,T.DOWN_GRASS);
clearing(heartMap,38,7,6,4);
clearing(heartMap,47,37,9,6);
clearing(heartMap,18,41,7,5);
clearing(heartMap,60,21,6,4);
trail(heartMap,[[0,23],[8,23],[8,18],[29,18],[29,27],[37,27],[37,37],[55,37],[55,43],[71,43]]);
trail(heartMap,[[29,18],[33,18],[33,7],[38,7]]);
trail(heartMap,[[38,7],[45,7],[45,15],[51,15],[51,21],[60,21]]);
trail(heartMap,[[37,37],[31,37],[31,41],[18,41]]);
for (let x=42;x<52;x++) heartMap[39][x]=T.ROOTS;
/** @type {import('../types.js').Zone} */
export const forestheart = {
  key:'forestheart',label:'Under the Listening Boughs',music:'oldforest',map:heartMap,
  spawns:{west:{x:2,y:23,dir:'right'},east:{x:69,y:43,dir:'left'}},
  npcs:[],doors:[],signs:[],
  interactions:[point(18,18,'forest_hill','Climb the grassy knoll'),point(38,7,'forest_north','Look for a northern way'),point(47,37,'forest_hollow','The steep-sided hollow'),point(18,41,'forest_roots','Roots across the hollow'),point(60,21,'forest_track','A dwindling track')],
  exits:[edge(0,23,'forestgate','east'),edge(71,43,'withywindle','west')],
  onCreate:journeyCreate,onUpdate:journeyUpdate,onDialogueLine:journeyDialogue,
};

const riverMap = grove(80,38);
// Walk beside the river, on its northern bank, then east toward Tom's home.
for (let x=1;x<79;x++) {
  const bank = 27 + Math.round(Math.sin(x/12)*2);
  for (let y=bank;y<37;y++) riverMap[y][x] = T.DARK_WATER;
  for (let y=bank-5;y<bank;y++) riverMap[y][x] = T.FOREST_FLOOR;
  if (x%7===0) riverMap[bank][x]=T.LILIES;
}
clearing(riverMap,47,20,11,7);
clearing(riverMap,24,15,7,4);
trail(riverMap,[[0,14],[10,14],[10,22],[24,22],[24,20],[65,20],[65,16],[79,16]]);
trail(riverMap,[[24,22],[24,15]]);
// The actual trunk is impassable. Its composite canopy is drawn above it.
for(let y=17;y<=19;y++) for(let x=47;x<=50;x++) riverMap[y][x]=T.OLD_TREE;
riverMap[20][48]=T.ROOTS;
/** @type {import('../types.js').Zone} */
export const withywindle = {
  key:'withywindle',label:'The Withywindle',music:'oldforest',map:riverMap,
  spawns:{west:{x:2,y:14,dir:'right'},east:{x:77,y:16,dir:'left'},willow:{x:43,y:22,dir:'right'}},
  npcs:[],doors:[],signs:[],
  interactions:[
    point(48,21,'willow_trunk','Examine the willow',f=>!f.tomArrived && !f.willowFreed),
    point(29,20,'willow_help','Call for help',f=>f.willowFireFailed && !f.tomArrived),
    point(46,21,'willow_tom','Tom Bombadil',f=>f.tomArrived && !f.willowFreed),
    point(24,15,'river_lilies','Water-lilies'),point(66,23,'river_reeds','The river path'),
  ],
  exits:[{...edge(0,14,'forestheart','east'), blockedWhen:f=>f.willowTrapped&&!f.willowFreed, denied:'Your friends are trapped. Seek help along this riverbank.'},edge(79,16,'tomclearing','west','willowFreed','Stay with your companions by the willow.')],
  onCreate:journeyCreate,onUpdate:journeyUpdate,onDialogueLine:journeyDialogue,
};
