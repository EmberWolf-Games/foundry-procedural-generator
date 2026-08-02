import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const VERSION_PATTERN = /^(\d+)\.(\d+)\.(\d+)(?:-hf(\d+))?(?:-(pre|alpha|beta|rc))?$/;

export const VERSION_FILES = Object.freeze([
  { path: "src/constants.js", kind: "constants" },
  { path: "module.json", kind: "json" },
  { path: "package.json", kind: "json" }
]);

export function parseVersion(version) {
  const match = String(version).trim().match(VERSION_PATTERN);
  if (!match) {
    throw new Error(`Invalid module version '${version}'. Expected M.m.b[-hf#][-release].`);
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    build: Number(match[3]),
    hotfix: match[4] ? Number(match[4]) : null,
    release: match[5] ?? null,
    raw: version
  };
}

export function formatVersion(parts) {
  let value = `${parts.major}.${parts.minor}.${parts.build}`;
  if (parts.hotfix) value += `-hf${parts.hotfix}`;
  if (parts.release) value += `-${parts.release}`;
  return value;
}

export function bumpBuild(version) {
  const parts = parseVersion(version);
  if (parts.build >= 999) {
    throw new Error(`Build number cannot exceed 999 (current: ${parts.build}). Increment minor instead.`);
  }
  parts.build += 1;
  parts.hotfix = null;
  return formatVersion(parts);
}

export function bumpHotfix(version) {
  const parts = parseVersion(version);
  if (parts.hotfix) {
    if (parts.hotfix >= 999) {
      throw new Error(`Hotfix number cannot exceed 999 (current: ${parts.hotfix}). Ship a new build instead.`);
    }
    parts.hotfix += 1;
  } else {
    parts.hotfix = 1;
  }
  return formatVersion(parts);
}

export function readCurrentVersion() {
  const moduleJson = JSON.parse(readFileSync(join(ROOT, "module.json"), "utf8"));
  return moduleJson.version;
}

export function writeVersion(nextVersion) {
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
  } else if (command === "bump-hotfix") {
    console.log(bumpHotfix(current));
  } else if (command === "write") {
    const next = process.argv[3];
    if (!next) throw new Error("write requires a version argument");
    writeVersion(next);
    console.log(next);
  } else {
    throw new Error(`Unknown command '${command}'. Use: print | bump-build | bump-hotfix | write`);
  }
}
