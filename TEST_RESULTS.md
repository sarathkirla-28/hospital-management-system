# Test Execution Results Report

**Project:** Intelligent Hospital Management System  
**Lead Developer:** Sarathkirla (`sarathkirla-28`, Regd. No: 2023006411)  
**Execution Timestamp:** 2026-11-04 14:15:12 UTC+5:30  
**Test Suite Harness:** `tests/test_suite.js`  
**Runtime Environment:** Node.js v24.18.0, Windows, Express 5.x, SQLite & PostgreSQL Adapter

---

## Executive Test Summary

| Metric | Value |
| :--- | :--- |
| **Total Test Cases Executed** | 16 |
| **Passed Test Cases** | 16 |
| **Failed Test Cases** | 0 |
| **Execution Success Rate** | **100.0%** |
| **Double-Booking Enforced** | Verified (HTTP 409 Conflict & Database Partial Unique Constraint) |
| **Data Persistence Integrity** | Verified across multiple query cycles |

---

## Detailed Test Case Results

| Test # | Test Case Description | Target Component | Status | Execution Details |
| :---: | :--- | :--- | :---: | :--- |
| **TC-01** | Patient Self-Registration | `/api/auth/register` | **PASSED** | Created patient record with ID 9, password hashed with bcrypt, JWT token returned. |
| **TC-02** | Valid Login (Admin & Doctor) | `/api/auth/login` | **PASSED** | Successfully authenticated `admin@hospital.demo` and `dr.anita@hospital.demo`. |
| **TC-03** | Invalid Login Rejection | `/api/auth/login` | **PASSED** | Rejected bad password and non-existent user with HTTP 401 without information leakage. |
| **TC-04** | Patient Access Restrictions | RBAC Middleware | **PASSED** | Patient token rejected with HTTP 403 when attempting to access `/api/admin` and `/api/doctor`. |
| **TC-05** | Doctor Access Restrictions | RBAC Middleware | **PASSED** | Doctor token rejected with HTTP 403 when attempting to access `/api/admin/metrics`. |
| **TC-06** | Admin Access Verification | RBAC Middleware | **PASSED** | Blocked unauthenticated requests (HTTP 401) and permitted authorized admin (HTTP 200). |
| **TC-07** | Doctor Search & Filtering | `/api/public/doctors` | **PASSED** | Correctly filtered doctors by department ID and full-text keyword query. |
| **TC-08** | Appointment Booking | `/api/patient/appointments` | **PASSED** | Reserved slot atomically, generated unique appointment `#APT-2026-7673`. |
| **TC-09** | Double-Booking Prevention | Critical Concurrency Logic | **PASSED** | Second booking request for the exact same doctor/date/time returned **HTTP 409 Conflict**. |
| **TC-10** | Cancellation & Slot Liberation | Appointment Lifecycle | **PASSED** | Cancelled appointment; verified slot immediately became available for re-booking. |
| **TC-11** | Appointment Rescheduling | `/api/patient/appointments/:id/reschedule` | **PASSED** | Atomically moved appointment to new available date and time slot with audit log. |
| **TC-12** | Doctor Schedule Management | `/api/doctor/schedules` | **PASSED** | Updated doctor consultation hours; verified changes propagated to slot generation. |
| **TC-13** | Admin User Management | `/api/admin/users/patients` | **PASSED** | Queried patient list, toggled status from active to inactive and back to active. |
| **TC-14** | Appointment Status Progression | `/api/doctor/appointments/:id/status` | **PASSED** | Transitioned appointment to `Completed` with clinical observation notes. |
| **TC-15** | Database Persistence & Integrity | SQL Storage Engine | **PASSED** | Verified all fields, clinical notes, and status persist accurately on disk. |
| **TC-16** | Admin CSV Report Export | `/api/admin/export-csv` | **PASSED** | Generated well-formed CSV stream with headers and comma-delimited row data. |

---

## Double-Booking Prevention Verification Evidence

During Test Case 09, a duplicate booking was submitted for:
* **Doctor ID:** 1 (Dr. Anita Roy)
* **Date:** 2026-11-20
* **Slot:** 09:00

**Result:** The database partial unique index `idx_unique_active_booking ON appointments (doctor_id, appointment_date, slot_time) WHERE status != 'Cancelled'` coupled with the application transaction rejected the reservation with:
```json
{
  "status": 409,
  "error": "This time slot is already booked. Please select another time slot or date."
}
```
When Test Case 10 executed cancellation, status was updated to `Cancelled`, taking the row out of the partial unique index and enabling immediate re-booking.
