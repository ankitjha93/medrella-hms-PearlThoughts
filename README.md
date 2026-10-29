# 🏥 Medrella — Modern Hospital Management & Outpatient Booking System

Medrella is a full-stack, enterprise-grade Hospital Management System (HMS) and Outpatient Department (OPD) clinic scheduler built with **Next.js 16.4**, **React 19**, **TypeScript 5**, and **Tailwind CSS v4**.

It provides a seamless, conflict-free appointment booking pipeline, live OPD queue management with sequential tokens, digital doctor prescriptions, official printable medical slips, and one-click calendar exports.

---

## 🚀 Live Demo & Persona Testing

Medrella includes an instant **Demo Persona Switcher** in the top navigation bar, allowing you to test full end-to-end multi-role workflows without separate logins:

| Persona | Role | ID | Primary Capabilities |
| :--- | :--- | :--- | :--- |
| **John Doe** | Patient | `user_pat_1` | Doctor discovery, real-time slot selection, OPD token reception, calendar sync, prescription slips |
| **Dr. Jane Smith** | Doctor (Cardiology) | `user_doc_1` | "Now Serving" live OPD queue, consultation desk, medication builder (Rx), shift settings |
| **Dr. Robert Chen**| Doctor (Dermatology)| `user_doc_2` | Secondary department outpatient queue management |

---

## 🌟 Key Features

1. **Conflict-Free Slot Booking Engine**:
   - Real-time slot availability generation based on doctor shifts.
   - Server-side collision prevention guaranteeing zero double-bookings.
2. **Live OPD Queue Token System**:
   - Daily sequential numbering (`#OPD-01`, `#OPD-02`) per doctor per date.
   - Real-time "NOW SERVING" doctor banner with direct examination launcher.
3. **Doctor Consultation Desk & Digital Prescription**:
   - Clinical diagnosis input, dynamic medication builder (Name, Dosage, Frequency, Duration), advice, and next follow-up date.
4. **Verified EHR Medical Slip & One-Click Printing**:
   - Formal hospital letterhead slip formatted with patient demographics, doctor credentials, and `window.print()` PDF generator.
5. **Add to Calendar (.ics)**:
   - Direct client-side RFC 5545 `.ics` download compatible with Google Calendar, Apple Calendar, and Outlook.
6. **Dark / Light Mode**:
   - Built on Tailwind CSS v4 custom variant engine with instant persistence across reloads.
7. **Zero-Configuration Vercel Deployment**:
   - No external database or credentials required. Uses in-memory caching with automatic fallback to `/tmp` on serverless.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: [Next.js 16.4](https://nextjs.org/) (App Router, Turbopack / Webpack)
- **Runtime**: [React 19](https://react.dev/) + [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with `@custom-variant dark`
- **Icons**: [Lucide React](https://lucide.dev/)
- **Storage**: In-memory cache + JSON scratchpad (`.data/db.json` locally, `/tmp/db.json` on Vercel)

---

## 🏃 Local Development Runbook

```powershell
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
# Server ready at http://localhost:3000

# Validate production build (0 errors)
npm run build
```

---

## 📚 Project Documentation Architecture

This repository follows a structured AI & developer documentation standard:

```
├── AGENTS.md                  # Main AI coding rules and operational guardrails
├── brain.md                   # Product vision, features, and domain rules
├── memory.md                  # Durable lessons learned and architectural gotchas
├── progress.md                # Real-time feature status and milestone tracking
├── DECISIONS.md               # Architecture Decision Records (ADRs)
│
├── docs/                      # Technical specifications
│   ├── architecture.md        # System design, data flow, sequence diagrams
│   ├── database.md            # Schema dictionaries and relationship diagrams
│   ├── api-spec.md            # REST API reference, request/response contracts
│   ├── security.md            # Role boundaries, validation, security protocols
│   ├── testing.md             # Quality standards, Critical User Journeys (CUJs)
│   └── design-system.md       # Color palette, UI tokens, accessibility
│
├── tasks/                     # Task specifications
│   ├── template.md            # Standard task definition template
│   └── current-task.md        # Current active sprint task
│
├── plans/                     # Sequenced execution plans
│   └── roadmap.md             # Milestone roadmap from MVP to AI Triage
│
└── .agents/skills/            # Reusable AI engineering workflows
    ├── database-design/       # Schema modeling and slot integrity
    ├── api-development/      # Next.js App Router API design rules
    ├── debugging/             # Common bugs and verified solutions
    ├── code-review/           # Quality checklist before commits
    └── testing/               # Automated test execution standards
```

---

## ☁️ Vercel Deployment Guide

1. Import the repository into your Vercel Dashboard.
2. In Project Settings, set **Root Directory** to `frontend`.
3. Framework Preset: **Next.js**.
4. Environment variables: **None required** (Zero-secret deploy).
5. Deploy! The application will initialize with default mock data and operate serverlessly.
