# Beatles Tone Lab Project Operating Procedure

This file is the shared operating procedure for the project owner, Codex, and Claude.
It applies on every computer and in every cloud environment.

For the owner's button-by-button quick start, read `OWNER_MULTI_DEVICE_GUIDE.md`.

## 1. Authority and required reading

Before planning or changing the project, read these files in order:

1. `beatles-tone-lab-01-concept.md` — vision, product principles, launch preset list.
2. `beatles-tone-lab-02-technical-prd.md` — authoritative architecture, milestones,
   acceptance criteria (Appendix A records M1's actual implementation).
3. `AGENTS.md` — collaboration and delivery rules (this file).
4. `PROJECT_STATUS.md` — merged progress, assignments, and approved next work.
5. `beatles-tone-lab-03-ui-design.md` — visual system, when touching UI.

When documents disagree, the PRD wins for product/architecture behavior. This SOP wins
for workflow. GitHub's default branch wins for repository state. A handoff or chat
summary never overrides the current repository.

## 2. Product rules that every task must preserve

- **Songs, not settings.** Every preset is a specific Beatles recording (year, gear
  chain, story note) — never a generic "clean/crunch/lead" label.
- **No-fail exploration.** Exactly the exposed knobs the active preset declares
  (`exposedKnobs` in its JSON) are user-facing controls — never more.
- **Story is a feature.** A preset's gear-chain note and story text are not optional
  metadata; treat them with the same care as its DSP parameters.
- **Draft-tone discipline.** New/changed preset params stay `"status": "draft"` until
  tuned by ear against the real recording (`docs/tone-notes.md`) — never silently mark a
  preset `"verified"`.
- **Headless engine.** Nothing under `src/engine/` or `src/voicings/` may reference
  `document`/`window` (enforced by `npm test`; see ADR 0004).
- **No `ScriptProcessorNode`** anywhere in the audio graph (enforced by `npm test`).
- **Preset application is exhaustive.** `applyPreset()` must set every param
  unconditionally — no state may leak in from whatever preset was loaded before.
- **Master gain stays hard-capped**; no change may let a preset drive output beyond the
  engine's clamped range.
- **No Beatles recordings, samples, interpolations, lyrics, or original artwork** anywhere
  in the repo. Demo riffs are original/self-recorded or clearly-labeled placeholders.
- **Preserve upstream attribution.** AmpSim3/Michel Buffa credit stays intact in
  `CREDITS.md`; any new reused asset (IR, riff, code) gets its provenance recorded there,
  including "UNCONFIRMED — verify before public deploy" when license status is unknown.
- **Keep it unique** (ADR 0003): a change that only re-skins the base engine without
  adding curated product/story/content value should say so in its PR description and name
  the future milestone it unblocks.
- **Honest limits.** Never claim an owner-only acceptance criterion (grin test, hardware
  latency feel, physical-device checks) as agent-verified. Flag it, don't fake it.

## 3. Source-of-truth model

GitHub's default branch is the only shared source of truth.

Each local folder or cloud environment is an independent checkout. Changes on one device
are invisible elsewhere until they are committed and pushed. OneDrive, iCloud, AirDrop,
and manual folder copying must not be used to synchronize Git repositories.

The repository root is not a fixed absolute path. Discover it with:

```sh
git rev-parse --show-toplevel
```

Use repository-relative paths in shared plans and documentation.

## 4. Roles

### Project owner

- Approves product decisions, task plans, and merges.
- Performs the owner-only acceptance checks: the Grin Test, real-hardware latency feel,
  and any physical-device/audio-interface verification.
- May rely on the agents for technical review.
- Gives an explicit approval such as `Approved to merge` before a PR is merged.

### Codex and Claude (symmetric)

Either agent may take either concurrency lane defined in §5 — a shared-core/integration
task, or an isolated feature/documentation task — for any given approved task. Task type
is not tied to agent identity; only the approved assignment for that task decides who
owns it. Both agents:

- Implement approved work as assigned per task: engine modules, voicings, presets, pedals,
  UI, tests, and documentation.
- Work on a separate branch, worktree, or cloud checkout, from whatever device/environment
  they run on.
- May maintain `PROJECT_STATUS.md` directly after a merge (see §5).
- Review the other agent's PRs before the owner approves a merge.
- Confirm a proposed task is approved and does not overlap the other agent's active work
  before starting (see §6).

Ownership is assigned per task, not permanently per workstream or agent.

## 5. Concurrency and task ownership

- Maximum two active implementation tasks:
  - one shared-core or integration task (touches `src/engine/`, `src/voicings/`,
    `src/engine/engine.js`, `index.html`, `css/slice.css`);
  - one isolated feature or documentation task (a single preset, a single UI component,
    a docs-only change).
- One task has exactly one owning agent and one branch.
- Branch names use `codex/<task-slug>` or `claude/<task-slug>`.
- One branch may be active in only one device/session at a time.
- Shared files — `src/engine/signalChain.js`, `src/engine/engine.js`,
  `src/voicings/index.js`, `src/presets/schema/preset.schema.json`, `index.html`,
  `css/slice.css` — must not be edited concurrently unless the coordinating agent has
  documented a safe split.
- Open draft pull requests are the live task claims. Open PRs override stale assignment
  notes in `PROJECT_STATUS.md`.
- Both Codex and Claude may edit `PROJECT_STATUS.md` directly — typically as the "update
  `PROJECT_STATUS.md`" step bundled into an owner's `Approved to merge` command. Fetch the
  default branch immediately before editing it so you don't clobber a concurrent update
  from the other agent.

## 6. Starting a work session

The agent must:

1. Locate the repository root.
2. Read the required documents (§1).
3. Inspect `git status`, the current branch, the remote default branch, worktrees, and
   open pull requests.
4. Fetch the remote and start from the current default branch.
5. Confirm that the proposed task is approved and does not overlap active work.
6. Create or switch to the assigned task branch.
7. Open a draft PR early after the first coherent commit.

Never begin from a stale local checkout merely because the folder looks correct.

## 7. Working and transferring between devices

### Windows / Mac

Each machine has its own clone. Fetch and fast-forward the local default branch before
creating a branch. Devices do not share filesystem state with each other.

### Mobile and cloud

Mobile sessions use a fresh cloud checkout from GitHub. They may execute any approved
task, including implementation, but may not invent or claim unplanned work. Commit and
push before the cloud session ends.

### Moving an active task

To continue the same branch on another device:

1. Stop editing on the original device.
2. Commit all intended changes.
3. Push the branch.
4. Leave a handoff in the PR or session (template in §11).
5. Fetch and check out the branch on the new device.

Never edit the same branch simultaneously on two devices.

## 8. Pull requests and merge policy

- Never push directly to the default branch.
- Every change reaches the default branch through a pull request.
- PRs start as drafts and contain:
  - goal and approved scope;
  - changed behavior;
  - important files;
  - tests and results;
  - known risks or remaining work (including any owner-only acceptance still pending);
  - device/environment used.
- The author rebases or updates from the current default branch before final review.
- The non-authoring agent reviews the final diff.
- GitHub CI must pass (`npm test`; see §9).
- A PR may be merged only after explicit owner approval.
- After merge, delete or retire the task branch and update every active device from the
  default branch.
- Cloudflare Pages deploys the merged default branch; feature branches must not be
  treated as live production.

## 9. Required validation

Unless a narrower documentation-only change clearly does not require it, run:

```sh
npm ci
npm test
```

`npm test` runs the preset schema validator, the no-`ScriptProcessorNode` guard, and the
no-DOM-in-engine guard (§2). There is no `typecheck`/`build` step yet — this project is
plain ES modules with no bundler through milestone M2; that changes if/when Vite is
introduced at M3 (PRD §1), and this section must be updated then.

**Engine or voicing changes additionally require:**
- Opening `test/determinism.html` in a browser (or driving it headlessly, e.g. via the
  `/run` skill) and confirming PASS (bit-identical apply → mutate → re-apply).

**UI changes additionally require:**
- A manual or headless browser check that the affected view renders and behaves as
  described (no console exceptions, no broken layout).

**Preset changes additionally require:**
- `npm test` passing schema validation, and the preset's `status` field left as `"draft"`
  unless the owner has confirmed the by-ear tuning pass (`docs/tone-notes.md`).

Physical-device checks (grin test, real-hardware latency, mobile Listen Mode on a real
phone) remain owner acceptance tasks — an agent notes them as pending, never as passed.

### Definition of Done

A task is done when: `npm test` is green; the determinism check passes for any engine/
voicing change; a headless or manual UI check confirms no regression; all invariants in
§2 hold; `CREDITS.md` is updated for any new/changed asset; `PROJECT_STATUS.md` reflects
the change; and the PR description states what remains (including owner-only checks).

## 10. Ending a work session

Before stopping, the owning agent must leave:

- branch and PR;
- latest commit;
- completed scope;
- remaining work;
- validation results;
- known issues;
- exact next action.

If work is unfinished, commit and push only a coherent state. Do not imply that local
uncommitted changes will be visible to another device or agent.

## 11. Handoff template

```md
## Handoff

- Task:
- Owner:
- Branch / PR:
- Base commit:
- Completed:
- Remaining:
- Files intentionally touched:
- Checks run:
- Known issues:
- Next action:
```

## 12. Emergency rule

Urgency does not permit direct pushes to the default branch, concurrent ownership, or
skipping the PR gate. A mobile agent may create an urgent branch and draft PR from the
current default branch, but the normal review, CI, and owner approval rules still apply.
