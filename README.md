# Schedula - Simple Hospital Management System ER Diagram

Welcome to the **Schedule Project Module** ER diagram for **Schedula**, developed for the **PearlThoughts Internship Programme**.

This ER diagram is designed to be **simple, clear, and easy to understand**, covering the five project modules in exact order:

1. **User Module** (`USERS`)
2. **Patient Module** (`PATIENTS`)
3. **Doctor Module** (`DOCTORS`)
4. **Availability Module** (`DOCTOR_AVAILABILITY`)
5. **Appointment Module** (`APPOINTMENTS`)

---

## 🗺️ Simple ER Diagram

```mermaid
erDiagram
    %% 1. USER MODULE
    USERS {
        uuid id PK
        varchar email
        varchar password
        varchar role "DOCTOR | PATIENT"
    }

    %% 2. PATIENT MODULE
    PATIENTS {
        uuid id PK
        uuid user_id FK "1:1 with USERS"
        varchar name
        varchar phone
        varchar gender
        date date_of_birth
    }

    %% 3. DOCTOR MODULE
    DOCTORS {
        uuid id PK
        uuid user_id FK "1:1 with USERS"
        varchar name
        varchar specialization
        decimal consultation_fee
    }

    %% 4. AVAILABILITY MODULE
    DOCTOR_AVAILABILITY {
        uuid id PK
        uuid doctor_id FK "Ref to DOCTORS"
        varchar day_of_week
        time start_time
        time end_time
        boolean is_available
    }

    %% 5. APPOINTMENT MODULE
    APPOINTMENTS {
        uuid id PK
        uuid patient_id FK "Ref to PATIENTS"
        uuid doctor_id FK "Ref to DOCTORS"
        date appointment_date
        time time_slot
        varchar status "CONFIRMED | CANCELLED | RESCHEDULED"
    }

    %% RELATIONSHIPS
    USERS ||--|| PATIENTS : "identifies (1:1)"
    USERS ||--|| DOCTORS : "identifies (1:1)"
    DOCTORS ||--o{ DOCTOR_AVAILABILITY : "sets (1:N)"
    PATIENTS ||--o{ APPOINTMENTS : "books (1:N)"
    DOCTORS ||--o{ APPOINTMENTS : "attends (1:N)"
```

---

## 🚀 How to Open in dbdiagram.io

1. Go to **[dbdiagram.io](https://dbdiagram.io)**.
2. Click **+ New Diagram**.
3. Open [`docs/schema.dbml`](./docs/schema.dbml), copy the simple DBML code, and paste it into the editor.
4. The diagram renders immediately!

---

## 📄 Standalone PDF Deliverable

The high-resolution, simple vector PDF is available at:  
👉 **[`Schedula_Schedule_Module_ERD.pdf`](./Schedula_Schedule_Module_ERD.pdf)**

---

## 📂 Project Structure

```
.
├── Schedula_Schedule_Module_ERD.pdf   # Simple high-res vector PDF
├── README.md                          # Simple overview & Mermaid diagram
├── generate_erd_pdf.py                # Python PDF generation script
└── docs/
    ├── schema.dbml                    # Simple DBML code for dbdiagram.io
    ├── ERD_Schedule_Module.md         # Detailed markdown specification
    ├── erd_preview.html               # Interactive browser preview
    └── erd_print.html                 # Print-optimized HTML template
```
