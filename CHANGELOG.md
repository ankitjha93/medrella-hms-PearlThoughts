# 📜 Changelog

All notable user-visible and architectural changes to **Medrella HMS** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.3.0] - 2026-10-28
### Added
- **Live OPD Queue Token System**: Sequential numbering (`#OPD-01`, `#OPD-02`) per doctor per date.
- **Doctor Consultation Desk**: Live "NOW SERVING" banner with structured diagnostic and Rx medication builder.
- **Verified EHR Prescription Slip**: Formal hospital letterhead with doctor sign-off and `window.print()` PDF generator.
- **One-Click Calendar Sync (.ics)**: RFC 5545 format export with 30-minute reminder alarm for Google, Apple, and Outlook calendars.
- **AI Engineering Documentation Suite**: Created `docs/`, `tasks/`, `plans/`, and `.agents/skills/`.
- **Automated Test Matrix**: PowerShell and Node.js automated REST integration test suites (`npm test`).

---

## [0.2.0] - 2026-10-28
### Added
- **Tailwind CSS v4 Dark Mode Engine**: Tactile dual-state toggle (`Sun` / `Moon`) with `@custom-variant dark` and `localStorage` persistence.
- **Medrella Medical Branding**: Updated logo with `HeartPulse` gradient badge, removed legacy SCHEDULA badges.
- **Vercel Serverless Persistence**: Dynamic `/tmp` scratchpad detection for zero-credential deployments.

---

## [0.1.0] - 2026-10-27
### Added
- Initial full-stack Next.js 16 App Router foundation with React 19 and TypeScript 5.
- Multi-role demo persona switcher (`John Doe`, `Dr. Jane Smith`, `Dr. Robert Chen`).
- Dynamic conflict-free appointment booking engine preventing double bookings.
- Doctor discovery directory and specialty catalog.
- In-memory database cache backed by `.data/db.json`.
