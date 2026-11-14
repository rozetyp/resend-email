# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Resend Pad: a BYOK web UI for sending email through a user's own Resend API key. No accounts, no database, no analytics. Live at https://resendpad.up.railway.app (Railway project `z_RESENDPAD`, service `resend-email`). Public repo: github.com/rozetyp/resend-email (MIT).

## Commands

```bash
node api-proxy.js          # serves everything on http://localhost:3001 (PORT env overrides)
```

No build step, no npm dependencies, no linter, no committed test suite. Verify by running the proxy and using the UI with a real Resend key (send to your own inbox). Pushing to `main` triggers a Railway redeploy (nixpacks, `node api-proxy.js`).

## Architecture

- **`api-proxy.js`**: a stdlib `http` server (no Express). It exists only because Resend's API rejects browser CORS.
  - API routes (all require `Authorization: Bearer re_...`, passed straight through via one `forward()` helper): `POST /api/send` → `/emails`, `GET /api/domains` → `/domains`, `GET /api/sent` → `/emails` (query string forwarded), `GET /api/email/:id` → `/emails/:id`.
  - Everything else is a static file from **`public/` only**, matched against the `MIME_TYPES` table. A file type not in that table returns 404, so add new asset types there. Query strings are ignored for static files.
  - Request and response bodies are handled as Buffers (string concatenation corrupts multi-byte characters split across chunks). Request bodies are capped at 45MB; upstream calls time out after 30s with a 504 (`UPSTREAM_TIMEOUT_MS` overrides).
- **`public/index.html`**: the whole app in one file (vanilla JS, Tailwind Play CDN, Quill 1.3.7 from cdn.quilljs.com). Main pieces, in order: domain loader, Quill composer plus `sanitizeForEmail()` (inline styles so spacing survives Gmail/Outlook), recipient validation, Connect Thread, the send handler, and the Sent tab (cursor-paginated list via Resend's `after` param with a Load more button, plus a detail modal in a sandboxed iframe).
  - Send errors show Resend's own message (it already names the bad field); hints are added only for 401, 429 and network failures.
  - `API_URL` is `http://localhost:3001` on localhost, otherwise the current origin.
  - Connect Thread accepts raw RFC headers (`parseEmailHeaders`, with `smartParseHeaders` as a fallback for flattened pastes) or a Resend `GET /emails/:id` JSON (`parseResendJson`). `extractHeaders` fills To/Subject and stores Message-ID/References in hidden inputs. The send handler turns them into `In-Reply-To`/`References` in `payload.headers`.
  - Hidden inputs are not cleared by `form.reset()`. `clearThreadState()` must run on any reset, or the next email silently goes out as a reply.
- **`public/landing.html`**: static SEO page. Bump `<lastmod>` in `public/sitemap.xml` when pages change.

## Rules that matter here

- **Privacy invariant**: the server logs only `METHOD route status` (email ids collapsed to `/api/email/:id`). Never log keys, recipients, subjects, bodies or threading headers. A contributor PR once added threading-header logging and it was reverted. The README and landing page promise this publicly.
- **Escape before innerHTML**: anything from the user or from Resend goes through `escapeHtml()`. The API key sits in the same page, so an unescaped subject in the Sent list is a key-stealing XSS.
- **Keep it minimal** (from `.github/copilot-instructions.md`): stdlib first, no frameworks, no new dependencies or build tooling unless clearly simpler, flat structure, small incremental changes. No accounts, server-side storage or analytics.
- `CHAT.md`, `REPO-MEMORY.md`, `WORK-LOG.md` are local notes and are gitignored; the repo is public.
