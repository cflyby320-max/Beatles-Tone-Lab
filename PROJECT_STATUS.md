# Beatles Tone Lab Project Status

This is the owner-facing roadmap and merged-state dashboard. Codex and Claude maintain
this file after merges. Open GitHub pull requests are the live source for unmerged work.

**Last verified:** 2026-07-03

**Verified default branch:** `master` (head `63c9faa`, upstream AmpSim3 history — M1 has
not merged yet; see PR #1 below). *Rename to `main` is a pending owner action — see
"Known blockers and owner decisions."*

**v1 definition:** all 6 launch presets, the era-timeline UI, Listen Mode, and the M0–M5
engine/UI/ship foundations (`beatles-tone-lab-02-technical-prd.md` §7).

## At a glance

- **M1 (one great preset, headless engine) is built and in review as PR #1** — not yet
  merged. It is a vertical slice: one preset (*Get Back*, 1969) working end-to-end on a
  cleanly refactored, DOM-decoupled audio engine, with a minimal Listen-Mode UI.
- The engine is now **headless and deterministic**: no `document`/`window` access under
  `src/engine`/`src/voicings`, no `ScriptProcessorNode`, and the in-browser
  `OfflineAudioContext` determinism test (`test/determinism.html`) renders bit-identical
  (maxDiff 0.0) on apply → mutate → re-apply.
- `npm test` (preset schema validator + the two engine-invariant guards) is wired up and
  green.
- **PedalBoard**: compressor and slap-echo are implemented; fuzz and leslie are
  intentionally straight-wire stubs, reserved for the Taxman/Lucy in the Sky presets.
- **Voicing**: `FENDER_BLACKFACE` is implemented (the *Get Back* voicing). `VOX_TOPBOOST`
  and `PUSHED_STACK` are not yet built.
- Legacy AmpSim3 app preserved untouched at `legacy-ampsim3.html`.
- This documentation/operating-system PR (docs + `AGENTS.md` + `PROJECT_STATUS.md` +
  `OWNER_MULTI_DEVICE_GUIDE.md` + ADRs + CI + PR template) is stacked on top of the M1
  branch and is itself in review, not yet merged.

## Roadmap

| Milestone | Status | Evidence / remaining work |
|---|---|---|
| Product definition (concept + PRD) | Done | Committed as `beatles-tone-lab-01-concept.md` / `-02-technical-prd.md` in this docs PR; previously existed only as session uploads. |
| M0 — Engine runs locally | Done (informal) | Dev server runs, engine audible; formal owner hardware/latency validation still pending (see blockers). |
| M1 — One great preset (*Get Back*) | **In review — PR #1** | Headless engine refactor, `FENDER_BLACKFACE` voicing, preset schema + validator, Listen Mode, determinism test. Owner Grin Test not yet performed (owner-only). |
| Project operating system (this docs PR) | **In review** | `AGENTS.md`, `PROJECT_STATUS.md`, `OWNER_MULTI_DEVICE_GUIDE.md`, UI design doc, ADRs, CI, PR template. |
| M2 — Preset system + 6 tones | Next | Not started. Needs: `VOX_TOPBOOST` + `PUSHED_STACK` voicings, fuzz + leslie pedal DSP, 5 more preset JSONs (draft), localStorage tweak persistence + reset UI. |
| M3 — New UI shell | Queued | Timeline strip + era themes + multi-card grid + custom knob controls, per `beatles-tone-lab-03-ui-design.md` §7. |
| M4 — Listen Mode (full) | Queued | Currently only the *Get Back* preset has Listen Mode; extend to all 6, verify mobile Safari/Chrome. |
| M5 — Ship | Later | Cloudflare Pages deploy, asset budget check, replace placeholder IR/riff, Lighthouse pass. |

## Active ownership

Maximum active implementation tasks: two — one shared-core/integration task and one
isolated feature/documentation task. Either agent may take either lane for a given
approved task (`AGENTS.md` §4); these rows are concurrency slots, not a fixed assignment
of a lane to one agent.

| Lane | Owner | Task | Branch | Notes |
|---|---|---|---|---|
| Shared-core / integration | Claude | M1 engine slice | `claude/new-session-iku288` | PR #1 open, in review, not merged. |
| Isolated feature / docs | Claude | Project operating system | `claude/project-docs-system` | Stacked on the M1 branch; draft PR to follow, in review, not merged. |

## Known blockers and owner decisions

- **Default branch naming.** No branch-rename tool is available to agents via the GitHub
  MCP integration in use; renaming `master` → `main` requires a one-click owner action
  (repo Settings → Branches → rename), which will auto-retarget PR #1. Docs are written
  assuming this rename happens; until then, treat "default branch" in this file and
  `AGENTS.md` as `master`.
- **IR and demo-riff licensing unconfirmed.** The two bundled impulse responses
  (`public/irs/cabinet/fender-cab-01.wav`, `public/irs/reverb/plate-01.wav`) and the
  Listen Mode placeholder riff (`public/riffs/get-back-riff.mp3`) are reused from the
  upstream AmpSim3 project with no documented license/provenance anywhere in that repo's
  history. Flagged in `CREDITS.md` as "UNCONFIRMED — verify before public deploy."
  Fast-follow: source properly licensed Tone3000 IRs; record original riffs.
- **`docs/tone-notes.md` is a stub template**, not yet filled in. No preset has completed
  a by-ear tuning pass against the real recording; all shipped/planned presets carry
  `"status": "draft"`.
- **Owner-only acceptance pending:** the Grin Test (real Casino-style guitar through the
  *Get Back* preset) and real-hardware round-trip latency feel have not been performed.
  Neither can be agent-verified.
- **NAM (Neural Amp Modeler) fidelity is deliberately parked** as a v2 experiment, not
  part of the v1 roadmap above (see `docs/decisions/0001-classic-waveshaper-engine.md`).
- **GitHub branch-protection availability** for this repository/account plan has not been
  checked. Until confirmed, the PR-only, green-CI, and no-force-push rules in `AGENTS.md`
  are mandatory operating policy rather than server-enforced restrictions.

## Recent merged progress

None yet — this is the first project cycle. PR #1 (M1 engine slice) and the docs/
operating-system PR are both open and unmerged as of this writing.

## Owner's quick check

To understand current activity without reading code:

1. Read this page for roadmap status.
2. Open the repository's **Pull requests** page for live work (currently: PR #1, plus the
   docs/operating-system PR).
3. Confirm checks are green.
4. Ask the non-authoring agent (Codex, if Claude authored) for a plain-language review.
5. Say `Approved to merge` only when the scope and result are acceptable.
