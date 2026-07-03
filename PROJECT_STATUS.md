# Beatles Tone Lab Project Status

This is the owner-facing roadmap and merged-state dashboard. Codex and Claude maintain
this file after merges. Open GitHub pull requests are the live source for unmerged work.

**Last verified:** 2026-07-03

**Verified default branch:** `master` (head `e088b5f`). *Rename to `main` is a pending
owner action — see "Known blockers and owner decisions."*

**v1 definition:** all 6 launch presets, the era-timeline UI, Listen Mode, and the M0–M5
engine/UI/ship foundations (`beatles-tone-lab-02-technical-prd.md` §7).

## At a glance

- **M1 (one great preset, headless engine) is merged** (PR #1). The engine is
  **headless and deterministic**: no `document`/`window` access under
  `src/engine`/`src/voicings`, no `ScriptProcessorNode`, and the in-browser
  `OfflineAudioContext` determinism test (`test/determinism.html`) renders bit-identical
  (maxDiff 0.0).
- **Project operating system is merged** (PR #2, landed on `master` via the PR #3
  reconciliation): `AGENTS.md`, `PROJECT_STATUS.md`, `OWNER_MULTI_DEVICE_GUIDE.md`,
  product/design docs, ADRs, CI, PR template.
- **M2 (preset system + 6 tones) is merged** (PR #4). All 6 launch presets exist
  (`"status": "draft"`), all 3 voicings (`FENDER_BLACKFACE`, `VOX_TOPBOOST`,
  `PUSHED_STACK`) are implemented, and the full PedalBoard (compressor, fuzz, leslie,
  slap-echo) is real DSP — no stubs remain. localStorage tweak persistence + a "Reset
  to original" control are wired up (kept in `src/ui/`, not `src/engine/`, so the
  headless engine's determinism guarantees stay untouched by browser storage).
- **IR/riff provenance research is merged** (PR #5, Codex): both bundled IRs and the
  placeholder demo riff remain `UNCONFIRMED`, but 3 redistributable replacement
  candidates (1 GPL cabinet response, 2 CC0 reverb IRs) are now documented in
  `CREDITS.md` with exact sources/licenses, pending owner audition/selection. No audio
  files have been swapped yet.
- `npm test` (preset schema validator + the two engine-invariant guards) is green.
- Legacy AmpSim3 app preserved untouched at `legacy-ampsim3.html`; confirmed (not just
  assumed) during M2 that the new engine never reads its hardcoded preset array.
- **M3 (new UI shell) is in progress** as draft PR #6 (`claude/m3-ui-shell`): era
  timeline, filterable 6-card preset grid, extended status bar (input device
  picker + level meter + master volume), and vertical custom-styled keyboard/ARIA
  knobs. Not yet merged.

## Roadmap

| Milestone | Status | Evidence / remaining work |
|---|---|---|
| Product definition (concept + PRD) | Done | Committed as `beatles-tone-lab-01-concept.md` / `-02-technical-prd.md`. |
| M0 — Engine runs locally | Done (informal) | Dev server runs, engine audible; formal owner hardware/latency validation still pending (see blockers). |
| M1 — One great preset (*Get Back*) | **Done** | Merged via PR #1. Headless engine refactor, `FENDER_BLACKFACE` voicing, preset schema + validator, Listen Mode, determinism test. Owner Grin Test still pending (owner-only). |
| Project operating system | **Done** | Merged via PR #2 + #3. `AGENTS.md`, `PROJECT_STATUS.md`, `OWNER_MULTI_DEVICE_GUIDE.md`, UI design doc, ADRs, CI, PR template. |
| M2 — Preset system + 6 tones | **Done** | Merged via PR #4. `VOX_TOPBOOST` + `PUSHED_STACK` voicings, fuzz + leslie pedal DSP, all 5 remaining preset JSONs (draft), localStorage tweak persistence + reset UI, `test/determinism.html` extended to cover all 6 presets + cross-preset switching (all bit-identical). |
| M3 — New UI shell | **In review** | Draft PR #6 open (`claude/m3-ui-shell`): 5-segment era timeline, all 6 presets as selectable cards (one live in the shared engine at a time, crossfaded ~80ms on switch per PRD §5.2; other cards show a read-only preview + a "Listen" button that promotes them), extended status bar (device picker, level meter, latency, volume), vertical custom-styled keyboard/ARIA knobs. `npm test` and `test/determinism.html` both green. Real Play Mode (getUserMedia) wired in alongside Listen Mode. Stayed on plain ES modules — no Vite introduced. |
| M4 — Listen Mode (full) | Queued | Currently only the *Get Back* preset has Listen Mode wired into the UI; extend to all 6, verify mobile Safari/Chrome. |
| M5 — Ship | Later | Cloudflare Pages deploy, asset budget check, replace placeholder IR/riff (candidates identified in PR #5), Lighthouse pass. |

## Active ownership

Maximum active implementation tasks: two — one shared-core/integration task and one
isolated feature/documentation task. Either agent may take either lane for a given
approved task (`AGENTS.md` §4); these rows are concurrency slots, not a fixed assignment
of a lane to one agent.

| Lane | Owner | Task | Branch | Notes |
|---|---|---|---|---|
| Shared-core / integration | Claude | M3 — new UI shell | `claude/m3-ui-shell` | Draft PR #6 open; touches `index.html`, `css/slice.css`, `src/main.js`, `src/engine/engine.js` (additive `crossfadeToPreset` only), `src/ui/*`. |
| Isolated feature / docs | — | *(none active)* | — | IR/riff provenance research (last occupant) merged via PR #5. |

## Known blockers and owner decisions

- **Default branch naming.** No branch-rename tool is available to agents via the GitHub
  MCP integration in use; renaming `master` → `main` requires a one-click owner action
  (repo Settings → Branches → rename). Docs are written assuming this rename happens;
  until then, treat "default branch" in this file and `AGENTS.md` as `master`.
- **IR and demo-riff licensing still unconfirmed, but replacement candidates are now
  documented.** The two bundled impulse responses (`public/irs/cabinet/fender-cab-01.wav`,
  `public/irs/reverb/plate-01.wav`) and the Listen Mode placeholder riff
  (`public/riffs/get-back-riff.mp3`) remain reused from upstream AmpSim3 with no
  checkable chain of title (see `CREDITS.md`'s "Provenance research" sections, PR #5).
  3 redistributable candidates (1 GPL-2.0-or-later Guitarix cabinet response, 2 CC0
  Freesound reverb IRs) are documented and awaiting **owner audition/selection** before
  any asset swap. The demo riff still needs an original owner recording — no safe
  redistributable substitute was found.
- **`docs/tone-notes.md` now has an entry for all 6 presets** (M2 added the remaining
  5), but none have completed the by-ear tuning pass against the real recording yet —
  all 6 presets carry `"status": "draft"`.
- **Owner-only acceptance pending:** the Grin Test (real Casino-style guitar through the
  *Get Back* preset) and real-hardware round-trip latency feel have not been performed.
  Neither can be agent-verified.
- **NAM (Neural Amp Modeler) fidelity is deliberately parked** as a v2 experiment, not
  part of the v1 roadmap above (see `docs/decisions/0001-classic-waveshaper-engine.md`).
- **GitHub branch-protection availability** for this repository/account plan has not been
  checked. Until confirmed, the PR-only, green-CI, and no-force-push rules in `AGENTS.md`
  are mandatory operating policy rather than server-enforced restrictions.
- **Cloudflare Pages / default-branch health** should be spot-checked after each merge
  to `master` (`OWNER_MULTI_DEVICE_GUIDE.md` Recipe E) — this is an owner-side dashboard
  check an agent cannot perform from this environment.

## Recent merged progress

| PR | Summary |
|---|---|
| #1 | M1: DOM-decoupled headless engine, `FENDER_BLACKFACE` voicing, *Get Back* preset, Listen Mode, determinism test. |
| #2 → #3 | Project operating system (`AGENTS.md`, `PROJECT_STATUS.md`, `OWNER_MULTI_DEVICE_GUIDE.md`, product/design docs, ADRs, CI, PR template); #3 was a pure reconciliation landing #1+#2 onto `master`. |
| #5 | IR/riff provenance research (Codex): documented upstream chain-of-title gaps and 3 redistributable replacement candidates in `CREDITS.md`. Docs-only, no assets changed. |
| #4 | M2: `VOX_TOPBOOST` + `PUSHED_STACK` voicings, real fuzz/leslie pedal DSP, 5 new draft presets (all 6 tones now exist), localStorage tweak persistence + reset, `test/determinism.html` extended to all 6 presets + cross-preset switching. Also fixed a real non-determinism bug (unawaited async IR switch) the extended test caught. Rebased onto #5 post-merge to reconcile a `CREDITS.md` overlap. |

## Owner's quick check

To understand current activity without reading code:

1. Read this page for roadmap status.
2. Open the repository's **Pull requests** page for live work (none open as of this
   writing — the next expected PR is M3).
3. Confirm checks are green.
4. Ask the non-authoring agent (Codex, if Claude authored) for a plain-language review.
5. Say `Approved to merge` only when the scope and result are acceptable.
