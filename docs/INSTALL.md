# Installing the Module

## Manifest URL install (Foundry Setup or in-world Module Management)

Use this manifest URL:

```text
https://github.com/EmberWolf-Games/foundry-procedural-generator/releases/latest/download/module.json
```

Foundry fetches that JSON, reads the `download` field, and installs the release zip.

## Requirements

### Public GitHub repository

Foundry VTT downloads the manifest and zip **without authentication**. If the repository is private, GitHub returns `404` and Foundry shows:

```text
Error: No module manifest found at .../releases/latest/download/module.json
```

**Fix:** In GitHub → **Settings → General → Danger Zone → Change repository visibility**, set the repository to **Public**.

### Non-prerelease GitHub Release marked "Latest"

GitHub's `/releases/latest/...` endpoint ignores releases marked as **Pre-release**. This project's CI creates normal releases (`prerelease: false`) even while the module version string uses the `-pre` channel suffix (for example `0.1.101-pre`).

If you manually create GitHub releases, do **not** check **Set as a pre-release** unless you also publish at least one normal release marked **Latest**.

## Development install (local symlink)

For local development, bypass GitHub entirely:

```text
{userData}/Data/modules/foundry-procedural-generator  →  your clone
```

Enable the module in a D&D 5e 5.3.3+ world on Foundry 13.351+.

## Verify a release manually

```bash
curl -fsSL "https://github.com/EmberWolf-Games/foundry-procedural-generator/releases/latest/download/module.json"
curl -fsSLI "https://github.com/EmberWolf-Games/foundry-procedural-generator/releases/latest/download/foundry-procedural-generator.zip"
```

Both commands must succeed without authentication.

## Tag-specific fallback

If `/releases/latest/` is unavailable, install from a specific tag (replace the version):

```text
https://github.com/EmberWolf-Games/foundry-procedural-generator/releases/download/0.1.100-pre/module.json
```

This still requires a **public** repository.
