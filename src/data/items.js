// Item registry — collectibles and errand goods. Icon draw order in
// src/art/items.js must match ITEM_KEYS.

/** @type {Record<string, { name: string, desc: string }>} */
export const ITEMS = {
  mushroom: { name: 'Mushroom', desc: 'A fat field mushroom. A hobbit delicacy.' },
  mathom: { name: 'Mathom', desc: "One of Bilbo's old curios, of no use and every value." },
  silver_spoons: { name: 'Silver Spoons', desc: "Bilbo's labelled parting gift for Lobelia." },
  ale_mug: { name: 'Half-pint', desc: 'A foaming mug from the Green Dragon, for the Gaffer.' },
  firework_crate: { name: 'Firework Crate', desc: "Gandalf's — SQUIBS, handle with care." },
  elven_provisions: { name: 'Elven Provisions', desc: "Bread and fruit left by Gildor's folk." },
  maggot_basket: { name: "Mrs. Maggot's Basket", desc: 'Mushrooms, packed in straw.' },
};

export const ITEM_KEYS = Object.keys(ITEMS);
