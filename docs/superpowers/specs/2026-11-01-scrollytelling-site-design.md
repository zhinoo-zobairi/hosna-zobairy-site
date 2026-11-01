# Dr. Hosna Zobairy site — scrollytelling, backend, hosting

Approved in chat on 2026-11-01. Read `HANDOFF.md` for content rules (Sna not Sanandaj, no invented papers, EN then KU, KU is `dir="rtl"`).

## Goal

Turn the Grok Build export into a site we host ourselves:

1. A scroll-driven page (desktop pinned chapters, phones stacked).
2. A backend for appointment requests and content editing.
3. Vercel hosting on hosnazobairy.com.

## Non-goals

- No image uploads. Photos stay in `public/`.
- No video. Stills only.
- No public sign-up. No patient accounts.
- No Persian.
- No scheduled jobs.

## Approved decisions

| # | Decision | Value |
|---|---|---|
| 1 | Vercel plan | Hobby (free) while the site is not live. Pro ($20/month) at launch: a public page advertising her services is commercial use. |
| 2 | Database | Neon Postgres, free tier, from the Vercel Marketplace |
| 3 | Email | Resend free tier (3,000/month, 100/day), called with `fetch`, no SDK. Recipient comes from env `CLINIC_EMAIL`. The address is still to come from the user. |
| 4 | Admin sessions | Better Auth default: 7 days, refreshed daily |
| 5 | Login limit | 5 attempts per 15 minutes per IP, stored in the database (Better Auth `rateLimit`, `storage: "database"`) |
| 6 | Form spam limit | 5 requests per hour per IP plus a hidden honeypot field. IPs are stored only as an HMAC-SHA256 hash keyed with `BETTER_AUTH_SECRET`. |
| 7 | Email failure | The request is still saved, with `email_sent = false`, and admin shows it |
| 8 | Retention | Appointment requests are deleted 12 months after `created_at`. The purge runs when an admin loads the Requests page. |
| 9 | Content caching | Public pages send `Cache-Control: public, s-maxage=60`. Admin and API responses send `no-store`. |
| 10 | Database down | Public pages render the bundled default content |
| 11 | Content history | Every save inserts a new row. All rows are kept. |
| 12 | Admin edits | Text only |
| 13 | Admin language | English only |
| 14 | Deploy flow | Private GitHub repo, with Vercel deploying automatically on every push to `main` |
| 15 | Grok cleanup | Remove all Grok platform pieces (list below) |
| 16 | Login limit fix | Better Auth base `rateLimit.window: 900`, because its database storage prunes counters older than the base window. Other auth endpoints get 100 requests per 15 min per IP. |
| 17 | Email timeout | 5 s (`AbortSignal.timeout(5000)`). The request is saved either way. |
| 18 | Region | Vercel's default function region (US East, `iad1`), with Neon in AWS us-east-1 |
| 19 | Clinic email content | A ping only: subject "New appointment request" and a link to `/admin`. No name, phone, procedure or note, so the 12-month purge covers every copy of patient data. |

## Architecture

```
Browser
  │  GET /            route loader ─► getSiteContent() ─► content_versions (latest) ─┐
  │                                                     └─ on error: bundled default  │
  │  POST form        submitAppointment() ─► rate_limits check ─► appointment_requests
  │                                       └► Resend ping to CLINIC_EMAIL, no patient data (failure is logged, not fatal)
  │  /admin/*         Better Auth session ─► admin server functions
  ▼
Vercel (TanStack Start + Nitro, preset "vercel") ─► Neon Postgres
Local dev: no DATABASE_URL ─► PGlite (existing src/lib/db.ts)
Deploy: npm run build ─► scripts/migrate.mjs applies migrations/*.sql
```

## Content model (`src/content/`)

- `schema.ts`: zod schema plus `type SiteContent = z.infer<...>`.
- `default.ts`: `defaultContent: SiteContent`, moved verbatim from `copy` and `papers` in `src/routes/index.tsx`, plus the new fields listed below.
- `stills.ts`: the `stills` array, which stays in code.
- `constants.ts`: `PHONE`, `INSTAGRAM`, `LANG_KEY`, `PROCEDURE_SLUGS`.

```ts
SiteContent = {
  en: Copy; ku: Copy;
  papers: { year: string; title: string; venue: string; href?: string }[];
}
Copy = {
  // existing fields, unchanged names
  mark, instagram, book, place, name, line, cred, menuEn, menuKu,
  practice, vita, vitaBody, publications, observership: string;
  items: { n: string; slug: Slug; title: string; text: string }[]; // exactly 7, slugs fixed, order fixed
  facts: { label: string; value: string; href?: string }[];
  observerships: { year: string; place: string }[];
  // new
  statement: string;  // seeded from the second sentence of vitaBody (existing text, no new claims)
  visit: string;      // chapter title, e.g. "Visit"
  form: { name, phone, procedure, procedureOther, day, dayAny, daySat, daySun, dayTue,
          note, submit, sending, success, invalid, rateLimited, error, consent: string };
}
```

The Kurdish `form` labels are new text. A native speaker needs to check them before launch.

## Database (`migrations/`)

- `0001_auth.sql`: Better Auth core tables (`user`, `session`, `account`, `verification`) plus `rateLimit`, in the Postgres schema Better Auth expects. It moves to the top-level folder so `migrate.mjs` applies it.
- `0002_site.sql`:

```sql
create table appointment_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (length(name) between 1 and 120),
  phone text not null check (length(phone) between 5 and 40),
  procedure text not null,                 -- a PROCEDURE_SLUG or 'other'
  preferred_day text not null check (preferred_day in ('any','sat','sun','tue')),
  note text check (length(note) <= 1000),
  lang text not null check (lang in ('en','ku')),
  status text not null default 'new' check (status in ('new','contacted','done')),
  email_sent boolean not null default false
);
create index appointment_requests_created_at on appointment_requests (created_at desc);

create table content_versions (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  created_by text not null,                -- admin email, or 'seed'
  content jsonb not null
);

create table rate_limits (
  key text not null,                       -- 'appt:' || ip_hash
  created_at timestamptz not null default now()
);
create index rate_limits_key_time on rate_limits (key, created_at);
```

The `rate_limits` rows older than 1 day are deleted each time a new row is written.

## Server functions (`src/server/`)

| Function | Auth | Input → output |
|---|---|---|
| `getSiteContent` | public | none → `SiteContent` (latest valid version, else `defaultContent`) |
| `submitAppointment` | public | `{ name, phone, procedure, preferredDay, note?, lang, website }` → `{ ok: true } \| { ok: false, error: "invalid" \| "rate_limited" \| "server" }` (`website` is the honeypot; if filled, return `ok: true` and store nothing) |
| `listAppointments` | admin | none → requests, newest first (runs the 12-month purge first) |
| `setAppointmentStatus` | admin | `{ id, status }` → `{ ok }` |
| `deleteAppointment` | admin | `{ id }` → `{ ok }` |
| `getContentForEdit` | admin | none → `{ content, versions: { id, created_at, created_by }[] }` |
| `saveContent` | admin | `SiteContent` → `{ ok, id }` (zod-validated) |
| `restoreContentVersion` | admin | `{ id }` → `{ ok, id }` (copies the old row as a new latest row) |

Admin functions use a small `adminMiddleware` that reads the Better Auth session and throws 401 when there is none.

## Auth (`src/lib/auth/`)

`src/lib/auth/` is replaced by a lean setup:

- `server.ts`: `betterAuth({ emailAndPassword: { enabled: true, disableSignUp: true }, rateLimit: { storage: "database", customRules: { "/sign-in/email": { window: 900, max: 5 } } } })`. It uses the same pg/PGlite connection choice as `src/lib/db.ts`.
- `client.ts`: `createAuthClient()`.
- `src/routes/api/auth/$.ts`: the Better Auth handler.
- `scripts/create-admin.mjs`: creates an admin by email and password, read from the command line.

## Page chapters (`src/routes/index.tsx` and `src/components/site/`)

| Chapter | Desktop (≥1024px, motion allowed) | Phone / reduced motion |
|---|---|---|
| Header | mark, Instagram, Vita, EN/KU menu, outlined "Book appointment" (scrolls to `#visit`) | same |
| Hero | Portrait starts full-stage and shrinks into the split hero frame; name, line and cred fade in | static split / stacked hero |
| Statement | `statement` words go from muted to ink with progress | plain paragraph |
| Practice | 7 pinned steps: one framed still (not full-bleed) with slow zoom, crossfading; title and text in a fixed spot; 01/07 counter | stacked list, one still per item |
| Training | observerships timeline, line draws with progress | static list |
| Publications | list, fades in, not pinned | list |
| Visit | `vitaBody`, facts, appointment form | same, stacked |

- **Scroll engine:** a single `useScrollProgress(ref)` hook (rAF plus `getBoundingClientRect`), returning 0–1 for a tall track. No animation library.
- **Motion gate:** `matchMedia("(min-width: 1024px) and (prefers-reduced-motion: no-preference)")`, plus a CSS fallback so SSR output is the stacked layout.
- **Language:** RTL works in every chapter.
- **Practice pages:** `/practice/$slug` reads from `getSiteContent` too.

## Cleanup (Grok removal)

Remove:

- `scripts/grok-pwa-*`, `server/`, `public/__grok/`, `scripts/install-page.html`
- `src/components/preview-host-bridge.tsx`, `src/lib/preview-*`, `previewPathRewrite`
- `src/lib/app-data/`, `src/lib/multiplayer/`, `src/lib/og/`
- `scripts/app-env-plugin.mjs`, `scripts/with-app-env.mjs`, `scripts/check-auth-invariant*`, `scripts/sign-out-plan*`, `scripts/brand-check*`, `scripts/browser-guard.mjs`, `scripts/preview-thumbnail.mjs`, `scripts/preview*.mjs`
- `startup.sh`
- the Grok parts of `vite.config.ts` (PWA plugin, auth popup plugin, app-env plugin)

Also remove `scripts/browser-smoke*` (its verdicts check Grok branding); QA uses a real browser instead. Replace `AGENTS.md` with short project notes. Self-host the fonts with `@fontsource`. Add `og:` and `twitter:` meta pointing at `/og.jpg` in `__root.tsx`.

## Environment variables (Vercel)

`DATABASE_URL` (from Neon), `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `RESEND_API_KEY`, `CLINIC_EMAIL`, `MAIL_FROM`

`MAIL_FROM` is `onboarding@resend.dev` until the domain is verified in Resend. That sender can only deliver to the Resend account owner.

## Verification

- `npm run build` and `npm run typecheck` pass. Unit tests cover the zod schemas, the content fallback and the rate-limit logic (`node --test`).
- Browser check at desktop 1440×900 and phone 390×844, in EN and KU: content visible, no console errors, no horizontal overflow, reduced motion gives the stacked layout.
- End-to-end locally on PGlite: submit form → row in admin → mark contacted → delete. Edit content → page shows it → restore the old version.
- Production build served locally and smoke-checked.

## Launch steps (the user does these; Claude prepares the instructions)

1. Vercel account, `vercel login`, link the project.
2. Add Neon from the Marketplace (sets `DATABASE_URL`).
3. Resend account and API key.
4. Set env vars and deploy to the `*.vercel.app` URL.
5. Dr. Zobairy opens the URL from Sna. If it doesn't load, stop and revisit hosting.
6. Buy hosnazobairy.com, add it in Vercel, verify the domain in Resend, switch to Pro.
7. Create admin accounts with `scripts/create-admin.mjs` against production.
