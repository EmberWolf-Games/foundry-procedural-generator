import assert from "node:assert/strict";
import { normalizeSceneExplorationConfig } from "../src/persistence/scene-exploration-config.js";

assert.deepEqual(normalizeSceneExplorationConfig({}), {
  schemaVersion: 1,
  randomEncounters: false,
  encounterChance: null
});

assert.deepEqual(normalizeSceneExplorationConfig({
  randomEncounters: true,
  encounterChance: 35
}), {
  schemaVersion: 1,
  randomEncounters: true,
  encounterChance: 35
});

assert.deepEqual(normalizeSceneExplorationConfig({
  randomEncounters: true,
  encounterChance: ""
}), {
  schemaVersion: 1,
  randomEncounters: true,
  encounterChance: null
});

assert.equal(normalizeSceneExplorationConfig({ encounterChance: 150 }).encounterChance, 100);
assert.equal(normalizeSceneExplorationConfig({ encounterChance: -5 }).encounterChance, 0);

console.log("scene-exploration-config.test.mjs passed");
