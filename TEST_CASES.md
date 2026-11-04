# Test Cases Specification: Hospital Management System

This document specifies the official 16 test cases executed to validate system integrity, role-based access control, appointment booking workflows, double-booking prevention, doctor schedule management, and administrator oversight.

---

### Test Case 01: Patient Self-Registration
* **Module:** Authentication & Patient Module
* **Preconditions:** Server active, database seeded.
* **Input:** Valid patient name, unique email, 8+ char password, phone, DOB, gender, blood group.
* **Expected Result:** HTTP 201 Created. User account created in `users` with role `patient`, linked profile in `patients`, JWT token returned.

### Test Case 02: Valid Login (Admin & Doctor)
* **Module:** Authentication & RBAC
* **Preconditions:** Valid accounts seeded in database.
* **Input:** Email and password for `admin@hospital.demo` and `dr.anita@hospital.demo`.
* **Expected Result:** HTTP 200 OK. Valid JWT token returned with correct role claims and user metadata.

### Test Case 03: Invalid Login Rejection
* **Module:** Security & Authentication
* **Input:** Incorrect password for valid user, and non-existent email address.
* **Expected Result:** HTTP 401 Unauthorized with safe error message ("Invalid email or password"). No password or stack trace leak.

### Test Case 04: Patient Access Restrictions
* **Module:** Role-Based Access Control (RBAC)
* **Preconditions:** Authenticated as patient.
* **Action:** Attempt to call `GET /api/admin/metrics` and `GET /api/doctor/appointments`.
* **Expected Result:** HTTP 403 Forbidden on both endpoints.

### Test Case 05: Doctor Access Restrictions
* **Module:** Role-Based Access Control (RBAC)
* **Preconditions:** Authenticated as doctor.
* **Action:** Attempt to access `GET /api/admin/metrics`.
* **Expected Result:** HTTP 403 Forbidden.

### Test Case 06: Admin Access Verification
* **Module:** Role-Based Access Control (RBAC)
* **Action:** Access `GET /api/admin/metrics` without token (should return HTTP 401); then access with valid Admin JWT.
* **Expected Result:** HTTP 200 OK with full metric payload.

### Test Case 07: Doctor Search and Filtering
* **Module:** Public Discovery
* **Action:** Call `GET /api/public/doctors?search=Anita` and `GET /api/public/doctors?department_id=1`.
* **Expected Result:** HTTP 200 OK with accurately filtered doctors list and consultation schedules.

### Test Case 08: Appointment Booking
* **Module:** Patient Booking Workflow
* **Input:** Valid `doctor_id`, future date, valid slot time, patient symptoms.
* **Expected Result:** HTTP 201 Created. Appointment record stored with unique number (`APT-YYYY-XXXX`), initial status `Confirmed`, and audit entry created.

### Test Case 09: Double-Booking Prevention (Concurrency & Constraint)
* **Module:** Critical Booking Logic & Database Constraints
* **Action:** Immediately submit a duplicate booking request for the exact same doctor, date, and slot.
* **Expected Result:** HTTP 409 Conflict. Application transaction rejects the duplicate reservation, preserving schedule uniqueness.

### Test Case 10: Appointment Cancellation & Slot Liberation
* **Module:** Patient Booking & Schedule Lifecycle
* **Action:** Cancel the existing appointment via `PUT /api/patient/appointments/:id/cancel`. Then attempt to book that same slot again.
* **Expected Result:** HTTP 200 OK for cancellation (status set to `Cancelled`), followed by HTTP 201 Created for the re-booking of the now-vacated slot.

### Test Case 11: Appointment Rescheduling
* **Module:** Patient Booking Lifecycle
* **Input:** Existing appointment ID, new available date and slot time.
* **Expected Result:** HTTP 200 OK. Appointment atomically updated to new date/time with audit history entry.

### Test Case 12: Doctor Schedule Management
* **Module:** Doctor Portal
* **Action:** Update weekly consultation schedule hours via `POST /api/doctor/schedules`.
* **Expected Result:** HTTP 200 OK. New schedule persisted and reflected in future slot availability queries.

### Test Case 13: Admin User Management
* **Module:** Admin Panel (Student Focus)
* **Action:** Admin queries registered patients (`GET /api/admin/users/patients`) and toggles account status to `inactive` then back to `active`.
* **Expected Result:** HTTP 200 OK. State change reflected in database and user listing.

### Test Case 14: Appointment Status Progression
* **Module:** Doctor Consultation
* **Action:** Doctor updates assigned appointment status to `Completed` with clinical consultation notes.
* **Expected Result:** HTTP 200 OK. Status updated, clinical notes saved, and audit entry generated.

### Test Case 15: Database Persistence & ACID Integrity
* **Module:** Database Layer
* **Action:** Query the updated appointment directly from the SQL database to verify fields and status.
* **Expected Result:** Direct SQL query confirms exact status `Completed` and notes persisted on disk.

### Test Case 16: Admin Report CSV Export
* **Module:** Admin Reporting
* **Action:** Admin requests `GET /api/admin/export-csv`.
* **Expected Result:** HTTP 200 OK with `Content-Type: text/csv`, valid headers (`Appointment Number,Date,Time Slot,...`), and populated rows.
