# Tone Notes — owner research input to preset tuning

**Status:** template/stub. Fill in per-preset as you tune each one by ear against the
real recording (PRD §3.2 / Appendix A.4 draft-tone discipline).

This file is the durable home for the tone research the concept doc originally expected
from "Spark/Beatles tone research" (see `beatles-tone-lab-01-concept.md` §2). There is no
prior research file to migrate — this is a fresh start, filled in preset by preset as you
work through them. Nothing here blocks implementation: presets ship with best-guess
`"status": "draft"` params (Appendix A.4) and get promoted to `"status": "verified"` once
you've done the by-ear pass described below and updated the matching JSON in `src/presets/`.

## How to use this file

For each preset, capture three things (per the methodology agreed with the owner):

1. **Documented gear facts** — what's publicly known about the actual recording's guitar/
   amp/pedals (books, interviews, gear-history sources). Tells you *what* to emulate, not
   exact knob values.
2. **Listening-by-ear calibration** — play the real track next to the current preset and
   note what's off: too bright, too much low end, gain too high/low, reverb too wet, etc.
3. **Resulting parameter deltas** — the concrete change to make in the preset JSON, and
   whether that closes the gap enough to flip `"status"` to `"verified"`.

## Get Back (1969) — `src/presets/get-back-1969.json`

**Gear facts (documented):** Epiphone Casino through a Fender Twin/Showman pushed to the
edge of breakup, minimal-to-no pedals, rooftop performance.

**Listening notes:** _(fill in after comparing the current FENDER_BLACKFACE draft against
the real recording)_

**Parameter deltas:** _(fill in — e.g. "treble too bright at default 0.62, try 0.55")_

**Status:** draft (per `src/presets/get-back-1969.json`)

---

## I Saw Her Standing There (1963) — `src/presets/i-saw-her-standing-there-1963.json`

**Gear facts (documented):** Early Beatlemania live/studio sound — bright single-coil
guitars (Gretsch/Rickenbacker-family) through a Vox AC30 Top Boost, minimal effects
beyond light compression from the era's recording chain. No fuzz, no reverb-heavy
production; a dry, punchy clean.

**Listening notes:** _(fill in after comparing the current VOX_TOPBOOST draft against
the real recording — this is the M2 best-guess first pass, not yet ear-tuned)_

**Parameter deltas:** _(fill in — e.g. "treble too bright at default 0.72, try 0.65")_

**Status:** draft (per `src/presets/i-saw-her-standing-there-1963.json`)

---

## A Hard Day's Night (1964) — `src/presets/a-hard-days-night-1964.json`

**Gear facts (documented):** The title track's famous opening chord and jangly rhythm
bed are widely attributed to George Harrison's Rickenbacker 360/12 through a Vox AC30.
v1 does not model a real 12-string (out of scope per PRD §2.3 — 3 voicings only); this
preset fakes the "12-string feel" with brighter EQ + more compression than the other
Vox-voiced presets, per the concept doc's explicit EQ/chorus-trick approach.

**Listening notes:** _(fill in after comparing against the real recording)_

**Parameter deltas:** _(fill in)_

**Status:** draft (per `src/presets/a-hard-days-night-1964.json`)

---

## Taxman (1966) — `src/presets/taxman-1966.json`

**Gear facts (documented):** A Tone Bender-style fuzz through a pushed Vox AC30 drives
the famous solo — well documented as played by Paul McCartney on a Casino/P90-flavored
guitar, not George Harrison despite the songwriting credit. Aggressive midrange bite,
tight low end (not a fat/scooped fuzz).

**Listening notes:** _(fill in after comparing against the real recording)_

**Parameter deltas:** _(fill in — the fuzz pedal's fixed drive/tone constants in
`src/engine/pedals/fuzz.js` may also need adjustment once the by-ear pass starts, not
just this preset's JSON)_

**Status:** draft (per `src/presets/taxman-1966.json`)

---

## Lucy in the Sky with Diamonds (1967) — `src/presets/lucy-in-the-sky-1967.json`

**Gear facts (documented):** Sgt. Pepper-era psychedelic textures leaned on rotating-
speaker (Leslie) and studio modulation effects over clean Fender-style amp tones.
Approximated here with the new Leslie pedal (pitch vibrato + tremolo + stereo spread)
over the existing FENDER_BLACKFACE voicing.

**Listening notes:** _(fill in after comparing against the real recording)_

**Parameter deltas:** _(fill in — the Leslie pedal's fixed rotor-speed/depth constants
in `src/engine/pedals/leslie.js` are a likely tuning target alongside this preset's
reverb mix)_

**Status:** draft (per `src/presets/lucy-in-the-sky-1967.json`)

---

## Helter Skelter (1968) — `src/presets/helter-skelter-1968.json`

**Gear facts (documented):** One of the loudest, most overdriven White Album tracks —
often cited as a proto-metal/proto-punk moment. Cranked amp stack + a driven,
humbucker-like guitar tone, with the fuzz pedal stacked in front for extra saturation.

**Listening notes:** _(fill in after comparing against the real recording)_

**Parameter deltas:** _(fill in — note that `cabinet.ir` currently reuses
`fender-cab-01` as a placeholder; a dedicated heavier-voiced cab IR is a fast-follow,
see CREDITS.md)_

**Status:** draft (per `src/presets/helter-skelter-1968.json`)
