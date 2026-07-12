// Global story/session state. Persists across zone changes (module
// singleton); reset only on full page reload.

export const gameState = {
  /** @type {Record<string, boolean>} story event flags, e.g. metGandalf, samJoined */
  flags: {},
  /** @type {string|null} character key trailing the player (e.g. 'sam') */
  follower: null,
  objective: 'Speak with Gandalf outside Bag End',
  /** @type {Record<string, number>} item key → count carried */
  items: {},
  /** @type {Record<string, boolean>} pickup ids already collected */
  collected: {},
};

/** @param {string} name */
export function setFlag(name) {
  gameState.flags[name] = true;
}
/** @param {string} name */
export function hasFlag(name) {
  return !!gameState.flags[name];
}

/** @param {string} text */
export function setObjective(text) {
  gameState.objective = text;
}

/** @param {string} key @param {number} [n] */
export function addItem(key, n = 1) {
  gameState.items[key] = (gameState.items[key] || 0) + n;
}
/** @param {string} key @param {number} [n] */
export function removeItem(key, n = 1) {
  gameState.items[key] = Math.max(0, (gameState.items[key] || 0) - n);
}
/** @param {string} key */
export function itemCount(key) {
  return gameState.items[key] || 0;
}
/** @param {string} id */
export function collect(id) {
  gameState.collected[id] = true;
}
/** @param {string} id */
export function isCollected(id) {
  return !!gameState.collected[id];
}
