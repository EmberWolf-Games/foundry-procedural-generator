import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MODULE_ID = "foundry-procedural-generator";
const DIST = join(ROOT, "dist");
const STAGE = join(DIST, "stage", MODULE_ID);
const ZIP = join(DIST, `${MODULE_ID}.zip`);

const INCLUDE = [
  "module.json",
  "README.md",
  "CHANGELOG.md",
  "LICENSE",
  "lang",
  "schemas",
  "src",
  "styles"
];

function copyReleaseTree() {
  rmSync(DIST, { recursive: true, force: true });
  mkdirSync(STAGE, { recursive: true });

  for (const entry of INCLUDE) {
    cpSync(join(ROOT, entry), join(STAGE, entry), { recursive: true });
  }

  const manifest = JSON.parse(readFileSync(join(STAGE, "module.json"), "utf8"));
  manifest.manifest = `https://github.com/EmberWolf-Games/${MODULE_ID}/releases/latest/download/module.json`;
  manifest.download = `https://github.com/EmberWolf-Games/${MODULE_ID}/releases/latest/download/${MODULE_ID}.zip`;
  manifest.url ??= `https://github.com/EmberWolf-Games/${MODULE_ID}`;
  manifest.changelog ??= `https://github.com/EmberWolf-Games/${MODULE_ID}/blob/main/CHANGELOG.md`;
  manifest.bugs ??= `https://github.com/EmberWolf-Games/${MODULE_ID}/issues`;
  writeFileSync(join(STAGE, "module.json"), `${JSON.stringify(manifest, null, 2)}\n`);
}

function createZip() {
  if (process.platform === "win32") {
    execSync(
      `powershell -NoProfile -Command "Compress-Archive -Path '${STAGE}' -DestinationPath '${ZIP}' -Force"`,
      { stdio: "inherit" }
    );
    return;
  }

  execSync(`cd "${join(DIST, "stage")}" && zip -r "${ZIP}" "${MODULE_ID}"`, { stdio: "inherit" });
}

copyReleaseTree();
createZip();

const releaseManifest = join(DIST, "module.json");
writeFileSync(releaseManifest, readFileSync(join(STAGE, "module.json")));

console.log(`Release package created: ${ZIP}`);
console.log(`Release manifest created: ${releaseManifest}`);
