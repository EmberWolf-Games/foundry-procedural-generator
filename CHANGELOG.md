# Changelog

All notable changes use the versioning scheme in `docs/VERSIONING.md` (`M.m.b.p[.release]`).

## Unreleased

## 0.1.108.1.pre — Foundry-compatible versioning + Encounters tab fix

- Foundry cannot treat `0.1.107.2-pre` as newer than `0.1.107-pre` (non-numeric segments like `2-pre`).
- Ship **`0.1.108.1.pre`**, which Foundry detects from all legacy `0.1.107.x` installs including `107.2-pre`.
- Patches continue as `0.1.108.2.pre`, …; feature builds use `0.1.109.0.pre`. See `docs/VERSIONING.md`.
- Fixes Scene Encounters tab injection (`onRenderError`, duplicate tab, v13 Handlebars API).

## 0.1.107.2-pre — Version scheme: four-part patch segment (broken Foundry updates)

- Replace `M.m.b-hf#-release` with **`M.m.b.p-release`** (`p` always visible; `0` for feature builds, increments for patches).
- Foundry `isNewerVersion` now sorts patches correctly (`0.1.107.1-pre` > `0.1.107.0-pre`).
- CI post-release bumps increment **p** instead of `-hf#`.

## 0.1.107-hf1-pre — Fix Scene Encounters tab injection

- Fix `onRenderError is not defined`, which blocked tab content from rendering.
- Remove duplicate `renderDocumentSheetV2` hook so the dice tab is injected once.
- Use v13 namespaced Handlebars APIs (`foundry.applications.handlebars.renderTemplate` / `loadTemplates`).
- Insert the Encounters panel alongside other Scene Config tab sections.

## 0.1.107-pre — Foundry update fix (scene config Encounters tab)

- Renumber to `0.1.107-pre` so Foundry detects an update from `0.1.105-pre` / `0.1.106-pre` (Foundry compares numeric build segments; `0.1.102-hf4-pre` is treated as older than `0.1.105-pre`).
- Includes the Scene Configuration **Encounters** tab (dice icon) and all scene-config hotfix work from `0.1.102-hf4-pre`.
- Restore CI post-release **build** bumps; document Foundry `isNewerVersion` constraints for `-pre` hotfixes.

## 0.1.102-hf4-pre — Scene config Encounters tab (hotfix)

- Add a dedicated **Encounters** tab (dice icon) to Scene Configuration instead of injecting into Basics; v13 tab panels are not `section` elements, so prior selectors never matched.
- Detect SceneConfig via `foundry.applications.sheets.SceneConfig` and defer injection until after render.
- Switch CI post-release bumps to **hotfix** (`-hf#`) instead of build increments for patch releases on the `0.1.102` line.

## 0.1.105-pre — Restore Scene config hook for Random Encounters

- Use `renderSceneConfig` instead of `renderApplicationV2`; SceneConfig sets `BASE_APPLICATION` so the generic AppV2 hook never fires in v13.
- Keep Basics tab content selector (`section.tab[data-tab="basics"]`) to avoid layout breakage.

## 0.1.104-pre — Fix Scene config layout deformation

- Target the Basics tab **content panel** (`section.tab[data-tab="basics"]`) instead of the tab nav link, which was breaking Scene Configuration layout in v13.
- Remove duplicate `renderSceneConfig` hook; inject only via `renderApplicationV2` on `SceneConfig`.

## 0.1.103-pre — Fix Scene config Random Encounters panel

- Fix missing `SETTINGS` import that prevented the Random Encounters section from rendering in Scene Configuration.

## 0.1.102-pre — Per-Scene random encounters and compatibility verified

- Set Foundry `compatibility.verified` to `13.351` and D&D 5e relationship `verified` to `5.3.3` so Module Management reports compatibility instead of unknown.
- Replace world-level Exploration Scene UUID setting with per-Scene **Random Encounters** flagging in Scene Configuration.
- Support optional per-Scene encounter chance override; world default and party Token UUID remain in module settings.

- Force GitHub releases to `prerelease: false` so `/releases/latest/download/` resolves during pre-alpha.
- Add CI verification that manifest and zip URLs are publicly reachable (matches Foundry install behavior).
- Document public-repo requirement and troubleshooting in `docs/INSTALL.md`.

## 0.1.100-pre — M1 pre-alpha baseline (initial GitHub push)

- Adopted structured module versioning (`0.1.100-pre`: minor line 1 / M1, build 100, pre-alpha).
- Added `docs/VERSIONING.md` with bump rules, examples, and automated release documentation.
- Added GitHub Actions release workflow, version scripts, and Foundry manifest/download URLs for update detection.
- Added canonical GitHub repository URL and Cursor handoff documentation.
- Added always-on Cursor project rules under `.cursor/rules/project-context.mdc`.
- Foundry 13.351+ / D&D 5e 5.3.3+ trigger-to-Scene prototype with integration adapter scaffolds.

## Legacy pre-versioning tags (archived)

These tags predate the `M.m.b[-hf#][-release]` scheme and are kept for history only:

### 0.2.0 — Platform and integration baseline

- Set Foundry core minimum to 13.351 and removed the hard maximum.
- Set D&D 5e minimum to 5.3.3.
- Added recommended integration relationships for Midi QOL, Monk's Active Tile Triggers, and Seasons & Stars.
- Added compatibility reporting and adapter scaffolds.
- Added debounced movement evaluation, Seasons & Stars seed snapshots, and namespaced lifecycle hooks.

### 0.1.0 — Architecture prototype

- Initial deterministic trigger-to-Scene prototype.
