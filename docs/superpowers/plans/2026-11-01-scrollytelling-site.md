# Scrollytelling site, backend, hosting — implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Turn the Grok export into a self-hosted Vercel site with scroll-driven chapters, appointment requests and content editing.

**Architecture:** TanStack Start on Vercel (Nitro `vercel` preset). Server functions talk to Postgres through the existing `src/lib/db.ts`: Neon when `DATABASE_URL` is set, PGlite locally. Better Auth email+password protects `/admin`. Content is a zod-typed JSON document, versioned in `content_versions`.

**Tech stack:** React 19, TanStack Start/Router, Tailwind v4, zod 4, Better Auth 1.6, pg / PGlite, Resend (HTTP), node:test.

**Spec:** `docs/superpowers/specs/2026-11-01-scrollytelling-site-design.md`. Every decision value comes from its table; do not change values.

**Plan format note:** phase 0 is done by the lead in this session, so it lists files and checks rather than full code. Phases 1A and 1B are subagent briefs: exact files, contracts, test cases and acceptance checks.

---

## Phase 0 — lead, sequential (shared contract)

### Task 0.1: Remove Grok plumbing

**Files:**
- Delete: `server/`, `public/__grok/`, `startup.sh`, `src/components/preview-host-bridge.tsx`, `src/lib/preview-host-bridge.ts`, `src/lib/preview-embedder-origin.ts`, `src/lib/preview-path-prefix*.ts`, `src/lib/app-data/`, `src/lib/multiplayer/`, `src/lib/og/`, `src/lib/auth/`, `migrations/auth/` (content moves in 0.4), `scripts/grok-pwa-*`, `scripts/install-page.html`, `scripts/app-env-plugin.mjs`, `scripts/with-app-env*.mjs`, `scripts/check-auth-invariant*`, `scripts/sign-out-plan*`, `scripts/brand-check*`, `scripts/browser-guard.mjs`, `scripts/preview*.mjs`, `scripts/browser-smoke*`
- Modify: `vite.config.ts` (keep pglite bootstrap, tailwind, tanstackStart, nitro `vercel`, react; drop the PWA, auth popup and app-env plugins and the `serverDir` option), `package.json` scripts (plain `vite dev`/`vite build`), `src/router.tsx` (drop `rewrite`), `src/routes/__root.tsx` (drop the bridge, `AuthProvider` and the manifest link), `AGENTS.md` (short project notes)

- [ ] Delete and modify the files.
- [ ] `npm install`
- [ ] `npm run typecheck`. Expected: exit 0.
- [ ] `npm run build`. Expected: exit 0 and a `.vercel/output` folder.
- [ ] Commit `chore(platform): remove grok build plumbing`

### Task 0.2: Self-host fonts, add share meta

- [ ] `npm install @fontsource/newsreader @fontsource/outfit @fontsource/noto-naskh-arabic @fontsource/noto-sans-arabic` (weights already in use: Newsreader 400/500, Outfit 300/400/500, Naskh 500/600, Sans Arabic 400/500)
- [ ] Import them in `src/styles.css`. Remove the Google Fonts links in `__root.tsx`.
- [ ] Add `og:title`, `og:description`, `og:image=/og.jpg` and `twitter:card=summary_large_image` to `__root.tsx`.
- [ ] Typecheck and build, then commit `feat(head): self-host fonts and add share card meta`

### Task 0.3: Content contract

**Files:**
- Create: `src/content/constants.ts` (`PHONE`, `INSTAGRAM`, `LANG_KEY`, `PROCEDURE_SLUGS`, `type Lang`)
- Create: `src/content/schema.ts` (zod `siteContentSchema`, `type SiteContent`, `type Copy`)
- Create: `src/content/default.ts` (`defaultContent`: today's `copy` and `papers`, plus `statement`, `visit` and `form` in EN+KU)
- Create: `src/content/stills.ts`
- Create: `src/content/content.test.ts`
- Modify: `src/routes/index.tsx` and `src/routes/practice.$slug.tsx` so they import from `src/content/*` (no visual change)

- [ ] Write `content.test.ts`. It asserts that `siteContentSchema.parse(defaultContent)` succeeds, that `items.length === 7` with slugs equal to `PROCEDURE_SLUGS` in order, and that a copy with a missing `form.submit` fails.
- [ ] Run `node --experimental-strip-types --test src/content/content.test.ts`. Expected: FAIL (module missing).
- [ ] Implement the files.
- [ ] Re-run the test. Expected: PASS. Typecheck passes.
- [ ] Commit `feat(content): extract typed site content and defaults`

### Task 0.4: Migrations

- [ ] `migrations/0001_auth.sql`: Better Auth core tables (from the old `migrations/auth/0001_auth.sql`) plus `create table if not exists "rateLimit" ("id" text primary key, "key" text not null unique, "count" integer not null, "lastRequest" bigint not null);`
- [ ] `migrations/0002_site.sql`: exactly the SQL in the spec's "Database" section.
- [ ] Check: `npm run dev` boots, and PGlite applies both files (log has no `DB bootstrap failed`).
- [ ] Commit `feat(db): add auth and site schema migrations`

### Task 0.5: Server function stubs

- [ ] `src/server/content.ts`: `getSiteContent` returning `defaultContent`.
- [ ] `src/server/appointments.ts`: `submitAppointment` with the spec's input schema (`appointmentInputSchema` exported) returning `{ ok: false, error: "server" }`.
- [ ] Typecheck, then commit `feat(server): add server function contract stubs`

---

## Phase 1 — two subagents in parallel

Both briefs share these rules:

- Read the spec, `HANDOFF.md` and `AGENTS.md` first.
- Touch only the files you own.
- Small commits in the form `type(scope): description`, lowercase, no trailing period, no co-author or AI trailers.
- Do not push.
- Run `npm run typecheck` before every commit.

### Task 1A: Scrollytelling frontend (subagent A)

**Owns:**
- `src/routes/index.tsx`
- `src/routes/practice.$slug.tsx`
- `src/components/site/**`
- `src/lib/use-scroll-progress.ts`
- `src/lib/use-motion-ok.ts`
- additions to `src/styles.css` below the existing rules

**Must not touch:** `src/server/**`, `src/content/**` (ask the lead for content changes), `src/lib/auth/**`, `src/routes/admin*`, `src/routes/api/**`, `migrations/**`

**Contract:**
- Route loader: `loader: () => getSiteContent()`.
- Route option `headers: () => ({ "Cache-Control": "public, s-maxage=60" })`.
- Form: calls `submitAppointment({ data })` with the fields of `appointmentInputSchema`, including the hidden `website` honeypot (visually hidden, `tabIndex={-1}`, `autoComplete="off"`).

**Steps:**
- [ ] `use-scroll-progress.ts`: `useScrollProgress(ref): number` (0–1). The track's progress is `-rect.top / (rect.height - innerHeight)`, clamped, updated via rAF on scroll and resize, with listeners cleaned up.
- [ ] `use-motion-ok.ts`: true only when `matchMedia("(min-width: 1024px) and (prefers-reduced-motion: no-preference)")` matches. Starts false (SSR renders stacked) and listens for changes.
- [ ] Split `index.tsx` into components under `src/components/site/`: `Header`, `LanguageMenu`, `Hero`, `Statement`, `Practice`, `Training`, `Publications`, `Visit`, `AppointmentForm`. `index.tsx` only composes them and owns `lang` state (the existing `localStorage` key and `dir` handling).
- [ ] Build each chapter per the spec's chapter table. Pinned chapters use a tall track (`height: N * 100svh`) with a `sticky top-0 h-svh` stage. With motion off, each chapter renders as a normal stacked section.
- [ ] The header's "Book appointment" scrolls to `#visit`. Keep the `tel:` link in Visit.
- [ ] `AppointmentForm` states: idle → sending → success or error (messages from `content[lang].form`). Fields are required except note. The procedure select lists the 7 item titles plus "other". The day select shows any/sat/sun/tue. It works in RTL.
- [ ] `practice.$slug.tsx` reads `getSiteContent` in its loader.
- [ ] Commits, one per slice: hooks, header/hero, statement, practice, training+publications, visit+form, practice page.

**Acceptance:**
- `npm run typecheck` passes.
- `npm run dev`, then in a browser at 1440×900 and 390×844, in EN and KU: every chapter visible, no console errors, no horizontal scroll.
- With reduced motion emulated: stacked layout.
- On desktop, scrolling through Practice steps through 01/07 → 07/07.

### Task 1B: Backend and admin (subagent B)

**Owns:**
- `src/lib/auth/**` (new)
- `src/routes/api/auth/$.ts`
- `src/routes/admin.tsx`
- `src/routes/admin/**`
- `src/server/**` (replaces the stubs but keeps their exported names and signatures)
- `scripts/create-admin.mjs`
- `src/server/*.test.ts`
- new migrations `migrations/0003_*.sql` only if needed

**Must not touch:** `src/routes/index.tsx`, `src/routes/practice.$slug.tsx`, `src/components/site/**`, `src/content/**`

**Steps:**
- [ ] `src/lib/auth/server.ts`: the Better Auth config exactly as in the spec's "Auth" section. Database: Pool from `DATABASE_URL`, else the PGlite instance from `src/lib/db.ts` through a Kysely dialect. Look up the Better Auth 1.6 docs for the Postgres and Kysely adapter; do not guess. `secret: process.env.BETTER_AUTH_SECRET`; in dev only, fall back to a fixed dev secret with a console warning, and throw in production if it's missing.
- [ ] `src/lib/auth/client.ts`, `src/routes/api/auth/$.ts`.
- [ ] `src/server/admin-middleware.ts`: reads the session via `auth.api.getSession({ headers })` and throws a 401 `Response` if there is none. Adds `context.adminEmail`.
- [ ] `src/server/ip-hash.ts`: `hashIp(ip, secret)` = hex HMAC-SHA256. `clientIp(headers)` = first `x-forwarded-for` entry, else `x-real-ip`, else `"unknown"`.
- [ ] `src/server/rate-limit.ts`: `checkAndRecord(sql, key, { max: 5, windowSeconds: 3600 })` returns a boolean. It deletes rows older than 1 day, counts rows for the key inside the window, rejects at ≥ max, and otherwise inserts.
- [ ] `src/server/appointments.ts`: `submitAppointment` (honeypot → `ok: true` with no insert; zod invalid → `invalid`; limited → `rate_limited`; insert; then `sendClinicEmail`, setting `email_sent = true` on success, while a failure only logs) plus the admin functions `listAppointments` (runs `delete … where created_at < now() - interval '12 months'` first), `setAppointmentStatus` and `deleteAppointment`. Set `Cache-Control: no-store`.
- [ ] `src/server/email.ts`: `sendClinicEmail(request)` does a POST to `https://api.resend.com/emails` with `RESEND_API_KEY`, `MAIL_FROM` and `CLINIC_EMAIL`. If any is unset it returns false and logs once. Subject: `New appointment request — <name>`. The body is plain text with every field.
- [ ] `src/server/content.ts`: `getSiteContent` takes the latest row, `safeParse`s it, and returns it, falling back to `defaultContent` on any error or invalid row. Also `getContentForEdit`, `saveContent` (validates, inserts with `created_by = adminEmail`) and `restoreContentVersion`.
- [ ] Admin UI (English, plain Tailwind in the site's colors, `noindex` meta):
  - `/admin/login`: email and password.
  - `/admin`: requests table with status buttons and delete with confirm.
  - `/admin/content`: form for all `SiteContent` fields, EN and KU side by side, with KU inputs set to `dir="rtl"`. Papers and observerships can be added and removed. Items are fixed at 7. It also lists versions with a Restore button.
  - Sign out.
- [ ] `scripts/create-admin.mjs <email> <name>`: reads the password from a hidden prompt (never argv) and creates the user through Better Auth's server API (`auth.api.signUpEmail`, bypassing `disableSignUp` the way Better Auth documents for server calls), or prints the exact supported way to do it.
- [ ] Tests (`node --experimental-strip-types --test`, PGlite in memory, running both migrations):
  - `rate-limit.test.ts`: the 5th call is allowed, the 6th is rejected, a different key is allowed, and rows older than the window don't count.
  - `appointments.test.ts`: the honeypot stores nothing; an invalid phone returns `invalid`; a valid request inserts a row with `email_sent = false` when Resend isn't configured.
  - `content.test.ts`: an empty table returns `defaultContent`; a corrupt row returns `defaultContent`; save then get returns the saved content; restore makes the old content the latest.
  - `ip-hash.test.ts`: the hash is stable and never contains the raw IP; `clientIp` takes the first forwarded entry.
- [ ] Add the new test files to the `test` script in `package.json`. That is the one shared-file edit allowed, and only that line.

**Acceptance:**
- `npm test` and `npm run typecheck` pass.
- On local PGlite: create an admin, sign in, see a submitted request, change its status, delete it, edit content and see it on `/`, restore the old version.
- The 6th login attempt within 15 minutes is rejected.

---

## Phase 2 — lead

- [ ] Review both diffs against the spec, then integrate.
- [ ] `npm run typecheck`, `npm test`, `npm run build`
- [ ] Browser QA (desktop and phone, EN and KU, reduced motion), then the end-to-end flow from Task 1B's acceptance against the dev server and the built output.
- [ ] Code review subagent (superpowers:code-reviewer) over the whole branch; fix findings.
- [ ] `docs/launch.md`: the user's launch steps from the spec, with exact clicks and commands.
- [ ] Update `HANDOFF.md`. Commit.
