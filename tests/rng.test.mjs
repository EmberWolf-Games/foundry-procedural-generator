import assert from "node:assert/strict";
import { createRng } from "../src/core/rng.js";

const a = createRng("same-seed");
const b = createRng("same-seed");

const sequenceA = Array.from({ length: 10 }, () => a.next());
const sequenceB = Array.from({ length: 10 }, () => b.next());

assert.deepEqual(sequenceA, sequenceB);
assert.notDeepEqual(
  Array.from({ length: 3 }, () => createRng("one").next()),
  Array.from({ length: 3 }, () => createRng("two").next())
);

const layoutA = createRng("root").stream("layout");
const layoutB = createRng("root").stream("layout");
assert.equal(layoutA.next(), layoutB.next());

console.log("rng.test.mjs passed");
