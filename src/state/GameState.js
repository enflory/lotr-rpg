// Global story/session state. Persists across zone changes (module
// singleton); reset only on full page reload.

export const gameState = {
  /** @type {Record<string, boolean>} story event flags, e.g. metGandalf, samJoined */
  flags: {},
  /** @type {string|null} character key trailing the player (e.g. 'sam') */
  follower: null,
  objective: 'Speak with Gandalf outside Bag End',
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
