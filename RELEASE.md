# Release Guide

> Exclusive workflow for maintainers. External contributors **do not** run `npm version`.

## Pre-release checklist
1. Update the local branch:

```bash
git checkout main
git pull origin main
```

2. Run local checks:

```bash
npm ci
npm run lint
npm run build
npm run preview -- --host # validate base=/dnd-cards
```

3. Perform manual *smoke tests*:
- Browse, filter, and change language/theme.
- Select/remove items, reload, and ensure persistence.
- Print Preview: densities, columns, back, reorder.
- PWA/offline installation (optional, but recommended). 
 
4. Issue/PR Triage:
- Classify entries in the **CHANGELOG** (`Added`, `Changed`, `Fixed`).
- Check if README/SECURITY/CONTRIBUTING need recent adjustments.
- Confirm that `public/manifest.webmanifest` and `vite.config.ts` are aligned if the name/scope has changed.

## Versioning (SemVer)
- **MAJOR**: compatibility breaks (data structure, removed features, etc.).
- **MINOR**: new compatible features or significant improvements.
- **PATCH**: compatible bug fixes and refinements.

Determine the version number based on the changes in the changelog.

## Generate the version and tag

```bash
# type: major | minor | patch | 1.2.3
npm version <type> -m "chore(release): v%s"
git push --follow-tags
```

This updates `package.json`, creates a tag annotated `vX.Y.Z`, and generates the commit `chore(release): vX.Y.Z`.

## Publish to GitHub

1. Go to **Releases → Draft a new release**.
2. Select the newly created tag (`vX.Y.Z`) and use the same value for the title.
3. Paste the `## [X.Y.Z]` section of the **CHANGELOG** as the release body (Keep a Changelog format).
4. Attach artifacts if they exist (e.g., pre-generated PDFs).
5. Publish the release.

## Deploy (GitHub Pages or CDN)

- Run `npm run build` (already done in the checklist) and confirm that `dist/` contains the assets with `base=/dnd-cards`.
- If manually publishing to Pages: copy the contents of `dist/` to the deploy branch (`gh-pages`, `docs/`, etc.).
- In automated pipelines, make sure to clean up old artifacts before uploading the new build.

## Hotfix (PATCH)

1. Create a hotfix branch from `main`:

```bash
git checkout -b hotfix/<slug>
```

2. Fix the issue, add tests/manual smoke, update the changelog in `## [Unreleased]`.
3. Open a short PR, wait for review, and merge into `main`. 
4. Run:
   
```bash
git checkout main
git pull origin main
npm version patch -m "chore(release): v%s (hotfix)"
git push --follow-tags
```

5. Publish the release `vX.Y.(Z+1)` focusing on the fixed bug and indicating that it is a hotfix.

## Post-release

- Update the `CHANGELOG` by moving `## [Unreleased]` just above the new version.
- Create/update the next Project or Milestone, moving remaining items.
- Communicate the release (README, networks, Discord, etc.) and thank contributors in the changelog.
- Monitor Issues for regressions, especially in the first 24–48 hours.