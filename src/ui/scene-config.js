import { MODULE_ID, FLAGS, SETTINGS } from "../constants.js";
import { normalizeSceneExplorationConfig, readSceneExplorationConfig } from "../persistence/scene-exploration-config.js";

const TEMPLATE = `modules/${MODULE_ID}/templates/scene-exploration-config.hbs`;
const TAB_ID = "fpg-encounters";
const TAB_GROUP = "sheet";

function resolveElement(element) {
  if (!element) return null;
  if (typeof jQuery !== "undefined" && element instanceof jQuery) return element[0];
  return element;
}

export function isSceneConfigApp(app) {
  const SceneConfig = globalThis.foundry?.applications?.sheets?.SceneConfig;
  if (SceneConfig && app instanceof SceneConfig) return true;
  return app?.document?.documentName === "Scene"
    && app?.options?.classes?.includes?.("scene-config");
}

export function sceneConfigRoot(app, element) {
  return resolveElement(element) ?? app?.element ?? null;
}

export function findTabNav(root) {
  if (!root?.querySelector) return null;
  return root.querySelector(`nav.tabs[data-group="${TAB_GROUP}"]`)
    ?? root.querySelector(`nav[data-group="${TAB_GROUP}"]`)
    ?? root.querySelector("nav.tabs");
}

export function findTabContainer(root) {
  if (!root?.querySelector) return null;
  return root.querySelector(`[data-tab="${TAB_ID}"]`)?.closest(".tab, section, form")
    ?? root.querySelector("section.sheet-body")
    ?? root.querySelector(".window-content > form")
    ?? root.querySelector("form")
    ?? root;
}

export function encountersTabPanel(root) {
  if (!root?.querySelector) return null;
  const panels = root.querySelectorAll(`[data-tab="${TAB_ID}"]`);
  for (const panel of panels) {
    if (panel.closest("nav.tabs, nav[data-group]")) continue;
    if (panel.classList?.contains("item")) continue;
    return panel;
  }
  return null;
}

export async function injectSceneExplorationConfig(app, element) {
  if (!game.user.isGM || !isSceneConfigApp(app) || !app.document) return;

  const root = sceneConfigRoot(app, element);
  if (!root || encountersTabPanel(root)) return;

  const nav = findTabNav(root);
  const container = findTabContainer(root);
  if (!nav || !container) return;

  const config = readSceneExplorationConfig(app.document);
  const worldEncounterChance = Number(game.settings.get(MODULE_ID, SETTINGS.ENCOUNTER_CHANCE));
  const panelHtml = await renderTemplate(TEMPLATE, {
    moduleId: MODULE_ID,
    randomEncounters: config.randomEncounters,
    encounterChanceField: Number.isFinite(config.encounterChance) ? config.encounterChance : "",
    worldEncounterChance
  });

  nav.insertAdjacentHTML("beforeend", `
    <a
      class="item"
      data-tab="${TAB_ID}"
      data-group="${TAB_GROUP}"
      data-tooltip="${game.i18n.localize("FPG.SceneConfig.TabTooltip")}"
      aria-label="${game.i18n.localize("FPG.SceneConfig.TabLabel")}"
    >
      <i class="fa-solid fa-dice"></i>
    </a>
  `);

  container.insertAdjacentHTML("beforeend", `
    <section class="tab" data-tab="${TAB_ID}" data-group="${TAB_GROUP}">
      ${panelHtml}
    </section>
  `);

  const tabLink = nav.querySelector(`[data-tab="${TAB_ID}"]`);
  tabLink?.addEventListener("click", (event) => {
    app.changeTab?.(TAB_ID, TAB_GROUP, { event });
  });
}

function scheduleSceneExplorationInjection(app, element) {
  const run = () => injectSceneExplorationConfig(app, element).catch(onRenderError);
  if (typeof requestAnimationFrame === "function") requestAnimationFrame(run);
  else run();
}

export function registerSceneConfigHook() {
  Hooks.once("init", () => {
    loadTemplates([TEMPLATE]);
  });

  Hooks.on("renderSceneConfig", scheduleSceneExplorationInjection);
  Hooks.on("renderDocumentSheetV2", (app, element) => {
    if (!isSceneConfigApp(app)) return;
    scheduleSceneExplorationInjection(app, element);
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
