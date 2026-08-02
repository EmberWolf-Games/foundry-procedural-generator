import { FLAGS, MODULE_ID, MODULE_VERSION } from "../constants.js";
import { log } from "../log.js";

function foundryGridType(type) {
  if (type === "square") return CONST.GRID_TYPES.SQUARE;
  throw new Error(`Unsupported prototype grid type: ${type}`);
}

function wallSense(value) {
  if (value === "normal") return CONST.WALL_SENSE_TYPES.NORMAL;
  if (value === "none") return CONST.WALL_SENSE_TYPES.NONE;
  throw new Error(`Unsupported Wall sense: ${value}`);
}

function wallDoorType(value) {
  if (value === "none") return CONST.WALL_DOOR_TYPES.NONE;
  if (value === "door") return CONST.WALL_DOOR_TYPES.DOOR;
  if (value === "secret") return CONST.WALL_DOOR_TYPES.SECRET;
  throw new Error(`Unsupported Wall door type: ${value}`);
}

function wallDoorState(value) {
  if (value === "closed") return CONST.WALL_DOOR_STATES.CLOSED;
  if (value === "open") return CONST.WALL_DOOR_STATES.OPEN;
  if (value === "locked") return CONST.WALL_DOOR_STATES.LOCKED;
  throw new Error(`Unsupported Wall door state: ${value}`);
}

function toFoundrySceneData(scene) {
  return {
    ...scene,
    grid: {
      ...scene.grid,
      type: foundryGridType(scene.grid.type)
    }
  };
}

function toFoundryWallData(wall) {
  return {
    c: wall.coordinates,
    move: wallSense(wall.movement),
    sight: wallSense(wall.sight),
    light: wallSense(wall.light),
    sound: wallSense(wall.sound),
    door: wallDoorType(wall.door),
    ds: wallDoorState(wall.doorState)
  };
}

export async function commitPrototypePlan(plan, { activate = false } = {}) {
  let scene;
  const startedAt = new Date().toISOString();

  const manifest = {
    manifestVersion: 1,
    generatorVersion: MODULE_VERSION,
    rootSeed: plan.seed,
    source: {
      explorationSceneUuid: plan.sourceSceneUuid,
      cellKey: plan.cellKey
    },
    contextSnapshot: plan.contextSnapshot,
    lifecycle: {
      status: "inProgress",
      createdAt: startedAt,
      completedAt: null
    },
    planSnapshot: plan
  };

  try {
    scene = await Scene.create({
      ...toFoundrySceneData(plan.scene),
      flags: {
        [MODULE_ID]: {
          [FLAGS.GENERATED]: true,
          [FLAGS.MANIFEST]: manifest
        }
      }
    });

    if (!scene) throw new Error("Foundry did not return the created Scene.");

    if (plan.walls.length > 0) {
      await scene.createEmbeddedDocuments("Wall", plan.walls.map(toFoundryWallData));
    }

    manifest.lifecycle.status = "complete";
    manifest.lifecycle.completedAt = new Date().toISOString();
    manifest.documentCounts = {
      Wall: plan.walls.length
    };

    await scene.setFlag(MODULE_ID, FLAGS.MANIFEST, manifest);
    await scene.update({ navigation: true });

    if (activate) await scene.activate();

    log.info("Generated prototype Scene.", {
      sceneUuid: scene.uuid,
      seed: plan.seed,
      cellKey: plan.cellKey
    });

    return scene;
  } catch (error) {
    log.error("Prototype Scene commit failed.", {
      error,
      sceneUuid: scene?.uuid,
      seed: plan.seed,
      cellKey: plan.cellKey
    });

    if (scene) {
      manifest.lifecycle.status = "failed";
      manifest.lifecycle.completedAt = new Date().toISOString();
      manifest.lifecycle.error = String(error?.message ?? error);
      await scene.setFlag(MODULE_ID, FLAGS.MANIFEST, manifest).catch(() => {});
    }
    throw error;
  }
}

export function isGeneratedScene(scene) {
  return scene?.getFlag(MODULE_ID, FLAGS.GENERATED) === true;
}
