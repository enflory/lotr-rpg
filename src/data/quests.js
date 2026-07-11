// Errand registry — a read-only view over story flags and item counts.
// Nothing here gates the main story.

/** @type {import('./types.js').QuestDef[]} */
export const QUESTS = [
  {
    key: 'crates',
    title: "Gandalf's fireworks",
    hint: 'Fetch the three misplaced crates around the Party Field.',
    active: (f) => !!f.cratesAsked && !f.prologueDone,
    done: (f, count) => count('firework_crate') >= 3,
  },
  {
    key: 'spoons',
    title: "Lobelia's spoons",
    hint: 'Bilbo left Lobelia a labelled gift. Find it in Bag End.',
    active: (f) => !!f.prologueDone && !!f.metGandalf,
    done: (f) => !!f.gaveSpoons,
  },
  {
    key: 'halfpint',
    title: "The Gaffer's half-pint",
    hint: 'Run the mug from the Green Dragon down to Bagshot Row.',
    active: (f) => !!f.halfPintTaken,
    done: (f) => !!f.halfPintDelivered,
  },
  {
    key: 'dogs',
    title: "Maggot's dogs",
    hint: 'Grip, Fang and Wolf are hiding in the marsh. Send them home.',
    active: (f) => !!f.dogsAsked,
    done: (f) => !!f.gotBasket,
  },
];
