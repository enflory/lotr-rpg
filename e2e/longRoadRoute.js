// Shared by the chapter 5 specs: the flags at the end of chapter four, and the
// flags a player holds just before any given beat of the long road.
import { BOUNDARY } from './journeyRoute.js';
import { BREE_BEATS } from '../src/state/breeProgress.js';
import { LONG_ROAD_BEATS } from '../src/state/longRoadProgress.js';

export const AFTER_BREE = {
  ...BOUNDARY.clearing.flags,
  barrowTaken: true,
  barrowCourage: true,
  barrowRescued: true,
  barrowBlades: true,
  poniesRecovered: true,
  chapter3Complete: true,
  ...Object.fromEntries(BREE_BEATS.map((b) => [b.flag, true])),
  striderJoined: true,
};

/** Every flag a player has set by the time `key` is the next beat. */
export const through = (key) =>
  Object.fromEntries(
    LONG_ROAD_BEATS.slice(
      0,
      LONG_ROAD_BEATS.findIndex((b) => b.key === key),
    ).map((b) => [b.flag, true]),
  );
