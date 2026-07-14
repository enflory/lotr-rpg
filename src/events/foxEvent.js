// The fox of the Woody End — it passes the sleeping hobbits and
// wonders. One-time trigger when the player steps into the fir hollow:
// the fox trots into the meadow, stops while the player reads its
// thought, and only trots off once the dialogue is dismissed.
import { TILE_SIZE } from '../data/tileTypes.js';
import { hasFlag, setFlag } from '../state/GameState.js';
import { HOLLOW } from '../data/zones/woodyend.js';

export function foxEventUpdate(scene) {
  const ev = scene.foxEvent;
  if (ev) {
    // onUpdate is skipped while a dialogue is open, so `!dialogActive`
    // here means the player has spaced through every line.
    if (ev.phase === 'arrived' && !scene.dialogActive) {
      ev.phase = 'talking';
      scene.startDialogue('fox_thought');
    } else if (ev.phase === 'talking' && !scene.dialogActive) {
      ev.phase = 'leaving';
      ev.fox.anims.play('fox-walk-right');
      scene.tweens.add({
        targets: ev.fox,
        x: (HOLLOW.x1 + 1) * TILE_SIZE + 8,
        duration: 1400,
        onComplete: () => ev.fox.destroy(),
      });
    }
    return;
  }

  if (hasFlag('foxSeen')) return;
  const tx = Math.floor(scene.player.x / TILE_SIZE);
  const ty = Math.floor(scene.player.y / TILE_SIZE);
  if (tx < HOLLOW.x0 || tx > HOLLOW.x1 || ty < HOLLOW.y0 || ty > HOLLOW.y1) return;

  setFlag('foxSeen');
  const y = (HOLLOW.y0 + 2) * TILE_SIZE + 8;
  const fox = scene.add.sprite(HOLLOW.x0 * TILE_SIZE - 8, y, 'fox', 7); // right-facing
  fox.setDepth(y);
  const state = { fox, phase: 'entering' };
  scene.foxEvent = state;
  fox.anims.play('fox-walk-right');
  scene.tweens.add({
    targets: fox,
    x: (HOLLOW.x0 + 3) * TILE_SIZE,
    duration: 1400,
    onComplete: () => {
      fox.anims.play('fox-idle-right');
      state.phase = 'arrived';
    },
  });
}
