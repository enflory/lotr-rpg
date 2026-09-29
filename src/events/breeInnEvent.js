// The inn's social scenes use the actual party sprites. Completed dialogue
// checkpoints own progress; interrupted movement is replayed on Continue.
import { gameState } from '../state/GameState.js';
import { walk, tween } from './storyMotion.js';
import { playMusic, stopMusic, sfx } from '../audio/sound.js';

const friend = (s, key) => s.followers.find((p) => p.getData('key') === key);
const pause = (s, ms) => new Promise((resolve) => s.time.delayedCall(ms, resolve));
const audience = { breelocal: [13, 9], breelocal2: [17, 9], breedwarf: [19, 11] };
const face = (p, dir) => {
  p.setData('dir', dir);
  p.play(`${p.getData('key') || p.texture.key}-idle-${dir}`, true);
};
const gesture = (s, p) => tween(s, p, { angle: 7, yoyo: true, repeat: 1 }, 150);
function focus(s, x, y) {
  s.cameras.main.stopFollow();
  s.cameras.main.pan(x * 16 + 8, y * 16, 650, 'Sine.easeInOut');
}
async function leave(s, p, x, y, delay = 0) {
  await pause(s, delay);
  await walk(s, p, x, y, 85);
  p.setVisible(false);
}
function meal(s) {
  const g = s.add.graphics().setDepth(140);
  for (const x of [7, 8, 9]) {
    g.fillStyle(0xe5d4a8).fillEllipse(x * 16 + 8, 8 * 16 + 7, 10, 5);
    g.fillStyle(0x9e5a33).fillEllipse(x * 16 + 8, 8 * 16 + 7, 6, 3);
    g.fillStyle(0xc2954d).fillRect(x * 16 + 1, 8 * 16 + 2, 4, 3);
  }
  return g;
}

export function restoreInnPositions(s) {
  const f = gameState.flags;
  if (s.zoneKey === 'ponycommon' && f.breeCompany && !f.breeRingSlip) {
    friend(s, 'pippin')
      .setPosition(15 * 16 + 8, 9 * 16)
      .setDepth(9 * 16 + 20);
    face(friend(s, 'pippin'), 'left');
    for (const [key, [x, y]] of Object.entries(audience)) {
      const p = s.bree.actors[key];
      p.setPosition(x * 16 + 8, y * 16).setDepth(y * 16 + 20);
      face(p, x < 15 ? 'right' : 'left');
    }
  }
  if (s.zoneKey === 'ponyparlour' && f.ponySupper && !f.breeRingSlip) {
    const m = friend(s, 'merry');
    m.setPosition(17 * 16 + 8, 5 * 16).setDepth(5 * 16 + 20);
    face(m, 'left');
  }
  if (s.zoneKey === 'ponycommon' && f.breeRingSlip) playMusic('breewatch');
}

export function innDialogue(s, beat) {
  const key = s.dialogKey,
    i = s.dialogIndex,
    b = s.bree,
    a = b.actors,
    sam = friend(s, 'sam'),
    pippin = friend(s, 'pippin'),
    merry = friend(s, 'merry');

  if (key === 'bree_welcome') {
    beat(s, async () => {
      if (i === 0) {
        face(a.butterbur, 'down');
        await gesture(s, a.butterbur);
      }
      if (i === 1) {
        s.cameras.main.startFollow(s.player, true, 0.08, 0.08);
        await Promise.all([
          walk(s, a.butterbur, 28, 17, 85),
          ...[s.player, sam, pippin, merry].map(async (p, j) => {
            await pause(s, j * 160);
            await walk(s, p, 28 - j, 18, 70);
            face(p, 'right');
          }),
        ]);
      }
      if (i === 2) b.nextZone = { zone: 'ponyparlour', entry: 'common' };
    });
    return true;
  }
  if (key === 'bree_supper') {
    const names = [
      'Supper in the little parlour',
      'Barliman Butterbur',
      'Merry',
      'Pippin',
      'After supper',
    ];
    s.dialogNameText.setText(names[i]);
    beat(s, async () => {
      if (i === 0) {
        focus(s, 11, 8);
        const seats = [
          [8, 9, 'up'],
          [6, 8, 'right'],
          [10, 8, 'left'],
          [8, 7, 'down'],
        ];
        await Promise.all(
          [s.player, sam, pippin, merry].map(async (p, j) => {
            await walk(s, p, seats[j][0], seats[j][1], 65);
            face(p, seats[j][2]);
          }),
        );
        await walk(s, a.butterbur, 11, 8, 75);
        face(a.butterbur, 'left');
        await walk(s, a.nob, 7, 10, 75);
        face(a.nob, 'up');
        b.meal = meal(s);
        await Promise.all([gesture(s, sam), gesture(s, pippin)]);
      }
      if (i === 1) {
        await gesture(s, a.butterbur);
        await leave(s, a.butterbur, 0, 16);
      }
      if (i === 2) await gesture(s, merry);
      if (i === 3) await gesture(s, pippin);
      if (i === 4) {
        await walk(s, merry, 17, 5, 65);
        face(merry, 'left');
        s.cameras.main.startFollow(s.player, true, 0.08, 0.08);
        await Promise.all(
          [s.player, sam, pippin].map(async (p, j) => {
            await pause(s, j * 180);
            await walk(s, p, j, 16, 70);
            face(p, 'left');
          }),
        );
        b.nextZone = { zone: 'ponycommon', entry: 'parlour' };
      }
    });
    return true;
  }
  if (key === 'bree_company') {
    s.dialogNameText.setText(['The company of the Pony', 'Frodo', 'Pippin'][i]);
    beat(s, async () => {
      if (i === 0) {
        focus(s, 15, 10);
        await Promise.all([
          walk(s, s.player, 13, 11, 65),
          walk(s, sam, 12, 11, 65),
          walk(s, pippin, 15, 9, 65),
          walk(s, a.butterbur, 10, 10, 85),
          ...Object.entries(audience).map(async ([key, [x, y]]) => {
            await walk(s, a[key], x, y, 65);
            face(a[key], x < 15 ? 'right' : 'left');
          }),
        ]);
        face(pippin, 'left');
        face(s.player, 'up');
        face(a.butterbur, 'right');
      }
      if (i === 1) await gesture(s, s.player);
      if (i === 2)
        await Promise.all([
          gesture(s, pippin),
          gesture(s, a.breelocal),
          walk(s, a.butterbur, 6, 4, 85),
        ]);
    });
    return true;
  }
  if (key !== 'bree_song') return false;

  const names = [
    'Pippin',
    'Strider',
    'Pippin',
    'Frodo',
    'A song at the Pony',
    'An encore',
    'A missed step',
    'The common room',
    'In the shadows',
    'Strider',
    'Frodo',
    'An uneasy silence',
  ];
  s.dialogNameText.setText(names[i]);
  beat(
    s,
    async () => {
      if (i === 0) {
        focus(s, 15, 10);
        await gesture(s, pippin);
        await gesture(s, a.breelocal2);
      }
      if (i === 1) {
        focus(s, 23, 7);
        await walk(s, s.player, 24, 5, 65);
        face(s.player, 'up');
        face(a.strider, 'down');
        await gesture(s, a.strider);
      }
      if (i === 2) {
        focus(s, 15, 10);
        await walk(s, s.player, 14, 8, 70);
        await tween(s, s.player, { y: s.player.y - 16 }, 380);
        face(s.player, 'down');
        face(pippin, 'up');
        await walk(s, sam, 12, 9, 70);
      }
      if (i === 3) await gesture(s, s.player);
      if (i === 4) {
        await tween(s, s.player, { y: s.player.y - 2, yoyo: true, repeat: 3 }, 220);
        await Promise.all(Object.keys(audience).map((key) => gesture(s, a[key])));
      }
      if (i === 5) {
        await Promise.all([
          tween(s, s.player, { angle: 9, yoyo: true, repeat: 2 }, 190),
          gesture(s, pippin),
          gesture(s, a.breelocal),
        ]);
      }
      if (i === 6) {
        await tween(s, s.player, { y: s.player.y - 7 }, 250);
        await tween(s, s.player, { y: s.player.y + 23, angle: 75 }, 330);
        b.mug = s.add.graphics({ x: s.player.x, y: s.player.y - 9 }).setDepth(810);
        b.mug.fillStyle(0xc9bc91).fillRect(-2, -3, 4, 5);
        b.mug.lineStyle(1, 0xc9bc91).strokeRect(2, -2, 2, 3);
        await tween(s, b.mug, { x: b.mug.x + 17, y: b.mug.y + 9, angle: 105 }, 550);
      }
      if (i === 7) {
        s.player.setData('cinematicAlpha', 0).setAlpha(0);
        stopMusic();
        sfx.sting();
        await Promise.all([
          walk(s, a.breelocal, 12, 10, 80),
          walk(s, a.breelocal2, 18, 10, 80),
          walk(s, a.breedwarf, 20, 12, 80),
          leave(s, a.ferny, 15, 22),
          leave(s, a.southerner, 15, 22, 400),
          leave(s, a.harry, 15, 22, 750),
        ]);
        face(pippin, 'down');
        face(sam, 'right');
      }
      if (i === 8) {
        s.player.setAngle(0);
        await walk(s, s.player, 24, 6, 45);
        focus(s, 23, 7);
        s.player.setData('cinematicAlpha', 1).setAlpha(1);
        face(s.player, 'up');
        face(a.strider, 'down');
        await pause(s, 650);
      }
      if (i === 9) {
        playMusic('breewatch');
        await gesture(s, a.strider);
      }
      if (i === 10) {
        focus(s, 17, 11);
        await walk(s, s.player, 18, 11, 65);
        face(s.player, 'up');
        await walk(s, a.butterbur, 18, 9, 85);
        face(a.butterbur, 'down');
        await gesture(s, s.player);
      }
      if (i === 11) {
        await Promise.all([
          walk(s, sam, 17, 11, 65),
          walk(s, pippin, 16, 11, 65),
          ...Object.keys(audience).map((key, j) => leave(s, a[key], 15, 22, j * 250)),
          leave(s, a.strider, 29, 18, 500),
        ]);
        b.mug?.destroy();
        face(s.player, 'right');
        face(sam, 'right');
        face(pippin, 'right');
        s.lastDir = 'right';
      }
    },
    i === 2 ? 'Interrupt Pippin' : '',
  );
  return true;
}
