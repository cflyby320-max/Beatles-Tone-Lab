# Beatles Tone Lab — UI Design Doc

**Version:** 1.0 · **Date:** 2026-07-03 · **Owner:** Captain
**Companion docs:** `beatles-tone-lab-01-concept.md` (vision, era palettes §6), `beatles-tone-lab-02-technical-prd.md` §5 (UI spec)

**Audience:** implementing agents building/extending the UI, and the owner reviewing visual PRs.

---

## 0. What this doc is for

The PRD (§5) defines the UI's *structure and interaction rules*. This doc defines the
*visual system* those rules render through: tokens, palettes, typography, component specs.
M1 shipped a minimal single-preset slice using this system in miniature (§4 records exactly
what shipped); M3 scales it to the full timeline + 6 presets.

## 1. Design principles

1. **Museum placard, not a mixing console.** Story text and gear-chain get equal visual
   weight to the knobs. The reader should be able to understand a preset without touching it.
2. **Warm, not skeuomorphic.** No fake brushed-metal knobs or amp-grille textures (that was
   the old AmpSim3 GUI). Flat, warm, editorial — closer to a printed exhibit card than a
   guitar pedal.
3. **Theme-aware by construction.** Every color is a CSS custom property with a light and
   dark value. No component hardcodes a hex.
4. **Honest about limits.** The "Play Mode needs desktop Chrome + interface" message is a
   first-class UI element, not an apologetic footnote.
5. **No-fail visually too.** Nothing in the UI can look "broken" — missing IR/riff shows a
   status-bar message, never a blank or crashed component (mirrors the engine's error events).

## 2. Design tokens (shipped in `css/slice.css`)

```css
--bg            /* page background */
--surface       /* card / control background */
--ink           /* primary text */
--ink-soft      /* secondary text, story copy, labels */
--line          /* borders, dividers */
--accent        /* era accent — drives badges, active states, the accent border on cards */
--accent-ink    /* text/icon color ON TOP of --accent */
--radius: 14px  /* card corner radius */
--shadow        /* card elevation, two-layer (crisp + soft) */
```

Light and dark values are both defined; dark activates via `prefers-reduced-motion`'s sibling,
`prefers-color-scheme: dark`. **Rule: every new color introduced by a future component must be
added as a token pair (light+dark), never a literal hex in component CSS.**

Current values (1969-70 "rooftop warmth" era, shipped in M1):

| Token | Light | Dark |
|---|---|---|
| `--bg` | `#f4f1ea` | `#17150f` |
| `--surface` | `#fffdf8` | `#211d16` |
| `--ink` | `#1c1a17` | `#f2ede2` |
| `--ink-soft` | `#5c574e` | `#b3aa98` |
| `--accent` | `#b5762f` | `#e0a25a` |
| `--accent-ink` | `#fff` | `#1c1408` |

## 3. Era palettes (from concept doc §6 — target for M3 timeline)

Each era gets its own token set, swapped via a CSS class on the root (`.era-1962-64`, etc. —
`index.html` already carries `class="era-1969-70"` on `#app` as the M1 placeholder for this
mechanism). Direction (exact hex TBD when built, keep `--accent-ink` contrast-checked ≥ 4.5:1):

| Era | Character | Direction |
|---|---|---|
| 1962–64 (Beatlemania) | monochrome, suit-and-tie minimalism | near-grayscale `--bg`/`--surface`, single restrained accent |
| 1965–66 (Rubber Soul/Revolver) | warmer, first fuzz, folk-rock jangle | amber/olive accent, slightly saturated |
| 1967 (Pepper/MMT) | saturated psychedelic, Leslie swirl | high-chroma accent (magenta/teal), can break the "restrained" rule deliberately |
| 1968 (White Album) | stark white, raw and dry | near-white `--bg`, minimal accent, high contrast |
| 1969–70 (Abbey Road/Let It Be) | rooftop grit, warm tape | **shipped** — see §2 table above |

Switching eras swaps the token set only — component structure/markup does not change
(PRD §5.2: era switch changes theme in < 200 ms, no layout reflow).

## 4. Components

### 4.1 Preset card (`src/ui/presetCard.js`, shipped M1)
- Header: song title (large), era/album badge (`--accent` background), optional "draft tone"
  badge (dashed `--accent` outline) when `preset.status === "draft"`.
- Gear chain: chips (guitar → pedals → amp → cabinet) joined by arrow glyphs, rendered
  entirely from `preset.gear` — never hardcoded copy.
- Story: `--ink-soft` body text, 2–4 sentences, museum-placard tone.
- Card container: `--surface` background, `--radius` corners, `--shadow` elevation, a 4px
  `--accent` top border (the one place accent color reads as a strong bar, elsewhere it's used
  sparingly as badges/highlights, not fills).

### 4.2 Knob cluster (`src/ui/knobs.js`, shipped M1)
- Exactly 4 knobs: **Gain / Tone / Reverb / Master** (PRD §3.1 `exposedKnobs`, in that order
  when present). Each maps to one dotted param path — the UI never exposes a 5th control.
- Each knob: label (uppercase, small, `--ink-soft`) + native `<input type=range>` (accent-styled
  via `accent-color: var(--accent)`) + numeric readout (0–10 display scale, tabular-nums).
- Interaction: drag updates live; **double-click resets to the preset's original value**
  (PRD §5.2); full keyboard access (native range input — arrow keys work out of the box);
  `aria-label` per knob.
- M3 TODO: replace native `<input type=range>` with custom-styled vertical drag controls per
  PRD §5.2, keeping the same keyboard/ARIA contract — do not regress accessibility when
  restyling.

### 4.3 Listen/Play toggle (`src/ui/listenMode.js`, Listen shipped M1; Play is M-later)
- Single pill button, `--accent` fill, `--accent-ink` text. Playing state = darkened fill
  (`color-mix(in srgb, var(--accent) 65%, #000)`), label swaps ▶/❚❚.
- M-later: a Play Mode variant needs a second control (device picker) — reuse the same pill
  shape, add a compact `<select>` beside it; do not introduce a different button style.

### 4.4 Status bar (`src/ui/statusBar.js`, shipped M1)
- Bottom-anchored, thin top border (`--line`), small `--ink-soft` text, tabular-nums.
- Slots: AudioContext state, sample rate, latency readout (ms), an error slot (hidden unless
  populated) styled in a dedicated `--error` token — **add `--error`/`--error-ink` as a token
  pair** the first time this is needed in a new component; already used inline in `slice.css`.
- Error slot text comes verbatim from engine `ir-error`/riff-error events — never a generic
  "something went wrong."

### 4.5 Timeline strip (M3 — not yet built)
- Horizontal strip, one segment per era (§3 table), pinned above preset cards.
- Selecting an era: (a) swaps the era token set on the root, (b) filters visible preset cards
  to that era. Both must complete within the PRD's 200ms budget with no visible reflow jump —
  prefer a CSS transition on `background`/`color`, not a full re-render.
- Active segment gets the era's own `--accent`; inactive segments render in a neutral shared
  tone so the strip itself doesn't fight the active era's palette.

## 5. Typography

- System font stack (`ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica,
  Arial, sans-serif`) — no webfont load, keeps payload budget (PRD §1 asset budget) untouched
  by typography.
- Song titles: `clamp()`-scaled, tight letter-spacing (`-0.01em` to `-0.02em`) for an editorial
  masthead feel.
- Story copy and labels: default tracking; labels use uppercase + wide letter-spacing
  (`0.04–0.05em`) to read as museum-placard metadata, not body prose.
- Numeric readouts (knob values, latency, sample rate): `font-variant-numeric: tabular-nums`
  everywhere, so digits don't jitter the layout as they change.

## 6. Motion & accessibility

- Preset switch crossfade: ~80 ms (PRD §5.2) — never an audible or visual pop.
- All transitions/animations must respect `prefers-reduced-motion` once any are added beyond
  the current hover/press micro-interactions on the play button (M1 has none that need
  reduction yet; flag this explicitly when the timeline/era-switch transition is built in M3).
- Contrast: `--ink`/`--ink-soft` against `--bg`/`--surface` must hold WCAG AA in both themes;
  check any new era palette (§3) the same way before shipping it.
- Hit targets: knobs and buttons sized for mouse + touch (no toddler-scale requirement here,
  but don't go below common ~40px touch targets on the Listen/Play button and knob thumbs).

## 7. What M1 shipped vs. what M3 builds

| Area | M1 (shipped) | M3 (to build) |
|---|---|---|
| Layout | single preset card, single view | timeline strip + filtered multi-card grid |
| Era theming | one era's tokens hardcoded (`.era-1969-70` class present, unused as a switch) | full era-switch mechanism (§3, §4.5) |
| Knobs | native range inputs | custom-styled drag controls, same keyboard/ARIA contract |
| Modes | Listen Mode only | Play Mode UI (device picker, mic permission flow) added alongside |
| Presets shown | 1 (Get Back) | 6, filterable by era |

## 8. Reuse checklist for future UI work

Before adding a new component, reuse before rebuilding:
- Color → an existing token (§2) or a new token pair added to *both* the light and dark blocks.
- Card/surface chrome → the `.preset-card` pattern (`--surface` + `--radius` + `--shadow`).
- Button chrome → the `.play-toggle` pill pattern (§4.3).
- Status/error messaging → the status bar's error slot pattern (§4.4), not a new toast/modal system.
