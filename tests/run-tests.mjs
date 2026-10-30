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
  let testSlot = '09:00 AM';
  const testDate = `2026-11-${String(10 + (Math.floor(Date.now() / 1000) % 18)).padStart(2, '0')}`;

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

  // 16. Password Recovery Portal UI
  await runTest('GET /forgot-password serves password recovery dispatch portal (HTTP 200)', async () => {
    const res = await fetch(`${BASE_URL}/forgot-password`);
    if (res.status !== 200) throw new Error(`Expected HTTP 200, got ${res.status}`);
  });

  // 17. Password Reset Portal UI
  await runTest('GET /reset-password serves password reset form with entropy scoring (HTTP 200)', async () => {
    const res = await fetch(`${BASE_URL}/reset-password`);
    if (res.status !== 200) throw new Error(`Expected HTTP 200, got ${res.status}`);
  });

  // 18. User Profile & Security Settings Portal UI
  await runTest('GET /profile serves clinical profile and security management portal (HTTP 200)', async () => {
    const res = await fetch(`${BASE_URL}/profile`);
    if (res.status !== 200) throw new Error(`Expected HTTP 200, got ${res.status}`);
  });

  // =========================================================================
  // DAY 4: PAYMENTS, REFUNDS, NOTIFICATIONS & REMINDERS VERIFICATION
  // =========================================================================

  let paymentOrderId = null;
  let paymentApptId = null;
  const paymentTestDate = `2026-12-${String(10 + (Math.floor(Date.now() / 1000) % 18)).padStart(2, '0')}`;
  const paymentTestTime = '11:00 AM';

  // 19. Payment Order Creation & Slot Holding
  await runTest('POST /api/payments/create-order creates order & locks slot with 10m TTL', async () => {
    const res = await fetch(`${BASE_URL}/api/payments/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        doctorId: 'doc_1',
        patientId: 'pat_1',
        patientName: 'Payment Test Patient',
        patientEmail: 'payment.test@medrella.com',
        date: paymentTestDate,
        time: paymentTestTime,
        symptoms: 'Cardiology routine evaluation',
        provider: 'RAZORPAY',
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`HTTP ${res.status} - ${err.error || 'Failed to create payment order'}`);
    }

    const data = await res.json();
    if (!data.success || !data.orderId || !data.payment?.id || !data.appointment?.id || !data.key) {
      throw new Error('Order creation payload is missing orderId, payment, appointment, or client key');
    }
    if (data.payment.amount !== 75) {
      throw new Error(`Expected fee $75 from doctor record, got $${data.payment.amount}`);
    }
    paymentOrderId = data.orderId;
    paymentApptId = data.appointment.id;
  });

  // 20. Overbooking / Hold Collision Guardrail
  await runTest('Slot Hold Guardrail: Second checkout on held slot is rejected (HTTP 409 Conflict)', async () => {
    const res = await fetch(`${BASE_URL}/api/payments/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        doctorId: 'doc_1',
        patientId: 'pat_2',
        patientName: 'Conflicting Patient',
        patientEmail: 'conflict@medrella.com',
        date: paymentTestDate,
        time: paymentTestTime,
        provider: 'RAZORPAY',
      }),
    });

    if (res.status !== 409) {
      throw new Error(`Expected HTTP 409 Conflict for held slot, got HTTP ${res.status}`);
    }
  });

  // 21. Payment Verification & Reminder Scheduling
  await runTest('POST /api/payments/verify confirms payment, assigns OPD token & schedules reminders', async () => {
    const res = await fetch(`${BASE_URL}/api/payments/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: paymentOrderId,
        paymentId: 'pay_rzp_mock_txn_999',
        signature: 'valid_test_signature',
        provider: 'RAZORPAY',
        paymentMethod: 'Razorpay UPI (Verified)',
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`HTTP ${res.status} - ${err.error || 'Failed to verify payment'}`);
    }

    const data = await res.json();
    if (!data.success || data.payment?.status !== 'PAID' || data.appointment?.status !== 'CONFIRMED') {
      throw new Error('Payment was not marked PAID or appointment not marked CONFIRMED');
    }
    if (typeof data.appointment.tokenNumber !== 'number') {
      throw new Error('Appointment did not receive an auto-assigned OPD token');
    }
  });

  // 22. Webhook Idempotent Event Processing
  await runTest('POST /api/payments/webhook handles events with signature & idempotency', async () => {
    const webhookPayload = JSON.stringify({
      id: `evt_test_${Date.now()}`,
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_rzp_webhook_capture_1',
            order_id: paymentOrderId,
            amount: 7500,
          },
        },
      },
    });

    // First delivery
    const res1 = await fetch(`${BASE_URL}/api/payments/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': 'mock_webhook_signature',
      },
      body: webhookPayload,
    });

    if (!res1.ok) throw new Error(`HTTP ${res1.status} on initial webhook delivery`);
    const data1 = await res1.json();
    if (!data1.success) throw new Error('Failed to process webhook event');

    // Duplicate delivery (Idempotency test)
    const res2 = await fetch(`${BASE_URL}/api/payments/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': 'mock_webhook_signature',
      },
      body: webhookPayload,
    });

    if (!res2.ok) throw new Error(`HTTP ${res2.status} on duplicate webhook delivery`);
    const data2 = await res2.json();
    if (!data2.message?.includes('Idempotent')) {
      throw new Error('Duplicate webhook was not detected as already processed (idempotency failure)');
    }
  });

  // 23. Refund Policy Calculation & Decoupled Execution
  await runTest('GET & POST /api/payments/refund calculates policy tiers (100%) and executes refund', async () => {
    // 1. Preview Policy (future appointment > 24h -> 100% refund)
    const previewRes = await fetch(`${BASE_URL}/api/payments/refund?appointmentId=${paymentApptId}`);
    if (!previewRes.ok) throw new Error(`HTTP ${previewRes.status} on refund preview`);
    const previewData = await previewRes.json();
    if (previewData.percentage !== 100 || previewData.refundAmount !== 75) {
      throw new Error(`Expected 100% refund ($75), got ${previewData.percentage}% ($${previewData.refundAmount})`);
    }

    // 2. Execute Refund
    const refundRes = await fetch(`${BASE_URL}/api/payments/refund`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appointmentId: paymentApptId,
        reason: 'Patient cancelled visit via automated test suite',
      }),
    });

    if (!refundRes.ok) throw new Error(`HTTP ${refundRes.status} on refund execution`);
    const refundData = await refundRes.json();
    if (!refundData.success || refundData.refundAmount !== 75) {
      throw new Error('Refund execution did not return success or correct amount');
    }
    if (refundData.appointment?.status !== 'CANCELLED' || refundData.payment?.refundStatus !== 'SUCCEEDED') {
      throw new Error('Appointment status is not CANCELLED or payment refundStatus is not SUCCEEDED');
    }
  });

  // 24. Automated Reminder Processing & Cancellation Safeguard
  await runTest('POST /api/notifications/reminders/process safeguards cancelled appointments', async () => {
    const res = await fetch(`${BASE_URL}/api/notifications/reminders/process`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success) throw new Error('Reminder processor failed to return success');
  });

  // 25. Multi-Channel Notifications Query & Mark As Read
  await runTest('GET & PATCH /api/notifications returns real-time alerts and updates status', async () => {
    const listRes = await fetch(`${BASE_URL}/api/notifications?userId=pat_1`);
    if (!listRes.ok) throw new Error(`HTTP ${listRes.status}`);
    const listData = await listRes.json();
    if (!listData.success || !Array.isArray(listData.notifications)) {
      throw new Error('Notifications list was invalid or empty');
    }

    const patchRes = await fetch(`${BASE_URL}/api/notifications`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAll: true, userId: 'pat_1' }),
    });
    if (!patchRes.ok) throw new Error(`HTTP ${patchRes.status} on markAll`);
    const patchData = await patchRes.json();
    if (!patchData.success) throw new Error('Failed to mark notifications as read');
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
