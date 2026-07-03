# Beatles Tone Lab — Technical PRD

**Version:** 1.0 · **Date:** July 2026 · **Owner:** Captain
**Companion doc:** `beatles-tone-lab-01-concept.md` (read it first — it defines scope, presets, and principles)

**Audience of this doc:** an AI coding agent (Codex / Claude Code) implementing the project, plus the owner reviewing PRs.

---

## 0. Implementation strategy — read before writing code

- **Base repo:** fork/clone `https://github.com/micbuffa/WebAudio-Guitar-Amplifier-Simulator-3` (AmpSim3). It provides: a working Web Audio amp graph (multi-stage preamp waveshaping, tonestack, power amp, convolver-based cabinet + reverb IRs), live input via getUserMedia, a preset mechanism, and a node dev server (`npm install && node server.js`, port 8084).
- **Treat it as an engine, not a product.**
  - **KEEP:** audio graph topology, IR convolution loading, input device handling, the general preset-apply mechanism.
  - **REPLACE:** the entire GUI, the preset data format (extend with metadata per §3), the amp voicings (default is JCM800-flavored; most Beatles tones need lower-gain, chimier voicings).
  - **ADD:** pedal slot subgraph (§2.2), Listen Mode (§4), timeline UI (§5), preset persistence (§3.3).
- **Refactor budget:** do NOT rewrite the engine in Tone.js/TypeScript in v1. Only escalate to a rebuild if a milestone is blocked by engine architecture, and flag it to the owner first.
- **License/attribution:** check AmpSim3's license file at clone time; preserve required attribution in `CREDITS.md` along with IR pack licenses. If the repo lacks a clear license, stop and flag to owner before public deployment.
- **Working style:** ship milestone by milestone (§7). Each milestone ends in a runnable, demoable state. No milestone starts until the previous one's acceptance criteria pass.

## 1. Stack & constraints

| Concern | Decision |
|---|---|
| Language | Vanilla JS (match base repo) + ES modules. TypeScript optional for NEW files only. |
| Build | Keep base repo's setup for M0–M2. From M3 (new UI), introduce Vite if it simplifies work; do not break the audio engine while migrating. |
| Audio | Web Audio API (native nodes + WaveShaperNode + ConvolverNode). No heavy frameworks in the signal path. |
| UI | Lightweight: vanilla JS + CSS (or Preact if justified). Keep `web-audio-controls` knobs for M0–M2; replace with custom-styled controls in M3. |
| Hosting | Static, HTTPS mandatory (getUserMedia requirement). **DECISION: Cloudflare Pages** (see `docs/decisions/0002-hosting-cloudflare-pages.md`). |
| Browser targets | Play Mode: desktop Chrome (primary), Firefox (best-effort). Listen Mode: those + desktop Safari + mobile Chrome/Safari. |
| Storage | `localStorage` for user knob tweaks per preset. No backend, no accounts. NOTE: this is a self-hosted static site, so localStorage is fine here (the claude.ai-artifact restriction does not apply to this external project). |
| Assets | Cabinet/reverb IRs (wav), demo riffs (dry mono wav/opus), UI art. Budget: total initial payload < 8 MB; lazy-load IRs and riffs per preset. |

## 2. Audio architecture

### 2.1 Signal graph (Play Mode)

```
getUserMedia (mono, echoCancellation:false, noiseSuppression:false, autoGainControl:false)
  → InputGain
  → NoiseGate            (custom: analyser/worklet-driven gain, threshold param)
  → PedalBoard           (ordered slots, each bypassable — see 2.2)
  → Preamp               (2–3 WaveShaper stages with interstage gain + HP/LP filters)
  → Tonestack            (bass/mid/treble — reuse base repo implementation)
  → PowerAmp             (gain + soft-clip waveshaper)
  → Cabinet              (ConvolverNode + selected IR)
  → RoomReverb           (ConvolverNode + IR, wet/dry mix)
  → MasterGain
  → destination
```

### 2.2 PedalBoard slots (new subsystem)

Fixed slot order in v1 (compressor → fuzz → modulation), each an encapsulated module with `input`, `output`, `bypass(bool)`, `setParams(obj)`:

| Pedal | Implementation sketch | Needed for presets |
|---|---|---|
| **Compressor** | DynamicsCompressorNode with musical defaults (slow-ish attack, medium release) | #1, #2 |
| **Fuzz (Tone Bender-ish)** | Input HPF → high-gain WaveShaper (asymmetric curve) → tone LPF → level | #3, #6 |
| **Tremolo** | LFO (OscillatorNode) → GainNode modulation, rate/depth params | (reserve; not in v1 presets but cheap) |
| **Leslie/vibrato sim** | Chorus-style: modulated DelayNode (pitch vibrato) + amplitude trem + light stereo spread | #4 |
| **Slap echo** | Single DelayNode (~110–140 ms) + feedback ≤ 0.25 + LPF in loop | #5 (optional flavor) |

Bypass = hard reroute (disconnect/reconnect), not gain-zeroing, to keep the path clean.

### 2.3 Voicings

Create 3 amp voicings as parameter+curve sets applied to the Preamp/Tonestack/PowerAmp blocks (NOT separate graphs):

1. **VOX_TOPBOOST** — bright cap character: presence lift ~2–4 kHz, earlier preamp breakup, chime.
2. **FENDER_BLACKFACE** — scooped mids, high headroom, late soft clip.
3. **PUSHED_STACK** — the base repo's JCM-ish curve retained for preset #6.

Voicing = data (curve arrays + filter/EQ settings + gain staging), stored in `/src/voicings/*.js`, referenced by presets.

### 2.4 IRs

- Source free/redistributable IRs: one Vox AC30 Blue-style cab, one Fender-style cab, one plate/room reverb. Record source + license per file in `CREDITS.md`.
- Normalize IR loudness offline so switching presets doesn't cause level jumps (target equal RMS through pink noise, ±1 dB).

### 2.5 Latency & performance requirements

- Request lowest stable buffer: `new AudioContext({ latencyHint: 'interactive' })`; expose measured `baseLatency`/`outputLatency` in a debug panel.
- App graph must add **no ScriptProcessorNode** anywhere (worklets only if custom DSP is unavoidable).
- Target: added processing ≤ ~20 ms beyond device round-trip on desktop Chrome + external interface; must remain glitch-free (no underruns) for 10 minutes of continuous play on a mid-range laptop.
- All IR/riff fetches are async with visible loading state; the audio graph never blocks the main thread.

## 3. Preset system

### 3.1 Schema (`/src/presets/*.json`, one file per preset)

```json
{
  "id": "get-back-1969",
  "song": "Get Back",
  "album": "Let It Be",
  "year": 1969,
  "era": "1969-70",
  "gear": {
    "guitar": "Epiphone Casino",
    "amp": "Fender Twin/Showman, edge of breakup",
    "pedals": []
  },
  "story": "2–4 sentence note: actual gear, what we approximate, one listening cue.",
  "voicing": "FENDER_BLACKFACE",
  "params": {
    "inputGain": 0.9,
    "gate": { "threshold": -55 },
    "pedals": {
      "compressor": { "on": false },
      "fuzz": { "on": false },
      "leslie": { "on": false },
      "slapEcho": { "on": false }
    },
    "preamp": { "gain": 0.45 },
    "tonestack": { "bass": 0.55, "mid": 0.6, "treble": 0.65 },
    "powerAmp": { "drive": 0.5 },
    "cabinet": { "ir": "fender-cab-01" },
    "reverb": { "ir": "plate-01", "mix": 0.12 },
    "master": 0.8
  },
  "exposedKnobs": ["preamp.gain", "tonestack.treble", "reverb.mix", "master"],
  "demoRiff": "riffs/get-back-riff.opus"
}
```

Rules:

- `params` is exhaustive — applying a preset fully determines the graph state (no leakage from previous preset).
- `exposedKnobs` maps the 4 user-facing knobs (Gain/Tone/Reverb/Master) to underlying params.
- Validate all preset JSON against a schema at build time (simple validation script in `npm test`).

### 3.2 The 6 launch presets

Implement per the concept doc §7 table. Parameter starting points come from the owner's Spark/Beatles tone research (owner will supply a notes file `docs/tone-notes.md`; if absent at M2 start, request it — do not invent values silently, but DO produce a best-guess first pass clearly marked `"status": "draft"` in the JSON).

### 3.3 Persistence

- User tweaks to exposed knobs are saved to `localStorage` keyed by preset id (`btl.tweaks.<presetId>`), applied on top of the preset at load.
- "Reset to original" button per preset clears the override.
- This replaces the base repo's hardcoded-presets-in-`amp.js` approach; remove that path at M2.

## 4. Listen Mode

- Each preset ships a **dry, original, self-recorded** mono riff (owner records; agent should stub with a synthesized/dry placeholder clearly named `placeholder-*.opus` until real files arrive).
- Playback path: `AudioBufferSourceNode (loop) → [same graph from NoiseGate onward]`. One shared graph; Listen Mode simply swaps the source.
- Mode toggle rules: entering Play Mode requires a user gesture + mic permission; if permission denied or no input device, gracefully stay in Listen Mode with a friendly note.
- Mobile: Play Mode toggle hidden; Listen Mode fully functional. `AudioContext` resume tied to first tap (autoplay policy).

## 5. UI spec (M3)

### 5.1 Layout

- **Timeline strip** (top): 5 era segments (1962–64, 1965–66, 1967, 1968, 1969–70). Selecting an era filters preset cards and switches the era theme (CSS custom properties per era; see concept doc §6 for palettes).
- **Preset cards** (main area): one card per preset — song title, era badge, gear-chain diagram (guitar → pedals → amp → cab icons), story note, 4 knobs, Play/Listen controls.
- **Status bar** (bottom): input device selector, input level meter, latency readout, master volume, "Play Mode requires desktop Chrome + audio interface" hint when relevant.

### 5.2 Interaction rules

- Switching presets: crossfade master over ~80 ms to avoid pops; never click/pop audibly.
- Knobs: drag-vertical + double-click-to-reset; keyboard accessible (arrow keys); ARIA labels.
- The page is a single view; no routing needed. Deep-link support via `#preset-id` hash is a nice-to-have (M5 stretch).

### 5.3 Visual tone

- Original artwork only, era-evocative, no Beatles imagery/photography/album art. Simple, warm, museum-placard typography for story notes.

> See `beatles-tone-lab-03-ui-design.md` for the concrete visual system, design tokens, and component specs.

## 6. Repo structure (target, post-M3)

```
/public
  /irs            # cabinet & reverb IRs (+ licenses in CREDITS.md)
  /riffs          # dry demo riffs (original recordings)
/src
  /engine         # audio graph: input, gate, pedals/, preamp, tonestack, poweramp, cab, reverb
  /voicings       # VOX_TOPBOOST.js, FENDER_BLACKFACE.js, PUSHED_STACK.js
  /presets        # 6 preset JSON files + schema + validator
  /ui             # timeline, preset-card, knobs, status-bar, era themes
  main.js
/docs
  tone-notes.md   # owner-supplied parameter research (input to M2)
CREDITS.md
README.md
```

## 7. Milestones & acceptance criteria

### M0 — Engine runs locally
- Fork cloned, deps installed, dev server runs; owner's guitar passes through via external interface on desktop Chrome.
- **Accept:** audible processed guitar; measured latency displayed; 10-min glitch-free play; base license checked and noted in CREDITS.md.

### M1 — One great preset (*Get Back*)
- FENDER_BLACKFACE voicing implemented; Fender-style cab IR loaded and normalized; preset JSON schema v1 + apply function; the single preset hand-tunable via debug panel.
- **Accept:** owner Grin Test passes on preset #5; preset applies deterministically from JSON alone (reload-safe).

### M2 — Preset system + 6 tones
- PedalBoard subsystem (compressor, fuzz, leslie, slap echo) with hard bypass; VOX_TOPBOOST + PUSHED_STACK voicings; all 6 presets drafted (marked draft until owner tunes); localStorage tweak persistence + reset; hardcoded base-repo presets removed; JSON validation in `npm test`.
- **Accept:** switching among all 6 presets is pop-free and fully deterministic; tweaks persist across reload; validator passes.

### M3 — New UI shell
- Old GUI removed; timeline + era themes + preset cards + status bar per §5; keyboard/ARIA on knobs.
- **Accept:** a first-time user can find and play all 6 presets without instruction; era switch changes theme < 200 ms; no audio regressions from M2.

### M4 — Listen Mode
- Riff loop path per §4 with placeholders; graceful mic-permission fallback; mobile Listen Mode verified on Android Chrome + iOS Safari.
- **Accept:** with no guitar and no mic permission, all 6 presets are demoable end-to-end on a phone.

### M5 — Ship
- HTTPS static deploy; asset budget met (< 8 MB initial, lazy loads verified); README with local dev + attribution; final CREDITS.md; replace placeholder riffs with owner recordings.
- **Accept:** public URL passes the concept doc §10 success criteria; Lighthouse performance ≥ 85 on desktop.

## 8. Testing checklist (run at every milestone)

1. No `ScriptProcessorNode` in graph (grep + runtime assert).
2. Preset determinism: apply A → B → A, capture 2 s of Listen-Mode output, waveforms of both A states match (automated render via `OfflineAudioContext`).
3. No NaN/Infinity in waveshaper curves; all gains clamped to safe ranges (protect ears/speakers — master hard-capped).
4. Permission-denied, no-input-device, and suspended-AudioContext paths all render usable UI.
5. IR/riff fetch failure shows an error state, never a silent broken graph.

## 9. Out of scope (v1) — do not build

Recording/export, preset sharing backend, amp/cab mix-and-match UI, mobile Play Mode, MIDI control, tuner. Parking lot lives in concept doc §11.

## 10. Open questions for owner (flag at milestone start, don't block silently)

1. M1: which audio interface will be used for latency validation? (Affects buffer advice in status bar copy.)
2. M2: deliver `docs/tone-notes.md` from Spark research.
3. M4/M5: record 6 dry riffs (mono, ~8–15 s loops, clean DI). Spec: 48 kHz wav masters; agent converts to opus.
4. M5: hosting choice — **resolved: Cloudflare Pages** — and project URL/name.

---

## Appendix A — M1 implementation notes (added 2026-07-03)

The M1 vertical slice is built and in review (PR #1). This appendix records how the
engine was actually refactored, so future milestones build on real structure, not the
sketch above. Where this appendix and §§0–6 differ in detail, this appendix reflects the
shipped code.

### A.1 Engine module map (`/src/engine`, all headless — no `document`/`window`)

| Module | Role | Ported from |
|---|---|---|
| `context.js` | `AudioContext({latencyHint:'interactive'})` + `measuredLatencyMs()` | fixes bare ctx at old `js/initAudio.js:3` |
| `waveshapers.js` | `asymetric` + `standard` curves + `kFromDrive()` log map | `js/distorsionFactory.js` (trimmed) |
| `boost.js` | transparent channel-boost stage | `js/amp.js` `Boost()` |
| `preamp.js` | 2 WaveShaper stages + shelving filters + `setDrive()` | `js/amp.js:274-325` node decls + setter cores |
| `tonestack.js` | treble→bass→mid→presence biquads | `js/amp.js:331-349` |
| `powerAmp.js` | gain + soft-clip waveshaper (`setDrive()`) | new (approximates power-amp sag) |
| `convolver.js` | shared wet/dry cabinet + reverb; `ready` promise; IR-error events | `js/amp.js:1358-1481` `Convolver()` |
| `noiseGate.js` | AnalyserNode + rAF gate; offline-safe passthrough | new |
| `pedals/` | `index` (board) + `compressor` + `slapEcho` + `fuzz.stub` + `leslie.stub` | new |
| `signalChain.js` | assembles the full graph; exposes `whenReady` | `js/amp.js:220-467` `buildGraph()` |
| `engine.js` | `Engine` class: `applyPreset`, `setKnob`, `whenReady`, emitter | new |
| `utils/` | `emitter`, `clamp`, `loadSample` (now rejects on error) | `js/utils.js` (hardened) |
| `checks/` | `no-scriptprocessor`, `no-dom-in-engine` build guards | new |

### A.2 The DOM-decoupling pattern (the core M1 refactor)

The upstream `Amp()` did `document.querySelector` at construction and ~40 `change*`
setters ended in hardcoded `#KnobN` DOM writes, so it could not be instantiated headless.
The invariant now: **nothing under `/src/engine` or `/src/voicings` references
`document`/`window`** (enforced by `src/engine/checks/no-dom-in-engine.check.js`).
- UI→engine: `engine.setKnob(path, value)` (the UI owns its own DOM).
- Engine→UI: a tiny emitter (`preset-applied`, `ir-error`, `ir-loaded`, `gate`).
- `applyPreset()` sets **every** param unconditionally → exhaustive, no leakage.
- A voicing (`FENDER_BLACKFACE.js`) is a data/mapping module over the existing nodes.

### A.3 Two determinism findings (from `test/determinism.html`)

1. **Noise gate offline detection.** The gate must NOT drive its rAF automation loop
   during an `OfflineAudioContext` render (it injects wall-clock, non-deterministic
   automation). Detect offline via `typeof context.startRendering === 'function'`, NOT via
   the presence of `requestAnimationFrame` (an offline context inside a page still has rAF).
2. **DynamicsCompressorNode is non-deterministic offline** in Chromium (differs between two
   identical renders). The determinism test forces the compressor OFF; everything else in
   the chain renders bit-identical (maxDiff 0.0 on apply→mutate→re-apply).

### A.4 Schema note

The shipped `src/presets/schema/preset.schema.json` adds a top-level
`"status": "draft" | "verified"` field (not shown in §3.1), enforcing the draft-tone
discipline: preset params stay `"draft"` until the owner tunes them by ear.

### A.5 Locked decisions (see `docs/decisions/`)

- **Engine = classic WaveShaper/filter**; NAM parked as a v2 experiment (ADR 0001).
- **Hosting = Cloudflare Pages** (ADR 0002).
- **Keep-it-unique guardrail** — curation/story/content is the moat (ADR 0003).
- **Headless-engine + no-ScriptProcessorNode invariants** (ADR 0004).
- **Placeholder riff** = a reused dry DI take, flagged in `CREDITS.md` until owner records real riffs.
