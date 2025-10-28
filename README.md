# D&D Cards

![Release](https://img.shields.io/github/v/release/jampamatos/dnd-cards?display_name=tag&sort=semver)
![License](https://img.shields.io/badge/license-MIT%20%2B%20CC%20BY%204.0-lightgrey)
![Docs CI](https://github.com/jampamatos/dnd-cards/actions/workflows/docs-ci.yml/badge.svg)

Bilingual application (PT/EN) for exploring, selecting, and printing D&D 5e
spell and feature cards (SRD 5.1 – 2024).

> React + TypeScript + Vite with static PWA distribution. Preferences,
> language, card selection, and print status are saved in the browser
> (IndexedDB/localStorage).

## Summary

- [D&D Cards](#dd-cards)
  - [Summary](#summary)
  - [Overview](#overview)
  - [Main Features](#main-features)
  - [Architecture and stack](#architecture-and-stack)
  - [Project structure](#project-structure)
  - [Prerequisites](#prerequisites)
  - [Getting Started](#getting-started)
  - [Usage Flow](#usage-flow)
    - [Browse](#browse)
    - [Pack Selector (Pack Builder)](#pack-selector-pack-builder)
    - [Print Preview](#print-preview)
    - [Import \& Search](#import--search)
  - [Data and Validation](#data-and-validation)
  - [Preferences and i18n](#preferences-and-i18n)
  - [PWA and printing](#pwa-and-printing)
  - [Roadmap](#roadmap)
  - [How to Contribute](#how-to-contribute)
  - [Versioning](#versioning)
  - [License](#license)
  - [Credits](#credits)
  - [Support and Security](#support-and-security)

## Overview

D&D Cards centralizes D&D content in a modern, accessible, and mobile-first
interface. Users can filter spells and features by level, class, heuristic
tags, and text (PT/EN), assemble a custom pack, and generate print-ready pages
with a mirrored back. The app works offline (PWA) and syncs preferences locally
to avoid account dependencies.

## Main Features

- Unified catalog of spells and features, with accent-insensitive search in
  Portuguese and English.
- Combined filters: level, class, semantic tags, sorting, responsive
  pagination, and interactive *chips*.
- Persistent selector with `DockSelection`, real-time counting, and storage in
  IndexedDB (localStorage fallback).
- Print Builder with `S/M/L` densities, A4/A3/Letter orientation, column
  control, drag-and-drop reordering, and mirrored back page generation.
- Global language (PT/EN) and theme (light/dark/system) preferences applied to
  `<html data-theme>` and stored locally.
- PWA with automatic service worker registration, full manifest, and
  `workbox` for offline caching.
- Resilient layout, visible focus, *skip link*, and ARIA aids for greater
  accessibility.

## Architecture and stack

- **React 19** + **TypeScript** running with **Vite 7** (`vite-plugin-pwa`).
- **React Router 7** for routes and layout; `Outlet` encapsulated in
  `AppLayout`.
- **MiniSearch** for the unified index of magic/features with normalization
  (NFD).
- **Zod** ensures that JSON in `src/data/srd` is typed before reaching the
  pages.
- Custom contexts (`PrefsProvider`, `PacksProvider`) with persistence via
  IndexedDB.
- Separate style layer: `styles/ui.css` (app) and `styles/print.css` (media
  print).
- Static build accessible on any CDN/Pages with `base=/dnd-cards`.

## Project structure

```text
├─ src/
│ ├─ pages/ # Main views (Browse, Pack, Print, etc.)
│ ├─ components/ # Header, Cards, Filters, Toolbar, Dock, etc.
│ ├─ data/srd/ # JSON of spells and features
│ ├─ lib/
│ │ ├─ schema/ # Zod schemas (spell, feature, common)
│ │ ├─ search/ # MiniSearch indexer + tag heuristics
│ │ ├─ state/ # Preference and selection providers
│ │ └─ print/ # Print layout helpers
│ ├─ styles/ # ui.css, print.css, and theme.ts
│ └─ main.tsx # Bootstrap, Providers, and SW registration
├─ public/ # Manifest, PWA icons, and static assets
├─ vite.config.ts # Vite + PWA Configuration
└─ LICENSE # MIT (code) + CC BY 4.0 (SRD content)
```

## Prerequisites

- Node.js **20.x** (or newer supported by Vite 7).
- npm **10.x** (or compatible).
- Evergreen browser (Chrome, Firefox, Edge, Safari) to test the PWA.

## Getting Started

```bash
git clone https://github.com/<org>/dnd-cards.git
cd dnd-cards
npm ci
npm run dev
```

Vite runs at `http://localhost:5173`. To validate the build with
`base=/dnd-cards` (GitHub Pages), use:

```bash
npm run build
npm run preview -- --host
```

The generated `dist/` directory is static and can be published to any CDN or
GitHub Pages.

## Usage Flow

### Browse

- Loads spells (`spells.json`) and features (`features.json`) with zod
  validation before rendering.
- Incremental PT/EN search via MiniSearch (`prefix: true`), normalizing accents.
- Clickable filters by level, class, and heuristic tags
  (`detectSpellTags`/`detectFeatureTags`).
- User-controlled pagination (8–36 items) with state remembered per tab.

### Pack Selector (Pack Builder)

- `usePacks` exposes `add/remove/clear` and `ready` to avoid overwriting
  IndexedDB before loading.
- Selected list with metadata (level, class) and quick actions.
- Floating `DockSelection` keeps the Pack and cleanup actions available on
  every screen.

### Print Preview

- Generates *view-models* of the selected items with:
  - Orientation controls: Portrait/Landscape in A4, Letter, and A3 formats.
  - Density presets `S/M/L` (automatic columns via `columns()`).
  - Manual overrides for the number of columns (auto, 1, 2).
  - Drag-and-drop reordering before printing.
  - Optional mirrored back pages for duplex printing.
  - Header toggles, title editing, and crop marks.
- The **Print/PDF** button calls `window.print()` already styled by `print.css`.

### Import & Search

- **Import**: page ready to receive exported data; the flow is under
  development.
- **Search**: reserved for future improvements (autocomplete, history) and
  currently shows an “in development” notice.

## Data and Validation

- The data lives in `src/data/srd/*.json` and is derived from D&D 5th Edition
  (2024) SRD and the Player's Handbook.
- `SpellsArray` and `FeaturesArray` validate the structure, levels, classes,
  and required fields before populating the state.
- `detectSpellTags`/`detectFeatureTags` convert free tags into a stable catalog
  with NFD normalization.
- The search index (`lib/search/indexer.ts`) adds auxiliary fields (`uid`,
  `kind`, synthetic `tags`) for filtering after MiniSearch returns.
- Running `npm run build` ensures that the data remains valid after any
  changes.

## Preferences and i18n

- `PrefsProvider` detects the initial language (browser locale) and preferred
  theme, persisting both in `localStorage`.
- `applyTheme` updates `document.documentElement.dataset.theme` and responds to
  system changes when "system" mode is active.
- Content strategy: in PT we display PT/EN strings side by side for easy
  reference; in EN we display only the English text.

## PWA and printing

- `vite-plugin-pwa` generates the *service worker*, pre-caches assets, and
  integrates `virtual:pwa-register`.
- `manifest.webmanifest` plus icons in `public/icons/` enable installation on
  mobile and desktop devices.
- `styles/print.css` injects `@page` rules and CSS tokens (columns,
  hyphenation) to keep the print aligned at any density.
- The build is ready to host in `/dnd-cards` (GitHub Pages). Adjust `base` in
  `vite.config.ts` if publishing to another path.

## Roadmap

- Implement a complete package import/export flow (clipboard + signed JSON).
- Evolve the **Search** page with instant suggestions, local history, and quick
  filters.
- Add the **Wild Shapes** catalog to the dataset with a dedicated schema.
- Cover critical processes with automated testing (components and hooks) and CI
  lint.
- Automate continuous deployment (GitHub Actions + Pages) and accessibility
  auditing.

## How to Contribute

Follow the detailed guide in **[CONTRIBUTING.md](CONTRIBUTING.md)**. There you
will find prerequisites, branching patterns, Conventional Commits, a PR
checklist, and guidelines for data, i18n, and printing.

## Versioning

We adopt **SemVer**. Releases generate `vX.Y.Z` tags and are documented in
**[CHANGELOG](CHANGELOG)**. The complete step-by-step guide is in
**[RELEASE.md](RELEASE.md)**.

## License

- **Source code:** [MIT](LICENSE).
- **Content based on SRD 5.1:** Creative Commons Attribution 4.0 (CC BY 4.0).
  Attribution required as per the text in the license file.
- *Dungeons & Dragons* trademarks belong to Wizards of the Coast; nominative use
  only to indicate compatibility.

## Credits

- SRD 5.1 (CC BY 4.0) – spell and feature database.
- React/Vite community and authors of the libraries used (MiniSearch, Zod, Vite
  PWA).
- Contributors and reviewers who keep the project accessible and translated.

## Support and Security

- Found a bug? Open an issue with steps to reproduce it.
- Vulnerabilities or sensitive data should follow the
  **[SECURITY.md](SECURITY.md)** flow.
