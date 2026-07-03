# Deploying to Cloudflare Pages (owner runbook)

Production hosting is Cloudflare Pages (ADR 0002). The app is a **no-build static site**
served straight from the repository root, so there is no build command and no output
directory to generate. This runbook is the owner one-click connect; agents cannot create
the Cloudflare project or connect the account.

## One-time setup (owner)

1. In the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to Git**.
2. Authorize and select the `cflyby320-max/Beatles-Tone-Lab` repository.
3. Configure the build:
   - **Production branch:** `master` (or `main` once the rename below happens).
   - **Framework preset:** `None`.
   - **Build command:** *(leave empty)*.
   - **Build output directory:** `/` (the repo root — `index.html` lives at the root).
   - **Environment variables:** none.
4. Save and deploy. Cloudflare serves the site over HTTPS on a
   `*.pages.dev` URL (a custom domain can be added later).

## Why no build / no server

- `index.html` loads `src/main.js` as an ES module and fetches presets/IRs/riff at runtime
  with plain `fetch()` — no bundler, no transpile. Cloudflare Pages serves the files as-is.
- `server.js` (Express 4.13) is **local dev convenience only** and is not used in
  production; it also crashes on modern Node (see README). It must not be treated as the
  production server.
- HTTPS is automatic on Pages, which is required: Play Mode's `getUserMedia()` only works
  in a secure context.

## Response headers

`_headers` at the repo root sets `X-Content-Type-Options`, `Referrer-Policy`, and a
moderate `Cache-Control` for `/public/*` and `/css/*`. Cache is deliberately **not**
`immutable` because asset filenames are not content-hashed (no build step) — a future
asset swap must not be pinned behind a long cache. Revisit once assets are fingerprinted.

## Interplay with the `master` → `main` rename

`PROJECT_STATUS.md` tracks a pending owner action to rename the default branch to `main`.
If you rename **before** creating the Pages project, set the production branch to `main` in
step 3. If you rename **after**, update the Pages project's production branch in the
project's **Settings → Builds & deployments**.

## Before making the site public (owner-only gates)

Deploying gives you a working URL you can use and preview privately. **Do not publicize it**
until the launch gates in `CREDITS.md` and `PROJECT_STATUS.md` are cleared:

- Replace the placeholder impulse responses and demo riff with properly-licensed / owner
  recorded audio — the bundled placeholders are `UNCONFIRMED` provenance and are for local
  development only.
- Complete the by-ear `draft` → `verified` tuning pass for the six presets.
- Run a formal Lighthouse pass and address any regressions.

## Deploy weight (optional cleanup)

The repo carries the upstream AmpSim3 tree (`assets/`, `img/`, `bower_components/`, `js/`,
`webcomponents/`, ~45 MB total) used only by the preserved `legacy-ampsim3.html`. It is
**not** in the app's load path (see `docs/asset-budget.md`) but it is deployed. If you want
a leaner deploy, exclude those paths (e.g. a Pages ignore rule or moving legacy assets
behind a separate path) — but keep `legacy-ampsim3.html` working, per the "legacy page
preserved" invariant.
