# Beatles Tone Lab: Owner's Multi-Device Guide

This is the simple operating guide for working with Codex and Claude from Windows, Mac,
or mobile. You do not need to know Git commands to use it.

## The one mental model

Think of the project as three layers:

1. **GitHub's default branch** is the official published notebook.
2. **A branch** is one agent's private working page.
3. **A pull request (PR)** asks to place that working page into the official notebook.

Your computers and cloud sessions do not automatically share files. They see work only
after an agent **commits and pushes** its branch to GitHub.

A pushed branch is visible from another device even before it is merged. A draft PR makes
that branch easy to find and explains what it contains.

## The golden rule

For new work:

- Start **from** the latest default branch.
- Work **on a new branch**, never directly on the default branch.
- Merge the branch into the default branch only after review, green checks, and your
  approval.

Choosing the default branch as the starting point is correct. Choosing it as the place to
make changes is not.

## Before opening any new session

Look at the GitHub repository:

1. Open `https://github.com/cflyby320-max/Beatles-Tone-Lab`.
2. Select the **Pull requests** tab.
3. Check whether Codex or Claude already has an open PR.
4. Do not start a task that edits the same feature or files.
5. Tell the new agent which existing PR or approved roadmap task it owns.

At most two tasks may be active: one shared/core task and one isolated task.

## Recipe A: Start new work on Windows with Codex

Use this after the canonical clone exists locally.

1. Open Codex.
2. Select the **Beatles Tone Lab** project.
3. Choose **New thread**.
4. For environment, choose **Worktree** for any task that changes files.
5. For starting branch/base, choose the default branch.
6. Do not select an existing feature branch unless you are deliberately continuing that
   exact task.
7. Paste:

```text
Read beatles-tone-lab-01-concept.md, beatles-tone-lab-02-technical-prd.md, AGENTS.md, and
PROJECT_STATUS.md first.
Inspect the current default branch and all open pull requests.
You own this approved task: [describe the task].
Create/use a codex/<task-name> branch, avoid active-task overlap, run the required checks
(npm test; determinism check if engine/voicing changed), push the branch, and open a
draft PR. Do not merge it.
```

Choose **Local** only for read-only discussion, planning, or inspecting the canonical
checkout without making changes. Use **Worktree** for implementation.

## Recipe B: Start new work on Mac

Your Mac has a separate copy of the project. It does not share files with Windows.

1. Open the Beatles Tone Lab folder or project on the Mac.
2. Start Claude or Codex in that repository.
3. Tell the agent to update its view of GitHub before doing anything.
4. For a new task, start from the default branch and create a new branch.
5. Paste:

```text
Before changing files, fetch GitHub and confirm this checkout is based on the latest
default branch. Read beatles-tone-lab-01-concept.md, beatles-tone-lab-02-technical-prd.md,
AGENTS.md, and PROJECT_STATUS.md, then inspect open PRs.

You own this approved task: [describe the task].
Work on claude/<task-name> if you are Claude, or codex/<task-name> if you are Codex. Run
npm test (and the determinism check if you touched src/engine or src/voicings). Push it
and open a draft PR. Never push directly to the default branch and do not merge.
```

If the agent says the Mac has local uncommitted work or is behind GitHub, stop and ask it
to explain the safe options before continuing.

## Recipe C: Start new work from mobile with Claude

Mobile work uses a cloud environment. Nothing runs from your phone's local storage.

For a new approved task:

1. Open Claude.
2. Start a new coding/cloud session.
3. Choose the GitHub repository **cflyby320-max/Beatles-Tone-Lab**.
4. Choose **Cloud** as the environment.
5. Choose the default branch as the starting branch/base.
6. If offered **new branch** or **worktree**, choose it.
7. Paste:

```text
This is a new approved Beatles Tone Lab task in a cloud environment.
Read beatles-tone-lab-01-concept.md, beatles-tone-lab-02-technical-prd.md, AGENTS.md, and
PROJECT_STATUS.md. Inspect the current default branch and all open PRs before changing
anything.

Task: [describe the approved task].
Create a claude/<task-name> branch. Do not work directly on the default branch. Run
npm test (and the browser determinism check for engine/voicing work). Commit and push
everything, open a draft PR, leave a handoff, and do not merge.
```

Cloud storage may disappear after the session. Do not end the session until Claude
confirms that the commit and branch were pushed to GitHub.

## Recipe D: Continue an existing task on another device

Do not start from the default branch when continuing an existing task.

Before leaving the first device, tell the agent:

```text
Prepare this task for transfer to another device. Commit and push all coherent work to
the existing branch, update or open its draft PR, and leave a handoff with the branch, PR,
commit, checks, remaining work, and exact next step. Do not merge.
```

Wait until the agent confirms the branch was pushed. Then stop that session.

On the new device:

1. Open the existing PR on GitHub and note its branch name.
2. Start a new session in the Beatles Tone Lab repository.
3. Choose the **existing branch** shown on the PR, not the default branch.
4. Paste:

```text
Continue the existing Beatles Tone Lab task from PR #[number] on branch [branch-name].
Read the PR handoff and required project documents, fetch the latest pushed branch, and
confirm there is no other active session editing it. Continue the approved scope only.
Push updates to the same branch and do not merge.
```

Never keep the same branch open for editing on two devices simultaneously.

## Recipe E: Review a finished PR

You do not need to understand the code diff yourself.

When Claude authored the PR, ask Codex:

```text
Review Beatles Tone Lab PR #[number] against the concept doc, technical PRD, AGENTS.md,
PROJECT_STATUS.md, and its approved scope. Check for bugs, scope violations, conflicts,
missing tests, broken determinism, DOM leaking into the engine, and any Beatles-audio/
artwork content-safety regressions. Explain the result to me in plain language. Do not
modify or merge the PR.
```

When Codex authored the PR, ask Claude the same question.

Do not approve the merge until all are true:

- The reviewing agent says there are no blocking issues.
- GitHub checks show green/pass (`npm test`).
- The PR does only the task you approved.
- Any visible UI change was tested (manually or headlessly) when appropriate.
- Any engine/voicing change passed the determinism check.
- The PR explains what changed and what remains.

If anything is unclear, say:

```text
Do not merge. Explain the risk and recommended action in nontechnical language.
```

When everything is ready, say:

```text
Approved to merge PR #[number]. Merge it, confirm the default branch and Cloudflare Pages
deploy are healthy, delete or retire the task branch, and update PROJECT_STATUS.md as
required.
```

## Recipe F: What the common buttons mean

| Button or choice | Meaning | Choose it when |
|---|---|---|
| **Default branch** as starting branch | Begin with the latest official project | Starting a new task |
| **New branch / Worktree** | Make an isolated workspace for one task | Any implementation task |
| **Existing branch** | Continue already-pushed work | Moving an active PR to another device |
| **Local** | Use files stored on that computer | Planning, inspection, or deliberate local work |
| **Cloud** | Use a temporary remote computer connected to GitHub | Mobile work |
| **Draft PR** | Work is visible but not ready to merge | Open early for every task |
| **Ready for review** | Author believes implementation is finished | After checks pass locally |
| **Merge** | Put the branch into the official default branch | Only after cross-agent review, green checks, and your approval |

Labels may vary slightly between Codex and Claude. If you cannot identify the equivalent
choice, ask the agent:

```text
I want a new isolated task based on current GitHub's default branch, not direct edits to
it. Which option on this screen should I select?
```

## Your five safety questions

Before approving any work, ask:

1. Is this based on the current GitHub default branch?
2. Is it on its own named branch?
3. Is another agent editing the same task or shared files?
4. Is there a draft PR with green checks and a plain-language review?
5. Has all work been committed and pushed before switching devices?

If the answer to any question is unknown, do not merge yet.

## Beatles Tone Lab specifics (beyond the general recipes above)

- **No build step yet.** Validation is `npm test` (schema + engine-invariant guards),
  plus opening `test/determinism.html` in a browser for any engine/voicing change — there
  is no `npm run typecheck`/`npm run build` until Vite arrives at milestone M3.
- **Owner-only checks** an agent cannot perform: the Grin Test (real guitar through a
  preset) and real-hardware latency feel. Don't accept an agent's claim that these passed
  — do them yourself before calling a milestone complete.
- **Deploys:** Cloudflare Pages builds from the default branch; there is no staging
  environment yet, so treat "merge to default branch" as "goes live."
