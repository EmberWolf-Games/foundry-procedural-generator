# Data Model

All records include:

```json
{
  "id": "namespace.identifier",
  "schemaVersion": 1,
  "revision": 1,
  "name": "Human-readable name",
  "tags": []
}
```

IDs are stable and revisions increase when behavior-affecting content changes.

## 1. Biome definition

A biome describes environmental rules and weighted content pools, not a single map.

```json
{
  "id": "campaign.biome.crystal-cavern",
  "schemaVersion": 1,
  "revision": 3,
  "name": "Crystal Cavern",
  "tags": ["underground", "cavern", "crystal", "dark"],
  "generationProfileIds": [
    "campaign.profile.cavern-medium"
  ],
  "environment": {
    "backgroundColor": "#10131a",
    "darkness": 0.85,
    "weatherId": null,
    "ambientLightMode": "sparse",
    "soundscapeIds": ["campaign.sound.cavern-drips"]
  },
  "terrain": {
    "walkableTags": ["stone-floor"],
    "blockedTags": ["solid-rock", "deep-chasm"],
    "difficultTags": ["rubble", "shallow-water"]
  },
  "assetPools": {
    "largeTerrain": [
      {"assetId": "campaign.asset.stalagmite-large", "weight": 5},
      {"assetId": "campaign.asset.crystal-cluster-large", "weight": 2}
    ],
    "cover": [
      {"assetId": "campaign.asset.stalagmite-medium", "weight": 4}
    ],
    "dressing": [
      {"assetId": "campaign.asset.crystal-small", "weight": 6},
      {"assetId": "campaign.asset.bones", "weight": 1}
    ]
  },
  "constraints": {
    "waterFraction": [0.0, 0.2],
    "openAreaFraction": [0.35, 0.65],
    "maxElevationBands": 3
  }
}
```

## 2. Asset definition

An asset is a placeable or resolvable resource.

```json
{
  "id": "campaign.asset.stalagmite-large",
  "schemaVersion": 1,
  "revision": 2,
  "name": "Large Stalagmite",
  "kind": "tile",
  "tags": ["underground", "rock", "stalagmite", "large", "blocks-movement"],
  "source": {
    "texture": "modules/campaign-assets/tiles/stalagmite-large.webp",
    "documentUuid": null
  },
  "footprint": {
    "shape": "ellipse",
    "widthCells": 2,
    "heightCells": 2,
    "clearanceCells": 0.5,
    "anchor": "center"
  },
  "placement": {
    "allowedZoneTags": ["terrain", "cover"],
    "forbiddenZoneTags": ["entrance", "exit", "required-path"],
    "minDistanceFromEntranceCells": 2,
    "minDistanceFromSameAssetCells": 3,
    "rotation": {"mode": "random", "stepDegrees": 15},
    "scale": {"min": 0.85, "max": 1.15},
    "edgePreference": 0.4
  },
  "occlusion": {
    "blocksMovement": true,
    "blocksSight": true,
    "blocksLight": true,
    "blocksSound": false,
    "wallTemplate": "solid"
  },
  "render": {
    "z": 100,
    "overhead": false,
    "alpha": 1.0
  },
  "compatibility": {
    "systems": [],
    "requiredModules": []
  },
  "provenance": {
    "license": "campaign-owned",
    "author": null,
    "sourceUrl": null
  }
}
```

`kind` values may include `tile`, `actor`, `hazard`, `light`, `sound`, `wall-template`, `region-template`, `objective`, and `treasure`.

## 3. Encounter profile

An encounter profile defines the dramatic and tactical content to fit into a generated Scene.

```json
{
  "id": "campaign.encounter.crystal-ambush",
  "schemaVersion": 1,
  "revision": 4,
  "name": "Crystal Ambush",
  "tags": ["combat", "ambush", "crystal-cavern"],
  "biomeIds": ["campaign.biome.crystal-cavern"],
  "generationProfileIds": ["campaign.profile.cavern-medium"],
  "weight": 10,
  "eligibility": {
    "partyLevel": [3, 7],
    "timeTags": [],
    "requiredWorldTags": [],
    "forbiddenWorldTags": [],
    "time": {
      "dayparts": ["night", "dawn"],
      "seasons": ["Winter"],
      "weekdays": [],
      "hourRanges": [[0, 7]],
      "calendarIds": []
    }
  },
  "objectives": [
    {
      "id": "survive",
      "type": "defeat-or-escape",
      "requiredZoneTags": ["central", "exit"]
    }
  ],
  "participants": [
    {
      "actorUuid": "Compendium.campaign.creatures.Actor.example",
      "count": {"min": 3, "max": 5},
      "role": "ambusher",
      "spawnZoneTags": ["hidden-edge", "high-ground"],
      "disposition": -1,
      "hidden": true,
      "spacingCells": 1
    }
  ],
  "hazards": [
    {
      "assetId": "campaign.asset.unstable-crystal",
      "count": {"min": 1, "max": 2},
      "zoneTags": ["central", "flank"]
    }
  ],
  "treasure": {
    "mode": "optional",
    "assetPoolId": "campaign.pool.crystal-treasure",
    "zoneTags": ["dead-end", "defensible"]
  },
  "tacticalRequirements": {
    "minimumCoverPositions": 4,
    "minimumAmbushZones": 2,
    "minimumPlayerSpawnAreaCells": 12,
    "escapeRouteRequired": true
  },
  "resolution": {
    "cleanupPolicy": "ask",
    "returnControl": true
  }
}
```

## 4. Generation profile

A generation profile controls geometry, budgets, ambience, and validation.

```json
{
  "id": "campaign.profile.cavern-medium",
  "schemaVersion": 1,
  "revision": 5,
  "name": "Medium Cavern",
  "tags": ["cavern", "medium"],
  "scene": {
    "widthCells": 40,
    "heightCells": 30,
    "gridSizePixels": 100,
    "gridDistance": 5,
    "gridUnits": "ft",
    "padding": 0.05,
    "tokenVision": true
  },
  "layout": {
    "strategy": "cellular-cavern",
    "openFraction": [0.42, 0.58],
    "smoothingPasses": 4,
    "entranceCount": 1,
    "exitCount": 1,
    "minimumPathWidthCells": 2,
    "maximumRetries": 4
  },
  "zones": {
    "playerSpawnAreaCells": 16,
    "enemySpawnAreaCells": 20,
    "objectiveAreaCells": 6,
    "safeEntranceRadiusCells": 3
  },
  "placement": {
    "largeTerrainDensity": 0.04,
    "coverDensity": 0.08,
    "dressingDensity": 0.12,
    "minimumRequiredPathClearanceCells": 1
  },
  "walls": {
    "mode": "contour",
    "simplificationTolerancePixels": 12,
    "doors": {"minimum": 0, "maximum": 2}
  },
  "ambience": {
    "darkness": 0.8,
    "lightBudget": 12,
    "soundBudget": 8,
    "weatherId": null
  },
  "budgets": {
    "walls": 800,
    "tiles": 250,
    "tokens": 60,
    "lights": 30,
    "sounds": 20,
    "regions": 50,
    "totalEmbeddedDocuments": 1200
  },
  "validation": {
    "requireEntranceExitConnectivity": true,
    "requireAllObjectivesReachable": true,
    "requireAllTokensOnWalkableCells": true,
    "failOnMissingRequiredAsset": true
  }
}
```

## 5. Exploration Scene configuration

Stored under `flags.foundry-procedural-generator.exploration`.

```json
{
  "enabled": true,
  "partyTokenUuid": "Scene.sceneId.Token.tokenId",
  "encounterCheckProfileId": "campaign.check.default",
  "biomeMapId": "campaign.biome-map.megadungeon",
  "revisitPolicy": "never",
  "campaignSalt": "secret-or-stable-string",
  "overrides": {}
}
```

## 6. Cell state

```json
{
  "cellKey": "12,8",
  "status": "generated",
  "firstEnteredAt": "2026-07-30T22:00:00.000Z",
  "lastEnteredAt": "2026-07-30T22:00:00.000Z",
  "entryCount": 1,
  "checkSeed": "seed",
  "checkRoll": 0.1732,
  "encounterRecordId": "enc-uuid",
  "generatedSceneUuid": "Scene.sceneId"
}
```

## 7. Generation manifest

The manifest is the authoritative reproduction record.

```json
{
  "manifestVersion": 1,
  "generatorVersion": "0.1.0",
  "rootSeed": "string",
  "seedMaterial": {},
  "source": {
    "worldId": "world",
    "explorationSceneUuid": "Scene.id",
    "partyTokenUuid": "Scene.id.Token.id",
    "cellKey": "12,8"
  },
  "profiles": {
    "biome": {"id": "id", "revision": 1, "snapshot": {}},
    "encounter": {"id": "id", "revision": 1, "snapshot": {}},
    "generation": {"id": "id", "revision": 1, "snapshot": {}}
  },
  "planHash": "hash",
  "retryIndex": 0,
  "diagnostics": {
    "stageTimingsMs": {},
    "validation": [],
    "documentCounts": {}
  },
  "lifecycle": {
    "status": "complete",
    "createdAt": "ISO-8601",
    "completedAt": "ISO-8601",
    "cleanupPolicy": "ask"
  }
}
```


## 8. Integration context snapshot

```json
{
  "foundry": {"version": "13.351", "generation": 13},
  "system": {"id": "dnd5e", "version": "5.3.3"},
  "modules": {
    "midi-qol": {"active": true, "version": "13.0.64"},
    "monks-active-tiles": {"active": true, "version": "13.06"},
    "seasons-and-stars": {"active": true, "version": "0.26.0"}
  },
  "time": {
    "provider": "seasons-and-stars",
    "worldTime": 123456,
    "calendarId": "campaign-calendar",
    "date": {"year": 1492, "month": 10, "day": 3, "weekday": 2, "time": {"hour": 23, "minute": 10, "second": 0}},
    "season": {"name": "Autumn", "icon": "autumn"},
    "sunTimes": {"sunrise": 7, "sunset": 17},
    "daypart": "night"
  }
}
```

This snapshot is immutable history. Later calendar changes do not alter the replayed encounter.
