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
| **b** (build) | 100–999 | Starts at `100` for each minor line. Increments by `1` for each minor feature update within that minor line. Resets to `100` when **m** increments. |
| **hf#** (hotfix) | 1–999 | Omitted by default. Present only when a hotfix ships for a specific build. Starts at `1` and increments per hotfix for that build. |
| **release** | `pre`, `alpha`, `beta`, `rc` | Pre-release channel suffix. Omitted after full release (`M >= 1` and channel complete). |

## Examples

```text
0.1.231-hf3-pre
```

Major `0`, minor `1`, build `231`, hotfix `3`, pre-alpha channel.

```text
1.0.361
```

Full release major `1`, minor `0`, build `361`. No hotfix suffix (none shipped yet). No release suffix (post–full-release format).

## Current line

| Version | Meaning |
|---|---|
| `0.1.100-pre` | Pre-alpha M1 baseline: minor line `1` (trigger-to-Scene vertical slice), build `100` (first build on that line), pre-alpha channel. |

## Bump rules (summary)

1. **Minor feature milestone complete** (for example M1 proven, starting M2 work): increment **m**, reset **b** to `100`, keep **release** until channel promotion.
2. **Minor feature update** within a milestone line: increment **b** only.
3. **Hotfix** for a shipped build: append or increment `-hf#` on that build; do not increment **b** unless the hotfix is folded into the next build.
4. **Channel promotion**: change `-release` (`pre` → `alpha` → `beta` → `rc`); omit after full release.
5. **Full release**: set **M** to `1`, reset **m** to `0`, continue incrementing **b** from `100`; omit `-release`.

During the M1 `0.1.102` line, patch releases use hotfix suffixes (`0.1.102-hf1-pre`, `0.1.102-hf2-pre`, …). CI bumps `-hf#` after each release until the next minor feature build.

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
3. Creates a GitHub Release tagged with the current version (for example `0.1.100-pre`).
4. Auto-increments the **hotfix** number on the current build and commits the next version with `[skip ci]`.

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

Use `node scripts/version.mjs bump-build` for a local build bump, `node scripts/version.mjs bump-hotfix` for a hotfix bump, or edit `src/constants.js`, `module.json`, and `package.json` together for minor, hotfix, or channel changes. Commit the new version before pushing; CI will release that version and then bump the hotfix for the next cycle.
