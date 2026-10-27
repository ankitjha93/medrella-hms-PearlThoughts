# Simple ER Diagram Specification: Schedule Project Module

## 1. Overview
This is a **simple, clear, and easy-to-understand** Entity-Relationship (ER) diagram for the **Schedule Project Module** of the Healthcare Management System (**Schedula**), aligned with the PearlThoughts Internship requirements.

It covers the **five core modules in exact sequential order**:
1. **User Module** (`users`)
2. **Patient Module** (`patients`)
3. **Doctor Module** (`doctors`)
4. **Availability Module** (`doctor_availability`)
5. **Appointment Module** (`appointments`)

---

## 2. Simple ER Diagram

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

## 3. Module Overview

| # | Module | Entity Name | Description | Key Relationships |
|---|---|---|---|---|
| **1** | **User Module** | `USERS` | Handles user authentication and roles (`DOCTOR`, `PATIENT`). | 1:1 with `PATIENTS` and `DOCTORS` |
| **2** | **Patient Module** | `PATIENTS` | Holds patient profile information (name, phone, gender, DOB). | Belongs to 1 User; Books Many Appointments |
| **3** | **Doctor Module** | `DOCTORS` | Stores doctor profile, specialty, and consultation charges. | Belongs to 1 User; Attends Many Appointments |
| **4** | **Availability Module** | `DOCTOR_AVAILABILITY` | Defines weekly availability slots for each doctor. | Belongs to 1 Doctor (1:N) |
| **5** | **Appointment Module** | `APPOINTMENTS` | Records scheduled appointments between patients and doctors. | Connects Patient (N:1) & Doctor (N:1) |

---

## 4. Key Relationships Explained Simply
* **User &rarr; Patient (`1:1`)**: Every patient is a registered user.
* **User &rarr; Doctor (`1:1`)**: Every doctor is a registered user.
* **Doctor &rarr; Availability (`1:N`)**: A doctor sets multiple available days and consultation windows.
* **Patient &rarr; Appointment (`1:N`)**: A patient can book multiple appointments over time.
* **Doctor &rarr; Appointment (`1:N`)**: A doctor can have multiple scheduled appointments.
