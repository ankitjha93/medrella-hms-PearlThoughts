# 🧠 Medrella Brain — Product Vision & Business Context

## 1. Executive Summary & Product Mission
Medrella is a next-generation Outpatient Department (OPD) clinic scheduling and consultation platform designed to streamline the patient-doctor clinical encounter.

### Core Problems Solved
1. **Double-Booking & Slot Contention**: Dynamic real-time slot generation prevents conflicting appointments before requests reach the database.
2. **OPD Queue Chaos**: Sequential token numbering (`#OPD-01`, `#OPD-02`) gives patients transparent queue status and gives doctors a structured "Now Serving" workflow.
3. **Paper Prescription Loss**: In-app doctor consultation desk generates structured digital prescriptions and printable hospital letterhead slips.
4. **Appointment No-Shows**: 1-click RFC 5545 `.ics` calendar sync embeds reminders into patient calendars.

---

## 2. Business Rules & Domain Logic

### Slot Generation & Conflict Rules
1. A doctor is available on a given date **only** if that day of the week matches their shift schedule (`availableDays` or `DoctorAvailability`).
2. Slot duration defaults to 30 minutes (configurable between 15, 30, 45, and 60 minutes).
3. If an appointment exists for `doctorId` on `date` at `time` with status `CONFIRMED` or `SCHEDULED`, that slot is strictly marked unavailable.
4. If an appointment is cancelled, its slot is instantly restored to available status.

### Queue Token Logic
1. Every appointment created for a specific doctor on a specific date is assigned an incrementing sequential token:
   $$\text{tokenNumber} = \text{Count}(\text{Active Appointments on Date}) + 1$$
2. Token numbers are formatted as `#OPD-01`, `#OPD-02` for patient clarity.
3. Doctor dashboard identifies the lowest token number with status `CONFIRMED` or `SCHEDULED` as the current patient in "Now Serving".

### Clinical Prescription Rules
1. Prescriptions can only be created by attending doctors when transitioning an appointment to `COMPLETED`.
2. Prescriptions require at minimum a **Clinical Diagnosis** and one or more **Prescribed Medications** with dosage, frequency, and duration.
3. Completed prescriptions are immutable electronic health records (EHR) presented on verified hospital letterhead with the doctor's credentials.

---

## 3. Storage Architecture
- **In-Memory Cache**: Immediate low-latency reads and writes during server runtime.
- **Local Development**: Auto-saves to `.data/db.json` upon every write operation.
- **Vercel Serverless**: Detects `process.env.VERCEL` and routes filesystem scratchpad writes to `/tmp/db.json` to avoid read-only deployment errors.
