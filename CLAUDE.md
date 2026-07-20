# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A **Figma Make export** — an interactive, high-fidelity prototype of the "FT Unification" product UI (a customer-experience / AI-agent management console). It is a design artifact rendered as a running React app, not a production application: there is no backend, no data layer, no routing library in use, and no test suite. State lives entirely in `App.tsx` via `useState`.

## Commands

```bash
pnpm install     # install deps (pnpm workspace; no lockfile is committed)
pnpm dev         # Vite dev server
pnpm build       # vite build
```

There is **no lint, no typecheck, and no test command** — do not invent one. The `*.js` / `*.cjs` files at the repo root (`test.js`, `parseNav.js`, `test-compile.js`, `test-expand.js`, etc.) are throwaway debugging scratch scripts, not a test suite; ignore them and don't extend them.

## Architecture

The app has two distinct layers that must not be conflated:

### 1. `src/imports/` — generated Figma output (treat as read-only source-of-truth)
Each subfolder (e.g. `01HomeDefault/`, `02Insights/`, `Org06/`) is a screen or fragment exported directly from Figma. Every folder contains:
- `index.tsx` — deeply nested `<div>` trees with **absolute positioning and hardcoded pixel values** mirroring the Figma canvas exactly.
- `svg-*.ts` — extracted SVG path data, imported by `index.tsx`.
- `*.png` — raster assets.

These are machine-generated. Prefer not to hand-edit them; when a screen needs interactivity, wrap or overlay it from the `app/` layer instead of rewriting the import.

### 2. `src/app/` — the hand-written interactive shell
- `App.tsx` — the entire application. Holds all state, renders the active screen by string name (`currentScreen`), and layers interactivity on top of the static imports.
- `components/` — hand-authored interactive pieces (`expanded-sidebar.tsx`, `organization-dashboard.tsx`, `create-org-flow.tsx`, `Sidebar.tsx`, etc.).
- `components/ui/` — shadcn/ui + Radix primitives. `components/ui/utils.ts` exports `cn()` (clsx + tailwind-merge).

### How the shell drives the imported screens
`App.tsx` renders one imported screen full-bleed, then makes it interactive with two techniques worth understanding before editing:

1. **Injected `<style>` targeting Figma `data-name` attributes.** The collapsed nav rail is a static import; `App.tsx` forces its active/hover states by generating CSS that targets `[data-name="🧭 Nav item"]:nth-child(N)` where `N` is computed from `navItems` index. Note the off-by-one/separator math: `activeChildIndex = index < 10 ? index + 1 : 12` (a divider occupies child slot 11).
2. **Invisible absolutely-positioned overlays.** Transparent `<button>`/`<div>` layers are placed over the static art (nav rail, org switcher combobox) to capture clicks and hover-intent, since the imported markup has no handlers.

### Fixed-canvas scaling
The whole UI is authored at a fixed **1440×920** canvas. `ScaledStage` in `App.tsx` centers it on a black backdrop and uniformly `transform: scale()`s it to fit the viewport. This is why coordinates everywhere are hardcoded pixels — the design never reflows; it only scales. Keep new layout in absolute px within the 1440×920 frame.

## Conventions specific to this codebase

- **Path alias:** `@` → `src/` (Vite + would-be TS). Imports between generated screens use relative paths.
- **`figma:asset/...` imports** resolve via a custom Vite plugin (`figmaAssetResolver` in `vite.config.ts`) to `src/assets/`.
- **Tailwind v4** via `@tailwindcss/vite` — no `tailwind.config`, no PostCSS plugins needed (see `postcss.config.mjs`). Design tokens are CSS variables in `src/styles/theme.css`; entry is `src/styles/index.css`.
- **Styling is inline utility classes with bracketed arbitrary values** (`text-[#2f3130]`, `left-[229px]`, `font-['SF_Pro_Text:Semibold',sans-serif]`) to match Figma output precisely. Match this style when adding UI; don't refactor generated screens toward semantic classes.
- Do NOT remove the `react()` or `tailwindcss()` Vite plugins — both are required for Make even if Tailwind looks unused (comment in `vite.config.ts`).
- Channel display metadata (label → color/icon) is centralized in `src/app/components/channel-meta.ts`; extend `CHANNEL_META` there rather than hardcoding per-component.

## Guidelines file

`guidelines/Guidelines.md` is the Figma Make system-guidelines template and is currently empty (only commented-out examples). If real design-system rules get added there, honor them.
