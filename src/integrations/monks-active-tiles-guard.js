import { MODULE_ID } from "../constants.js";

export const MATT_MODULE_ID = "monks-active-tiles";
export const MOVEMENT_SETTLE_DELAY_MS = 150;

export function isMonksActiveTilesAvailable() {
  return Boolean(game.modules.get(MATT_MODULE_ID)?.active);
}

export function isMattManagedTile(tileDocument) {
  return Boolean(tileDocument?.flags?.[MATT_MODULE_ID]);
}

/**
 * Apply only this module's flags. Never create or mutate MATT trigger flags.
 */
export function tagGeneratedTileData(tileData, role) {
  return {
    ...tileData,
    flags: {
      ...(tileData.flags ?? {}),
      [MODULE_ID]: {
        ...(tileData.flags?.[MODULE_ID] ?? {}),
        generated: true,
        role
      }
    }
  };
}
