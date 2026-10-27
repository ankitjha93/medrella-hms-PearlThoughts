# Schedula - Hospital Management System (Schedule Project Module)

Welcome to the **Schedule Project Module** ER diagram for **Schedula**, developed for the **PearlThoughts Internship Programme**.

This ER diagram covers the **five project modules in exact sequential order**, with comprehensive attributes inside each entity:

1. **User Module** (`USERS`)
2. **Patient Module** (`PATIENTS`)
3. **Doctor Module** (`DOCTORS`)
4. **Availability Module** (`DOCTOR_AVAILABILITY`)
5. **Appointment Module** (`APPOINTMENTS`)

---

## 🗺️ Entity-Relationship Diagram

```mermaid
erDiagram
    %% ==========================================
    %% 1. USER MODULE
    %% ==========================================
    USERS {
        uuid id PK "Primary Key"
        varchar email "Unique login email"
        varchar phone "Contact telephone"
        varchar password_hash "Hashed password"
        varchar role "DOCTOR | PATIENT | ADMIN"
        varchar auth_provider "LOCAL | GOOGLE"
        boolean is_verified "Email/OTP verified flag"
        timestamp created_at "Created timestamp"
        timestamp updated_at "Updated timestamp"
    }

    %% ==========================================
    %% 2. PATIENT MODULE
    %% ==========================================
    PATIENTS {
        uuid id PK "Primary Key"
        uuid user_id FK "1:1 link to USERS(id)"
        varchar first_name "Given name"
        varchar last_name "Family name"
        date date_of_birth "Birth date"
        varchar gender "MALE | FEMALE | OTHER"
        varchar blood_group "Blood type (A+, O+, etc.)"
        varchar emergency_contact "Emergency telephone"
        text address "Residential address"
        text medical_history "Allergies / medical notes"
        timestamp created_at "Registration timestamp"
    }

    %% ==========================================
    %% 3. DOCTOR MODULE
    %% ==========================================
    DOCTORS {
        uuid id PK "Primary Key"
        uuid user_id FK "1:1 link to USERS(id)"
        varchar first_name "Given name"
        varchar last_name "Family name"
        varchar specialization "Medical specialty"
        varchar license_number "Medical council license"
        int experience_years "Years of medical practice"
        decimal consultation_fee "Fee per booking"
        text bio "Profile bio"
        decimal rating_average "Average ratings (0.0-5.0)"
        boolean is_approved "Admin verification flag"
        timestamp created_at "Onboarding timestamp"
    }

    %% ==========================================
    %% 4. AVAILABILITY MODULE
    %% ==========================================
    DOCTOR_AVAILABILITY {
        uuid id PK "Primary Key"
        uuid doctor_id FK "Reference to DOCTORS(id)"
        varchar day_of_week "MONDAY, TUESDAY, etc."
        time start_time "Shift start time"
        time end_time "Shift end time"
        int slot_duration_minutes "Slot duration (default 30)"
        int max_capacity "Elastic capacity per slot"
        boolean is_active "Active toggle"
        timestamp created_at "Created timestamp"
    }

    %% ==========================================
    %% 5. APPOINTMENT MODULE
    %% ==========================================
    APPOINTMENTS {
        uuid id PK "Primary Key"
        uuid patient_id FK "Reference to PATIENTS(id)"
        uuid doctor_id FK "Reference to DOCTORS(id)"
        date appointment_date "Scheduled date"
        time start_time "Start time"
        time end_time "End time"
        varchar status "SCHEDULED | CONFIRMED | COMPLETED | CANCELLED | RESCHEDULED"
        text reason "Chief complaint / symptoms"
        text cancellation_reason "Reason if cancelled"
        text reschedule_reason "Reason if rescheduled"
        timestamp created_at "Booking timestamp"
        timestamp updated_at "Status update timestamp"
    }

    %% ==========================================
    %% RELATIONSHIPS & CARDINALITY
    %% ==========================================
    USERS ||--|| PATIENTS : "identifies (1:1)"
    USERS ||--|| DOCTORS : "identifies (1:1)"
    DOCTORS ||--o{ DOCTOR_AVAILABILITY : "configures (1:N)"
    PATIENTS ||--o{ APPOINTMENTS : "books (1:N)"
    DOCTORS ||--o{ APPOINTMENTS : "attends (1:N)"
```

---

## 🚀 How to Open in dbdiagram.io

1. Go to **[dbdiagram.io](https://dbdiagram.io)**.
2. Click **+ New Diagram**.
3. Open [`docs/schema.dbml`](./docs/schema.dbml), copy the DBML code, and paste it into the editor.
4. The diagram renders immediately with all 5 modules, fields, notes, and relationships!

---

## 📄 Standalone PDF Deliverable

The high-resolution vector PDF is saved at:  
👉 **[`Schedula_Schedule_Module_ERD.pdf`](./Schedula_Schedule_Module_ERD.pdf)**

---

## 📂 Project Structure

```
.
├── Schedula_Schedule_Module_ERD.pdf   # High-resolution vector PDF deliverable
├── README.md                          # Repository summary & Mermaid ERD
├── generate_erd_pdf.py                # Python PDF generation script
└── docs/
    ├── schema.dbml                    # DBML schema code for dbdiagram.io
    ├── ERD_Schedule_Module.md         # Full specification & data dictionary
    ├── erd_preview.html               # Interactive browser preview
    └── erd_print.html                 # Print template
```
