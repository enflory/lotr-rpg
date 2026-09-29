import { walk, tween } from './storyMotion.js';
import {
  friend,
  pause,
  face,
  gesture,
  focus,
  leave,
  regroup,
  packBill,
  walkBill,
} from './breeStoryMotion.js';
import { trailPosition } from '../state/partyMovement.js';
import { sfx } from '../audio/sound.js';

export function departureDialogue(s, beat) {
  const key = s.dialogKey,
    i = s.dialogIndex,
    b = s.bree,
    a = b.actors,
    sam = friend(s, 'sam');
  if (key === 'bree_gate') {
    beat(s, async () => {
      if (i === 0) {
        focus(s, 18, 14);
        face(a.harry, 'left');
        await tween(s, b.lantern, { y: a.harry.y - 15 }, 500);
      }
      if (i === 1) await gesture(s, s.player);
      if (i === 2) {
        await tween(s, b.lantern, { y: a.harry.y - 5 }, 400);
        await gesture(s, a.harry);
      }
    });
    return true;
  }
  if (key === 'bree_bill') {
    beat(
      s,
      async () => {
        if (i === 0) {
          focus(s, 37, 19);
          await walk(s, a.butterbur, 39, 20, 65);
          face(a.butterbur, 'up');
          face(a.ferny, 'left');
          const coins = s.add.graphics({ x: a.butterbur.x, y: a.butterbur.y - 7 }).setDepth(810);
          coins.fillStyle(0xddd4b4).fillRect(-2, -2, 4, 3).fillRect(0, 1, 4, 3);
          await tween(s, coins, { x: a.ferny.x - 8, y: a.ferny.y - 3 }, 550);
          coins.destroy();
          await gesture(s, a.ferny);
        }
        if (i === 1) {
          await walk(s, sam, 39, 18, 60);
          face(sam, 'down');
          await Promise.all([
            gesture(s, sam),
            tween(s, b.bill.getData('body'), { y: 2, yoyo: true, repeat: 1 }, 300),
          ]);
        }
        if (i === 2) {
          await walk(s, s.player, 37, 19, 65);
          face(s.player, 'right');
          await gesture(s, s.player);
          packBill(b.bill);
          sfx.confirm();
        }
        if (i === 3) {
          s.cameras.main.startFollow(s.player, true, 0.08, 0.08);
          const [trail] = await Promise.all([
            regroup(s, 39, 17, 'right', [a.strider]),
            leave(s, a.ferny, 47, 17),
            walk(s, a.butterbur, 35, 20, 65),
          ]);
          await walkBill(s, b.bill, trailPosition(trail, 108));
          face(a.butterbur, 'right');
        }
      },
      i === 2 ? 'Load Bill’s packs' : '',
    );
    return true;
  }
  if (key === 'bree_depart') {
    const strider = friend(s, 'strider');
    beat(
      s,
      async () => {
        if (i === 0) {
          focus(s, 12, 11);
          await walk(s, sam, 11, 10, 60);
          face(sam, 'up');
          await gesture(s, a.ferny);
          b.apple = s.add.circle(sam.x - 5, sam.y - 3, 2, 0xac3f23).setDepth(810);
        }
        if (i === 1) {
          await tween(s, b.apple, { x: a.ferny.x, y: a.ferny.y - 9 }, 450);
          sfx.confirm();
          await tween(s, a.ferny, { angle: -12, yoyo: true }, 180);
          b.apple.destroy();
        }
        if (i === 2) {
          const trail = await regroup(s, 15, 14, 'right');
          await walkBill(s, b.bill, trailPosition(trail, 108));
        }
        if (i === 3) {
          s.cameras.main.startFollow(s.player, true, 0.08, 0.08);
          // Strider scouts ahead while the hobbits and their pack pony walk on.
          const scouting = walk(s, strider, 32, 11, 75);
          await pause(s, 500);
          await Promise.all([
            scouting,
            ...[s.player, ...s.followers.filter((p) => p !== strider)].map((p, j) =>
              walk(s, p, 29 - j * 2, 11, 65),
            ),
            walkBill(s, b.bill, { x: 21 * 16 + 8, y: 11 * 16 }),
          ]);
          face(strider, 'right');
          await gesture(s, strider);
          const trail = await regroup(s, 34, 11, 'right');
          await walkBill(s, b.bill, trailPosition(trail, 108));
        }
        if (i === 4) await pause(s, 450);
      },
      i === 1 ? 'Let Sam throw' : '',
    );
    return true;
  }
  return false;
}
