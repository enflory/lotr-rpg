// Shared plumbing for scripted beats that sit on top of a dialogue. A chapter
// keeps its own state object (`s.bree`, `s.road`) carrying `active` and an
// optional `releaseTrail`; everything else here is chapter-independent.

export const party = (s) => [s.player, ...s.followers];

/** Take control away from the player and hold every companion in place. */
export function lockParty(s, st) {
  s.player.setVelocity(0);
  s.player.body.enable = false;
  party(s).forEach((p) => p.setData('held', true));
  s.hintIcon.setVisible(false);
  st.active = true;
}

/**
 * Run `run` alongside the current dialogue page. With a `prompt` the page waits
 * for the player to press the action button before it runs, then advances.
 */
export function runBeat(s, st, run, prompt = '') {
  lockParty(s, st);
  const b = { busy: false, prompt, action: null };
  s.storyBeat = b;
  const execute = async () => {
    b.busy = true;
    b.prompt = '';
    await run();
    if (s.storyBeat !== b) return;
    b.busy = false;
    if (prompt) s.advanceDialogue();
  };
  if (prompt) b.action = execute;
  else execute();
}

/** Hand control back and reseed the follow trail from the visible formation. */
export function restoreParty(s, st) {
  s.player.setData('cinematicAlpha', null).setAlpha(1).setAngle(0);
  party(s).forEach((p) => p.setData('held', false));
  s.player.body.reset(s.player.x, s.player.y);
  s.player.body.enable = true;
  s.trail =
    st.releaseTrail ??
    party(s)
      .filter((p) => p.visible)
      .map((p) => ({ x: p.x, y: p.y }));
  st.releaseTrail = null;
  s.cameras.main.startFollow(s.player, true, 0.08, 0.08);
  st.active = false;
}

/** A standing character on the map: feet on the tile, sorted by depth, facing `dir`. */
export function placeActor(s, key, x, y, dir = 'down', scale = 1) {
  const p = s.add
    .sprite(x * 16 + 8, y * 16, key)
    .setData('key', key)
    .setDepth(y * 16)
    .setScale(scale);
  p.play(`${key}-idle-${dir}`);
  return p;
}
