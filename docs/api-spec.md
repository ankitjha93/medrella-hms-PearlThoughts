# 📡 REST API Specification

This document details all REST endpoints, request/response payloads, query parameters, and error status codes in **Medrella HMS**.

**Base URL**: `http://localhost:3000` (Local) or deployed Vercel domain.

---

## 1. Doctors Endpoints

### `GET /api/doctors`
Fetch all available doctors, with optional query filters.

- **Query Parameters**:
  - `search` (optional): Filter by doctor name, specialization, or hospital name.
  - `specialty` (optional): Filter by exact specialty (e.g. `Cardiology`, `Dermatology`).
- **Response**: `200 OK`
```json
{
  "success": true,
  "doctors": [
    {
      "id": "doc_1",
      "name": "Dr. Jane Smith",
      "specialization": "Cardiology",
      "experienceYears": 12,
      "consultationFee": 75,
      "rating": 4.9,
      "reviewsCount": 128,
      "hospital": "City General Hospital",
      "availableDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    }
  ]
}
```

### `GET /api/doctors/[id]?date=YYYY-MM-DD`
Retrieve a specific doctor profile and their available time slots for the selected date.

- **Query Parameters**:
  - `date` (required for slots): Format `YYYY-MM-DD` (e.g. `2026-10-30`).
- **Response**: `200 OK`
```json
{
  "success": true,
  "doctor": { ... },
  "slots": [
    { "time": "09:00 AM", "isAvailable": true },
    { "time": "09:30 AM", "isAvailable": false },
    { "time": "10:00 AM", "isAvailable": true }
  ]
}
```

---

## 2. Appointments Endpoints

### `GET /api/appointments`
Fetch appointments filtered by patient or doctor ID.

- **Query Parameters**:
  - `patientId` (optional): Filter appointments for specific patient (e.g. `pat_1`).
  - `doctorId` (optional): Filter appointments for specific doctor (e.g. `doc_1`).
- **Response**: `200 OK`
```json
{
  "success": true,
  "appointments": [
    {
      "id": "apt_101",
      "tokenNumber": 1,
      "patientName": "John Doe",
      "doctorName": "Dr. Jane Smith",
      "doctorSpecialty": "Cardiology",
      "date": "2026-10-28",
      "time": "10:00 AM",
      "status": "CONFIRMED",
      "symptoms": "Mild chest discomfort after morning jog."
    }
  ]
}
```

### `POST /api/appointments`
Reserve a consultation slot and auto-generate an OPD token.

- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "doctorId": "doc_1",
  "patientId": "pat_1",
  "patientName": "John Doe",
  "patientEmail": "john.doe@example.com",
  "patientPhone": "+1 (555) 019-2834",
  "doctorName": "Dr. Jane Smith",
  "doctorSpecialty": "Cardiology",
  "date": "2026-10-30",
  "time": "10:00 AM",
  "symptoms": "Routine cardiology follow-up",
  "fee": 75
}
```
- **Response**: `201 Created`
```json
{
  "success": true,
  "appointment": {
    "id": "apt_1793203651429_vvp8",
    "tokenNumber": 1,
    "status": "CONFIRMED",
    "date": "2026-10-30",
    "time": "10:00 AM"
  }
}
```
- **Error Responses**:
  - `400 Bad Request`: Missing required fields (`doctorId`, `patientId`, `date`, `time`).
  - `409 Conflict`: Slot is already booked by another patient.

### `PATCH /api/appointments/[id]`
Update appointment status (e.g. `CANCELLED`, `CONFIRMED`, `COMPLETED`) and optionally attach a clinical prescription.

- **Request Body (Doctor Completing Visit with Rx)**:
```json
{
  "status": "COMPLETED",
  "prescription": {
    "diagnosis": "Mild Sinus Tachycardia & Stage 1 Pre-hypertension",
    "medicines": [
      {
        "medicineName": "Metoprolol Succinate ER",
        "dosage": "25 mg",
        "frequency": "Once daily in morning",
        "duration": "30 days"
      }
    ],
    "advice": "Low sodium diet and 30 mins moderate walking.",
    "followUpDate": "2026-11-30",
    "doctorNotes": "ECG within normal limits.",
    "prescribedAt": "2026-10-28T10:15:00.000Z"
  }
}
```
- **Request Body (Patient Cancelling Visit)**:
```json
{
  "status": "CANCELLED",
  "cancellationReason": "Patient requested cancellation"
}
```
- **Response**: `200 OK` with updated appointment record.
- **Error Responses**:
  - `400 Bad Request`: `status` is required.
  - `404 Not Found`: Appointment ID does not exist.

---

## 3. Availability Endpoints

### `GET /api/availability?doctorId=[id]`
Retrieve doctor shift schedules and slot durations.

### `POST /api/availability`
Update shift hours (`startTime`, `endTime`, `slotDurationMinutes`, `daysOfWeek`).

