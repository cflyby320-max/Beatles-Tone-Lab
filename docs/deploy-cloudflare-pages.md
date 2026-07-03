# Deploying to Cloudflare (owner runbook)

Production hosting is Cloudflare (ADR 0002 — originally written for "Cloudflare Pages";
Cloudflare has since folded Pages' git-connected deploys into the unified **Workers**
product, so the dashboard flow below uses `wrangler deploy`, not the older Pages-only
wizard). The app is a **no-build static site** served straight from the repository root —
there is no build step, only a static-assets config (`wrangler.jsonc`). This runbook is
the owner one-click connect; agents cannot create the Cloudflare project, generate an API
token, or connect the account.

## One-time setup (owner)

1. In the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to Git**
   (or **Create → Import a repository**, depending on the current dashboard label).
2. Authorize and select the `cflyby320-max/Beatles-Tone-Lab` repository.
3. On the **"Set up your application"** screen:
   - **Project name:** any name (defaults to the repo name — fine as-is).
   - **Build command:** leave empty/optional — no build step.
   - **Deploy command:** leave the prefilled `npx wrangler deploy`.
   - **Non-production branch deploy command:** leave the prefilled
     `npx wrangler versions upload`.
   - **Path** (under Advanced settings): leave as `/`. This is the subdirectory *within
     the repo* to treat as the project root — used for monorepos with the app nested in a
     subfolder. This app lives at the repo root, so `/` is correct.
   - **API token:** click **Create new token** and let Cloudflare generate a scoped one
     (or supply an existing Workers-deploy-scoped token) — an owner-only credential step.
4. Click **Deploy**. Wrangler reads `wrangler.jsonc` (committed at the repo root — see
   below) to know what to serve, and Cloudflare serves the site over HTTPS on a
   `*.workers.dev` (or `*.pages.dev`, depending on project type) URL; a custom domain can
   be added later.

If your dashboard instead shows the older, simpler Pages wizard (**Framework preset**,
**Build output directory** fields, no "Deploy command"), set **Framework preset: None**
and **Build output directory: `/`** — same outcome, no `wrangler.jsonc` needed in that
flow. Which wizard you see depends on Cloudflare's current rollout; both deploy the same
static site.

## `wrangler.jsonc`

The repo root now has a minimal `wrangler.jsonc`:

```jsonc
{
  "name": "beatles-tone-lab",
  "compatibility_date": "2026-07-03",
  "assets": { "directory": "./" }
}
```

There is no `main` field because there is no server-side Worker script — this is a
static-assets-only deploy. `assets.directory: "./"` serves the whole repo tree
(`index.html`, `src/`, `css/`, `public/`, and the legacy AmpSim3 tree — see "Deploy
weight" below) exactly as the app's runtime `fetch()`/ES-module imports expect. Without
this file, `npx wrangler deploy` has nothing to deploy and fails.

## Why no build / no server

- `index.html` loads `src/main.js` as an ES module and fetches presets/IRs/riff at runtime
  with plain `fetch()` — no bundler, no transpile. The static-assets deploy serves the
  files as-is.
- `server.js` (Express 4.13) is **local dev convenience only** and is not used in
  production; it also crashes on modern Node (see README). It must not be treated as the
  production server.
- HTTPS is automatic, which is required: Play Mode's `getUserMedia()` only works in a
  secure context.

## Response headers

`_headers` at the repo root sets `X-Content-Type-Options`, `Referrer-Policy`, and a
moderate `Cache-Control` for `/public/*` and `/css/*` (Cloudflare's static-assets serving
honors the same `_headers`/`_redirects` file convention Pages used). Cache is deliberately
**not** `immutable` because asset filenames are not content-hashed (no build step) — a
future asset swap must not be pinned behind a long cache. Revisit once assets are
fingerprinted.

## Interplay with the `master` → `main` rename

`PROJECT_STATUS.md` tracks a pending owner action to rename the default branch to `main`.
If you rename **before** connecting the repo, select `main` as the production branch in
step 3. If you rename **after**, update the project's production branch in its
**Settings → Builds & deployments**.

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
`webcomponents/`, ~45 MB total). Confirmed (see `legacy-ampsim3.html`'s own `src`/`href`
references) that this tree is used **only** by the preserved legacy page — the new app
never requests it (`docs/asset-budget.md`). `wrangler.jsonc`'s `assets.directory: "./"`
currently deploys it anyway, since the legacy page needs it live at those exact paths. If
you want a leaner deploy later, that requires either keeping the legacy page's assets as
they are (simplest — current state) or restructuring the legacy page's asset paths to
exclude them from the static-assets set — not attempted here to avoid touching the
untouched legacy page. 151 tracked files and no single asset over 20 MB, so no Cloudflare
Workers static-assets limit (file count or per-file size) is at risk either way.
