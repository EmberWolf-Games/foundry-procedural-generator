# Module Versioning

Foundry Procedural Generator uses:

```text
M.m.b.p[.release]
```

**p** is always present logically. **release** is dot-separated (for example `.pre`), never hyphen-glued to **p**.

## Foundry update rules (read this first)

Foundry compares versions with `foundry.utils.isNewerVersion`, splitting on `.` and using `Number()` per segment. This drives all release numbering.

| Installed | Release | Foundry updates? |
|---|---|---|
| `0.1.107-pre` | `0.1.107.2-pre` | No — segment `2-pre` is non-numeric |
| `0.1.107-pre` | `0.1.108.0.pre` | No — `108` vs `107-pre` compares equal |
| `0.1.107-pre` | `0.1.108-pre` | **Yes** — `108-pre` > `107-pre` as strings |
| `0.1.108-pre` | `0.1.108.1.pre` | **Yes** — extra numeric segment |
| `0.1.108.1.pre` | `0.1.108.2.pre` | **Yes** |
| `0.1.108.1.pre` | `0.1.109.0.pre` | **Yes** |

### Practical workflow

1. **Migration release:** ship `0.1.108.1.pre` (updates from all tested legacy `0.1.107.x` strings).
2. **Patches:** `0.1.108.2.pre`, `0.1.108.3.pre`, … (CI bumps **p**).
3. **Next feature build:** `0.1.109.0.pre` (increment **b**, reset **p** to `0`).

## Fields

| Field | Range | Meaning |
|---|---|---|
| **M** | 0–999 | Major (0 until first public release) |
| **m** | 0–999 | Minor milestone line |
| **b** | 100–999 | Build — meaningful feature changes only |
| **p** | 0–999 | Patch — bugfixes on the same **b** |
| **release** | `pre`, `alpha`, `beta`, `rc` | Channel suffix as its own dot segment |

## Examples

```text
0.1.108-pre
```

Migration / feature build using Foundry's legacy 3-segment form (`b` + `-pre`).

```text
0.1.108.1.pre
```

Patch 1 on build 108 (preferred form after migration).

```text
0.1.109.0.pre
```

Next feature build after patch line.

## Bump rules

1. **Milestone complete:** increment **m**, reset **b** to `100`, **p** to `0`.
2. **Feature on same minor line:** increment **b**, reset **p** to `0** → `0.1.109.0.pre`.
3. **Patch:** increment **p** only → `0.1.108.(p+1).pre`.
4. CI auto-increments **p** after each release.

Run `node tests/version-compare.test.mjs` before publishing.

## Files to keep in sync

`src/constants.js`, `module.json`, `package.json`, `CHANGELOG.md`

## Manual commands

- `node scripts/version.mjs bump-patch`
- `node scripts/version.mjs bump-build`
- `node scripts/version.mjs write "0.1.108.1.pre"`

## Foundry manifest URL

`https://github.com/EmberWolf-Games/foundry-procedural-generator/releases/latest/download/module.json`
