---
name: database-design
description: Guidelines for modeling and evolving Medrella HMS domain entities, maintaining slot integrity, and managing data normalization.
---

# 🗄️ Database Design Skill for Medrella HMS

When adding or modifying data entities in Medrella HMS:

## 1. Domain Modeling Rules
1. **Model First in `src/lib/types.ts`**:
   - Define exact TypeScript interfaces before touching backend functions.
   - Use strict string union types for statuses (e.g. `AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'`).
2. **Deterministic Aliasing & Normalization**:
   - When introducing new field names, always update `normalizeDoctor` and `normalizeAppointment` in `src/lib/db.ts` to preserve backward compatibility.
   - Example:
     ```typescript
     function normalizeAppointment(a: Appointment): Appointment {
       return {
         ...a,
         tokenNumber: a.tokenNumber || 1,
         timeSlot: a.timeSlot || a.time,
       };
     }
     ```

## 2. Slot Integrity & Collision Prevention
1. Never store static pre-generated slot rows. Generate available slots dynamically against doctor shift windows.
2. In `getAvailableSlots(doctorId, date)`:
   - Filter `appointments` where `status !== 'CANCELLED'`.
   - Use an $O(1)$ `Set` of booked times.
3. In `createAppointment`:
   - Enforce server-side duplicate check before pushing to database array.
   - Compute `tokenNumber`: active appointments on date + 1.

## 3. Storage Persistence
1. Always maintain `cachedDb` in `src/lib/db.ts` for immediate low-latency reads.
2. Respect serverless environments:
   - Use `const DATA_DIR = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), '.data')`.
   - Wrap disk writes in `try/catch` to gracefully degrade if the filesystem is read-only.

