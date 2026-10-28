# 🧠 Medrella Clinical Engine — System Brain & Architecture

## 1. Project Mission & Overview
**Medrella** is a high-performance outpatient healthcare appointment booking and clinical queue management platform engineered using the **Schedula** scheduling architecture. It bridges patient self-service booking with live physician outpatient department (OPD) triage.

---

## 2. System Architecture

```mermaid
graph TD
    subgraph Client Application [Next.js 16 App Router UI]
        Home["/ (Landing Page & Discovery)"]
        Dir["/doctors (Specialist Directory & Filters)"]
        Pat["/patient (Patient Appointments Portal)"]
        Doc["/doctor (Clinical Queue Dashboard)"]
        Nav["Navbar (Theme Switcher & Role Persona)"]
    end

    subgraph State & Context Layer
        RC["RoleContext (Active User Persona: Patient vs Doctor)"]
        TC["ThemeContext (Light / Dark Tailwind v4 Mode)"]
    end

    subgraph REST Backend Layer [Next.js API Routes]
        D_API["/api/doctors (Search & Specialties)"]
        DS_API["/api/doctors/[id] (Dynamic Slot Engine)"]
        A_API["/api/appointments (Create & Query)"]
        AU_API["/api/appointments/[id] (Status Updates)"]
        AV_API["/api/availability (Shift & Duration Manager)"]
    end

    subgraph Storage Layer
        MemCache["In-Memory Database Cache"]
        DiskStore[".data/db.json (Local Disk)"]
        VercelStore["/tmp/db.json (Serverless Scratchpad)"]
    end

    Client Application --> State & Context Layer
    Client Application --> REST Backend Layer
    REST Backend Layer --> MemCache
    MemCache --> DiskStore
    MemCache --> VercelStore
```

---

## 3. Core Domain Entities

### `User`
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique user identifier (`user_pat_1`, `user_doc_1`) |
| `name` | `string` | Full display name |
| `email` | `string` | Primary communication email |
| `role` | `'PATIENT' \| 'DOCTOR' \| 'ADMIN'` | Access control role |
| `patientId` | `string?` | Linked patient entity reference |
| `doctorId` | `string?` | Linked doctor entity reference |

### `Doctor`
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Doctor identifier (`doc_1`, `doc_2`, etc.) |
| `name` | `string` | Physician title & name |
| `specialization`| `string` | Primary medical field (Cardiology, Dermatology, etc.) |
| `experienceYears`| `number` | Clinical practicing years |
| `consultationFee`| `number` | Outpatient session fee in USD |
| `rating` | `number` | Aggregated patient rating (1.0 - 5.0) |
| `availableDays` | `string[]` | Shift roster (e.g. `['Monday', 'Wednesday']`) |

### `Appointment`
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Auto-generated booking reference (`apt_{timestamp}_{random}`) |
| `patientId` | `string` | Patient reference |
| `doctorId` | `string` | Attending physician reference |
| `date` | `string` | Appointment date (`YYYY-MM-DD`) |
| `time` | `string` | Selected consultation slot (`HH:MM AM/PM`) |
| `status` | `AppointmentStatus`| `SCHEDULED` \| `CONFIRMED` \| `COMPLETED` \| `CANCELLED` |
| `symptoms` | `string` | Intake symptoms and reason for visit |

---

## 4. Conflict-Free Slot Generation Logic

```typescript
// 1. Identify doctor active shift for target date
// 2. Fetch all non-cancelled appointments for this doctor on target date
const bookedTimes = new Set(
  appointments
    .filter(a => a.doctorId === doctorId && a.date === date && a.status !== 'CANCELLED')
    .map(a => a.time)
);

// 3. Mark availability per slot
return shiftSlots.map(time => ({
  time,
  isAvailable: !bookedTimes.has(time)
}));
```

---

## 5. Storage & Persistence Strategy
- **Local Dev**: In-memory cache with fallback to `.data/db.json`.
- **Vercel Serverless**: Dynamic detection via `process.env.VERCEL ? '/tmp' : '.data'`.
- **Client Preference**: `medrella_theme` and `medrella_demo_user` stored in `localStorage`.
