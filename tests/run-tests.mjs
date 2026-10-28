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
