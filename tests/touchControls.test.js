// The touch layer's DOM lives in the browser (exercised by e2e/touch.spec.js);
// these cover the parts that decide *what* the pad and buttons mean.
import { describe, it, expect, beforeEach } from 'vitest';
import {
  directionFromDelta,
  touchDirection,
  onTouchButton,
  prefersTouchControls,
  touchControlsActive,
  setTouchControlsVisible,
  _resetTouchControls,
  PAD_DEADZONE,
} from '../src/input/touchControls.js';

describe('directionFromDelta', () => {
  it('stays still inside the deadzone', () => {
    expect(directionFromDelta(0, 0)).toEqual({
      up: false,
      down: false,
      left: false,
      right: false,
    });
    expect(directionFromDelta(PAD_DEADZONE - 1, 0).right).toBe(false);
  });

  it('maps the cardinals', () => {
    expect(directionFromDelta(40, 0)).toMatchObject({ right: true, left: false });
    expect(directionFromDelta(-40, 0)).toMatchObject({ left: true, right: false });
    // dy is down-positive, matching client coordinates
    expect(directionFromDelta(0, 40)).toMatchObject({ down: true, up: false });
    expect(directionFromDelta(0, -40)).toMatchObject({ up: true, down: false });
  });

  it('sets both axes on a diagonal pull', () => {
    expect(directionFromDelta(30, 30)).toMatchObject({ right: true, down: true });
    expect(directionFromDelta(-30, -25)).toMatchObject({ left: true, up: true });
  });

  it('keeps a shallow pull on one axis', () => {
    // 30° off the horizontal is still "right", not "right + down"
    const d = directionFromDelta(40, 10);
    expect(d.right).toBe(true);
    expect(d.down).toBe(false);
  });

  it('never sets opposing axes', () => {
    for (const [dx, dy] of [
      [40, 0],
      [-40, 0],
      [0, 40],
      [0, -40],
      [30, 30],
      [-30, 30],
      [12, -12],
    ]) {
      const d = directionFromDelta(dx, dy);
      expect(d.left && d.right).toBe(false);
      expect(d.up && d.down).toBe(false);
    }
  });
});

describe('touch control state', () => {
  beforeEach(() => _resetTouchControls());

  it('reports no movement until a pad is driven', () => {
    expect(touchDirection()).toEqual({ up: false, down: false, left: false, right: false });
  });

  it('is inactive on a device that never asked for it', () => {
    expect(touchControlsActive()).toBe(false);
  });

  it('clears held directions when a scene hides the pad', () => {
    Object.assign(touchDirection(), { right: true, down: true });
    setTouchControlsVisible(false);
    expect(touchDirection()).toEqual({ up: false, down: false, left: false, right: false });
  });

  it('unsubscribes button listeners', () => {
    const seen = [];
    const off = onTouchButton((b) => seen.push(b));
    off();
    // With no DOM there is nothing to click; the contract under test is that
    // off() removes the listener rather than throwing.
    expect(seen).toEqual([]);
  });
});

describe('prefersTouchControls', () => {
  const fakeWin = (matches) => ({
    matchMedia: (q) => ({ matches: q.includes('coarse') && matches }),
  });

  it('is true for a coarse pointer', () => {
    expect(prefersTouchControls(fakeWin(true))).toBe(true);
  });

  it('is false for a mouse', () => {
    expect(prefersTouchControls(fakeWin(false))).toBe(false);
  });

  it('is false where matchMedia is missing', () => {
    expect(prefersTouchControls({})).toBe(false);
  });
});
