# Credits & Attributions

## Original project (engine)

Beatles Tone Lab is a fork of **WebAudio-Guitar-Amplifier-Simulator-3
(AmpSim3)** by **Michel Buffa** (@micbuffa), used under the MIT License
(Copyright © 2016 micbuffa). The original preamp/tonestack/power-amp graph, the
convolver wet/dry loader, and the waveshaper curves are derived from that work.

- Upstream: https://github.com/micbuffa/WebAudio-Guitar-Amplifier-Simulator-3
- The original GUI used **Web Audio Controls** by g200kg. It survives only in the
  untouched `legacy-ampsim3.html` reference page and is **not** used by the new
  Beatles Tone Lab engine or UI.

The upstream MIT license text is preserved in `LICENSE`.

## Impulse responses (reused from AmpSim3)

| Ships as | Source file (from AmpSim3) |
|---|---|
| `public/irs/cabinet/fender-cab-01.wav` | `assets/impulses/cabinet/FenderChampAxisStereo.wav` |
| `public/irs/reverb/plate-01.wav` | `assets/impulses/reverb/pcm90cleanplate.wav` |

**⚠ Provenance / license: UNCONFIRMED.** No license or source attribution for any
bundled impulse response exists anywhere in this repository's README, LICENSE, or
git history (verified). These are reused as-is for local development only.
**VERIFY BEFORE PUBLIC DEPLOY.** Fast-follow (owner task, out of scope for this
milestone): replace with properly-licensed IRs from Tone3000.com (or another
source with per-file license recorded here).

## Demo riff (Listen Mode placeholder)

| Ships as | Source file (from AmpSim3) |
|---|---|
| `public/riffs/get-back-riff.mp3` / `.ogg` | `assets/audio/Guitar_DI_Track.mp3` / `.ogg` |

**⚠ Provenance / license: UNCONFIRMED.** Bundled with the original AmpSim3 project
with no documented source. It is used only as a **neutral placeholder dry DI
guitar take** — it is **not** a recording of "Get Back" and not licensed from any
Beatles-affiliated source. **Replace before public deploy** with an original,
self-recorded dry riff (PRD §4).

## Preset content

Historical gear facts (the guitar/amp/effects used on "Get Back") are treated as
public biographical/historical information, not proprietary Apple Corps / Beatles
intellectual property. **No Beatles audio, lyrics, artwork, or recordings are
included anywhere in this project.** Song titles are used descriptively. Tone
parameters in `src/presets/*.json` are original approximations, marked
`"status": "draft"` pending refinement by ear against the real recording.
