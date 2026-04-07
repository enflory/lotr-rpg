import Phaser from 'phaser';
import { MAP_DATA, MAP_WIDTH, MAP_HEIGHT, TILE_SIZE, COLLISION_TILES, NPC_SPAWNS, PLAYER_START, T } from '../data/map.js';
import { DIALOGUES } from '../data/dialogues.js';

const SPEED = 72;
const INTERACT_DIST = 20;

export class ShireScene extends Phaser.Scene {
  constructor() { super('ShireScene'); }

  create() {
    this.cameras.main.fadeIn(1000, 0, 0, 0);

    /* ── tilemap ─────────────────────────────────────── */
    const map = this.make.tilemap({
      data: MAP_DATA,
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
    });
    const tileset = map.addTilesetImage('tileset', 'tileset', TILE_SIZE, TILE_SIZE, 0, 0, 0);
    const layer = map.createLayer(0, tileset, 0, 0);
    layer.setCollision(COLLISION_TILES);

    /* ── player ──────────────────────────────────────── */
    this.player = this.physics.add.sprite(
      PLAYER_START.x * TILE_SIZE + 8,
      PLAYER_START.y * TILE_SIZE + 8,
      'frodo',
      1, // face down, standing
    );
    this.player.setSize(10, 10);
    this.player.setOffset(3, 5);
    this.physics.add.collider(this.player, layer);
    this.lastDir = 'down';

    /* ── NPCs ────────────────────────────────────────── */
    this.npcs = [];
    const dirFrameMap = { down: 1, left: 4, right: 7, up: 10 };
    for (const [key, spawn] of Object.entries(NPC_SPAWNS)) {
      const npc = this.physics.add.staticSprite(
        spawn.x * TILE_SIZE + 8,
        spawn.y * TILE_SIZE + 8,
        key,
        dirFrameMap[spawn.dir],
      );
      npc.setData('key', key);
      npc.setData('dir', spawn.dir);
      npc.setSize(12, 12);
      this.npcs.push(npc);
    }

    /* ── interaction hint icon ───────────────────────── */
    this.hintIcon = this.add.image(0, 0, 'hint').setVisible(false).setDepth(10);

    /* ── dialogue UI (fixed to camera) ───────────────── */
    this.dialogBg = this.add.rectangle(160, 210, 304, 52, 0x000000, 0.88)
      .setScrollFactor(0).setDepth(20).setVisible(false);
    this.dialogBorder = this.add.rectangle(160, 210, 304, 52)
      .setScrollFactor(0).setDepth(20).setVisible(false).setStrokeStyle(1, 0xc8a84e);

    this.dialogNameText = this.add.text(14, 188, '', {
      fontFamily: '"Press Start 2P"',
      fontSize: '7px',
      color: '#c8a84e',
    }).setScrollFactor(0).setDepth(21).setVisible(false);

    this.dialogBodyText = this.add.text(14, 200, '', {
      fontFamily: '"Press Start 2P"',
      fontSize: '6px',
      color: '#f0ead6',
      wordWrap: { width: 286 },
      lineSpacing: 4,
    }).setScrollFactor(0).setDepth(21).setVisible(false);

    this.dialogArrow = this.add.text(296, 228, '\u25bc', {
      fontFamily: '"Press Start 2P"',
      fontSize: '6px',
      color: '#c8a84e',
    }).setScrollFactor(0).setDepth(21).setVisible(false);

    this.tweens.add({
      targets: this.dialogArrow,
      alpha: 0.2,
      duration: 400,
      yoyo: true,
      repeat: -1,
    });

    /* ── camera ──────────────────────────────────────── */
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setBounds(0, 0, MAP_WIDTH * TILE_SIZE, MAP_HEIGHT * TILE_SIZE);

    /* ── input ───────────────────────────────────────── */
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    /* ── dialogue state ──────────────────────────────── */
    this.dialogActive = false;
    this.dialogLines = [];
    this.dialogIndex = 0;
    this.typing = false;
    this.typeTimer = null;
    this.fullText = '';

    /* ── location label ──────────────────────────────── */
    this.showLocationLabel('The Shire');
  }

  update() {
    /* ── dialogue mode ───────────────────────────────── */
    if (this.dialogActive) {
      this.player.setVelocity(0);
      this.player.anims.stop();
      if (Phaser.Input.Keyboard.JustDown(this.spaceKey) || Phaser.Input.Keyboard.JustDown(this.enterKey)) {
        this.advanceDialogue();
      }
      return;
    }

    /* ── movement ────────────────────────────────────── */
    const { left, right, up, down } = this.cursors;
    let vx = 0, vy = 0;

    if (left.isDown)  { vx = -SPEED; this.lastDir = 'left'; }
    else if (right.isDown) { vx = SPEED; this.lastDir = 'right'; }
    if (up.isDown)    { vy = -SPEED; this.lastDir = 'up'; }
    else if (down.isDown)  { vy = SPEED; this.lastDir = 'down'; }

    this.player.setVelocity(vx, vy);

    if (vx !== 0 || vy !== 0) {
      // Normalize diagonal speed
      if (vx !== 0 && vy !== 0) {
        this.player.setVelocity(vx * 0.707, vy * 0.707);
      }
      this.player.anims.play(`frodo-walk-${this.lastDir}`, true);
    } else {
      this.player.anims.play(`frodo-idle-${this.lastDir}`, true);
    }

    /* ── NPC interaction check ───────────────────────── */
    let closestNpc = null;
    let closestDist = Infinity;
    for (const npc of this.npcs) {
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y, npc.x, npc.y,
      );
      if (dist < INTERACT_DIST && dist < closestDist) {
        closestDist = dist;
        closestNpc = npc;
      }
    }

    if (closestNpc) {
      this.hintIcon.setPosition(closestNpc.x, closestNpc.y - 14).setVisible(true);
      if (Phaser.Input.Keyboard.JustDown(this.spaceKey) || Phaser.Input.Keyboard.JustDown(this.enterKey)) {
        this.faceNpcToPlayer(closestNpc);
        this.startDialogue(closestNpc.getData('key'));
      }
    } else {
      this.hintIcon.setVisible(false);
    }

    // Check for sign/door interactions
    this.checkSignInteraction();
  }

  /* ── NPC facing ────────────────────────────────────── */
  faceNpcToPlayer(npc) {
    const dx = this.player.x - npc.x;
    const dy = this.player.y - npc.y;
    let dir;
    if (Math.abs(dx) > Math.abs(dy)) {
      dir = dx > 0 ? 'right' : 'left';
    } else {
      dir = dy > 0 ? 'down' : 'up';
    }
    const key = npc.getData('key');
    const dirFrame = { down: 1, left: 4, right: 7, up: 10 };
    npc.setFrame(dirFrame[dir]);
  }

  /* ── sign / door interaction ───────────────────────── */
  checkSignInteraction() {
    if (!(Phaser.Input.Keyboard.JustDown(this.spaceKey) || Phaser.Input.Keyboard.JustDown(this.enterKey))) return;

    const tileX = Math.floor(this.player.x / TILE_SIZE);
    const tileY = Math.floor(this.player.y / TILE_SIZE);

    // Check adjacent tile for doors
    const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [ddx, ddy] of dirs) {
      const tx = tileX + ddx;
      const ty = tileY + ddy;
      if (tx >= 0 && tx < MAP_WIDTH && ty >= 0 && ty < MAP_HEIGHT) {
        const tile = MAP_DATA[ty][tx];
        if (tile === T.DOOR) {
          // Determine which door based on position
          if (ty <= 11) {
            this.startDialogue('sign_bagend');
          } else if (ty >= 21 && ty <= 24) {
            this.startDialogue('sign_greendragon');
          } else {
            this.startDialogue('sign_bywater');
          }
          return;
        }
      }
    }
  }

  /* ── dialogue system ───────────────────────────────── */
  startDialogue(key) {
    const dlg = DIALOGUES[key];
    if (!dlg) return;

    this.dialogActive = true;
    this.dialogLines = dlg.lines;
    this.dialogIndex = 0;
    this.dialogNameText.setText(dlg.name);

    this.dialogBg.setVisible(true);
    this.dialogBorder.setVisible(true);
    this.dialogNameText.setVisible(true);
    this.dialogBodyText.setVisible(true);
    this.dialogArrow.setVisible(true);

    this.showLine();
  }

  showLine() {
    const line = this.dialogLines[this.dialogIndex];
    this.fullText = line;
    this.dialogBodyText.setText('');
    this.typing = true;
    this.typeIdx = 0;

    // Hide arrow while typing
    this.dialogArrow.setVisible(false);

    if (this.typeTimer) this.typeTimer.remove();
    this.typeTimer = this.time.addEvent({
      delay: 28,
      repeat: line.length - 1,
      callback: () => {
        this.typeIdx++;
        this.dialogBodyText.setText(line.substring(0, this.typeIdx));
        if (this.typeIdx >= line.length) {
          this.typing = false;
          // Show arrow if more lines
          if (this.dialogIndex < this.dialogLines.length - 1) {
            this.dialogArrow.setVisible(true);
          } else {
            this.dialogArrow.setVisible(false);
          }
        }
      },
    });
  }

  advanceDialogue() {
    if (this.typing) {
      // Skip to end of current line
      if (this.typeTimer) this.typeTimer.remove();
      this.dialogBodyText.setText(this.fullText);
      this.typing = false;
      if (this.dialogIndex < this.dialogLines.length - 1) {
        this.dialogArrow.setVisible(true);
      } else {
        this.dialogArrow.setVisible(false);
      }
      return;
    }

    this.dialogIndex++;
    if (this.dialogIndex >= this.dialogLines.length) {
      this.closeDialogue();
    } else {
      this.showLine();
    }
  }

  closeDialogue() {
    this.dialogActive = false;
    this.dialogBg.setVisible(false);
    this.dialogBorder.setVisible(false);
    this.dialogNameText.setVisible(false);
    this.dialogBodyText.setVisible(false);
    this.dialogArrow.setVisible(false);
    if (this.typeTimer) this.typeTimer.remove();
  }

  /* ── location label (appears briefly on scene enter) ── */
  showLocationLabel(name) {
    const label = this.add.text(160, 30, name, {
      fontFamily: '"Press Start 2P"',
      fontSize: '10px',
      color: '#f0ead6',
      stroke: '#1a1a1a',
      strokeThickness: 2,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(15).setAlpha(0);

    this.tweens.add({
      targets: label,
      alpha: 1,
      duration: 1000,
      hold: 2000,
      yoyo: true,
      onComplete: () => label.destroy(),
    });
  }
}
