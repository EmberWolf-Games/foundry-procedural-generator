import { HOOKS, MODULE_ID, SETTINGS } from "../constants.js";
import { createRng } from "../core/rng.js";
import { deriveEncounterSeed } from "../core/seed.js";
import { buildPrototypePlan } from "../generation/prototype-generator.js";
import { commitPrototypePlan } from "../adapters/foundry-scene-adapter.js";
import { isCellProcessed, markCell } from "../persistence/exploration-state.js";
import { log } from "../log.js";
import { getEncounterTimeContext } from "../integrations/seasons-stars-adapter.js";

const inFlight = new Set();

function lockKey(scene, cellKey) {
  return `${scene.id}:${cellKey}`;
}

export async function processEnteredCell(scene, tokenDocument, cellKey) {
  const key = lockKey(scene, cellKey);
  if (inFlight.has(key) || isCellProcessed(scene, cellKey)) return null;

  inFlight.add(key);
  try {
    const now = new Date().toISOString();
    Hooks.callAll(HOOKS.CELL_ENTERED, { scene, tokenDocument, cellKey });
    await markCell(scene, cellKey, {
      status: "checking",
      firstEnteredAt: now,
      lastEnteredAt: now,
      incrementEntry: true
    });

    const timeContext = getEncounterTimeContext();
    const seedMaterial = {
      schemaVersion: 1,
      worldId: game.world.id,
      explorationSceneId: scene.id,
      partyTokenId: tokenDocument.id,
      cellKey,
      triggerOrdinal: 1,
      campaignSalt: MODULE_ID,
      calendarProvider: timeContext.provider,
      calendarId: timeContext.calendarId ?? null,
      calendarYear: timeContext.date?.year ?? null,
      calendarMonth: timeContext.date?.month ?? null,
      calendarDay: timeContext.date?.day ?? null,
      daypart: timeContext.daypart,
      season: timeContext.season?.name ?? null
    };
    const seed = deriveEncounterSeed(seedMaterial);
    const checkRng = createRng(seed).stream("check");
    const chancePercent = Number(game.settings.get(MODULE_ID, SETTINGS.ENCOUNTER_CHANCE));
    const checkRoll = checkRng.next();
    const occurs = checkRoll < chancePercent / 100;
    Hooks.callAll(HOOKS.ENCOUNTER_CHECK_RESOLVED, {
      scene, tokenDocument, cellKey, seed, checkRoll, chancePercent, occurs, timeContext
    });

    if (!occurs) {
      await markCell(scene, cellKey, {
        status: "no-encounter",
        checkSeed: seed,
        checkRoll
      });
      log.info("No encounter for exploration cell.", { cellKey, checkRoll, chancePercent });
      return null;
    }

    await markCell(scene, cellKey, {
      status: "generating",
      checkSeed: seed,
      checkRoll
    });

    const plan = buildPrototypePlan({
      seed,
      cellKey,
      sourceSceneUuid: scene.uuid,
      widthCells: Number(game.settings.get(MODULE_ID, SETTINGS.PROTOTYPE_WIDTH_CELLS)),
      heightCells: Number(game.settings.get(MODULE_ID, SETTINGS.PROTOTYPE_HEIGHT_CELLS)),
      contextSnapshot: { time: timeContext }
    });

    const generatedScene = await commitPrototypePlan(plan, {
      activate: Boolean(game.settings.get(MODULE_ID, SETTINGS.AUTO_ACTIVATE))
    });

    await markCell(scene, cellKey, {
      status: "generated",
      generatedSceneUuid: generatedScene.uuid,
      encounterSeed: seed
    });

    Hooks.callAll(HOOKS.SCENE_GENERATED, {
      sourceScene: scene, tokenDocument, cellKey, generatedScene, seed, timeContext
    });

    return generatedScene;
  } catch (error) {
    Hooks.callAll(HOOKS.GENERATION_FAILED, { scene, tokenDocument, cellKey, error });
    await markCell(scene, cellKey, {
      status: "failed",
      error: String(error?.message ?? error)
    }).catch(() => {});

    Hooks.onError(`${MODULE_ID}.processEnteredCell`, error, {
      log: "error",
      notify: "error",
      data: { sceneUuid: scene.uuid, tokenUuid: tokenDocument.uuid, cellKey }
    });
    throw error;
  } finally {
    inFlight.delete(key);
  }
}
