// Shared JSDoc typedefs for the data layer. No runtime code — these
// exist so `npm run typecheck` (tsc over checkJs) can validate the
// informal contracts between zones, dialogues, and the world scene.

/**
 * @typedef {Object} Spawn
 * @property {number} x tile column
 * @property {number} y tile row
 * @property {'up'|'down'|'left'|'right'} dir facing on arrival
 */

/**
 * @typedef {Object} NpcDef
 * @property {string} key character key — must exist in CHAR_DEFS and DIALOGUES
 * @property {number} x tile column
 * @property {number} y tile row
 * @property {'up'|'down'|'left'|'right'} dir initial facing
 * @property {(flags: Record<string, boolean>) => boolean} [when] spawn condition
 */

/**
 * @typedef {Object} DoorDef
 * @property {number} x
 * @property {number} y
 * @property {string} zone target zone key
 * @property {string} entry spawn name in the target zone
 */

/**
 * @typedef {Object} SignDef
 * @property {number} x
 * @property {number} y
 * @property {string} dialogue key in DIALOGUES
 */

/**
 * @typedef {Object} ExitDef
 * @property {number} x
 * @property {number} y
 * @property {string} zone target zone key
 * @property {string} entry spawn name in the target zone
 * @property {string} [requires] flag that must be set to leave
 * @property {string} [denied] message shown when the flag is missing
 */

/**
 * @typedef {Object} Zone
 * @property {string} key registry key
 * @property {string} label shown as the zone title card
 * @property {string} music song id in src/audio/sound.js
 * @property {number[][]} map tile indices, row-major
 * @property {Record<string, Spawn>} spawns
 * @property {NpcDef[]} npcs
 * @property {DoorDef[]} doors
 * @property {SignDef[]} signs
 * @property {ExitDef[]} exits
 * @property {(scene: any, delta: number) => void} [onUpdate] per-frame scripting
 */

/**
 * @typedef {Object} DialogueStage
 * @property {string[]} lines
 * @property {(flags: Record<string, boolean>) => boolean} [when] first matching stage wins
 * @property {string|string[]} [set] flag(s) set when the dialogue closes
 * @property {string} [objective] new objective banner text
 * @property {string} [join] character key that becomes the follower
 */

/**
 * @typedef {Object} Dialogue
 * @property {string} name speaker name
 * @property {string[]} [lines] static form
 * @property {DialogueStage[]} [stages] staged form
 */

export {};
