# 📜 Changelog

All notable user-visible and architectural changes to **Medrella HMS** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.5.0] - 2026-10-29
### Added
- **Dedicated Doctor Profile Pages (`/doctors/[id]`)**: Full specialist profile with verified credentials, clinical focus, OPD shift rota, and hospital desk location.
- **Patient Reviews & Ratings System (TASK-005)**: Interactive 1–5 star review submission form with live rating recalculation and verified visit badges.
- **REST API Review Endpoint**: `POST /api/doctors/[id]/reviews` with rating/comment validation and atomic persistence.
- **Direct In-Page Consultation Booking**: Sticky booking card allowing patients to launch the appointment booking modal directly from the doctor's profile.
- **Automated Test Matrix Expansion**: Added automated test case for doctor reviews, bringing the test matrix to 7/7 passing tests.

---

## [0.4.0] - 2026-10-28
### Added
- **Interactive Notification Center**: Live clinical alerts dropdown with unread badge counter in top navigation.
- **Interactive Symptom Triage Widget**: Conversational triage evaluator on landing page recommending specialists with 1-click booking.
- **Specialist Multi-Facet Discovery**: Fee tier filters, sorting, Grid/List view toggle, and Doctor Full-Profile credentials modal.
- **Enhanced Booking Experience**: Multi-step progress indicator, Morning vs Afternoon slot grouping, and quick symptom intake chips.
- **Patient Health Profile & Vitals Card**: MRN record, blood group, BP, allergies, emergency contact, and visit metrics.
- **Self-Service Appointment Rescheduling (TASK-004)**: Real-time slot reallocation, conflict validation, and automatic token updates.
- **Prescription Dosage Schedule Badges**: Visual timing badges (`Morning ☀️`, `Noon ⛅`, `Night 🌙`) on EHR prescription slips.
- **1-Click Clinical Guidance Presets (Rx)**: Standardized clinical guidance chips auto-filling diagnosis, advice, and medications.
- **Live Queue Call Advance**: "Call Next Patient" queue advance button with OPD room announcement.
- **Weekly Volume & Analytics Chart**: Visual weekly consultation throughput and completion rate dashboard.
- **Doctor Leave & Blackout Dates Manager**: Dedicated shift blackout tool to prevent bookings during vacation dates.

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

