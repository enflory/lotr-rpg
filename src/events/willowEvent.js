// The Willow uses the actual party sprites throughout. Only completed dialogue
// beats are saved; reloading an unfinished beat replays it from its checkpoint.
import { gameState } from '../state/GameState.js';
import { tween, move, walk } from './storyMotion.js';
import { drawWillow } from '../art/willowScenery.js';
import { playMusic, sfx } from '../audio/sound.js';

const at = (x, y) => ({ x: x * 16 + 8, y: y * 16 });
const friend = (s, key) => s.followers.find((p) => p.getData('key') === key);
const keyOf = (p) => p.getData('key') || p.texture.key;
function ripple(s, x, y, color = 0xb8cec2) {
  const r = s.add.ellipse(x, y, 10, 3).setStrokeStyle(1, color, 0.7).setDepth(405);
  s.tweens.add({
    targets: r,
    scaleX: 4,
    scaleY: 3,
    alpha: 0,
    duration: 950,
    onComplete: () => r.destroy(),
  });
}
function rustle(s) {
  const crown = s.journey.willow.crown;
  s.tweens.add({
    targets: crown,
    x: 2,
    duration: 130,
    yoyo: true,
    repeat: 5,
    ease: 'Sine.easeInOut',
  });
}
function focus(s) {
  s.cameras.main.stopFollow();
  s.cameras.main.pan(46.5 * 16, 21.5 * 16, 900, 'Sine.easeInOut');
}
function freeze(s) {
  s.journey.willow.active = true;
  s.player.setVelocity(0);
  s.player.body.enable = false;
  for (const p of s.followers) p.setData('held', true);
}
function beat(s, run = null, prompt = '') {
  freeze(s);
  const b = { busy: false, prompt, action: null };
  s.storyBeat = b;
  const execute = async () => {
    b.busy = true;
    b.prompt = '';
    await run();
    if (s.storyBeat !== b) return;
    b.busy = false;
    if (prompt) s.advanceDialogue();
  };
  if (prompt) b.action = execute;
  else if (run) execute();
}
function restingCaptives(s) {
  // Only on scene creation: reconstruct the checkpoint before the first frame.
  const m = friend(s, 'merry'),
    p = friend(s, 'pippin');
  m.setPosition(48.5 * 16, 19 * 16)
    .setAngle(-90)
    .setCrop(0, 12, 16, 12)
    .setDepth(330)
    .setData('held', true);
  p.setPosition(50.5 * 16, 19 * 16)
    .setAlpha(0)
    .setScale(0.2)
    .setVisible(false)
    .setData('held', true);
}
async function gather(s, everyone) {
  const start = at(46, 22);
  await walk(s, s.player, 46, 22);
  const keys = everyone ? ['sam', 'pippin', 'merry'] : ['sam'];
  await Promise.all(
    keys.map((key, i) => move(s, friend(s, key), { x: start.x - 18 * (i + 1), y: start.y }, 78)),
  );
}
function releaseControl(s) {
  const w = s.journey.willow,
    f = gameState.flags;
  w.active = false;
  s.storyBeat = null;
  s.player.setAngle(0).setTint(0xffffff).setAlpha(1);
  s.player.body.reset(s.player.x, s.player.y);
  s.player.body.enable = true;
  for (const p of s.followers) {
    const held = f.willowTrapped && !f.willowFreed && ['merry', 'pippin'].includes(keyOf(p));
    p.setData('held', !!held);
    if (!held) p.setAngle(0).setCrop().setScale(1).setAlpha(1).setVisible(true);
  }
  // Seed the trail from the visible formation, never teleport it into place.
  s.trail = [s.player, ...s.followers].map((p) => ({ x: p.x, y: p.y }));
  s.cameras.main.startFollow(s.player, true, 0.08, 0.08);
  if (f.willowTrapped && !f.willowFreed) s.checkpoint('willow');
  if (f.willowFreed) {
    playMusic('bombadil');
    s.showBanner('The willow opens.\nFollow the river east.');
  }
}

export function createWillow(s) {
  const f = gameState.flags;
  const parts = drawWillow(s);
  const tomStart = at(f.tomArrived ? 46 : 18, f.tomArrived ? 21 : 22);
  const tom = s.add
    .sprite(tomStart.x, tomStart.y, 'tom', 1)
    .setData('key', 'tom')
    .setScale(1.15)
    .setDepth(360)
    .setVisible(!!f.tomArrived && !f.willowFreed);
  const fire = s.add.graphics().setDepth(410).setVisible(false);
  fire.fillStyle(0xcf6737).fillRect(46 * 16, 21 * 16 - 5, 9, 10);
  fire.fillStyle(0xf2cc75).fillRect(46 * 16 + 3, 21 * 16 - 8, 3, 12);
  const embers = s.add.graphics().setDepth(4).setVisible(!!f.willowFireFailed);
  embers.fillStyle(0x34261f).fillRect(46 * 16 - 1, 21 * 16 + 3, 13, 4);
  s.journey.willow = { ...parts, tom, fire, embers, active: false };
  if (f.willowTrapped && !f.willowFreed) restingCaptives(s);
}

export function updateWillow(s) {
  const w = s.journey.willow,
    f = gameState.flags;
  if (w.active && !s.dialogActive) releaseControl(s);
  if (f.willowFreed && w.tom.visible && !w.leading) {
    w.leading = true;
    // Control is back with the hobbits while Tom skips ahead along the river.
    walk(s, w.tom, 79, 16, 180).then(() => w.tom.setVisible(false));
  }
  const tx = s.player.x / 16,
    ty = s.player.y / 16;
  if (!f.willowTrapped && !f.willowFreed && tx > 40 && tx < 56 && ty > 19 && ty < 26)
    s.startDialogue('willow_sleep');
}

export function willowDialogue(s) {
  const key = s.dialogKey,
    page = s.dialogIndex,
    f = gameState.flags;
  const w = s.journey.willow;
  if (!w) return;
  const sam = friend(s, 'sam'),
    merry = friend(s, 'merry'),
    pippin = friend(s, 'pippin');
  if (key === 'willow_sleep' && !f.willowTrapped && !f.willowFreed) {
    if (page === 0)
      beat(s, async () => {
        focus(s);
        rustle(s);
        await Promise.all([
          (async () => {
            await walk(s, s.player, 44, 25, 54);
            s.cameras.main.pan(46.5 * 16, 25 * 16, 1300, 'Sine.easeInOut');
            s.player.play('frodo-idle-down');
            await tween(s, s.player, { ...at(44, 28), angle: 80 }, 1350);
            s.player.setTint(0x94adb0);
            ripple(s, s.player.x, s.player.y + 6);
          })(),
          (async () => {
            await tween(s, w.mouths[0], { scaleX: 1.4 }, 400);
            await walk(s, merry, 48, 20, 65);
            await tween(
              s,
              merry,
              {
                x: 48.5 * 16,
                y: 19 * 16,
                angle: -90,
                depth: 330,
                onUpdate: (t) => merry.setCrop(0, 12 * t.progress, 16, 24 - 12 * t.progress),
              },
              1100,
            );
          })(),
          (async () => {
            await tween(s, w.mouths[1], { scaleX: 1.4 }, 450);
            await walk(s, pippin, 50, 20, 70);
            await tween(
              s,
              pippin,
              { x: 50.5 * 16, y: 19 * 16, alpha: 0, scaleX: 0.2, scaleY: 0.2, depth: 330 },
              1300,
            );
            pippin.setVisible(false);
            await tween(s, w.mouths, { scaleX: 0.2 }, 550);
            rustle(s);
          })(),
          walk(s, sam, 43, 26, 65),
        ]);
      });
    else if (page === 1)
      beat(
        s,
        async () => {
          await move(s, sam, at(43, 27), 60);
          ripple(s, s.player.x, s.player.y + 6);
          await Promise.all([
            tween(s, s.player, { ...at(44, 26), angle: 30 }, 900),
            move(s, sam, at(43, 26), 32),
          ]);
          ripple(s, s.player.x, s.player.y + 8);
          await Promise.all([
            tween(s, s.player, { ...at(44, 25), angle: 0 }, 800),
            move(s, sam, at(43, 25), 32),
          ]);
          s.player.clearTint();
          focus(s);
        },
        'Pull Frodo clear',
      );
    else beat(s, () => gather(s, false));
  }
  if (key === 'willow_trunk' && f.willowTrapped && !f.willowFireFailed) {
    if (page === 0)
      beat(
        s,
        async () => {
          focus(s);
          await Promise.all([walk(s, s.player, 47, 21), walk(s, sam, 45, 21)]);
          w.embers.setVisible(true);
          w.fire.setVisible(true).setAlpha(0).setScale(1);
          await tween(s, w.fire, { alpha: 1 }, 600);
          w.flicker = s.tweens.add({
            targets: w.fire,
            alpha: 0.6,
            duration: 140,
            yoyo: true,
            repeat: -1,
          });
          rustle(s);
        },
        'Kindle the fallen twigs',
      );
    else if (page === 1)
      beat(
        s,
        async () => {
          await move(s, s.player, at(46, 21), 50);
          await tween(s, s.player, { y: s.player.y - 3, yoyo: true, repeat: 2 }, 160);
          ripple(s, w.fire.x + 46 * 16, w.fire.y + 21 * 16, 0xb7d4d6);
          w.flicker?.stop();
          await tween(s, w.fire, { alpha: 0 }, 750);
          w.fire.setVisible(false);
          await gather(s, false);
        },
        'Stamp out the fire',
      );
    else beat(s);
  }
  if (key === 'willow_help' && f.willowFireFailed && !f.tomArrived) {
    if (page === 0)
      beat(
        s,
        async () => {
          ripple(s, s.player.x, s.player.y - 5, 0xc0ce8a);
          sfx.confirm();
          w.tom.setVisible(true);
          await walk(s, w.tom, 27, 20, 110);
        },
        'Call along the river',
      );
    else if (page === 1) beat(s, () => walk(s, w.tom, 30, 20, 80));
    else
      beat(s, async () => {
        await walk(s, w.tom, 46, 21, 110);
        w.tom.play('tom-idle-up');
      });
  }
  if (key === 'willow_tom' && f.tomArrived && !f.willowFreed) {
    if (page === 0)
      beat(s, async () => {
        focus(s);
        await walk(s, w.tom, 47, 20, 65);
        w.tom.play('tom-idle-up');
        for (let i = 0; i < 3; i++) {
          ripple(s, w.tom.x, w.tom.y - 12, 0xe1d58c);
          await tween(s, w.tom, { y: w.tom.y - 2, yoyo: true }, 220);
        }
        rustle(s);
      });
    else if (page === 1)
      beat(
        s,
        async () => {
          await walk(s, sam, 49, 21, 85);
          await tween(s, w.mouths, { scaleX: 1.4 }, 700);
          // The same sprites emerge from their last visible point in the cracks.
          merry.setCrop().setVisible(true);
          pippin.setVisible(true);
          await Promise.all([
            tween(s, merry, { ...at(48, 21), angle: 20 }, 950),
            tween(s, pippin, { ...at(50, 21), alpha: 1, scaleX: 1, scaleY: 1, angle: -15 }, 1250),
          ]);
          await Promise.all([
            tween(s, merry, { ...at(48, 22), angle: 0 }, 550),
            tween(s, pippin, { ...at(50, 22), angle: 0 }, 650),
          ]);
          await tween(s, w.mouths, { scaleX: 0.2 }, 700);
          merry.setDepth(merry.y);
          pippin.setDepth(pippin.y);
        },
        'Reach for your friends',
      );
    else
      beat(s, async () => {
        await gather(s, true);
        await walk(s, w.tom, 55, 20, 80);
      });
  }
}
