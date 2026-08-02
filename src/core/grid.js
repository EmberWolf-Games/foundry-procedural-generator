/**
 * Return a stable square-grid key based on the Token's center.
 * Prototype restriction: square grids only.
 */
export function tokenCellKey(tokenDocument) {
  const scene = tokenDocument.parent;
  if (!scene) throw new Error("Token has no parent Scene.");

  const gridSize = Number(scene.grid?.size);
  if (!Number.isFinite(gridSize) || gridSize <= 0) {
    throw new Error("Exploration Scene has no usable grid size.");
  }

  const widthPixels = Number(tokenDocument.width) * gridSize;
  const heightPixels = Number(tokenDocument.height) * gridSize;
  const centerX = Number(tokenDocument.x) + widthPixels / 2;
  const centerY = Number(tokenDocument.y) + heightPixels / 2;

  const column = Math.floor(centerX / gridSize);
  const row = Math.floor(centerY / gridSize);
  return `${column},${row}`;
}
