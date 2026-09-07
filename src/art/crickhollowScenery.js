// Comfortable, inhabited detail. Raised furniture stays on its map collider.
export function drawCrickhollow(scene, morning) {
  const g=scene.add.graphics().setDepth(3);
  const r=(x,y,w,h,c)=>g.fillStyle(c).fillRect(x,y,w,h);
  if(scene.zoneKey==='crickhollow') {
    // Irregular grass tufts, clover and fallen leaves leave the lawn open.
    for(let y=2;y<26;y++) for(let x=2;x<38;x++) {
      const tile=scene.zone.map[y][x];
      if(tile!==0 && tile!==1) continue;
      const n=(x*31+y*17)%13, px=x*16,py=y*16;
      r(px+n,py+4,1,3,0x647b40);r(px+n-1,py+6,3,1,0x87914d);
      if(n<3) {r(px+7,py+11,3,1,0xb7b576);r(px+8,py+10,1,3,0xcac78b);}
    }
    // A long, low thatched cottage, with round doors and warm round windows.
    r(112,80,208,64,0x786446);
    for(let row=0;row<15;row++) {
      const inset=Math.max(0,12-row*2);
      r(112+inset,80+row*4,208-inset*2,4,row%2?0x9e8855:0xb29b63);
      for(let x=116+inset;x<316-inset;x+=8) r(x+(row%2)*3,81+row*4,1,3,0xc7af78);
    }
    r(110,141,212,4,0x665033);r(114,144,204,16,0xb2aa83);
    r(114,157,204,3,0x746d4c);
    for(const x of [136,184,248,296]) {
      r(x-7,146,14,11,0x4b5940);r(x-5,144,10,15,0x4b5940);
      r(x-4,146,8,10,morning?0xc1cba7:0xe8c77c);
      r(x,146,1,10,0x665b3c);r(x-4,151,8,1,0x665b3c);
      r(x-8,160,16,3,0x695639);
      for(let i=0;i<4;i++) {r(x-6+i*4,158,2,3,0x5c7844);r(x-6+i*4,157,2,2,i%2?0xb2a6bc:0xe0c078);}
    }
    r(208,145,16,15,0x354a35);r(211,142,10,18,0x354a35);
    r(210,146,12,14,0x59734b);r(212,144,8,16,0x59734b);
    r(215,151,2,2,0xd5b75e);r(207,161,18,3,0xada17b);
    // Chimney and a tiny stacked woodpile against the solid cottage wall.
    r(153,71,13,20,0x736d58);r(151,70,17,3,0x9b9377);
    for(let i=0;i<4;i++) r(153+(i%2)*6,75+i*4,6,1,0xaca085);
    for(let n=0;n<7;n++) {r(116+n*4,163,4,5,0x685037);r(116+n*4,163,3,1,0xb0915b);}
    // Deep cottage flower borders, a garden bench and laundry drying on a line.
    for(const start of [128,224]) {
      r(start-2,173,66,21,0x6a6540);
      for(let i=0;i<18;i++) {
        const x=start+(i*17+5)%61,y=176+(i*i*7+i*3)%13;
        r(x,y,1,9,0x527442);r(x-2,y+3,5,2,0x78934e);
        r(x-2,y,5,3,[0xc4a8bf,0xe0bd72,0xb0b9cb][i%3]);r(x,y+1,1,1,0xe7d69b);
      }
      for(let i=0;i<11;i++) r(start+i*6,193,4,2,0xa29670);
    }
    r(288,209,32,12,0x69533b);r(289,211,30,3,0xb09762);
    r(290,216,2,10,0x594b35);r(315,216,2,10,0x594b35);
    r(289,206,30,3,0x967a4d);
    r(87,188,2,35,0x786341);r(135,188,2,35,0x786341);r(88,190,48,1,0xc2b89a);
    for(let i=0;i<3;i++) {
      const x=93+i*13;r(x,191,10,19,[0xc7c4a2,0x8ba0a0,0xb9ad85][i]);
      r(x+2,192,1,17,0xe0d7b7);r(x+2,190,2,3,0x9b875b);r(x+7,190,2,3,0x9b875b);
    }
    // Herb beds, labels, a low bean frame and watered earth by the side path.
    for(let y=8;y<=12;y++) for(let x=23;x<=28;x++) {
      const px=x*16,py=y*16;r(px,py,16,16,0x625b37);
      for(let i=0;i<3;i++) {r(px+3+i*5,py+2,1,10,0x857345);r(px+2+i*5,py+5,3,3,(x+y)%2?0x779052:0x8d9c64);}
    }
    for(const x of [370,434]) {r(x,123,2,12,0x9b8655);r(x-3,123,8,4,0xc2b078);}
    // Five ponies wait in the lawn east of the house, away from the path.
    for(let i=0;i<5;i++) {
      const x=(24+i*2.5)*16,y=18*16,c=[0x79533a,0x9b805b,0x66544a,0x8a6550,0x756454][i];
      r(x-9,y-5,21,8,c);r(x+8,y-13,6,10,c);r(x-7,y+3,3,7,0x302c24);r(x+7,y+3,3,7,0x302c24);
      r(x-3,y-6,10,6,0xb8a478);r(x+9,y-15,2,3,0x302c24);r(x+13,y-15,2,3,0x302c24);r(x+12,y-11,1,1,0xd5caaa);
    }
    // A few larger trees break up the hedge rather than filling the open lawn.
    for(const [tx,ty] of [[4,8],[26,5],[34,11],[7,23],[31,23]]) {
      const t=scene.add.graphics().setDepth(ty*16+15),x=tx*16+8,y=ty*16+15;
      t.fillStyle(0x526346).fillRect(x-6,y-34,12,34);
      t.fillStyle(0xa2a080).fillRect(x-4,y-33,4,30);
      for(let i=0;i<7;i++) {
        const width=30-Math.abs(i-3)*5;
        t.fillStyle(i%2?0x617b43:0x75894a).fillRect(x-width/2,y-52+i*4,width,5);
      }
    }
  } else {
    // Woven hearth rug and a continuous supper table, with five place settings.
    r(135,116,142,100,0x7b5241);r(138,119,136,94,0x976b50);
    for(let y=120;y<211;y+=6) r(140,y,132,1,0xa67d58);
    r(160,144,96,32,0x37291f);r(161,145,94,27,0x765136);
    r(163,146,90,2,0xba9260);r(163,166,90,1,0x4d3425);
    for(const [x,y] of [[176,148],[216,148],[176,166],[224,166],[248,158]]) {
      r(x-4,y-2,9,5,0xe2d3a7);r(x-2,y-1,5,3,0xbda679);
      r(x+6,y-2,3,4,0x887a56);r(x+7,y-3,2,1,0xd2c498);
    }
    r(192,155,19,8,0xc5af7e);r(194,157,15,4,0x715037);
    for(let i=0;i<5;i++) {r(196+i*3,155+(i%2)*3,3,2,0xc2a071);r(197+i*3,157+(i%2)*3,1,2,0xa18059);}
    r(229,153,11,5,0xcfad62);r(230,153,9,1,0xedce8c);
    for(const x of [188,237]) {r(x-2,162,5,2,0xac8a44);r(x,154,2,8,0xe6cf8a);r(x,152,2,2,0xe89b42);r(x,151,1,2,0xffe4a0);}
    for(const [x,y] of [[176,183],[224,183],[168,131],[216,131],[267,159]]) {
      r(x-5,y,10,5,0x563e2b);r(x-4,y,8,2,0xb89b66);
    }
    // Bath copper, pegs, towels, pantry jars and a kettle by the hearth.
    for(const x of [80,96,112]) {
      r(x,80,16,16,0xa8804e);
      for(const dy of [3,7,11,15]) r(x,80+dy,16,1,0x8a6238);
      r(x+1,81,14,11,0x8d7152);r(x+2,80,12,2,0xc2ab80);r(x+3,83,10,6,0x8fa79b);r(x+4,84,8,1,0xc2d2bf);
    }
    for(let i=0;i<5;i++) {r(78+i*7,64,2,5,0x665339);r(77+i*7,66,5,10,i%2?0xd4caab:0x9caa94);}
    for(let x=290;x<346;x+=11) {r(x,80,7,7,0x96754c);r(x+1,79,5,2,0xd5c6a0);}
    r(63,120,9,7,0x4c5143);r(64,118,7,2,0x6d7260);r(67,116,2,3,0x9c9d7a);
    // Crossbeams and small rugs beside the beds.
    for(let x=4;x<24;x++) {if(x===7||x===20)continue;r(x*16,48,16,3,0x604830);}
    for(const x of [6,9,12,15,18]) {r(x*16-3,274,22,10,0x807652);r(x*16-1,277,18,1,0xafa070);}
    for(let i=0;i<4;i++) {
      const steam=scene.add.rectangle(197+i*4,152,1,3,0xe3d9b5,0.5).setDepth(200);
      scene.tweens.add({targets:steam,y:143,alpha:0,duration:1500+i*140,delay:i*310,repeat:-1});
    }
  }
  const shade=scene.add.rectangle(480,360,320,240,0x192b46,scene.zoneKey==='crickhollow'&&!morning?0.23:0)
    .setScrollFactor(0).setDepth(820);
  return { shade };
}
