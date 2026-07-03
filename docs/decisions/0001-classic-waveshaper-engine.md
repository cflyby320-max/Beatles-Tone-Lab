# ADR 0001: Keep the classic WaveShaper/filter engine; park NAM as a v2 experiment

**Date:** 2026-07-03 · **Status:** Accepted

## Context

Beatles Tone Lab forks AmpSim3, whose amp modeling is native Web Audio `WaveShaperNode` +
`BiquadFilterNode` chains — a mathematical approximation of amp character, not a captured
model. The owner separately raised wanting Neural Amp Modeler (NAM) captures and richer
Tone3000 IRs for a more portfolio-grade, higher-fidelity result.

NAM is a C++ project; running it in-browser means porting/compiling to WebAssembly and
wiring it into an AudioWorklet under a hard real-time budget — a new subsystem, not an
additive feature, with real risk of stalling on real-time-audio-in-WASM bugs (clicks,
underruns) that are slow to diagnose.

## Decision

- **v1 engine = the existing classic WaveShaper/filter engine**, refactored to be headless
  and data-driven (see ADR 0004), upgraded with better cabinet/reverb IRs (Tone3000, once
  license-checked) for a fast, low-risk quality jump.
- **NAM is explicitly parked as a v2 experiment**, attempted only once v1 is solid, so the
  practice tool and portfolio piece exist and work regardless of whether the NAM port
  succeeds.

## Consequences

- v1 ships faster and with lower risk; "amp preamp" character stays curve-based
  approximation, not a captured amp — acceptable given the concept doc's own bet on
  curation/story over DSP fidelity (see ADR 0003).
- If/when NAM is attempted, it is a deliberate, separately-scoped effort (own milestone,
  own risk budget), not folded quietly into an existing milestone.
- Tone3000 **IRs** (not NAM captures) are fair game for v1 — they're drop-in `.wav` files
  the existing convolver already knows how to load; only per-file licenses need checking
  before shipping (record in `CREDITS.md`).
