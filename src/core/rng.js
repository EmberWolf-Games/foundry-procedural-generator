/**
 * Small deterministic PRNG for the prototype.
 *
 * This is not cryptographic. It uses a stable FNV-1a-style string hash and
 * Mulberry32. Named streams prevent random draws in one stage from perturbing
 * unrelated stages.
 */

export function hashString32(value) {
  const text = String(value);
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function createRng(seed) {
  let state = hashString32(seed);
  let draws = 0;

  return Object.freeze({
    seed: String(seed),

    next() {
      state = (state + 0x6d2b79f5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      draws += 1;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },

    integer(min, max) {
      if (!Number.isInteger(min) || !Number.isInteger(max) || max < min) {
        throw new TypeError(`Invalid integer range: ${min}..${max}`);
      }
      return min + Math.floor(this.next() * (max - min + 1));
    },

    chance(probability) {
      if (!Number.isFinite(probability) || probability < 0 || probability > 1) {
        throw new RangeError("Probability must be between 0 and 1.");
      }
      return this.next() < probability;
    },

    pick(items) {
      if (!Array.isArray(items) || items.length === 0) {
        throw new TypeError("Cannot pick from an empty collection.");
      }
      return items[this.integer(0, items.length - 1)];
    },

    weighted(entries) {
      const valid = entries.filter((entry) => Number(entry.weight) > 0);
      const total = valid.reduce((sum, entry) => sum + Number(entry.weight), 0);
      if (total <= 0) throw new TypeError("Weighted entries require positive weights.");

      let cursor = this.next() * total;
      for (const entry of valid) {
        cursor -= Number(entry.weight);
        if (cursor < 0) return entry;
      }
      return valid.at(-1);
    },

    stream(label) {
      return createRng(`${seed}::${label}`);
    },

    get drawCount() {
      return draws;
    }
  });
}
