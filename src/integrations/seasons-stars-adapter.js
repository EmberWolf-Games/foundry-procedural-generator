/**
 * Feature-detected Seasons & Stars integration.
 * Prefer the documented integration interface; fall back to the direct API.
 */
function getApi() {
  return game.seasonsStars?.integration?.api ?? game.seasonsStars?.api ?? null;
}

export function classifyDaypart({ hour, sunrise = 6, sunset = 18 }) {
  if (![hour, sunrise, sunset].every(Number.isFinite)) return "unknown";
  if (hour < sunrise - 1 || hour >= sunset + 1) return "night";
  if (hour < sunrise + 1) return "dawn";
  if (hour < sunset - 1) return "day";
  return "dusk";
}

export function isSeasonsStarsAvailable() {
  return typeof getApi()?.getCurrentDate === "function";
}

export function getEncounterTimeContext() {
  const api = getApi();
  if (!api || typeof api.getCurrentDate !== "function") {
    return {
      provider: "foundry-world-time",
      available: false,
      worldTime: game.time.worldTime,
      daypart: "unknown"
    };
  }

  try {
    const date = api.getCurrentDate();
    const season = typeof api.getSeasonInfo === "function" && date
      ? api.getSeasonInfo(date)
      : null;
    const sunTimes = typeof api.getSunriseSunset === "function" && date
      ? api.getSunriseSunset(date)
      : null;
    const hour = Number(date?.time?.hour);
    const sunrise = Number(sunTimes?.sunrise ?? 6);
    const sunset = Number(sunTimes?.sunset ?? 18);

    return {
      provider: "seasons-and-stars",
      available: true,
      worldTime: game.time.worldTime,
      calendarId: typeof api.getActiveCalendar === "function"
        ? api.getActiveCalendar()?.id ?? null
        : null,
      date,
      season,
      sunTimes,
      daypart: classifyDaypart({ hour, sunrise, sunset })
    };
  } catch (error) {
    return {
      provider: "seasons-and-stars",
      available: false,
      worldTime: game.time.worldTime,
      daypart: "unknown",
      error: String(error?.message ?? error)
    };
  }
}
