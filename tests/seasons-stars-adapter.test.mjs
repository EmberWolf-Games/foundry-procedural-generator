import assert from "node:assert/strict";
import { classifyDaypart } from "../src/integrations/seasons-stars-adapter.js";

assert.equal(classifyDaypart({ hour: 3, sunrise: 6, sunset: 18 }), "night");
assert.equal(classifyDaypart({ hour: 5.5, sunrise: 6, sunset: 18 }), "dawn");
assert.equal(classifyDaypart({ hour: 12, sunrise: 6, sunset: 18 }), "day");
assert.equal(classifyDaypart({ hour: 17.5, sunrise: 6, sunset: 18 }), "dusk");
assert.equal(classifyDaypart({ hour: 20, sunrise: 6, sunset: 18 }), "night");
assert.equal(classifyDaypart({ hour: NaN, sunrise: 6, sunset: 18 }), "unknown");

console.log("seasons-stars-adapter.test.mjs passed");
