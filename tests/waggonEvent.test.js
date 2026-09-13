// Maggot's night ride. The animation itself is covered by e2e; what is worth
// pinning here is the shape of it — that the lane the waggon drives is
// actually lane, that everyone who should be aboard has a seat on the cart,
// and that the ride fires exactly once.

import { describe, it, expect, beforeEach } from 'vitest';
import { route, SEATS, waggonEventUpdate } from '../src/events/waggonEvent.js';
import { gameState } from '../src/state/GameState.js';
import { marish, LANE_ROW } from '../src/data/zones/marish.js';
import { T, TILE_SIZE, COLLISION_TILES } from '../src/data/tileTypes.js';

const tileUnder = (x, y) => marish.map[Math.floor(y / TILE_SIZE)][Math.floor(x / TILE_SIZE)];

beforeEach(() => {
  gameState.flags = {};
});

describe('the route down to the Ferry', () => {
  const stops = route();

  it('starts at the farm and ends on the lane beside the landing', () => {
    expect(Math.floor(stops[0].x / TILE_SIZE)).toBeLessThan(marish.spawns.landing.x);
    const last = stops[stops.length - 1];
    expect(Math.floor(last.y / TILE_SIZE)).toBe(LANE_ROW + 1);
  });

  it('never leaves the lane, corner to corner', () => {
    for (let i = 1; i < stops.length; i++) {
      const from = stops[i - 1],
        to = stops[i];
      const steps = Math.ceil(Math.hypot(to.x - from.x, to.y - from.y) / 4);
      for (let n = 0; n <= steps; n++) {
        const x = from.x + ((to.x - from.x) * n) / steps;
        const y = from.y + ((to.y - from.y) * n) / steps;
        const tile = tileUnder(x, y);
        expect(tile, `leg ${i} at (${Math.round(x)},${Math.round(y)})`).toBe(T.PATH);
        expect(COLLISION_TILES).not.toContain(tile);
      }
    }
  });

  it('runs each leg either along the lane or across the bend, never diagonally', () => {
    for (let i = 1; i < stops.length; i++) {
      const straight = stops[i].x === stops[i - 1].x || stops[i].y === stops[i - 1].y;
      expect(straight, `leg ${i}`).toBe(true);
    }
  });
});

describe('the load', () => {
  it('seats the driver and all three hobbits, the driver in front', () => {
    expect(SEATS.map((s) => s.key)).toEqual(['maggot', 'player', 'sam', 'pippin']);
    const driver = SEATS[0];
    for (const seat of SEATS.slice(1)) expect(driver.x).toBeGreaterThan(seat.x);
  });

  it('keeps every seat over the cart rather than hanging off the back', () => {
    for (const seat of SEATS) {
      expect(Math.abs(seat.x)).toBeLessThanOrEqual(22);
      expect(seat.y).toBeLessThan(0);
    }
  });
});

describe('when the ride runs', () => {
  const inertScene = () => ({ waggonRide: false });

  it('waits until Maggot has offered the lift', () => {
    const scene = inertScene();
    waggonEventUpdate(scene);
    expect(scene.waggonRide).toBe(false);
  });

  it('never replays once the party has been set down at the landing', () => {
    const scene = inertScene();
    gameState.flags.maggotRide = true;
    gameState.flags.rodeWaggon = true;
    waggonEventUpdate(scene);
    expect(scene.waggonRide).toBe(false);
  });
});
