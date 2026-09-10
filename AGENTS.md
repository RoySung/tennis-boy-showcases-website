# Repository Guidelines

## Project Structure & Module Organization

This React 19, TypeScript, and Vite application presents a frame-based 2.5D character showcase.

- `src/main.tsx` mounts the app; `src/App.tsx` handles viewer controls, rotation, and theme selection.
- `src/Geometry.tsx` supplies decorative geometry and pointer parallax.
- `src/character.ts` defines ordered view assets and angle helpers; `src/style.css` contains responsive styling and compositing.
- `public/character/turntable/` holds eleven transparent PNG views. `docs/turntable-assets.json` records asset metadata; `docs/prompts/` documents generation prompts.
- Read `PRODUCT.md` and `DESIGN.md` before changing product scope or visual behavior. `dist/` is generated output.

## Build, Test, and Development Commands

- `npm ci`: install dependencies from `package-lock.json`.
- `npm run dev -- --port 5188 --strictPort`: start development at `http://localhost:5188`; fail if the port is occupied.
- `npm run build`: run TypeScript checking, then generate the production bundle in `dist/`.
- `npm run preview`: serve the production build for local review.

## Coding Style & Naming Conventions

Use strict TypeScript, functional React components, and hooks. Follow existing two-space indentation, single-quoted TypeScript strings, and semicolons. Use PascalCase for component files and functions, camelCase for helpers and variables, and kebab-case for CSS classes. Match nearby formatting and avoid unrelated reformatting; no ESLint or Prettier configuration is present.

## Testing Guidelines

No automated test framework, test script, or coverage threshold is configured. Run `npm run build` for code changes and manually check desktop and mobile layouts, pointer/touch dragging, keyboard controls, angle wraparound, reset, auto rotation, both themes, and reduced-motion behavior. Check loading and missing-image states when changing asset handling. If adding tests, document the runner and use descriptive names such as `character.test.ts`.

## Asset & Interaction Constraints

Preserve the supplied transparent PNGs. Name new views `tennis-boy-NNN-direction.png`, maintain alignment and scale, and update angle-sorted configuration and metadata together. Preserve keyboard access, visible focus, and reduced-motion support.

## Commit & Pull Request Guidelines

Git history is unavailable in this checkout. Use concise imperative commit subjects, such as `Fix rotation wraparound`. Keep changes focused. PRs should describe the behavior change, link relevant issues, report build and manual checks, and include desktop/mobile screenshots for visual changes. Do not commit `node_modules/` or `dist/`.
