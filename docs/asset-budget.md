# Asset budget (M5)

PRD §7 M5 acceptance: **initial load < 8 MB, lazy loads verified.** This note records the
measured payload and how lazy-loading was confirmed, so the budget claim is evidence, not
assertion.

**Measured:** 2026-07-03, headless Chromium (Playwright) against `python3 -m http.server`,
serving the repo root; network responses captured by URL with decoded body sizes. Method:
load `index.html` to engine-ready, then start Listen, then re-listen.

## Initial load (`index.html` → engine ready) — **≈ 676 KB**

| Group | Bytes | Notes |
|---|---:|---|
| `index.html` | 1,044 | |
| `css/slice.css` | 11,217 | single stylesheet |
| `src/**/*.js` + `*.mjs` | ~91,000 | ~35 ES modules, loaded as the import graph |
| `src/presets/*.json` (all 6) | ~8,000 | `main.js` fetches all six preset JSONs at boot |
| `public/irs/cabinet/fender-cab-01.wav` | 16,472 | cabinet IR, loaded during `applyPreset` |
| `public/irs/reverb/plate-01.wav` | 571,946 | reverb IR, loaded during `applyPreset` |
| **Total** | **≈ 691,900 (675.7 KB)** | |

The impulse responses load at engine boot (the convolvers are built when the initial
preset is applied), so they count toward initial load. The 572 KB reverb plate dominates
the entire budget — it is the single largest first-paint asset and the first thing to
shrink if the initial number ever matters (e.g. a shorter or mono plate, or encoding the
IR as compressed audio rather than WAV).

## Lazy (on first Listen) — **+ 394 KB**

| Asset | Bytes | When |
|---|---:|---|
| `public/riffs/get-back-riff.mp3` | 403,210 | fetched only when Listen is first started |

The demo riff is **not** loaded at boot — it is fetched on the first Listen click and then
kept in a URL-keyed decoded-buffer cache (`createListenMode`), so switching presets or
re-listening triggers **zero** additional network fetches for the riff (verified: 0
riff/IR requests on re-listen). All six presets currently point `demoRiff` at this one
placeholder file, so there is exactly one riff to cache.

## Functional payload

Initial (676 KB) + first Listen (394 KB) ≈ **1,070 KB (≈ 1.04 MB)** — comfortably under
the 8 MB budget, with ~7 MB of headroom. **Budget met.**

## Not in the app's load path (excluded by inspection)

The repository still carries the upstream AmpSim3 tree used only by the preserved
`legacy-ampsim3.html` reference page — `assets/` (~41 MB), `img/` (~4.3 MB),
`bower_components/`, `js/`, `webcomponents/`. None of these are requested by `index.html`
or any `src/` module (confirmed by the network trace above: no request touches them), so
they do **not** count against the initial-load budget. They do inflate the *deployed*
repo size on Cloudflare Pages; pruning or excluding them from the deploy is an optional
future cleanup, tracked as owner's-call in `docs/deploy-cloudflare-pages.md`, and must not
break the legacy page.

## Owner follow-ups (not part of this budget)

- Replacing the placeholder riff with an original owner recording (M5, owner-only) may
  change the lazy number; keep it a short (~8–15 s) mono loop per PRD §4 so it stays small.
- A formal Lighthouse pass (performance/best-practices scores) is a separate M5 check, not
  covered by this raw-payload audit.
