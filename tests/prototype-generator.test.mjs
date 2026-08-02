import assert from "node:assert/strict";
import { buildPrototypePlan } from "../src/generation/prototype-generator.js";

const input = {
  seed: "stable-seed",
  cellKey: "4,9",
  sourceSceneUuid: "Scene.example",
  widthCells: 30,
  heightCells: 20,
  gridSize: 100
};

const first = buildPrototypePlan(input);
const second = buildPrototypePlan(input);

assert.deepEqual(first, second);
assert.equal(first.walls.length, 6);
assert.equal(first.scene.grid.type, "square");
assert.equal(first.zones.entrance.width, 100);
assert.equal(first.zones.exit.width, 100);

console.log("prototype-generator.test.mjs passed");
