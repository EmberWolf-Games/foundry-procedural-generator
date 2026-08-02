export function canonicalSeedMaterial(material) {
  const ordered = Object.keys(material)
    .sort()
    .reduce((result, key) => {
      result[key] = material[key];
      return result;
    }, {});
  return JSON.stringify(ordered);
}

export function deriveEncounterSeed(material) {
  return canonicalSeedMaterial(material);
}
