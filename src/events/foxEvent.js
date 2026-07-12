// The fox of the Woody End — it passes the sleeping hobbits and
// wonders. One-time trigger when the player steps into the fir hollow.
import { TILE_SIZE } from '../data/tileTypes.js';
import { hasFlag, setFlag } from '../state/GameState.js';
import { HOLLOW } from '../data/zones/woodyend.js';

export function foxEventUpdate(scene) {
  if (hasFlag('foxSeen') || scene.foxEvent) return;
  const tx = Math.floor(scene.player.x / TILE_SIZE);
  const ty = Math.floor(scene.player.y / TILE_SIZE);
  if (tx < HOLLOW.x0 || tx > HOLLOW.x1 || ty < HOLLOW.y0 || ty > HOLLOW.y1) return;

  setFlag('foxSeen');
  const y = (HOLLOW.y0 + 2) * TILE_SIZE + 8;
  const fox = scene.add.sprite(HOLLOW.x0 * TILE_SIZE - 8, y, 'fox', 7); // right-facing
  fox.setDepth(y);
  scene.foxEvent = fox;
  fox.anims.play('fox-walk-right');
  scene.tweens.chain({
    targets: fox,
    tweens: [
      { x: (HOLLOW.x0 + 3) * TILE_SIZE, duration: 1400 },
      {
        x: fox.x, duration: 900, // pause: stop and look
        onStart: () => {
          fox.anims.play('fox-idle-right');
          scene.startDialogue('fox_thought');
        },
      },
      {
        x: (HOLLOW.x1 + 1) * TILE_SIZE + 8, duration: 1400,
        onStart: () => fox.anims.play('fox-walk-right'),
        onComplete: () => fox.destroy(),
      },
    ],
  });
}
