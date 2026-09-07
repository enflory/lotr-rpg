// Completed chapter beats are persisted as flags. Continue rebuilds their
// presentation and retries any unfinished animation from the last checkpoint.
import { gameState, hasFlag, setObjective } from '../state/GameState.js';
import { createWillow, updateWillow, willowDialogue } from './willowEvent.js';
import { drawHouseScenery, drawDownsRelief } from '../art/houseScenery.js';
import { drawJourneyScenery } from '../art/journeyScenery.js';
import { playMusic } from '../audio/sound.js';

const forestZones = new Set(['forestgate', 'forestheart', 'withywindle']);

function actor(scene, key, x, y, scale = 1) {
  return scene.add
    .sprite(x * 16 + 8, y * 16, key, 1)
    .setScale(scale)
    .setDepth(y * 16);
}

function pony(scene, x, y, color = 0x79533a) {
  const g = scene.add.graphics().setDepth(y * 16);
  const px = x * 16,
    py = y * 16;
  g.fillStyle(0x19201a).fillRect(px - 10, py - 6, 24, 10);
  g.fillStyle(color)
    .fillRect(px - 9, py - 5, 21, 8)
    .fillRect(px + 8, py - 13, 6, 10);
  g.fillStyle(0x302c24)
    .fillRect(px - 7, py + 3, 3, 7)
    .fillRect(px + 7, py + 3, 3, 7);
  g.fillStyle(0xc8ac77).fillRect(px - 4, py - 6, 11, 7);
  g.fillStyle(0x181c18)
    .fillRect(px + 9, py - 15, 2, 3)
    .fillRect(px + 13, py - 15, 2, 3);
  g.fillStyle(0xe0d8b5).fillRect(px + 12, py - 11, 1, 1);
  return g;
}

function atmosphere(scene) {
  const j = scene.journey,
    zone = scene.zoneKey;
  if (forestZones.has(zone)) {
    for (let i = 0; i < 26; i++) {
      const x = (i * 117 + 61) % (scene.mapWidth * 16),
        y = (i * 97 + 44) % (scene.mapHeight * 16);
      const leaf = scene.add
        .rectangle(x, y, 2 + (i % 2), 1, i % 3 ? 0xb0a564 : 0x8a984e, 0.6)
        .setDepth(830);
      scene.tweens.add({
        targets: leaf,
        x: x + 26,
        y: y + 40,
        alpha: 0,
        duration: 4000 + i * 139,
        delay: i * 130,
        repeat: -1,
      });
    }
  }
  if (zone === 'downs') {
    j.fog = scene.add.graphics().setScrollFactor(0).setDepth(840).setVisible(false);
    // The opening follows Frodo, fading radially into drifting mist.
    for (let y = 0; y < 240; y += 4)
      for (let x = 0; x < 320; x += 4) {
        const d = Math.hypot((x - 160) / 1.2, y - 120);
        const alpha = Math.min(0.9, Math.max(0, (d - 28) / 110));
        j.fog.fillStyle(0xc1cac5, alpha).fillRect(320 + x, 240 + y, 4, 4);
      }
    j.mist = [];
    for (let i = 0; i < 14; i++) {
      const mist = scene.add
        .ellipse(
          325 + ((i * 43) % 310),
          255 + ((i * 31) % 210),
          70 + (i % 3) * 25,
          10,
          0xd5ddd4,
          0.09,
        )
        .setScrollFactor(0)
        .setDepth(841)
        .setVisible(false);
      scene.tweens.add({
        targets: mist,
        x: mist.x + 30,
        duration: 4300 + i * 123,
        yoyo: true,
        repeat: -1,
      });
      j.mist.push(mist);
    }
  }
}

export function journeyCreate(scene) {
  scene.journey = { state: '', props: [], markers: [] };
  const j = scene.journey,
    key = scene.zoneKey;
  for (const p of scene.zone.interactions ?? []) {
    const dot = scene.add
      .ellipse(p.x * 16 + 8, p.y * 16 + 8, 8, 3, 0xd4c581, 0.5)
      .setDepth(p.y * 16 - 10);
    scene.tweens.add({ targets: dot, alpha: 0.2, duration: 1700, yoyo: true, repeat: -1 });
    j.markers.push({ p, dot });
  }
  drawJourneyScenery(scene);
  drawHouseScenery(scene);
  drawDownsRelief(scene);
  atmosphere(scene);
  if (key === 'crickhollow') {
    j.merry = actor(scene, 'merry', 13, 13).setVisible(!hasFlag('chapter2'));
    for (let i = 0; i < 5; i++)
      pony(scene, 24 + i * 2.5, 18, [0x79533a, 0x9b805b, 0x66544a, 0x8a6550, 0x756454][i]);
    if (!hasFlag('chapter2')) {
      setObjective('Say farewell at Crickhollow, then take the hedge tunnel east');
      scene.showBanner('Dawn at Crickhollow.\nYour friends are coming with you.');
    }
  }
  if (key === 'hedgetunnel') {
    j.gate = scene.add.graphics().setDepth(700);
    j.gateBlock = scene.add.zone(28 * 16 + 4, 9 * 16 + 8, 8, 48);
    scene.physics.add.existing(j.gateBlock, true);
    scene.physics.add.collider(scene.player, j.gateBlock);
    j.gateBlock.body.enable = !hasFlag('hedgeEntered');
    j.gate.lineStyle(2, 0x839084);
    for (let i = 0; i < 4; i++)
      j.gate.lineBetween(28 * 16 + i * 3, 8 * 16, 28 * 16 + i * 3, 11 * 16);
  }
  if (key === 'withywindle') createWillow(scene);
  if (key === 'tomclearing') for (let i = 0; i < 5; i++) pony(scene, 8 + i * 3, 17);
  if (key === 'tomhouse') {
    actor(scene, 'goldberry', 21, 7, 1.15);
    actor(scene, 'tom', 7, 5, 1.15);
    j.night = scene.add
      .rectangle(480, 360, 320, 240, 0x142340, 0.25)
      .setScrollFactor(0)
      .setDepth(820)
      .setVisible(false);
    j.rain = [];
    for (let i = 0; i < 10; i++) {
      const drop = scene.add
        .rectangle(19 * 16 + 3 + ((i * 7) % 13), 3 * 16 + 3 + ((i * 3) % 10), 1, 3, 0xc5d9df, 0.7)
        .setDepth(820)
        .setVisible(false);
      scene.tweens.add({ targets: drop, y: drop.y + 5, duration: 500 + i * 40, repeat: -1 });
      j.rain.push(drop);
    }
    j.ring = scene.add
      .circle(14 * 16 + 8, 6 * 16 - 6, 3)
      .setStrokeStyle(1, 0xebcc59)
      .setDepth(850)
      .setVisible(false);
    // Four beds are visible; their occupants need not be individually controlled.
  }
  if (key === 'barrow') {
    j.dead = [];
    for (let i = 0; i < 3; i++) {
      const x = 14 * 16 + i * 22,
        y = 10 * 16;
      const shroud = scene.add.rectangle(x, y + 6, 15, 23, 0xd9dfcb).setDepth(y);
      const head = actor(scene, ['sam', 'merry', 'pippin'][i], (x - 8) / 16, 9.7).setTint(0x91c69c);
      j.dead.push(shroud, head);
    }
    const blade = scene.add.graphics().setDepth(190);
    blade.fillStyle(0xb9ceb2).fillRect(13 * 16, 10 * 16, 74, 2);
    blade.fillStyle(0x8b7541).fillRect(13 * 16 + 4, 10 * 16 - 3, 3, 8);
    j.hand = scene.add.graphics().setDepth(195);
    j.hand.fillStyle(0x95b39b).fillRect(21 * 16, 11 * 16, 40, 5);
    for (let i = 0; i < 4; i++) j.hand.fillRect(21 * 16 - 4 - i, 11 * 16 + i * 3, 9, 2);
    j.handTween = scene.tweens.add({
      targets: j.hand,
      x: -14,
      duration: 6000,
      yoyo: true,
      repeat: -1,
    });
    scene.add.rectangle(480, 360, 320, 240, 0x0d3326, 0.25).setScrollFactor(0).setDepth(820);
  }
  if (key === 'barrowhill') {
    actor(scene, 'tom', 22, 14, 1.15);
    const gold = scene.add.graphics().setDepth(240);
    for (let i = 0; i < 16; i++)
      gold
        .fillStyle(i % 2 ? 0xd8bd61 : 0x79928a)
        .fillRect(19 * 16 + ((i * 7) % 30), 16 * 16 + ((i * 3) % 8), 3, 2);
    for (let i = 0; i < 6; i++) pony(scene, 24 + i * 2.5, 24, i === 5 ? 0x9b8261 : 0x70513d);
  }
  if (key === 'eastroad') j.tom = actor(scene, 'tom', 14, 10, 1.15);
  journeyUpdate(scene, 0);
}

function holdFollowers(scene, keys) {
  for (const p of scene.followers) {
    const held = keys.includes(p.getData('key'));
    p.setData('held', held).setVisible(!held);
    if (held) p.getData('fernOverlay').setVisible(false);
  }
}

export function journeyUpdate(scene, _delta) {
  if (!scene.journey || scene.dialogActive || scene.transitioning) return;
  const j = scene.journey,
    f = gameState.flags,
    key = scene.zoneKey;
  const tx = scene.player.x / 16,
    ty = scene.player.y / 16;
  for (const { p, dot } of j.markers) dot.setVisible(!p.when || p.when(f));
  if (key === 'crickhollow') j.merry.setVisible(!f.chapter2);
  if (key === 'hedgetunnel') {
    j.gate.setVisible(!f.hedgeEntered);
    j.gateBlock.body.enable = !f.hedgeEntered;
  }
  if (key === 'forestgate' && !f.bonfireSeen && Math.hypot(tx - 16, ty - 14) < 4)
    scene.startDialogue('forest_glade');
  if (key === 'forestheart') {
    if (!f.hillSeen && Math.hypot(tx - 18, ty - 18) < 4) scene.startDialogue('forest_hill');
    else if (!f.hollowSeen && Math.hypot(tx - 47, ty - 37) < 4)
      scene.startDialogue('forest_hollow');
  }
  if (key === 'withywindle') updateWillow(scene);
  if (key === 'tomhouse') {
    const state = f.houseRested
      ? 'morning'
      : f.houseRing
        ? 'night'
        : f.houseNightOne
          ? 'rain'
          : f.houseSupper
            ? 'night'
            : 'welcome';
    scene.player.setData('cinematicAlpha', null).setAlpha(1);
    j.night.setVisible(state === 'night');
    for (const drop of j.rain) drop.setVisible(state === 'rain');
    j.ring.setVisible(!!f.houseRing && !f.houseRested);
    if (state !== j.state) {
      j.state = state;
      if (state === 'rain') scene.showBanner('Rain on the windows.\nA day for Tom’s stories.');
      if (state === 'morning')
        scene.showBanner('A clear morning.\nThe downs lie beyond the house.');
    }
  }
  if (key === 'downs') {
    j.fog.setVisible(!!f.downsFog);
    for (const m of j.mist) m.setVisible(!!f.downsFog);
    // They remain together at the standing stone; separation comes at the paired stones.
    const separated = !!f.downsFog && tx > 49;
    holdFollowers(scene, separated ? ['sam', 'pippin', 'merry'] : []);
    if (f.downsFog && j.state !== 'fog') {
      j.state = 'fog';
      scene.checkpoint('stone');
      playMusic('barrow');
      scene.showBanner('Mist swallows the hills.\nSeek the two stones to the northeast.');
    }
    if (f.downsFog && !f.barrowTaken && tx > 57 && ty < 13) scene.startDialogue('downs_voices');
    if (f.barrowTaken) scene.goToZone('barrow', 'default');
  }
  if (key === 'barrow') {
    holdFollowers(scene, ['sam', 'pippin', 'merry']);
    if (f.barrowCourage) {
      j.handTween.stop();
      j.hand.setPosition(-10, 13).setAlpha(0.45);
    }
    if (f.barrowRescued) scene.goToZone('barrowhill', 'default');
  }
  if (key === 'barrowhill') holdFollowers(scene, []);
  if (key === 'eastroad') j.tom.setVisible(!f.chapter3Complete);
}

// Small visual tableaux accompany the action pages. The real flags still apply
// only when the dialogue finishes, so reloading during a page safely retries it.
export function journeyDialogue(scene) {
  const j = scene.journey;
  if (!j) return;
  const key = scene.dialogKey,
    page = scene.dialogIndex;
  if (scene.zoneKey === 'withywindle') willowDialogue(scene);
  if (key === 'house_ring' && hasFlag('houseStories') && !hasFlag('houseRing')) {
    j.ring.setVisible(true);
    scene.player.setData('cinematicAlpha', page === 1 ? 0.25 : 1).setAlpha(page === 1 ? 0.25 : 1);
  }
  if (key === 'barrow_courage' && hasFlag('barrowTaken') && page >= 2) {
    j.handTween.stop();
    j.hand.setPosition(-10, 13).setAlpha(0.45);
  }
  if (key === 'barrow_call' && hasFlag('barrowCourage') && page === 1) {
    scene.cameras.main.flash(1000, 245, 243, 205);
  }
}
