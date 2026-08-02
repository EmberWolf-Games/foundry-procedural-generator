import { MODULE_ID, MODULE_TITLE, MODULE_VERSION } from "./constants.js";
import { registerSettings } from "./settings.js";
import { onStopToken } from "./services/exploration-monitor.js";
import { api } from "./api.js";
import { compatibilityProblems, getCompatibilityReport } from "./integrations/compatibility.js";
import { log } from "./log.js";

Hooks.once("init", () => {
  registerSettings();
  log.info(`${MODULE_TITLE} ${MODULE_VERSION} initializing.`);
});

Hooks.once("ready", () => {
  const module = game.modules.get(MODULE_ID);
  if (module) module.api = api;

  Hooks.on("stopToken", onStopToken);

  const compatibility = getCompatibilityReport();
  const problems = compatibilityProblems(compatibility);
  for (const problem of problems) log.warn(problem);

  log.info(`${MODULE_TITLE} ready.`, {
    compatibility,
    isGM: game.user.isGM
  });
});

Hooks.on("seasons-stars:ready", () => {
  log.info("Seasons & Stars integration is ready.", api.getEncounterTimeContext());
});
