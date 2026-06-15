# MyScales — Design Document

*A local, data-driven web app for understanding and practising piano scales.*

Status: **design draft** (no implementation decisions locked beyond what is stated here).
Author interview captured in [interview.md](interview.md). Date: 2026-06-16.

---

## 1. Purpose & worldview

The tool answers a practising pianist's questions, in this order of priority:

1. **"What is the *shape* of this scale?"** — where the 1-, 2-, 3-, and 4-semitone
   gaps fall. This is the hero of every page.
2. **"What does it sound like / what is it called?"** — discover a scale by its
   character (*"the one that sounds Egyptian in Caravan"*), then hear it.
3. **"What are the exact notes in C, or E♭?"** — pick a key and see the spelling.
4. **"Where do my thumbs go?"** — classical fingering, both hands, with the
   thumb-turns made obvious.

A typical session: *find a scale by name/character → choose a key → study the
interval shape → see the notes on keyboard + stave → hear it → learn the
fingering → print the A4 sheet.*

Everything is **data-driven**: a scale is defined by a minimal record in a static
JSON catalog, and every page is *generated at runtime* from that record plus the
selected key. Adding a scale = adding data, not code.

---

## 2. Core concept: the minimal scale definition

The **only** structural fact needed to define a scale form is its **ordered list
of semitone steps**, which sum to 12 (one octave).

```
Major            [2, 2, 1, 2, 2, 2, 1]
Natural minor    [2, 1, 2, 2, 1, 2, 2]
Harmonic minor   [2, 1, 2, 2, 1, 3, 1]
Major pentatonic [2, 2, 3, 2, 3]
Minor blues      [3, 2, 1, 1, 3, 2]
Whole tone       [2, 2, 2, 2, 2, 2]
Octatonic (H-W)  [1, 2, 1, 2, 1, 2, 1, 2]
```

From `steps` alone the app derives: number of notes, cumulative semitone
positions (the pitch-class set), the gap-colour pattern, scale-degree labels,
note spelling in any key, the keyboard fill pattern, the stave, and a rule-based
fingering. Everything else in a scale record is **metadata** (names, relations,
character, curated overrides).

### 2.1 Scale record schema (catalog JSON)

```jsonc
{
  // ── identity (id & pcNumber are DERIVED from steps — see §2.2) ──
  "id": "1-3-1-2-1-2-2",        // canonical, content-addressed. the merge/join key.
  "slug": "phrygian-dominant",  // optional friendly URL alias for named scales
  "pcNumber": 1459,             // optional derived 12-bit pitch-class number

  // ── the one required structural fact ──────────────────────────
  "steps": [1, 3, 1, 2, 1, 2, 2],   // REQUIRED, sums to 12. everything derives from this.

  // ── metadata (all optional) ───────────────────────────────────
  "name": "Phrygian Dominant",
  "aliases": ["Spanish Phrygian", "Freygish", "Hijaz"],
  "description": "Major third over a Phrygian ♭2/♭6 — the harmonic-minor dominant.",
  "mood": "Tense, exotic, Spanish / Middle-Eastern.",
  "colour": "deep amber, smoky red",        // your synesthetic feel — free text
  "examples": ["Caravan (the 'Egyptian' sound)", "Misirlou", "Hava Nagila"],
  "family": "exotic",                        // organisational grouping in the nav tree
  "parent": {                                // documentary relation only
    "scaleId": "2-1-2-2-1-3-1",
    "degree": 5,
    "text": "5th mode of the harmonic minor scale"
  },
  "relations": ["2-1-2-2-1-3-1", "phrygian", "double-harmonic"], // ids or slugs

  // ── overrides (optional) ──────────────────────────────────────
  "fingering": {                             // else rule-based (§10)
    "rh": [1,2,3,1,2,3,4, 1,2,3,1,2,3,4,5],  // two octaves
    "lh": [5,4,3,2,1,3,2,1, 4,3,2,1,3,2,1, 5]
  },
  "spellingHint": "natural"                  // optional nudge for enharmonic choices
}
```

Authoring a scale means supplying `steps` plus whatever metadata you have; `id`,
`pcNumber`, and all musical detail are computed.

- `name`/`aliases` drive search and the page title.
- `family` is purely organisational (diatonic, melodic/harmonic minor, pentatonic,
  blues, symmetric, exotic, *generated*).
- `parent` is **documentary only** — every mode is a first-class record in its own
  right, but can *say* "2nd mode of Major", matching how you think about modes.
- `relations` produce the on-page "close relatives" links.
- `description`/`mood`/`colour`/`examples` power discovery-by-vibe (search by "Egyptian",
  "Caravan", "warm", etc.). `colour` is your free-text synesthetic feel, distinct from
  the gap/degree display palettes in §6.
- `fingering` is present only when we want to pin a conservatoire-standard
  fingering; otherwise the rule engine (§5) supplies one for any scale.

The catalog ships as a small set of hand-authored named scales **plus** the
generated set (§3), merged at build/runtime by `id`.

### 2.2 Scale `id` — encoding the intervals

The `id` is a **deterministic encoding of `steps`**, not a hand-chosen name. This
is worth more than tidiness:

- **Content-addressed & unique** per rooted shape — no manual id bookkeeping, no
  accidental collisions or duplicates.
- **It *is* the merge key.** The encyclopedia generator computes the same id for a
  shape, so a named metadata record automatically attaches to its generated scale.
  This *replaces* the pitch-class matching that §3.2 would otherwise need.
- **Rotation-sensitive on purpose.** Major `2-2-1-2-2-2-1` and Dorian
  `2-1-2-2-2-1-2` get different ids, so every mode is its own first-class record —
  exactly the framing we chose.

**Primary encoding — the interval-step string.** Hyphen-join the steps:

```
steps [2,2,1,2,2,2,1]  →  id "2-2-1-2-2-2-1"
```

- Human-readable: the id literally *is* the interval signature shown on the page.
- Reversible with no lookup: `id.split('-').map(Number)` → `steps`.
- URL-safe; used directly as the route for un-named/generated scales.
- (A compact `2212221` form also works under the ≤4-semitone rule since every step
  is one digit, but the hyphenated form stays unambiguous for *any* pattern, so it
  is the canonical form.)

**Secondary encoding — pitch-class number (derived, optional).** The 12-bit bitmask
of the rooted pitch-class set as a decimal `pcNumber` (root = bit 0). Major = 2741;
Phrygian Dominant = 1459. Equivalent information, more compact, and it matches the
numbering used in external scale databases (e.g. Ian Ring's catalog) for
cross-reference. Kept as a convenience field, **not** the primary id, because the
step-string reads as a shape and the bitmask does not.

**Friendly URLs.** Named scales carry an optional `slug` (`phrygian-dominant`) for
pretty links; the router resolves `slug → id`, falling back to the raw id for
generated scales. `relations`/`parent.scaleId` may reference either an id or a slug
and are resolved the same way.

---

## 3. The encyclopedia generator

**Decision: "Named-rich + Explorer".** Named scales get full curated pages.
A generator produces the *complete* valid set; un-named scales are browsable in a
separate **Explorer** view, identified by their interval signature.

### 3.1 Generation rule

Enumerate every ordered cyclic step-pattern summing to 12 such that:

- **note count** `n` ∈ [5, 8] (i.e. 5–8 steps), and
- **largest single step** ≤ 4 semitones (your "≤ 2 tones", which still admits the
  blues scale's 3-semitone leaps).

This captures the "evenly-ish spread" scales you care about while excluding
degenerate cases (e.g. 7 semitones then one huge jump). Rotations of the same
pattern are the same *shape* in different modes; the Explorer can either:
- list **one representative per rotation-class** (the "prime form"), or
- list **all rotations** so each mode appears.

→ *Open decision 3.1: collapse rotations to prime form, or show every mode?*
Recommendation: show every rotation but visually group rotation-families.

### 3.2 Naming — by shared `id`

Each generated scale computes its `id` (§2.2); a named catalog record with the
**same id** attaches its metadata automatically — no separate pitch-class matching.
Shapes with no named record are labelled by their interval signature (which simply
*is* their id, e.g. **`2-2-1-2-1-2-2`**), and the app lets you propose/save a name
locally for future chord work.

---

## 4. Page anatomy (one scale form = one A4 landscape sheet)

Both **screen and print are landscape**, using the **full available width**, with
the non-printing nav sidebar (§8) occupying the left margin on screen only. Each
scale page is laid out to **fit a single A4 landscape page when printed**, frozen on
the currently-selected key. The extra width gives the grand staff and the
two-octave keyboard/fingering runs room to breathe. On screen it's colourful; print
uses a light, low-ink stylesheet.

```
┌─────────┬──────────────────────────────────────────────────────────────────────┐
│ SIDEBAR │  Phrygian Dominant        [key: C ▾]  [♯/♭] [#|Roman]  [▶ play]        │
│ (nav,   │  "5th mode of harmonic minor" · Spanish/Middle-Eastern                 │
│  screen ├──────────────────────────────────────────────────────────────────────┤
│  only,  │  INTERVAL LINE  (key-agnostic shape — the hero, full width)            │
│  not    │  1     ♭2          3     4     5     ♭6          ♭7    (8)              │
│  printed)│ ●——————●——————————————●—————●—————●——————————————●—————●               │
│         │     1        3          1     2     1         2        2  ← gaps, COLOURED│
│  ▸ Major ├──────────────────────────────────────────────────────────────────────┤
│  ▸ Modes │  KEYBOARD  (two octaves, key-specific)     │  GRAND STAFF  (key sig,   │
│  ▸ Minor │  [▓░▓░░▓░▓░▓░  ▓░▓░░▓░▓░▓░  finger nos]     │   asc + desc)             │
│  ▸ Penta │  hover → "E♭ = ♭3"                          │  𝄞 ───────  𝄢 ───────     │
│  ▸ Blues ├────────────────────────────────────────────┴──────────────────────────┤
│  ▸ Exotic│  Notes table  ·  close relatives  ·  examples / well-known tunes        │
│  ▸ Explorer└────────────────────────────────────────────────────────────────────┘
```

The wider canvas lets the keyboard and stave sit **side by side** below the
full-width interval line, rather than stacking, so everything still fits one sheet.

A **non-printing sidebar** (left) holds the navigation tree (§8).

---

## 5. Components

### 5.1 Interval line (hero, key-agnostic)

- **Linear**, left→right, representing the abstract shape (not a specific key).
- Plots the scale degrees as nodes along a 0→12 semitone axis; **includes the
  returning 8th** (root an octave up). Optional **two-octave** rendering for
  fingering study.
- **Gap numbers are the visual hero**: between each pair of adjacent nodes, the
  count of semitones (1/2/3/4) is printed large.
- **Colour-coded by gap size** — a fixed palette so patterns leap out across
  scales (see §6).
- **Scale degrees** labelled at each node: `1 ♭2 3 4 5 ♭6 ♭7 (8)`. Toggle between
  **Arabic numbers** and **Roman numerals**.

### 5.2 Keyboard (key-specific instance)

- **Two octaves.**
- Scale notes shown as **filled keys**. Degree-signature colouring: the **root,
  4th, 5th, and 7th** get distinct signature colours; a flat/sharp variant of a
  degree renders **darker/lighter** than its natural; remaining degrees (2,3,6)
  use a neutral fill.
- **Finger numbers** printed on each scale key; the **thumb (1) is bold** so the
  thumb-turns pop. RH above the keys, LH below (or a hand toggle — see open
  decision 5.2).
- **Hover** any key → a side info box shows the concrete note name and degree
  (e.g. "E♭ = ♭3").
- Click/drag interactions are audio (§5.4).

→ *Open decision 5.2: show RH and LH fingerings simultaneously (stacked) or via a
hand toggle?* Recommendation: stacked, with a toggle to isolate one hand.

### 5.3 Grand staff

- **Grand staff** (treble 𝄞 + bass 𝄢).
- Render with the **key signature** clustered at the clef where the scale is
  diatonic; non-diatonic scales fall back to inline accidentals (see §7.3).
- **Ascending + descending** (important for melodic minor, whose descent differs).
- Rendered by a notation library (VexFlow or abcjs — §9).

### 5.4 Audio

**Decision: sampled piano by default + optional Web MIDI output.**

- **Default:** an in-browser **sampled piano** (soundfont / sample set) via Web
  Audio — works on any machine with zero setup.
- **Optional:** a **Web MIDI** output toggle that sends note events to a chosen
  MIDI destination (your macOS-configured piano or a DAW). Falls back silently to
  samples if no destination is selected.
- Controls:
  - **▶ Play** — ascending then descending, single fixed tempo.
  - **Click a key** — plays that single note.
  - **Drag along the keyboard** — plays the scale notes under the pointer
    (glissando-style across the highlighted keys).
- **No animation** of keyboard/line during playback (per preference).

---

## 6. Colour system

Two independent colour languages (both must survive the print stylesheet as light,
low-ink versions):

**A. Gap-size palette (interval line)** — by semitone distance:

| Gap | Meaning | Role |
|-----|---------|------|
| 1 | semitone | distinct hue 1 |
| 2 | whole tone | distinct hue 2 |
| 3 | min. third leap | distinct hue 3 |
| 4 | major third leap | distinct hue 4 |

**B. Degree-signature palette (keyboard fills)** — root / 4th / 5th / 7th carry
signature colours; their ♭/♯ alterations render as a darker/lighter shade of the
same hue; degrees 2/3/6 use neutral.

→ *Open decision 6: exact hex values.* I'll propose a colourblind-safe, print-safe
palette in implementation and you can tune it.

---

## 7. Note spelling, keys & enharmonics

### 7.1 Key selection
- **All 12 keys**, chosen **by note name** (C, D♭, D, … B).
- An **enharmonic toggle (♯/♭)** decides spelling where a key/degree is ambiguous
  (G♭ vs F♯, etc.).

### 7.2 Spelling algorithm
- For **7-note diatonic** scales: assign **one letter name per scale degree**
  (A–G each used once), then apply accidentals — yielding correct notation and a
  clean key signature.
- For **non-7-note** scales (pentatonic, blues, symmetric, many generated ones):
  letter-per-degree can't hold; spelling is heuristic — minimise accidentals and
  honour the ♯/♭ toggle and any `spellingHint`.

### 7.3 Key signatures for non-diatonic scales
True key signatures are a diatonic concept. For modes we can notate using the
**parent major's key signature**; for symmetric/exotic/generated scales we fall
back to **explicit inline accidentals** with no clef signature. The stave clearly
reflects whichever path applies.

→ *Open decision 7.3: for the 7 modes, prefer the parent-major key signature, or
the tonic-major signature + accidentals (parallel framing)?* Your "modes derive
from the parent major" worldview suggests **parent-major signature** — recommended.

---

## 8. Navigation & discovery

- **Non-printing left sidebar**: a **tree** grouped by `family`
  (Diatonic & modes · Minor variants · Pentatonic · Blues · Symmetric · Exotic ·
  Explorer/Generated).
- **Search** by name, alias, **character, or example tune** (so *"Caravan"* or
  *"Egyptian"* finds the right scale) — directly serving your worldview.
- Each page lists **close relatives** (`relations`) as links.
- The **Explorer** view (§3) browses the full generated set by interval signature.

URLs: `/(scale)/[scaleId]?key=Eb&acc=flat` — shareable/bookmarkable, and the key &
enharmonic state live in the query string.

---

## 9. Technical architecture

**Decision: SvelteKit.** Lean runtime, file-based routing, first-class CSS &
`@media print` control, trivial static-data loading, and a smooth path to the
future chord feature.

- **Rendering model:** mostly static — pages generated from the JSON catalog at
  runtime in the browser; can be prerendered/SSG for instant load and offline use.
  A dev server is used while building; deployment can be a static bundle.
- **Catalog:** `src/lib/catalog/*.json` (named scales) + a generator module that
  produces the encyclopedia set; merged into one in-memory index keyed by `id`.
- **Music theory core** (`src/lib/theory/`): pure, well-tested functions —
  `stepsToPitchClasses`, `degreeLabels`, `spellInKey`, `keySignature`,
  `fingering` (§10). No framework deps; this is where the harmony logic lives and
  is unit-tested independently of the UI.
- **Rendering libs:**
  - Keyboard & interval line: **custom SVG** (full control over fills, finger
    numbers, gap colours, print scaling).
  - Stave: **VexFlow** or **abcjs** (→ open decision 9: pick after a spike;
    abcjs is terser, VexFlow more controllable).
  - Audio: **Web Audio API** + a sampled-piano library (e.g. a soundfont player);
    **Web MIDI API** for the optional output path.
- **Print:** dedicated `@media print` stylesheet with `@page { size: A4 landscape }`
  — hides the nav sidebar and on-screen controls, uses the full landscape width,
  light background, ink-economical colour, and locks the layout to one page on the
  selected key.
- **State:** selected key, enharmonic toggle, degree-label mode, octave count,
  active hand — all in URL/query + a small store.

---

## 10. Fingering engine

**Decision: rule-based generator with optional per-scale curated overrides.**

If a scale record has a `fingering` block, it is used verbatim. Otherwise the
engine derives one for **any** scale (named, exotic, or generated) from these
classical heuristics:

1. **Thumb (1) avoids black keys** wherever possible — thumbs land on white keys.
2. **Longer fingers (2, 3, 4) take the black keys.**
3. Partition each octave's degrees into **contiguous groups of 3 and 4**, fingered
   `1-2-3` and `1-2-3-4`, so a **thumb-under turn** occurs once per group boundary
   — and arrange boundaries so the thumb lands on white keys.
4. Prefer the **4th finger** on an isolated/unique black key (the classic anchor in
   B, B♭, E♭ major patterns).
5. **LH mirrors RH**: groups fingered `3-2-1` / `4-3-2-1`, with `5` starting the
   ascent's lowest note.
6. Across **two octaves**, repeat the per-octave pattern and cap with `5` (RH top /
   LH bottom).

This is implemented as a small constraint search over group boundaries, scoring
candidates by the rules above. Where it disagrees with conservatoire convention on
a tricky key, a curated `fingering` override settles it. The page can show a small
"fingering: standard / derived" badge so you know which you're looking at.

→ I'll surface the chosen rule explicitly on screen (a tooltip) so the *rule
itself* is learnable, per your note "let me know if there is a rule."

---

## 11. Printing

- **A4 landscape**, full-width layout, one scale form per sheet, **frozen on the
  selected key**. Screen and print share the same landscape proportions, so the
  printed sheet matches what's on screen (minus the sidebar).
- Sidebar, search, audio controls, and hover boxes are hidden in print.
- Colour retained but lightened for ink economy; gap numbers, degrees, note names,
  finger numbers, and the stave all remain crisp and legible in black-friendly
  tones.

---

## 12. Future: chords within scales

Not built now, but the architecture anticipates it:

- The theory core already yields each scale's pitch-classes and degrees, so
  diatonic triads/7ths per degree are a pure-function add-on.
- SvelteKit + the data-driven catalog let a future "chords" panel attach to the
  same scale record without restructuring.
- Reserve schema space (e.g. an optional `chords`/`harmony` block) but leave it
  unspecified for now.

---

## 13. Open decisions to confirm

| # | Decision | Recommendation |
|---|----------|----------------|
| 3.1 | Explorer: collapse rotations to prime form, or show every mode? | Show every rotation, grouped by family |
| 5.2 | Keyboard: both hands stacked, or hand toggle? | Stacked + isolate toggle |
| 6 | Exact gap & degree colour hex values | Propose colourblind/print-safe palette to tune |
| 7.3 | Mode key signatures: parent-major vs parallel-tonic | Parent-major signature |
| 9 | Stave library: VexFlow vs abcjs | Decide after a short spike |

---

## 14. Out of scope (for now)

- Chord voicings / progressions (future, §12).
- Non-piano instruments.
- Recording/scoring the user's playing.
- Multi-user accounts or cloud sync (this is a local app).
```
