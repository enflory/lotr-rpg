// Old Forest and Barrow-downs: dry-brushed clusters, damp moss, pale chalk.
import { px, rc, circle } from './helpers.js';

function ground(c, ox, base, shade, light) {
  rc(c, ox, 0, 16, 16, base);
  for (const [x,y,w] of [[1,2,3],[9,0,2],[6,6,3],[12,10,3],[2,12,2],[8,14,3]]) {
    rc(c, ox+x, y, w, 1, shade);
    px(c, ox+x+1, y+1, light);
  }
}
export function drawForestFloor(c, ox) {
  ground(c, ox, '#424c2f', '#343d29', '#626444');
  for (const [x,y] of [[3,7],[12,4],[7,11]]) {
    rc(c, ox+x, y, 2, 1, '#8a7747');
    px(c, ox+x+1, y+1, '#665735');
  }
}
export function drawRoots(c, ox) {
  drawForestFloor(c, ox);
  for (let x=0;x<16;x++) {
    const y=7+Math.round(2*Math.sin(x/3));
    rc(c, ox+x,y,1,3,'#30291e');
    px(c, ox+x,y,'#88724c');
    if(x>7) px(c,ox+x,15-x,'#766342');
  }
}
export function drawOldTree(c, ox) {
  drawRoots(c, ox);
  rc(c,ox+5,5,7,10,'#28291e');
  rc(c,ox+6,5,3,10,'#655b3d');
  rc(c,ox+7,8,1,6,'#8a7950');
  for(const [x,y,r,col] of [[5,4,4,'#1d3024'],[10,5,5,'#223528'],[7,5,4,'#37492d'],[5,3,2,'#52603a'],[11,3,2,'#626540']]) circle(c,ox+x,y,r,col);
  rc(c,ox+10,8,1,5,'#58613c');
  px(c,ox+8,10,'#24261c');
}
export function drawDeadTree(c, ox) {
  drawForestFloor(c,ox);
  rc(c,ox+7,3,3,12,'#312b24');
  rc(c,ox+7,3,1,11,'#8b8065');
  for(let i=0;i<5;i++) {
    rc(c,ox+3+i,2+i,2,2,'#655d4c');
    px(c,ox+10+i,7-i,'#655d4c');
  }
  rc(c,ox+3,0,1,4,'#81755d');
  rc(c,ox+12,1,1,4,'#81755d');
  rc(c,ox+5,14,7,1,'#655d4c');
}
export function drawDarkWater(c,ox) {
  ground(c,ox,'#263f3e','#1c3033','#4c6260');
  rc(c,ox+1,5,5,1,'#65766b');
  rc(c,ox+9,12,5,1,'#65766b');
}
export function drawLilies(c,ox) {
  drawDarkWater(c,ox);
  for(const [x,y] of [[4,5],[11,10]]) {
    circle(c,ox+x,y,3,'#425c3c');
    rc(c,ox+x-1,y-1,3,2,'#eee9c9');
    px(c,ox+x,y-2,'#faf6df');
    px(c,ox+x,y,'#d4b964');
    px(c,ox+x+2,y+1,'#779063');
  }
}
export function drawDownGrass(c,ox) {
  ground(c,ox,'#858b69','#71795e','#a2a587');
  rc(c,ox+4,9,4,1,'#939a79');
}
export function drawStandingStone(c,ox) {
  drawDownGrass(c,ox);
  rc(c,ox+4,13,9,2,'#656e58');
  rc(c,ox+6,1,4,13,'#393f3e');
  rc(c,ox+5,5,6,9,'#555f5c');
  rc(c,ox+6,3,3,10,'#8e9688');
  rc(c,ox+6,1,2,5,'#aeb3a0');
  rc(c,ox+8,8,1,4,'#656c61');
  px(c,ox+7,13,'#a8aa88');
}
export function drawBarrowWall(c,ox) {
  ground(c,ox,'#343f3b','#27332f','#48564b');
  for(const [x,y,w,h] of [[1,1,7,5],[10,0,5,6],[0,8,5,7],[7,8,8,6]]) {
    rc(c,ox+x,y,w,h,'#4a574d');
    rc(c,ox+x,y,w,1,'#697466');
    px(c,ox+x+1,y+2,'#596650');
  }
}
export function drawBarrowFloor(c,ox) {
  ground(c,ox,'#535f50','#424d43','#6e7c60');
  rc(c,ox+2,7,5,1,'#829070');
  px(c,ox+12,3,'#879776');
}
export function drawChalk(c,ox) {
  ground(c,ox,'#c3c3a7','#aaae95','#e0ddc0');
}
export function drawHedge(c,ox) {
  ground(c,ox,'#314b2c','#243b27','#49603a');
  for(const [x,y] of [[2,2],[8,4],[13,1],[4,10],[11,12]]) {
    rc(c,ox+x,y,2,3,'#637747');
    px(c,ox+x+1,y,'#869357');
  }
}
