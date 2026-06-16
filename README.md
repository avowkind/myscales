# MyScales

A local, data-driven web app for understanding and practising piano scales.
See [DESIGN.md](DESIGN.md) for the full design and rationale.

**Live:** https://avowkind.github.io/myscales/ — auto-deployed from `main` via GitHub Actions.

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
src/lib/catalog/     named seed scales + the encyclopedia generator, merged by id
src/lib/components/  IntervalLine, Keyboard, NotationStave (VexFlow), Sidebar
src/routes/          SPA shell, /scale/[id], /explorer
scripts/sanity.ts    quick theory check — `npx tsx scripts/sanity.ts`
```

Stack: SvelteKit (static adapter, client-only SPA) · VexFlow (notation) ·
smplr (sampled piano) + Web MIDI.

## Backlog

Proposed-but-unbuilt features live in [tickets/](tickets/) — currently the EMD
similarity map (T1), the circular scale glyph (T2), and scale-as-rhythm
sonification (T3).
