# Proposal: scale as rhythm (deep-rhythm sonification)

*Ticket T3. Status: proposal only — not for implementation yet. Pairs with the
in-chat illustration.*

## Idea

A scale is a set of pitch classes on the 12-tone circle — which is *structurally
identical* to a **rhythm**: put the same set on a cycle of 12 pulses and every note
becomes an onset. Godfried Toussaint's CCCG 2005 paper on **deep rhythms** builds on
this scale–rhythm isomorphism. Sounded this way, the diatonic (major) scale *is* the
classic diatonic rhythm — exactly the pattern in the paper:

```
[ x . x . x x . x . x . x ]
  0 1 2 3 4 5 6 7 8 9 10 11
```

Onsets fall on the major scale's pitch classes {0, 2, 4, 5, 7, 9, 11}; the gaps
between onsets are precisely the scale's **step pattern** `2·2·1·2·2·2·1` — i.e. the
steps *are* the inter-onset intervals. Every scale in the catalogue therefore already
carries its rhythm, for free, in its `steps`.

## Feature

A **"play as rhythm"** mode on each scale page: sound the scale's onsets as a
**looping wood-block click pattern**, with a **slight accent on beat 1 (the root)**
so the period is audible. Tempo control and loop on/off. No new data — reuses `steps`
and the audio engine.

Two **readings**, toggleable:
- **12-pulse (chromatic) — default.** Onsets on a 12-unit grid at the scale's pitch
  classes; inter-onset intervals = `steps`. This is the authentic deep rhythm, e.g.
  the diatonic `[x . x . x x . x . x . x]`.
- **n-pulse (meter).** The *n* notes as *n* isochronous beats — the scale heard as a
  metre of *n* (a 7-beat bar for the diatonic, 5 for pentatonic), downbeat accented.
  Strips the chromatic spacing to foreground cardinality and pulse.

## Visuals

- **Box notation** row, `[x . x . x x . x . x . x]`, downbeat highlighted (as in the
  illustration).
- **The T2 glyph is the rhythm necklace.** The donut already *is* the 12-pulse circle;
  add a **playhead that sweeps clockwise from the top (root)** once per bar, flashing
  each onset as it passes. One picture then serves both pitch and time — the pitch
  glyph and the rhythm are literally the same object.

## "Deep" annotation (nice-to-have)

A set is **deep** when every interval class occurs a *distinct* number of times. The
diatonic scale is the prototype: its interval vector `[2,5,4,3,6,1]` has six
all-different multiplicities. **Decided: show a "deep" badge** on the scales that
qualify (diatonic, harmonic/melodic minor, …), tying the maths to the sound. Also
surface a **Euclidean / maximally-even** badge where it applies — the paper connects
evenness to these rhythms.

## Implementation notes

- Onset set = pitch classes (already computed); inter-onset intervals = `steps`.
- Audio: add a percussive click voice + a looping scheduler to `audio.ts`; accent =
  louder/brighter first hit. Tempo + loop controls.
- Optional `isDeep(steps)` predicate in `theory/` (all interval-vector multiplicities
  distinct) for the badge.
- Cycle = 12 pulses by default (true to the chromatic scale).

## Decisions (locked 2026-06-16)

1. **Readings:** offer **both** — 12-pulse chromatic (default) *and* an n-pulse
   metre reading.
2. **Voice:** single **wood-block** click (accented downbeat); not pitched per degree.
3. **Badges:** **show the "deep" badge** (and a Euclidean / maximally-even badge
   where it applies).

## Reference

Godfried T. Toussaint, *deep rhythms*, CCCG 2005 —
<https://cgm.cs.mcgill.ca/~godfried/publications/deep.rhythms.cccg05.pdf>
