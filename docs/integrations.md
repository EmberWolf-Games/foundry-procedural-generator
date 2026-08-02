# Compatibility and Integration Contract

## Support policy

The module targets Foundry VTT 13.351 and newer. The manifest omits `maximum`, which permits installation on newer Foundry generations, but “supported” means the exact generation has passed the project test matrix. The `verified` field advances only after that test pass.

D&D 5e 5.3.3 or newer is required. This minimum also establishes Foundry 13.351 as the effective core minimum.

## Compatibility matrix baseline

| Component | Minimum integration line | Current reference line (2026-07-30) | Policy |
|---|---:|---:|---|
| Foundry VTT | 13.351 | 13.351 and 14.357 test targets | Required |
| D&D 5e | 5.3.3 | 5.3.3 | Required system |
| Midi QOL | 13.0.57 | 13.0.64 on Foundry 13; 14.0.11 on Foundry 14 | Supported optional module |
| Monk's Active Tile Triggers | 13.06 | 13.06 on Foundry 13; 14.01 on Foundry 14 | Supported optional module |
| Seasons & Stars | 0.26.0 | 0.26.0, officially listed for Foundry 13 | Supported optional module when installable/active |

A release must not claim the full Foundry 14 ecosystem matrix until Seasons & Stars publishes and passes a Foundry 14-compatible release. The generator itself should still run on Foundry 14 without Seasons & Stars by degrading to Foundry world time with `daypart: unknown`.

## Midi QOL

### Ownership boundary

Midi QOL owns attack, damage, saving throw, targeting, concentration, reaction, and Active Effect workflow automation. This module owns encounter composition, tactical placement, Scene creation, and optional initiation of explicit encounter actions.

### Rules

- Do not override `Item#use`, Midi workflow classes, or Midi hooks.
- Do not duplicate damage application or concentration handling.
- Create standard D&D 5e Actors, Items, Tokens, Combatants, and Active Effects.
- Use `MidiQOL.completeItemUse` only for explicit generated actions that need automated resolution.
- Feature-detect APIs and log a capability report.
- Test generated hazards and creature actions with Midi automation both enabled and disabled.

## Monk's Active Tile Triggers

### Ownership boundary

MATT owns Tile-trigger automation. This module owns exploration-cell entry and generated-encounter lifecycle.

### Rules

- Never store data under `flags.monks-active-tiles`.
- Never infer exploration state from a Tile trigger.
- Use Foundry's settled movement hook and a short per-Token debounce.
- Re-read the Token Document after the delay instead of trusting stale hook coordinates.
- A MATT teleport to a new exploration cell may legitimately produce a new Foundry stop event; normal cell-state locking prevents duplicates.
- Generated Tiles carry only this module's flags unless a GM deliberately authors a separate MATT Tile.
- Integration tests cover enter, pass-through, stop-token, teleport, pause, and chained movement actions.

## Seasons & Stars

### Ownership boundary

Seasons & Stars owns calendar and timekeeping. This module consumes read-only time context for encounter eligibility, weights, ambience, and deterministic history.

### Rules

- Prefer `game.seasonsStars.integration.api`.
- Fall back to `game.seasonsStars.api` by feature detection.
- Listen to documented `seasons-stars:ready`, `seasons-stars:dateChanged`, and `seasons-stars:calendarChanged` hooks only where useful.
- Do not advance campaign time unless an encounter profile explicitly requests it and the GM authorizes that policy.
- Snapshot calendar context at encounter check time.
- Derive `night`, `dawn`, `day`, or `dusk` from current hour and sunrise/sunset.
- When unavailable, preserve Foundry `game.time.worldTime` and mark calendar-derived fields unavailable.

## Test matrix scenarios

1. All three modules disabled except required D&D 5e.
2. Midi QOL only.
3. MATT only, including teleport and stop-token actions.
4. Seasons & Stars only, across daypart and season changes.
5. Midi QOL + MATT.
6. Midi QOL + Seasons & Stars.
7. MATT + Seasons & Stars.
8. All three active together.
9. Multiple active GMs and reconnects.
10. Foundry 13.351 and every newer Foundry generation claimed as supported.

## Module-owned hook namespace

The module emits only namespaced lifecycle hooks and does not impersonate Tile triggers:

```text
foundry-procedural-generator:cellEntered
foundry-procedural-generator:encounterCheckResolved
foundry-procedural-generator:sceneGenerated
foundry-procedural-generator:generationFailed
```

These hooks carry plain context objects for future extensions. They do not call MATT and are not stored in MATT flags.
