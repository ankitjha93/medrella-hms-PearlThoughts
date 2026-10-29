# 🏛️ Architecture Decision Records (ADRs)

This document records the foundational architectural decisions, contexts, and trade-offs made in **Medrella HMS**.

---

## ADR-001: Hybrid In-Memory + JSON Scratchpad vs Heavy Relational Database

### Context
Building a fast-iterating, evaluation-ready Hospital Management prototype for Vercel deployment where external databases (e.g. Postgres, Supabase) introduce network latency, connection pooling overhead, migration fragility, and secret configuration friction.

### Decision
Implement an in-memory database cache backed by a JSON file scratchpad (`.data/db.json` locally and `/tmp/db.json` on Vercel).

### Consequences
- **Positive**: Zero environment variables required for full deployment. Instant boot time. Zero risk of database credential failures or connection exhaustion.
- **Trade-off**: Data written on Vercel is ephemeral across cold boots, which is acceptable and expected for a portfolio demonstration project.

---

## ADR-002: Tailwind CSS v4 `@custom-variant` Dark Mode Architecture

### Context
Tailwind CSS v4 redesigned the configuration system, dropping `tailwind.config.js` and standard v3 `darkMode: 'class'`. In v4, dark mode defaults to system media query.

### Decision
Declare `@custom-variant dark (&:where(.dark, .dark *));` in `src/app/globals.css` and use a dedicated `ThemeContext.tsx` controlling the `.dark` class on `document.documentElement` synchronized with `localStorage`.

### Consequences
- **Positive**: Instant, flicker-free manual theme toggling between light and dark across every component.
- **Trade-off**: Requires strict preservation of the CSS `@custom-variant` declaration.

---

## ADR-003: Deterministic In-Memory Conflict-Free Slot Engine

### Context
Double-booking is the single most critical failure mode in outpatient healthcare applications.

### Decision
Instead of storing thousands of empty slot records in a database table, generate available slots dynamically on request:
1. Load the doctor's shift window for the selected date.
2. Query all existing non-cancelled bookings for that doctor on that date.
3. Compute slot availability using an $O(1)$ set lookup: `!bookedTimes.has(time)`.
4. Enforce this check on the server in `POST /api/appointments` before writing.

### Consequences
- **Positive**: Impossible to create database inconsistencies or stale slot entries. Zero double-booking vulnerabilities.
- **Trade-off**: Slot granularity is governed by shift settings (15, 30, 45, 60 mins).

---

## ADR-004: Client-Side RFC 5545 `.ics` Generation vs External Calendar APIs

### Context
Patients need to add their hospital visits to Google, Apple, and Outlook calendars. Relying on Google Calendar OAuth or server-side webhook sync requires user authorization, API keys, and network dependencies.

### Decision
Generate an RFC 5545 compliant `.ics` calendar file directly in the browser using JavaScript Blob URLs (`src/lib/calendar.ts`).

### Consequences
- **Positive**: 100% reliable, instant download, zero user permissions or external API keys needed, works across all major calendar applications with custom 30-minute pre-appointment alarms.
- **Trade-off**: Does not automatically update if the user cancels outside the app without re-downloading.

