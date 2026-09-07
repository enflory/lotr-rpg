// On-screen touch controls for mobile browsers.
//
// The controls live in the DOM rather than the canvas: with Phaser's FIT
// scaling a 4:3 canvas on a portrait phone leaves wide letterbox bands
// above and below, and DOM elements can sit in that dead space instead of
// covering the game view. In landscape they float over the canvas corners
// at reduced opacity.
//
// Scenes read `touchDirection()` alongside the cursor keys and subscribe to
// button presses with `onTouchButton()`; nothing here synthesises keyboard
// events.

/** Movement axes driven by the virtual pad. Mutated in place; read every frame. */
const direction = { up: false, down: false, left: false, right: false };

/** @type {Set<(button: string) => void>} */
const buttonListeners = new Set();

/** Distance (px) the thumb must travel from the pad centre before it moves you. */
export const PAD_DEADZONE = 10;

let root = null;
let knob = null;
let initialized = false; // initTouchControls has run
let enabled = false; // the device asked for touch controls
let requested = true; // the active scene wants them on screen

/**
 * Quantise a thumb offset into the four movement axes. A pull that is
 * meaningfully diagonal (the smaller axis at least ~40% of the larger) sets
 * both axes, which reproduces holding two arrow keys.
 *
 * @param {number} dx offset from pad centre, right-positive
 * @param {number} dy offset from pad centre, down-positive
 * @param {number} [deadzone]
 * @returns {{up: boolean, down: boolean, left: boolean, right: boolean}}
 */
export function directionFromDelta(dx, dy, deadzone = PAD_DEADZONE) {
  const out = { up: false, down: false, left: false, right: false };
  if (Math.hypot(dx, dy) < deadzone) return out;
  const ax = Math.abs(dx);
  const ay = Math.abs(dy);
  if (ax >= ay * 0.4) {
    if (dx > 0) out.right = true;
    else out.left = true;
  }
  if (ay >= ax * 0.4) {
    if (dy > 0) out.down = true;
    else out.up = true;
  }
  return out;
}

/** @returns {{up: boolean, down: boolean, left: boolean, right: boolean}} live pad state */
export function touchDirection() {
  return direction;
}

/**
 * Subscribe to virtual button presses ('action', 'inventory', 'objective', 'mute').
 * @param {(button: string) => void} fn
 * @returns {() => void} unsubscribe
 */
export function onTouchButton(fn) {
  buttonListeners.add(fn);
  return () => buttonListeners.delete(fn);
}

function emit(button) {
  for (const fn of [...buttonListeners]) fn(button);
}

function clearDirection() {
  direction.up = direction.down = direction.left = direction.right = false;
}

/** True once the device has opted into touch controls — scenes reword key hints. */
export function touchControlsActive() {
  return enabled;
}

/** @param {boolean} on show/hide the overlay (the title screen hides it) */
export function setTouchControlsVisible(on) {
  requested = on;
  if (!on) clearDirection();
  const showing = enabled && requested;
  if (root) root.style.display = showing ? 'block' : 'none';
  // The page uses this class to top-align the canvas so the pad gets the
  // lower letterbox band; menus (no controls) stay centred.
  globalThis.document?.body?.classList.toggle('has-touch-controls', showing);
}

/**
 * Does this browser want touch controls? Coarse pointers (phones, tablets)
 * get them up front; hybrids that report a mouse get them on first touch.
 * @param {Window} [win]
 */
export function prefersTouchControls(win = window) {
  return !!win.matchMedia?.('(pointer: coarse)')?.matches;
}

/**
 * @param {string} glyph the letter drawn on the button
 * @param {string} name accessible name, also the event scenes subscribe to
 */
function button(glyph, name, className) {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = className;
  el.textContent = glyph;
  el.setAttribute('aria-label', name);
  el.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    el.classList.add('is-pressed');
    emit(name.toLowerCase());
  });
  const release = () => el.classList.remove('is-pressed');
  el.addEventListener('pointerup', release);
  el.addEventListener('pointercancel', release);
  el.addEventListener('pointerleave', release);
  // Never let a tap fall through to the canvas or scroll/zoom the page.
  el.addEventListener('contextmenu', (e) => e.preventDefault());
  return el;
}

function buildDom() {
  root = document.createElement('div');
  root.id = 'touch-controls';
  root.style.display = 'none';

  const pad = document.createElement('div');
  pad.id = 'touch-pad';
  pad.setAttribute('aria-label', 'Move');
  knob = document.createElement('div');
  knob.id = 'touch-knob';
  pad.appendChild(knob);

  let padPointer = null;
  const track = (e) => {
    const rect = pad.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    Object.assign(direction, directionFromDelta(dx, dy));
    const max = rect.width / 2 - 14;
    const len = Math.hypot(dx, dy) || 1;
    const clamp = Math.min(1, max / len);
    knob.style.transform = `translate(${dx * clamp}px, ${dy * clamp}px)`;
  };
  pad.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    padPointer = e.pointerId;
    pad.setPointerCapture(e.pointerId);
    track(e);
  });
  pad.addEventListener('pointermove', (e) => {
    if (e.pointerId === padPointer) track(e);
  });
  const endPad = (e) => {
    if (e.pointerId !== padPointer) return;
    padPointer = null;
    clearDirection();
    knob.style.transform = 'translate(0px, 0px)';
  };
  pad.addEventListener('pointerup', endPad);
  pad.addEventListener('pointercancel', endPad);
  pad.addEventListener('contextmenu', (e) => e.preventDefault());

  const actions = document.createElement('div');
  actions.id = 'touch-actions';
  actions.appendChild(button('A', 'Action', 'touch-btn touch-btn-action'));

  const menus = document.createElement('div');
  menus.id = 'touch-menus';
  menus.appendChild(button('I', 'Inventory', 'touch-btn touch-btn-small'));
  menus.appendChild(button('Q', 'Objective', 'touch-btn touch-btn-small'));
  menus.appendChild(button('M', 'Mute', 'touch-btn touch-btn-small'));

  root.append(pad, actions, menus);
  document.body.appendChild(root);
  // A backgrounded tab can swallow the pointerup, which would leave the
  // player walking into a wall on return.
  window.addEventListener('blur', clearDirection);
}

/**
 * Build the touch overlay if the device wants it. On pointer-capable
 * devices that also report a mouse, the first real touch turns it on.
 * Idempotent.
 */
export function initTouchControls() {
  if (initialized) return;
  initialized = true;
  const enable = () => {
    if (enabled) return;
    enabled = true;
    if (!root) buildDom();
    setTouchControlsVisible(requested);
  };
  if (prefersTouchControls()) enable();
  else window.addEventListener('touchstart', enable, { once: true, passive: true });
}

/** Test hook: tear the overlay down and forget every subscriber. */
export function _resetTouchControls() {
  root?.remove();
  globalThis.document?.body?.classList.remove('has-touch-controls');
  root = null;
  knob = null;
  initialized = false;
  enabled = false;
  requested = true;
  clearDirection();
  buttonListeners.clear();
}
