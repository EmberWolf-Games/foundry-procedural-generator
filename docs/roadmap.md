# Milestone-Based Implementation Roadmap

## M0 — Foundation and decision lock

### Deliverables

- Requirements, architecture, data model, roadmap, and decision register
- Foundry 13.351+ module manifest with no hard maximum
- D&D 5e 5.3.3+ system relationship
- Integration compatibility report and adapter scaffolds
- Repository conventions
- Seed/RNG implementation and tests
- JSON Schemas for catalogs
- Foundry 13.351 and current newer-generation test worlds and fixture plan

### Exit criteria

- Campaign-critical decisions for M1 are answered.
- Module loads without errors in Foundry v13.
- Same seed produces identical RNG sequences in browser and test runner.

## M1 — Trigger-to-Scene vertical slice

### Deliverables

- Party Token and exploration Scene settings
- Debounced `stopToken` monitoring that coexists with MATT movement actions
- Square cell key calculation
- Active-GM authority guard
- Per-cell visited state
- Seeded percentage encounter check
- Deterministic rectangular prototype plan
- Scene creation and batched wall creation
- Generated Scene manifest flags
- Return and safe-delete console API
- Structured logging

### Exit criteria

- A new cell triggers once.
- A 100% check generates a valid Scene.
- The same seed yields the same plan.
- Revisit default prevents duplicate generation.
- Cleanup cannot delete an untagged Scene.

## M2 — Procedural layout engine

### Deliverables

- Logical navigation grid
- Room/corridor strategy
- Cellular cavern strategy
- Wilderness clearing strategy
- Entrance/exit selection
- Required-path carving
- Connectivity validator
- Deterministic repair/retry
- Safe fallback map
- Plan preview renderer

### Exit criteria

- Property tests show all required anchors reachable across a large seed sample.
- Invalid plans never reach the Foundry commit adapter.
- Retry count and failure reasons are visible.

## M3 — Asset catalog and terrain dressing

### Deliverables

- Biome and asset JSON Schemas
- Catalog loader and validator
- Texture and Document UUID resolver
- Footprint/clearance handling
- Spatial index
- Large terrain, cover, and dressing stages
- Wall/occlusion templates
- Missing-asset fallbacks
- Asset audit report

### Exit criteria

- Assets never block the guaranteed route.
- Document budgets are enforced.
- Broken references produce a readable report.

## M4 — Structured encounters and tactical placement

### Deliverables

- Encounter profile schema
- Deterministic weighted selection
- RollTable snapshot adapter
- Actor UUID resolution
- Generic creature intents
- D&D 5e 5.3.3+ Actor/Token adapter
- Midi QOL public-API bridge and workflow coexistence tests
- Spawn-zone allocation
- Tactical-role placement
- Collision and clearance validation
- Optional system-adapter interface

### Exit criteria

- Generic Actors can be placed without reading system-specific fields.
- Encounter composition and placement replay from a manifest.
- Missing required Actors cause a controlled fallback or abort.

## M5 — Environment, hazards, objectives, and rewards

### Deliverables

- Ambient lights and sounds
- Seasons & Stars eligibility and weighting
- Calendar/time context snapshots
- Weather/environment fields
- Regions and interactive features
- Hazard/objective/treasure adapters
- Elevation bands
- Doors, cliffs, water, difficult terrain
- Player transition policy
- Return controls in UI/chat

### Exit criteria

- Generated Scenes are tactically playable and narratively complete for at least two campaign biomes.
- Interactive content is tagged and cleanly removable.

## M6 — GM tools and debugging

### Deliverables

- ApplicationV2 dashboard
- Scene configuration UI
- Profile and catalog validation UI
- Seed replay and manifest import/export
- Stage timing and random-stream diagnostics
- Plan overlay
- History browser
- Regenerate/keep/archive/delete workflow
- Migration diagnostics

### Exit criteria

- A GM can diagnose a bad Scene without opening source code.
- Any stored encounter can be replayed from its manifest.
- Support bundles exclude sensitive data by default.

## M7 — Hardening and campaign release

### Deliverables

- Large-seed soak tests
- Multiplayer/multiple-GM tests
- Compatibility matrix: Foundry 13.351 plus each supported newer generation
- Matrix runs with Midi QOL, MATT, and Seasons & Stars enabled together
- Reload and interrupted-generation tests
- Performance budgets on representative hardware
- Data migrations
- Documentation and campaign authoring guide
- Packaging/release automation
- Versioned fixtures and changelog

### Exit criteria

- No duplicate encounters during multiplayer tests.
- Interrupted commits recover safely.
- Target campaign asset catalogs pass validation.
- Release candidate is verified on the exact Foundry v13 build used by the campaign.
