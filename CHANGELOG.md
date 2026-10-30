# 📜 Changelog

All notable user-visible and architectural changes to **Medrella HMS** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.9.0] - 2026-10-30
### Added
- **Dual-Mode Razorpay Payment Gateway Integration**:
  - Implemented client-side Razorpay Standard Checkout SDK loader and modal launcher (`src/lib/payments/razorpayClient.ts`) supporting UPI (GPay, PhonePe, Paytm, BHIM), Cards, NetBanking, and Wallets.
  - Enhanced server-side `RazorpayGateway` with REST API order creation (`/v1/orders`) and refunds (`/v1/payments/{id}/refund`) via HTTP Basic Authentication.
  - Implemented timing-safe cryptographic HMAC-SHA256 signature verification in `RazorpayGateway.verifySignature()`.
  - Configured zero-credential resilient architecture: runs seamless sandbox simulations out-of-the-box and automatically switches to live Razorpay calls when keys are set in `.env.local`.
  - Added `@source` directives in `frontend/src/app/globals.css` ensuring complete Tailwind CSS v4 utility scanning and production compilation on Vercel.
- **Payment Integration & Extensible Gateway (TASK-009)**:
  - Created extensible `PaymentGateway` architecture (`src/lib/payments/gateway.ts`) supporting **Razorpay** (HMAC-SHA256 signature verification), **Stripe**, and zero-credential **Simulated Provider**.
  - Server-side order creation (`POST /api/payments/create-order`) enforcing database doctor fee verification.
  - Conflict-free **Slot Hold Engine** with 10-minute TTL to prevent double-booking and checkout race conditions.
  - Cryptographic server-side payment verification (`POST /api/payments/verify`) transitioning appointments to `CONFIRMED`, assigning OPD tokens, generating paid invoices, and scheduling reminders.
  - Secure webhook endpoint (`POST /api/payments/webhook`) with signature verification and idempotent event tracking (`payment.captured`, `payment.failed`).
- **Multi-Tier Refund Management**:
  - Implemented hospital policy refund calculations (`GET /api/payments/refund`): 100% full refund for cancellations $> 24$h prior, 50% partial refund for cancellations $\le 24$h, and 0% for past/completed visits.
  - Decoupled appointment cancellation state from refund lifecycle (`POST /api/payments/refund`).
  - Added interactive Cancellation & Refund Policy modal in the Patient Portal (`/patient`).
  - Displayed refund and payment status badges on appointment cards and billing statements.
- **Automated Appointment Reminders & Multi-Channel Notifications**:
  - Multi-channel notification service (`src/lib/notifications/service.ts`) dispatching email logs, in-app alerts, and prepared for future SMS/WhatsApp connectors.
  - Automated reminder scheduler creating 24-hour and 1-hour pre-visit alerts upon booking.
  - Automatic reminder rescheduling and cancellation safeguard ensuring cancelled or completed visits never receive inappropriate alerts.
  - Cron/automated processor endpoint (`POST /api/notifications/reminders/process`).
  - Live notification center integration in `Navbar.tsx` dynamically linked to `/api/notifications`.
- **Automated Integration Test Matrix**:
  - Expanded test suite to **25 / 25 passing tests** (`tests/run-tests.mjs`).

---

## [0.8.1] - 2026-10-29
### Fixed
- **Tailwind CSS v4 Production Compilation on Vercel Deployment**:
  - Resolved missing styles and unstyled HTML on production Vercel deployment (`medrella-hms.vercel.app`).
  - Installed `@tailwindcss/postcss` and `postcss` in `frontend/`.
  - Added `frontend/postcss.config.mjs` to properly drive the Tailwind CSS v4 compiler across both Webpack and Turbopack.
  - Removed conflicting Turbopack-only CSS rule in `frontend/next.config.ts`.
  - Verified compiled production bundle size grew from 25 KB to ~95 KB with full utility class generation (`.flex`, `.grid`, `.bg-emerald-600`, keyframes, etc.).

---

## [0.8.0] - 2026-10-29
### Added
- **Enterprise Authentication Enhancements (TASK-008)**:
  - **Passwordless Magic Link & OTP**: Added 1-click passwordless login on `/login` with real-time email dispatch confirmation and error feedback.
  - **Complete Password Recovery Suite**:
    - Created `src/app/forgot-password/page.tsx` for secure password recovery initiation.
    - Created `src/app/reset-password/page.tsx` with live cryptographic token consumption and interactive password entropy scoring.
  - **Multi-Role Specialist & Patient Registration**:
    - Enhanced `/signup` with role selection tabs (Patient vs Doctor / Specialist).
    - Added specialty selector (Cardiology, Dermatology, Pediatrics, Orthopedics, Neurology), hospital affiliation, and medical license ID fields for doctor registrations.
  - **Interactive Password Strength Meter**: Real-time visual progress bar and criteria checklist (length, digits, uppercase, special symbols) implemented across registration, password reset, and profile management forms.
  - **OAuth 2.0 Social Sign-In**: Integrated "Continue with Google" and "Continue with GitHub" buttons powered by Supabase Auth with fallback.
  - **User Profile & Security Management (`/profile`)**:
    - Created dedicated `/profile` portal with two tabs: Personal & Clinical Information and Security & Workstation Access.
    - Display name editing, emergency contact, blood group / clinical department, and customizable avatar with presets.
    - Password change form with entropy validation.
    - Active workstation session inspection (current browser, tablet session, and "Sign Out of All Workstations" control).
  - **Route Protection & Navigation**:
    - Updated `src/middleware.ts` to guard `/profile` and allow public access to `/forgot-password` and `/reset-password`.
    - Added "My Profile & Security" link to `Navbar.tsx` user dropdown.
  - **Test Matrix & Production Validation**:
    - Added tests for `/forgot-password`, `/reset-password`, and `/profile` in `tests/run-tests.mjs` (18/18 PASS).
    - Production build compiles all 28 routes with 0 TypeScript and 0 prerender errors.

---

## [0.7.0] - 2026-10-29
### Added
- **Production-Ready Supabase Authentication (TASK-007)**:
  - Installed and configured `@supabase/supabase-js` and `@supabase/ssr` with Next.js 16 App Router cookie handling.
  - Browser client (`src/lib/supabase/client.ts`) with dynamic `isSupabaseConfigured()` checking.
  - Server client (`src/lib/supabase/server.ts`) with asynchronous `cookies()` store.
  - Middleware token refresher (`src/lib/supabase/middleware.ts`).
  - Next.js Edge Middleware (`src/middleware.ts`) enforcing Role-Based Access Control on `/admin`, `/doctor`, and `/patient`.
- **Clinical Authentication Portals**:
  - Dedicated `/login` portal with email/password authentication and 1-click **Demo Quick Login** for Patient, Doctor, and Admin personas.
  - Dedicated `/signup` portal for patient onboarding with name, phone, email, and password validation.
  - `/auth/callback` route handler exchanging OAuth/verification codes for active sessions.
- **Supabase Database Migration & RBAC**:
  - Added `supabase/schema.sql` defining `profiles` table, Row Level Security (RLS) policies, and `handle_new_user()` trigger for automated user provisioning.
- **Navbar Session Controls**:
  - Updated Navbar dropdown with active session display, user role badge, direct links to clinical portals, and "Sign Out" button.
- **Automated Integration Test Matrix Expansion**:
  - Added tests for `/login` and `/signup` routes in `tests/run-tests.mjs`, expanding matrix to 15/15 passing tests.

---

## [0.6.0] - 2026-10-29
### Added
- **Danphe EMR Architecture Alignment (TASK-006)**: Integrated enterprise Hospital Management Information System (HMIS) capabilities inspired by `opensource-emr/hospital-management-emr`.
- **Admin Module Suite (`/admin`)**:
  - Executive Operations Dashboard with real-time hospital KPIs (settled revenue, daily footfall, active staff, unsettled invoices).
  - Specialist Roster directory with search, department filtering, and modal to **Onboard Doctor Specialists**.
  - Clinical Departments directory (Cardiology, Dermatology, Pediatrics, Orthopedics, Neurology) with HOD and ward locations.
  - Hospital Billing Ledger with status reconciliation (`PAID`, `PENDING`), itemized fee schedules, and receipt printing.
  - Security & Compliance Audit Trail recording system and clinical actions.
- **Enhanced Patient Module (`/patient`)**:
  - Master Patient Index (MPI) with unique MRN, blood group, allergies, and emergency contact.
  - Longitudinal Electronic Medical Record (EMR) chronological timeline of visits, diagnoses, vitals, prescriptions, and lab orders.
  - Billing Statements & Receipts tab with online invoice settlement simulation.
- **Enhanced Doctor Module (`/doctor`)**:
  - Live 3-Stage OPD Triage Queue (*Waiting*, *In Consultation*, *Completed*) with "Call Next Patient" advance.
  - Structured SOAP Clinical Encounter Desk (Subjective, Objective vitals bedside entry, ICD-10 assessment presets, Diagnostic Lab Orders, e-Prescribing).
- **Admin REST API Endpoints**:
  - `GET /api/admin/stats`: Hospital executive KPIs.
  - `GET /api/admin/doctors` & `POST /api/admin/doctors`: Doctor management and onboarding.
  - `GET /api/admin/departments`: Department directory.
  - `GET /api/admin/invoices` & `PATCH /api/admin/invoices/[id]`: Hospital billing ledger & reconciliation.
  - `GET /api/admin/audit-logs`: Audit events log.
  - `GET /api/patient/profile`: Master Patient Index profile.
  - `POST /api/appointments/[id]/encounter`: SOAP clinical encounter sign-off.
- **Demo Switcher Expansion**: Added `Sarah Jenkins` (`user_admin_1`, Hospital Operations Director) to `RoleContext.tsx` and `Navbar.tsx` for 1-click testing across Patient, Doctor, and Admin roles.
- **Automated Test Matrix Expansion**: Expanded `tests/run-tests.mjs` to 13 integration tests (100% pass rate).

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

