import Phaser from 'phaser';
import { initAudio } from '../audio/sound.js';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }

  create() {
    const cx = this.cameras.main.centerX;
    const cy = this.cameras.main.centerY;

    // Dark background
    this.cameras.main.setBackgroundColor('#0a0a12');

    // Title
    this.add.text(cx, cy - 60, 'THE LORD\nOF THE RINGS', {
      fontFamily: '"Press Start 2P"',
      fontSize: '14px',
      color: '#c8a84e',
      align: 'center',
      lineSpacing: 6,
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(cx, cy - 10, 'Chapter One ~ Three is Company', {
      fontFamily: '"Press Start 2P"',
      fontSize: '7px',
      color: '#8a8a8a',
      align: 'center',
    }).setOrigin(0.5);

    // Ring symbol — a simple circle
    const ring = this.add.graphics();
    ring.lineStyle(2, 0xc8a84e, 1);
    ring.strokeCircle(cx, cy + 30, 12);
    ring.lineStyle(1, 0xe8c840, 0.5);
    ring.strokeCircle(cx, cy + 30, 10);

    // Prompt
    const prompt = this.add.text(cx, cy + 75, 'PRESS ENTER', {
      fontFamily: '"Press Start 2P"',
      fontSize: '7px',
      color: '#f0ead6',
      align: 'center',
    }).setOrigin(0.5);

    // Blink the prompt
    this.tweens.add({
      targets: prompt,
      alpha: 0,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    // Controls + version
    this.add.text(cx, 218, 'ARROWS move   SPACE talk   Q objective   M sound', {
      fontFamily: '"Press Start 2P"',
      fontSize: '5px',
      color: '#6a6a6a',
    }).setOrigin(0.5);
    this.add.text(cx, 230, 'PROTOTYPE v0.2', {
      fontFamily: '"Press Start 2P"',
      fontSize: '5px',
      color: '#4a4a4a',
    }).setOrigin(0.5);

    // Start on ENTER or SPACE
    this.input.keyboard.once('keydown-ENTER', () => this.startGame());
    this.input.keyboard.once('keydown-SPACE', () => this.startGame());
  }

  startGame() {
    initAudio(); // must happen inside a user-gesture handler
    this.cameras.main.fadeOut(800, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('WorldScene', { zone: 'shire', entry: 'default' });
    });
  }
}
