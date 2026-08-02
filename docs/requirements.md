# Requirements Specification

## 1. Purpose

Foundry Procedural Generator creates complete, playable encounter Scenes when a designated party Token enters a previously unprocessed cell on an exploration Scene. Each exploration square represents a campaign-scale area, while generated encounter Scenes use tactical-scale grids.

## 1.1 Supported platform baseline

- Foundry VTT 13.351 and newer, with no hard maximum in the manifest.
- D&D 5e 5.3.3 and newer.
- Compatibility targets: Midi QOL 13.0.57+, Monk's Active Tile Triggers 13.06+, and Seasons & Stars 0.26.0+.
- Each newly supported Foundry generation requires an explicit compatibility test pass before the manifest `verified` value is advanced.

## 2. Scope

### In scope

- Exploration Token monitoring
- Scene-specific encounter checks
- Deterministic encounter selection
- Seeded procedural generation
- Traversable layouts with guaranteed entrance-to-exit connectivity
- Foundry Scene and embedded Document creation
- Terrain, walls, doors, lights, sounds, Regions, Tiles, Tokens, hazards, objectives, and treasure
- Encounter history and reproducibility
- Return-to-exploration and cleanup controls
- GM-facing configuration, preview, validation, and debugging
- System-independent generation core with a required D&D 5e 5.3.3+ runtime adapter

### Out of scope for the first prototype

- Perfect support for every grid type
- Automated combat balance for every game system
- Procedural artwork synthesis
- Runtime dependency on private Foundry APIs
- Real-time generation by non-GM clients
- Full editor UI for every catalog type

## 3. Actors

- **Gamemaster:** configures exploration, catalogs, profiles, generation, cleanup, and debugging.
- **Player:** moves or observes the party Token and is transitioned to generated Scenes according to GM policy.
- **Module:** monitors movement, generates deterministic plans, validates them, commits Foundry Documents, and records history.
- **System adapter:** optionally translates generic creature and reward intents into system-specific Actor/Item data.

## 4. Functional requirements

### Exploration and triggering

- **FR-001** The GM can designate one or more exploration Scenes.
- **FR-002** The GM can designate a party Token by UUID.
- **FR-003** The module detects the Token's settled movement using Foundry v13 movement hooks.
- **FR-004** The module derives a stable cell key from the Token center and Scene grid.
- **FR-005** The module distinguishes newly entered, previously visited, skipped, failed, and completed cells.
- **FR-006** Revisit behavior is configurable: never recheck, recheck after cooldown, recheck after reset, or always recheck.
- **FR-007** Only one authoritative GM client may resolve a trigger.
- **FR-008** Scene-specific configuration can override world defaults.

### Encounter checking and selection

- **FR-010** Each eligible cell performs an encounter check using a configured chance or structured check profile.
- **FR-011** Encounter selection uses weighted structured entries.
- **FR-012** Foundry RollTables can be used as authoring sources through an adapter that snapshots result rows and selects deterministically.
- **FR-013** Encounter selection records the source table/profile version and resolved entry snapshot.
- **FR-014** Empty, invalid, or unavailable tables produce a controlled no-encounter or fallback result.

### Determinism

- **FR-020** Every generation has a stored root seed.
- **FR-021** The root seed can be supplied manually or derived from world, exploration Scene, cell, trigger ordinal, and profile version.
- **FR-022** Random choices use named substreams such as `layout`, `terrain`, `creatures`, and `loot`.
- **FR-023** Regeneration from the same manifest reproduces all deterministic choices.
- **FR-024** Changing unrelated generator stages does not reshuffle earlier stages when their named stream inputs are unchanged.
- **FR-025** External mutable inputs are snapshotted into the generation manifest.

### Layout and navigation

- **FR-030** The generator creates a bounded tactical Scene.
- **FR-031** Every Scene has at least one entrance zone and one exit zone.
- **FR-032** At least one traversable path connects every required entrance, exit, objective, and player spawn zone.
- **FR-033** Layout strategies are pluggable: rooms/corridors, caverns, wilderness clearings, ruins, water networks, and hybrids.
- **FR-034** The validator detects disconnected zones, blocked spawn points, invalid wall segments, out-of-bounds placements, and insufficient clearance.
- **FR-035** A failed plan is repaired, retried with a deterministic retry index, or replaced with a safe fallback map.

### Scene dressing and environment

- **FR-040** Assets are selected by biome tags, role, footprint, weight, placement rules, and compatibility.
- **FR-041** Placement avoids required paths and respects clearance, density, overlap, elevation, and edge constraints.
- **FR-042** The generator can create Tiles, Walls, doors, cliffs, Regions, lights, sounds, weather, and environmental settings.
- **FR-043** Asset budgets cap total Documents by type.
- **FR-044** Missing assets degrade gracefully to substitutes or omission.

### Integration requirements

- **FR-045** The module requires the `dnd5e` system and rejects unsupported system versions.
- **FR-046** Generated D&D 5e content uses standard system Documents and workflows so Midi QOL can automate combat normally.
- **FR-047** The module does not override Midi QOL workflow hooks or duplicate its damage, targeting, concentration, or effect-expiration responsibilities.
- **FR-048** Exploration triggering does not use Tile Documents or `flags.monks-active-tiles` and must remain independent of MATT actions.
- **FR-049** After a movement stop, the module re-resolves the Token after a short debounce so MATT stop, redirect, and teleport actions can settle.
- **FR-049A** Seasons & Stars supplies calendar, season, sunrise/sunset, and daypart context through documented, feature-detected APIs.
- **FR-049B** Encounter eligibility and chance profiles can filter or modify weights by calendar date, season, weekday, hour range, and daypart.
- **FR-049C** Time context is snapshotted into the encounter manifest and deterministic seed material.
- **FR-049D** All integrations degrade safely when the optional module is inactive; missing optional integrations do not corrupt exploration state.

### Encounter entities

- **FR-050** Encounter profiles define participants, tactical roles, spawn groups, objectives, hazards, treasure, and cover needs.
- **FR-051** Actor references use UUIDs and do not require a specific game system in the core.
- **FR-052** Tokens are placed only in valid spawn zones and avoid collisions.
- **FR-053** Tactical placement supports roles such as front-line, ranged, ambusher, controller, boss, escort, neutral, and hidden.
- **FR-054** Optional adapters provide system-specific threat calculation and reward creation.

### Persistence and lifecycle

- **FR-060** Generated Scenes carry module flags containing a manifest, seed, source cell, source Scene, generator version, and cleanup state.
- **FR-061** Exploration state records each processed cell and its outcome.
- **FR-062** The GM can return to the originating exploration Scene.
- **FR-063** The GM can keep, archive, regenerate, or delete a generated Scene.
- **FR-064** Cleanup never deletes non-module Scenes or Documents not tagged as generated by this module.
- **FR-065** Interrupted generation can be detected and safely resumed or rolled back.

### User interface and debugging

- **FR-070** A GM settings menu configures world defaults.
- **FR-071** Scene configuration provides scene-specific enablement and profile selection.
- **FR-072** A preview mode renders a generation plan without committing Documents.
- **FR-073** A debug panel shows seed, stage timings, random stream counters, selected assets, validation results, retries, and Document counts.
- **FR-074** The GM can export/import a manifest for reproducibility.
- **FR-075** Logging levels include error, warn, info, debug, and trace.
- **FR-076** A test command can generate a Scene from an explicit profile and seed.

## 5. Non-functional requirements

- **NFR-001 Determinism:** identical manifest + compatible module version produces identical plan output.
- **NFR-002 Performance:** normal generation should avoid frame-by-frame canvas mutation and use batched Document writes.
- **NFR-003 Responsiveness:** expensive pure generation work is stage-based and yields to the UI where necessary.
- **NFR-004 Maintainability:** Foundry-specific APIs remain inside adapters and lifecycle/bootstrap code.
- **NFR-005 Compatibility:** the v13 branch uses public v13 APIs and declares v13-only compatibility.
- **NFR-006 System boundary:** the core does not read arbitrary system-specific Actor fields; D&D 5e behavior is isolated in an adapter.
- **NFR-007 Data validation:** catalog and profile data is schema-validated before use.
- **NFR-008 Safety:** authoritative writes are GM-only and cleanup is flag-scoped.
- **NFR-009 Observability:** all generation attempts produce structured diagnostics.
- **NFR-010 Migration:** stored data includes schema and generator versions and supports migrations.
- **NFR-011 Testability:** pure RNG, geometry, selection, layout, and validation code can run outside Foundry.
- **NFR-012 Asset resilience:** broken UUIDs or missing files produce actionable diagnostics rather than uncaught failures.
- **NFR-013 Ecosystem coexistence:** the module owns only its namespaced hooks, flags, sockets, settings, and generated Documents.
- **NFR-014 Compatibility matrix:** release candidates are tested with Foundry 13.351 and each supported newer Foundry generation, D&D 5e 5.3.3+, and the supported integration-module lines.

## 6. Prototype acceptance criteria

The first functional prototype is accepted when:

1. Foundry v13 recognizes and enables the module.
2. A GM can configure an exploration Scene UUID and party Token UUID.
3. Moving the party Token into a new square triggers exactly one authoritative evaluation.
4. Re-entering that square does not trigger again under the default policy.
5. With a 100% chance, a generated Scene is created and tagged with its seed and source cell.
6. The Scene contains a rectangular wall boundary with entrance and exit gaps.
7. Running the generator manually with the same seed produces the same prototype plan.
8. The GM can return to the exploration Scene and delete the generated Scene safely.
9. Errors are logged with module-prefixed structured context.
