import assert from "node:assert/strict";
import { isFoundryNewer } from "../scripts/version.mjs";

assert.equal(isFoundryNewer("0.1.107-pre", "0.1.105-pre"), true);
assert.equal(isFoundryNewer("0.1.102-hf4-pre", "0.1.105-pre"), false);
assert.equal(isFoundryNewer("0.1.106-hf1-pre", "0.1.106-pre"), false);

console.log("version-compare.test.mjs passed");
