// Where Rivendell's choreography puts people. Kept as data so a unit test can
// prove every mark is open ground, and scenes and scenery agree.
export const AT = {
  // The Ford: Frodo on the eastern bank, the Nine on the western.
  frodoStands: { zone: 'bruinen', x: 36, y: 11 },
  // Frodo's chamber and the passage
  bed: { zone: 'rivendellroom', x: 4, y: 6 },
  gandalfChair: { zone: 'rivendellroom', x: 6, y: 6 },
  samDoor: { zone: 'rivendellroom', x: 11, y: 7 },
  samBedside: { zone: 'rivendellroom', x: 5, y: 7 },
  // Bilbo's room
  bilboSeat: { zone: 'rivendellroom', x: 19, y: 6 },
  giftSpot: { zone: 'rivendellroom', x: 19, y: 7 },
  // The hall: the high table and the hearth
  tableCue: { zone: 'rivendellhall', x: 15, y: 8 },
  hearthCue: { zone: 'rivendellhall', x: 4, y: 14 },
  // The porch above the river, and the garden
  councilCue: { zone: 'rivendell', x: 48, y: 21 },
  benchCue: { zone: 'rivendell', x: 36, y: 33 },
  gateCue: { zone: 'rivendell', x: 30, y: 39 },
  roadSouth: { zone: 'rivendell', x: 30, y: 42 },
  walkersFrom: { zone: 'rivendell', x: 30, y: 33 },
  // Merry and Pippin come up the garden path
  hobbitsFrom: { zone: 'rivendell', x: 24, y: 30 },
  hobbitsTo: { zone: 'rivendell', x: 34, y: 33 },
};

/**
 * The Company of the Ring at the gate, as the book names them. Frodo is the
 * player and stands on the `gate` spawn; everyone else is on a mark here.
 * `npc` entries are ordinary zone NPCs; `actor` entries are scripted sprites.
 */
export const WALKERS = [
  { key: 'merry', kind: 'actor', x: 29, y: 40, dir: 'down' },
  { key: 'pippin', kind: 'actor', x: 31, y: 40, dir: 'down' },
  { key: 'sam', kind: 'actor', x: 30, y: 41, dir: 'down' },
  { key: 'gandalfrv', kind: 'npc', x: 29, y: 39, dir: 'down' },
  { key: 'dunadan', kind: 'npc', x: 31, y: 39, dir: 'down' },
  { key: 'legolas', kind: 'npc', x: 27, y: 40, dir: 'down' },
  { key: 'gimli', kind: 'npc', x: 28, y: 40, dir: 'down' },
  { key: 'boromir', kind: 'npc', x: 32, y: 40, dir: 'down' },
];

/** Those who stay behind to see the Company off. */
export const FAREWELL = [
  { key: 'elrond', x: 30, y: 37, dir: 'down' },
  { key: 'bilboelder', x: 28, y: 37, dir: 'down' },
  { key: 'arwen', x: 32, y: 37, dir: 'down' },
  { key: 'gloin', x: 26, y: 38, dir: 'right' },
  { key: 'lindir', x: 34, y: 38, dir: 'left' },
];

/** The porch, from the first dawn until Frodo has spoken. */
export const COUNCIL_SEATS = [
  { key: 'elrond', x: 48, y: 18, dir: 'down' },
  { key: 'gandalfrv', x: 45, y: 19, dir: 'right' },
  { key: 'dunadan', x: 51, y: 19, dir: 'left' },
  { key: 'boromir', x: 51, y: 22, dir: 'left' },
  { key: 'gloin', x: 45, y: 23, dir: 'right' },
  { key: 'gimli', x: 46, y: 24, dir: 'right' },
  { key: 'legolas', x: 48, y: 24, dir: 'up' },
  { key: 'erestor', x: 46, y: 17, dir: 'down' },
  { key: 'galdor', x: 50, y: 17, dir: 'down' },
  { key: 'bilboelder', x: 51, y: 24, dir: 'left' },
];
