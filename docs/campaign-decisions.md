# Campaign-Specific Decisions

## Resolved platform and integration parameters

| Parameter | Decision |
|---|---|
| Foundry VTT | 13.351 and newer; no hard maximum; verify each new Foundry generation before claiming it tested |
| Game system | D&D 5e 5.3.3 and newer |
| Midi QOL | Mandatory compatibility target; optional runtime dependency; use standard D&D 5e workflows and narrow public-API integration |
| Monk's Active Tile Triggers | Mandatory coexistence target; never use or mutate MATT trigger flags; debounce and re-read final Token position |
| Seasons & Stars | Mandatory integration target when active; use its documented API for calendar, season, sunrise/sunset, and daypart context |
| Core design | System-independent procedural core with D&D 5e and module adapters |

## Must resolve before M1 coding is considered complete

| Decision | Why it matters | Recommended prototype default |
|---|---|---|
| Exploration Scene UUID(s) | Limits where movement monitoring is active | One Scene |
| Party Token UUID | Prevents every Token from triggering checks | One unlinked or linked Token |
| Square/hex/gridless support | Changes cell-key math | Square only |
| Revisit policy | Controls repeat encounters | Never recheck |
| Encounter chance | Defines vertical-slice behavior | Configurable percentage |
| Trigger timing | Movement end vs every waypoint | Movement stopped |
| GM authority | Prevents duplicate writes | `activeGM` only |
| Generated Scene size and tactical scale | Required to create a Scene | 30×20 cells, 100 px, 5 ft |
| Scene transition behavior | Determines player disruption | Auto-activate off initially |
| Cleanup behavior | Prevents accidental data loss | Ask/manual; tagged Scenes only |
| Campaign salt/seed policy | Determines replay and spoiler resistance | Stable private campaign salt |
| Failure fallback | Keeps play moving | Simple rectangular encounter Scene |

## Resolve before M3 asset work

| Decision | Questions |
|---|---|
| Biome taxonomy | Which biomes exist, and can one exploration cell blend multiple biomes? |
| Asset library location | Module assets, world upload directory, external module, or Compendium? |
| Asset licensing | Which files may be packaged, redistributed, or only referenced locally? |
| Asset footprint standard | How are pixel dimensions translated to tactical cells and clearance? |
| Visual style | Top-down realism, painterly, parchment, modular dungeon tiles, or mixed? |
| Occlusion policy | Which assets create walls, terrain Regions, or only visual Tiles? |
| Elevation model | Native v13 elevation only, Levels-compatible, or 2D initially? |
| Weather/effects | Core weather fields, another module integration, or none? |
| Performance target | Maximum Walls, Tiles, Tokens, lights, sounds, and total Documents per Scene? |

## Resolve before M4 creature placement

| Decision | Questions |
|---|---|
| Game system | **Resolved:** D&D 5e 5.3.3+ |
| Actor source | World Actors or Compendium UUIDs? |
| Encounter balance | Fixed profiles, CR/XP budgets, party-level formulas, or hand-authored bands? |
| Party state | Should current party size, level, resources, time, or noise affect encounters? |
| Token size/movement | How should large creatures, flying, burrowing, swimming, and squeezing work? |
| Neutral/faction behavior | Can encounters contain allies, neutrals, competing groups, or scripted waves? |
| Initiative | Auto-create Combat and add combatants, or leave to the GM? |
| Rewards | Generic treasure objective, system Items, or external loot modules? |

## Resolve before campaign launch

- How players are notified before Scene transition.
- Whether all users are pulled to the generated Scene.
- Whether explored-cell state is visible to players.
- How campaign time advances per exploration move.
- Whether encounter probability changes by terrain, pace, light, weather, noise, or prior events.
- Whether skipped encounters are consumed or remain eligible.
- Whether a cell can hold a persistent keyed location instead of a random encounter.
- Whether generated Scenes persist forever, are archived after play, or are deleted.
- Maximum storage and backup expectations.
- Required integrations with other Foundry modules.
- Accessibility expectations for darkness, flashing effects, weather, and audio.
- Naming conventions for Scenes, folders, catalogs, and generated history.
- Public distribution plans and final software/content license.
