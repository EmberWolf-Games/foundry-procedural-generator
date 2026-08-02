import { MODULE_ID, SETTINGS } from "./constants.js";

export function registerSettings() {
  game.settings.register(MODULE_ID, SETTINGS.ENABLED, {
    name: "FPG.Settings.EnabledName",
    hint: "FPG.Settings.EnabledHint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

  game.settings.register(MODULE_ID, SETTINGS.PARTY_TOKEN_UUID, {
    name: "FPG.Settings.PartyTokenName",
    hint: "FPG.Settings.PartyTokenHint",
    scope: "world",
    config: true,
    type: String,
    default: ""
  });

  game.settings.register(MODULE_ID, SETTINGS.ENCOUNTER_CHANCE, {
    name: "FPG.Settings.EncounterChanceName",
    hint: "FPG.Settings.EncounterChanceHint",
    scope: "world",
    config: true,
    type: Number,
    range: { min: 0, max: 100, step: 1 },
    default: 20
  });

  game.settings.register(MODULE_ID, SETTINGS.PROTOTYPE_WIDTH_CELLS, {
    name: "FPG.Settings.PrototypeWidthName",
    hint: "FPG.Settings.PrototypeWidthHint",
    scope: "world",
    config: true,
    type: Number,
    range: { min: 12, max: 80, step: 1 },
    default: 30
  });

  game.settings.register(MODULE_ID, SETTINGS.PROTOTYPE_HEIGHT_CELLS, {
    name: "FPG.Settings.PrototypeHeightName",
    hint: "FPG.Settings.PrototypeHeightHint",
    scope: "world",
    config: true,
    type: Number,
    range: { min: 12, max: 80, step: 1 },
    default: 20
  });

  game.settings.register(MODULE_ID, SETTINGS.AUTO_ACTIVATE, {
    name: "FPG.Settings.AutoActivateName",
    hint: "FPG.Settings.AutoActivateHint",
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });

  game.settings.register(MODULE_ID, SETTINGS.DEBUG_LEVEL, {
    name: "FPG.Settings.DebugLevelName",
    scope: "client",
    config: true,
    type: String,
    choices: {
      error: "Error",
      warn: "Warning",
      info: "Info",
      debug: "Debug",
      trace: "Trace"
    },
    default: "info"
  });
}
