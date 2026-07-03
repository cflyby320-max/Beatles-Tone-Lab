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

## Template for the remaining 5 launch presets

Copy this block per preset as you start tuning it (see concept doc §7 for the full list:
I Saw Her Standing There, A Hard Day's Night, Taxman, Lucy in the Sky, Helter Skelter).

```md
## <Song> (<year>) — `src/presets/<id>.json`

**Gear facts (documented):**

**Listening notes:**

**Parameter deltas:**

**Status:** draft
```
