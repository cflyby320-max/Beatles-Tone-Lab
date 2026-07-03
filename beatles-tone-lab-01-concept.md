# Beatles Tone Lab — Concept Document

**Version:** 1.0 · **Date:** July 2026 · **Owner:** Captain
**Companion doc:** `beatles-tone-lab-02-technical-prd.md`

---

## 1. One-liner

A browser-based guitar amp experience where you plug in your guitar and step into specific Beatles recordings — not "clean / crunch / lead" presets, but **"Taxman," "And Your Bird Can Sing," "Get Back."**

## 2. Why this exists

Commercial amp sims (Spark, AmpliTube, Bias FX) win on DSP fidelity. This project does not compete on fidelity. It competes on **curation and storytelling**:

- Every preset is a *recording*, not a sound. It carries the year, the gear chain, and a short "why it sounds like this" note.
- It's a **tone museum** you can walk through with a guitar in your hands.
- It runs in a browser tab. No install, no account, no subscription. Shareable with a URL.

Personal motivations (context for design decisions):

- Feeds the owner's music room / recording corner project — this becomes the "silent practice + tone study" station.
- The owner's Positive Grid Spark research (Beatles-specific tone prompts) becomes the preset spec sheet — that work gets a permanent home here.
- Sequel in spirit to the Beatles Jam Session Scorebook: build artifacts around the music, don't just consume it.

## 3. Audience

1. **Primary: the owner.** A guitarist who wants to practice and explore Beatles tones at night without waking a toddler.
2. **Secondary: guitar-playing friends / jam colleagues.** Receive a link, plug in, grin.
3. **Tertiary: non-players.** Can still tour the museum via **Listen Mode** (bundled demo riffs per preset).

## 4. Product principles

1. **Songs, not settings.** The user never has to know what a tonestack is. They pick "Get Back" and it sounds like the rooftop.
2. **Story is a feature.** Each preset's gear-chain note is as important as its DSP parameters.
3. **No-fail exploration.** Everything is a preset away from sounding good. Exposed knobs are few and safe (echoing the Helper Town no-fail philosophy, adult edition).
4. **Own nothing you don't need to own.** Fork proven DSP (AmpSim3 engine), spend creative effort on presets and UI.
5. **Honest limits.** Web Audio latency is playable, not professional. The app says so instead of pretending.

## 5. The two modes

| Mode | Input | Purpose |
|---|---|---|
| **Play** | Live guitar via audio interface (getUserMedia) | Practice / tone exploration. Desktop Chrome + external interface is the happy path. |
| **Listen** | Bundled dry demo riff loops, re-amped through the preset chain in real time | Works with zero hardware, on mobile, and for non-players. Also the demo/sharing surface. |

Listen Mode is not an afterthought — it is the fallback for iOS/mobile and the primary shareable experience.

## 6. Core experience: the Timeline

Horizontal navigation strip, **1962 → 1970**, grouped by album/era. Selecting an era loads its preset cards and shifts the visual theme:

- **1962–64 (Beatlemania):** monochrome, Rickenbacker/Gretsch chime, suit-and-tie minimalism.
- **1965–66 (Rubber Soul / Revolver):** warmer palette, first fuzz, folk-rock jangle.
- **1967 (Pepper / MMT):** saturated psychedelic color, Leslie swirl.
- **1968 (White Album):** stark white, raw and dry tones.
- **1969–70 (Abbey Road / Let It Be):** rooftop grit, warm tape, Casino-through-cranked-Twin clarity.

## 7. Launch preset list (v1 = 6 presets)

| # | Song (tone) | Year | Guitar | Amp | Pedals / FX | Tone character |
|---|---|---|---|---|---|---|
| 1 | *I Saw Her Standing There* (early clean chime) | 1963 | Gretsch/Ricky-ish bright single coil | Vox AC30 Top Boost | Light comp | Bright, bouncy, slightly hairy clean |
| 2 | *A Hard Day's Night* (jangle) | 1964 | 12-string character EQ | Vox AC30 | Comp + plate verb | Chimey, compressed jangle (12-string *feel* via EQ/chorus trick) |
| 3 | *Taxman* (fuzz bite) | 1966 | Casino / P90 flavor | Vox AC30 pushed | Tone Bender-style fuzz | Aggressive midrange fuzz, tight low end |
| 4 | *Lucy in the Sky* (psych swirl) | 1967 | Strat-ish | Fender blackface | Leslie/vibrato sim + verb | Watery, rotating, dreamlike |
| 5 | *Get Back* (rooftop clean) | 1969 | Casino | Fender Twin/Showman edge-of-breakup | None (maybe slap echo) | Warm, dynamic, honest — the reference preset |
| 6 | *Helter Skelter* (heavy) | 1968 | Humbucker-ish drive | Cranked stack voicing | Fuzz + drive stacked | Chaotic, saturated, loud-feeling |

Each preset card shows:

1. **Song + album art-style era badge** (original artwork not used — see legal note).
2. **Gear chain diagram** (guitar → pedals → amp → cab, as simple icons).
3. **Story note** (2–4 sentences: what was actually used, what we're approximating, one listening cue).
4. **Exposed knobs:** Gain, Tone, Reverb, Master only. Everything else lives inside the preset.
5. **Play/Listen toggle** and demo riff play button.

## 8. What v1 is NOT

- Not a preset-sharing platform (no accounts, no cloud saves; local persistence only).
- Not a DAW or recorder (v2 candidate: capture a take).
- Not mobile Play Mode (iOS live-input latency is out of scope; mobile gets Listen Mode).
- Not a general amp sim with amp/cab mix-and-match — the curation IS the product.

## 9. Legal / content guardrails

- **No Beatles recordings, samples, or interpolations anywhere.** All demo riffs are original, self-recorded dry guitar phrases *evocative of* each era. This is both a rights requirement and a better showcase (dry-through-chain proves the DSP).
- No original album artwork; use era-evocative original design instead.
- Song titles used descriptively/referentially in preset names; keep an eye on this if the project ever becomes commercial — for a free personal/portfolio project it stays low-risk. (Not legal advice; revisit before any monetization.)
- Base repo (AmpSim3) license terms must be checked and attribution preserved. IRs must come from free/redistributable packs with licenses recorded in `CREDITS.md`.

## 10. Success criteria (v1)

1. **The Grin Test:** owner plugs a Casino-style guitar into preset #5 (*Get Back*) and grins within 10 seconds.
2. Total dry-signal-to-ear latency acceptable for rhythm playing on desktop Chrome + external interface (target < ~20 ms added by the app graph; see PRD).
3. A non-player friend can open the link on a phone, tour all 6 presets in Listen Mode, and understand the gear story without explanation.
4. Shipped on HTTPS static hosting with a shareable URL.

## 11. Future ideas (parking lot, not v1)

- Record/export a take (MediaRecorder).
- A/B "bypass vs. preset" toggle for tone education.
- More eras: solo-Beatles tones (All Things Must Pass wall of sound, Plastic Ono rawness).
- "Guess the tone" quiz mode using Listen Mode riffs.
- Community preset submissions (schema already supports it).
- Bahasa Indonesia localization of story notes.
- **Neural Amp Modeler (NAM) fidelity mode** — a v2 experiment to run captured-amp neural models in-browser (WASM/AudioWorklet). Deliberately parked; see `docs/decisions/0001-classic-waveshaper-engine.md`.
