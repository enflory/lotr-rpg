// Chapter 5, "The Long Road": one ordered source for story cues, objectives and
// save recovery, like breeProgress.js. Book I, chapters 11 and 12.
export const LONG_ROAD_BEATS = [
  {
    key: 'road_marsh',
    flag: 'marshEntered',
    zone: 'midgewater',
    objective: 'Follow Strider off the Road and into the marshes',
  },
  {
    key: 'road_midges',
    flag: 'midgesEndured',
    zone: 'midgewater',
    objective: 'Find a dry bank to rest on in Midgewater',
  },
  {
    key: 'road_hill',
    flag: 'hillSighted',
    zone: 'weathertop',
    objective: 'Climb the slopes of Weathertop with Strider',
  },
  {
    key: 'road_rune',
    flag: 'runeRead',
    zone: 'weathertop',
    objective: 'Climb to the ruined ring on the summit',
  },
  {
    key: 'road_fire',
    flag: 'fireTale',
    zone: 'weathertop',
    objective: 'Return to the dell and light a fire',
  },
  {
    key: 'road_attack',
    flag: 'wraithsCame',
    zone: 'weathertop',
    objective: 'Sit by the fire and wait out the dark',
  },
  {
    key: 'road_wound',
    flag: 'frodoWounded',
    zone: 'weathertop',
    objective: 'Go to Frodo’s side',
  },
  {
    key: 'road_athelas',
    flag: 'athelasFound',
    zone: 'trollshaws',
    objective: 'Look for kingsfoil by the roadside',
  },
  {
    key: 'road_trolls',
    flag: 'trollsSeen',
    zone: 'trollshaws',
    objective: 'Cross the Last Bridge and find the troll glade',
  },
  {
    key: 'road_glorfindel',
    flag: 'glorfindelMet',
    zone: 'trollshaws',
    objective: 'Follow the Road east. Hoofbeats are coming',
  },
  {
    key: 'road_ford',
    flag: 'chapter5Complete',
    zone: 'bruinen',
    objective: 'Ride for the Ford with Glorfindel',
  },
];

/** @param {Record<string, boolean>} flags */
export const nextRoadBeat = (flags) => LONG_ROAD_BEATS.find((b) => !flags[b.flag]) ?? null;

/** @param {Record<string, boolean>} flags @param {string} key */
export const isRoadBeat = (flags, key) =>
  !!flags.chapter4Complete && nextRoadBeat(flags)?.key === key;

/** @param {Record<string, boolean>} flags */
export const roadObjective = (flags) =>
  nextRoadBeat(flags)?.objective ?? 'Chapter five complete · the Nine wait at the Ford of Bruinen';
