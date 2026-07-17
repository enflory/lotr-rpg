// Checkpoint save system: one versioned localStorage key, written at every
// zone entry. Anything malformed loads as "no save" — worst case is a fresh
// start, never a broken title screen.

import { gameState } from './GameState.js';
import { ZONES } from '../data/zones/index.js';

export const SAVE_KEY = 'lotr-rpg.save.v1';

/**
 * @typedef {Object} SavePayload
 * @property {number} version
 * @property {number} savedAt
 * @property {string} zone
 * @property {string} entry
 * @property {Record<string, boolean>} flags
 * @property {string|null} follower
 * @property {string} objective
 * @property {Record<string, number>} items
 * @property {Record<string, boolean>} collected
 */

function storage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null; // some privacy modes throw on access
  }
}

/**
 * Snapshot gameState plus the checkpoint location.
 * @param {string} zoneKey
 * @param {string} entryKey
 */
export function save(zoneKey, entryKey) {
  const s = storage();
  if (!s) return;
  /** @type {SavePayload} */
  const payload = {
    version: 1,
    savedAt: Date.now(),
    zone: zoneKey,
    entry: entryKey,
    flags: gameState.flags,
    follower: gameState.follower,
    objective: gameState.objective,
    items: gameState.items,
    collected: gameState.collected,
  };
  try {
    s.setItem(SAVE_KEY, JSON.stringify(payload));
  } catch {
    // quota or privacy failure: play on without saving
  }
}

/** @returns {SavePayload|null} validated payload, or null if absent/unusable */
export function load() {
  const s = storage();
  if (!s) return null;
  const raw = s.getItem(SAVE_KEY);
  if (raw == null) return null;
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    clearSave(); // unreadable — clear so the next boot starts clean
    return null;
  }
  if (!data || typeof data !== 'object' || data.version !== 1) return null;
  const zone = ZONES[data.zone];
  if (!zone) return null;
  for (const field of ['flags', 'items', 'collected']) {
    if (!data[field] || typeof data[field] !== 'object') return null;
  }
  if (typeof data.objective !== 'string') return null;
  if (data.follower != null && typeof data.follower !== 'string') return null;
  if (!zone.spawns[data.entry]) {
    // Not every zone has a 'default' spawn (woodyend/marish don't) — with no
    // safe landing spot, reject the save rather than boot into undefined
    if (!zone.spawns.default) return null;
    data.entry = 'default';
  }
  return data;
}

export function clearSave() {
  const s = storage();
  if (!s) return;
  try {
    s.removeItem(SAVE_KEY);
  } catch {
    // nothing to do — absence of a save is always safe
  }
}

/**
 * Assign a validated payload onto the gameState singleton. Call before
 * starting WorldScene so NPC `when` conditions and exits resolve correctly.
 * @param {SavePayload} p
 */
export function applySave(p) {
  gameState.flags = p.flags;
  gameState.follower = p.follower ?? null;
  gameState.objective = p.objective;
  gameState.items = p.items;
  gameState.collected = p.collected;
}
