import assert from "node:assert/strict";
import { basicsTab } from "../src/ui/scene-config.js";

function node(tag, { className, dataTab, children = [] } = {}) {
  const el = {
    tagName: tag.toUpperCase(),
    classList: { contains: (value) => (className ?? "").split(" ").includes(value) },
    dataset: dataTab ? { tab: dataTab } : {},
    children,
    matches(selector) {
      if (selector === 'section.tab[data-tab="basics"], section[data-tab="basics"]') {
        return el.tagName === "SECTION"
          && el.classList.contains("tab")
          && el.dataset.tab === "basics";
      }
      return false;
    }
  };
  return el;
}

function createRoot(...children) {
  const walk = (selector, current) => {
    if (matches(current, selector)) return current;
    for (const child of current.children ?? []) {
      const found = walk(selector, child);
      if (found) return found;
    }
    return null;
  };

  return {
    querySelector(selector) {
      for (const child of children) {
        const found = walk(selector, child);
        if (found) return found;
      }
      return null;
    }
  };
}

function matches(element, selector) {
  if (selector === 'section.tab[data-tab="basics"]') {
    return element.tagName === "SECTION"
      && element.classList.contains("tab")
      && element.dataset.tab === "basics";
  }
  if (selector === 'section[data-tab="basics"]') {
    return element.tagName === "SECTION" && element.dataset.tab === "basics";
  }
  return false;
}

const basicsSection = node("section", {
  className: "tab",
  dataTab: "basics",
  children: [node("div", { className: "form-group" })]
});
const navLink = node("a", { className: "item", dataTab: "basics" });
const gridSection = node("section", { className: "tab", dataTab: "grid" });

const tab = basicsTab(createRoot(navLink, basicsSection, gridSection));
assert.ok(tab);
assert.equal(tab.tagName, "SECTION");
assert.equal(tab.dataset.tab, "basics");
assert.notEqual(tab, navLink);

assert.equal(basicsTab(createRoot(navLink)), null);

const basicsRoot = node("section", { className: "tab", dataTab: "basics" });
assert.equal(basicsTab(basicsRoot), basicsRoot);

console.log("scene-config-ui.test.mjs passed");
