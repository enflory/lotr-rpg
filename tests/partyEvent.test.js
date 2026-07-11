// The Long-expected Party prologue state machine (party → vanish →
// timeskip → done), driven through a fake Phaser scene.

import { describe, it, expect, beforeEach } from 'vitest';
import { partyEventUpdate, partyZoneCreate } from '../src/events/partyEvent.js';
import { gameState } from '../src/state/GameState.js';

function makeScene() {
  return {
    partyEvent: null,
    inputLocked: false,
    banners: [],
    showBanner(text) {
      this.banners.push(text);
    },
    removed: [],
    removeNpc(key) {
      this.removed.push(key);
    },
    circles: [],
    add: {
      circle: (x, y, r, color) => {
        const c = {
          x,
          y,
          r,
          color,
          destroyed: false,
          setDepth() {
            return c;
          },
          destroy() {
            c.destroyed = true;
          },
        };
        return c;
      },
    },
    tweens: {
      count: 0,
      add(cfg) {
        this.count++;
        if (cfg.onComplete) cfg.onComplete();
      },
    },
    cameras: {
      main: {
        flashes: [],
        flash(...args) {
          this.flashes.push(args);
        },
        fadedOut: false,
        fadeOut() {
          this.fadedOut = true;
        },
        once(event, cb) {
          cb(); // fire fade completion immediately
        },
      },
    },
    scene: {
      restarted: null,
      restart(data) {
        this.restarted = data;
      },
    },
    time: {
      delayed: [],
      delayedCall(ms, cb) {
        this.delayed.push(ms);
        cb();
      },
    },
  };
}

beforeEach(() => {
  gameState.flags = {};
  gameState.objective = '';
});

describe('partyEventUpdate', () => {
  it('is inert once the prologue is done', () => {
    gameState.flags.prologueDone = true;
    const scene = makeScene();
    partyEventUpdate(scene, 5000);
    expect(scene.partyEvent).toBeNull();
    expect(scene.tweens.count).toBe(0);
  });

  it('launches fireworks on a timer during the party', () => {
    const scene = makeScene();
    partyEventUpdate(scene, 1000); // burns the initial 900ms fuse
    expect(scene.tweens.count).toBeGreaterThan(0); // flash + sparks tweened
    expect(scene.partyEvent.phase).toBe('party');
    expect(scene.inputLocked).toBe(false);
  });

  it('locks input and vanishes Bilbo after the farewell', () => {
    const scene = makeScene();
    partyEventUpdate(scene, 16);
    gameState.flags.bilboFarewell = true;

    partyEventUpdate(scene, 16); // party → vanish (pause running)
    expect(scene.partyEvent.phase).toBe('vanish');
    expect(scene.inputLocked).toBe(true);
    expect(scene.removed).toEqual([]);

    partyEventUpdate(scene, 800); // pause elapses → flash, Bilbo gone
    expect(scene.cameras.main.flashes.length).toBe(1);
    expect(scene.removed).toEqual(['bilbo']);
    expect(scene.partyEvent.phase).toBe('timeskip');
  });

  it('time-skips into the main opening at the default spawn', () => {
    const scene = makeScene();
    gameState.flags.bilboFarewell = true;
    partyEventUpdate(scene, 16); // arm
    partyEventUpdate(scene, 16); // → vanish
    partyEventUpdate(scene, 800); // → timeskip
    partyEventUpdate(scene, 2500); // → done

    expect(gameState.flags.prologueDone).toBe(true);
    expect(gameState.objective).toMatch(/Gandalf/);
    expect(scene.cameras.main.fadedOut).toBe(true);
    expect(scene.scene.restarted).toEqual({ zone: 'shire', entry: 'default' });
    expect(scene.partyEvent.phase).toBe('done');
  });
});

describe('partyZoneCreate', () => {
  it('shows the years-pass card exactly once, after the prologue', () => {
    const scene = makeScene();
    partyZoneCreate(scene); // prologue not done yet — nothing
    expect(scene.banners).toEqual([]);

    gameState.flags.prologueDone = true;
    partyZoneCreate(scene);
    expect(scene.banners.join(' ')).toMatch(/years pass/i);

    partyZoneCreate(scene); // timeskipShown now set — no repeat
    expect(scene.banners.length).toBe(1);
  });
});
