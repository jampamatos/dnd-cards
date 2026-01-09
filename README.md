# D&D Cards (PWA) - Search, Filter & Print Packs

> **Live demo:** https://jampamatos.github.io/dnd-cards/  
> **Status:** In development  
> **License:** MIT (code) + CC BY 4.0 (SRD content)

A lightweight **D&D cards web app** for browsing spells and class features with fast **search + filters**. Select cards and generate **print-ready sheets** using the Pack Builder (A4/A3/Letter, portrait/landscape). Designed for quick tabletop prep and offline-friendly use.

---

## Table of contents
- [D\&D Cards (PWA) - Search, Filter \& Print Packs](#dd-cards-pwa---search-filter--print-packs)
  - [Table of contents](#table-of-contents)
  - [What this is](#what-this-is)
  - [Key features](#key-features)
    - [Browse \& discover](#browse--discover)
    - [Pack Builder (print workflow)](#pack-builder-print-workflow)
    - [Offline-friendly (PWA)](#offline-friendly-pwa)
    - [Localization](#localization)
    - [Performance \& UX](#performance--ux)
  - [Tech stack](#tech-stack)
  - [Getting started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Install](#install)
    - [Build \& preview (GitHub Pages)](#build--preview-github-pages)
  - [Data \& content](#data--content)
  - [Printing](#printing)
  - [Configuration](#configuration)
  - [Roadmap](#roadmap)
  - [Contributing](#contributing)
  - [Credits \& attribution](#credits--attribution)
  - [License](#license)

---

## What this is

**D&D Cards** helps players and GMs:
- quickly find rules content during play,
- build curated "packs" for a session (prepared spells, class features),
- print clean, table-friendly sheets for the table.

**Target users:** players and GMs  
**Supported content:** spells and class features (SRD 5.1 - 2024)  
**Languages:** PT-BR and EN

---

## Key features

### Browse & discover
- Fast **full-text search** across card content (PT/EN)
- **Filters** by class, level, school (spells), and semantic tags
- Sort by **name** or **level**
- Responsive UI for mobile, tablet, and desktop

### Pack Builder (print workflow)
- Multi-select cards and add to a pack
- Print-ready layouts:
  - Paper sizes: **A4 / A3 / Letter**
  - Orientation: **Portrait / Landscape**
  - Density presets: **S / M / L** (automatic columns)
- Optional mirrored backs for duplex printing
- Drag-and-drop reordering before printing

### Offline-friendly (PWA)
- Installable PWA with offline cache after first load
- Preferences and selection stored locally (IndexedDB/localStorage)

### Localization
- Bilingual UI: **PT-BR / EN**
- In PT mode, cards show PT and EN text together for quick reference

### Performance & UX
- Client-side search powered by **MiniSearch** with accent normalization
- Accessible UI patterns (skip link, visible focus, ARIA labels)

---

## Tech stack

- **Framework:** React 19 + TypeScript
- **Build tool:** Vite 7
- **Routing:** React Router
- **Search:** MiniSearch (client-side index)
- **Validation:** Zod (typed SRD data)
- **PWA:** vite-plugin-pwa (service worker + manifest)
- **Styling:** custom CSS (`src/styles/ui.css`, `src/styles/print.css`)
- **Deploy:** GitHub Pages (`base=/dnd-cards`)

---

## Getting started

### Prerequisites
- Node.js **20+**
- Package manager: **pnpm** (recommended) or npm

### Install
```bash
pnpm install
pnpm dev
```

Vite runs at `http://localhost:5173`.

### Build & preview (GitHub Pages)
```bash
pnpm build
pnpm preview -- --host
```

The build outputs to `dist/` and is ready for static hosting.

---

## Data & content

- Data lives in `src/data/srd/` (`spells.json`, `features.json`).
- Content is derived from SRD 5.1 (2024) and validated with Zod before use.
- Tagging is generated heuristically to keep filters consistent.

---

## Printing

- Use the Pack Builder to select cards and open **Print Preview**.
- Choose page size, orientation, density, columns, and crop marks.
- The **Print / PDF** button triggers `window.print()` with print-specific CSS.

---

## Configuration

- **Base path (GitHub Pages):** set in `vite.config.ts` (`base: '/dnd-cards'`).
- **PWA manifest:** defined in `vite.config.ts` and assets live in `public/`.

---

## Roadmap

- Finish pack import/export flow (clipboard + signed JSON).
- Evolve search with suggestions and quick filters.
- Add Wild Shapes catalog with its own schema.
- Add tests and CI coverage for critical flows.
- Automate deployment (GitHub Actions + Pages).

---

## Contributing

See `CONTRIBUTING.md` for setup, branching, and PR guidelines. Please follow
`CODE_OF_CONDUCT.md` and review `SECURITY.md` for sensitive disclosures.

---

## Credits & attribution

- SRD 5.1 content licensed under **CC BY 4.0**.
- "Dungeons & Dragons" and related marks are trademarks of Wizards of the
  Coast. This project is not affiliated with or endorsed by Wizards of the
  Coast.

---

## License

- **Source code:** MIT (see `LICENSE`).
- **Rules text/SRD content:** CC BY 4.0 with required attribution (see
  `LICENSE`).
