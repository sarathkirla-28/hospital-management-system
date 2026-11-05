/**
 * Automated Test Suite for Intelligent Hospital Management System
 * Executes 16 comprehensive functional and security test cases.
 */

const http = require('http');
const path = require('path');
const fs = require('fs');

// Ensure test environment uses test database or memory
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_key_12345';

const app = require('../server/src/app');
const seedDatabase = require('../server/src/seed');
const db = require('../server/src/db');

const TEST_PORT = 8089;
const BASE_URL = `http://localhost:${TEST_PORT}`;

let serverInstance;
let adminToken = '';
let doctorToken = '';
let patientToken = '';
let testPatientId = null;
let testDoctorId = null;
let testAppointmentId = null;

const testResults = [];

function recordTest(testNumber, name, status, details = '') {
  testResults.push({ testNumber, name, status, details });
  const icon = status === 'PASSED' ? '✅' : '❌';
  console.log(`${icon} [TEST ${String(testNumber).padStart(2, '0')}] ${name}: ${status} ${details ? '(' + details + ')' : ''}`);
}

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const config = {
    method: options.method || 'GET',
    headers
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  const res = await fetch(url, config);
  let data = null;
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  return { status: res.status, data, headers: res.headers };
}

async function runTestSuite() {
  console.log('================================================================');
  console.log('🏥 Starting Automated Test Suite: Hospital Management System');
  console.log('================================================================\n');

  // 1. Initialize DB with seed data
  await seedDatabase();

  // Clean any residual test users from prior runs to ensure test idempotency
  try {
    await db.run("DELETE FROM users WHERE email LIKE ?", ['test.patient.%']);
  } catch (_) {}

  // 2. Start Test Server
  await new Promise((resolve) => {
    serverInstance = app.listen(TEST_PORT, '127.0.0.1', () => {
      console.log(`Test server running on port ${TEST_PORT}\n`);
      resolve();
    });
  });

  try {
    // -------------------------------------------------------------
    // Test Case 1: Patient Registration
    // -------------------------------------------------------------
    const newPatientEmail = `test.patient.${Date.now()}@hospital.demo`;
    const regRes = await request('/api/auth/register', {
      method: 'POST',
      body: {
        full_name: 'Test Registration Patient',
        email: newPatientEmail,
        password: 'Password123!',
        phone: '+1-555-9988',
        gender: 'Female',
        blood_group: 'B+',
        dob: '1998-05-15'
      }
    });

    if (regRes.status === 201 && regRes.data.token && regRes.data.user.role === 'patient') {
      patientToken = regRes.data.token;
      testPatientId = regRes.data.user.patient_id;
      recordTest(1, 'Patient Registration', 'PASSED', `User created with ID: ${regRes.data.user.id}`);
    } else {
      recordTest(1, 'Patient Registration', 'FAILED', `Status: ${regRes.status}, Error: ${JSON.stringify(regRes.data)}`);
    }

    // -------------------------------------------------------------
    // Test Case 2: Valid Login (Admin & Doctor)
    // -------------------------------------------------------------
    const adminLoginRes = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@hospital.demo', password: 'Admin123!', requested_role: 'admin' }
    });

    const docLoginRes = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'dr.anita@hospital.demo', password: 'Doctor123!', requested_role: 'doctor' }
    });

    if (adminLoginRes.status === 200 && adminLoginRes.data.token && docLoginRes.status === 200 && docLoginRes.data.token) {
      adminToken = adminLoginRes.data.token;
      doctorToken = docLoginRes.data.token;
      testDoctorId = docLoginRes.data.user.doctor_id;
      recordTest(2, 'Valid Login (Admin & Doctor)', 'PASSED', 'JWT tokens generated for admin & doctor');
    } else {
      recordTest(2, 'Valid Login (Admin & Doctor)', 'FAILED', `Admin status: ${adminLoginRes.status}, Doc status: ${docLoginRes.status}`);
    }

    // -------------------------------------------------------------
    // Test Case 3: Invalid Login (Wrong Password & Nonexistent Email)
    // -------------------------------------------------------------
    const badPassRes = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@hospital.demo', password: 'WrongPassword999!' }
    });

    const badEmailRes = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'nonexistent@hospital.demo', password: 'SomePassword!' }
    });

    if (badPassRes.status === 401 && badEmailRes.status === 401) {
      recordTest(3, 'Invalid Login Rejection', 'PASSED', 'Rejected both incorrect password and non-existent email');
    } else {
      recordTest(3, 'Invalid Login Rejection', 'FAILED', `Expected 401, got ${badPassRes.status} & ${badEmailRes.status}`);
    }

    // -------------------------------------------------------------
    // Test Case 4: Patient Access Restrictions
    // -------------------------------------------------------------
    const patientTriesAdmin = await request('/api/admin/metrics', {
      headers: { Authorization: `Bearer ${patientToken}` }
    });

    const patientTriesDoctor = await request('/api/doctor/appointments', {
      headers: { Authorization: `Bearer ${patientToken}` }
    });

    if (patientTriesAdmin.status === 403 && patientTriesDoctor.status === 403) {
      recordTest(4, 'Patient Access Restrictions', 'PASSED', 'Patient blocked from admin and doctor routes (403)');
    } else {
      recordTest(4, 'Patient Access Restrictions', 'FAILED', `Admin status: ${patientTriesAdmin.status}, Doc: ${patientTriesDoctor.status}`);
    }

    // -------------------------------------------------------------
    // Test Case 5: Doctor Access Restrictions
    // -------------------------------------------------------------
    const docTriesAdmin = await request('/api/admin/metrics', {
      headers: { Authorization: `Bearer ${doctorToken}` }
    });

    if (docTriesAdmin.status === 403) {
      recordTest(5, 'Doctor Access Restrictions', 'PASSED', 'Doctor blocked from administrator endpoints (403)');
    } else {
      recordTest(5, 'Doctor Access Restrictions', 'FAILED', `Expected 403, got ${docTriesAdmin.status}`);
    }

    // -------------------------------------------------------------
    // Test Case 6: Admin Access Restrictions
    // -------------------------------------------------------------
    const noTokenRes = await request('/api/admin/metrics');
    const adminMetrics = await request('/api/admin/metrics', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    if (noTokenRes.status === 401 && adminMetrics.status === 200 && adminMetrics.data.metrics) {
      recordTest(6, 'Admin Access Verification', 'PASSED', 'Unauthenticated blocked (401), Authorized Admin allowed (200)');
    } else {
      recordTest(6, 'Admin Access Verification', 'FAILED', `Unauth: ${noTokenRes.status}, Admin: ${adminMetrics.status}`);
    }

    // -------------------------------------------------------------
    // Test Case 7: Doctor Search and Filtering
    // -------------------------------------------------------------
    const searchRes = await request('/api/public/doctors?search=Anita');
    const deptFilterRes = await request('/api/public/doctors?department_id=1');

    if (searchRes.status === 200 && searchRes.data.doctors.length > 0 &&
        deptFilterRes.status === 200 && deptFilterRes.data.doctors.every(d => d.department_id === 1)) {
      recordTest(7, 'Doctor Search & Filtering', 'PASSED', `Found ${searchRes.data.doctors.length} doctor matching search`);
    } else {
      recordTest(7, 'Doctor Search & Filtering', 'FAILED', 'Search or department filtering failed');
    }

    // -------------------------------------------------------------
    // Test Case 8: Appointment Booking
    // -------------------------------------------------------------
    const bookDate = '2026-11-20';
    const bookSlot = '09:00';
    const bookRes = await request('/api/patient/appointments', {
      method: 'POST',
      headers: { Authorization: `Bearer ${patientToken}` },
      body: {
        doctor_id: testDoctorId,
        appointment_date: bookDate,
        slot_time: bookSlot,
        symptoms: 'Mild chest discomfort during morning exercise'
      }
    });

    if (bookRes.status === 201 && bookRes.data.appointment) {
      testAppointmentId = bookRes.data.appointment.id;
      recordTest(8, 'Appointment Booking', 'PASSED', `Booked appointment #${bookRes.data.appointment.appointment_number}`);
    } else {
      recordTest(8, 'Appointment Booking', 'FAILED', `Status: ${bookRes.status}, Msg: ${JSON.stringify(bookRes.data)}`);
    }

    // -------------------------------------------------------------
    // Test Case 9: Duplicate Slot Booking (Double-Booking Prevention)
    // -------------------------------------------------------------
    // Attempt to book the exact same doctor, date, and slot
    const dupBookRes = await request('/api/patient/appointments', {
      method: 'POST',
      headers: { Authorization: `Bearer ${patientToken}` },
      body: {
        doctor_id: testDoctorId,
        appointment_date: bookDate,
        slot_time: bookSlot,
        symptoms: 'Attempting duplicate booking'
      }
    });

    if (dupBookRes.status === 409) {
      recordTest(9, 'Double-Booking Prevention', 'PASSED', 'Second concurrent booking rejected with 409 Conflict');
    } else {
      recordTest(9, 'Double-Booking Prevention', 'FAILED', `Expected 409 Conflict, got ${dupBookRes.status}`);
    }

    // -------------------------------------------------------------
    // Test Case 10: Appointment Cancellation (Slot Liberation)
    // -------------------------------------------------------------
    const cancelRes = await request(`/api/patient/appointments/${testAppointmentId}/cancel`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${patientToken}` },
      body: { reason: 'Schedule conflict on my end' }
    });

    // Verify slot is now available again for booking
    const rebookCancelledSlot = await request('/api/patient/appointments', {
      method: 'POST',
      headers: { Authorization: `Bearer ${patientToken}` },
      body: {
        doctor_id: testDoctorId,
        appointment_date: bookDate,
        slot_time: bookSlot,
        symptoms: 'Re-booking previously cancelled slot'
      }
    });

    if (cancelRes.status === 200 && rebookCancelledSlot.status === 201) {
      testAppointmentId = rebookCancelledSlot.data.appointment.id;
      recordTest(10, 'Appointment Cancellation & Slot Liberation', 'PASSED', 'Cancelled successfully and slot freed for booking');
    } else {
      recordTest(10, 'Appointment Cancellation & Slot Liberation', 'FAILED', `Cancel: ${cancelRes.status}, Rebook: ${rebookCancelledSlot.status}`);
    }

    // -------------------------------------------------------------
    // Test Case 11: Appointment Rescheduling
    // -------------------------------------------------------------
    const newDate = '2026-11-20';
    const newSlot = '09:30';
    const rescheduleRes = await request(`/api/patient/appointments/${testAppointmentId}/reschedule`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${patientToken}` },
      body: { new_date: newDate, new_slot: newSlot }
    });

    if (rescheduleRes.status === 200) {
      recordTest(11, 'Appointment Rescheduling', 'PASSED', `Rescheduled to ${newDate} at ${newSlot}`);
    } else {
      recordTest(11, 'Appointment Rescheduling', 'FAILED', `Status: ${rescheduleRes.status}, Msg: ${JSON.stringify(rescheduleRes.data)}`);
    }

    // -------------------------------------------------------------
    // Test Case 12: Doctor Schedule Management
    // -------------------------------------------------------------
    const updateScheduleRes = await request('/api/doctor/schedules', {
      method: 'POST',
      headers: { Authorization: `Bearer ${doctorToken}` },
      body: {
        schedules: [
          { day_of_week: 'Monday', start_time: '08:30', end_time: '13:30', slot_duration_minutes: 30 },
          { day_of_week: 'Wednesday', start_time: '08:30', end_time: '13:30', slot_duration_minutes: 30 }
        ]
      }
    });

    if (updateScheduleRes.status === 200) {
      recordTest(12, 'Doctor Schedule Management', 'PASSED', 'Doctor consultation hours updated successfully');
    } else {
      recordTest(12, 'Doctor Schedule Management', 'FAILED', `Status: ${updateScheduleRes.status}`);
    }

    // -------------------------------------------------------------
    // Test Case 13: Admin User Management (Patients list & toggle status)
    // -------------------------------------------------------------
    const adminPatientsRes = await request('/api/admin/users/patients', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    const targetUser = adminPatientsRes.data.patients[0];
    const toggleStatusRes = await request(`/api/admin/users/${targetUser.user_id}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { status: 'inactive' }
    });

    // Revert back to active
    await request(`/api/admin/users/${targetUser.user_id}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { status: 'active' }
    });

    if (adminPatientsRes.status === 200 && adminPatientsRes.data.patients.length > 0 && toggleStatusRes.status === 200) {
      recordTest(13, 'Admin User Management', 'PASSED', `Admin queried ${adminPatientsRes.data.patients.length} patients and toggled status`);
    } else {
      recordTest(13, 'Admin User Management', 'FAILED', `Status: ${adminPatientsRes.status}`);
    }

    // -------------------------------------------------------------
    // Test Case 14: Appointment Status Updates
    // -------------------------------------------------------------
    const docUpdateStatus = await request(`/api/doctor/appointments/${testAppointmentId}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${doctorToken}` },
      body: { status: 'Completed', doctor_notes: 'Patient showed normal vital signs. Prescribed routine exercise.' }
    });

    if (docUpdateStatus.status === 200) {
      recordTest(14, 'Appointment Status Updates', 'PASSED', 'Doctor transitioned appointment to Completed with clinical notes');
    } else {
      recordTest(14, 'Appointment Status Updates', 'FAILED', `Status: ${docUpdateStatus.status}, Msg: ${JSON.stringify(docUpdateStatus.data)}`);
    }

    // -------------------------------------------------------------
    // Test Case 15: Database Persistence
    // -------------------------------------------------------------
    const dbRecord = await db.get('SELECT id, status, doctor_notes FROM appointments WHERE id = ?', [testAppointmentId]);

    if (dbRecord && dbRecord.status === 'Completed' && dbRecord.doctor_notes && dbRecord.doctor_notes.includes('normal vital signs')) {
      recordTest(15, 'Database Persistence & Integrity', 'PASSED', 'Verified database row persists correctly across queries');
    } else {
      recordTest(15, 'Database Persistence & Integrity', 'FAILED', `DB record mismatch: ${JSON.stringify(dbRecord)}`);
    }

    // -------------------------------------------------------------
    // Test Case 16: Admin Report CSV Export
    // -------------------------------------------------------------
    const csvRes = await request('/api/admin/export-csv', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    if (csvRes.status === 200 && typeof csvRes.data === 'string' && csvRes.data.includes('Appointment Number,Date,Time Slot')) {
      recordTest(16, 'Admin Report CSV Export', 'PASSED', `Generated CSV report with ${csvRes.data.split('\n').length} rows`);
    } else {
      recordTest(16, 'Admin Report CSV Export', 'FAILED', `Status: ${csvRes.status}`);
    }

  } catch (err) {
    console.error('Test suite unexpected error:', err);
  } finally {
    try {
      await db.run("DELETE FROM users WHERE email LIKE ?", ['test.patient.%']);
    } catch (_) {}
    if (serverInstance) {
      serverInstance.close();
    }
  }

  // Summary
  console.log('\n================================================================');
  console.log('📊 TEST EXECUTION SUMMARY');
  console.log('================================================================');
  const passedCount = testResults.filter(r => r.status === 'PASSED').length;
  const failedCount = testResults.filter(r => r.status === 'FAILED').length;
  console.log(`Total Test Cases : ${testResults.length}`);
  console.log(`Passed           : ${passedCount}`);
  console.log(`Failed           : ${failedCount}`);
  console.log(`Success Rate     : ${((passedCount / testResults.length) * 100).toFixed(1)}%`);
  console.log('================================================================\n');

  return { total: testResults.length, passed: passedCount, failed: failedCount, results: testResults };
}

if (require.main === module) {
  runTestSuite()
    .then((summary) => {
      process.exit(summary.failed === 0 ? 0 : 1);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = runTestSuite;
