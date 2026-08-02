import assert from "node:assert/strict";
import {
  encountersTabPanel,
  findTabContainer,
  findTabNav,
  isSceneConfigApp
} from "../src/ui/scene-config.js";

function node(tag, { className, dataTab, children = [], dataset = null } = {}) {
  const el = {
    tagName: tag.toUpperCase(),
    classList: {
      contains: (value) => (className ?? "").split(" ").includes(value)
    },
    dataset: dataset ?? (dataTab ? { tab: dataTab, group: "sheet" } : {}),
    children,
    closest(selector) {
      if (selector === "nav.tabs, nav[data-group]") {
        return el.tagName === "NAV" ? el : null;
      }
      return null;
    }
  };
  return el;
}

function createRoot(...children) {
  const walkAll = (current, visit) => {
    visit(current);
    for (const child of current.children ?? []) walkAll(child, visit);
  };

  return {
    querySelector(selector) {
      let found = null;
      for (const child of children) {
        walkAll(child, (current) => {
          if (found) return;
          if (matches(current, selector)) found = current;
        });
      }
      return found;
    },
    querySelectorAll(selector) {
      const found = [];
      for (const child of children) {
        walkAll(child, (current) => {
          if (matches(current, selector)) found.push(current);
        });
      }
      return found;
    }
  };
}

function matches(element, selector) {
  if (selector === 'nav.tabs[data-group="sheet"]') {
    return element.tagName === "NAV"
      && element.classList.contains("tabs")
      && element.dataset.group === "sheet";
  }
  if (selector === 'nav[data-group="sheet"]') {
    return element.tagName === "NAV" && element.dataset.group === "sheet";
  }
  if (selector === "nav.tabs") {
    return element.tagName === "NAV" && element.classList.contains("tabs");
  }
  if (selector === '[data-tab="fpg-encounters"]') {
    return element.dataset.tab === "fpg-encounters";
  }
  if (selector === "form") {
    return element.tagName === "FORM";
  }
  return false;
}

const nav = node("nav", { className: "tabs", dataset: { group: "sheet" } });
const navLink = node("a", { className: "item", dataTab: "basics" });
nav.children = [navLink];
const form = node("form");
const basicsPanel = node("section", { className: "tab", dataTab: "basics" });
form.children = [basicsPanel];
const root = createRoot(nav, form);

assert.equal(findTabNav(root), nav);
assert.equal(findTabContainer(root), form);
assert.equal(encountersTabPanel(root), null);

assert.equal(isSceneConfigApp({ document: { documentName: "Scene" }, options: { classes: ["scene-config"] } }), true);
assert.equal(isSceneConfigApp({ document: { documentName: "Actor" }, options: { classes: ["actor-sheet"] } }), false);

console.log("scene-config-ui.test.mjs passed");
