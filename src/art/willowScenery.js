// Old Man Willow: stepped bark and hanging leaf curtains, drawn once.
// Only the four-tile trunk reads as an obstruction; spreading roots lie flat.
export function drawWillow(scene) {
  const x = 49 * 16, y = 19 * 16;
  const ground = scene.add.graphics().setDepth(3);
  const trunk = scene.add.graphics().setDepth(y + 15);
  const crown = scene.add.graphics().setDepth(y + 28);
  const rect = (g, dx, dy, w, h, color) => g.fillStyle(color).fillRect(Math.round(x + dx), Math.round(y + dy), Math.round(w), Math.round(h));
  const random = n => ((Math.imul(n + 53, 374761393) ^ Math.imul(n + 197, 668265263)) >>> 0) / 4294967296;

  // Uneven carpet of moss, all low-value ground detail without an oval shadow.
  for (let n = 0; n < 32; n++) {
    const dx = Math.floor(random(n) * 110) - 55;
    const dy = Math.floor(random(n + 69) * 22) + 4;
    rect(ground, dx, dy, 4 + n % 7, 1 + n % 2, [0x3b4630, 0x535735, 0x686943][n % 3]);
  }
  for (let branch = 0; branch < 7; branch++) {
    const start = -25 + branch * 8;
    const reach = (branch - 3) * 5;
    for (let step = 0; step < 7; step++) {
      const dx = start + Math.round(reach * step / 6);
      const dy = 10 + step * 2;
      rect(ground, dx, dy, 5 - Math.floor(step / 3), 2, 0x484c34);
      rect(ground, dx, dy, 2, 1, 0x7a7850);
    }
  }

  // Gnarled grey trunk fits x47..50; its feet finish within row 19.
  rect(trunk, -31, -31, 62, 44, 0x333d2e);
  rect(trunk, -27, -59, 51, 69, 0x5b6048);
  rect(trunk, -22, -65, 38, 72, 0x6d7057);
  rect(trunk, -25, -51, 7, 58, 0x8c8970);
  rect(trunk, -15, -60, 4, 66, 0x4d5741);
  rect(trunk, 0, -58, 8, 70, 0x85866b);
  rect(trunk, 10, -48, 4, 60, 0x454f39);
  rect(trunk, 27, -23, 4, 35, 0x535c40);
  // Asymmetric branches disappear into the crown, with blocky elbows.
  for (let step = 0; step < 7; step++) {
    rect(trunk, -25 - step * 5, -45 - step * 4, 9, 8, 0x5b6048);
    rect(trunk, -24 - step * 5, -45 - step * 4, 3, 5, 0x85836a);
    rect(trunk, 14 + step * 5, -39 - step * 5, 8, 8, 0x49543c);
  }
  for (let n = 0; n < 23; n++) {
    const dx = -25 + Math.floor(random(n + 30) * 50);
    const dy = -52 + Math.floor(random(n + 80) * 55);
    rect(trunk, dx, dy, 2, 3 + n % 5, n % 3 ? 0x6a7550 : 0x9a9376);
  }
  // Two distinct fissures: Merry and Pippin's prisons, not human faces.
  for (const [cx, top, width] of [[-8, -25, 9], [24, -21, 8]]) {
    rect(trunk, cx - width / 2 - 1, top + 5, width + 2, 28 - top / 4, 0x343c2a);
    rect(trunk, Math.floor(cx - width / 2), top, width - 2, 35 + top / 4, 0x111f19);
    rect(trunk, cx - 2, top - 4, 2, 8, 0x263528);
    rect(trunk, cx - width / 2 - 2, top + 7, 2, 18, 0x939074);
  }

  function leafMass(cx, cy, radius, seed) {
    const colors = [0x243b2a, 0x33492e, 0x425634, 0x52633a, 0x697447];
    for (let row = -radius; row <= radius; row += 4) {
      const edge = Math.floor((radius - Math.abs(row) * 0.55) / 4) * 4;
      const jitter = Math.floor(random(seed + row) * 3) * 2;
      rect(crown, cx - edge + jitter, cy + row, edge * 2 - jitter, 4, colors[0]);
      if (edge > 5) rect(crown, cx - edge + 3, cy + row, edge * 2 - 7, 3, colors[1]);
    }
    for (let n = 0; n < 12; n++) {
      const dx = Math.floor((random(seed + n) - 0.5) * radius * 1.4);
      const dy = Math.floor((random(seed + n + 17) - 0.6) * radius * 1.3);
      rect(crown, cx + dx, cy + dy, 5 + n % 4, 3, colors[2 + n % 3]);
      if (n % 3 === 0) rect(crown, cx + dx + 1, cy + dy, 3, 1, 0x87905a);
    }
  }
  // A broad, low crown built from overlapping angular leaf masses.
  for (const [cx, cy, r, seed] of [[-40,-64,24,4],[-16,-75,26,19],[15,-78,25,35],[42,-65,23,48],[-3,-54,23,66],[27,-55,21,79]]) {
    leafMass(cx, cy, r, seed);
  }
  // Loose curtains of narrow willow leaves. The hanging branches have gaps;
  // the two central cracks stay readable from the southern approach.
  for (let n = 0; n < 30; n++) {
    const dx = -62 + n * 4;
    if (dx > -17 && dx < 30) continue;
    const top = -61 + Math.floor(random(n + 110) * 19);
    const length = 22 + Math.floor(random(n + 154) * 25);
    for (let step = 0; step < length; step += 3) {
      const drift = Math.floor(step / 12) * (n % 2 ? 1 : -1);
      rect(crown, dx + drift, top + step, 1, 3, 0x586840);
      if (step % 6 === 0) rect(crown, dx + drift - 1, top + step + 1, 3, 2, n % 3 ? 0x6d7e49 : 0x89925a);
    }
  }
  return { ground, trunk, crown };
}
