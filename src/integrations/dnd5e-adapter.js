import { SUPPORTED } from "../constants.js";

export function assertSupportedDnd5e() {
  if (game.system.id !== "dnd5e") {
    throw new Error("Foundry Procedural Generator requires the dnd5e system.");
  }
  if (foundry.utils.isNewerVersion(SUPPORTED.DND5E_MINIMUM, game.system.version)) {
    throw new Error(`D&D 5e ${SUPPORTED.DND5E_MINIMUM} or newer is required.`);
  }
}

/**
 * Resolve standard D&D 5e prototype-token data. Midi QOL can then automate
 * normal Item workflows without generator-specific Actor or Token mutations.
 */
export async function actorTokenData(actor, overrides = {}) {
  if (!actor || actor.documentName !== "Actor") {
    throw new TypeError("A D&D 5e Actor Document is required.");
  }
  const tokenData = await actor.getTokenDocument(overrides);
  return tokenData.toObject();
}
