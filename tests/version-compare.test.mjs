import assert from "node:assert/strict";
import {
  bumpBuild,
  bumpPatch,
  formatVersion,
  isFoundryNewer,
  parseVersion
} from "../scripts/version.mjs";

assert.deepEqual(parseVersion("0.1.107.1-pre"), {
  major: 0,
  minor: 1,
  build: 107,
  patch: 1,
  release: "pre",
  raw: "0.1.107.1-pre"
});

assert.deepEqual(parseVersion("0.1.107-hf1-pre"), {
  major: 0,
  minor: 1,
  build: 107,
  patch: 1,
  release: "pre",
  raw: "0.1.107-hf1-pre"
});

assert.deepEqual(parseVersion("0.1.107-pre"), {
  major: 0,
  minor: 1,
  build: 107,
  patch: 0,
  release: "pre",
  raw: "0.1.107-pre"
});

assert.equal(formatVersion(parseVersion("0.1.107.2-pre")), "0.1.107.2-pre");
assert.equal(bumpPatch("0.1.107.1-pre"), "0.1.107.2-pre");
assert.equal(bumpBuild("0.1.107.2-pre"), "0.1.108.0-pre");

assert.equal(isFoundryNewer("0.1.107.1-pre", "0.1.107.0-pre"), true);
assert.equal(isFoundryNewer("0.1.107.1-pre", "0.1.107-pre"), true);
assert.equal(isFoundryNewer("0.1.108.0-pre", "0.1.107.2-pre"), true);
assert.equal(isFoundryNewer("0.1.102.4-pre", "0.1.105.0-pre"), false);

console.log("version-compare.test.mjs passed");
