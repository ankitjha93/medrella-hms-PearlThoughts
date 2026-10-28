# 🤖 Medrella Development & Agent Guidelines

## 1. Project Stack & Standards
- **Framework**: Next.js 16.4 (App Router)
- **Runtime**: React 19 + TypeScript 5
- **Styling**: Tailwind CSS v4 (`@import "tailwindcss"`, `@custom-variant dark`)
- **Icons**: Lucide React
- **Branching Policy**: All appointment booking work occurs on `feature/appointment-booking-app`.

---

## 2. Demo Persona Switcher Protocol
For end-to-end multi-role testing without requiring separate logins:
- **Patient Persona**: `John Doe` (`user_pat_1`) — test discovery, date selection, slot locking, and self-service cancellation.
- **Doctor Persona 1**: `Dr. Jane Smith` (`user_doc_1`, Cardiology) — test incoming OPD queue, confirming visits, completing consultations, and shift management.
- **Doctor Persona 2**: `Dr. Robert Chen` (`user_doc_2`, Dermatology) — test secondary department queue.

---

## 3. Operational Runbook

### Starting Locally
```powershell
cd frontend
npm install
npm run dev
# App starts at http://localhost:3000
```

### Production Build Validation
```powershell
cd frontend
npm run build
# Must complete with 0 TypeScript and 0 prerender errors
```

### REST API Verification
```powershell
# Fetch verified specialists
Invoke-RestMethod -Uri 'http://localhost:3000/api/doctors'

# Fetch available slots for doctor on date
Invoke-RestMethod -Uri 'http://localhost:3000/api/doctors/doc_1?date=2026-10-30'

# Create appointment with auto-assigned OPD token
$body = @{ patientId='pat_1'; doctorId='doc_1'; date='2026-10-30'; time='10:00 AM'; timeSlot='10:00 AM'; symptoms='Checkup' } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:3000/api/appointments' -Method Post -Body $body -ContentType 'application/json'

# Complete visit with doctor prescription & clinical slip
$patch = @{
  status = 'COMPLETED'
  prescription = @{
    diagnosis = 'Stage 1 Pre-hypertension'
    medicines = @(@{ medicineName = 'Metoprolol'; dosage = '25mg'; frequency = 'Daily'; duration = '30 days' })
    advice = 'Low sodium diet and light morning exercise.'
    followUpDate = '2026-11-30'
  }
} | ConvertTo-Json -Depth 5
Invoke-RestMethod -Uri 'http://localhost:3000/api/appointments/apt_101' -Method Patch -Body $patch -ContentType 'application/json'
```

---

## 4. Key Engineering Guardrails
1. **No Hardcoded Dates During Static Prerender**: Avoid top-level `new Date()` outside `useEffect` to prevent Next.js static prerender errors.
2. **Tailwind v4 Dark Mode**: Must maintain `@custom-variant dark (&:where(.dark, .dark *));` in `globals.css` so `.dark` class toggling responds immediately.
3. **Vercel Deployment**: No `.env` credentials required. Set **Root Directory** to `frontend` in Vercel project configuration.

