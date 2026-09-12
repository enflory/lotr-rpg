// Gandalf goes. In "The Shadow of the Past" he leaves Hobbiton to seek news
// and to speak with the head of his order, and Frodo does not see him again
// before setting out — the whole of "Three is Company" is Frodo waiting for a
// wizard who never comes back. So once he has given his last counsel here, he
// walks down off the Hill and away east, and the Bag End doorstep is empty
// from then on.
//
// The player watches him go, then has control back as soon as he is clear of
// the view: a long wait at the top of the Hill for a wizard's whole journey
// would be a worse scene than a short one.

import { hasFlag, setFlag } from '../state/GameState.js';
import { walk } from './storyMotion.js';

// Down the lane from the door, then east on the Bywater Road — far enough
// past the bottom of the Hill that he is off camera when control returns.
const AWAY = { x: 26, y: 19 };

export function gandalfEventUpdate(scene) {
  if (!hasFlag('gandalfLeft') || hasFlag('gandalfGone') || scene.gandalfLeaving) return;
  const wizard = scene.npcs.find((n) => n.getData('key') === 'gandalf');
  if (!wizard) {
    // Nothing to walk — a save restored between the farewell and the walk.
    setFlag('gandalfGone');
    return;
  }
  scene.gandalfLeaving = true;
  scene.inputLocked = true;
  // A static body would stay behind on the doorstep; the walk owns him now.
  if (wizard.body) wizard.body.enable = false;
  scene.showBanner('Gandalf goes down the Hill,\nand does not look back.');

  walk(scene, wizard, AWAY.x, AWAY.y, 54).then(() => {
    scene.removeNpc('gandalf');
    setFlag('gandalfGone');
    scene.gandalfLeaving = false;
    scene.inputLocked = false;
    scene.checkpoint?.();
  });
}
