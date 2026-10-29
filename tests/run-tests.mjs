#!/usr/bin/env node

/**
 * Medrella HMS - Cross-Platform Automated Integration Test Suite
 * Works natively on Windows, macOS, and Linux without external dependencies.
 */

const BASE_URL = process.argv.includes('--url') 
  ? process.argv[process.argv.indexOf('--url') + 1] 
  : process.env.TEST_BASE_URL || 'http://localhost:3000';

console.log('\x1b[36m%s\x1b[0m', '=================================================');
console.log('\x1b[36m%s\x1b[0m', '  Medrella HMS Cross-Platform Test Suite (Node.js)');
console.log('\x1b[36m%s\x1b[0m', `  Target: ${BASE_URL}`);
console.log('\x1b[36m%s\x1b[0m', '=================================================');

let totalTests = 0;
let passedTests = 0;

async function runTest(title, testFn) {
  totalTests++;
  process.stdout.write(`[TEST ${totalTests}] ${title}... `);
  try {
    await testFn();
    console.log('\x1b[32mPASS\x1b[0m');
    passedTests++;
  } catch (err) {
    console.log('\x1b[31mFAIL\x1b[0m');
    console.error('   \x1b[31mError:\x1b[0m', err.message);
  }
}

async function main() {
  let createdApptId = null;
  let testSlot = '03:30 PM';
  const testDate = '2026-11-05'; // Future test date

  // 1. Health check
  await runTest('Server Health Check (HTTP 200 on /)', async () => {
    const res = await fetch(BASE_URL, { method: 'HEAD' });
    if (res.status !== 200) throw new Error(`Expected HTTP 200, got ${res.status}`);
  });

  // 2. Doctor catalog
  await runTest('GET /api/doctors returns specialist catalog', async () => {
    const res = await fetch(`${BASE_URL}/api/doctors`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success || !Array.isArray(data.doctors) || data.doctors.length === 0) {
      throw new Error('Doctors list was empty or invalid');
    }
  });

  // 3. Slot query
  await runTest(`GET /api/doctors/doc_1?date=${testDate} returns open slots`, async () => {
    const res = await fetch(`${BASE_URL}/api/doctors/doc_1?date=${testDate}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success || !Array.isArray(data.slots) || data.slots.length === 0) {
      throw new Error('Slots list was empty');
    }
    const availSlots = data.slots.filter(s => s.isAvailable);
    if (availSlots.length > 0) {
      testSlot = availSlots[0].time;
    }
  });

  // 4. Booking & OPD Token
  await runTest(`POST /api/appointments reserves slot (${testSlot}) & assigns OPD token`, async () => {
    const payload = {
      patientId: 'pat_1',
      patientName: 'Cross-Platform Test Patient',
      patientEmail: 'node-test@medrella.com',
      patientPhone: '+1 (555) 019-1234',
      doctorId: 'doc_1',
      doctorName: 'Dr. Jane Smith',
      doctorSpecialty: 'Cardiology',
      date: testDate,
      time: testSlot,
      timeSlot: testSlot,
      symptoms: 'Node.js test booking verification',
      fee: 75,
    };

    const res = await fetch(`${BASE_URL}/api/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(`HTTP ${res.status} - ${errData.error || 'Failed to book slot'}`);
    }

    const data = await res.json();
    if (!data.success || !data.appointment?.id || typeof data.appointment.tokenNumber !== 'number') {
      throw new Error('Failed to create appointment with valid OPD token');
    }
    createdApptId = data.appointment.id;
  });

  // 5. Collision prevention
  await runTest(`Duplicate booking on same slot (${testSlot}) is rejected (Double-booking guardrail)`, async () => {
    const dupPayload = {
      patientId: 'pat_2',
      patientName: 'Collision Patient',
      patientEmail: 'collision@medrella.com',
      patientPhone: '+1 (555) 019-0000',
      doctorId: 'doc_1',
      doctorName: 'Dr. Jane Smith',
      doctorSpecialty: 'Cardiology',
      date: testDate,
      time: testSlot,
      timeSlot: testSlot,
      symptoms: 'Attempting collision on occupied slot',
      fee: 75,
    };

    const res = await fetch(`${BASE_URL}/api/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dupPayload),
    });

    // Expect conflict
    if (res.status === 200 || res.status === 201) {
      throw new Error('Server accepted duplicate booking for the same slot!');
    }
  });

  // 6. Complete visit with prescription
  await runTest('PATCH /api/appointments/[id] completes visit & attaches clinical prescription', async () => {
    if (!createdApptId) throw new Error('No appointment ID available to complete');

    const patchPayload = {
      status: 'COMPLETED',
      prescription: {
        diagnosis: 'Cardiovascular Evaluation - Normal Sinus Rhythm',
        medicines: [
          { medicineName: 'Omega 3 Fish Oil', dosage: '1000mg', frequency: 'Daily', duration: '30 days' },
        ],
        advice: 'Continue healthy diet and light exercise.',
        followUpDate: '2026-12-05',
        doctorNotes: 'Test completed successfully.',
        prescribedAt: new Date().toISOString(),
      },
    };

    const res = await fetch(`${BASE_URL}/api/appointments/${createdApptId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patchPayload),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success || data.appointment?.status !== 'COMPLETED' || !data.appointment?.prescription?.diagnosis) {
      throw new Error('Failed to attach prescription or complete status');
    }
  });

  // 7. Doctor Review Submission
  await runTest('POST /api/doctors/doc_1/reviews submits review & updates rating', async () => {
    const reviewPayload = {
      patientName: 'Test Patient',
      rating: 5,
      comment: 'Excellent cardiology consultation. Clear advice and compassionate care!',
    };

    const res = await fetch(`${BASE_URL}/api/doctors/doc_1/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewPayload),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.review || data.doctor?.rating === undefined) {
      throw new Error('Review submission did not update doctor rating or return review object');
    }
  });

  // 8. Admin Hospital KPIs & Stats
  await runTest('GET /api/admin/stats returns valid executive hospital KPIs', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/stats`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.stats || typeof data.stats.totalDoctors !== 'number' || typeof data.stats.totalRevenue !== 'number') {
      throw new Error('Hospital stats format invalid or missing required metrics');
    }
  });

  // 9. Admin Onboard Specialist
  let newDoctorId = null;
  await runTest('POST /api/admin/doctors onboards specialist & updates roster', async () => {
    const doctorPayload = {
      name: 'Dr. Arthur Pendelton',
      specialization: 'Neurology',
      experienceYears: 10,
      consultationFee: 85,
      education: 'MD - Johns Hopkins Medicine',
      roomNumber: 'Cabin 602',
      hospital: 'Medrella Neuroscience Pavilion',
    };

    const res = await fetch(`${BASE_URL}/api/admin/doctors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doctorPayload),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.doctor?.id || data.doctor.name !== 'Dr. Arthur Pendelton') {
      throw new Error('Doctor onboarding failed to return valid doctor record');
    }
    newDoctorId = data.doctor.id;
  });

  // 10. Admin Clinical Departments Directory
  await runTest('GET /api/admin/departments returns clinical departments with HODs', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/departments`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success || !Array.isArray(data.departments) || data.departments.length === 0) {
      throw new Error('Departments catalog was empty or invalid');
    }
    const hasCardiology = data.departments.some(d => d.code === 'CARD');
    if (!hasCardiology) throw new Error('Cardiology department was missing from directory');
  });

  // 11. Admin Hospital Billing Ledger & Status Reconciliation
  await runTest('GET & PATCH /api/admin/invoices audits and settles billing invoices', async () => {
    const listRes = await fetch(`${BASE_URL}/api/admin/invoices`);
    if (!listRes.ok) throw new Error(`HTTP ${listRes.status}`);
    const listData = await listRes.json();
    if (!listData.success || !Array.isArray(listData.invoices) || listData.invoices.length === 0) {
      throw new Error('Invoice ledger was empty');
    }

    const targetInvoice = listData.invoices[0];
    const patchRes = await fetch(`${BASE_URL}/api/admin/invoices/${targetInvoice.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'PAID', paymentMethod: 'UPI' }),
    });

    if (!patchRes.ok) throw new Error(`HTTP ${patchRes.status}`);
    const patchData = await patchRes.json();
    if (!patchData.success || patchData.invoice?.status !== 'PAID') {
      throw new Error('Invoice status was not updated to PAID');
    }
  });

  // 12. Security & Compliance Audit Log
  await runTest('GET /api/admin/audit-logs returns chronological security audit events', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/audit-logs`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success || !Array.isArray(data.logs) || data.logs.length === 0) {
      throw new Error('Audit logs collection was empty');
    }
    const firstLog = data.logs[0];
    if (!firstLog.action || !firstLog.actor || !firstLog.timestamp) {
      throw new Error('Audit log event structure is missing required HIPAA/EHR metadata');
    }
  });

  // 13. Patient MPI Profile
  await runTest('GET /api/patient/profile returns Master Patient Index with MRN & emergency contact', async () => {
    const res = await fetch(`${BASE_URL}/api/patient/profile?patientId=pat_1`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.profile?.mrn || !data.profile.emergencyContact?.phone) {
      throw new Error('Patient profile did not include valid MRN or emergency contact');
    }
  });

  // 14. Authentication Portal UI
  await runTest('GET /login serves production authentication portal (HTTP 200)', async () => {
    const res = await fetch(`${BASE_URL}/login`);
    if (res.status !== 200) throw new Error(`Expected HTTP 200, got ${res.status}`);
  });

  // 15. Patient Registration Portal UI
  await runTest('GET /signup serves patient registration portal (HTTP 200)', async () => {
    const res = await fetch(`${BASE_URL}/signup`);
    if (res.status !== 200) throw new Error(`Expected HTTP 200, got ${res.status}`);
  });

  console.log('\x1b[36m%s\x1b[0m', '-------------------------------------------------');
  const resultColor = passedTests === totalTests ? '\x1b[32m' : '\x1b[33m';
  console.log(`${resultColor}%s\x1b[0m`, `Test Results: ${passedTests} / ${totalTests} Tests Passed`);
  console.log('\x1b[36m%s\x1b[0m', '=================================================');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Unexpected test harness error:', err);
  process.exit(1);
});
