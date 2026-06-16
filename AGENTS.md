# AGENTS.md — ScaleShaper

Guidance for AI coding agents working in this repository.

## What this project is

ScaleShaper — actively shape your understanding of scale structure, fingering, and sound.
A **static SvelteKit SPA** for studying piano scales. A scale is defined by its `steps` array (semitone gaps summing to 12); everything else is derived at runtime from `src/lib/theory/`. Named scales live in `src/lib/catalog/named.ts`; the Explorer generator in `catalog/generate.ts` produces the full encyclopedia set.

**Live:** https://avowkind.github.io/scaleshaper/ (GitHub Pages, base path `/scaleshaper`).

## Commands

```bash
pnpm install
pnpm dev          # local dev, no base path
pnpm build        # production build → build/
pnpm preview      # serve production build
pnpm check        # svelte-check + types
npx tsx scripts/sanity.ts   # quick theory sanity check
```

Production builds set `BASE_PATH=/scaleshaper` (see `vite.config.ts` and `.github/workflows/deploy.yml`).

## Architecture

| Area | Path | Notes |
|------|------|-------|
| Theory core | `src/lib/theory/` | Pure functions, no Svelte imports. Unit-testable. |
| Catalog | `src/lib/catalog/` | Named seeds + generator, merged by `id`. |
| UI components | `src/lib/components/` | SVG keyboard/interval line, VexFlow stave, glyph, ego-network, rhythm. |
| Routes | `src/routes/` | `/scale/[id]`, `/explorer`, layout with sidebar. |
| State | `src/lib/state.svelte.ts` | Key, enharmonic pref, roman numerals, audio mode (runes). |
| Audio | `src/lib/audio.ts` | smplr piano + Web MIDI + rhythm click scheduler. |

## Conventions

- **Svelte 5 runes** (`$state`, `$derived`, `$props`) — not legacy `export let` / `$:`.
- **Data-driven scales** — add metadata to `named.ts` or rely on generated `id`; do not hard-code scale logic in components.
- **Theory stays pure** — new musical logic goes in `theory/`, then is imported by UI/catalog.
- **Print-aware** — scale pages target one A4 landscape sheet; use `.no-print` for interactive-only sections.
- **Base path** — use `$app/paths` `base` for all internal links (`{base}/scale/...`).
- **Minimal diffs** — match existing naming, colocated `<style>` blocks, and functional style in `theory/`.

## Key features (implemented)

- Interval line, keyboard, grand staff, rule-based fingering with optional overrides
- Scale glyph (T2): pitch-class donut, thickness + colour by gap
- Ego-network (T1): circular EMD neighbours on each scale page
- Rhythm panel (T3): 12-pulse and n-pulse click loops, deep/Euclidean badges
- Explorer grid with family-coloured named scales

Design rationale and schema: [DESIGN.md](DESIGN.md). Feature history: [tickets/](tickets/).

## What not to do

- Do not add a backend, auth, or cloud sync — this is a local/static app.
- Do not break the GitHub Pages SPA fallback (`adapter-static` with `fallback: '404.html'`).
- Do not commit secrets or change git config.
- Avoid editing `pnpm-lock.yaml` unless dependencies change.

## Open / deferred (from design)

- Full similarity atlas (MDS/UMAP embedding of all ~1,226 scales) — ego-network shipped instead.
- Chord voicings within scales — architecture anticipates it; not built.
- Comparison mode: stack two glyphs with EMD transport arrows.
