# Changelog

All notable changes use the versioning scheme in `docs/VERSIONING.md` (`M.m.b[-hf#][-release]`).

## 0.1.101-pre — Fix Foundry manifest install from GitHub releases

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
