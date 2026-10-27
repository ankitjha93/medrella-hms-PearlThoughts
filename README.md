# Schedula - Hospital Management System (Schedule Project Module)

Welcome to the **Schedule Project Module** repository for the **Schedula** Healthcare Management System, developed as part of the **PearlThoughts Internship Programme**.

This project provides the database schema architecture, Entity-Relationship (ER) specification, and implementation blueprint based on the [PearlThoughts Weekly Development Plans](https://github.com/PearlThoughtsInternship/Internship-Obsidian-Vault/blob/main/Programme-Structure/Weekly-Plans.md).

---

## 📋 Task Requirements & Deliverable Summary

As mandated by the internship assignment, the ER Diagram is designed to be **simple, clear, and easy to understand**, systematically covering the five project modules in sequence:

1. **User Module** (Authentication, roles, verification tokens)
2. **Patient Module** (Patient identity, baseline demographic data)
3. **Doctor Module** (Medical licenses, specializations, consultation fees)
4. **Availability Module** (Weekly availability schedules, elastic time slots)
5. **Appointment Module** (Bookings, status transitions, reschedule history)

---

## 🗺️ Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    %% ==========================================
    %% 1. USER MODULE
    %% ==========================================
    USERS {
        uuid id PK "Primary Key"
        varchar email "Unique login email"
        varchar phone "Contact phone number"
        varchar password_hash "Hashed password (null for OAuth)"
        varchar role "DOCTOR | PATIENT | ADMIN"
        varchar auth_provider "LOCAL | GOOGLE"
        boolean is_verified "Email / phone verified flag"
        timestamp created_at "Record creation timestamp"
        timestamp updated_at "Record update timestamp"
    }

    VERIFICATION_TOKENS {
        uuid id PK "Primary Key"
        uuid user_id FK "Reference to USERS(id)"
        varchar token "Verification token or OTP code"
        varchar token_type "EMAIL_VERIFY | OTP_LOGIN | PASSWORD_RESET"
        timestamp expires_at "Expiration datetime"
        boolean is_used "Flag indicating if token consumed"
        timestamp created_at "Record creation timestamp"
    }

    %% ==========================================
    %% 2. PATIENT MODULE
    %% ==========================================
    PATIENTS {
        uuid id PK "Primary Key"
        uuid user_id FK "Unique reference to USERS(id)"
        varchar first_name "Patient first name"
        varchar last_name "Patient last name"
        date date_of_birth "Date of birth"
        varchar gender "MALE | FEMALE | OTHER"
        varchar blood_group "Blood type e.g. A+, O+, etc."
        varchar emergency_contact "Emergency contact phone"
        timestamp created_at "Record creation timestamp"
        timestamp updated_at "Record update timestamp"
    }

    %% ==========================================
    %% 3. DOCTOR MODULE
    %% ==========================================
    SPECIALIZATIONS {
        uuid id PK "Primary Key"
        varchar name "Specialty name e.g. Cardiology"
        varchar description "Specialty overview"
    }

    DOCTORS {
        uuid id PK "Primary Key"
        uuid user_id FK "Unique reference to USERS(id)"
        uuid specialization_id FK "Reference to SPECIALIZATIONS(id)"
        varchar first_name "Doctor first name"
        varchar last_name "Doctor last name"
        varchar license_number "Medical license registration number"
        int experience_years "Years of medical practice"
        decimal consultation_fee "Consultation charge per appointment"
        text bio "Professional summary and qualifications"
        decimal rating_average "Cumulative rating average (0.0 - 5.0)"
        boolean is_approved "Admin verification status"
        timestamp created_at "Record creation timestamp"
        timestamp updated_at "Record update timestamp"
    }

    %% ==========================================
    %% 4. AVAILABILITY MODULE
    %% ==========================================
    DOCTOR_AVAILABILITY {
        uuid id PK "Primary Key"
        uuid doctor_id FK "Reference to DOCTORS(id)"
        int day_of_week "0 = Sunday to 6 = Saturday"
        time start_time "Daily availability window start"
        time end_time "Daily availability window end"
        int slot_duration_minutes "Standard consultation length (e.g. 30)"
        boolean is_active "Active/Inactive toggle"
        timestamp created_at "Record creation timestamp"
    }

    TIME_SLOTS {
        uuid id PK "Primary Key"
        uuid doctor_id FK "Reference to DOCTORS(id)"
        uuid availability_id FK "Reference to DOCTOR_AVAILABILITY(id)"
        date slot_date "Calendar date for the slot"
        time start_time "Slot start time"
        time end_time "Slot end time"
        varchar slot_type "REGULAR | ELASTIC_BUFFER"
        int max_capacity "Maximum bookings allowed (default 1)"
        int current_bookings "Count of active bookings"
        varchar status "AVAILABLE | BOOKED | BLOCKED"
        timestamp created_at "Record creation timestamp"
    }

    %% ==========================================
    %% 5. APPOINTMENT MODULE
    %% ==========================================
    APPOINTMENTS {
        uuid id PK "Primary Key"
        uuid patient_id FK "Reference to PATIENTS(id)"
        uuid doctor_id FK "Reference to DOCTORS(id)"
        uuid slot_id FK "Reference to TIME_SLOTS(id)"
        date appointment_date "Scheduled appointment date"
        time start_time "Scheduled appointment start time"
        time end_time "Scheduled appointment end time"
        varchar status "SCHEDULED | CONFIRMED | COMPLETED | CANCELLED | RESCHEDULED"
        text reason "Chief medical complaint / notes"
        text cancellation_reason "Reason if cancelled"
        timestamp created_at "Record creation timestamp"
        timestamp updated_at "Record update timestamp"
    }

    RESCHEDULE_HISTORY {
        uuid id PK "Primary Key"
        uuid appointment_id FK "Reference to APPOINTMENTS(id)"
        uuid previous_slot_id FK "Reference to old TIME_SLOTS(id)"
        uuid new_slot_id FK "Reference to new TIME_SLOTS(id)"
        varchar rescheduled_by "PATIENT | DOCTOR"
        text reschedule_reason "Reason for reschedule"
        timestamp rescheduled_at "Timestamp of reschedule event"
    }

    %% ==========================================
    %% RELATIONSHIPS & CARDINALITY
    %% ==========================================
    USERS ||--o{ VERIFICATION_TOKENS : "issues (1:N)"
    USERS ||--o| PATIENTS : "identifies (1:1)"
    USERS ||--o| DOCTORS : "identifies (1:1)"

    SPECIALIZATIONS ||--o{ DOCTORS : "categorizes (1:N)"

    DOCTORS ||--o{ DOCTOR_AVAILABILITY : "configures (1:N)"
    DOCTORS ||--o{ TIME_SLOTS : "generates (1:N)"
    DOCTOR_AVAILABILITY ||--o{ TIME_SLOTS : "spawns (1:N)"

    PATIENTS ||--o{ APPOINTMENTS : "books (1:N)"
    DOCTORS ||--o{ APPOINTMENTS : "attends (1:N)"
    TIME_SLOTS ||--o{ APPOINTMENTS : "reserves (1:N)"

    APPOINTMENTS ||--o{ RESCHEDULE_HISTORY : "tracks (1:N)"
```

---

## 📂 Project Structure

```
.
├── Schedula_Schedule_Module_ERD.pdf   # Standalone print-ready PDF deliverable
├── README.md                          # Main project summary & ER diagram
├── package.json                       # Package manifest
├── server.js                          # Local viewer server
├── generate_erd_pdf.py                # Python PDF generation script
└── docs/
    ├── schema.dbml                    # DBML schema code for dbdiagram.io
    ├── ERD_Schedule_Module.md         # Full data dictionary & 3NF technical spec
    ├── erd_preview.html               # Interactive viewer with pan/zoom & SVG export
    └── erd_print.html                 # Print-optimized HTML template
```

---

## 🔍 How to View & Present the ER Diagram

1. **dbdiagram.io (Interactive Online ERD)**:
   - Go to **[dbdiagram.io](https://dbdiagram.io)**.
   - Click **+ New Diagram**.
   - Copy the contents of [`docs/schema.dbml`](./docs/schema.dbml) and paste it into the editor.
   - The diagram will automatically render with color-coded module groups, cardinalities, and field notes!

2. **Standalone PDF Document**:
   - Open [`Schedula_Schedule_Module_ERD.pdf`](./Schedula_Schedule_Module_ERD.pdf) in any PDF reader for high-resolution 300 DPI vector rendering.

3. **Interactive Local Browser View**:
   - Double-click or open `docs/erd_preview.html` in any browser.
   - Use the pan/zoom controls or mouse wheel to navigate, and click **Export SVG** to save a vector diagram for presentation slides or reports.

4. **Markdown / Obsidian View**:
   - Open `docs/ERD_Schedule_Module.md` in GitHub, Obsidian, or VS Code Markdown Preview. Mermaid diagrams render natively.

---

## 🎯 Alignment with Internship Weekly Plans

| Internship Week | Milestone Focus | Related Entities in this ERD |
|---|---|---|
| **Week 1** | Registration, Authentication & Onboarding | `USERS`, `VERIFICATION_TOKENS`, `PATIENTS`, `DOCTORS` |
| **Week 2** | Appointment Making & Doctor Management | `DOCTORS`, `SPECIALIZATIONS`, `TIME_SLOTS`, `APPOINTMENTS` |
| **Week 3** | Elastic Scheduling & Reschedule Experience | `DOCTOR_AVAILABILITY`, `TIME_SLOTS` (`ELASTIC_BUFFER`), `RESCHEDULE_HISTORY` |
| **Week 4** | Re-engagement & Audit Logging | `APPOINTMENTS` (`status` transitions), `RESCHEDULE_HISTORY` |
