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
import { save } from '../state/saveGame.js';
import { findWalkablePath, trailPosition } from '../state/partyMovement.js';
import {
  touchDirection,
  onTouchButton,
  setTouchControlsVisible,
  touchControlsActive,
} from '../input/touchControls.js';

// The canvas is 960×720 with a 3× camera zoom (a classic 320×240 view).
// Screen-fixed UI (scrollFactor 0) scales around the CANVAS centre, so its
// 320×240-era coordinates are shifted by (UI_OX, UI_OY) to stay centred.
const UI_OX = 320; // (960 - 320) / 2
const UI_OY = 240; // (720 - 240) / 2

const SPEED = 72;
const INTERACT_DIST = 20;
const FOLLOW_DISTANCE = 18; // world pixels between hobbits, independent of frame rate

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
    // Older checkpoints with Sam also gain Pippin, without replaying his entrance.
    if (gameState.follower === 'sam') setFlag('pippinJoined');
    save(this.zoneKey, this.entryKey); // checkpoint: every zone entry
    this.journey = null;
    this.storyBeat = null;
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

    /* ── travelling companions ──────────────────────── */
    this.followers = [];
    this.follower = null; // Sam alias used by existing scene hooks
    this.pippinArrival = null;
    this.trail = [];
    if (gameState.follower) this.createFollower(gameState.follower);
    if (gameState.follower === 'sam') this.createFollower('pippin');
    if (hasFlag('merryJoined')) this.createFollower('merry');
    this.snapFollower();

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
    this.actionHint = this.add
      .text(480, 466, '', {
        fontFamily: '"Press Start 2P"',
        fontSize: '6px',
        color: '#f0ead6',
        backgroundColor: '#101810dd',
        padding: { x: 5, y: 4 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1002)
      .setVisible(false);

    /* ── fern-cover overlays (tall-grass hiding effect) ─ */
    this.playerFernOverlay = this.add.image(0, 0, 'tileset', T.FERN).setVisible(false);
    // Each companion owns its fern overlay (created with the sprite).

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
    this.recallObjective = () => {
      if (gameState.objective) this.showBanner(`~ ${gameState.objective} ~`);
    };
    this.toggleMute = () => {
      this.showBanner(toggleMute() ? 'Sound off' : 'Sound on');
    };
    this.input.keyboard.on('keydown-Q', this.recallObjective);
    this.input.keyboard.on('keydown-M', this.toggleMute);

    // The on-screen pad feeds the same paths as the keys — no synthetic
    // key events, so the two input modes can never disagree.
    setTouchControlsVisible(true);
    const offTouch = onTouchButton((button) => {
      if (button === 'action') this.interactQueued = true;
      else if (button === 'inventory') this.toggleOverlay();
      else if (button === 'objective') this.recallObjective();
      else if (button === 'mute') this.toggleMute();
    });
    this.events.once('shutdown', offTouch);
    this.events.once('destroy', offTouch);

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
    const existing = this.followers.find((sprite) => sprite.getData('key') === key);
    if (existing) return existing;
    const sprite = this.add.sprite(this.player.x, this.player.y, key, 1);
    sprite.setData('key', key);
    sprite.setData('dir', this.lastDir);
    sprite.setData('fernOverlay', this.add.image(0, 0, 'tileset', T.FERN).setVisible(false));
    this.followers.push(sprite);
    if (key === gameState.follower) this.follower = sprite;
    return sprite;
  }

  snapFollower() {
    const tx = Math.floor(this.player.x / TILE_SIZE);
    const ty = Math.floor((this.player.y + 8) / TILE_SIZE);
    const behind = { right: [-1, 0], left: [1, 0], up: [0, 1], down: [0, -1] }[this.lastDir];
    const path = findWalkablePath(
      this.zone.map,
      this.player,
      (x, y) => Math.abs(x - tx) + Math.abs(y - ty) >= this.followers.length + 1,
      [behind, [-1, 0], [0, 1], [1, 0], [0, -1]],
    );
    this.trail = [{ x: this.player.x, y: this.player.y }, ...path];
    this.followers.forEach((sprite, i) => {
      const p = trailPosition(this.trail, FOLLOW_DISTANCE * (i + 1));
      sprite.setPosition(p.x, p.y);
    });
  }

  startPippinArrival() {
    const sprite = this.createFollower('pippin');
    const target = trailPosition(this.trail, FOLLOW_DISTANCE * 2);
    const view = this.cameras.main.worldView;
    // Route from the party out past the camera, then walk it in reverse.
    // The 24px margin keeps the entire sprite outside the initial view.
    const path = findWalkablePath(this.zone.map, target, (x, y) => {
      const px = x * TILE_SIZE + 8,
        py = y * TILE_SIZE;
      return (
        px < view.left - 24 || px > view.right + 24 || py < view.top - 24 || py > view.bottom + 24
      );
    }).reverse();
    if (!path.length) {
      // A tiny interior can fit entirely on camera (e.g. a restored old save).
      setFlag('pippinJoined');
      this.snapFollower();
      return;
    }
    path.push(target);
    sprite.setPosition(path[0].x, path[0].y);
    this.pippinArrival = { sprite, path: path.slice(1) };
    this.inputLocked = true;
    this.showBanner('Pippin joins the journey.');
  }

  moveCompanion(sprite, point) {
    const dx = point.x - sprite.x,
      dy = point.y - sprite.y;
    let dir = sprite.getData('dir');
    const moving = Math.hypot(dx, dy) > 0.1;
    if (moving)
      dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
    sprite.setData('dir', dir);
    sprite.anims.play(`${sprite.getData('key')}-${moving ? 'walk' : 'idle'}-${dir}`, true);
    sprite.setPosition(point.x, point.y).setDepth(point.y);
  }

  updateFollower(delta = 0) {
    if (!this.followers.length) return;
    if (this.pippinArrival) {
      const { sprite, path } = this.pippinArrival;
      let remaining = (100 * delta) / 1000;
      let point = { x: sprite.x, y: sprite.y };
      while (path.length && remaining > 0) {
        const target = path[0];
        const distance = Math.hypot(target.x - point.x, target.y - point.y);
        if (distance <= remaining) {
          point = path.shift();
          remaining -= distance;
        } else {
          point = {
            x: point.x + ((target.x - point.x) * remaining) / distance,
            y: point.y + ((target.y - point.y) * remaining) / distance,
          };
          remaining = 0;
        }
      }
      this.moveCompanion(sprite, point);
      if (!path.length) {
        setFlag('pippinJoined');
        this.pippinArrival = null;
        this.inputLocked = false;
      }
      return;
    }
    // Set pieces place the companions themselves while input is locked.
    if (this.inputLocked) {
      for (const sprite of this.followers) {
        sprite.anims.play(`${sprite.getData('key')}-idle-${sprite.getData('dir')}`, true);
      }
      return;
    }
    const last = this.trail[0];
    if (Math.hypot(this.player.x - last.x, this.player.y - last.y) > 0) {
      this.trail.unshift({ x: this.player.x, y: this.player.y });
      let length = 0;
      for (let i = 1; i < this.trail.length; i++) {
        length += Math.hypot(
          this.trail[i].x - this.trail[i - 1].x,
          this.trail[i].y - this.trail[i - 1].y,
        );
        if (length >= FOLLOW_DISTANCE * (this.followers.length + 1)) {
          this.trail.length = i + 1;
          break;
        }
      }
    }
    this.followers.forEach((sprite, i) => {
      if (sprite.getData('held')) return;
      this.moveCompanion(sprite, trailPosition(this.trail, FOLLOW_DISTANCE * (i + 1)));
    });
  }

  /* ── main loop ─────────────────────────────────────── */
  update(time, delta) {
    this.actionHint.setVisible(false);
    const interactPressed = this.interactQueued;
    this.interactQueued = false;

    if (this.deniedCooldown > 0) this.deniedCooldown -= delta;

    // Fern cover reads visually: fronds drawn over the character, who
    // dims slightly. Runs before the early returns so teleports
    // (e.g. the Rider catch reset) can't leave a stale overlay.
    this.updateFernCover(this.player, this.playerFernOverlay);
    for (const sprite of this.followers) {
      this.updateFernCover(sprite, sprite.getData('fernOverlay'));
    }

    /* ── dialogue mode ───────────────────────────────── */
    if (this.dialogActive) {
      this.player.setVelocity(0);
      if (!this.storyBeat) {
        this.player.anims.play(`frodo-idle-${this.lastDir}`, true);
        this.updateFollower(delta);
      }
      if (this.storyBeat?.prompt && !this.typing) {
        this.actionHint.setText(`${this.actionVerb()} · ${this.storyBeat.prompt}`).setVisible(true);
      }
      if (interactPressed) this.advanceDialogue();
      return;
    }

    if (this.storyBeat) {
      this.player.setVelocity(0);
      this.hintIcon.setVisible(false);
      return;
    }

    if (this.inputLocked || this.transitioning) {
      this.player.setVelocity(0);
      this.player.anims.play(`frodo-idle-${this.lastDir}`, true);
      this.updateFollower(delta);
      this.hintIcon.setVisible(false); // no interactions during set pieces
      if (this.zone.onUpdate && !this.transitioning) this.zone.onUpdate(this, delta);
      return;
    }

    if (this.overlayVisible) {
      this.player.setVelocity(0);
      this.player.anims.play(`frodo-idle-${this.lastDir}`, true);
      return;
    }

    /* ── movement ────────────────────────────────────── */
    const { left, right, up, down } = this.cursors;
    const pad = touchDirection();
    const held = {
      left: left.isDown || pad.left,
      right: right.isDown || pad.right,
      up: up.isDown || pad.up,
      down: down.isDown || pad.down,
    };
    let vx = 0,
      vy = 0;

    if (held.left) {
      vx = -SPEED;
      this.lastDir = 'left';
    } else if (held.right) {
      vx = SPEED;
      this.lastDir = 'right';
    }
    if (held.up) {
      vy = -SPEED;
      this.lastDir = 'up';
    } else if (held.down) {
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
    this.updateFollower(delta);

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

    const action = (this.zone.interactions ?? [])
      .filter(
        (p) =>
          (!p.when || p.when(gameState.flags)) &&
          Math.hypot(this.player.x - (p.x * TILE_SIZE + 8), this.player.y - p.y * TILE_SIZE) < 25,
      )
      .sort(
        (a, b) =>
          Math.hypot(this.player.x - a.x * TILE_SIZE - 8, this.player.y - a.y * TILE_SIZE) -
          Math.hypot(this.player.x - b.x * TILE_SIZE - 8, this.player.y - b.y * TILE_SIZE),
      )[0];
    if (action) {
      this.hintIcon
        .setVisible(true)
        .setPosition(action.x * TILE_SIZE + 8, action.y * TILE_SIZE - 16);
      this.actionHint.setText(`${this.actionVerb()} · ${action.label}`).setVisible(true);
    }

    /* ── interact ────────────────────────────────────── */
    if (interactPressed) {
      if (action) {
        this.startDialogue(action.dialogue);
      } else if (closestNpc) {
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

  /** Prompts name the key or the on-screen button, whichever is in play. */
  actionVerb() {
    return touchControlsActive() ? 'TAP A' : 'SPACE';
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
    if (!sprite || !sprite.visible || sprite.getData('held')) {
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
      sprite.setAlpha(0.68 * (sprite.getData('cinematicAlpha') ?? 1));
    } else {
      sprite.setAlpha(sprite.getData('cinematicAlpha') ?? 1);
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
    const tileY = Math.floor((this.player.y + 8) / TILE_SIZE);
    const exit = this.zone.exits.find((e) => e.x === tileX && e.y === tileY);
    if (!exit) return;

    if ((exit.requires && !hasFlag(exit.requires)) || exit.blockedWhen?.(gameState.flags)) {
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

    this.dialogKey = key;
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
    this.zone.onDialogueLine?.(this);
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
    // Repeated presses cannot skip an action that is still in motion.
    if (this.storyBeat?.busy) return;
    sfx.confirm();
    if (this.typing) {
      if (this.typeTimer) this.typeTimer.remove();
      this.dialogBodyText.setText(this.fullText);
      this.typing = false;
      this.dialogArrow.setVisible(this.dialogIndex < this.dialogLines.length - 1);
      return;
    }

    if (this.storyBeat?.action) {
      const action = this.storyBeat.action;
      this.storyBeat.action = null;
      action();
      return;
    }
    this.storyBeat = null;
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
      if (stage.join === 'sam') this.startPippinArrival();
    }
    if (stage.objective) {
      setObjective(stage.objective);
      sfx.jingle();
      if (!this.pippinArrival) this.showBanner(`~ ${stage.objective} ~`);
    }

    if (hasFlag('merryJoined') && !this.followers.some((p) => p.getData('key') === 'merry')) {
      this.removeNpc('merry');
      this.createFollower('merry');
      this.snapFollower();
    }
    this.refreshSpawns();
    // Rebuild encounter presentation before saving: Continue always reconstructs
    // the same stable flag state, never an animation half-way through.
    if (this.zone.onUpdate) this.zone.onUpdate(this, 0);
    this.checkpoint();
  }

  checkpoint(entry = this.entryKey) {
    this.entryKey = entry;
    save(this.zoneKey, entry);
  }

  /* ── spawn refresh (flags flip mid-scene via dialogue) ─ */
  refreshSpawns() {
    for (const def of this.zone.pickups ?? []) this.spawnPickup(def);
    for (const def of this.zone.npcs) {
      if (def.when && !def.when(gameState.flags)) continue;
      if (this.npcs.some((n) => n.getData('key') === def.key)) continue;
      if (this.followers.some((sprite) => sprite.getData('key') === def.key)) continue;
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
    if (this.storyBeat) return;
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
