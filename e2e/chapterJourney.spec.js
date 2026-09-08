import { test, expect } from '@playwright/test';

async function press(page, key = 'Space') {
  await page.keyboard.down(key);
  await page.waitForTimeout(45);
  await page.keyboard.up(key);
}
async function dialogue(page) {
  for (let n = 0; n < 30; n++) {
    await page.waitForFunction(
      () => !window.__game.scene.getScene('WorldScene').storyBeat?.busy,
      null,
      { timeout: 45000 },
    );
    if (!(await page.evaluate(() => window.__game.scene.getScene('WorldScene').dialogActive)))
      return;
    await press(page);
  }
  throw new Error('Dialogue did not close');
}
async function zone(page, key) {
  await page.waitForFunction(
    (key) => {
      const s = window.__game.scene.getScene('WorldScene');
      return s.zoneKey === key && !s.transitioning;
    },
    key,
    { timeout: 6000 },
  );
}
async function checkpoint(page, zoneKey = 'crickhollow', entry = 'default', flags = {}) {
  await page.goto('/');
  await page.waitForFunction(() => window.__game?.scene.isActive('TitleScene'));
  await page.evaluate(
    ({ zoneKey, entry, flags }) => {
      localStorage.setItem(
        'lotr-rpg.save.v1',
        JSON.stringify({
          version: 1,
          savedAt: Date.now(),
          zone: zoneKey,
          entry,
          flags: {
            prologueDone: true,
            timeskipShown: true,
            metGandalf: true,
            samJoined: true,
            pippinJoined: true,
            rodeWaggon: true,
            merryMet: true,
            crossedFerry: true,
            ...flags,
          },
          follower: 'sam',
          objective: 'Follow Merry east to Crickhollow',
          items: {},
          collected: {},
        }),
      );
    },
    { zoneKey, entry, flags },
  );
  await page.reload();
  await page.waitForFunction(() => window.__game?.scene.isActive('TitleScene'));
  await press(page, 'Enter');
  await zone(page, zoneKey);
}
// BFS chooses walkable tiles only; the actual trip uses held keyboard input and
// Arcade physics. Automatic story triggers are read and closed as encountered.
async function walk(page, x, y) {
  const data = await page.evaluate(
    async ({ x, y }) => {
      const { COLLISION_TILES } = await import('/src/data/tileTypes.js');
      const s = window.__game.scene.getScene('WorldScene'),
        map = s.zone.map;
      const sx = Math.floor(s.player.x / 16),
        sy = Math.floor((s.player.y + 8) / 16);
      const queue = [[sx, sy]],
        prev = new Map([[`${sx},${sy}`, null]]);
      for (let i = 0; i < queue.length; i++) {
        const [cx, cy] = queue[i];
        if (cx === x && cy === y) break;
        for (const [nx, ny] of [
          [cx - 1, cy],
          [cx + 1, cy],
          [cx, cy - 1],
          [cx, cy + 1],
        ]) {
          const k = `${nx},${ny}`;
          if (map[ny]?.[nx] === undefined || COLLISION_TILES.includes(map[ny][nx]) || prev.has(k))
            continue;
          prev.set(k, [cx, cy]);
          queue.push([nx, ny]);
        }
      }
      if (!prev.has(`${x},${y}`)) throw new Error(`No walkable path in ${s.zoneKey} to ${x},${y}`);
      let p = [x, y];
      const path = [];
      while (p) {
        path.unshift(p);
        p = prev.get(p.join(','));
      }
      const stops = [];
      for (let i = 0; i < path.length; i++) {
        if (
          i === 0 ||
          i === path.length - 1 ||
          path[i + 1][0] - path[i][0] !== path[i][0] - path[i - 1][0] ||
          path[i + 1][1] - path[i][1] !== path[i][1] - path[i - 1][1]
        )
          stops.push(path[i]);
      }
      return { stops, zone: s.zoneKey };
    },
    { x, y },
  );
  const outcome = await page.evaluate(
    ({ stops, zone }) =>
      new Promise((resolve, reject) => {
        const codes = { ArrowLeft: 37, ArrowUp: 38, ArrowRight: 39, ArrowDown: 40 };
        let held = null,
          index = 0,
          lastMovement = performance.now(),
          last = null;
        function key(next) {
          if (next === held) return;
          if (held)
            window.dispatchEvent(
              new KeyboardEvent('keyup', {
                key: held,
                code: held,
                keyCode: codes[held],
                which: codes[held],
                bubbles: true,
              }),
            );
          held = next;
          if (held)
            window.dispatchEvent(
              new KeyboardEvent('keydown', {
                key: held,
                code: held,
                keyCode: codes[held],
                which: codes[held],
                bubbles: true,
              }),
            );
        }
        function tick() {
          const s = window.__game.scene.getScene('WorldScene');
          if (s.zoneKey !== zone) {
            key(null);
            resolve('zone');
            return;
          }
          if (s.dialogActive) {
            key(null);
            resolve('dialog');
            return;
          }
          if (index >= stops.length) {
            key(null);
            resolve('done');
            return;
          }
          const [x, y] = stops[index],
            dx = x * 16 + 8 - s.player.x,
            dy = y * 16 - s.player.y;
          if (last && Math.hypot(s.player.x - last.x, s.player.y - last.y) > 0.1)
            lastMovement = performance.now();
          last = { x: s.player.x, y: s.player.y };
          if (performance.now() - lastMovement > 4000) {
            key(null);
            reject(
              new Error(`Blocked in ${zone} at ${s.player.x},${s.player.y}, aiming at ${x},${y}`),
            );
            return;
          }
          // Centre the perpendicular axis before a long straight passage. This
          // prevents clipping a corner merely because the previous frame overshot.
          if (Math.abs(dx) < 2 && Math.abs(dy) < 2) {
            key(null);
            index++;
          } else if (Math.abs(dx) > 2 && Math.abs(dy) > 2) {
            const horizontal = index === 0 || stops[index - 1][1] === y;
            key(
              horizontal ? (dy > 0 ? 'ArrowDown' : 'ArrowUp') : dx > 0 ? 'ArrowRight' : 'ArrowLeft',
            );
          } else if (Math.abs(dx) >= 2) key(dx > 0 ? 'ArrowRight' : 'ArrowLeft');
          else key(dy > 0 ? 'ArrowDown' : 'ArrowUp');
          requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      }),
    data,
  );
  if (outcome === 'dialog') {
    await dialogue(page);
    // A story trigger can move the party to a different zone entirely (the
    // barrow), in which case the original destination no longer exists. The
    // zone key still reads as the old one for the length of the fade, so wait
    // the transition out before asking where we are.
    await page.waitForFunction(
      () => !window.__game.scene.getScene('WorldScene').transitioning,
      null,
      { timeout: 20000 },
    );
    const here = await page.evaluate(() => window.__game.scene.getScene('WorldScene').zoneKey);
    if (here === data.zone) await walk(page, x, y);
  }
}
async function settled(page) {
  await page.waitForFunction(
    () => {
      const s = window.__game.scene.getScene('WorldScene');
      return !s.storyBeat && !s.dialogActive && !s.transitioning;
    },
    null,
    { timeout: 60000 },
  );
}

async function act(page, key) {
  console.log(`Interaction: ${key}`);
  const p = await page.evaluate(
    (key) =>
      window.__game.scene.getScene('WorldScene').zone.interactions.find((p) => p.dialogue === key),
    key,
  );
  expect(p, `interaction ${key}`).toBeTruthy();
  await walk(page, p.x, p.y);
  await press(page);
  await expect
    .poll(() => page.evaluate(() => window.__game.scene.getScene('WorldScene').dialogActive))
    .toBe(true);
  await dialogue(page);
}
async function flag(page, key) {
  await expect.poll(() => page.evaluate((key) => !!window.__state.flags[key], key)).toBe(true);
}
async function reload(page, key) {
  await page.reload();
  await page.waitForFunction(() => window.__game?.scene.isActive('TitleScene'));
  await press(page, 'Enter');
  await zone(page, key);
}

test('the Buckland checkpoint continues naturally into Crickhollow', async ({ page }) => {
  await checkpoint(page, 'marish', 'buckland');
  await walk(page, 55, 15);
  await zone(page, 'crickhollow');
  expect(await page.evaluate(() => window.__state.flags.crossedFerry)).toBe(true);
});

test('walk the forest and the two-night refuge, out onto the downs', async ({ page }) => {
  // Crickhollow's supper and overnight, the forest, the Willow and two nights
  // at Tom's. Every step runs two to three times slower on CI than locally.
  test.setTimeout(900000);
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await checkpoint(page);
  await act(page, 'crickhollow_departure');
  await walk(page, 13, 10);
  await press(page);
  await zone(page, 'crickhollowhouse');
  await act(page, 'crickhollow_supper');
  await page.waitForFunction(() => window.__state.flags.crickhollowReady, null, { timeout: 35000 });
  await zone(page, 'crickhollow');
  await act(page, 'crickhollow_departure');
  await flag(page, 'merryJoined');
  expect(
    await page.evaluate(() =>
      window.__game.scene.getScene('WorldScene').followers.map((p) => p.getData('key')),
    ),
  ).toEqual(['sam', 'pippin', 'merry']);
  await walk(page, 39, 20);
  await zone(page, 'hedgetunnel');
  await act(page, 'hedge_gate');
  await walk(page, 35, 9);
  await zone(page, 'forestgate');
  await act(page, 'forest_glade');
  await act(page, 'forest_oaks');
  await walk(page, 63, 21);
  await zone(page, 'forestheart');
  await act(page, 'forest_hill');
  await act(page, 'forest_north');
  await act(page, 'forest_hollow');
  await walk(page, 71, 43);
  await zone(page, 'withywindle');
  await walk(page, 44, 22);
  await dialogue(page);
  await flag(page, 'willowTrapped');
  expect(
    await page.evaluate(() =>
      window.__game.scene
        .getScene('WorldScene')
        .followers.filter((p) => p.visible && !p.getData('held'))
        .map((p) => p.getData('key')),
    ),
  ).toEqual(['sam']);
  await reload(page, 'withywindle');
  await act(page, 'willow_trunk');
  await flag(page, 'willowFireFailed');
  await act(page, 'willow_help');
  await flag(page, 'tomArrived');
  await act(page, 'willow_tom');
  await flag(page, 'willowFreed');
  expect(
    await page.evaluate(
      () => window.__game.scene.getScene('WorldScene').followers.filter((p) => p.visible).length,
    ),
  ).toBe(3);
  await walk(page, 79, 16);
  await zone(page, 'tomclearing');
  await walk(page, 28, 13);
  await press(page);
  await zone(page, 'tomhouse');
  expect(await page.evaluate(() => !!window.__state.flags.learnedSong)).toBe(false);
  await act(page, 'house_welcome');
  await act(page, 'house_supper');
  await act(page, 'house_bed');
  await flag(page, 'houseNightOne');
  await reload(page, 'tomhouse');
  await act(page, 'house_stories');
  await act(page, 'house_ring');
  await act(page, 'house_bed');
  await flag(page, 'houseRested');
  await act(page, 'house_farewell');
  await flag(page, 'learnedSong');
  expect(
    await page.evaluate(() =>
      window.__game.scene.getScene('WorldScene').journey.markers.some((m) => m.dot.visible),
    ),
  ).toBe(false);
  expect(await page.evaluate(() => window.__state.items.tom_song)).toBe(1);
  await walk(page, 18, 21);
  await zone(page, 'tomclearing');
  // The way onto the downs opens only once Tom has given them the verse.
  await walk(page, 43, 16);
  await zone(page, 'downs');
  expect(errors).toEqual([]);
});

// The second half of the same route. It starts from a checkpoint rather than
// walking the first half again: one test doing both overruns the per-test
// budget on CI, where every step is two to three times slower than locally.
test('cross the downs and the barrow to the East Road with Continue', async ({ page }) => {
  test.setTimeout(600000);
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await checkpoint(page, 'downs', 'west', {
    chapter2: true,
    merryJoined: true,
    hedgeEntered: true,
    willowTrapped: true,
    willowFireFailed: true,
    tomArrived: true,
    willowFreed: true,
    houseWelcomed: true,
    houseSupper: true,
    houseNightOne: true,
    houseStories: true,
    houseRing: true,
    houseRested: true,
    chapter2Complete: true,
    learnedSong: true,
    chapter3: true,
  });
  await act(page, 'downs_farewell');
  await act(page, 'downs_view');
  await act(page, 'downs_stone');
  await flag(page, 'downsFog');
  // The mist checkpoint is the stone, not the doorway the party came in by.
  await reload(page, 'downs');
  expect(await page.evaluate(() => window.__game.scene.getScene('WorldScene').entryKey)).toBe(
    'stone',
  );
  // Reaching the gate stones separates the party; nobody is left visible.
  await walk(page, 53, 14);
  await flag(page, 'downsSeparated');
  await settled(page);
  expect(
    await page.evaluate(
      () => window.__game.scene.getScene('WorldScene').followers.filter((p) => p.visible).length,
    ),
  ).toBe(0);
  await walk(page, 61, 9);
  await zone(page, 'barrow');
  // Frodo wakes into the barrow on his own; the scene starts itself.
  await page.waitForFunction(() => window.__game.scene.getScene('WorldScene').dialogActive, null, {
    timeout: 15000,
  });
  await dialogue(page);
  await flag(page, 'barrowWoke');
  await reload(page, 'barrow');
  await act(page, 'barrow_courage');
  await flag(page, 'barrowCourage');
  await act(page, 'barrow_hoard');
  await reload(page, 'barrow');
  await act(page, 'barrow_call');
  await zone(page, 'barrowhill');
  // The three of them get up out of the grass before control comes back.
  await settled(page);
  expect(
    await page.evaluate(
      () => window.__game.scene.getScene('WorldScene').followers.filter((p) => p.visible).length,
    ),
  ).toBe(3);
  await act(page, 'barrow_broken');
  await act(page, 'barrow_treasure');
  await act(page, 'barrow_treasure');
  expect(await page.evaluate(() => window.__state.items.barrow_blades)).toBe(1);
  await act(page, 'barrow_ponies');
  await walk(page, 41, 21);
  await zone(page, 'eastroad');
  await act(page, 'road_farewell');
  await flag(page, 'chapter3Complete');
  await reload(page, 'eastroad');
  await flag(page, 'chapter3Complete');
  expect(
    await page.evaluate(
      () => window.__game.scene.getScene('WorldScene').followers.filter((p) => p.visible).length,
    ),
  ).toBe(3);
  expect(errors).toEqual([]);
});

test('Willow captivity blocks both departures and survives Continue', async ({ page }) => {
  await checkpoint(page, 'withywindle', 'willow', {
    chapter2: true,
    merryJoined: true,
    willowTrapped: true,
  });
  for (const [x, y] of [
    [0, 14],
    [79, 16],
  ]) {
    await page.evaluate(
      ({ x, y }) => {
        const s = window.__game.scene.getScene('WorldScene');
        s.player.setPosition(x * 16 + 8, y * 16 + 2);
        s.checkExits();
      },
      { x, y },
    );
    expect(
      await page.evaluate(() => window.__game.scene.getScene('WorldScene').transitioning),
    ).toBe(false);
  }
  await reload(page, 'withywindle');
  expect(
    await page.evaluate(() =>
      window.__game.scene
        .getScene('WorldScene')
        .followers.filter((p) => p.visible && !p.getData('held'))
        .map((p) => p.getData('key')),
    ),
  ).toEqual(['sam']);
});
