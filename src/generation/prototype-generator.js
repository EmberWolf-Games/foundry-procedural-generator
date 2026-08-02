import { createRng } from "../core/rng.js";

function boundaryWalls({ width, height, gridSize, entranceColumn, exitColumn }) {
  const sceneWidth = width * gridSize;
  const sceneHeight = height * gridSize;
  const gap = gridSize;

  const entranceX1 = entranceColumn * gridSize;
  const entranceX2 = entranceX1 + gap;
  const exitX1 = exitColumn * gridSize;
  const exitX2 = exitX1 + gap;

  const solid = {
    movement: "normal",
    sight: "normal",
    light: "normal",
    sound: "normal",
    door: "none",
    doorState: "closed"
  };

  return [
    { coordinates: [0, 0, entranceX1, 0], ...solid },
    { coordinates: [entranceX2, 0, sceneWidth, 0], ...solid },
    { coordinates: [sceneWidth, 0, sceneWidth, sceneHeight], ...solid },
    { coordinates: [sceneWidth, sceneHeight, exitX2, sceneHeight], ...solid },
    { coordinates: [exitX1, sceneHeight, 0, sceneHeight], ...solid },
    { coordinates: [0, sceneHeight, 0, 0], ...solid }
  ].filter((wall) => wall.coordinates[0] !== wall.coordinates[2]
    || wall.coordinates[1] !== wall.coordinates[3]);
}

/**
 * Produce a Foundry-independent plan made only of plain serializable data.
 */
export function buildPrototypePlan({
  seed,
  cellKey,
  sourceSceneUuid,
  widthCells = 30,
  heightCells = 20,
  gridSize = 100,
  contextSnapshot = null
}) {
  const rng = createRng(seed);
  const layoutRng = rng.stream("layout");

  const entranceColumn = layoutRng.integer(2, Math.max(2, widthCells - 3));
  let exitColumn = layoutRng.integer(2, Math.max(2, widthCells - 3));
  if (exitColumn === entranceColumn && widthCells > 6) {
    exitColumn = ((exitColumn + Math.floor(widthCells / 2)) % (widthCells - 4)) + 2;
  }

  const plan = {
    planVersion: 1,
    seed: String(seed),
    sourceSceneUuid,
    cellKey,
    contextSnapshot,
    scene: {
      name: `Procedural Encounter [${cellKey}]`,
      width: widthCells * gridSize,
      height: heightCells * gridSize,
      padding: 0,
      navigation: false,
      tokenVision: true,
      backgroundColor: "#171717",
      grid: {
        type: "square",
        size: gridSize,
        distance: 5,
        units: "ft"
      }
    },
    walls: boundaryWalls({
      width: widthCells,
      height: heightCells,
      gridSize,
      entranceColumn,
      exitColumn
    }),
    zones: {
      entrance: {
        x: entranceColumn * gridSize,
        y: 0,
        width: gridSize,
        height: gridSize * 2
      },
      exit: {
        x: exitColumn * gridSize,
        y: (heightCells - 2) * gridSize,
        width: gridSize,
        height: gridSize * 2
      }
    },
    diagnostics: {
      streams: {
        layout: { seed: layoutRng.seed, draws: layoutRng.drawCount }
      }
    }
  };

  validatePrototypePlan(plan);
  return plan;
}

export function validatePrototypePlan(plan) {
  if (!plan?.scene || !Array.isArray(plan.walls)) {
    throw new TypeError("Prototype plan is missing Scene or Wall data.");
  }
  if (plan.scene.width <= 0 || plan.scene.height <= 0) {
    throw new RangeError("Prototype Scene dimensions must be positive.");
  }
  for (const wall of plan.walls) {
    if (!Array.isArray(wall.coordinates)
      || wall.coordinates.length !== 4
      || wall.coordinates.some((n) => !Number.isFinite(n))) {
      throw new TypeError("Prototype plan contains an invalid Wall segment.");
    }
  }
  return true;
}
