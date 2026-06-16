# Proposal: circular Earth-Mover scale glyph

*Ticket T2. Status: **implemented** (ScaleGlyph component).*

A tiny, recognisable icon for every scale, built from the same pitch-class circle
the Earth-Mover metric (T1) lives on.

## Idea

Draw the 12 pitch classes as a clock face with the **root at 12 o'clock**. Mark the
scale's notes, and render the **gap between each pair of consecutive notes as an arc
whose semitone size is shown two ways at once**: by **line thickness** (thin =
semitone, fat = leap) and, redundantly, by **colour** (the gap palette: 1 = red,
2 = blue, 3 = amber, 4 = green). The result is the interval line wrapped into a
circle: a ring that reads as a distinct silhouette even at 24–32 px.

**Thickness is the primary channel, colour is the backup.** Encoding the interval as
stroke width means the glyph survives greyscale printing, colour-blindness, and very
small sizes — the half-steps appear as narrow "necks" in the ring and the big leaps
bulge, so the shape alone carries the interval pattern. Colour then reinforces it for
free. (See the in-chat illustration comparing colour-only, thickness-only, and both.)

## Why it works

- **Iconic at small size.** The colour/segment pattern is a fingerprint. Pentatonic
  (a few long arcs), whole-tone (a perfectly even ring), octatonic (alternating
  short/long), diatonic (one tight pair of semitones) are instantly distinguishable
  without reading anything.
- **Modes = rotations.** A mode rotates the step sequence, so its glyph is the
  parent scale's ring *rotated*. Anchoring the root at the top makes that rotation
  visible at a glance — exactly the "modes are rotations of the circle" intuition.
- **It is the EMD picture.** The circle is the pitch-class circle the chosen metric
  transports mass around. The glyph is literally the Earth-Mover mass distribution,
  so the icon and the distance are the same mental model.

## Earth-Mover / comparison mode

Stack two glyphs concentrically, sharing the root at top. Where the scales differ,
draw the **optimal-transport flow** — short arrows showing which note slid where and
by how many semitones. This *is* the EMD between the two scales, made visible, and
answers "which notes change?" Example: Major → Lydian is a single arrow, F → F♯,
distance 1.

## Where it would be used

- **Sidebar list + Explorer cells** — a glyph beside (or instead of) the numeric
  signature, so the Explorer is scannable by *shape*, not just text.
- **Scale-page header** — a larger detail version (with degree ticks).
- **Per-scale favicon / tab thumbnail.**
- **T1 ego-network nodes** — render each node as its glyph instead of a plain dot,
  which makes the whole similarity graph readable.

## Design notes

- **Donut form** (chosen): thick arc segments forming a ring, with a small gap at
  each note position and a root dot just outside the top. The thickness is generous
  (band ≈ half the radius) so it reads as a donut, not a thin circle.
- Geometry: pitch class *p* → angle −90° + *p*/12·360°, clockwise; arc between
  consecutive notes coloured by gap and widened by gap; root marked at top.
- Two sizes: **micro** (dots + coloured arcs, ~28 px) and **detail** (degree ticks,
  hover, ~120 px).
- Pure SVG, data-driven from `steps` — no new data, just a `<ScaleGlyph steps=…>`
  component reusing `theory/colors`. Rooted framing (consistent with T1).
- Accessibility: the glyph is decorative; keep the text name/signature as the label.

## Open questions

1. ~~Micro glyph: colour vs note dots?~~ **Resolved:** thickness ∝ interval as the
   primary channel, colour as redundant backup. Remaining sub-question: should
   thickness map larger-interval → thicker (leaps bulge) or the inverse
   (semitones bold)? Illustration uses leaps-bulge.
2. ~~Explorer: glyph vs numeric signature?~~ **Resolved (T1):** the glyph replaces
   the digits as the cell/node content; the digit signature shows on hover.
3. Comparison mode: always against a fixed reference (parent / Major), or free
   pick-two?
