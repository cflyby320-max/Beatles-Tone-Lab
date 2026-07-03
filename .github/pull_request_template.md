## Goal and approved scope

<!-- What task does this PR implement? Link the roadmap item in PROJECT_STATUS.md or the
     PRD milestone it belongs to. -->

## Changed behavior

<!-- What actually changed, in plain language. -->

## Important files

<!-- The files a reviewer should read first. -->

## Tests and results

- [ ] `npm test` passes (schema validator + no-ScriptProcessorNode + no-DOM-in-engine)
- [ ] `test/determinism.html` PASS (bit-identical apply → mutate → re-apply) — required
      for any `src/engine/` or `src/voicings/` change
- [ ] Manual or headless browser check — required for any `src/ui/` or `index.html` change
- [ ] Preset changes validated against the schema; `status` left as `"draft"` unless the
      owner has confirmed a by-ear tuning pass

## Known risks or remaining work

<!-- What's NOT done, and any owner-only acceptance still pending (Grin Test, hardware
     latency, physical-device checks) — never claim these as agent-verified. -->

## Device / environment used

<!-- Windows / Mac / mobile-cloud, browser, etc. -->

---

Reviewed against `AGENTS.md` §2 product invariants and §9 Definition of Done before
requesting owner approval.
