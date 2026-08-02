export const MODULE_ID = "foundry-procedural-generator";
export const MODULE_TITLE = "Foundry Procedural Generator";
export const MODULE_VERSION = "0.1.107-pre";

export const SETTINGS = Object.freeze({
  ENABLED: "enabled",
  PARTY_TOKEN_UUID: "partyTokenUuid",
  ENCOUNTER_CHANCE: "encounterChance",
  PROTOTYPE_WIDTH_CELLS: "prototypeWidthCells",
  PROTOTYPE_HEIGHT_CELLS: "prototypeHeightCells",
  AUTO_ACTIVATE: "autoActivate",
  DEBUG_LEVEL: "debugLevel"
});

export const FLAGS = Object.freeze({
  EXPLORATION: "exploration",
  EXPLORATION_STATE: "explorationState",
  GENERATED: "generated",
  MANIFEST: "manifest"
});

export const SUPPORTED = Object.freeze({
  FOUNDRY_MINIMUM: "13.351",
  FOUNDRY_VERIFIED: "13.351",
  DND5E_MINIMUM: "5.3.3",
  DND5E_VERIFIED: "5.3.3",
  MODULES: Object.freeze({
    MIDI_QOL: Object.freeze({ id: "midi-qol", minimum: "13.0.57" }),
    MONKS_ACTIVE_TILES: Object.freeze({ id: "monks-active-tiles", minimum: "13.06" }),
    SEASONS_AND_STARS: Object.freeze({ id: "seasons-and-stars", minimum: "0.26.0" })
  })
});

export const HOOKS = Object.freeze({
  CELL_ENTERED: `${MODULE_ID}:cellEntered`,
  ENCOUNTER_CHECK_RESOLVED: `${MODULE_ID}:encounterCheckResolved`,
  SCENE_GENERATED: `${MODULE_ID}:sceneGenerated`,
  GENERATION_FAILED: `${MODULE_ID}:generationFailed`
});
