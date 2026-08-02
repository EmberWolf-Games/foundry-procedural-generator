/**
 * Narrow Midi QOL facade. The generator does not override D&D 5e Item use,
 * workflow hooks, targeting, damage, effects, or concentration handling.
 */
export function isMidiQolAvailable() {
  return Boolean(game.modules.get("midi-qol")?.active && globalThis.MidiQOL);
}

export function getMidiQolCapabilities() {
  return {
    available: isMidiQolAvailable(),
    version: game.modules.get("midi-qol")?.version ?? null,
    completeItemUse: typeof globalThis.MidiQOL?.completeItemUse === "function"
  };
}

export async function completeGeneratedItemUse(item, config = {}, options = {}) {
  if (!isMidiQolAvailable() || typeof globalThis.MidiQOL.completeItemUse !== "function") {
    throw new Error("Midi QOL completeItemUse is unavailable.");
  }

  return globalThis.MidiQOL.completeItemUse(item, config, {
    checkGMStatus: true,
    ...options
  });
}
