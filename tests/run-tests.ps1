# Medrella HMS - Automated API & Integration Verification Suite
param (
  [string]$BaseUrl = "http://localhost:3000"
)

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "  Medrella HMS Automated Quality & API Test Suite" -ForegroundColor Cyan
Write-Host "  Target: $BaseUrl" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

$TotalTests = 0
$PassedTests = 0

function Run-Test {
  param (
    [string]$Title,
    [scriptblock]$Action
  )
  $script:TotalTests++
  Write-Host -NoNewline "[TEST $script:TotalTests] $Title... "
  try {
    & $Action
    Write-Host "PASS" -ForegroundColor Green
    $script:PassedTests++
  } catch {
    Write-Host "FAIL" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor DarkRed
  }
}

# 1. Server Health Check
Run-Test "Server Health Check (HTTP 200 on /)" {
  $res = Invoke-WebRequest -Uri $BaseUrl -Method Head -UseBasicParsing -TimeoutSec 5
  if ($res.StatusCode -ne 200) { throw "Expected 200, got $($res.StatusCode)" }
}

# 2. Doctors API Check
Run-Test "GET /api/doctors returns specialist catalog" {
  $docRes = Invoke-RestMethod -Uri "$BaseUrl/api/doctors" -Method Get
  if (-not $docRes.success -or $docRes.doctors.Count -lt 1) {
    throw "Doctor list was empty or unsuccessful"
  }
}

# 3. Doctor Availability Slots Check
Run-Test "GET /api/doctors/doc_1?date=2026-10-30 returns open slots" {
  $slotRes = Invoke-RestMethod -Uri "$BaseUrl/api/doctors/doc_1?date=2026-10-30" -Method Get
  if (-not $slotRes.success -or $slotRes.slots.Count -lt 1) {
    throw "Slots query returned 0 slots"
  }
}

# 4. Booking & Token Generation Check
$TestApptId = $null
Run-Test "POST /api/appointments reserves slot & assigns OPD token" {
  $body = @{
    patientId = "pat_1"
    patientName = "Automated Test Patient"
    patientEmail = "test@medrella.com"
    patientPhone = "+1 (555) 019-9999"
    doctorId = "doc_1"
    doctorName = "Dr. Jane Smith"
    doctorSpecialty = "Cardiology"
    date = "2026-10-30"
    time = "11:00 AM"
    timeSlot = "11:00 AM"
    symptoms = "Automated test routine review"
    fee = 75
  } | ConvertTo-Json

  $booked = Invoke-RestMethod -Uri "$BaseUrl/api/appointments" -Method Post -Body $body -ContentType "application/json"
  if (-not $booked.success -or -not $booked.appointment.id -or $booked.appointment.tokenNumber -lt 1) {
    throw "Failed to create appointment with valid token"
  }
  $script:TestApptId = $booked.appointment.id
}

# 5. Double-Booking Prevention Check (Negative Test)
Run-Test "Duplicate booking on same slot is rejected (Double-booking guardrail)" {
  $dupBody = @{
    patientId = "pat_2"
    patientName = "Collision Test Patient"
    patientEmail = "collision@medrella.com"
    patientPhone = "+1 (555) 019-8888"
    doctorId = "doc_1"
    doctorName = "Dr. Jane Smith"
    doctorSpecialty = "Cardiology"
    date = "2026-10-30"
    time = "11:00 AM"
    timeSlot = "11:00 AM"
    symptoms = "Attempting conflicting booking"
    fee = 75
  } | ConvertTo-Json

  try {
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/appointments" -Method Post -Body $dupBody -ContentType "application/json"
    throw "Server should have rejected duplicate slot booking, but accepted it!"
  } catch {
    # Expected rejection
  }
}

# 6. Prescription Attachment & Status Completion Check
Run-Test "PATCH /api/appointments/[id] completes visit & attaches clinical prescription" {
  if (-not $script:TestApptId) { throw "No test appointment available" }

  $patchBody = @{
    status = "COMPLETED"
    prescription = @{
      diagnosis = "Automated Health Verification"
      medicines = @(
        @{ medicineName = "Standard Daily Vitamin"; dosage = "1 Tab"; frequency = "Once daily"; duration = "30 days" }
      )
      advice = "Stay hydrated and maintain routine exercise."
      followUpDate = "2026-11-30"
      doctorNotes = "Automated test prescription verified."
      prescribedAt = (Get-Date).ToString("o")
    }
  } | ConvertTo-Json -Depth 5

  $patched = Invoke-RestMethod -Uri "$BaseUrl/api/appointments/$script:TestApptId" -Method Patch -Body $patchBody -ContentType "application/json"
  if (-not $patched.success -or $patched.appointment.status -ne "COMPLETED" -or -not $patched.appointment.prescription.diagnosis) {
    throw "Failed to complete appointment with prescription"
  }
}

Write-Host "-------------------------------------------------" -ForegroundColor Cyan
Write-Host "Test Results: $PassedTests / $TotalTests Tests Passed" -ForegroundColor $(if ($PassedTests -eq $TotalTests) { "Green" } else { "Yellow" })
Write-Host "=================================================" -ForegroundColor Cyan

if ($PassedTests -ne $TotalTests) {
  exit 1
} else {
  exit 0
}

