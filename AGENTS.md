# Dr. Hosna Zobairy site

Portfolio and appointment site for Dr. Hosna Zobairy, hosted on Vercel.

- Content rules: `HANDOFF.md` (Sine, never Sanandaj or Sna; Awyer, never Abidar; EN then KU, KU is `dir="rtl"`, never invent papers, schools or years).
- Design and decisions: `docs/superpowers/specs/2026-11-01-scrollytelling-site-design.md`.

## Stack

TanStack Start, React 19, Tailwind v4, zod. It deploys to Vercel through Nitro's `vercel` preset.

The database is Postgres when `DATABASE_URL` is set, and an embedded PGlite otherwise (`src/lib/db.ts`). Migrations in `migrations/*.sql` run on `npm run build` and at local startup.

## Commands

```bash
npm run dev        # http://localhost:8080
npm run typecheck
npm test
npm run build
```

## Rules

- Pinned scroll is desktop only. Phones and `prefers-reduced-motion` get a stacked layout.
- Content lives in `src/content/`. Editable text goes through the zod schema there.
- Never commit `.env` files or secrets.
