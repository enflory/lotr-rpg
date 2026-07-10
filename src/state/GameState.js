// Global story/session state. Persists across zone changes (module
// singleton); reset only on full page reload.

export const gameState = {
  flags: {},        // story event flags, e.g. metGandalf, samJoined
  follower: null,   // character key trailing the player (e.g. 'sam')
  objective: 'Speak with Gandalf outside Bag End',
};

export function setFlag(name) { gameState.flags[name] = true; }
export function hasFlag(name) { return !!gameState.flags[name]; }

export function setObjective(text) { gameState.objective = text; }
