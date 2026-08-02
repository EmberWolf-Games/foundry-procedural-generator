import { MODULE_ID, FLAGS, SETTINGS } from "../constants.js";
import { normalizeSceneExplorationConfig, readSceneExplorationConfig } from "../persistence/scene-exploration-config.js";

const TEMPLATE = `modules/${MODULE_ID}/templates/scene-exploration-config.hbs`;

function basicsTab(element) {
  return element.querySelector('[data-tab="basics"]')
    ?? element.querySelector(".tab[data-tab='basics']")
    ?? element.querySelector("section.tab.basics");
}

export async function injectSceneExplorationConfig(app, element) {
  if (!game.user.isGM || !app.document) return;

  const tab = basicsTab(element);
  if (!tab || tab.querySelector(".fpg-scene-exploration")) return;

  const config = readSceneExplorationConfig(app.document);
  const worldEncounterChance = Number(game.settings.get(MODULE_ID, SETTINGS.ENCOUNTER_CHANCE));
  const html = await renderTemplate(TEMPLATE, {
    moduleId: MODULE_ID,
    randomEncounters: config.randomEncounters,
    encounterChanceField: Number.isFinite(config.encounterChance) ? config.encounterChance : "",
    worldEncounterChance
  });

  tab.insertAdjacentHTML("beforeend", html);
}

export function registerSceneConfigHook() {
  Hooks.once("init", () => {
    loadTemplates([TEMPLATE]);
  });

  Hooks.on("renderSceneConfig", (app, element) => {
    injectSceneExplorationConfig(app, element).catch(onRenderError);
  });

  Hooks.on("renderApplicationV2", (app, element) => {
    if (app.document?.documentName !== "Scene") return;
    injectSceneExplorationConfig(app, element).catch(onRenderError);
  });

  function onRenderError(error) {
    console.error(`[${MODULE_ID}] Failed to render Scene exploration settings.`, error);
  }

  Hooks.on("preUpdateScene", (scene, update) => {
    const patch = update.flags?.[MODULE_ID]?.[FLAGS.EXPLORATION];
    if (!patch) return;
    update.flags[MODULE_ID][FLAGS.EXPLORATION] = normalizeSceneExplorationConfig(
      foundry.utils.mergeObject(readSceneExplorationConfig(scene), patch, { inplace: false })
    );
  });
}
