# Foundry Procedural Generator

> **Cursor onboarding:** Start with [`CURSOR_HANDOFF.md`](CURSOR_HANDOFF.md). Persistent project rules are in [`.cursor/rules/project-context.mdc`](.cursor/rules/project-context.mdc).

A Foundry Virtual Tabletop v13 module for deterministic, fully procedural encounter generation triggered by exploration-grid movement.

## Current status

This repository is an architecture-first functional prototype. The first vertical slice is intentionally narrow:

1. A GM configures an exploration Scene UUID and designated party Token UUID.
2. Foundry v13's `stopToken` hook detects the token's settled position.
3. A square-grid cell key is calculated from the token center.
4. The active GM records the cell as visited and performs a deterministic encounter check.
5. On success, the module generates a reproducible prototype encounter Scene with entrance and exit openings, walls, scene flags, and a stored generation manifest.
6. The exploration Scene UUID is preserved so the GM can return and clean up generated Scenes.

The layout/generation core remains system-independent, but the distributable module now targets D&D 5e 5.3.3+. Actor, Item, effect, and combat behavior are isolated behind a D&D 5e adapter so Midi QOL can operate on standard system workflows.

## Target

- Foundry VTT target: **13.351 and newer**; no hard maximum is declared, and `verified` remains unset until in-Foundry matrix testing
- D&D 5e system: **5.3.3 and newer**
- API baseline: Foundry v13 public API, isolated behind version-aware adapters
- Integration targets: Midi QOL, Monk's Active Tile Triggers, Seasons & Stars
- Module ID: `foundry-procedural-generator`
- Working version: see `module.json` (format `M.m.b.p[.release]` in `docs/VERSIONING.md`)

## Install for development

Copy or symlink this folder into:

```text
{userData}/Data/modules/foundry-procedural-generator
```

Enable the module in a test world running Foundry VTT v13.

## Install from GitHub (manifest URL)

```text
https://github.com/EmberWolf-Games/foundry-procedural-generator/releases/latest/download/module.json
```

The repository must be **public** so Foundry can fetch release assets without login. See `docs/INSTALL.md` if you see a manifest-not-found error.

## Prototype setup

### World settings (Configure Settings → Module Settings)

- **Party Token UUID** — the Token that triggers encounter checks on flagged Scenes
- **Default encounter chance** (0–100) — used unless a Scene overrides it
- **Prototype Width/Height**
- **Auto-activate Generated Scene**

### Scene settings (Scene Configuration → Basics tab)

Open any Scene's configuration sheet and use the **Random Encounters** section:

- **Random encounters enabled** — flag this Scene for movement-based encounter checks
- **Encounter chance override** — optional per-Scene percentage (blank uses the world default)

Multiple Scenes in the same session can each be flagged independently. Only the active Scene's flag is evaluated when the party Token stops moving.


## Integration contract

### Midi QOL

- Supported from the Foundry v13 Midi line (`13.0.57+`) and corresponding newer major lines.
- Generated Actors, Tokens, Items, Active Effects, and combatants use standard D&D 5e Documents.
- The module does not override Item use, targeting, damage, concentration, workflow hooks, or effect expiration.
- Explicit automated Item execution must go through the narrow Midi adapter and its public `completeItemUse` API.

### Monk's Active Tile Triggers

- Supported from MATT `13.06+` and corresponding newer major lines.
- Exploration checks never use Tile trigger flags and never create or mutate `flags.monks-active-tiles`.
- The module listens to Foundry's `stopToken` event, waits briefly for movement-side effects such as MATT stop/redirect/teleport actions, then re-reads the Token's final position.
- Generated Tiles carry only `flags.foundry-procedural-generator` unless the GM explicitly authors a separate MATT interaction.

### Seasons & Stars

- Supported from `0.26.0+` when active.
- The documented integration API is preferred, with direct API feature detection as fallback.
- Encounter context snapshots may include calendar ID, date, season, sunrise/sunset, daypart, and Foundry world time.
- Time context becomes part of the stored seed material and manifest so time-sensitive encounter selection remains reproducible.

See `docs/integrations.md` for the full compatibility and test policy.

### Module-owned hooks

All extension events are uniquely namespaced:

```text
foundry-procedural-generator:cellEntered
foundry-procedural-generator:encounterCheckResolved
foundry-procedural-generator:sceneGenerated
foundry-procedural-generator:generationFailed
```


## Console API

After `ready`, the module exposes:

```js
game.modules.get("foundry-procedural-generator").api
```

Useful calls:

```js
await game.modules.get("foundry-procedural-generator").api.generatePrototype({
  seed: "manual-test-001",
  cellKey: "12,8"
});

await game.modules.get("foundry-procedural-generator").api.returnToExploration();
await game.modules.get("foundry-procedural-generator").api.deleteGeneratedScene();
```

## Design principles

- Seed every generated encounter and store the seed.
- Derive named random streams so adding decoration does not reshuffle layout.
- Separate pure generation logic from Foundry Document writes.
- Validate connectivity before creating a Scene.
- Batch embedded-document creation by type.
- Restrict authoritative generation to one active GM.
- Store sufficient input snapshots to reproduce old encounters after catalogs change.
- Prefer public Foundry v13 APIs and avoid underscore-prefixed/private methods.

See `docs/` for the requirements, architecture, data model, roadmap, and campaign decisions.
