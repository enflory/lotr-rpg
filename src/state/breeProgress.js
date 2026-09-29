// One ordered source for story interactions, objectives and save recovery.
export const BREE_BEATS = [
  {
    key: 'bree_gate',
    flag: 'breeAdmitted',
    zone: 'breegate',
    objective: 'Speak to the keeper at Bree’s western gate',
  },
  {
    key: 'bree_welcome',
    flag: 'ponyWelcomed',
    zone: 'ponycommon',
    objective: 'Find Butterbur at the Prancing Pony',
  },
  {
    key: 'bree_supper',
    flag: 'ponySupper',
    zone: 'ponyparlour',
    objective: 'Join your friends for supper in the private parlour',
  },
  {
    key: 'bree_company',
    flag: 'breeCompany',
    zone: 'ponycommon',
    objective: 'Join the company in the common room',
  },
  {
    key: 'bree_song',
    flag: 'breeRingSlip',
    zone: 'ponycommon',
    objective: 'Join Pippin by the common-room hearth',
  },
  {
    key: 'bree_strider',
    flag: 'striderOffer',
    zone: 'ponyparlour',
    objective: 'Speak privately with Strider in the parlour',
  },
  {
    key: 'bree_letter',
    flag: 'gandalfLetter',
    zone: 'ponyparlour',
    objective: 'Hear what Butterbur has remembered',
  },
  {
    key: 'bree_trust',
    flag: 'striderTrusted',
    zone: 'ponyparlour',
    objective: 'Ask Strider about Gandalf’s letter',
  },
  {
    key: 'bree_merry',
    flag: 'breeMerryReturned',
    zone: 'ponyparlour',
    objective: 'Nob is at the door with Merry',
  },
  {
    key: 'bree_decoys',
    flag: 'breeDecoys',
    zone: 'ponyrooms',
    objective: 'Help Nob prepare the hobbit bedrooms',
  },
  {
    key: 'bree_watch',
    flag: 'breeMorning',
    zone: 'ponyparlour',
    objective: 'Return to the parlour and keep watch',
  },
  {
    key: 'bree_damage',
    flag: 'breeDamageSeen',
    zone: 'ponyrooms',
    objective: 'Inspect the bedrooms in the morning light',
  },
  {
    key: 'bree_bill',
    flag: 'billBought',
    zone: 'bree',
    objective: 'Meet Butterbur and the pony by Ferny’s house',
  },
  {
    key: 'bree_depart',
    flag: 'chapter4Complete',
    zone: 'breeroad',
    objective: 'Follow the road out of Bree with Strider',
  },
];

/** @param {Record<string, boolean>} flags */
export function nextBreeBeat(flags) {
  // Saves beyond the accident already completed the inn's earlier evening.
  const completed = (b) =>
    flags[b.flag] || (flags.breeRingSlip && ['ponySupper', 'breeCompany'].includes(b.flag));
  return BREE_BEATS.find((b) => !completed(b)) ?? null;
}

/** @param {Record<string, boolean>} flags @param {string} key */
export const isBreeBeat = (flags, key) => nextBreeBeat(flags)?.key === key;

/** @param {Record<string, boolean>} flags */
export const breeObjective = (flags) =>
  nextBreeBeat(flags)?.objective ?? 'Chapter four complete · the wild road lies ahead';
