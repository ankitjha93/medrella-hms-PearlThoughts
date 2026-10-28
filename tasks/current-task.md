# TASK-004: Appointment Rescheduling & Self-Service Slot Reallocation

## 1. Overview & Objective
Enable patients and doctors to change an active appointment's date and time slot without needing to cancel and re-create the visit from scratch.

When rescheduling:
1. The original slot must be immediately freed up for other patients.
2. The target slot must be validated for conflict.
3. An updated OPD Queue Token must be assigned for the new date.
4. The patient's `.ics` calendar sync should reflect the new schedule.

---

## 2. User Story
- **As a**: Patient with a confirmed consultation (`John Doe`)
- **I want to**: Click "Reschedule Visit", select a new date and open slot, and confirm the change
- **So that**: I can adjust my clinical appointment without losing my patient intake symptoms or booking reference.

---

## 3. Detailed Requirements

### Frontend (Patient Portal `/patient`)
- Add a **"Reschedule"** button next to "Cancel Visit" for `CONFIRMED` or `SCHEDULED` visits.
- Clicking opens a **Reschedule Modal**:
  - Displays current appointment details (Doctor, Date, Time Slot, Reason).
  - Date Picker: select target date (defaults to tomorrow, min today).
  - Slot Selector: live query `GET /api/doctors/[doctorId]?date=[newDate]` to fetch open slots.
  - Reason for Rescheduling (optional textarea).
  - Submit Button: "Confirm Reschedule".

### Backend (`PATCH /api/appointments/[id]/reschedule` or `PATCH /api/appointments/[id]`)
- Validate that the target appointment exists and status is either `CONFIRMED` or `SCHEDULED`.
- Reject if appointment is `COMPLETED` or `CANCELLED`.
- Verify the target doctor is available on the new date and the requested slot is open.
- Atomic update:
  - Update `date` and `time` / `timeSlot`.
  - Recompute `tokenNumber` for the new date: $\text{count}(\text{doctor appointments on new date}) + 1$.
  - Record `rescheduleHistory` or `rescheduledFrom` timestamp.
  - Return the updated appointment.

---

## 4. Acceptance Criteria
- [ ] Patient can open the Reschedule Modal and see live open slots for the new date.
- [ ] Submitting a valid new slot successfully updates date and time in the database.
- [ ] The old slot is immediately released and available for booking by other patients.
- [ ] The target slot is immediately locked against double-booking.
- [ ] Patient receives an updated OPD token corresponding to the new date.
- [ ] Doctor Dashboard queue updates automatically with the new date/time.
- [ ] Attempting to reschedule to an already-booked slot displays a clear error.

---

## 5. Affected Files & Endpoints
- **Files to Modify**:
  - `frontend/src/lib/types.ts`: Add optional `rescheduledAt?: string; previousSlot?: { date: string; time: string }` to `Appointment`.
  - `frontend/src/lib/db.ts`: Add `rescheduleAppointment(id, newDate, newTime, reason)` function.
  - `frontend/src/app/api/appointments/[id]/route.ts`: Support `{ action: 'RESCHEDULE', newDate, newTime }` or dedicated route.
  - `frontend/src/app/patient/page.tsx`: Add Reschedule button and interactive modal.
  - `frontend/src/app/doctor/page.tsx`: Reflect rescheduled badge if applicable.

---

## 6. Edge Cases & Error Handling
1. **Race Condition**: Two patients attempt to reschedule to the same slot simultaneously. The second request must return `409 Conflict: Slot has just been reserved`.
2. **Completed Consultation**: If a doctor completes the appointment while the patient is viewing the reschedule modal, submission must reject with `400 Bad Request: Cannot reschedule a completed consultation`.
3. **Invalid Shift Day**: Selecting a date where the doctor does not practice returns `No available slots on this day`.

---

## 7. Definition of Done (DoD)
- [ ] TypeScript compiles with 0 errors (`npx tsc --noEmit`).
- [ ] Production build succeeds (`npm run build`).
- [ ] Automated REST check verifies slot swap and token reassignment.
- [ ] Manual test verifies patient reschedule flow in UI.
- [ ] Documented in `progress.md`.

