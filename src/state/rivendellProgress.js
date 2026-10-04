// Chapter 6, "Rivendell": one ordered source for story cues, objectives, the
// valley's weather and who stands where, like longRoadProgress.js. Fellowship
// Book I ch. 12 (the flood) and Book II ch. 1–3.
export const RIVENDELL_BEATS = [
  {
    key: 'rv_flood',
    flag: 'fordFlooded',
    zone: 'bruinen',
    objective: 'Turn and face the Nine at the Ford',
  },
  {
    key: 'rv_wake',
    flag: 'rivendellWoke',
    zone: 'rivendellroom',
    objective: 'Wake in the house of Elrond',
  },
  {
    key: 'rv_feast',
    flag: 'feastHeld',
    zone: 'rivendellhall',
    objective: 'Join the feast in the Hall of Dinner',
  },
  {
    key: 'rv_song',
    flag: 'hallOfFire',
    zone: 'rivendellhall',
    objective: 'Sit with Bilbo by the fire in the Hall of Fire',
  },
  {
    key: 'rv_council1',
    flag: 'councilOpened',
    zone: 'rivendell',
    objective: 'Go to the porch above the river for the Council of Elrond',
  },
  {
    key: 'rv_council2',
    flag: 'councilTales',
    zone: 'rivendell',
    objective: 'Hear the Council out',
  },
  {
    key: 'rv_council3',
    flag: 'ringBearerChosen',
    zone: 'rivendell',
    objective: 'Hear the Council out. Someone must carry the Ring',
  },
  {
    key: 'rv_weeks',
    flag: 'weeksPassed',
    zone: 'rivendell',
    objective: 'Rest in Rivendell while the scouts are abroad',
  },
  {
    key: 'rv_gifts',
    flag: 'giftsGiven',
    zone: 'rivendellroom',
    objective: 'Visit Bilbo in his room',
  },
  {
    key: 'rv_company',
    flag: 'chapter6Complete',
    zone: 'rivendell',
    objective: 'Go to the southern gate. The Company is gathering',
  },
];

export const DONE = 'Chapter six complete · the Company of nine stands at the gate of Rivendell';

/** @param {Record<string, boolean>} flags */
export const nextRvBeat = (flags) => RIVENDELL_BEATS.find((b) => !flags[b.flag]) ?? null;

/** The chapter opens when the Ford ride is over, and not before. */
export const isRvBeat = (flags, key) => !!flags.chapter5Complete && nextRvBeat(flags)?.key === key;

/** @param {Record<string, boolean>} flags */
export const rvObjective = (flags) => nextRvBeat(flags)?.objective ?? DONE;

/** The Council guests sit on the porch from the first dawn until Frodo has spoken. */
export const councilNow = (f) => !!f.hallOfFire && !f.ringBearerChosen;

/** The year turns once the weeks have passed. */
export const winterNow = (f) => !!f.weeksPassed;

/**
 * The colour wash laid over the open valley. Interiors and the Ford carry none.
 * @param {Record<string, boolean>} f
 * @param {string} zoneKey
 * @returns {{ color: number, alpha: number } | null}
 */
export function skyFor(f, zoneKey) {
  if (zoneKey !== 'rivendell' || !f.chapter5Complete) return null;
  if (f.giftsGiven) return { color: 0x141c40, alpha: 0.4 }; // the Company's last dusk
  if (f.weeksPassed) return { color: 0xcfd8ec, alpha: 0.16 }; // winter silver
  if (f.ringBearerChosen) return { color: 0xffe8b0, alpha: 0.06 }; // the Council day, afternoon
  if (f.hallOfFire) return { color: 0xffd890, alpha: 0.1 }; // the Council dawn
  return { color: 0x30204a, alpha: 0.2 }; // the evening of the feast
}
