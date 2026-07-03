# ADR 0002: Host on Cloudflare Pages

**Date:** 2026-07-03 · **Status:** Accepted

## Context

Beatles Tone Lab is 100% static (HTML/JS/CSS/wav/mp3, `localStorage` only, no backend, no
accounts). `node server.js` is local dev convenience only. HTTPS is mandatory
(`getUserMedia` requires a secure context for Play Mode). The owner wants GitHub as the
single source of truth and a free hosting target.

Options considered: Cloudflare Pages, GitHub Pages, Netlify/Vercel.

- **GitHub Pages** — zero extra accounts, but serves under a `/repo-name/` subpath, which
  complicates the app's currently-relative asset paths.
- **Netlify/Vercel** — free tier plus genuinely useful per-PR deploy-preview URLs, but
  requires another connected account.
- **Cloudflare Pages** — free, fast global CDN, HTTPS, free custom domain, connects
  directly to the GitHub repo, generous bandwidth.

## Decision

**Cloudflare Pages** is the production hosting target.

## Consequences

- No backend is ever required for v1 (or likely ever, per the concept doc's non-goals).
- If per-PR visual review previews become valuable later, Netlify can be added
  side-by-side without conflicting with Cloudflare Pages as production — that would be a
  new, separate ADR if pursued.
- Deployment: connect the GitHub repo to Cloudflare Pages, build command = none (static
  files), output directory = repo root. To be executed at or before the M5 "Ship"
  milestone (`beatles-tone-lab-02-technical-prd.md` §7).
