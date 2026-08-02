# Module Versioning

Foundry Procedural Generator uses a structured version string:

```text
M.m.b[-hf#][-release]
```

## Fields

| Field | Range | Meaning |
|---|---|---|
| **M** (major) | 0–999 | Stays `0` until the first full public release (`1.x.x`). Increments only for full release milestones. |
| **m** (minor) | 0–999 | Starts at `1` during pre-release. Increments with each major feature milestone (for example M1 → `0.1.x`, M2 → `0.2.x`). Resets to `0` after the first full release, then resets again on each major increment. |
| **b** (build) | 100–999 | Starts at `100` for each minor line. Increments only for **meaningful feature changes** within that minor line. Resets to `100` when **m** increments. |
| **hf#** (hotfix) | 1–999 | Omitted by default. **Patch / bugfix releases only** — append after **b** and before **release** (`0.1.107-hf1-pre`). Increment per patch on the same build; do not increment **b** for patches. |
| **release** | `pre`, `alpha`, `beta`, `rc` | Pre-release channel suffix. Omitted after full release (`M >= 1` and channel complete). |

## Examples

```text
0.1.107-hf2-pre
```

Patch release 2 on build `107` (bugfix only; build number unchanged).

```text
0.1.108-pre
```

Meaningful feature update on minor line `1` (build incremented from `107`).

```text
1.0.361
```

Full release major `1`, minor `0`, build `361`. No hotfix suffix. No release suffix.

## Bump rules (summary)

1. **Minor feature milestone complete** (for example M1 proven, starting M2 work): increment **m**, reset **b** to `100`, clear **hf#**, keep **release** until channel promotion.
2. **Meaningful feature update** within a milestone line: increment **b** only; clear **hf#**.
3. **Patch / bugfix** on a shipped build: keep **b** unchanged; append or increment `-hf#` before `-release`. Never increment **b** for patches.
4. **Channel promotion**: change `-release` (`pre` → `alpha` → `beta` → `rc`); omit after full release.
5. **Full release**: set **M** to `1`, reset **m** to `0`, continue incrementing **b** from `100`; omit `-release`.

**Owner rule:** CI must not auto-increment **b** after every release. Post-release prep increments **hf#** only. Manual **b** bumps happen when landing meaningful feature work.

## Foundry update detection (advisory)

Foundry compares versions with `foundry.utils.isNewerVersion` (dot-separated numeric segments). Implications:

- A patch must stay on the same **b** as the installed build (for example `0.1.107-pre` → `0.1.107-hf1-pre`).
- Do not publish patches on a lower **b** than worlds already have (for example `0.1.102-hf4-pre` will not update from `0.1.105-pre`).
- After erroneous build-only releases, one **b** bump may be required to restore update paths; avoid those by following the rules above.

Run `node tests/version-compare.test.mjs` when unsure whether a version sorts newer than an installed manifest.

## Files to update together

Keep these in sync on every version bump:

- `src/constants.js` (`MODULE_VERSION` — canonical runtime value)
- `module.json`
- `package.json`
- `CHANGELOG.md`
- `README.md`, `CURSOR_HANDOFF.md`, and `.cursor/rules/project-context.mdc` when the documented current version changes

Generated manifests store `generatorVersion` from `MODULE_VERSION` at commit time.

## Automated GitHub releases

Each push to `main` (except commits tagged `[skip ci]`) runs `.github/workflows/release.yml`:

1. Runs `npm test`.
2. Packages `dist/foundry-procedural-generator.zip` and a release `module.json` with stable Foundry update URLs.
3. Creates a GitHub Release tagged with the current version (for example `0.1.107-pre`).
4. Auto-increments **hf#** on the current build and commits the next version with `[skip ci]` (for example `0.1.107-hf1-pre`).

### Foundry / Forge update detection

Release artifacts expose stable URLs that Foundry VTT uses for install and update checks:

- **Manifest:** `https://github.com/EmberWolf-Games/foundry-procedural-generator/releases/latest/download/module.json`
- **Download:** `https://github.com/EmberWolf-Games/foundry-procedural-generator/releases/latest/download/foundry-procedural-generator.zip`

Install from **Setup → Install Module → Manifest URL** using the manifest link above.

When migrating to a Forge VTT production server, keep the same version string scheme and point Forge package metadata at the equivalent release manifest/download URLs for that host.

### Troubleshooting manifest install

Foundry shows **No module manifest found** when either:

1. The GitHub repository is **private** (Foundry cannot authenticate).
2. No GitHub release is marked **Latest** (for example every release was flagged **Pre-release**).

See `docs/INSTALL.md` for verification commands and fixes.

### Manual version changes

- **Patch:** `node scripts/version.mjs bump-hotfix`
- **Meaningful feature on same minor line:** `node scripts/version.mjs bump-build` (clears hotfix suffix)
- **Explicit write:** `node scripts/version.mjs write "0.1.107-hf2-pre"`

Commit the new version before pushing a release. CI will release that version and then bump **hf#** for the next patch slot.
