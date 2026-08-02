# Module Versioning

Foundry Procedural Generator uses a structured version string:

```text
M.m.b.p[-release]
```

## Fields

| Field | Range | Meaning |
|---|---|---|
| **M** (major) | 0–999 | Stays `0` until the first full public release (`1.x.x.x`). Increments only for full release milestones. |
| **m** (minor) | 0–999 | Starts at `1` during pre-release. Increments with each major feature milestone (for example M1 → `0.1.x.x`, M2 → `0.2.x.x`). Resets to `0` after the first full release, then resets again on each major increment. |
| **b** (build) | 100–999 | Starts at `100` for each minor line. Increments only for **meaningful feature changes**. Resets to `100` when **m** increments. |
| **p** (patch) | 0–999 | Always present. Defaults to `0` for feature builds. Increments by `1` for each bugfix/patch on the same **b**. |
| **release** | `pre`, `alpha`, `beta`, `rc` | Pre-release channel suffix. Omitted after full release (`M >= 1` and channel complete). |

## Examples

```text
0.1.107.0-pre
```

Feature build `107` on minor line `1` (no patches yet).

```text
0.1.107.2-pre
```

Patch release 2 on build `107` (bugfix only; **b** unchanged).

```text
0.1.108.0-pre
```

Next meaningful feature update (build incremented; patch reset to `0`).

```text
1.0.361.0
```

Full release. No channel suffix.

## Bump rules (summary)

1. **Minor feature milestone complete** (for example M1 proven, starting M2 work): increment **m**, reset **b** to `100`, reset **p** to `0`, keep **release** until channel promotion.
2. **Meaningful feature update** within a milestone line: increment **b**, reset **p** to `0`.
3. **Patch / bugfix** on a shipped build: keep **M**, **m**, and **b** unchanged; increment **p** by `1`.
4. **Channel promotion**: change `-release` (`pre` → `alpha` → `beta` → `rc`); omit after full release.
5. **Full release**: set **M** to `1`, reset **m** to `0`, set **b** / **p** as needed; omit `-release`.

**Owner rule:** CI auto-increments **p** after each release. Manual **b** bumps happen only when landing meaningful feature work.

## Foundry update detection

Foundry uses `foundry.utils.isNewerVersion`, which compares dot-separated numeric segments. The four-part scheme makes patches sort correctly:

- `0.1.107.1-pre` is newer than `0.1.107.0-pre` and legacy `0.1.107-pre`
- `0.1.108.0-pre` is newer than `0.1.107.2-pre`

Run `node tests/version-compare.test.mjs` when unsure whether a version sorts newer than an installed manifest.

## Legacy format

Older releases used `M.m.b[-hf#][-release]` (for example `0.1.107-hf1-pre`). The version script still parses those strings for migration, but all new releases must use `M.m.b.p[-release]`.

| Legacy | New |
|---|---|
| `0.1.107-pre` | `0.1.107.0-pre` |
| `0.1.107-hf1-pre` | `0.1.107.1-pre` |
| `0.1.107-hf2-pre` | `0.1.107.2-pre` |

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
3. Creates a GitHub Release tagged with the current version (for example `0.1.107.2-pre`).
4. Auto-increments **p** on the current build and commits the next version with `[skip ci]` (for example `0.1.107.3-pre`).

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

- **Patch:** `node scripts/version.mjs bump-patch`
- **Meaningful feature on same minor line:** `node scripts/version.mjs bump-build` (resets **p** to `0`)
- **Explicit write:** `node scripts/version.mjs write "0.1.107.3-pre"`

Commit the new version before pushing a release. CI will release that version and then bump **p** for the next patch slot.
