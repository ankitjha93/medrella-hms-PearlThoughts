# 🧠 Medrella Memory — Durable Decisions & Lessons Learned

This document records architectural gotchas, hard-won lessons, and durable decisions to prevent recurring issues across development sessions.

---

## 1. Technical Gotchas & Verified Solutions

### Tailwind CSS v4 Class-Based Dark Mode
- **Gotcha**: In Tailwind CSS v4, the standard `darkMode: 'class'` from v3 is deprecated. Adding `.dark` to the `<html>` or `<body>` tag will not toggle `dark:` classes by default (Tailwind v4 defaults to `@media (prefers-color-scheme)`).
- **Verified Solution**: You **must** declare `@custom-variant dark (&:where(.dark, .dark *));` in `src/app/globals.css`. This enables immediate, tactile theme switching when the `.dark` class is toggled on `document.documentElement`.

### Next.js 16 Static Prerendering & `new Date()`
- **Gotcha**: Next.js 16 App Router prerenders static pages at build time. Invoking dynamic methods like `new Date()` directly in the render body of Client Components throws `unstable value new Date() during static prerender`.
- **Verified Solution**:
  1. Defer date state initialization to `useEffect` (e.g., in `BookingModal.tsx`).
  2. For copyright footers or static labels, use static values like `2026` rather than `new Date().getFullYear()`.

### Next.js 16 Turbopack vs Webpack on Windows
- **Gotcha**: On Windows with cloud-synced directories (such as OneDrive), Turbopack can panic during `next build` due to child node loader process disconnection (`node process exited before we could connect to it with exit code: 0`).
- **Verified Solution**: Use `next build --webpack` in `package.json` for production builds. This compiles cleanly and reliably with 0 errors.

### Vercel Serverless Filesystem Restriction
- **Gotcha**: On Vercel, the application filesystem outside `/tmp` is strictly read-only. Attempting to write to `path.join(process.cwd(), '.data')` throws `EROFS: read-only file system`.
- **Verified Solution**: Use dynamic scratchpad path detection in `src/lib/db.ts`:
  ```typescript
  const DATA_DIR = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), '.data');
  ```

---

## 2. Architectural Conventions

1. **Persona Switching Over Auth Walls**:
   - For demo and evaluation speed, role switching is managed by `RoleContext.tsx` with `localStorage` persistence, rather than blocking users behind credential login gates.
2. **Deterministic Data Normalization**:
   - Backward and forward compatibility aliases are handled in `normalizeDoctor` and `normalizeAppointment` inside `src/lib/db.ts` (e.g. `specialty` vs `specialization`, `time` vs `timeSlot`, `fee` vs `consultationFee`).
3. **Client-Side RFC 5545 Generation**:
   - Calendar events are generated directly in browser memory using a Blob (`src/lib/calendar.ts`) rather than relying on external webhooks or third-party APIs.

