# Tickets — backlog

Proposed features not yet scheduled. Each links to its detail doc.

## T1 — Explorer similarity map (EMD ego-network)
Lay the Explorer out by aural similarity instead of numeric sort: pick a scale and
see its closest neighbours, each drawn as its T2 glyph (digits on hover).
**Decided:** circular Earth-Mover's distance, rooted scales, ego-network view,
glyph-rendered nodes. Detail: [EXPLORER-LAYOUT.md](EXPLORER-LAYOUT.md).
**Status:** decided, not built. Depends on T2 for node rendering.

## T2 — Circular Earth-Mover scale glyph
A small iconic donut per scale (pitch-class clock, root at top, gaps shown by
colour **and** thickness). Modes read as rotations of the ring; stacking two glyphs
shows which notes move (the EMD transport). Used as the cell/node art across the
Explorer (T1). Detail: [SCALE-GLYPH.md](SCALE-GLYPH.md).
**Status:** proposal.

## T3 — Scale as rhythm (deep-rhythm sonification)
Play any scale as a looping click pattern: its notes become onsets on a 12-pulse
cycle (steps = inter-onset intervals), with the downbeat accented. The major scale
gives the diatonic rhythm `[x . x . x x . x . x . x]`. The T2 glyph doubles as the
rhythm necklace with a sweeping playhead. Detail: [SCALE-RHYTHM.md](SCALE-RHYTHM.md).
**Status:** proposal.
