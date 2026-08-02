import { MODULE_ID, SETTINGS } from "./constants.js";

export function registerSettings() {
  game.settings.register(MODULE_ID, SETTINGS.ENABLED, {
    name: "Enable exploration triggers",
    hint: "Allow the designated party Token to trigger encounter checks.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

  game.settings.register(MODULE_ID, SETTINGS.EXPLORATION_SCENE_UUID, {
    name: "Exploration Scene UUID",
    hint: "Example: Scene.abc123",
    scope: "world",
    config: true,
    type: String,
    default: ""
  });

  game.settings.register(MODULE_ID, SETTINGS.PARTY_TOKEN_UUID, {
    name: "Party Token UUID",
    hint: "Example: Scene.abc123.Token.def456",
    scope: "world",
    config: true,
    type: String,
    default: ""
  });

  game.settings.register(MODULE_ID, SETTINGS.ENCOUNTER_CHANCE, {
    name: "Encounter chance",
    hint: "Percentage chance for each newly entered exploration square.",
    scope: "world",
    config: true,
    type: Number,
    range: { min: 0, max: 100, step: 1 },
    default: 20
  });

  game.settings.register(MODULE_ID, SETTINGS.PROTOTYPE_WIDTH_CELLS, {
    name: "Prototype width",
    hint: "Generated Scene width in tactical grid cells.",
    scope: "world",
    config: true,
    type: Number,
    range: { min: 12, max: 80, step: 1 },
    default: 30
  });

  game.settings.register(MODULE_ID, SETTINGS.PROTOTYPE_HEIGHT_CELLS, {
    name: "Prototype height",
    hint: "Generated Scene height in tactical grid cells.",
    scope: "world",
    config: true,
    type: Number,
    range: { min: 12, max: 80, step: 1 },
    default: 20
  });

  game.settings.register(MODULE_ID, SETTINGS.AUTO_ACTIVATE, {
    name: "Auto-activate generated Scene",
    hint: "Activate the encounter Scene immediately after generation.",
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });

  game.settings.register(MODULE_ID, SETTINGS.DEBUG_LEVEL, {
    name: "Log level",
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
