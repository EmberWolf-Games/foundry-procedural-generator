import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const VERSION_PATTERN = /^(\d+)\.(\d+)\.(\d+)\.(\d+)(?:-(pre|alpha|beta|rc))?$/;
const LEGACY_HOTFIX_PATTERN = /^(\d+)\.(\d+)\.(\d+)-hf(\d+)(?:-(pre|alpha|beta|rc))?$/;
const LEGACY_BUILD_PATTERN = /^(\d+)\.(\d+)\.(\d+)(?:-(pre|alpha|beta|rc))?$/;

export const VERSION_FILES = Object.freeze([
  { path: "src/constants.js", kind: "constants" },
  { path: "module.json", kind: "json" },
  { path: "package.json", kind: "json" }
]);

export function parseVersion(version) {
  const raw = String(version).trim();

  let match = raw.match(VERSION_PATTERN);
  if (match) {
    return {
      major: Number(match[1]),
      minor: Number(match[2]),
      build: Number(match[3]),
      patch: Number(match[4]),
      release: match[5] ?? null,
      raw
    };
  }

  match = raw.match(LEGACY_HOTFIX_PATTERN);
  if (match) {
    return {
      major: Number(match[1]),
      minor: Number(match[2]),
      build: Number(match[3]),
      patch: Number(match[4]),
      release: match[5] ?? null,
      raw
    };
  }

  match = raw.match(LEGACY_BUILD_PATTERN);
  if (match) {
    return {
      major: Number(match[1]),
      minor: Number(match[2]),
      build: Number(match[3]),
      patch: 0,
      release: match[4] ?? null,
      raw
    };
  }

  throw new Error(`Invalid module version '${version}'. Expected M.m.b.p[-release].`);
}

export function formatVersion(parts) {
  let value = `${parts.major}.${parts.minor}.${parts.build}.${parts.patch}`;
  if (parts.release) value += `-${parts.release}`;
  return value;
}

export function bumpBuild(version) {
  const parts = parseVersion(version);
  if (parts.build >= 999) {
    throw new Error(`Build number cannot exceed 999 (current: ${parts.build}). Increment minor instead.`);
  }
  parts.build += 1;
  parts.patch = 0;
  return formatVersion(parts);
}

export function bumpPatch(version) {
  const parts = parseVersion(version);
  if (parts.patch >= 999) {
    throw new Error(`Patch number cannot exceed 999 (current: ${parts.patch}). Ship a new build instead.`);
  }
  parts.patch += 1;
  return formatVersion(parts);
}

/** @deprecated Use bumpPatch — kept for transitional scripts. */
export const bumpHotfix = bumpPatch;

/** Mirrors Foundry's foundry.utils.isNewerVersion using parsed M.m.b.p segments. */
export function isFoundryNewer(v1, v0) {
  const left = parseVersion(v1);
  const right = parseVersion(v0);
  const segments = [
    [left.major, right.major],
    [left.minor, right.minor],
    [left.build, right.build],
    [left.patch, right.patch]
  ];

  for (const [a, b] of segments) {
    if (a > b) return true;
    if (a < b) return false;
  }
  return false;
}

export function readCurrentVersion() {
  const moduleJson = JSON.parse(readFileSync(join(ROOT, "module.json"), "utf8"));
  return moduleJson.version;
}

export function writeVersion(nextVersion) {
  parseVersion(nextVersion);

  for (const file of VERSION_FILES) {
    const absolute = join(ROOT, file.path);
    if (file.kind === "json") {
      const json = JSON.parse(readFileSync(absolute, "utf8"));
      json.version = nextVersion;
      writeFileSync(absolute, `${JSON.stringify(json, null, 2)}\n`);
      continue;
    }

    const source = readFileSync(absolute, "utf8");
    const updated = source.replace(
      /export const MODULE_VERSION = "[^"]+";/,
      `export const MODULE_VERSION = "${nextVersion}";`
    );
    if (updated === source) {
      throw new Error(`Failed to update MODULE_VERSION in ${file.path}`);
    }
    writeFileSync(absolute, updated);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const command = process.argv[2] ?? "print";
  const current = readCurrentVersion();

  if (command === "print") {
    console.log(current);
  } else if (command === "bump-build") {
    console.log(bumpBuild(current));
  } else if (command === "bump-patch" || command === "bump-hotfix") {
    console.log(bumpPatch(current));
  } else if (command === "write") {
    const next = process.argv[3];
    if (!next) throw new Error("write requires a version argument");
    writeVersion(next);
    console.log(next);
  } else {
    throw new Error(`Unknown command '${command}'. Use: print | bump-build | bump-patch | write`);
  }
}
