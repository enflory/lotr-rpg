import Phaser from 'phaser';
import { gameState } from './state/GameState.js';
import { BootScene } from './scenes/BootScene.js';
import { TitleScene } from './scenes/TitleScene.js';
import { WorldScene } from './scenes/WorldScene.js';
import { initTouchControls } from './input/touchControls.js';

// The game plays in a 320×240 view, but the canvas is 3× that so text
// can render crisply. WorldScene zooms its camera 3× to keep the chunky
// pixel-art look; TitleScene lays itself out at native resolution.
const config = {
  type: Phaser.AUTO,
  width: 960,
  height: 720,
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: { debug: false },
  },
  scene: [BootScene, TitleScene, WorldScene],
  scale: {
    mode: Phaser.Scale.FIT,
    // The page centres the canvas with flexbox; on a portrait phone it
    // top-aligns instead so the touch pad gets the whole lower band
    // (see index.html). Phaser margins would fight that.
    autoCenter: Phaser.Scale.NO_CENTER,
  },
};

// Canvas text never re-renders when a webfont arrives late, so make
// sure the pixel font is in before any scene draws text. The timeout
// keeps the game booting if the font CDN is unreachable.
const fontReady = document.fonts
  ? Promise.race([
      document.fonts.load('16px "Press Start 2P"'),
      new Promise((resolve) => setTimeout(resolve, 2000)),
    ])
  : Promise.resolve();

fontReady.then(() => {
  initTouchControls();
  const game = new Phaser.Game(config);
  // Exposed for dev tooling / automated QA (see art-test.html, Playwright)
  window.__game = game;
  window.__state = gameState;
});
