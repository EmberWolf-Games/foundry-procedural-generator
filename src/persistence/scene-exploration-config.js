import { FLAGS, MODULE_ID } from "../constants.js";

export function defaultSceneExplorationConfig() {
  return {
    schemaVersion: 1,
    randomEncounters: false,
    encounterChance: null
  };
}

export function normalizeSceneExplorationConfig(raw = {}) {
  const encounterChance = raw.encounterChance;
  const parsedChance = encounterChance === null || encounterChance === undefined || encounterChance === ""
    ? null
    : Number(encounterChance);

  return {
    schemaVersion: 1,
    randomEncounters: Boolean(raw.randomEncounters),
    encounterChance: Number.isFinite(parsedChance) ? Math.min(100, Math.max(0, parsedChance)) : null
  };
}

export function readSceneExplorationConfig(scene) {
  const stored = scene?.getFlag?.(MODULE_ID, FLAGS.EXPLORATION) ?? {};
  return normalizeSceneExplorationConfig(foundry.utils.mergeObject(defaultSceneExplorationConfig(), stored, { inplace: false }));
}

export function isRandomEncounterScene(scene) {
  return readSceneExplorationConfig(scene).randomEncounters === true;
}

export function encounterChanceForScene(scene, worldDefaultChance) {
  const config = readSceneExplorationConfig(scene);
  if (Number.isFinite(config.encounterChance)) return config.encounterChance;
  return Number(worldDefaultChance);
}
