import { T } from '../tileTypes.js';
import { field, cottage, trail, point, edge } from './journeyMap.js';
import { journeyCreate, journeyUpdate, journeyDialogue } from '../../events/journeyEvent.js';

const home = field(40,28,T.GRASS,T.HEDGE);
for(let y=1;y<27;y++) for(let x=1;x<39;x++) {
  if(((x-20)/19)**2+((y-14)/13)**2>1) home[y][x]=T.HEDGE;
  else if((x*7+y*13)%11===0) home[y][x]=T.GRASS2;
}
for(const [x,y] of [[4,8],[26,5],[34,11],[7,23],[31,23]]) home[y][x]=T.TREE;
for(let y=8;y<=12;y++) for(let x=23;x<=28;x++) home[y][x]=(x+y)%3?T.GARDEN:T.FLOWERS;
for(const [x,y] of [[8,11],[10,11],[16,11],[18,11],[10,16],[16,16],[30,15]]) home[y][x]=T.FLOWERS;
trail(home,[[0,20],[13,20],[13,10]],0,T.PATH);
trail(home,[[13,20],[39,20]],0,T.PATH);
trail(home,[[21,20],[21,10],[23,10]],0,T.PATH);
for(let y=5;y<=8;y++) for(let x=7;x<=19;x++) home[y][x]=T.ROOF;
cottage(home,7,8,13);
for(const x of [18,19]) home[13][x]=T.COUNTER;
for(const x of [5,8]) home[13][x]=T.FENCE;
/** @type {import('../types.js').Zone} */
export const crickhollow = {
  key:'crickhollow',label:'Chapter 2 • Crickhollow',music:'shire',map:home,
  spawns:{default:{x:12,y:15,dir:'down'},west:{x:2,y:20,dir:'right'},east:{x:37,y:20,dir:'left'},house:{x:13,y:10,dir:'down'},morning:{x:13,y:10,dir:'down'}},
  npcs:[{key:'fatty',x:17,y:14,dir:'left',when:f=>f.crickhollowMorning||f.chapter2}],
  doors:[{x:13,y:9,zone:'crickhollowhouse',entry:'default'}],signs:[],
  interactions:[point(13,14,'crickhollow_departure','Merry'),point(24,20,'crickhollow_ponies','The waiting ponies',f=>f.crickhollowMorning||f.chapter2),point(22,10,'crickhollow_garden','The kitchen garden'),point(8,20,'crickhollow_hedge','The quiet lane')],
  exits:[edge(39,20,'hedgetunnel','west','chapter2','Speak with Merry at the cottage before departing.')],
  onCreate:journeyCreate,onUpdate:journeyUpdate,onDialogueLine:journeyDialogue,
};
const supperRoom=field(28,23,T.VOID,T.VOID);
for(let y=3;y<=19;y++) for(let x=3;x<=24;x++) supperRoom[y][x]=x===3||x===24||y===3||y===19?T.WALL:T.FLOOR;
for(let x=10;x<=15;x++) for(let y=9;y<=10;y++) supperRoom[y][x]=T.TABLE;
for(const x of [7,20]) supperRoom[3][x]=T.WINDOW_I;
supperRoom[7][3]=T.FIREPLACE;
for(const x of [5,6,7]) supperRoom[5][x]=T.WATER;
for(const x of [18,19,20,21]) supperRoom[5][x]=T.SHELF;
for(const x of [6,9,12,15,18]) supperRoom[16][x]=T.BED;
for(let y=19;y<=22;y++) supperRoom[y][20]=T.FLOOR;
/** @type {import('../types.js').Zone} */
export const crickhollowhouse = {
  key:'crickhollowhouse',label:'Supper at Crickhollow',music:'interior',map:supperRoom,
  spawns:{default:{x:20,y:18,dir:'up'}},
  npcs:[],doors:[],signs:[],
  interactions:[point(12,12,'crickhollow_supper','Sit down to supper'),point(6,6,'crickhollow_baths','The steaming baths'),point(20,6,'crickhollow_belongings','Familiar things from Bag End'),point(5,10,'crickhollow_hearth','The warm hearth')],
  exits:[edge(20,22,'crickhollow','house')],
  onCreate:journeyCreate,onUpdate:journeyUpdate,onDialogueLine:journeyDialogue,
};
const tunnel = field(36,18,T.HEDGE,T.HEDGE);
trail(tunnel,[[0,9],[35,9]],1,T.CHALK);
for(let x=9;x<=26;x++) for(let y=5;y<=12;y++) tunnel[y][x] = y>=8&&y<=10 ? T.BARROW_FLOOR : T.BARROW_WALL;
/** @type {import('../types.js').Zone} */
export const hedgetunnel = {
  key:'hedgetunnel',label:'The Tunnel under the High Hay',music:'oldforest',map:tunnel,
  spawns:{west:{x:2,y:9,dir:'right'},east:{x:33,y:9,dir:'left'}},npcs:[],doors:[],signs:[],
  interactions:[point(27,9,'hedge_gate','Open the iron gate')],
  exits:[edge(0,9,'crickhollow','east'),edge(35,9,'forestgate','west','hedgeEntered','Merry has the key to the iron gate.')],
  onCreate:journeyCreate,onUpdate:journeyUpdate,onDialogueLine:journeyDialogue,
};
const garden=field(44,32,T.GRASS,T.OLD_TREE);
cottage(garden,23,11,11);
trail(garden,[[0,23],[12,23],[12,20],[28,20],[28,13]],1,T.CHALK);
trail(garden,[[28,20],[36,20],[36,16],[43,16]],1,T.CHALK);
cottage(garden,23,11,11);
for(let y=25;y<31;y++) for(let x=2;x<42;x++) garden[y][x]=T.DARK_WATER;
for(let x=4;x<40;x+=5) garden[25][x]=T.LILIES;
for(const [x,y] of [[22,14],[24,14],[32,14],[34,14],[11,19],[16,18]]) garden[y][x]=T.FLOWERS;
/** @type {import('../types.js').Zone} */
export const tomclearing = {
  key:'tomclearing',label:'A Light beyond the Trees',music:'bombadil',map:garden,
  spawns:{west:{x:2,y:23,dir:'right'},house:{x:28,y:14,dir:'down'},east:{x:41,y:16,dir:'left'}},
  npcs:[],doors:[{x:28,y:12,zone:'tomhouse',entry:'default'}],signs:[],
  interactions:[point(14,23,'house_threshold','The lighted house')],
  exits:[edge(0,23,'withywindle','east'),edge(43,16,'downs','west','learnedSong','Rest with Tom and Goldberry before crossing the downs.')],
  onCreate:journeyCreate,onUpdate:journeyUpdate,onDialogueLine:journeyDialogue,
};
const room=field(28,22,T.VOID,T.VOID);
for(let y=3;y<19;y++) for(let x=3;x<25;x++) room[y][x]=y===3||x===3||x===24||y===18 ? T.WALL : T.FLOOR;
for(let y=7;y<=10;y++) for(let x=9;x<=16;x++) room[y][x]=y===8 ? T.TABLE : T.RUG;
room[3][7]=T.FIREPLACE; room[3][19]=T.WINDOW_I;
for(const x of [5,8,11,14]) room[15][x]=T.BED;
room[8][20]=T.LILIES;room[8][22]=T.LILIES;
room[18][18]=T.FLOOR;room[19][18]=T.CHALK;room[20][18]=T.CHALK;room[21][18]=T.CHALK;
/** @type {import('../types.js').Zone} */
export const tomhouse = {
  key:'tomhouse',label:"In the House of Tom Bombadil",music:'bombadil',map:room,
  spawns:{default:{x:18,y:17,dir:'up'}},npcs:[],doors:[],signs:[],
  interactions:[point(20,9,'house_welcome','Goldberry'),point(12,11,'house_supper','Supper at the table'),point(8,14,'house_bed','The hobbits’ beds'),point(7,6,'house_stories','Tom by the hearth'),point(14,6,'house_ring','Ask Tom about the Ring'),point(20,15,'house_farewell','Prepare to leave'),point(22,9,'house_lilies','The water-lilies')],
  exits:[edge(18,21,'tomclearing','house')],onCreate:journeyCreate,onUpdate:journeyUpdate,onDialogueLine:journeyDialogue,
};
