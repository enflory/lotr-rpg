// Completed chapter beats are persisted as flags. Continue rebuilds their
// presentation and retries any unfinished animation from the last checkpoint.
import { gameState, hasFlag } from '../state/GameState.js';
import { createCrickhollow, updateCrickhollow, crickhollowDialogue } from './crickhollowEvent.js';
import { createPonies, updatePonies } from './ponyEvent.js';
import { createTomHouse, updateTomHouse, tomHouseDialogue } from './tomHouseEvent.js';
import { createWillow, updateWillow, willowDialogue } from './willowEvent.js';
import { drawHouseScenery } from '../art/houseScenery.js';
import { drawJourneyScenery } from '../art/journeyScenery.js';
import { barrowCreate, barrowUpdate, barrowDialogue } from './barrowEvent.js';

const forestZones = new Set(['forestgate', 'forestheart', 'withywindle']);

function atmosphere(scene) {
  if (forestZones.has(scene.zoneKey)) {
    for (let i = 0; i < 26; i++) {
      const x = (i * 117 + 61) % (scene.mapWidth * 16),
        y = (i * 97 + 44) % (scene.mapHeight * 16);
      const leaf = scene.add
        .rectangle(x, y, 2 + (i % 2), 1, i % 3 ? 0xb0a564 : 0x8a984e, 0.6)
        .setDepth(830);
      scene.tweens.add({
        targets: leaf,
        x: x + 26,
        y: y + 40,
        alpha: 0,
        duration: 4000 + i * 139,
        delay: i * 130,
        repeat: -1,
      });
    }
  }
}

export function journeyCreate(scene) {
  // The pale glimmer on each examine point is drawn by WorldScene now, for
  // every zone in the game rather than only the ones on the journey. The house
  // beats still steer which of them shows, so they share the same array.
  scene.journey = { state: '', props: [], markers: scene.interactionMarks ?? [] };
  const j = scene.journey,
    key = scene.zoneKey;
  drawJourneyScenery(scene);
  drawHouseScenery(scene);
  barrowCreate(scene);
  atmosphere(scene);
  if (key === 'crickhollow' || key === 'crickhollowhouse') createCrickhollow(scene);
  if (key === 'hedgetunnel') {
    j.gate = scene.add.graphics().setDepth(700);
    j.gateBlock = scene.add.zone(28 * 16 + 4, 9 * 16 + 8, 8, 48);
    scene.physics.add.existing(j.gateBlock, true);
    scene.physics.add.collider(scene.player, j.gateBlock);
    j.gateBlock.body.enable = !hasFlag('hedgeEntered');
    j.gate.lineStyle(2, 0x839084);
    for (let i = 0; i < 4; i++)
      j.gate.lineBetween(28 * 16 + i * 3, 8 * 16, 28 * 16 + i * 3, 11 * 16);
  }
  if (key === 'withywindle') createWillow(scene);
  createPonies(scene);
  if (key === 'tomhouse') createTomHouse(scene);
  journeyUpdate(scene, 0);
}

export function journeyUpdate(scene, delta) {
  if (!scene.journey || scene.dialogActive || scene.transitioning) return;
  const j = scene.journey,
    f = gameState.flags,
    key = scene.zoneKey;
  const tx = scene.player.x / 16,
    ty = scene.player.y / 16;
  updatePonies(scene, delta);
  if (key === 'crickhollow' || key === 'crickhollowhouse') updateCrickhollow(scene);
  if (key === 'hedgetunnel') {
    j.gate.setVisible(!f.hedgeEntered);
    j.gateBlock.body.enable = !f.hedgeEntered;
  }
  if (key === 'forestgate' && !f.bonfireSeen && Math.hypot(tx - 16, ty - 14) < 4)
    scene.startDialogue('forest_glade');
  if (key === 'forestheart') {
    if (!f.hillSeen && Math.hypot(tx - 18, ty - 18) < 4) scene.startDialogue('forest_hill');
    else if (!f.hollowSeen && Math.hypot(tx - 47, ty - 37) < 4)
      scene.startDialogue('forest_hollow');
  }
  if (key === 'withywindle') updateWillow(scene);
  if (key === 'tomhouse') updateTomHouse(scene);
  barrowUpdate(scene, delta);
}

// Small visual tableaux accompany the action pages. The real flags still apply
// only when the dialogue finishes, so reloading during a page safely retries it.
export function journeyDialogue(scene) {
  if (!scene.journey) return;
  if (scene.zoneKey === 'withywindle') willowDialogue(scene);
  if (scene.zoneKey === 'crickhollowhouse') crickhollowDialogue(scene);
  if (scene.zoneKey === 'tomhouse') tomHouseDialogue(scene);
  barrowDialogue(scene);
}
