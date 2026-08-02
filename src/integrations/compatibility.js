import { SUPPORTED } from "../constants.js";

function isAtLeast(current, minimum) {
  if (!current) return false;
  return !foundry.utils.isNewerVersion(minimum, current);
}

function moduleStatus(specification) {
  const installed = game.modules.get(specification.id);
  const version = installed?.version ?? null;
  return {
    id: specification.id,
    installed: Boolean(installed),
    active: Boolean(installed?.active),
    version,
    minimum: specification.minimum,
    versionSupported: version ? isAtLeast(version, specification.minimum) : false
  };
}

export function getCompatibilityReport() {
  const foundryVersion = game.version;
  const systemId = game.system.id;
  const systemVersion = game.system.version;

  return {
    foundry: {
      version: foundryVersion,
      minimum: SUPPORTED.FOUNDRY_MINIMUM,
      supported: isAtLeast(foundryVersion, SUPPORTED.FOUNDRY_MINIMUM),
      generation: game.release?.generation ?? null
    },
    system: {
      id: systemId,
      version: systemVersion,
      expectedId: "dnd5e",
      minimum: SUPPORTED.DND5E_MINIMUM,
      supported: systemId === "dnd5e" && isAtLeast(systemVersion, SUPPORTED.DND5E_MINIMUM)
    },
    integrations: {
      midiQol: moduleStatus(SUPPORTED.MODULES.MIDI_QOL),
      monksActiveTiles: moduleStatus(SUPPORTED.MODULES.MONKS_ACTIVE_TILES),
      seasonsAndStars: moduleStatus(SUPPORTED.MODULES.SEASONS_AND_STARS)
    }
  };
}

export function compatibilityProblems(report = getCompatibilityReport()) {
  const problems = [];
  if (!report.foundry.supported) {
    problems.push(`Foundry ${report.foundry.version} is below ${report.foundry.minimum}.`);
  }
  if (!report.system.supported) {
    problems.push(`D&D 5e ${report.system.version ?? "not active"} is below ${report.system.minimum} or the active system is not dnd5e.`);
  }

  for (const integration of Object.values(report.integrations)) {
    if (integration.active && !integration.versionSupported) {
      problems.push(`${integration.id} ${integration.version} is below supported minimum ${integration.minimum}.`);
    }
  }
  return problems;
}
