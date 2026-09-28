import { mirrorRows, validateRows } from './helpers.js';

// Twenty-row Men: smaller heads, longer coats and boots than the hobbits.
const down=validateRows('BREE_MAN_DOWN',[
  '.....oooooo.....','....oHHHHHHo....','....oHhhhhHo....','....ohSSSSho....',
  '....oSESSSEo....','....osSNNSso....','.....osSSso.....','....oCCCCCCo....',
  '...oCVVVVVVCo...','...oGVvVVvVGo...','...oGVVVVVVGo...','...oGVVBBVVGo...',
  '...oGVVbbVVGo...','...oGVVVVVVGo...','...oGVVVVVVGo...','....oVVVVVVo....',
  '....oPPPPPPo....','....oPPooPPo....','....oPPooPPo....','....oppooppo....',
]);
const left=validateRows('BREE_MAN_LEFT',[
  '.....oooooo.....','....oHHHHHHo....','....oHhhhhHo....','...oSSSShhHo....',
  '...oSESShhHo....','...osNSSshHo....','....osSSsho.....','....oCCCCCCo....',
  '....oVVVVVCCo...','....oVvVVVVGo...','....oVVVVVVGo...','....oVBBVVVGo...',
  '....oVbbVVVGo...','....oVVVVVVGo...','....oVVVVVVGo...','....oVVVVVVo....',
  '....oPPPPPPo....','....oPPooPPo....','....oPPooPPo....','....oppooppo....',
]);
const up=down.map((r,i)=>i>=3&&i<=6?r.replace(/[SsEN]/g,'H'):r);
const maps={down,left,right:mirrorRows(left),up};
const skin={S:'#cca780',s:'#a68062',E:'#1e242b',N:'#715744'};
const man=(coat,hair,extra={})=>({maps,feet:['#463c2d','#272a27'],pal:{o:'#172027',...skin,H:hair,h:hair,C:coat,V:coat,v:'#78816e',G:'#283e35',B:'#352a22',b:'#948575',P:'#44463a',p:'#282e28',...extra}});
export const BREE_CHARACTERS={
  strider:man('#435949','#333632'),
  harry:man('#68604b','#656157'),
  butterbur:man('#ece0bb','#c79677',{S:'#d6a184',s:'#b7775e',G:'#a7a48b',v:'#faf0cf'}),
  ferny:man('#5b493a','#292720'),
  southerner:man('#72664e','#433c30'),
};

// Butterbur's white apron covers a broad belly; his bald crown distinguishes
// him from the lean, hooded traveller rather than merely recolouring Strider.
const broad = rows => rows.map((row,i) => i >= 8 && i <= 14
  ? '..oGVVVVVVVVGo..' : row);
BREE_CHARACTERS.butterbur.maps = {
  down: broad(down), left: broad(left), right: mirrorRows(broad(left)), up: broad(up),
};
