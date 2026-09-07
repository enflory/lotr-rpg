import { T } from '../tileTypes.js';
import { field, clearing, trail, point, edge } from './journeyMap.js';
import { journeyCreate, journeyUpdate, journeyDialogue } from '../../events/journeyEvent.js';

const hills=field(72,48,T.DOWN_GRASS,T.BARROW_WALL);
// Low ridges leave broad saddles. Empty turf and broken skylines contrast with the wood.
for(let y=5;y<44;y+=12) for(let x=8;x<66;x++)
  if(x%19>5) hills[y][x]=T.BARROW_WALL;
for(const [x,y] of [[11,8],[44,31],[63,39],[28,17],[51,12],[55,12]]) hills[y][x]=T.STANDING_STONE;
trail(hills,[[0,30],[18,30],[18,23],[28,23],[28,19]],1,T.DOWN_GRASS);
trail(hills,[[28,23],[38,23],[38,14],[53,14],[53,9],[60,9]],1,T.DOWN_GRASS);
/** @type {import('../types.js').Zone} */
export const downs={
  key:'downs',label:'Chapter 3 • The Barrow-downs',music:'downs',map:hills,
  spawns:{west:{x:2,y:30,dir:'right'},stone:{x:28,y:21,dir:'up'}},npcs:[],doors:[],signs:[],
  interactions:[point(9,30,'downs_farewell','Look back toward Goldberry'),point(28,19,'downs_stone','Rest beside the standing stone'),point(60,9,'downs_voices','Call to your companions',f=>f.downsFog),point(11,9,'downs_mounds','The green mounds'),point(44,32,'downs_view','Look across the downs')],
  exits:[edge(0,30,'tomclearing','east')],onCreate:journeyCreate,onUpdate:journeyUpdate,onDialogueLine:journeyDialogue,
};
const tomb=field(34,24,T.VOID,T.VOID);
for(let y=5;y<=19;y++) for(let x=4;x<=29;x++) tomb[y][x]=x===4||x===29||y===5||y===19?T.BARROW_WALL:T.BARROW_FLOOR;
for(let y=7;y<14;y++) tomb[y][19]=T.BARROW_WALL;
trail(tomb,[[15,16],[23,16],[23,10]],1,T.BARROW_FLOOR);
/** @type {import('../types.js').Zone} */
export const barrow={
  key:'barrow',label:'Under the Stone',music:'barrow',map:tomb,
  spawns:{default:{x:11,y:15,dir:'up'}},npcs:[],doors:[],signs:[],
  interactions:[point(15,13,'barrow_courage','Stand by your friends',f=>!f.barrowCourage),point(11,12,'barrow_call','Remember Tom’s song',f=>f.barrowCourage)],
  exits:[],onCreate:journeyCreate,onUpdate:journeyUpdate,onDialogueLine:journeyDialogue,
};
const morning=field(42,30,T.DOWN_GRASS,T.BARROW_WALL);
clearing(morning,17,12,10,7,T.DOWN_GRASS);
for(let y=5;y<12;y++) for(let x=11;x<25;x++) morning[y][x]=T.BARROW_WALL;
morning[11][17]=T.BARROW_FLOOR;
trail(morning,[[17,14],[29,14],[29,21],[41,21]],1,T.CHALK);
/** @type {import('../types.js').Zone} */
export const barrowhill={
  key:'barrowhill',label:'The Plain Light of Day',music:'bombadil',map:morning,
  spawns:{default:{x:17,y:14,dir:'down'},east:{x:39,y:21,dir:'left'}},npcs:[],doors:[],signs:[],
  interactions:[point(20,15,'barrow_treasure','The blades of Westernesse'),point(13,15,'barrow_memory','Merry remembers'),point(29,20,'barrow_ponies','Tom and the ponies')],
  exits:[edge(41,21,'eastroad','west','poniesRecovered','Wait for Tom to bring back the ponies.')],onCreate:journeyCreate,onUpdate:journeyUpdate,onDialogueLine:journeyDialogue,
};
const road=field(48,26,T.DOWN_GRASS,T.HEDGE);
trail(road,[[0,17],[12,17],[12,12],[47,12]],1,T.PATH);
for(let x=15;x<47;x+=5) road[9][x]=T.FLOWERS;
/** @type {import('../types.js').Zone} */
export const eastroad={
  key:'eastroad',label:'The East Road',music:'shire',map:road,
  spawns:{west:{x:2,y:17,dir:'right'}},npcs:[],doors:[],signs:[],
  interactions:[point(14,12,'road_farewell','Farewell to Tom'),point(43,12,'road_east','The road toward Bree')],
  exits:[edge(0,17,'barrowhill','east')],onCreate:journeyCreate,onUpdate:journeyUpdate,onDialogueLine:journeyDialogue,
};
