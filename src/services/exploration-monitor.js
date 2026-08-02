import { MODULE_ID, SETTINGS } from "../constants.js";
import { tokenCellKey } from "../core/grid.js";
import { processEnteredCell } from "./encounter-orchestrator.js";
import { MOVEMENT_SETTLE_DELAY_MS } from "../integrations/monks-active-tiles-guard.js";
import { isRandomEncounterScene } from "../persistence/scene-exploration-config.js";
import { log } from "../log.js";

const pending = new Map();

function isAuthoritativeGM() {
  return Boolean(game.user?.isGM && game.users?.activeGM?.id === game.user.id);
}

function isModuleEnabled() {
  return Boolean(game.settings.get(MODULE_ID, SETTINGS.ENABLED));
}

function matchesConfiguredToken(tokenDocument) {
  if (!isModuleEnabled()) return false;

  const scene = tokenDocument.parent;
  if (!scene || !isRandomEncounterScene(scene)) return false;

  const configuredTokenUuid = game.settings.get(MODULE_ID, SETTINGS.PARTY_TOKEN_UUID);
  if (!configuredTokenUuid) return false;

  return tokenDocument.uuid === configuredTokenUuid;
}

async function evaluateSettledToken(sceneId, tokenId) {
  const scene = game.scenes.get(sceneId);
  const tokenDocument = scene?.tokens.get(tokenId);
  if (!tokenDocument || !isAuthoritativeGM() || !matchesConfiguredToken(tokenDocument)) return;

  try {
    const cellKey = tokenCellKey(tokenDocument);
    log.debug("Party Token settled in random-encounter Scene cell.", {
      tokenUuid: tokenDocument.uuid,
      sceneUuid: tokenDocument.parent.uuid,
      cellKey
    });
    await processEnteredCell(tokenDocument.parent, tokenDocument, cellKey);
  } catch (error) {
    Hooks.onError(`${MODULE_ID}.onStopToken`, error, {
      log: "error",
      notify: "error",
      data: { tokenUuid: tokenDocument?.uuid }
    });
  }
}

/**
 * MATT may stop, redirect, or teleport a Token from the same movement event.
 * Debouncing lets those immediate movement-side effects settle, then re-reads
 * the authoritative Token Document. No MATT flags or hooks are consumed.
 */
export function onStopToken(tokenDocument) {
  if (!isAuthoritativeGM() || !matchesConfiguredToken(tokenDocument)) return;

  const key = tokenDocument.uuid;
  const existing = pending.get(key);
  if (existing) clearTimeout(existing);

  const timeout = setTimeout(async () => {
    pending.delete(key);
    await evaluateSettledToken(tokenDocument.parent.id, tokenDocument.id);
  }, MOVEMENT_SETTLE_DELAY_MS);

  pending.set(key, timeout);
}
