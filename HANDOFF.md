# Handoff — Dr. Hosna Zobairy

Local git repo, no remote yet. Built for Vercel. Design and approved decisions: `docs/superpowers/specs/2026-11-01-scrollytelling-site-design.md`. Launch steps: `docs/launch.md`.

## Status

The scrollytelling version, the appointment backend and the admin area are built. It isn't deployed yet: follow `docs/launch.md`. Before buying the domain, Dr. Zobairy must open the `vercel.app` link from Sine without a VPN.

Pinned scroll is desktop only (≥1024px with motion allowed). Phones and `prefers-reduced-motion` get stacked sections. Reference was Apple's AirPods Pro page (stills tied to scroll). Do not copy Apple. Do not build https://bruno-simon.com/.

## What is already decided

- Call the city Sine, never Sanandaj or Sna (Kurdish: سنە). The street is Awyer, never Abidar (Kurdish: شەقامی ئاویەر).
- English first, then Kurdish (Sorani). No Persian. Kurdish sets `dir="rtl"`. Language key: `localStorage` `zobairy-lang`.
- Minimal editorial page. Colors in `src/styles.css`: paper `#f3f1ee`, ink `#1c1917`. Fonts: Newsreader, Outfit, Noto Naskh Arabic, Noto Sans Arabic.
- Header: mark, Instagram, Vita, EN/KU menu, outlined Book appointment. Phone `+988733284829`. Instagram `https://www.instagram.com/dr.hosnazobairy/`.
- Hero: split. Portrait is `public/portrait.jpg`. Name in Kurdish is د. حوسنا زوبەیری.
- Practice (`src/components/site/Practice.tsx`): on desktop, 7 pinned steps with one framed still (not full-bleed), the text in a fixed spot and a 01/07 counter; on phones, a stacked list. The owner found an earlier sticky split with full-bleed stills poorly organized. Stills are atmospheric, not patient results and not surgery.
- Procedures: rhinoplasty and septorhinoplasty, sinus surgery, sleep apnea, ear surgery, blepharoplasty, facial rejuvenation, Botox (lines, migraine, blepharospasm). Do not add "this is not an operation."
- `/practice/$slug` pages exist. Read more buttons were removed. Do not put them back unless asked.
- Vita: Sine, Awyer; Saturday, Sunday, Tuesday, 4 to 8; telephone 08733284829; medical council 128359.
- Observerships, hospital then town then country. Kurdish for Ankara is ئەنکەرە.
  - 2026 St. Joseph’s Health Centre, Toronto, Canada
  - 2026 Charité – Universitätsmedizin Berlin, Germany
  - 2024 Aarhus University Hospital, Aarhus, Denmark
  - 2019 Hacettepe University, Ankara, Turkey
- All page text is in `src/content/default.ts` (seed and fallback) and is editable at `/admin/content`. Publications are `papers` there. Do not invent papers, schools, or years.

## Run

`npm install`, then `npm run dev` (http://localhost:8080). The local database is in-memory PGlite and resets on restart. Local admin: `admin@example.test`, with the password in `.dev-admin.txt` (gitignored). Tests: `npm test`. Types: `npm run typecheck`.
