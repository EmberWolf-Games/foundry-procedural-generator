import { MODULE_ID, FLAGS, SETTINGS } from "../constants.js";
import { normalizeSceneExplorationConfig, readSceneExplorationConfig } from "../persistence/scene-exploration-config.js";

const TEMPLATE = `modules/${MODULE_ID}/templates/scene-exploration-config.hbs`;
const TAB_ID = "fpg-encounters";
const TAB_GROUP = "sheet";

const pendingInjections = new WeakSet();

function resolveElement(element) {
  if (!element) return null;
  if (typeof jQuery !== "undefined" && element instanceof jQuery) return element[0];
  return element;
}

function renderTemplate(template, data) {
  return foundry.applications.handlebars.renderTemplate(template, data);
}

function onRenderError(error) {
  console.error(`[${MODULE_ID}] Failed to render Scene exploration settings.`, error);
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

export function findTabContainer(root, nav) {
  if (!root?.querySelector) return null;

  const firstTabPanel = root.querySelector(`.tab[data-group="${TAB_GROUP}"]`)
    ?? root.querySelector(`section.tab[data-group="${TAB_GROUP}"]`)
    ?? root.querySelector(`[data-tab="${TAB_ID}"]:not(.item)`);

  if (firstTabPanel?.parentElement) return firstTabPanel.parentElement;

  return nav?.parentElement
    ?? root.querySelector("section.sheet-body")
    ?? root.querySelector(".window-content > form")
    ?? root.querySelector("form")
    ?? root;
}

export function encountersTabNav(root) {
  const nav = findTabNav(root);
  return nav?.querySelector(`a.item[data-tab="${TAB_ID}"]`) ?? null;
}

export function encountersTabPanel(root) {
  if (!root?.querySelector) return null;

  const panels = root.querySelectorAll(`.tab[data-tab="${TAB_ID}"][data-group="${TAB_GROUP}"]`);
  for (const panel of panels) {
    if (panel.closest("nav.tabs, nav[data-group]")) continue;
    return panel;
  }
  return null;
}

export function buildEncountersTabNavMarkup({ tabId = TAB_ID, tabGroup = TAB_GROUP, label, tooltip } = {}) {
  return `
    <a
      class="item"
      data-action="tab"
      data-tab="${tabId}"
      data-group="${tabGroup}"
      data-tooltip="${tooltip}"
      aria-label="${label}"
    >
      <i class="fa-solid fa-dice"></i>
    </a>
  `;
}

export function buildEncountersTabPanelMarkup({ tabId = TAB_ID, tabGroup = TAB_GROUP, panelHtml } = {}) {
  return `
    <section class="tab" data-tab="${tabId}" data-group="${tabGroup}">
      ${panelHtml}
    </section>
  `;
}

export function prepareEncountersTab(root) {
  const navLink = encountersTabNav(root);
  const panel = encountersTabPanel(root);
  if (!navLink || !panel) return;

  panel.classList.remove("active");
  navLink.classList.remove("active");
}

export function hasEncountersTab(root) {
  return Boolean(encountersTabNav(root) && encountersTabPanel(root));
}

export async function injectSceneExplorationConfig(app, element) {
  if (!game.user.isGM || !isSceneConfigApp(app) || !app.document) return;
  if (pendingInjections.has(app)) return;

  const root = sceneConfigRoot(app, element);
  if (!root || hasEncountersTab(root)) return;

  const nav = findTabNav(root);
  if (!nav || encountersTabNav(root)) return;

  const container = findTabContainer(root, nav);
  if (!container) return;

  pendingInjections.add(app);

  try {
    const config = readSceneExplorationConfig(app.document);
    const worldEncounterChance = Number(game.settings.get(MODULE_ID, SETTINGS.ENCOUNTER_CHANCE));
    const panelHtml = await renderTemplate(TEMPLATE, {
      moduleId: MODULE_ID,
      randomEncounters: config.randomEncounters,
      encounterChanceField: Number.isFinite(config.encounterChance) ? config.encounterChance : "",
      worldEncounterChance
    });

    if (hasEncountersTab(root)) return;

    nav.insertAdjacentHTML("beforeend", buildEncountersTabNavMarkup({
      label: game.i18n.localize("FPG.SceneConfig.TabLabel"),
      tooltip: game.i18n.localize("FPG.SceneConfig.TabTooltip")
    }));

    container.insertAdjacentHTML("beforeend", buildEncountersTabPanelMarkup({ panelHtml }));

    prepareEncountersTab(root);
  } finally {
    pendingInjections.delete(app);
  }
}

function scheduleSceneExplorationInjection(app, element) {
  const run = () => injectSceneExplorationConfig(app, element).catch(onRenderError);
  if (typeof requestAnimationFrame === "function") requestAnimationFrame(run);
  else run();
}

export function registerSceneConfigHook() {
  Hooks.once("init", () => {
    foundry.applications.handlebars.loadTemplates([TEMPLATE]);
  });

  Hooks.on("renderSceneConfig", scheduleSceneExplorationInjection);

  Hooks.on("preUpdateScene", (scene, update) => {
    const patch = update.flags?.[MODULE_ID]?.[FLAGS.EXPLORATION];
    if (!patch) return;
    update.flags[MODULE_ID][FLAGS.EXPLORATION] = normalizeSceneExplorationConfig(
      foundry.utils.mergeObject(readSceneExplorationConfig(scene), patch, { inplace: false })
    );
  });
}
