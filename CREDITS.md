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

### Provenance research (2026-07-03)

The warning remains unresolved after checking both AmpSim3 repositories:

- In
  [AmpSim3's first commit](https://github.com/micbuffa/WebAudio-Guitar-Amplifier-Simulator-3/commit/1a8af70334d80f2e0fbe4120d0c53323f1df08d2),
  both WAV files arrive as unexplained binary additions. The commit message,
  current [README](https://github.com/micbuffa/WebAudio-Guitar-Amplifier-Simulator-3/blob/master/README.md),
  complete commit history, and
  [issue tracker](https://github.com/micbuffa/WebAudio-Guitar-Amplifier-Simulator-3/issues)
  contain no author, capture source, or asset-specific license.
- AmpSim3's package metadata links an
  [older repository](https://github.com/micbuffa/WebAudio-Guitar-Amplifier-Simulator).
  `FenderChampAxisStereo.wav` and `pcm90cleanplate.wav` first appear there in
  [commit `b62da8d`](https://github.com/micbuffa/WebAudio-Guitar-Amplifier-Simulator/commit/b62da8d4ed8a3c20f6264752a0c5545b2834234a),
  again as unexplained binary additions. That repository's README, history, and
  issue tracker add no provenance.
- The repositories carry an MIT license for the software, but the searches found
  no evidence that Michel Buffa created these audio assets or had permission to
  sublicense them. A repository-level software license is therefore not treated
  here as a reliable chain of title for the WAV files.

## Candidate replacements

These are research candidates only; no audio file has been downloaded into or
substituted in Beatles Tone Lab. The owner should audition and select assets in a
later audio-change PR.

| Need | Candidate and exact source | License | Attribution / redistribution requirements | Fit and caveats |
|---|---|---|---|---|
| Fender-style clean cabinet | Guitarix `cab_data_Twin` ("Twin Style") response data in [`gx_cabinet_data.cc`](https://github.com/brummer10/guitarix/blob/39d1cd8241320da1bee944fd153fa32489d426b5/trunk/src/gx_head/engine/gx_cabinet_data.cc#L336-L355) | [GPL-2.0-or-later](https://github.com/brummer10/guitarix/blob/39d1cd8241320da1bee944fd153fa32489d426b5/trunk/src/gx_head/engine/gx_cabinet_data.cc#L1-L16) | Preserve the Guitarix copyright and license notices; distribute the GPL license and the corresponding preferred-form source (or a compliant source offer) with any exported/derived WAV. | Explicitly identified as a 48 kHz `Twin Style` cabinet response and therefore the closest verified redistributable clean-cab lead found. It is stored as 192 response coefficients, not a ready-made WAV; a later PR would need to export, audition, normalize, and confirm that the GPL obligations are acceptable for the distribution. |
| Plate reverb | Rollo145, [`IR Rollo Transparent Plate.wav`](https://freesound.org/people/Rollo145/sounds/322387/) | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | None required. Voluntary credit to Rollo145 and the source URL is still recommended. | Stereo, 48 kHz/24-bit, about 1.01 s; designed to recall a short EMT-style vocal plate. Strong low-friction candidate for the current clean-plate placeholder. |
| Room reverb alternative | djericmark, [`Hotel Staircase Reverb (IR)`](https://freesound.org/people/djericmark/sounds/732138/) | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | None required. Voluntary credit to djericmark and the source URL is still recommended. | Stereo, 48 kHz/24-bit, about 1.37 s; a measured staircase response offering a compact room sound if the owner prefers natural ambience over a plate. |

### Sources checked but not safe to bundle

- Current Fender-style cabinet and spring-reverb entries on Tone3000 use the
  **T3K** license. For example,
  [1971 Twin Cabinet with Oxford 12T6-10 IR Files](https://www.tone3000.com/tones/1971-twin-cabinet-with-oxford-12t6-10-ir-files-32525)
  and
  [Fender Twin Stereo Spring Reverb](https://www.tone3000.com/tones/fender-twin-stereo-spring-reverb-1732)
  permit use and publication of rendered output but explicitly prohibit uploading,
  republishing, or distributing the data file without the author's permission.
  They are not replacement candidates for a repository-bundled WAV unless the
  relevant author supplies separate written permission.
- The free Line 6 Allure pack includes Fender-adjacent
  `Allure_64_USDeluxe_P12N.wav` and `Allure_59_Tweed_P10N.wav`, but its bundled
  readme only calls the pack "free" and gives loading instructions; it does not
  grant redistribution rights. It is not listed as safe to bundle.
- Other search results described files as "free" or "free to download" without
  an explicit redistribution license. They were rejected rather than inferred
  safe.

**M2 addition — `vox-cab-01` placeholder alias.** `src/presets/irRegistry.js` registers
a second IR name, `vox-cab-01`, used by all `VOX_TOPBOOST`-voiced presets (I Saw Her
Standing There, A Hard Day's Night, Taxman). No dedicated Vox AC30 Blue-style cab IR has
been sourced yet (PRD §2.4 calls for one); `vox-cab-01` currently points at the same
`fender-cab-01.wav` file above. Kept as a distinct registry entry (not a literal
`"fender-cab-01"` string in those presets' JSON) so preset intent stays honest once a
real Vox IR is sourced — swapping the URL in `irRegistry.js` alone will fix all three
presets. Same "UNCONFIRMED — verify before public deploy" caveat applies. Helter Skelter
(`PUSHED_STACK` voicing) also reuses `fender-cab-01` directly pending a dedicated
heavier-voiced cab IR — see `docs/tone-notes.md`. The candidate replacements above are
research leads only (none yet downloaded/substituted); once the owner picks one, it
should replace `fender-cab-01.wav` and this placeholder note both go away together.

## Demo riff (Listen Mode placeholder)

| Ships as | Source file (from AmpSim3) |
|---|---|
| `public/riffs/get-back-riff.mp3` / `.ogg` | `assets/audio/Guitar_DI_Track.mp3` / `.ogg` |

**⚠ Provenance / license: UNCONFIRMED.** Bundled with the original AmpSim3 project
with no documented source. It is used only as a **neutral placeholder dry DI
guitar take** — it is **not** a recording of "Get Back" and not licensed from any
Beatles-affiliated source. **Replace before public deploy** with an original,
self-recorded dry riff (PRD §4).

### Provenance research (2026-07-03)

- AmpSim3 adds both encodings without explanation in its
  [first commit](https://github.com/micbuffa/WebAudio-Guitar-Amplifier-Simulator-3/commit/1a8af70334d80f2e0fbe4120d0c53323f1df08d2).
  Its README, issues, and later history do not identify the performer, recording
  owner, or license.
- The MP3 appears earlier in the linked older repository in
  [commit `3f3fb97`](https://github.com/micbuffa/WebAudio-Guitar-Amplifier-Simulator/commit/3f3fb97e209ca03559bb7b671c95eb2a5d30965f)
  ("added demos to player"), still without attribution or terms.
- Web searches find the same filename in guitar re-amping discussions predating
  both repositories, including a
  [2008 forum post](https://guitarplayer.ru/commerce-repbase-records/nakopl-sved-master-reamkrank-axe-fx-pivi-bugera-leni-nabor-baraban/)
  linking a third-party `Guitar_DI_Track.mp3`. That is a sourcing clue, not proof
  that the bytes are identical, and the post supplies no reusable license.

No checkable grant of redistribution rights was found. The only approved
replacement path remains an original, owner-recorded dry riff; no Beatles-owned
or other non-free recording is proposed.

**M2 addition.** The 5 new preset JSONs added in M2 (I Saw Her Standing There, A Hard
Day's Night, Taxman, Lucy in the Sky, Helter Skelter) all point `demoRiff` at this same
placeholder file, per the locked "placeholder riff = a reused dry DI take" decision
(PRD Appendix A.5). Listen Mode itself is only wired up for one preset at a time in the
current M2 UI (per-song Listen Mode across all 6 presets is M4 scope); this just keeps
every preset's schema-required `demoRiff` field honest about being a placeholder until
the owner records 6 real per-song riffs.

## Preset content

Historical gear facts (the guitar/amp/effects used on "Get Back") are treated as
public biographical/historical information, not proprietary Apple Corps / Beatles
intellectual property. **No Beatles audio, lyrics, artwork, or recordings are
included anywhere in this project.** Song titles are used descriptively. Tone
parameters in `src/presets/*.json` are original approximations, marked
`"status": "draft"` pending refinement by ear against the real recording.
