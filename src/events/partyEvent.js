// The Long-expected Party prologue in the Party Field.
//
// The game opens at Bilbo's farewell birthday party. Fireworks burst
// over the field while the player mingles; talking to Bilbo plays his
// speech (the dialogue close sets `bilboFarewell`), then he vanishes
// in a flash and seventeen years pass — the zone restarts at the
// default spawn and the familiar Gandalf opening begins.
//
// Phases: party → vanish → timeskip → done. Inert once `prologueDone`.

import { hasFlag, setFlag, setObjective } from '../state/GameState.js';
import { sfx } from '../audio/sound.js';

// Burst area over the field, in pixels (tiles ~1-8 × rows ~20-24)
const BURST = { x0: 24, x1: 136, y0: 322, y1: 388 };
const SPARK_COLORS = [0xe85050, 0xe8c840, 0x50c850, 0x6a90e0, 0xf8e880];

function spawnFirework(scene) {
  const cx = BURST.x0 + Math.random() * (BURST.x1 - BURST.x0);
  const cy = BURST.y0 + Math.random() * (BURST.y1 - BURST.y0);
  const color = SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)];

  // Center flash
  const flash = scene.add.circle(cx, cy, 4, 0xffffff).setDepth(990);
  scene.tweens.add({
    targets: flash,
    alpha: 0,
    scale: 2.4,
    duration: 300,
    onComplete: () => flash.destroy(),
  });

  // Radial sparks — fly at full brightness, then wink out
  for (let i = 0; i < 10; i++) {
    const angle = (i / 10) * Math.PI * 2;
    const spark = scene.add.circle(cx, cy, 2, color).setDepth(990);
    scene.tweens.add({
      targets: spark,
      x: cx + Math.cos(angle) * (14 + Math.random() * 10),
      y: cy + Math.sin(angle) * (14 + Math.random() * 10),
      alpha: { value: 0, delay: 420, duration: 280 },
      duration: 700,
      onComplete: () => spark.destroy(),
    });
  }
  sfx.blip();
}

export function partyEventUpdate(scene, delta) {
  if (hasFlag('prologueDone')) return;

  let ev = scene.partyEvent;
  if (!ev) ev = scene.partyEvent = { phase: 'party', fireworkIn: 900, timer: 0 };

  if (ev.phase === 'party') {
    ev.fireworkIn -= delta;
    if (ev.fireworkIn <= 0) {
      ev.fireworkIn = 900 + Math.random() * 1100;
      spawnFirework(scene);
    }
    if (hasFlag('bilboFarewell')) {
      // Speech over — a beat, then the joke lands
      ev.phase = 'vanish';
      ev.timer = 700;
      scene.inputLocked = true;
    }
    return;
  }

  if (ev.phase === 'vanish') {
    ev.timer -= delta;
    if (ev.timer > 0) return;
    scene.cameras.main.flash(500, 255, 255, 255);
    sfx.sting();
    scene.removeNpc('bilbo');
    scene.showBanner('With a blinding flash,\nBilbo Baggins is gone!');
    ev.phase = 'timeskip';
    ev.timer = 2400;
    return;
  }

  if (ev.phase === 'timeskip') {
    ev.timer -= delta;
    if (ev.timer > 0) return;
    ev.phase = 'done';
    setFlag('prologueDone');
    setObjective('Speak with Gandalf outside Bag End');
    scene.cameras.main.fadeOut(900, 0, 0, 0);
    scene.cameras.main.once('camerafadeoutcomplete', () => {
      scene.scene.restart({ zone: 'shire', entry: 'default' });
    });
  }
}

// zone.onCreate — one-shot "years pass" card when the shire re-creates
// after the prologue restart.
export function partyZoneCreate(scene) {
  if (hasFlag('prologueDone') && !hasFlag('timeskipShown')) {
    setFlag('timeskipShown');
    scene.time.delayedCall(700, () => scene.showBanner('Seventeen years pass...'));
  }
}
