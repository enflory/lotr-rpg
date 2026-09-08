/**
 * Renders the link-preview (Open Graph) card to public/og-image.png.
 *
 * Social scrapers want a static 1200x630 image at an absolute URL, which the
 * game itself can't provide — the canvas only exists once a browser has run
 * Phaser. So the card is composed here from a checked-in gameplay screenshot
 * and rendered once with the Playwright Chromium that already ships for e2e.
 *
 *   node scripts/make-og-image.mjs
 *
 * Re-run it whenever the card art or wording changes, and commit the result.
 * Scrapers cache aggressively: an updated image at the same URL may not show
 * up in existing previews until the platform re-scrapes.
 */
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const WIDTH = 1200;
const HEIGHT = 630;

// The screenshot is a native 960x720 canvas capture, and WorldScene already
// zooms 3x, so its 16px tiles land at 48px — chunky enough to read in a
// timeline thumbnail without resampling. It is therefore placed at 1:1 and
// *cropped*, never scaled: any non-integer scale would give the pixel art
// uneven 1px/2px columns.
const SHOT = 'assets/screenshots/hobbiton.png';
const ART_W = 640; // window onto the screenshot, full card height
// Crop offsets: hobbit holes along the top, Gandalf and the hobbits centred,
// the fenced holes along the bottom.
const CROP_X = 210;
const CROP_Y = 60;

const background = readFileSync(resolve(root, SHOT)).toString('base64');

const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=block"
      rel="stylesheet"
    />
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden; }
      #card {
        position: relative;
        width: ${WIDTH}px;
        height: ${HEIGHT}px;
        overflow: hidden;
        background: #0a0a12;
        font-family: 'Press Start 2P', monospace;
      }
      #art { position: absolute; right: 0; top: 0; width: ${ART_W}px; height: ${HEIGHT}px; overflow: hidden; }
      #art img { position: absolute; left: ${-CROP_X}px; top: ${-CROP_Y}px; image-rendering: pixelated; }
      /* Feather the art into the dark panel so it reads as one card rather
         than a screenshot pasted beside a title. */
      #fade {
        position: absolute;
        left: ${WIDTH - ART_W}px;
        top: 0;
        width: 220px;
        height: ${HEIGHT}px;
        background: linear-gradient(to right, #0a0a12 0%, rgba(10, 10, 18, 0.8) 40%, rgba(10, 10, 18, 0) 100%);
      }
      #text { position: absolute; left: 66px; top: 168px; width: 480px; }
      /* The ring from the title screen, drawn the same way: two concentric
         strokes, the inner one lighter. */
      #ring {
        width: 66px;
        height: 66px;
        margin-bottom: 40px;
        border: 6px solid #c8a84e;
        border-radius: 50%;
        box-shadow: inset 0 0 0 3px rgba(232, 200, 64, 0.5);
      }
      h1 { font-size: 34px; line-height: 1.45; color: #c8a84e; font-weight: normal; }
      p { margin-top: 34px; font-size: 14px; line-height: 1.9; color: #f0ead6; }
      #url { margin-top: 26px; font-size: 12px; color: #8a8a8a; }
      /* A thin gold frame keeps the card off a white timeline background. */
      #frame { position: absolute; inset: 0; border: 4px solid rgba(200, 168, 78, 0.55); }
    </style>
  </head>
  <body>
    <div id="card">
      <div id="art"><img src="data:image/png;base64,${background}" /></div>
      <div id="fade"></div>
      <div id="text">
        <div id="ring"></div>
        <h1>THE LORD<br />OF THE RINGS</h1>
        <p>A top-down pixel RPG<br />of the Fellowship</p>
        <div id="url">lotr.lonelymtnlabs.com</div>
      </div>
      <div id="frame"></div>
    </div>
  </body>
</html>`;

// CHROMIUM_PATH lets a sandbox point at a preinstalled browser; a normal
// checkout just uses the one `npx playwright install` puts on disk.
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: 1,
});
await page.setContent(html, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

// A silent fallback to a serif would look nothing like the game, so make a
// missing webfont a hard failure rather than a subtly wrong card.
const fontLoaded = await page.evaluate(() => document.fonts.check('34px "Press Start 2P"'));
if (!fontLoaded) {
  await browser.close();
  throw new Error('Press Start 2P did not load — refusing to render the card with a fallback font');
}

const png = await page.locator('#card').screenshot({ type: 'png' });
await browser.close();

const out = resolve(root, 'public/og-image.png');
writeFileSync(out, png);
console.log(`wrote ${out} (${WIDTH}x${HEIGHT}, ${png.length} bytes)`);
