// The fox of the Woody End — it passes the sleeping hobbits and
// wonders. One-time trigger at the northern resting place in the fir hollow:
// the fox trots into the meadow, stops while the player reads its
// thought, and only trots off once the dialogue is dismissed.
import { TILE_SIZE } from '../data/tileTypes.js';
import { hasFlag, setFlag } from '../state/GameState.js';
import { FOX_REST, FOX_ROUTE } from '../data/zones/woodyend.js';

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
        x: FOX_ROUTE.x1 * TILE_SIZE + 8,
        duration: (((FOX_ROUTE.x1 - FOX_ROUTE.stopX) * TILE_SIZE) / 56) * 1000,
        onComplete: () => {
          ev.fox.destroy();
          ev.phase = 'done';
          scene.inputLocked = false;
        },
      });
    }
    return;
  }

  if (hasFlag('foxSeen') || scene.inputLocked || scene.dialogActive || scene.storyBeat) return;
  const tx = Math.floor(scene.player.x / TILE_SIZE);
  const ty = Math.floor((scene.player.y + 8) / TILE_SIZE);
  if (Math.abs(tx - FOX_REST.x) > 1 || ty !== FOX_REST.y) return;

  const y = FOX_ROUTE.y * TILE_SIZE;
  // A returning party may approach from the south. Wait until every visible
  // companion is clear of the entire crossing, not just the fox's stop.
  const party = [scene.player, ...(scene.followers ?? [])];
  if (
    party.some(
      (hobbit) =>
        hobbit.visible !== false &&
        Math.abs(hobbit.y - y) < 24 &&
        hobbit.x > FOX_ROUTE.x0 * TILE_SIZE - 8 &&
        hobbit.x < FOX_ROUTE.x1 * TILE_SIZE + 24,
    )
  )
    return;

  setFlag('foxSeen');
  scene.inputLocked = true;
  const fox = scene.add.sprite(FOX_ROUTE.x0 * TILE_SIZE + 8, y, 'fox', 7); // right-facing
  fox.setDepth(y);
  const state = { fox, phase: 'entering' };
  scene.foxEvent = state;
  fox.anims.play('fox-walk-right');
  scene.tweens.add({
    targets: fox,
    x: FOX_ROUTE.stopX * TILE_SIZE + 8,
    duration: (((FOX_ROUTE.stopX - FOX_ROUTE.x0) * TILE_SIZE) / 56) * 1000,
    onComplete: () => {
      fox.anims.play('fox-idle-right');
      state.phase = 'arrived';
    },
  });
}
