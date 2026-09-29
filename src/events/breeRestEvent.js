import { gameState } from '../state/GameState.js';
import { walk, tween } from './storyMotion.js';
import { friend, pause, face, gesture, focus, enter, leave, regroup } from './breeStoryMotion.js';
import { drawBreeDecoy } from '../art/breeScenery.js';
import { sfx } from '../audio/sound.js';

function letter(s) {
  const a = s.bree.actors.butterbur;
  const g = s.add.graphics({ x: a.x + 11, y: a.y - 3 }).setDepth(810);
  g.fillStyle(0xe5d9b5).fillRect(-5, -4, 10, 8);
  g.lineStyle(1, 0x9e8560).lineBetween(-4, -3, 0, 0).lineBetween(0, 0, 4, -3);
  g.fillStyle(0x874d38).fillRect(-1, -1, 2, 2);
  return g;
}
export function restoreRestPositions(s) {
  const f = gameState.flags,
    b = s.bree;
  if (s.zoneKey === 'ponyparlour' && f.striderOffer && !f.breeMerryReturned) {
    b.actors.strider.setPosition(16 * 16 + 8, 6 * 16).setDepth(6 * 16 + 20);
    face(b.actors.strider, 'down');
  }
  if (s.zoneKey === 'ponyparlour' && f.breeMerryReturned && !f.breeDecoys) {
    b.actors.nob.setPosition(21 * 16 + 8, 16 * 16).setDepth(16 * 16 + 20);
    face(b.actors.nob, 'right');
  }
}
export function restDialogue(s, beat) {
  const key = s.dialogKey,
    i = s.dialogIndex,
    b = s.bree,
    a = b.actors;
  const sam = friend(s, 'sam'),
    pippin = friend(s, 'pippin'),
    merry = friend(s, 'merry');
  if (key === 'bree_strider') {
    beat(s, async () => {
      if (i === 0) {
        focus(s, 13, 8);
        await Promise.all([
          walk(s, s.player, 15, 7, 65),
          walk(s, sam, 14, 8, 65),
          walk(s, pippin, 12, 8, 65),
        ]);
        [s.player, sam, pippin].forEach((p) => face(p, 'up'));
        face(a.strider, 'down');
      }
      if (i === 1) {
        await walk(s, a.strider, 16, 6, 55);
        face(a.strider, 'down');
      }
      if (i === 2) await gesture(s, a.strider);
      if (i === 3) {
        sfx.door();
        focus(s, 9, 10);
        await enter(s, a.butterbur, 4, 11);
        face(a.butterbur, 'right');
        await regroup(s, 15, 7, 'up');
      }
    });
    return true;
  }
  if (key === 'bree_letter') {
    beat(
      s,
      async () => {
        if (i === 0) {
          focus(s, 8, 12);
          await Promise.all([
            walk(s, s.player, 6, 12, 65),
            walk(s, sam, 7, 13, 65),
            walk(s, pippin, 9, 13, 65),
          ]);
          face(s.player, 'left');
          face(sam, 'up');
          face(pippin, 'left');
          await gesture(s, a.butterbur);
          b.letter = letter(s);
        }
        if (i === 1) {
          await tween(s, b.letter, { x: s.player.x, y: s.player.y - 8 }, 650);
          b.letter.clear().fillStyle(0xe5d9b5).fillRect(-7, -7, 14, 12);
          for (let y = -4; y < 3; y += 2) b.letter.fillStyle(0x6e5b42).fillRect(-4, y, 8, 1);
          sfx.confirm();
          await pause(s, 350);
        }
        if (i === 2 || i === 3) await gesture(s, s.player);
        if (i === 4) await gesture(s, sam);
        if (i === 5) {
          b.letter.destroy();
          await Promise.all([leave(s, a.butterbur, 0, 16), regroup(s, 15, 7, 'up')]);
        }
      },
      i === 1 ? 'Open the letter' : '',
    );
    return true;
  }
  if (key === 'bree_trust') {
    beat(
      s,
      async () => {
        if (i === 0) {
          focus(s, 14, 7);
          await Promise.all([
            walk(s, s.player, 15, 7, 65),
            walk(s, sam, 14, 8, 65),
            walk(s, pippin, 12, 8, 65),
          ]);
          [s.player, sam, pippin].forEach((p) => face(p, 'up'));
          face(a.strider, 'down');
          b.sword = s.add
            .graphics({ x: a.strider.x - 8, y: a.strider.y + 1 })
            .setDepth(a.strider.y + 25)
            .setScale(0.1, 1);
          b.sword
            .fillStyle(0xddd5b6)
            .fillRect(-10, 0, 9, 2)
            .fillRect(-12, 0, 2, 1)
            .fillStyle(0xa89a70)
            .fillRect(-2, -3, 2, 8)
            .fillRect(0, 0, 4, 2);
          await tween(s, b.sword, { scaleX: 1 }, 450);
        }
        if (i === 1) await gesture(s, a.strider);
        if (i === 2) {
          await walk(s, s.player, 16, 7, 55);
          face(s.player, 'up');
          await tween(s, b.sword, { scaleX: 0.1, alpha: 0 }, 400);
          b.sword.destroy();
        }
        if (i === 3) {
          await regroup(s, 16, 7, 'up');
          sfx.door();
        }
      },
      i === 2 ? 'Trust Strider' : '',
    );
    return true;
  }
  if (key === 'bree_merry') {
    beat(s, async () => {
      if (i === 0) {
        focus(s, 9, 12);
        await Promise.all([
          walk(s, s.player, 9, 12, 65),
          walk(s, sam, 9, 14, 65),
          walk(s, pippin, 11, 14, 65),
        ]);
        await enter(s, a.nob, 3, 16);
        merry
          .setPosition(8, 16 * 16)
          .setAlpha(0)
          .setVisible(true)
          .setAngle(-7)
          .setTint(0xc9d0d9)
          .setDepth(16 * 16 + 20);
        await tween(s, merry, { alpha: 1 }, 250);
        await Promise.all([
          walk(s, merry, 8, 13, 38),
          walk(s, a.nob, 7, 13, 38),
          walk(s, a.strider, 11, 11, 55),
        ]);
        face(merry, 'up');
        face(a.nob, 'up');
        face(a.strider, 'left');
      }
      if (i === 1) await gesture(s, merry);
      if (i === 2) await gesture(s, a.nob);
      if (i === 3) await gesture(s, a.strider);
      if (i === 4) {
        await tween(s, merry, { angle: 0 }, 400);
        merry.clearTint();
        await Promise.all([
          regroup(s, 12, 12, 'right'),
          walk(s, a.nob, 21, 16, 65),
          walk(s, a.strider, 17, 5, 65),
        ]);
        face(a.nob, 'right');
        face(a.strider, 'left');
      }
    });
    return true;
  }
  if (key === 'bree_decoys') {
    const lay = async (p, x) => {
      await walk(s, p, x, 6, 70);
      face(p, 'up');
      await gesture(s, p);
      drawBreeDecoy(b.props, x);
    };
    beat(
      s,
      async () => {
        if (i === 0) {
          focus(s, 12, 7);
          await regroup(s, 12, 10, 'right');
        }
        if (i === 1) await lay(s.player, 5);
        if (i === 2)
          await Promise.all([
            (async () => {
              await lay(a.nob, 10);
              await lay(a.nob, 15);
            })(),
            lay(s.player, 20),
          ]);
        if (i === 3) await regroup(s, 12, 11, 'left');
      },
      i === 1 ? 'Lay the first decoy' : i === 2 ? 'Finish the decoys' : '',
    );
    return true;
  }
  if (key === 'bree_watch') {
    beat(s, async () => {
      if (i === 0) {
        focus(s, 12, 12);
        b.bedrolls = s.add.graphics().setDepth(5);
        const sleepers = [s.player, sam, pippin, merry];
        await Promise.all(
          sleepers.map(async (p, j) => {
            const x = 9 + j * 2;
            b.bedrolls.fillStyle(0x665443).fillRect(x * 16 - 4, 7 * 16 - 5, 25, 12);
            await walk(s, p, x, 7, 60);
            face(p, 'right');
            await tween(s, p, { angle: 90 }, 450);
          }),
        );
        await walk(s, a.strider, 4, 14, 65);
        face(a.strider, 'left');
        sfx.door();
      }
      if (i === 1) {
        await tween(s, b.night, { alpha: 0.78 }, 1700);
        await pause(s, 1400);
      }
      if (i === 2) {
        await tween(s, b.night, { alpha: 0 }, 1800);
        await Promise.all(
          [s.player, sam, pippin, merry].map((p) => tween(s, p, { angle: 0 }, 450)),
        );
        await tween(s, b.bedrolls, { alpha: 0 }, 350);
        b.bedrolls.destroy();
        await Promise.all([
          regroup(s, 12, 10, 'right'),
          walk(s, a.strider, 17, 5, 65),
          enter(s, a.nob, 4, 15),
        ]);
        face(a.strider, 'left');
        face(a.nob, 'right');
      }
    });
    return true;
  }
  if (key === 'bree_damage') {
    beat(s, async () => {
      if (i === 0) {
        focus(s, 12, 6);
        await Promise.all([
          walk(s, s.player, 10, 6, 65),
          walk(s, sam, 5, 3, 65),
          walk(s, pippin, 15, 6, 65),
          walk(s, merry, 20, 6, 65),
        ]);
        [s.player, sam, pippin, merry].forEach((p) => face(p, 'up'));
      }
      if (i === 1) await Promise.all([gesture(s, s.player), gesture(s, pippin)]);
      if (i === 2) {
        await gesture(s, a.nob);
        await regroup(s, 12, 9, 'left');
      }
    });
    return true;
  }
  return false;
}
