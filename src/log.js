import { MODULE_ID } from "./constants.js";

const LEVELS = Object.freeze({ error: 0, warn: 1, info: 2, debug: 3, trace: 4 });

function configuredLevel() {
  try {
    return game.settings.get(MODULE_ID, "debugLevel") ?? "info";
  } catch {
    return "info";
  }
}

function shouldLog(level) {
  return LEVELS[level] <= LEVELS[configuredLevel()];
}

function write(level, message, context) {
  if (!shouldLog(level)) return;
  const method = level === "trace" ? "debug" : level;
  const prefix = `[${MODULE_ID}]`;
  if (context === undefined) console[method](prefix, message);
  else console[method](prefix, message, context);
}

export const log = Object.freeze({
  error: (message, context) => write("error", message, context),
  warn: (message, context) => write("warn", message, context),
  info: (message, context) => write("info", message, context),
  debug: (message, context) => write("debug", message, context),
  trace: (message, context) => write("trace", message, context)
});
