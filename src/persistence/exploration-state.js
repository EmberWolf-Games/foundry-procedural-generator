import { FLAGS, MODULE_ID } from "../constants.js";

function defaultState() {
  return {
    schemaVersion: 1,
    cells: {}
  };
}

export function readExplorationState(scene) {
  return foundry.utils.deepClone(scene.getFlag(MODULE_ID, FLAGS.EXPLORATION_STATE) ?? defaultState());
}

export async function markCell(scene, cellKey, patch) {
  const state = readExplorationState(scene);
  const previous = state.cells[cellKey] ?? {
    cellKey,
    status: "unseen",
    entryCount: 0,
    firstEnteredAt: null,
    lastEnteredAt: null
  };

  state.cells[cellKey] = {
    ...previous,
    ...patch,
    entryCount: previous.entryCount + (patch.incrementEntry ? 1 : 0)
  };
  delete state.cells[cellKey].incrementEntry;

  await scene.setFlag(MODULE_ID, FLAGS.EXPLORATION_STATE, state);
  return state.cells[cellKey];
}

export function isCellProcessed(scene, cellKey) {
  const status = readExplorationState(scene).cells[cellKey]?.status;
  return ["no-encounter", "generated", "generating"].includes(status);
}
