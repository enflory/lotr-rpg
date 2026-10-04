// Atmosphere for the valley. The ground is ordinary tilework; what is added
// here is falling leaf or snow, the shimmer on the falls, lamp glow and a mist
// at the foot of the gorge. Every object gets a depth when it is created.
import { drifters } from './longRoadScenery.js';

/** @returns {Record<string, any>} handles the event module animates */
export function drawRivendellScenery(s, winter) {
  const fx = {};
  if (s.zoneKey !== 'rivendell') return fx;
  // The falls: pale streaks that shimmer down the tiles drawn for them.
  for (let x = 54; x < 58; x++) {
    const streak = s.add.rectangle(x * 16 + 8, 4 * 16 + 8, 2, 120, 0xffffff, 0.5).setDepth(9 * 16);
    s.tweens.add({
      targets: streak,
      alpha: 0.15,
      duration: 700 + (x % 3) * 190,
      yoyo: true,
      repeat: -1,
      delay: (x % 4) * 120,
    });
  }
  // A mist at the foot of the gorge.
  for (let i = 0; i < 6; i++) {
    const m = s.add.rectangle(55 * 16 + i * 40, (9 + i * 4) * 16, 130, 12, 0xe8f2f8, 0.12).setDepth(820);
    s.tweens.add({ targets: m, x: m.x + 30, duration: 5200 + i * 500, yoyo: true, repeat: -1 });
  }
  // Leaves in autumn, snow once the weeks have passed.
  fx.fall = drifters(
    s,
    winter ? 56 : 34,
    winter
      ? { colors: [0xffffff, 0xe6eefa], w: 2, h: 2, dx: -20, dy: 80, alpha: 0.85, depth: 830, time: 4600 }
      : { colors: [0xe0a83a, 0xc8782a, 0xf0c850, 0x9a4a24], w: 3, h: 2, dx: 40, dy: 70, alpha: 0.8, depth: 830, time: 4200 },
  );
  // A warm pool at the foot of every lamp on the grounds.
  const lamps = [[28, 22], [32, 22], [28, 27], [32, 27], [28, 36], [32, 36], [44, 15], [52, 15]];
  fx.lamps = lamps.map(([x, y]) => {
    const g = s.add
      .circle(x * 16 + 8, y * 16 + 6, 26, 0xffd77a, 0.07)
      .setDepth(y * 16 + 30);
    s.tweens.add({ targets: g, alpha: 0.12, duration: 1800 + x * 20, yoyo: true, repeat: -1 });
    return g;
  });
  return fx;
}
