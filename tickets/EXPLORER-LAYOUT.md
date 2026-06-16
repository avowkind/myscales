# Proposal: laying out the Explorer as a similarity map

*Status: **implemented** (EMD ego-network on each scale page).*

The Explorer currently sorts ~1,226 shapes by pitch-class number — a stable
index, but the ordering is arbitrary to the ear. This proposes laying scales out
so that **aurally similar scales sit near each other**, and discusses whether a
network graph is the right vehicle.

## 1. What "aurally similar" should mean — the distance metric

A scale is a set of pitch classes (rooted at the tonic). Candidate distances,
from most structural to most perceptual:

| Metric | What it measures | Notes |
|---|---|---|
| **Hamming / Jaccard** on the 12-bit pc-set | how many notes two scales *share* | simple, rooted; "C-major vs C-dorian share 5 of 7" |
| **Jensen–Shannon distance** | shared-note overlap, information-theoretic | this is almost certainly the "Shannon distance" you mean — see below |
| **Circular Earth-Mover's / voice-leading distance** | minimal total semitone *motion* to morph one scale into the other | most directly aural; my recommendation |
| **Interval-vector distance** | abstract harmonic *colour*, ignoring root | transposition-invariant; clusters by "flavour" not by shared notes |

### On "Shannon distance"
Treat each scale as a uniform probability distribution over its notes (each of
the *n* notes gets weight 1/*n*, the rest 0). The **Jensen–Shannon divergence** is
the symmetric, entropy-based divergence between two such distributions, and its
square root **√JSD is a true metric** — bounded in [0,1], so it embeds cleanly.
It effectively measures *note overlap*, gracefully normalised across different
note-counts (5-note vs 8-note). It's a sound choice and answers the question
"how much do these two scales overlap?"

### Why I'd lead with voice-leading distance instead
JSD (and Hamming) ask *which notes are shared*. The ear, though, tracks *motion*:
two scales feel adjacent when you can slide **one note by one semitone** to get
from one to the other. The **circular Earth-Mover's Distance** (Wasserstein-1 on
the pitch-class circle) captures exactly this — the minimal total semitone
displacement to transport one scale's notes onto the other's. It:

- equals **voice-leading effort**, the most perceptual notion of "close";
- handles 5–8-note scales together (mass can split/merge);
- is a genuine metric, so it drives any embedding or graph;
- gives intuitively *correct* neighbours. Worked example, rooted at C:
  - Major → **Lydian** (F→F♯): distance **1**
  - Major → **Mixolydian** (B→B♭): distance **1**
  - Major → Natural minor (three notes lowered): distance **3**

So Major's nearest neighbours come out as Lydian and Mixolydian — its brightest
and most dominant cousins. That matches the ear, and it's why the diatonic modes
fall into a single **brightness chain** (Lydian → Ionian → Mixolydian → Dorian →
Aeolian → Phrygian → Locrian), each a one-semitone step darker than the last.

**Recommendation:** circular EMD as the primary metric; expose **√JSD** as an
alternative toggle (it's cheap and gives a subtly different, overlap-based map).
Optionally offer interval-vector distance as a third "by colour, ignoring key" lens.

## 2. Layout / visualisation options

**A. Similarity atlas (recommended default).** Precompute the full distance
matrix (1,226² — trivial, done once at build), embed to 2D with **MDS or UMAP**,
and place every scale at its embedded coordinate. Colour by family, named scales
as labelled landmarks, the un-named multitude as faint dots. Every scale gets a
stable home; families self-cluster (pentatonics together, symmetric scales off on
their own island). This is the "star map / atlas" feel — the illustration is a
hand-built sketch of what the algorithm would produce.

**B. Voice-leading network (recommended companion).** Nodes = scales, edges =
"one move apart" (EMD = 1), or k-nearest-neighbours. Force-directed layout. This
is the **network graph** you asked about, and it's genuinely useful — but with
1,226 nodes the full graph is a hairball. Tame it by:
- showing an **ego-network**: pick a scale, show only its neighbours out to 1–2
  moves ("from Phrygian dominant, where can I go?") — perfect for practice;
- filtering by note-count (all 7-note scales, etc.);
- using kNN (k≈3) rather than a global threshold.

**C. Keep the grid as the "index" view.** The signature-sorted grid stays as one of
several toggleable layouts.

**Cell / node rendering — use the scale glyph.** In every view (grid, ego-network
nodes, atlas points) a scale is drawn as its **donut glyph** (ticket T2,
[SCALE-GLYPH.md](SCALE-GLYPH.md)) rather than its interval digits. The digit
signature — plus the name and EMD distance to the focused scale — appears on
**hover** (and as the `title`/`aria-label`). Glyphs make the map scannable by shape,
and in the ego-network "modes are rotations" becomes literal: a scale's modal
neighbours appear as rotated rings around it. This resolves T2's open question 2.

**D. Structured (theory-driven) alternatives**, if we'd rather not embed:
- **cardinality rings** — concentric rings for 5/6/7/8-note scales, angle by
  brightness or interval content;
- a **voice-leading lattice** (Tonnetz-like) — only the EMD-1 edges, laid out by
  hand for the named core; mathematically elegant, but doesn't scale to 1,226.

**Recommendation:** ship **A (atlas)** as the default map and **B (ego-network)**
as an interactive "explore neighbours" mode, with the grid retained as the index.
All three are views over the same precomputed distance data.

## 3. Does a network graph make sense?

Yes — but as a *focused* tool, not a 1,226-node global render. The atlas answers
"where does this scale live and what's around it?"; the ego-network answers "what
is one expressive step away from here?" Both serve your practice loop ("I like
this sound — what's its neighbourhood?") far better than the current numeric sort.

## 4. Cost / implementation sketch (when we build it)

- Distances: pure functions in `theory/` (EMD on a 12-bin circle; √JSD). ~1.5M
  pairs computed once at build → cache coordinates + kNN edges to static JSON.
- Embedding: MDS/UMAP at build time; the app just reads coordinates (no runtime
  ML). Force layout only needed for the live ego-network (small N).
- Reuses the existing family colour system and named/un-named distinction.

## 5. Decisions (locked 2026-06-16)

1. **Metric:** circular **Earth-Mover's distance** (voice-leading motion), rooted.
2. **Comparison frame:** **rooted** scales (all compared as if played from the
   same tonic; keeps parallel modes close).
3. **Primary view:** **ego-network** — pick a scale, show its neighbourhood out to
   1–2 moves. (Atlas/MDS deferred; the grid stays as the index.)
4. **Rendering:** scales are drawn as **donut glyphs** (T2), not digits; the
   interval signature, name and EMD distance show on hover.

Still to settle at build time:
- Neighbour rule for the ego-network: all scales within EMD ≤ *d* (e.g. *d* = 1),
  or k-nearest (k ≈ 4–6)? Likely a small adjustable "reach" control.
- How to render different-cardinality neighbours (a 6-note scale next to a 7-note
  one) — EMD handles the distance; the UI just needs to show note-count clearly.
