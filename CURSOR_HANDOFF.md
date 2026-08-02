# Cursor Handoff — Foundry Procedural Generator

**Canonical repository:** https://github.com/EmberWolf-Games/foundry-procedural-generator.git  
**Module ID:** `foundry-procedural-generator`  
**Current module version:** `0.1.100-pre` (see `docs/VERSIONING.md`)  
**Handoff date:** 2026-08-01

## 1. Read this first

This repository is an architecture-first Foundry VTT module prototype. It is not yet a campaign-ready procedural generator. The current code implements a narrow deterministic trigger-to-Scene vertical slice and integration scaffolding. The first responsibility after opening the repository in Cursor is to validate and harden that vertical slice in an actual Foundry environment—not to jump ahead to complex map generation.

Before editing code, read these files in order:

1. `CURSOR_HANDOFF.md`
2. `.cursor/rules/project-context.mdc`
3. `README.md`
4. `docs/requirements.md`
5. `docs/architecture.md`
6. `docs/data-model.md`
7. `docs/integrations.md`
8. `docs/roadmap.md`
9. `docs/campaign-decisions.md`
10. `CHANGELOG.md`

If documents conflict, use this priority order:

1. The owner's latest explicit instruction
2. `CURSOR_HANDOFF.md`
3. `.cursor/rules/project-context.mdc`
4. Requirements and integration contract
5. Architecture and data model
6. Roadmap and README
7. Existing implementation

Do not silently resolve a contradiction. Document it and ask the owner.

## 2. Product mission

Build a fully procedural encounter-generation module for Foundry VTT. A designated party Token moves through a massive exploration Scene where each square represents a 5-by-5-mile area. Entering a newly eligible square may trigger a scene-specific encounter check. On success, the module selects a structured encounter profile and generates a complete tactical encounter Scene.

The intended mature generator may create:

- Traversable terrain and floor layouts
- Guaranteed paths between entrances, exits, spawn zones, and objectives
- Walls, doors, cliffs, obstacles, line-of-sight boundaries, and Regions
- Biome-appropriate Tiles and environmental dressing
- Ambient light, darkness, sounds, weather, and environmental effects
- D&D 5e creatures placed according to tactical roles
- Hazards, cover, treasure, elevation, objectives, and interactive features
- Deterministic replay through stored seeds and input snapshots
- Encounter history, return-to-exploration controls, persistence, and safe cleanup
- GM-facing preview, validation, diagnostics, replay, and migration tools

## 3. Non-negotiable product constraints

### Platform baseline

- Foundry VTT minimum: `13.351`
- Newer Foundry generations are allowed by the manifest, but must not be described as verified until they pass the test matrix.
- Required game system: D&D 5e `5.3.3+`
- The procedural generation core should remain system-independent where practical.
- D&D 5e-specific behavior belongs behind adapters.

### Required compatibility targets

These modules are optional runtime dependencies but mandatory compatibility targets:

- Midi QOL `13.0.57+`
- Monk's Active Tile Triggers `13.06+`
- Seasons & Stars `0.26.0+`

Do not make the module unusable merely because one of these optional modules is disabled. Feature-detect each integration and degrade safely.

### Engineering priorities

1. Determinism and reproducibility
2. Guaranteed navigability and validation
3. Multiplayer-safe authoritative writes
4. Performance and bounded Foundry Document counts
5. Maintainability and public-API isolation
6. Strong diagnostics and replay tools
7. System independence in the procedural core
8. Graceful failure and safe cleanup

## 4. Authoritative technical sources

Foundry-specific implementation decisions must be based on the official Foundry documentation for the generation being supported:

- Module development guide: https://foundryvtt.com/article/module-development/
- Foundry API: https://foundryvtt.com/api/

Rules:

- Prefer public documented APIs.
- Do not use underscore-prefixed or private Foundry methods.
- Do not guess API signatures from memory.
- When supporting a newer Foundry generation, confirm API differences and isolate them in adapters.
- Treat source code from installed third-party modules as implementation evidence only when their public documentation is insufficient; do not couple to private internals without explicit owner approval.
- Record the exact Foundry, D&D 5e, and integration-module versions used for every compatibility test.

The historical project workspace is in Google Drive:

- https://drive.google.com/drive/folders/15etPfaNL7zK6b9TuCK6q4cBqHN066K1A

After migration, GitHub is the canonical source-code repository. The Drive folder is reference/archive storage unless the owner explicitly says otherwise.

## 5. Current repository state

### What currently exists

- Plain JavaScript ES modules; no transpiler or bundler
- Foundry module manifest at `module.json`
- World/client settings registration
- Exploration Scene UUID and party Token UUID configuration
- Foundry `stopToken` monitoring
- Per-Token 150 ms settle delay and authoritative Token re-read
- Active-GM authority guard
- Square-grid cell-key calculation from Token center
- Sparse per-cell state stored in Scene flags
- Deterministic seeded percentage encounter check
- Named RNG streams
- Seasons & Stars time-context snapshot included in seed material
- Deterministic rectangular prototype Scene plan
- Entrance and exit gaps in the boundary Walls
- Scene creation and batched embedded Wall creation
- Generated Scene manifest flags
- Safe return-to-exploration and generated-Scene deletion APIs
- Compatibility report scaffolding
- D&D 5e, Midi QOL, MATT, and Seasons & Stars adapters/scaffolds
- Module-owned lifecycle hooks
- JSON Schemas for biome, asset, encounter, and generation-profile data
- Node tests for RNG, prototype determinism, and daypart classification

### What does not yet exist

- No actual procedural room/cavern/wilderness layout engine
- No logical navigation grid or pathfinding validator
- No deterministic repair/retry pipeline
- No asset catalog loader or runtime JSON Schema validation
- No terrain, Tile, Region, light, sound, weather, or elevation generation
- No encounter-profile selection or deterministic RollTable snapshot adapter
- No creature composition or tactical Token placement
- No D&D 5e Actor/Item generation beyond adapter scaffolding
- No finished Midi QOL automation integration
- No GM dashboard, preview, history browser, or migration UI
- No automated Foundry integration tests
- No GitHub Actions workflow
- No release packaging pipeline
- No finalized public license; `LICENSE` is a placeholder and must remain so until the owner decides

### Validation status

The current Node tests are intended to pass with:

```bash
npm test
```

The module has not yet been certified in a real Foundry world. Any claim that M1 is complete must wait for in-Foundry validation.

## 6. Repository map

```text
.
├── .cursor/rules/                 Cursor project rules
├── CURSOR_HANDOFF.md              This document
├── README.md                      User/developer overview
├── CHANGELOG.md                   Version history
├── LICENSE                        Placeholder license
├── module.json                    Foundry package manifest
├── package.json                   Node test metadata
├── docs/
│   ├── requirements.md            Functional and non-functional requirements
│   ├── architecture.md            Functional-core/Foundry-shell design
│   ├── data-model.md              Canonical data model and manifests
│   ├── integrations.md            Compatibility ownership boundaries and matrix
│   ├── roadmap.md                 M0–M7 implementation sequence
│   ├── campaign-decisions.md      Resolved and unresolved owner decisions
│   └── VERSIONING.md              Module version scheme and bump rules
├── schemas/                       Initial JSON Schemas
├── src/
│   ├── main.js                    Foundry lifecycle bootstrap
│   ├── constants.js               IDs, settings, flags, versions, hook names
│   ├── settings.js                Foundry settings registration
│   ├── api.js                     Public module API
│   ├── log.js                     Structured console logging
│   ├── core/                      Foundry-independent deterministic utilities
│   ├── generation/                Pure prototype plan generation
│   ├── persistence/               Scene-flag state repository
│   ├── services/                  Movement monitoring and orchestration
│   ├── adapters/                  Foundry Document conversion/commit layer
│   └── integrations/              D&D 5e and optional module boundaries
├── tests/                         Node-based pure-unit tests
├── lang/                          Localization data
└── styles/                        Module styles
```

## 7. Architectural contract

Use a **functional core / Foundry shell** architecture.

### Functional core

The core:

- Accepts validated plain serializable data
- Uses explicitly supplied seeded RNG streams
- Produces a plain `GenerationPlan`
- Performs procedural decisions and validation
- Must not access `game`, `canvas`, `Hooks`, `Scene`, `fromUuid`, or other Foundry globals
- Must be testable under Node without mocking the entire Foundry runtime

### Foundry shell

The shell:

- Registers hooks and settings
- Reads Foundry Documents and flags
- Resolves UUIDs and assets
- Converts semantic plan values to Foundry constants
- Creates and updates Scenes and embedded Documents
- Persists manifests and history
- Activates Scenes and notifies users
- Handles version-specific API differences

Foundry adapters must not make procedural random decisions.

## 8. Current runtime flow

```text
Foundry stopToken hook
  -> per-Token 150 ms debounce
  -> re-read Token from parent Scene
  -> verify configured Scene and Token
  -> verify active-GM authority
  -> calculate square cell key
  -> check durable cell state and in-memory lock
  -> snapshot Seasons & Stars/world-time context
  -> derive deterministic seed material
  -> perform named-stream encounter check
  -> build pure prototype GenerationPlan
  -> validate plan
  -> create Scene
  -> batch-create Walls
  -> store final manifest and cell result
  -> optionally activate generated Scene
  -> emit module-owned lifecycle hook
```

Durable cell states currently follow:

```text
unseen -> checking -> no-encounter
                   -> generating -> generated
                                 -> failed
```

## 9. Public module surface

After Foundry's `ready` hook:

```js
const fpg = game.modules.get("foundry-procedural-generator").api;
```

Current public methods:

```js
fpg.getCompatibilityReport();
fpg.getEncounterTimeContext();
fpg.getMidiQolCapabilities();
await fpg.generatePrototype({ seed, cellKey, sourceSceneUuid, activate });
await fpg.returnToExploration();
await fpg.deleteGeneratedScene(sceneUuid);
```

Treat this API as provisional but avoid breaking it casually. Document intentional changes in `CHANGELOG.md`.

## 10. Settings, flags, and hooks

### Settings

Defined under namespace `foundry-procedural-generator`:

- `enabled`
- `explorationSceneUuid`
- `partyTokenUuid`
- `encounterChance`
- `prototypeWidthCells`
- `prototypeHeightCells`
- `autoActivate`
- `debugLevel`

### Flags

- `flags.foundry-procedural-generator.explorationState`
- `flags.foundry-procedural-generator.generated`
- `flags.foundry-procedural-generator.manifest`

Do not write project data under another module's namespace.

### Module-owned hooks

- `foundry-procedural-generator:cellEntered`
- `foundry-procedural-generator:encounterCheckResolved`
- `foundry-procedural-generator:sceneGenerated`
- `foundry-procedural-generator:generationFailed`

Hook payloads should remain plain context objects where practical.

## 11. Determinism contract

Every encounter must be reproducible from its stored manifest.

### Root seed material

The intended canonical seed material includes stable values such as:

- Schema version
- World ID
- Exploration Scene ID
- Party Token ID
- Cell key
- Trigger ordinal
- Encounter and generation profile IDs/revisions
- Campaign salt
- Calendar/date/daypart/season context when relevant

### Named streams

Use isolated named RNG streams, including:

- `check`
- `encounter`
- `layout`
- `zones`
- `terrain`
- `walls`
- `ambience`
- `creatures`
- `hazards`
- `loot`

Adding an unrelated random draw in one stage must not reshuffle other stages. Deterministic retries should use labels such as `layout/retry/2`.

### Snapshot mutable inputs

Store profile revisions and snapshots, resolved encounter entries, important time context, retry index, generator version, validation output, stage timings, and Document counts. A UUID alone is not enough to reproduce an encounter after content changes.

## 12. Integration ownership boundaries

### D&D 5e

- Required runtime system: `dnd5e` 5.3.3+
- Keep generic creature/encounter intents in the core.
- Resolve Actor UUIDs and system-specific token/item behavior in the D&D 5e adapter.
- Do not scatter `actor.system.*` assumptions through generators.

### Midi QOL

Midi owns attack, damage, saves, targeting, reactions, concentration, and Active Effect workflow automation.

Rules:

- Do not override D&D 5e `Item#use` or Midi workflow classes.
- Do not duplicate damage, saves, effects, or concentration handling.
- Generate standard D&D 5e Documents.
- Use the narrow adapter and feature-detected `MidiQOL.completeItemUse` only for explicit generated actions that require automation.
- Test generated content with Midi both enabled and disabled.

### Monk's Active Tile Triggers

MATT owns Tile-trigger automation. This module owns exploration-cell entry.

Rules:

- Never create, read as project state, or mutate `flags.monks-active-tiles`.
- Do not implement exploration checks as active Tile triggers.
- Keep the settled-movement debounce and authoritative Token re-read.
- Generated Tiles receive only this module's flags unless a GM deliberately authors a separate MATT interaction.
- Test ordinary movement, pass-through, stop, redirect, teleport, pause, and chained movement.

### Seasons & Stars

Seasons & Stars owns calendars and timekeeping. This module consumes read-only context.

Rules:

- Prefer `game.seasonsStars.integration.api`.
- Feature-detect a fallback to `game.seasonsStars.api`.
- Snapshot calendar/date/season/sunrise/sunset/daypart at encounter-check time.
- Do not advance campaign time without an explicit profile policy and GM authorization.
- Fall back to `game.time.worldTime` and mark calendar-specific values unavailable.

## 13. Safety and lifecycle rules

- Only the active GM may perform authoritative persistent generation.
- Use both a transient lock and durable state to prevent duplicate generation.
- Create a Scene hidden from navigation, mark its manifest `inProgress`, batch-create embedded Documents, then mark it complete and reveal it.
- On failure, retain enough state for diagnosis and safe cleanup.
- Cleanup may delete only Scenes/Documents explicitly tagged as generated by this module.
- Never delete the source exploration Scene.
- Do not create one Tile per logical floor cell; use bounded assets and profile budgets.
- Validate a plan before committing it to Foundry.

## 14. Immediate objective for Cursor

Complete and validate **M1 — Trigger-to-Scene vertical slice** before beginning M2.

### Recommended first branch

```bash
git checkout -b feat/m1-foundry-integration
```

### First-session task order

1. Clone and inspect the repository.
2. Run `npm test` and confirm the baseline.
3. Review the official Foundry v13.351 module and Scene/Token/Wall APIs.
4. Install or symlink the module into a dedicated Foundry v13.351+ development data directory.
5. Create a D&D 5e 5.3.3+ test world.
6. Confirm that `module.json` is accepted and the module enables without startup errors.
7. Verify the actual `stopToken` hook signature and behavior in the target Foundry build.
8. Verify `game.users.activeGM`, Token Document re-read, grid fields, Scene creation data, Wall fields, flags, and Scene activation against the public API.
9. Correct API-shape mismatches only at the Foundry shell/adapter boundary.
10. Test the configured exploration Scene and party Token flow at 0% and 100% encounter chances.
11. Verify that revisiting a processed cell does not create another Scene under the default policy.
12. Verify deterministic manual generation with the same seed.
13. Verify return-to-exploration and safe deletion refusal for untagged Scenes.
14. Test with Midi QOL, MATT, and Seasons & Stars individually and together when installable.
15. Add a repeatable manual integration-test checklist under `docs/`.
16. Add unit tests for any new pure logic.
17. Update `README.md`, `CHANGELOG.md`, and relevant design documents with observed behavior.
18. Do not begin M2 until all M1 exit criteria are evidenced.

### M1 exit criteria

- The module loads without errors in the target Foundry 13 test world.
- A configured party Token entering a new square triggers one authoritative evaluation.
- A 0% chance creates no Scene and persists `no-encounter`.
- A 100% chance creates one generated Scene.
- Re-entering the same square does not trigger another encounter by default.
- The same explicit seed produces the same plan.
- The generated Scene contains valid boundary Walls and entrance/exit gaps.
- The manifest records seed, source cell, source Scene, context snapshot, lifecycle state, and Document counts.
- Return-to-exploration works.
- Cleanup refuses to delete untagged Scenes.
- MATT movement actions do not cause duplicate encounters.
- Seasons & Stars context degrades safely when unavailable.
- Midi QOL being enabled does not disrupt scene generation or standard D&D 5e Documents.
- Findings and exact tested versions are documented.

## 15. Known implementation concerns to verify early

These are not confirmed defects, but they are areas Cursor must validate before extending the code:

- Foundry package-manifest relationship syntax across supported generations
- `stopToken` hook availability/signature and whether another movement hook is needed for newer generations
- Scene data fields such as `tokenVision`, `navigation`, grid shape, and dimensions in v13.351+
- Wall constant names and data fields in the exact target build
- Whether `Scene.activate()` has the desired effect for all users or only changes the active Scene state
- Concurrency behavior when active-GM status changes mid-generation
- Scene-flag update races caused by read-modify-write cell-state persistence
- Seed material currently uses a constant module ID as campaign salt; a private configurable campaign salt is still required
- `triggerOrdinal` is currently fixed at `1`
- Failed cells are not yet governed by an explicit retry policy
- The current exploration state is stored as one growing Scene flag and may need partitioning later
- The current API tracks the last generated Scene only in memory
- Integration adapters are capability scaffolds, not proof of full compatibility
- Schemas are not yet wired into runtime validation

Do not “fix” these by broad refactoring before reproducing and documenting actual behavior.

## 16. Owner decisions Cursor must not invent

Ask the owner before committing behavior for unresolved campaign choices, especially:

- Exact exploration Scene(s) and party Token strategy
- Whether to support hex or gridless exploration after square-grid M1
- Revisit, cooldown, reset, and failed-cell retry policies
- Stable private campaign salt and seed secrecy policy
- Player notification and Scene-transition behavior
- Scene retention, archive, and cleanup policy
- Biome taxonomy and biome blending
- Asset library location, licensing, visual style, footprints, and performance budgets
- Elevation and weather-module policy
- Actor source conventions: world Actors versus Compendium UUIDs
- Encounter balancing method
- Party-state inputs to encounter difficulty/chance
- Initiative and Combat creation policy
- Reward and loot integration
- Campaign-time advancement policy
- Public distribution license

Use the documented recommended defaults only for isolated prototypes, and label them as defaults rather than owner decisions.

## 17. Coding conventions

- Use plain modern JavaScript ES modules unless the owner approves a TypeScript/build migration.
- Keep functions small and responsibilities explicit.
- Prefer immutable/plain data transformations in the core.
- Do not hide nondeterministic calls in generators.
- Pass RNG streams explicitly or derive them from explicit labels.
- Do not access Foundry globals from `src/core/` or pure generator modules.
- Centralize IDs, settings, flags, versions, and hook names.
- Use structured logs with module-prefixed context.
- Feature-detect optional integrations.
- Add tests for pure logic and deterministic behavior.
- Update documentation with behavioral or architectural changes.
- Preserve stored-data schema and generator versions; add migrations rather than silently changing meanings.
- Avoid new dependencies without explaining their size, browser compatibility, license, and value.
- Never commit proprietary campaign assets or secrets.

## 18. Git and pull-request conventions

Recommended branches:

- `feat/<milestone-or-feature>`
- `fix/<short-description>`
- `docs/<short-description>`
- `chore/<short-description>`

Recommended commit style:

```text
feat(m1): validate stopToken exploration flow
fix(foundry): translate wall data for v13.351
 test(core): add deterministic cell-key cases
 docs(integrations): record MATT teleport results
```

Every substantial PR should include:

- What changed
- Why it changed
- Foundry/system/module versions tested
- Automated test results
- Manual Foundry test steps and results
- Determinism impact
- Persistence/migration impact
- Known limitations
- Relevant screenshots or exported manifests when useful

## 19. Local bootstrap

```bash
git clone https://github.com/EmberWolf-Games/foundry-procedural-generator.git
cd foundry-procedural-generator
npm test
```

For Foundry development, copy or symlink the repository into:

```text
{Foundry user data}/Data/modules/foundry-procedural-generator
```

Use a dedicated test world, not the live campaign world.

No build step is currently required. Foundry loads `src/main.js` directly from `module.json`.

## 20. First report expected from Cursor

Before making large changes, Cursor should produce a concise repository assessment containing:

1. Baseline test result
2. Confirmed repository structure
3. Exact Foundry and D&D 5e test versions available
4. Suspected API mismatches, each linked to official documentation
5. Proposed M1 integration-test plan
6. Smallest safe first code change
7. Owner decisions that block the work, if any

The first implementation PR should remain tightly scoped to M1 validation and hardening.

## 21. Initial Cursor prompt

Use this after opening the cloned repository in Cursor:

> Read `CURSOR_HANDOFF.md`, `.cursor/rules/project-context.mdc`, and every file in `docs/` before editing. Then inspect the complete repository and run the existing tests. Give me a factual baseline assessment of what is implemented versus scaffolded, identify likely Foundry v13.351 API-integration risks using official Foundry documentation, and propose the smallest ordered plan to complete and prove M1. Do not begin M2, do not invent unresolved campaign decisions, and do not refactor the functional-core/Foundry-shell boundary without explaining why.
