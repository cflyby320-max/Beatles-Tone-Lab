# Beatles Tone Lab

A browser guitar-amp experience where you plug in your guitar and step into specific
Beatles recordings — not "clean / crunch / lead" presets, but **"Taxman," "And Your Bird
Can Sing," "Get Back."** No install, no account, no subscription. Runs in a browser tab.

Beatles Tone Lab is a fork of [AmpSim3](https://github.com/micbuffa/WebAudio-Guitar-Amplifier-Simulator-3)
by Michel Buffa (MIT license — see `CREDITS.md`), turned into a curated "tone museum":
every preset carries a year, a gear chain, and a short story note, not just a sound.

**Read next:**
- `beatles-tone-lab-01-concept.md` — vision, product principles, the 6 launch presets
- `beatles-tone-lab-02-technical-prd.md` — architecture, milestones, acceptance criteria
- `beatles-tone-lab-03-ui-design.md` — visual system and component specs
- `AGENTS.md` — workflow SOP for contributing agents
- `PROJECT_STATUS.md` — current milestone, roadmap, blockers
- `OWNER_MULTI_DEVICE_GUIDE.md` — owner's cross-device quick start

---

## Developer quick start

```bash
npm install
node server.js       # dev server on http://localhost:8084
npm test              # preset schema validation + engine invariant guards
```

Open `http://localhost:8084` for the current vertical slice (one preset, Listen Mode).
Open `http://localhost:8084/test/determinism.html` for the in-browser
`OfflineAudioContext` determinism check (apply → mutate → re-apply must render
bit-identical — see PRD Appendix A.3 for why the compressor is excluded from this test).
The original, unmodified AmpSim3 app is preserved at
`http://localhost:8084/legacy-ampsim3.html`.

No build step yet (plain ES modules + vanilla CSS). Vite is planned from milestone M3
onward, only if it simplifies the new UI — see the PRD §1.

## Stack

Vanilla JS + ES modules, native Web Audio API (`WaveShaperNode` + `BiquadFilterNode` +
`ConvolverNode` — no `ScriptProcessorNode` anywhere, enforced by `npm test`), plain
CSS with light/dark design tokens, `localStorage` for user tweaks, no backend, no runtime
network requests beyond loading bundled audio/IR assets.

## Play vs. Listen

| Mode | Input | Status |
|---|---|---|
| **Listen** | Bundled dry demo riff, looped through the live preset chain | Shipped (M1) |
| **Play** | Live guitar via `getUserMedia` + external audio interface | Planned — desktop Chrome + interface is the target happy path |

Listen Mode is not a fallback bolted on later — it's the primary shareable,
zero-hardware experience (mobile, non-players, quick demos).

## Preset system

Each preset is a JSON file under `src/presets/` (schema: `src/presets/schema/preset.schema.json`).
A preset is **exhaustive** — applying it fully determines the audio graph state, with no
leakage from whatever preset was loaded before. Four knobs are ever exposed to the
listener (commonly Gain / Tone / Reverb / Master); everything else lives inside the
preset. Presets carry `"status": "draft"` until tuned by ear against the real recording
(see `docs/tone-notes.md`) and flipped to `"verified"`.

User tweaks to the exposed knobs persist to `localStorage`, layered on top of the preset
JSON, so a reload doesn't lose your adjustments; there's no "reset to original" UI yet in
this milestone.

## Assets & attribution

Cabinet/reverb impulse responses and the Listen Mode demo riff are currently reused from
the upstream AmpSim3 project as placeholders — their original license/provenance is
**unconfirmed** and must be verified (or replaced, e.g. with licensed Tone3000 IRs and an
original self-recorded riff) before any public deploy. Full attribution and asset
provenance notes live in `CREDITS.md`. **No Beatles audio, lyrics, or artwork is included
anywhere in this project.**

## Hosting

Production target is [Cloudflare Pages](https://pages.cloudflare.com/) (free, static,
HTTPS — required for `getUserMedia`). See `docs/decisions/0002-hosting-cloudflare-pages.md`.
