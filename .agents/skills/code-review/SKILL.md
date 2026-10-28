---
name: code-review
description: Quality checklist and standards required before any code commit in Medrella HMS.
---

# 🔍 Code Review Skill for Medrella HMS

Before approving or committing changes to the Medrella codebase, verify every item on this checklist:

## 1. Type Safety & Prerender Integrity
- [ ] No `any` types where an interface can be defined in `src/lib/types.ts`.
- [ ] No top-level `new Date()` outside `useEffect` in Client Components (`'use client'`).
- [ ] All Next.js 16 App Router route handler params are properly typed as `Promise<{ id: string }>`.

## 2. Dark Mode & Accessibility
- [ ] All new UI components specify paired classes for light and dark modes (e.g. `text-slate-900 dark:text-white`, `bg-white dark:bg-slate-900`).
- [ ] Interactive elements have distinct hover, focus, and disabled states.
- [ ] Form inputs have associated accessible `<label>` or `aria-label` tags.

## 3. Brand & Content Integrity
- [ ] Logo uses the medical `HeartPulse` gradient badge and strictly states **MEDRELLA** (no legacy "SCHEDULA" badges).
- [ ] No placeholder Loom video buttons on live clinical pages.
- [ ] Currency values are consistently formatted in USD (`$XX`).

## 4. Build Gate
- [ ] Run `npm run build` in `frontend/` — must finish with exit code `0` and 0 TypeScript errors.

