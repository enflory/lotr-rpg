import Phaser from 'phaser';
import { makeTilesetDataURL } from '../art/tiles.js';
import { CHAR_NAMES, makeCharSheet, CH } from '../art/characters.js';
import { makeHintSprite } from '../art/ui.js';

const TS = 16;

// Generates every texture in the game at startup: the tileset strip,
// one 16×24 spritesheet per character, and UI sprites. All art is
// procedural — there are no external image assets.
export class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  preload() {
    this.load.spritesheet('tileset', makeTilesetDataURL(), {
      frameWidth: TS,
      frameHeight: TS,
    });

    for (const name of CHAR_NAMES) {
      this.load.spritesheet(name, makeCharSheet(name), {
        frameWidth: TS,
        frameHeight: CH,
      });
    }

    this.load.image('hint', makeHintSprite());
  }

  create() {
    // Walk + idle animations for every character.
    // Sheet rows: down, left, right, up × 3 frames (middle = standing).
    for (const name of CHAR_NAMES) {
      ['down', 'left', 'right', 'up'].forEach((dir, di) => {
        this.anims.create({
          key: `${name}-walk-${dir}`,
          frames: this.anims.generateFrameNumbers(name, {
            start: di * 3,
            end: di * 3 + 2,
          }),
          frameRate: 6,
          repeat: -1,
        });
        this.anims.create({
          key: `${name}-idle-${dir}`,
          frames: [{ key: name, frame: di * 3 + 1 }],
          frameRate: 1,
        });
      });
    }

    this.scene.start('TitleScene');
  }
}
