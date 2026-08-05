# SPARK — Tuition Management Portal

**Educate • Empower • Enrich**

A premium tuition management portal for admins, parents and students, built on React + Vite + Tailwind, with Google Sheets as the database (via Google Apps Script) and Firebase Authentication for role-based access.

## Build status

**Done — the full app is wired end-to-end and runnable today:**
- [x] Project scaffold (Vite + React 18 + Tailwind, folder structure, Netlify config, PWA)
- [x] Landing page — hero, stats, features, testimonials, FAQ, contact, footer
- [x] Firebase Authentication with role resolution (Admin / Parent / Student) — falls back to a built-in **mock-auth mode** with demo accounts when no Firebase project is configured, so the app is fully clickable without any setup
- [x] Role-based route guards + dashboard shell (sidebar, topbar, dark mode)
- [x] Data service layer (`services/api/sheetsApi.js`) — serves realistic mock data today, and switches to your live Google Apps Script API the moment `VITE_GOOGLE_SCRIPT_URL` is set, with **zero changes to any page**
- [x] Attendance module — day-wise table, monthly heatmap, filters, search, CSV export
- [x] Student Report module — full attendance log per student, search/sort/print/export
- [x] Fees module — payment history, collection chart, pie chart, per-student totals
- [x] Test Marks module — subject bar chart, performance radar chart, grade/rank
- [x] Monthly Reports module — live preview + real downloadable PDF report card (jsPDF), matching the official report-card spec (header, attendance table, summary, marks, remarks, signatures, QR mark)
- [x] Admin panel — student CRUD (add/edit/delete/reset password), centre-wide analytics with aggregated charts
- [x] Notifications, Settings (profile, password, dark mode, language, notification preferences)

**Still mock/placeholder — needs your real setup to go live:**
- [ ] Real Firebase project credentials (works today via mock auth — see Login page)
- [ ] Real Google Apps Script deployment reading/writing your two Sheets
- [ ] Persisting Admin CRUD changes (currently in-memory only in mock mode)
- [ ] Contact form submission handler (currently a client-side placeholder)
- [ ] Extras from the original brief not yet built: leaderboards, badges/achievements, WhatsApp/email share, birthday wishes, full offline queueing beyond basic PWA caching

## Getting started

```bash
npm install
cp .env.example .env   # fill in the values below
npm run dev
```

## 1. Firebase setup

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com).
2. Enable **Authentication → Sign-in method → Email/Password**.
3. In **Project settings → General → Your apps**, add a Web app and copy the config values into `.env`:
   ```
   VITE_FIREBASE_API_KEY=
   VITE_FIREBASE_AUTH_DOMAIN=
   VITE_FIREBASE_PROJECT_ID=
   VITE_FIREBASE_STORAGE_BUCKET=
   VITE_FIREBASE_MESSAGING_SENDER_ID=
   VITE_FIREBASE_APP_ID=
   ```
4. Create three custom roles (`admin`, `parent`, `student`) — this will be wired up via Firebase custom claims or a `users` sheet/collection lookup when the auth module is built.

## 2. Google Sheets setup

Two sheets are used as the database:
- **Attendance & Student Data** — one row per attendance record (Date, Day, Topic, Subject, Time In, Time Out, Duration, Status, Remarks) plus a student roster tab.
- **Fees Data** — one row per student per billing cycle (Amount Payable, Paid, Pending, Payment Date, Receipt Number, Status).

The frontend **never** connects to these sheets directly — all reads/writes go through a Google Apps Script Web App, so the sheet URLs are never exposed to the browser.

## 3. Google Apps Script setup

1. Open your Google Sheet → **Extensions → Apps Script**.
2. Write endpoints that read/write the sheet ranges and return JSON (this will be generated alongside the Attendance/Fees/Marks modules).
3. Deploy as a **Web App**: Execute as *Me*, who has access *Anyone with the link*.
4. Copy the deployment URL into `.env`:
   ```
   VITE_GOOGLE_SCRIPT_URL=
   ```

## 4. Environment variables

See `.env.example` for the full list. Never commit `.env` — it's already in `.gitignore`.

## 5. Netlify deployment

This repo ships `netlify.toml` and `public/_redirects` pre-configured for SPA routing.

1. Push the repo to GitHub/GitLab/Bitbucket.
2. In Netlify: **New site from Git** → select the repo.
3. Build command: `npm run build` · Publish directory: `dist` (already set in `netlify.toml`).
4. Add the environment variables from `.env.example` under **Site settings → Environment variables**.
5. Deploy.

## Build commands

| Command | Description |
|---|---|
| `npm run dev` | Start local dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Lint the codebase |

## Folder structure

```
src/
  assets/       Logo and static images
  components/   Reusable UI components (landing/, charts/, reports/)
  pages/        Route-level pages
  layouts/      Shared page layouts (dashboard shell, etc.)
  hooks/        Custom React hooks
  contexts/     React Context providers (auth, theme, etc.)
  services/
    firebase/   Firebase init + auth helpers
    api/        Google Apps Script API client
  styles/       Global Tailwind styles + design tokens
  utils/        Formatting, PDF generation, and other helpers
```

## Tech stack

React 18 · Vite · Tailwind CSS · React Router · Firebase Authentication · Google Apps Script · Framer Motion · Recharts · React Hook Form · jsPDF · html2canvas
