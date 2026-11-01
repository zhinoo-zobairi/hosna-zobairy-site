# Handoff — Dr. Hosna Zobairy

Cloud project, not on the owner's computer. No git remote.

## Next task

Build the heavy scrollytelling version of this portfolio in a new session.

Reference: https://www.apple.com/airpods-pro/ — film and stills tied to the scroll, not a 3D world. Do not copy Apple. Do not build https://bruno-simon.com/.

Keep a normal layout on phones. Pinned scroll is a desktop behavior. Respect `prefers-reduced-motion`.

## What is already decided

- English first, then Kurdish (Sorani). No Persian. Kurdish sets `dir="rtl"`. Language key: `localStorage` `zobairy-lang`.
- Minimal editorial page. Colors in `src/styles.css`: paper `#f3f1ee`, ink `#1c1917`. Fonts: Newsreader, Outfit, Noto Naskh Arabic, Noto Sans Arabic.
- Header: mark, Instagram, Vita, EN/KU menu, outlined Book appointment. Phone `+988733284829`. Instagram `https://www.instagram.com/dr.hosnazobairy/`.
- Hero: split. Portrait is `public/portrait.png`. Name in Kurdish is د. حوسنا زوبەیری.
- Practice is an accordion in `src/routes/index.tsx`. One item open at a time. Each row has a still from `public/practice/`. The open row's photo is larger. The owner found an earlier sticky split and full-bleed stills poorly organized. Stills are atmospheric, not patient results and not surgery.
- Procedures: rhinoplasty and septorhinoplasty, sinus surgery, sleep apnea, ear surgery, blepharoplasty, facial rejuvenation, Botox (lines, migraine, blepharospasm). Do not add "this is not an operation."
- `/practice/$slug` pages exist. Read more buttons were removed. Do not put them back unless asked.
- Vita: Sanandaj, Abidar; Saturday, Sunday, Tuesday, 4 to 8; telephone 08733284829; medical council 128359.
- Observerships, hospital then town then country. Kurdish for Ankara is ئەنکەرە.
  - 2026 St. Joseph’s Health Centre, Toronto, Canada
  - 2026 Charité – Universitätsmedizin Berlin, Germany
  - 2024 Aarhus University Hospital, Aarhus, Denmark
  - 2019 Hacettepe University, Ankara, Turkey
- Publications are in `papers` in `src/routes/index.tsx`. Do not invent papers, schools, or years.

## Run

Stack is TanStack Start, React, Tailwind v4. `npm install`, then the sandbox `startup.sh`, or `npm run dev`. Preview is the app on port 8080.
