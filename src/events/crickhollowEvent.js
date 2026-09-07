import { gameState, setFlag, setObjective } from '../state/GameState.js';
import { drawCrickhollow } from '../art/crickhollowScenery.js';
import { tween, move, walk } from './storyMotion.js';

const actor = (s, key, x, y) =>
  s.add
    .sprite(x * 16 + 8, y * 16, key, 1)
    .setData('key', key)
    .setDepth(y * 16);
const speakerNames = [
  'At the Supper Table',
  'Pippin',
  'Merry',
  'Frodo',
  'Merry',
  'Sam',
  'Fredegar',
  'Merry',
  'Frodo',
];
const pause = (s, ms) => new Promise((resolve) => s.time.delayedCall(ms, resolve));
function freeze(s) {
  s.player.setVelocity(0);
  // Give the cutscene ownership of opacity as well as movement.
  s.player.setData('held', true);
  s.hintIcon.setVisible(false);
  s.player.body.enable = false;
  for (const p of s.followers) p.setData('held', true);
  s.storyBeat = { busy: true };
}
function unfreeze(s) {
  s.player.body.reset(s.player.x, s.player.y);
  s.player.body.enable = true;
  s.player.setData('held', false);
  for (const p of s.followers) p.setData('held', false);
  s.storyBeat = null;
  s.trail = [s.player, ...s.followers].map((p) => ({ x: p.x, y: p.y }));
  s.cameras.main.startFollow(s.player, true, 0.08, 0.08);
}
function group(s) {
  const h = s.journey.home;
  return [
    s.player,
    s.followers.find((p) => p.getData('key') === 'sam'),
    s.followers.find((p) => p.getData('key') === 'pippin'),
    h.merry,
    h.fatty,
  ];
}
async function sleepAndRise(s) {
  const h = s.journey.home;
  if (h.nightPlaying) return;
  h.nightPlaying = true;
  freeze(s);
  s.showBanner('The dishes are cleared.\nAt last, the house grows quiet.');
  s.cameras.main.pan(14 * 16, 15 * 16, 900, 'Sine.easeInOut');
  const party = group(s);
  party.forEach((p) => p.setCrop());
  await Promise.all(party.map((p, i) => walk(s, p, 6 + i * 3, 15, 65)));
  s.cameras.main.fadeOut(900, 10, 15, 24);
  await pause(s, 1300);
  s.showBanner('Before dawn\nat Crickhollow');
  h.shade.setAlpha(0);
  s.cameras.main.fadeIn(1100, 10, 15, 24);
  await pause(s, 1250);
  // Leave in a visible procession. The map boundary is the actual door.
  await Promise.all(
    party.slice(0, 4).map(async (p, i) => {
      await pause(s, i * 350);
      await walk(s, p, 20, 18, 75);
      await walk(s, p, 20, 21, 75);
      await tween(s, p, { alpha: 0 }, 200);
    }),
  );
  await walk(s, h.fatty, 20, 18, 65);
  setFlag('crickhollowMorning');
  setFlag('merryJoined');
  s.storyBeat = null;
  s.goToZone('crickhollow', 'morning');
}
async function gatherOutside(s) {
  const h = s.journey.home;
  freeze(s);
  s.cameras.main.stopFollow();
  s.cameras.main.pan(17 * 16, 14 * 16, 700, 'Sine.easeInOut');
  const party = [s.player, ...s.followers, h.fatty];
  h.fatty.body.enable = false;
  // Establish the doorway before the initial fade-in, then walk out one by one.
  party.forEach((p) => p.setPosition(13 * 16 + 8, 10 * 16).setAlpha(0));
  await Promise.all(
    party.map(async (p, i) => {
      await pause(s, 300 + i * 420);
      await tween(s, p, { alpha: 1 }, 180);
      if (p === h.fatty) await walk(s, p, 17, 14, 65);
      else {
        await walk(s, p, 13, 15, 75);
        await move(s, p, { x: 13 * 16 + 8 - 18 * i, y: 15 * 16 }, 75);
      }
    }),
  );
  setFlag('crickhollowReady');
  h.fatty.body.updateFromGameObject();
  h.fatty.body.enable = true;
  unfreeze(s);
  setObjective('Speak with Merry, then take the east path to the hedge tunnel');
  s.showBanner('Dew on the grass.\nThe Old Forest waits beyond the hedge.');
  s.checkpoint('morning');
}
export function createCrickhollow(s) {
  const f = gameState.flags;
  s.journey.home = drawCrickhollow(s, !!(f.crickhollowMorning || f.chapter2));
  const h = s.journey.home;
  if (s.zoneKey === 'crickhollowhouse') {
    h.merry = s.followers.find((p) => p.getData('key') === 'merry') || actor(s, 'merry', 10, 8);
    h.fatty = actor(s, 'fatty', 13, 8);
    if (!f.crickhollowSupper && !f.chapter2) {
      setObjective('Join your friends at the supper table');
      s.showBanner('Hot water, lamplight,\nand supper with friends.');
    }
  } else {
    h.fatty = s.npcs.find((p) => p.getData('key') === 'fatty');
    if (!f.crickhollowMorning && !f.chapter2) {
      h.merry = actor(s, 'merry', 14, 13);
      setObjective('Enter the cottage for supper with your friends');
      s.showBanner('Evening at Crickhollow.\nA light waits in the round window.');
    }
    if (f.crickhollowMorning && !f.crickhollowReady && !f.chapter2) gatherOutside(s);
  }
}
export function updateCrickhollow(s) {
  const f = gameState.flags;
  if (s.zoneKey === 'crickhollowhouse' && f.crickhollowSupper && !f.chapter2) {
    if (f.crickhollowMorning) {
      if (!f.crickhollowReady) s.goToZone('crickhollow', 'morning');
    } else sleepAndRise(s);
  }
}
export function crickhollowDialogue(s) {
  if (
    s.dialogKey !== 'crickhollow_supper' ||
    gameState.flags.crickhollowSupper ||
    gameState.flags.chapter2
  )
    return;
  const party = group(s),
    page = s.dialogIndex;
  s.dialogNameText.setText(speakerNames[page]);
  freeze(s);
  if (page === 0) {
    s.cameras.main.stopFollow();
    s.cameras.main.pan(13 * 16, 10 * 16, 800, 'Sine.easeInOut');
    const seats = [
      [11, 12, 'up'],
      [16, 10, 'left'],
      [14, 12, 'up'],
      [10, 8, 'down'],
      [13, 8, 'down'],
    ];
    Promise.all(
      party.map(async (p, i) => {
        await walk(s, p, seats[i][0], seats[i][1], 70);
        p.play(`${p.getData('key') || 'frodo'}-idle-${seats[i][2]}`);
        await tween(s, p, { y: p.y + (i === 0 || i === 2 ? -8 : i > 2 ? 4 : 0) }, 250);
        p.setCrop(0, 0, 16, 19);
      }),
    ).then(() => {
      s.storyBeat.busy = false;
    });
  } else {
    const index = { Pippin: 2, Merry: 3, Frodo: 0, Sam: 1, Fredegar: 4 }[speakerNames[page]];
    tween(s, party[index], { y: party[index].y - 2, yoyo: true }, 200).then(() => {
      s.storyBeat.busy = false;
    });
  }
}
