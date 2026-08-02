# Proposed Module Architecture

## 1. Architectural style

Use a **functional core / Foundry shell** architecture.

- The functional core receives validated plain data and a seeded RNG, then returns a `GenerationPlan`.
- The Foundry shell reads settings and Documents, resolves UUIDs, commits the plan, activates Scenes, and persists history.
- The core never calls `game`, `canvas`, `Hooks`, `Scene.create`, or `fromUuid`.
- Foundry adapters never decide procedural outcomes.

This boundary makes deterministic tests possible and limits API-version coupling.

## 2. Runtime authority

All connected clients receive Foundry hooks, so generation must be authoritative on exactly one client.

Proposed rule:

```text
authoritative = game.user.isGM
             && game.users.activeGM?.id === game.user.id
```

If no active GM exists, no persistent generation occurs. Non-authoritative clients may display notifications but do not mutate world Documents.

A generation lock keyed by `explorationSceneId + cellKey` prevents duplicate work caused by rapid updates or reconnects. The durable cell state transitions are:

```text
unseen -> checking -> no-encounter
                   -> generating -> generated
                                 -> failed
```

## 3. Major components

### Bootstrap

- Registers settings during `init`.
- Exposes a stable public module API during `ready`.
- Registers hook handlers.
- Initializes migrations and diagnostics.

### Exploration Monitor

- Handles `stopToken`.
- Filters by configured Scene and Token UUID.
- Converts the Token center to a square-grid cell.
- Checks durable cell state.
- Calls the Encounter Orchestrator.

### Encounter Orchestrator

- Acquires the generation lock.
- Derives or loads a root seed.
- Performs the encounter check.
- Resolves an encounter profile.
- Builds a generation request.
- Runs generation and validation.
- Commits the plan.
- Writes history and releases the lock.

### Seed and RNG Service

- Hashes seed strings into 32-bit state.
- Creates named streams:
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
- Supports deterministic retry streams such as `layout/retry/2`.
- Records stream labels and optionally draw counts in debug manifests.

### Catalog Repository

Loads and validates:

- biomes
- assets
- encounter profiles
- generation profiles
- scene overrides
- system-adapter mappings

Initial sources are module JSON and Scene flags. Later sources may include Compendium Documents and a catalog editor.

### Encounter Source Adapters

- **Structured catalog adapter:** canonical deterministic source.
- **RollTable snapshot adapter:** converts table result ranges/weights and UUID references into plain entries, then selects with the module RNG.
- **Native RollTable adapter:** optional non-deterministic compatibility mode only.

The canonical deterministic path must not rely on unseeded native dice evaluation.

### Generation Pipeline

Each stage is pure and emits diagnostics.

1. **Normalize context**
2. **Resolve profile inheritance**
3. **Create scene envelope**
4. **Place entrance/exit anchors**
5. **Generate traversable floor**
6. **Carve guaranteed paths**
7. **Build walls, doors, cliffs, and boundaries**
8. **Allocate tactical zones**
9. **Place large terrain**
10. **Place cover and small dressing**
11. **Place hazards/objectives/treasure**
12. **Place creature intents**
13. **Build ambience**
14. **Validate**
15. **Repair or deterministic retry**
16. **Emit `GenerationPlan`**

### Validators

- Bounds
- Required-zone connectivity
- Spawn clearance
- Asset overlap
- Wall segment validity
- Door reachability
- Token placement
- Document budgets
- UUID/file reference resolution
- Profile constraints

Connectivity should be tested over the logical navigation grid before Foundry Documents are created.

### Ecosystem Integration Layer

#### Foundry core version adapter

The manifest declares `minimum: 13.351` and omits `maximum`. Public v13 APIs are the baseline. Any generation-specific differences are isolated behind adapters selected from `game.release.generation`; procedural core code remains unchanged.

#### D&D 5e adapter

D&D 5e 5.3.3+ is the required runtime system. The adapter resolves Actor token data, Item/Active Effect structures, encounter threat metadata, and combatant creation. The core emits generic creature, hazard, and reward intents.

#### Midi QOL adapter

Midi QOL is not a hard dependency, but compatibility is mandatory. The adapter is intentionally narrow:

- feature detection and version reporting
- optional explicit `MidiQOL.completeItemUse` calls
- no monkey-patching of Item rolls or workflow classes
- no duplicate damage, targeting, concentration, reaction, or effect-expiry engine
- generated content uses ordinary D&D 5e documents that Midi already understands

#### Monk's Active Tile Triggers coexistence

Exploration encounters are not implemented as Tiles. The monitor owns only the `foundry-procedural-generator` namespace and listens to Foundry movement completion. A short per-Token debounce re-reads the final Token Document after MATT has had an opportunity to stop, redirect, or teleport it. Generated Tiles never receive MATT flags unless the GM separately authors such behavior.

#### Seasons & Stars adapter

The adapter prefers `game.seasonsStars.integration.api`, falls back to the direct documented API, and subscribes to `seasons-stars:ready` and `seasons-stars:dateChanged` only when needed. It snapshots:

- calendar and date
- hour, weekday, and season
- sunrise/sunset
- derived daypart
- Foundry world time

The snapshot is an input to eligibility, weighting, seed material, history, and replay.

### Foundry Scene Adapter

Commits a valid plan in phases:

1. Create Scene with navigation hidden.
2. Store an `inProgress` manifest flag.
3. Batch-create embedded Documents by type.
4. Store final manifest and counts.
5. Reveal/activate Scene according to policy.
6. On failure, mark failed and optionally delete the partial Scene.

Batches include `Wall`, `Tile`, `Drawing`, `Region`, `AmbientLight`, `AmbientSound`, `Token`, `Note`, and `MeasuredTemplate` as applicable.

### Persistence

- **Exploration Scene flags:** scene configuration and sparse per-cell state.
- **Generated Scene flags:** complete generation manifest and lifecycle state.
- **World settings:** defaults, schema version, catalog locations.
- **History repository:** prototype uses Scene flags; production should use one JournalEntry page per encounter or another partitioned strategy to avoid an ever-growing monolithic setting.

### UI and Debugging

Use `ApplicationV2` for:

- module dashboard
- generation preview
- profile/catalog editor
- history browser
- validation report
- seed replay
- cleanup manager

Debug overlays may use temporary Drawings/Regions but must be clearly tagged and removable.

## 4. Data flow

```text
stopToken
  -> ExplorationMonitor
  -> CellStateRepository
  -> EncounterOrchestrator
  -> SeedService
  -> EncounterSourceAdapter
  -> CatalogRepository
  -> GenerationPipeline
  -> Validators
  -> FoundrySceneAdapter
  -> HistoryRepository
  -> Scene activation / notification
```

## 5. Deterministic seed strategy

Recommended root material:

```text
schemaVersion
worldId
explorationSceneId
partyTokenId
cellKey
triggerOrdinal
encounterProfileId
generationProfileId
profileRevision
campaignSalt
```

Hash the canonical serialized form into a root seed. Store both the root seed and the canonical material.

Named stream seed:

```text
hash(rootSeed + "::" + streamLabel)
```

This isolates stages. Adding one extra terrain draw does not change creature selection.

## 6. Performance strategy

- Generate plain arrays before touching Foundry Documents.
- Enforce profile-level budgets.
- Batch `createEmbeddedDocuments` calls by type.
- Avoid repeatedly updating a Scene while generating.
- Avoid creating one Tile per floor cell; prefer a background, large floor Tiles, Drawings, or a limited tile atlas.
- Spatially index occupied rectangles/polygons for placement.
- Cache resolved UUID metadata and asset dimensions.
- Keep preview rendering separate from world persistence.
- Record stage timings and created Document counts.
- For very large algorithms, yield between stages; Web Worker support can be evaluated later for pure geometry.

## 7. System boundary

The core remains system-independent and uses generic intents, while the packaged module requires D&D 5e 5.3.3+:

```text
CreatureIntent {
  actorUuid,
  count,
  role,
  disposition,
  spawnZoneId,
  spacing,
  hidden
}
```

The Foundry adapter resolves `actorUuid` and obtains token data from the Actor. Optional system adapters may calculate threat, configure initiative, create rewards, or read system-specific movement sizes.

## 8. Failure handling

Every failure includes:

- stage
- seed
- source Scene/cell
- profile IDs and revisions
- retry index
- validation failures
- partial Scene UUID, if any
- cleanup result

The safe fallback is a simple rectangular room with an entrance, exit, clear path, and conservative Document count.
