# ScaleShaper

**Actively shape your understanding of scale structure, fingering, and sound.**

See [DESIGN.md](DESIGN.md) for the full design and rationale.

**Live:** https://avowkind.github.io/scaleshaper/ — auto-deployed from `main` via GitHub Actions.

## Run

```bash
pnpm install
pnpm dev      # http://localhost:5173
pnpm build    # static SPA → build/
pnpm preview  # serve the production build
```

## How it works

A scale is defined by **one fact**: its ordered semitone steps (e.g. major =
`[2,2,1,2,2,2,1]`). Everything else is derived at runtime. Adding a scale means
adding a row to the catalog, not writing code.

```
src/lib/theory/      pure music-theory core (framework-free, unit-testable)
  id.ts              step encoding, pitch classes, pcNumber
  degrees.ts         scale-degree labels (context-sensitive tritone)
  spelling.ts        note spelling per key + key-signature logic
  fingering.ts       rule-based classical fingering, per hand, per key
  colors.ts          gap-size + degree-signature palettes
  emd.ts             circular Earth-Mover distance, ego-network neighbours
  rhythm.ts          deep-rhythm predicates, box notation, Euclidean badges
src/lib/catalog/     named seed scales + the encyclopedia generator, merged by id
src/lib/components/  IntervalLine, Keyboard, NotationStave, ScaleGlyph, EgoNetwork,
                     RhythmPanel, Sidebar, AboutDialog
src/routes/          SPA shell, /scale/[id], /explorer
scripts/sanity.ts    quick theory check — `npx tsx scripts/sanity.ts`
```

Stack: SvelteKit (static adapter, client-only SPA) · VexFlow (notation) ·
smplr (sampled piano) + Web MIDI.

## Features

- **Interval line** — colour-coded gap sizes, the hero of every scale page
- **Keyboard + grand staff** — two octaves, fingering, key-specific spelling
- **Audio** — sampled piano or Web MIDI; click/drag keys
- **Scale glyph** — iconic donut per scale (pitch-class clock); modes = rotations
- **Rhythm panel** — play the scale as a looping click pattern (12-pulse or n-pulse)
- **Neighbourhood** — ego-network of aurally nearby scales (Earth-Mover distance)
- **Explorer** — browse ~1,200+ generated shapes; family-tinted named scales
- **Print** — one A4 landscape sheet per scale, frozen on the selected key

Use **About** in the sidebar for a full in-app overview.

## Backlog

Shipped tickets (T1 ego-network, T2 glyph, T3 rhythm) are documented in
[tickets/](tickets/). Deferred: full similarity atlas (MDS/UMAP), glyph comparison
mode (stack two scales with transport arrows), chords-within-scales panel.

AI agent guidance: [AGENTS.md](AGENTS.md).
