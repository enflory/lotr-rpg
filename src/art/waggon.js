// Farmer Maggot's waggon, seen from the side as it runs east along the lane.
//
// Drawn rather than tiled, for the same reason the ponies of the later
// chapters are drawn: it has to move smoothly along a route and sort against
// the hobbits riding in it, and a 16x16 cell cannot do either.
//
// Everything is built around an origin on the road surface, between the
// wheels, so the whole rig can be placed with one setPosition.

const BED = 0x6b4a28;
const BED_LIT = 0x8a6238;
const BED_DARK = 0x3f2a14;
const IRON = 0x2a2620;
const HIDE = 0x7a5a3e;
const HIDE_LIT = 0xa08258;
const SACK = 0xb9a877;

/** One wheel: an iron tyre, a hub, and four spokes that turn as it rolls. */
function wheel(scene, radius) {
  const g = scene.add.graphics();
  g.lineStyle(2, IRON).strokeCircle(0, 0, radius);
  g.lineStyle(1, 0x4a4038);
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 4;
    g.lineBetween(-Math.cos(a) * radius, -Math.sin(a) * radius, Math.cos(a) * radius, Math.sin(a) * radius);
  }
  g.fillStyle(0x584c40).fillCircle(0, 0, 2);
  return g;
}

/**
 * Build the rig. Returns the pieces plus `place(x, y)`, which puts the whole
 * waggon on the road at that point and rolls the wheels by how far it moved.
 */
export function makeWaggon(scene) {
  const body = scene.add.graphics();
  const r = (x, y, w, h, color) => body.fillStyle(color).fillRect(x, y, w, h);

  // The pony in the shafts, facing the way it is going (east).
  r(24, -20, 20, 10, HIDE);
  r(26, -21, 14, 5, HIDE_LIT);
  r(41, -29, 7, 12, HIDE); // neck and head
  r(42, -30, 5, 6, HIDE_LIT);
  r(46, -26, 3, 3, HIDE);
  r(40, -31, 2, 4, IRON); // mane
  r(43, -32, 2, 3, IRON);
  r(22, -20, 3, 11, IRON); // tail
  r(26, -11, 3, 9, IRON); // legs
  r(38, -11, 3, 9, IRON);

  // Shafts running back from the collar to the cart.
  r(16, -19, 12, 2, BED_DARK);
  r(16, -13, 12, 2, BED_DARK);

  // The cart: a plank bed on a frame, with boards up the sides.
  r(-22, -14, 40, 11, BED);
  r(-22, -14, 40, 2, BED_LIT);
  r(-22, -5, 40, 2, BED_DARK);
  for (const x of [-16, -8, 0, 8]) r(x, -12, 1, 8, BED_DARK);
  r(-23, -22, 3, 9, BED_DARK); // tailboard
  r(12, -24, 4, 11, BED_DARK); // headboard, behind the driving seat
  r(8, -20, 9, 5, BED_LIT); // the driving seat itself

  // Baskets and sacking, roped down. Maggot is taking produce either way.
  r(-18, -21, 10, 8, SACK);
  r(-17, -22, 7, 3, 0xd2c294);
  r(-6, -19, 8, 6, SACK);
  r(-5, -20, 5, 2, 0xd2c294);
  r(-19, -13, 24, 1, BED_DARK);

  const wheels = [wheel(scene, 6), wheel(scene, 6)];
  const offsets = [-14, 8];

  let last = null;
  let travelled = 0;
  let facing = 1;
  return {
    body,
    wheels,
    /** Face the way it is going: 1 for east, as drawn, -1 for the road home. */
    setFacing(dir) {
      facing = dir;
      body.setScale(dir, 1);
    },
    /**
     * Put the rig on the road at (x, y), roll the wheels by how far it moved,
     * and rumble. Returns the rumble, so whoever is riding can rumble with it
     * instead of floating above a cart that is moving under them.
     */
    place(x, y) {
      const dx = last ? x - last.x : 0;
      const rolled = last ? Math.hypot(dx, y - last.y) : 0;
      travelled += rolled;
      last = { x, y };
      // One pixel is plenty at this scale, and a laden cart on a farm lane
      // never sits still.
      const bob = Math.round(Math.sin(travelled / 9));
      body.setPosition(x, y + bob).setDepth(y + 2);
      wheels.forEach((w, i) => {
        w.setPosition(x + offsets[i] * facing, y - 4 + bob).setDepth(y + 3);
        w.rotation += (rolled / 6) * (dx < 0 ? -1 : 1);
      });
      return bob;
    },
    setVisible(on) {
      body.setVisible(on);
      for (const w of wheels) w.setVisible(on);
    },
    destroy() {
      body.destroy();
      for (const w of wheels) w.destroy();
    },
  };
}
