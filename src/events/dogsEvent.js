// Grip, Fang and Wolf run home to Bamfurlong once found. Each tweens
// to the farm gate and despawns; the flag keeps it gone thereafter.
import { TILE_SIZE } from '../data/tileTypes.js';
import { hasFlag } from '../state/GameState.js';
import { FARM } from '../data/zones/marish.js';

const DOGS = ['grip', 'fang', 'wolf'];
const FLAG = { grip: 'dogGrip', fang: 'dogFang', wolf: 'dogWolf' };

export function dogsEventUpdate(scene) {
  for (const key of DOGS) {
    if (!hasFlag(FLAG[key])) continue;
    const npc = scene.npcs.find((n) => n.getData('key') === key);
    if (!npc || npc.getData('runningHome')) continue;
    npc.setData('runningHome', true);
    scene.tweens.add({
      targets: npc,
      x: FARM.gateX * TILE_SIZE + 8,
      y: (FARM.y0 + 2) * TILE_SIZE + 8,
      duration: 2200,
      onComplete: () => scene.removeNpc(key),
    });
  }
}
