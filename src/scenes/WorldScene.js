import Phaser from 'phaser';
import { T, TILE_SIZE, COLLISION_TILES } from '../data/tileTypes.js';
import { ZONES } from '../data/zones/index.js';
import { resolveDialogue } from '../data/dialogues.js';
import {
  gameState,
  setFlag,
  hasFlag,
  setObjective,
  addItem,
  removeItem,
  itemCount,
  collect,
  isCollected,
} from '../state/GameState.js';
import { ITEMS, ITEM_KEYS } from '../data/items.js';
import { QUESTS } from '../data/quests.js';
import { playMusic, sfx, toggleMute } from '../audio/sound.js';

// The canvas is 960×720 with a 3× camera zoom (a classic 320×240 view).
// Screen-fixed UI (scrollFactor 0) scales around the CANVAS centre, so its
// 320×240-era coordinates are shifted by (UI_OX, UI_OY) to stay centred.
const UI_OX = 320; // (960 - 320) / 2
const UI_OY = 240; // (720 - 240) / 2

const SPEED = 72;
const INTERACT_DIST = 20;
const FOLLOW_DELAY = 14; // frames of lag behind the player

// One scene renders every zone; transitions restart it with new data.
export class WorldScene extends Phaser.Scene {
  constructor() {
    super('WorldScene');
  }

  init(data) {
    this.zoneKey = data.zone || 'shire';
    this.entryKey = data.entry || 'default';
  }

  create() {
    const zone = ZONES[this.zoneKey];
    this.zone = zone;
    this.riderEvent = null;
    this.partyEvent = null; // scene.restart reuses the instance
    this.ferryEvent = null;
    this.inputLocked = false;
    this.deniedCooldown = 0;

    this.cameras.main.fadeIn(600, 0, 0, 0);

    /* ── tilemap ─────────────────────────────────────── */
    const map = this.make.tilemap({
      data: zone.map,
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
    });
    const tileset = map.addTilesetImage('tileset', 'tileset', TILE_SIZE, TILE_SIZE, 0, 0, 0);
    this.layer = map.createLayer(0, tileset, 0, 0);
    this.layer.setCollision(COLLISION_TILES);
    this.mapWidth = zone.map[0].length;
    this.mapHeight = zone.map.length;

    /* ── player ──────────────────────────────────────── */
    const spawn = zone.spawns[this.entryKey] || zone.spawns.default;
    this.player = this.physics.add.sprite(
      spawn.x * TILE_SIZE + 8,
      spawn.y * TILE_SIZE + 8,
      'frodo',
    );
    this.lastDir = spawn.dir || 'down';
    this.player.anims.play(`frodo-idle-${this.lastDir}`);
    // 16×24 sprite; body covers just the feet for Zelda-style overlap
    this.player.setSize(10, 8);
    this.player.setOffset(3, 14);
    this.physics.add.collider(this.player, this.layer);
    // Never walk off the world (e.g. the pier tile touching the map edge)
    this.physics.world.setBounds(0, 0, this.mapWidth * TILE_SIZE, this.mapHeight * TILE_SIZE);
    this.player.setCollideWorldBounds(true);

    /* ── follower (Sam) ──────────────────────────────── */
    this.follower = null;
    this.trail = [];
    if (gameState.follower) this.createFollower(gameState.follower);

    /* ── NPCs ────────────────────────────────────────── */
    this.npcs = [];
    for (const def of zone.npcs) {
      if (def.when && !def.when(gameState.flags)) continue;
      this.spawnNpc(def);
    }

    /* ── pickups ─────────────────────────────────────── */
    this.pickups = [];
    for (const def of zone.pickups ?? []) this.spawnPickup(def);

    /* ── interaction hint icon ───────────────────────── */
    this.hintIcon = this.add.image(0, 0, 'hint').setVisible(false).setDepth(900);

    /* ── fern-cover overlays (tall-grass hiding effect) ─ */
    this.playerFernOverlay = this.add.image(0, 0, 'tileset', T.FERN).setVisible(false);
    this.followerFernOverlay = this.add.image(0, 0, 'tileset', T.FERN).setVisible(false);

    /* ── dialogue UI (fixed to camera) ───────────────── */
    this.dialogBg = this.add
      .rectangle(160 + UI_OX, 210 + UI_OY, 304, 52, 0x000000, 0.88)
      .setScrollFactor(0)
      .setDepth(1000)
      .setVisible(false);
    this.dialogBorder = this.add
      .rectangle(160 + UI_OX, 210 + UI_OY, 304, 52)
      .setScrollFactor(0)
      .setDepth(1000)
      .setVisible(false)
      .setStrokeStyle(1, 0xc8a84e);

    this.dialogNameText = this.add
      .text(14 + UI_OX, 188 + UI_OY, '', {
        fontFamily: '"Press Start 2P"',
        fontSize: '7px',
        color: '#c8a84e',
      })
      .setScrollFactor(0)
      .setDepth(1001)
      .setVisible(false);

    this.dialogBodyText = this.add
      .text(14 + UI_OX, 200 + UI_OY, '', {
        fontFamily: '"Press Start 2P"',
        fontSize: '6px',
        color: '#f0ead6',
        wordWrap: { width: 286 },
        lineSpacing: 4,
      })
      .setScrollFactor(0)
      .setDepth(1001)
      .setVisible(false);

    this.dialogArrow = this.add
      .text(296 + UI_OX, 228 + UI_OY, '▼', {
        fontFamily: '"Press Start 2P"',
        fontSize: '6px',
        color: '#c8a84e',
      })
      .setScrollFactor(0)
      .setDepth(1001)
      .setVisible(false);

    this.tweens.add({
      targets: this.dialogArrow,
      alpha: 0.2,
      duration: 400,
      yoyo: true,
      repeat: -1,
    });

    /* ── event/objective banner ──────────────────────── */
    this.banner = this.add
      .text(160 + UI_OX, 44 + UI_OY, '', {
        fontFamily: '"Press Start 2P"',
        fontSize: '8px',
        color: '#ffd75e',
        align: 'center',
        stroke: '#1a1208',
        strokeThickness: 3,
        lineSpacing: 4,
        wordWrap: { width: 300 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(980)
      .setAlpha(0);
    this.bannerTween = null;

    /* ── inventory/errand overlay (I) ─────────────────── */
    this.overlayVisible = false;
    this.overlayBg = this.add
      .rectangle(160 + UI_OX, 120 + UI_OY, 260, 168, 0x000000, 0.92)
      .setScrollFactor(0)
      .setDepth(1100)
      .setVisible(false)
      .setStrokeStyle(1, 0xc8a84e);
    this.overlayText = this.add
      .text(40 + UI_OX, 46 + UI_OY, '', {
        fontFamily: '"Press Start 2P"',
        fontSize: '6px',
        color: '#f0ead6',
        lineSpacing: 6,
      })
      .setScrollFactor(0)
      .setDepth(1101)
      .setVisible(false);
    this.overlayIcons = [];
    this.input.keyboard.on('keydown-I', () => this.toggleOverlay());

    /* ── camera ──────────────────────────────────────── */
    // Canvas is 960×720; zoom 3 keeps the classic 320×240 view.
    this.cameras.main.setZoom(3);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setBounds(0, 0, this.mapWidth * TILE_SIZE, this.mapHeight * TILE_SIZE);

    /* ── input ───────────────────────────────────────── */
    this.cursors = this.input.keyboard.createCursorKeys();
    // Event-driven interact: JustDown polling misses key taps shorter
    // than one frame (keyup clears the flag before update polls it)
    this.interactQueued = false;
    const queueInteract = (e) => {
      if (!e.repeat) this.interactQueued = true;
    };
    this.input.keyboard.on('keydown-SPACE', queueInteract);
    this.input.keyboard.on('keydown-ENTER', queueInteract);
    this.input.keyboard.on('keydown-Q', () => {
      if (gameState.objective) this.showBanner(`~ ${gameState.objective} ~`);
    });
    this.input.keyboard.on('keydown-M', () => {
      this.showBanner(toggleMute() ? 'Sound off' : 'Sound on');
    });

    /* ── dialogue state ──────────────────────────────── */
    this.dialogActive = false;
    this.dialogLines = [];
    this.dialogIndex = 0;
    this.dialogStage = null;
    this.typing = false;
    this.typeTimer = null;
    this.fullText = '';
    this.transitioning = false;

    /* ── zone dressing ───────────────────────────────── */
    this.showLocationLabel(zone.label);
    playMusic(zone.music);
    if (zone.onCreate) zone.onCreate(this);
  }

  /* ── NPC helpers ───────────────────────────────────── */
  spawnNpc(def) {
    const dirFrameMap = { down: 1, left: 4, right: 7, up: 10 };
    const npc = this.physics.add.staticSprite(
      def.x * TILE_SIZE + 8,
      def.y * TILE_SIZE + 6, // feet rest on the spawn tile
      def.key,
      dirFrameMap[def.dir || 'down'],
    );
    npc.setData('key', def.key);
    npc.setSize(12, 12);
    npc.setDepth(npc.y);
    this.npcs.push(npc);
    return npc;
  }

  removeNpc(key) {
    const i = this.npcs.findIndex((n) => n.getData('key') === key);
    if (i >= 0) {
      this.npcs[i].destroy();
      this.npcs.splice(i, 1);
    }
  }

  /* ── pickups ───────────────────────────────────────── */
  spawnPickup(def) {
    if (isCollected(def.id)) return;
    if (def.when && !def.when(gameState.flags)) return;
    if (this.pickups.some((p) => p.def.id === def.id)) return;
    const spr = this.add.image(
      def.x * TILE_SIZE + 8,
      def.y * TILE_SIZE + 8,
      'items',
      ITEM_KEYS.indexOf(def.item),
    );
    spr.setDepth(def.y * TILE_SIZE);
    this.pickups.push({ def, spr });
  }

  /* ── follower ──────────────────────────────────────── */
  createFollower(key) {
    this.follower = this.add.sprite(this.player.x - 10, this.player.y + 6, key, 1);
    this.follower.setData('key', key);
    this.followerDir = 'down';
    this.trail = [];
  }

  snapFollower() {
    this.trail = [];
    if (this.follower) {
      this.follower.setPosition(this.player.x - 10, this.player.y + 6);
    }
  }

  updateFollower(moving) {
    if (!this.follower) return;
    if (moving) this.trail.push({ x: this.player.x, y: this.player.y });
    if (this.trail.length > FOLLOW_DELAY) {
      const p = this.trail.shift();
      const dx = p.x - this.follower.x;
      const dy = p.y - this.follower.y;
      if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
        this.followerDir =
          Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
        this.follower.anims.play(`${this.follower.getData('key')}-walk-${this.followerDir}`, true);
      }
      this.follower.setPosition(p.x, p.y);
    } else if (!moving) {
      this.follower.anims.play(`${this.follower.getData('key')}-idle-${this.followerDir}`, true);
    }
    this.follower.setDepth(this.follower.y);
  }

  /* ── main loop ─────────────────────────────────────── */
  update(time, delta) {
    const interactPressed = this.interactQueued;
    this.interactQueued = false;

    if (this.deniedCooldown > 0) this.deniedCooldown -= delta;

    // Fern cover reads visually: fronds drawn over the character, who
    // dims slightly. Runs before the early returns so teleports
    // (e.g. the Rider catch reset) can't leave a stale overlay.
    this.updateFernCover(this.player, this.playerFernOverlay);
    this.updateFernCover(this.follower, this.followerFernOverlay);

    /* ── dialogue mode ───────────────────────────────── */
    if (this.dialogActive) {
      this.player.setVelocity(0);
      this.player.anims.play(`frodo-idle-${this.lastDir}`, true);
      this.updateFollower(false);
      if (interactPressed) this.advanceDialogue();
      return;
    }

    if (this.inputLocked || this.transitioning) {
      this.player.setVelocity(0);
      this.player.anims.play(`frodo-idle-${this.lastDir}`, true);
      this.updateFollower(false);
      this.hintIcon.setVisible(false); // no interactions during set pieces
      if (this.zone.onUpdate && !this.transitioning) this.zone.onUpdate(this, delta);
      return;
    }

    /* ── movement ────────────────────────────────────── */
    const { left, right, up, down } = this.cursors;
    let vx = 0,
      vy = 0;

    if (left.isDown) {
      vx = -SPEED;
      this.lastDir = 'left';
    } else if (right.isDown) {
      vx = SPEED;
      this.lastDir = 'right';
    }
    if (up.isDown) {
      vy = -SPEED;
      this.lastDir = 'up';
    } else if (down.isDown) {
      vy = SPEED;
      this.lastDir = 'down';
    }

    this.player.setVelocity(vx, vy);

    const moving = vx !== 0 || vy !== 0;
    if (moving) {
      if (vx !== 0 && vy !== 0) {
        this.player.setVelocity(vx * 0.707, vy * 0.707);
      }
      this.player.anims.play(`frodo-walk-${this.lastDir}`, true);
    } else {
      this.player.anims.play(`frodo-idle-${this.lastDir}`, true);
    }

    // Depth-sort by feet position so characters overlap correctly
    this.player.setDepth(this.player.y);
    this.updateFollower(moving);

    /* ── pickup collection (walk-over) ───────────────── */
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const { def, spr } = this.pickups[i];
      if (Phaser.Math.Distance.Between(this.player.x, this.player.y + 8, spr.x, spr.y) > 10)
        continue;
      this.pickups.splice(i, 1);
      spr.destroy();
      collect(def.id);
      addItem(def.item);
      sfx.jingle();
      const n = itemCount(def.item);
      this.showBanner(`Got: ${ITEMS[def.item].name}${n > 1 ? ` (${n})` : ''}!`);
      if (def.onCollect) this.startDialogue(def.onCollect);
    }

    /* ── NPC proximity + hint ────────────────────────── */
    let closestNpc = null;
    let closestDist = Infinity;
    for (const npc of this.npcs) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y);
      if (dist < INTERACT_DIST && dist < closestDist) {
        closestDist = dist;
        closestNpc = npc;
      }
    }
    this.hintIcon.setVisible(!!closestNpc);
    if (closestNpc) this.hintIcon.setPosition(closestNpc.x, closestNpc.y - 18);

    /* ── interact ────────────────────────────────────── */
    if (interactPressed) {
      if (closestNpc) {
        this.faceNpcToPlayer(closestNpc);
        this.startDialogue(closestNpc.getData('key'));
      } else {
        this.checkTileInteraction();
      }
    }

    /* ── walk-on exits ───────────────────────────────── */
    this.checkExits();

    /* ── zone-specific scripting ─────────────────────── */
    if (this.zone.onUpdate) this.zone.onUpdate(this, delta);
  }

  /* ── NPC facing ────────────────────────────────────── */
  faceNpcToPlayer(npc) {
    const dx = this.player.x - npc.x;
    const dy = this.player.y - npc.y;
    const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
    const dirFrame = { down: 1, left: 4, right: 7, up: 10 };
    npc.setFrame(dirFrame[dir]);
  }

  /* ── fern-cover hiding effect ──────────────────────── */
  updateFernCover(sprite, overlay) {
    if (!sprite) {
      overlay.setVisible(false);
      return;
    }
    const tx = Math.floor(sprite.x / TILE_SIZE);
    const ty = Math.floor((sprite.y + 8) / TILE_SIZE); // feet
    const row = this.zone.map[ty];
    const covered = row !== undefined && row[tx] === T.FERN;
    overlay.setVisible(covered);
    if (covered) {
      overlay.setPosition(tx * TILE_SIZE + 8, ty * TILE_SIZE + 8).setDepth(sprite.y + 1);
      sprite.setAlpha(0.68);
    } else {
      sprite.setAlpha(1);
    }
  }

  /* ── doors and signs ───────────────────────────────── */
  checkTileInteraction() {
    const tileX = Math.floor(this.player.x / TILE_SIZE);
    const tileY = Math.floor(this.player.y / TILE_SIZE);

    for (const [ddx, ddy] of [
      [0, 0],
      [0, -1],
      [0, 1],
      [-1, 0],
      [1, 0],
    ]) {
      const tx = tileX + ddx;
      const ty = tileY + ddy;
      if (tx < 0 || tx >= this.mapWidth || ty < 0 || ty >= this.mapHeight) continue;
      const tile = this.zone.map[ty][tx];

      if (tile === T.DOOR) {
        const door = this.zone.doors.find((d) => d.x === tx && d.y === ty);
        if (door) {
          sfx.door();
          this.goToZone(door.zone, door.entry);
        } else {
          this.startDialogue('door_locked');
        }
        return;
      }

      if (tile === T.SIGN || COLLISION_TILES.includes(tile)) {
        const sign = this.zone.signs.find((s) => s.x === tx && s.y === ty);
        if (sign) {
          this.startDialogue(sign.dialogue);
          return;
        }
      }
    }
  }

  /* ── zone exits/transitions ────────────────────────── */
  checkExits() {
    const tileX = Math.floor(this.player.x / TILE_SIZE);
    const tileY = Math.floor(this.player.y / TILE_SIZE);
    const exit = this.zone.exits.find((e) => e.x === tileX && e.y === tileY);
    if (!exit) return;

    if (exit.requires && !hasFlag(exit.requires)) {
      // Nudge back toward the map interior and explain
      const px = tileX === 0 ? 12 : tileX === this.mapWidth - 1 ? -12 : 0;
      const py = tileY === 0 ? 12 : tileY === this.mapHeight - 1 ? -12 : 0;
      this.player.x += px;
      this.player.y += py;
      if (this.deniedCooldown <= 0) {
        this.deniedCooldown = 1800;
        this.showBanner(exit.denied || 'Not yet.');
      }
      return;
    }
    this.goToZone(exit.zone, exit.entry);
  }

  goToZone(zoneKey, entry) {
    if (this.transitioning) return;
    this.transitioning = true;
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.restart({ zone: zoneKey, entry });
    });
  }

  /* ── dialogue system ───────────────────────────────── */
  startDialogue(key) {
    if (this.overlayVisible) this.toggleOverlay();
    const dlg = resolveDialogue(key, gameState.flags, itemCount);
    if (!dlg) return;

    this.dialogActive = true;
    this.dialogStage = dlg;
    this.dialogLines = dlg.lines;
    this.dialogIndex = 0;
    this.dialogNameText.setText(dlg.name);

    this.dialogBg.setVisible(true);
    this.dialogBorder.setVisible(true);
    this.dialogNameText.setVisible(true);
    this.dialogBodyText.setVisible(true);

    this.showLine();
  }

  showLine() {
    const line = this.dialogLines[this.dialogIndex];
    this.fullText = line;
    this.dialogBodyText.setText('');
    this.typing = true;
    this.typeIdx = 0;
    this.dialogArrow.setVisible(false);

    if (this.typeTimer) this.typeTimer.remove();
    this.typeTimer = this.time.addEvent({
      delay: 28,
      repeat: line.length - 1,
      callback: () => {
        this.typeIdx++;
        this.dialogBodyText.setText(line.substring(0, this.typeIdx));
        if (this.typeIdx % 2 === 0) sfx.blip();
        if (this.typeIdx >= line.length) {
          this.typing = false;
          this.dialogArrow.setVisible(this.dialogIndex < this.dialogLines.length - 1);
        }
      },
    });
  }

  advanceDialogue() {
    sfx.confirm();
    if (this.typing) {
      if (this.typeTimer) this.typeTimer.remove();
      this.dialogBodyText.setText(this.fullText);
      this.typing = false;
      this.dialogArrow.setVisible(this.dialogIndex < this.dialogLines.length - 1);
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

    // Apply story effects carried by the finished dialogue stage
    const stage = this.dialogStage;
    this.dialogStage = null;
    if (!stage) return;

    if (stage.set) {
      for (const flag of [].concat(stage.set)) setFlag(flag);
    }
    if (stage.give) {
      addItem(stage.give);
      sfx.jingle();
      this.showBanner(`Got: ${ITEMS[stage.give].name}!`);
    }
    if (stage.take) removeItem(stage.take);
    if (stage.join && !gameState.follower) {
      gameState.follower = stage.join;
      this.removeNpc(stage.join);
      this.createFollower(stage.join);
      this.snapFollower();
    }
    if (stage.objective) {
      setObjective(stage.objective);
      sfx.jingle();
      this.showBanner(`~ ${stage.objective} ~`);
    }

    this.refreshSpawns();
  }

  /* ── spawn refresh (flags flip mid-scene via dialogue) ─ */
  refreshSpawns() {
    for (const def of this.zone.pickups ?? []) this.spawnPickup(def);
    for (const def of this.zone.npcs) {
      if (def.when && !def.when(gameState.flags)) continue;
      if (this.npcs.some((n) => n.getData('key') === def.key)) continue;
      if (this.follower && this.follower.getData('key') === def.key) continue;
      this.spawnNpc(def);
    }
  }

  /* ── banners and labels ────────────────────────────── */
  showBanner(text) {
    if (this.bannerTween) this.bannerTween.stop();
    this.banner.setText(text).setAlpha(0);
    this.bannerTween = this.tweens.add({
      targets: this.banner,
      alpha: 1,
      duration: 350,
      hold: 2600,
      yoyo: true,
      onComplete: () => this.banner.setAlpha(0),
    });
  }

  showLocationLabel(name) {
    const label = this.add
      .text(160 + UI_OX, 26 + UI_OY, name, {
        fontFamily: '"Press Start 2P"',
        fontSize: '10px',
        color: '#f0ead6',
        stroke: '#1a1a1a',
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(950)
      .setAlpha(0);

    this.tweens.add({
      targets: label,
      alpha: 1,
      duration: 800,
      hold: 1600,
      yoyo: true,
      onComplete: () => label.destroy(),
    });
  }

  /* ── inventory/errand overlay ─────────────────────────── */
  toggleOverlay() {
    this.overlayVisible = !this.overlayVisible;
    this.overlayBg.setVisible(this.overlayVisible);
    this.overlayText.setVisible(this.overlayVisible);
    for (const icon of this.overlayIcons) icon.destroy();
    this.overlayIcons = [];
    if (!this.overlayVisible) return;
    sfx.confirm();

    const lines = [];
    let row = 0;
    for (const key of ITEM_KEYS) {
      const n = itemCount(key);
      if (!n) continue;
      const icon = this.add
        .image(48 + UI_OX, 58 + UI_OY + row * 14, 'items', ITEM_KEYS.indexOf(key))
        .setScrollFactor(0)
        .setDepth(1101);
      this.overlayIcons.push(icon);
      lines.push(`   ${ITEMS[key].name}${n > 1 ? ` x${n}` : ''}`);
      row++;
    }
    if (!lines.length) lines.push('(nothing carried)');

    lines.push('');
    const count = itemCount;
    for (const q of QUESTS) {
      if (!q.active(gameState.flags, count) && !q.done(gameState.flags, count)) continue;
      lines.push(`${q.done(gameState.flags, count) ? '[x]' : '[ ]'} ${q.title}`);
    }

    lines.push('');
    lines.push(this.tallyLine());
    this.overlayText.setText(lines.join('\n'));
  }

  tallyLine() {
    const totals = {};
    const found = {};
    for (const z of Object.values(ZONES)) {
      for (const p of z.pickups ?? []) {
        totals[p.item] = (totals[p.item] || 0) + 1;
        if (isCollected(p.id)) found[p.item] = (found[p.item] || 0) + 1;
      }
    }
    const parts = [];
    for (const key of ['mathom', 'mushroom']) {
      if (totals[key]) parts.push(`${ITEMS[key].name}s ${found[key] || 0}/${totals[key]}`);
    }
    return parts.join(' · ');
  }
}
