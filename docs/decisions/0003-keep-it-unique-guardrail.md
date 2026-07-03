# ADR 0003: Keep-it-unique guardrail — curation/story/content is the moat

**Date:** 2026-07-03 · **Status:** Accepted

## Context

Beatles Tone Lab forks AmpSim3 (MIT license, attribution preserved in `CREDITS.md`). A fork
that keeps attribution is not a "clone" — it's a fork — but the owner asked explicitly how
to keep this project *meaningfully distinct* over time, not just at the moment of the fork.

Uniqueness here is a product-and-content problem, not a code-obfuscation problem. DSP can be
forked by anyone; **curated content and storytelling cannot**.

## Decision

Every milestone must consciously add curated product/content value — not just plumbing or
re-skinning. Concretely:

1. **Product identity diverges immediately and permanently**: presets are recordings with
   stories (year, gear chain, listening cue), organized on an era timeline, with a no-fail
   4-knob philosophy — a different product category from AmpSim3's general-purpose amp sim
   with hardcoded metal presets.
2. **Content is the durable moat**: original dry riffs (Listen Mode), era storytelling
   copy, curated voicings, and curated IR/NAM sourcing are things a code-fork alone cannot
   replicate. Milestones that only touch engine plumbing without adding curated
   content/story should be treated as infrastructure work in service of a later
   content-adding milestone, not an end in themselves.
3. **The NAM fidelity path** (ADR 0001, parked v2) is a further differentiator the base
   project has nothing like.

## Enforcement mechanism

- **`PROJECT_STATUS.md`** is the living checkpoint: each milestone entry should be
  reviewable against "what curation/story/UX did this add?"
- **This ADR log** records product-shaping decisions so the reasoning survives across
  agent sessions and devices.
- **`CREDITS.md`** stays accurate and prominent — being upfront about the AmpSim3 base is
  what makes the new value legitimately the project's own.

## Consequences

- A milestone PR that only refactors the engine without a visible product/content angle
  should call out in its description which future content milestone it unblocks.
- Reviewers (owner or the non-authoring agent) can use this ADR as a check: "does this
  change make Beatles Tone Lab more itself, or just a nicer AmpSim3?"
