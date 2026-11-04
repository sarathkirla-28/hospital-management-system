# Relational Database Schema & Data Dictionary

**Project:** Intelligent Hospital Management System  
**Compatibility:** SQLite (Local Development) & PostgreSQL (Cloud Production)  
**Location of DDL File:** `database/schema.sql`  

---

## Entity Relationship Overview

The schema consists of 7 normalized relational tables enforcing full referential integrity through foreign keys with cascade and restrict constraints:

```
+------------+       1:1       +------------+
|   users    | <-------------> |  patients  |
+------------+                 +------------+
      ^                              ^
      | 1:1                          | 1:N
      v                              |
+------------+                 +--------------+
|  doctors   | <-------------> | appointments |
+------------+      1:N        +--------------+
      |                               |
      | 1:N                           | 1:N
      v                               v
+------------------+           +----------------------------+
| doctor_schedules |           | appointment_status_history |
+------------------+           +----------------------------+
      ^
      | N:1
+-------------+
| departments |
+-------------+
```

---

## Detailed Table Specifications

### 1. `users`
Core authentication and role entity.
* `id` (INTEGER PRIMARY KEY AUTOINCREMENT / SERIAL): Unique user identifier.
* `email` (VARCHAR(150) UNIQUE NOT NULL): User email address.
* `password_hash` (VARCHAR(255) NOT NULL): bcrypt password hash.
* `role` (VARCHAR(20) NOT NULL): User authorization role (`patient`, `doctor`, `admin`).
* `full_name` (VARCHAR(100) NOT NULL): Full legal name.
* `phone` (VARCHAR(20)): Primary telephone number.
* `status` (VARCHAR(20) DEFAULT 'active'): Account state (`active`, `inactive`, `suspended`).
* `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP): Registration timestamp.

### 2. `departments`
Medical clinical departments.
* `id` (INTEGER PRIMARY KEY AUTOINCREMENT / SERIAL): Unique department ID.
* `name` (VARCHAR(100) UNIQUE NOT NULL): Name (e.g. Cardiology, Neurology).
* `code` (VARCHAR(20) UNIQUE NOT NULL): Department code (e.g. CARD, NEUR).
* `description` (TEXT): Clinical scope.
* `icon_name` (VARCHAR(50)): Lucide icon identifier.
* `head_doctor` (VARCHAR(100)): Faculty head physician name.
* `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP): Timestamp.

### 3. `doctors`
Medical doctor profiles linked to `users`.
* `id` (INTEGER PRIMARY KEY AUTOINCREMENT / SERIAL): Doctor ID.
* `user_id` (INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE): User ID link.
* `department_id` (INTEGER REFERENCES departments(id) ON DELETE RESTRICT): Department ID link.
* `specialization` (VARCHAR(100) NOT NULL): Clinical specialization.
* `qualification` (VARCHAR(100) NOT NULL): Academic degrees (MD, DM, MS, etc.).
* `experience_years` (INTEGER DEFAULT 1): Years of medical practice.
* `consultation_fee` (DECIMAL(10,2) DEFAULT 50.00): Standard consultation charge.
* `room_number` (VARCHAR(50) NOT NULL): Clinic consultation room number.
* `bio` (TEXT): Professional summary.
* `is_available` (BOOLEAN DEFAULT 1): Practice duty availability toggle.
* `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP): Timestamp.

### 4. `patients`
Patient demographic and clinical records linked to `users`.
* `id` (INTEGER PRIMARY KEY AUTOINCREMENT / SERIAL): Patient ID.
* `user_id` (INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE): User ID link.
* `dob` (DATE): Date of birth.
* `gender` (VARCHAR(20)): Patient gender.
* `blood_group` (VARCHAR(10)): Blood group (A+, B+, O+, AB+, etc.).
* `address` (TEXT): Residential address.
* `emergency_contact` (VARCHAR(50)): Emergency contact name and phone.
* `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP): Timestamp.

### 5. `doctor_schedules`
Weekly consultation schedules for doctors.
* `id` (INTEGER PRIMARY KEY AUTOINCREMENT / SERIAL): Schedule ID.
* `doctor_id` (INTEGER REFERENCES doctors(id) ON DELETE CASCADE): Doctor ID link.
* `day_of_week` (VARCHAR(15) NOT NULL): Day (`Monday` - `Sunday`).
* `start_time` (VARCHAR(10) NOT NULL): Consultation start time (`HH:MM`).
* `end_time` (VARCHAR(10) NOT NULL): Consultation end time (`HH:MM`).
* `slot_duration_minutes` (INTEGER DEFAULT 30): Slot length in minutes.
* `is_active` (BOOLEAN DEFAULT 1): Active toggle.

### 6. `appointments`
Scheduled medical appointments.
* `id` (INTEGER PRIMARY KEY AUTOINCREMENT / SERIAL): Unique appointment ID.
* `appointment_number` (VARCHAR(30) UNIQUE NOT NULL): Identifier (e.g. `APT-2026-1001`).
* `patient_id` (INTEGER REFERENCES patients(id) ON DELETE CASCADE): Patient link.
* `doctor_id` (INTEGER REFERENCES doctors(id) ON DELETE CASCADE): Doctor link.
* `department_id` (INTEGER REFERENCES departments(id) ON DELETE RESTRICT): Department link.
* `appointment_date` (DATE NOT NULL): Consultation date (`YYYY-MM-DD`).
* `slot_time` (VARCHAR(10) NOT NULL): Consultation slot time (`HH:MM`).
* `status` (VARCHAR(20) DEFAULT 'Pending'): (`Pending`, `Confirmed`, `Completed`, `Cancelled`).
* `patient_symptoms` (TEXT): Reason for visit.
* `doctor_notes` (TEXT): Clinical diagnosis and prescription notes.
* `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP): Creation timestamp.
* `updated_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP): Last updated timestamp.

### 7. `appointment_status_history`
Audit log of all appointment state changes.
* `id` (INTEGER PRIMARY KEY AUTOINCREMENT / SERIAL): Audit ID.
* `appointment_id` (INTEGER REFERENCES appointments(id) ON DELETE CASCADE): Appointment link.
* `previous_status` (VARCHAR(20)): Previous status.
* `new_status` (VARCHAR(20) NOT NULL): New status.
* `changed_by_user_id` (INTEGER REFERENCES users(id) ON DELETE SET NULL): Responsible user.
* `comments` (TEXT): Explanatory notes.
* `changed_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP): Event timestamp.

---

## Critical Database Indexes & Constraints

1. **Double-Booking Prevention Index:**
   ```sql
   CREATE UNIQUE INDEX idx_unique_active_booking 
   ON appointments (doctor_id, appointment_date, slot_time) 
   WHERE status != 'Cancelled';
   ```
2. **Query Optimization Indexes:**
   ```sql
   CREATE INDEX idx_appointments_patient ON appointments (patient_id);
   CREATE INDEX idx_appointments_doctor ON appointments (doctor_id);
   CREATE INDEX idx_appointments_date ON appointments (appointment_date);
   CREATE INDEX idx_appointments_status ON appointments (status);
   ```
