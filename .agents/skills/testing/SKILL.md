---
name: testing
description: Procedures and automated test scripts for verifying Medrella HMS endpoints, CUJs, and build pipelines.
---

# 🧪 Testing & Verification Skill for Medrella HMS

Apply these testing procedures to validate any feature implementation:

## 1. Automated Production Build Gate
Always run before pushing code:
```powershell
cd frontend
npm run build
# Must exit with code 0 and compile all 10 routes successfully
```

## 2. Automated REST Test Matrix (PowerShell)
Execute against a running local dev server (`http://localhost:3000`):

```powershell
# Step 1: Query Specialist Doctors
$doctors = Invoke-RestMethod -Uri 'http://localhost:3000/api/doctors'
Write-Host "Found $($doctors.doctors.Count) doctors"

# Step 2: Query Available Slots for Target Date
$slots = Invoke-RestMethod -Uri 'http://localhost:3000/api/doctors/doc_1?date=2026-10-30'
Write-Host "Found $($slots.slots.Count) slots for Dr. Jane Smith"

# Step 3: Book Appointment & Verify Token Assignment
$bookBody = @{
  patientId = 'pat_1'
  patientName = 'John Doe'
  patientEmail = 'john.doe@example.com'
  patientPhone = '+1 555-0192'
  doctorId = 'doc_1'
  doctorName = 'Dr. Jane Smith'
  doctorSpecialty = 'Cardiology'
  date = '2026-10-30'
  time = '10:00 AM'
  timeSlot = '10:00 AM'
  symptoms = 'Automated Verification Visit'
  fee = 75
} | ConvertTo-Json

$booked = Invoke-RestMethod -Uri 'http://localhost:3000/api/appointments' -Method Post -Body $bookBody -ContentType 'application/json'
Write-Host "Created Appointment: $($booked.appointment.id) with Token #OPD-$($booked.appointment.tokenNumber)"

# Step 4: Complete Visit with Doctor Prescription
$patchBody = @{
  status = 'COMPLETED'
  prescription = @{
    diagnosis = 'Automated Verification - Healthy ECG'
    medicines = @(@{ medicineName = 'Multivitamin'; dosage = '1 Tab'; frequency = 'Daily'; duration = '30 days' })
    advice = 'Drink 2L water daily.'
    followUpDate = '2026-11-30'
  }
} | ConvertTo-Json -Depth 5

$completed = Invoke-RestMethod -Uri "http://localhost:3000/api/appointments/$($booked.appointment.id)" -Method Patch -Body $patchBody -ContentType 'application/json'
Write-Host "Completed visit with diagnosis: $($completed.appointment.prescription.diagnosis)"
```

## 3. Persona CUJ Checklist
- [ ] John Doe: Can book slot and download `.ics` file.
- [ ] Dr. Jane Smith: Sees patient in OPD "Now Serving" banner and completes visit.
- [ ] John Doe: Can open completed visit, view prescription slip, and trigger print dialog.

