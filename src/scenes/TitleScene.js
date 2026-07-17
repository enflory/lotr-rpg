import Phaser from 'phaser';
import { initAudio } from '../audio/sound.js';
import { hasFlag, setObjective } from '../state/GameState.js';
import { load, clearSave, applySave } from '../state/saveGame.js';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }

  create() {
    const cx = this.cameras.main.centerX;
    const cy = this.cameras.main.centerY;

    // Dark background
    this.cameras.main.setBackgroundColor('#0a0a12');

    // The title screen lays out at the full 960×720 canvas resolution
    // (WorldScene zooms 3×; here text stays native so it renders crisp).

    // Title
    this.add
      .text(cx, cy - 180, 'THE LORD\nOF THE RINGS', {
        fontFamily: '"Press Start 2P"',
        fontSize: '40px',
        color: '#c8a84e',
        align: 'center',
        lineSpacing: 18,
      })
      .setOrigin(0.5);

    // Subtitle
    this.add
      .text(cx, cy - 30, 'Chapter One ~ Three is Company', {
        fontFamily: '"Press Start 2P"',
        fontSize: '24px',
        color: '#8a8a8a',
        align: 'center',
      })
      .setOrigin(0.5);

    // Ring symbol — a simple circle
    const ring = this.add.graphics();
    ring.lineStyle(6, 0xc8a84e, 1);
    ring.strokeCircle(cx, cy + 90, 36);
    ring.lineStyle(3, 0xe8c840, 0.5);
    ring.strokeCircle(cx, cy + 90, 30);

    // Prompt
    const saved = load();
    const prompt = this.add
      .text(cx, cy + 225, saved ? 'ENTER ~ CONTINUE' : 'PRESS ENTER', {
        fontFamily: '"Press Start 2P"',
        fontSize: '24px',
        color: '#f0ead6',
        align: 'center',
      })
      .setOrigin(0.5);
    if (saved) {
      this.add
        .text(cx, cy + 265, 'N ~ NEW GAME', {
          fontFamily: '"Press Start 2P"',
          fontSize: '14px',
          color: '#8a8a8a',
          align: 'center',
        })
        .setOrigin(0.5);
    }

    // Blink the prompt
    this.tweens.add({
      targets: prompt,
      alpha: 0,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    // Disclaimer
    this.add
      .text(cx, 600, 'An unaffiliated, non-commercial fan project', {
        fontFamily: '"Press Start 2P"',
        fontSize: '12px',
        color: '#4a4a4a',
      })
      .setOrigin(0.5);

    // Controls + version
    this.add
      .text(cx, 654, 'ARROWS move   SPACE talk   Q objective   M sound', {
        fontFamily: '"Press Start 2P"',
        fontSize: '16px',
        color: '#6a6a6a',
      })
      .setOrigin(0.5);
    this.add
      .text(cx, 690, 'PROTOTYPE v0.2', {
        fontFamily: '"Press Start 2P"',
        fontSize: '16px',
        color: '#4a4a4a',
      })
      .setOrigin(0.5);

    // ENTER/SPACE continue a saved game if one exists; N always starts fresh.
    this.starting = false;
    const begin = saved ? () => this.continueGame(saved) : () => this.startGame();
    this.input.keyboard.on('keydown-ENTER', begin);
    this.input.keyboard.on('keydown-SPACE', begin);
    if (saved) this.input.keyboard.on('keydown-N', () => this.startGame(true));
  }

  /** @param {boolean} [fresh] true when N wipes an existing save */
  startGame(fresh = false) {
    if (this.starting) return;
    this.starting = true;
    if (fresh) clearSave();
    initAudio(); // must happen inside a user-gesture handler
    // A fresh game opens at Bilbo's farewell party; presetting
    // `prologueDone` (QA hooks) boots straight into the main story.
    const prologue = !hasFlag('prologueDone');
    if (prologue) setObjective('Speak with Bilbo beneath the Party Tree');
    this.cameras.main.fadeOut(800, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('WorldScene', { zone: 'shire', entry: prologue ? 'party' : 'default' });
    });
  }

  /** @param {import('../state/saveGame.js').SavePayload} saved */
  continueGame(saved) {
    if (this.starting) return;
    this.starting = true;
    initAudio();
    applySave(saved); // restore state BEFORE WorldScene boots
    this.cameras.main.fadeOut(800, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('WorldScene', { zone: saved.zone, entry: saved.entry });
    });
  }
}
