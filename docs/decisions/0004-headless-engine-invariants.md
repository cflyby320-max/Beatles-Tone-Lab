# ADR 0004: Headless-engine and no-ScriptProcessorNode invariants

**Date:** 2026-07-03 · **Status:** Accepted

## Context

The original AmpSim3 `Amp()` constructor called `document.querySelector` at construction
time and roughly 40 of its `change*` setters ended in hardcoded `#KnobN` DOM writes, so the
engine could not be instantiated or tested outside a page with that exact DOM. This blocked
any headless testing (including an `OfflineAudioContext` determinism check) and coupled
audio logic to specific UI markup, making future UI rewrites (PRD M3) riskier than
necessary.

Separately, the PRD (§2.5, §8.1) requires no `ScriptProcessorNode` anywhere in the audio
graph (deprecated, causes glitches); the base engine already satisfied this by construction
(verified by repo-wide grep), and the invariant is worth preserving explicitly as the
project grows.

## Decision

Two enforced invariants, checked by dependency-free scripts wired into `npm test`:

1. **No `document`/`window` DOM access anywhere under `/src/engine` or `/src/voicings`**
   (`src/engine/checks/no-dom-in-engine.check.js`). All engine state changes flow through
   `Engine.setKnob()`/`Engine.applyPreset()`; all engine→UI notifications flow through a
   tiny emitter (`preset-applied`, `ir-error`, `ir-loaded`, `gate`) — never a direct DOM
   write from engine code.
2. **No `ScriptProcessorNode`/`createScriptProcessor` anywhere under `/src`**
   (`src/engine/checks/no-scriptprocessor.check.js`). All custom real-time logic (the noise
   gate) uses `AnalyserNode` + `requestAnimationFrame` polling instead, with an explicit
   offline-safe fallback (see `beatles-tone-lab-02-technical-prd.md` Appendix A.3) rather
   than a worklet, since no custom per-sample DSP is currently required.

## Consequences

- The engine is instantiable and testable with **zero DOM**, which is what makes
  `test/determinism.html`'s `OfflineAudioContext` apply→mutate→re-apply check possible.
- Any future engine module (new pedal, new voicing) must pass both checks before merge —
  `npm test` fails the build otherwise.
- UI code (`/src/ui`) is exempt from the no-DOM check by design — it's the one place DOM
  access belongs.
