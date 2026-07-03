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
npm test              # preset schema + engine invariant guards + Listen/Play controller tests

# Serve the static site (the app is plain ES modules — it needs a static server, not file://):
python3 -m http.server 8000      # then open http://localhost:8000
#   or: npx serve .
```

Open `http://localhost:8000/index.html` for the full app (all 6 presets, the era timeline,
Listen Mode and Play Mode). Other pages:
- `http://localhost:8000/test/determinism.html` — in-browser `OfflineAudioContext`
  determinism check (apply → mutate → re-apply must render bit-identical; see PRD
  Appendix A.3 for why the compressor is excluded).
- `http://localhost:8000/test/listen-mode.html` — Listen Mode controller test in the browser.
- `http://localhost:8000/legacy-ampsim3.html` — the original, unmodified AmpSim3 app,
  preserved for reference.

> **Note on `node server.js`:** the bundled legacy Express 4.13 dev server does not run on
> modern Node (it crashes serving ES-module requests). Use a static server as above until
> the owner approves a server/dependency upgrade — that is intentionally out of scope for now.

No build step (plain ES modules + vanilla CSS); production is served straight from the
repo root (see **Hosting** below). Vite was considered from M3 but not adopted — the
vanilla-module UI shipped through M4 without needing a bundler.

## Stack

Vanilla JS + ES modules, native Web Audio API (`WaveShaperNode` + `BiquadFilterNode` +
`ConvolverNode` — no `ScriptProcessorNode` anywhere, enforced by `npm test`), plain
CSS with light/dark design tokens, `localStorage` for user tweaks, no backend, no runtime
network requests beyond loading bundled audio/IR assets.

## Play vs. Listen

| Mode | Input | Status |
|---|---|---|
| **Listen** | Bundled dry demo riff, looped through the live preset chain | Shipped (M4) — all 6 presets, with pause/resume and lazy-loaded, cached buffers |
| **Play** | Live guitar via `getUserMedia` + external audio interface | Shipped (M3/M4) — desktop Chrome + interface is the happy path; hidden on mobile |

Listen Mode is not a fallback bolted on later — it's the primary shareable,
zero-hardware experience (mobile, non-players, quick demos). Play and Listen are mutually
exclusive: starting one stops the other, and Listen audio enters the shared engine at the
noise gate (bypassing the live-interface input gain) per PRD §4.

## Preset system

Each preset is a JSON file under `src/presets/` (schema: `src/presets/schema/preset.schema.json`).
A preset is **exhaustive** — applying it fully determines the audio graph state, with no
leakage from whatever preset was loaded before. Four knobs are ever exposed to the
listener (commonly Gain / Tone / Reverb / Master); everything else lives inside the
preset. Presets carry `"status": "draft"` until tuned by ear against the real recording
(see `docs/tone-notes.md`) and flipped to `"verified"`.

User tweaks to the exposed knobs persist to `localStorage`, layered on top of the preset
JSON, so a reload doesn't lose your adjustments. A **Reset to original** control clears all
saved tweaks for a preset, and double-clicking a single knob resets just that one to its
preset default.

## Assets & attribution

Cabinet/reverb impulse responses and the Listen Mode demo riff are currently reused from
the upstream AmpSim3 project as placeholders — their original license/provenance is
**unconfirmed** and must be verified (or replaced, e.g. with licensed Tone3000 IRs and an
original self-recorded riff) before any public deploy. Full attribution and asset
provenance notes live in `CREDITS.md`. **No Beatles audio, lyrics, or artwork is included
anywhere in this project.**

## Hosting

Production target is [Cloudflare Pages](https://pages.cloudflare.com/) (free, static,
HTTPS — required for `getUserMedia`). It's a no-build static site served from the repo
root. See `docs/decisions/0002-hosting-cloudflare-pages.md` for the decision and
`docs/deploy-cloudflare-pages.md` for the step-by-step owner connect runbook. Response
headers are set in `_headers`; the measured payload budget is in `docs/asset-budget.md`.
