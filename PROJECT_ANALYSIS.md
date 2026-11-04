# Project Analysis & Requirements Specification

## 1. Executive Summary & Project Identification
* **Project Title:** Intelligent Hospital Management System (Hospital Appointment Booking System)
* **Student Name:** Sarathkirla (`sarathkirla-28`)
* **Registration Number:** `2023006411`
* **Academic Institution:** Department of Computer Science and Systems Engineering, GITAM School of Computer Science and Engineering, GITAM (Deemed to be University), Visakhapatnam, 2026.
* **Internship Organization:** Yalamanchili Software Exports Private Limited, Visakhapatnam.
* **Student's Core Assigned Responsibility:** Admin Panel Development and Management (Admin Dashboard, User Management, Appointment Monitoring, Analytics & Reporting).

### Document Source Reconciliation
1. **Primary Requirements Source:** `Sarath internship ppt -6411.pptx`  
   Details the complete functional specification for the web-based Hospital Appointment Booking System, covering patient registration, doctor schedule management, appointment booking with double-booking prevention, and the administrator management panel.
2. **Contextual Information Source:** `Sarath report.pdf`  
   Provides academic and internship identity details (student name, registration ID, institution, department, mentor, and internship duration).  
   *Note:* The PDF contains separate references to "Career Intelligence / Skill Path AI". In accordance with the project master instructions, that unrelated topic is strictly excluded. All requirements, architecture, and code are 100% focused on the Hospital Management System.

---

## 2. Technology Stack & Architecture Evolution Disclosure

### Original PPT Specification
The internship presentation specifies the baseline academic stack:
* **Frontend:** HTML & CSS
* **Backend:** Java Servlets
* **Database:** SQL Database
* **Local Web Server:** Apache Tomcat (port 8082)
* **Demonstration Tunneling:** ngrok

### Modernized Production Architecture
To deliver a fully functional, high-performance, responsive, and deployable web application without the hosting constraints, heavy memory footprint, and servlet container limitations of legacy Java hosting:
* **Frontend:** React (Vite-based modern SPA) with Tailwind CSS, Lucide icons, and Chart.js for data visualization.
* **Backend:** Node.js with Express (RESTful API), implementing secure authentication, input validation, and role-based middleware.
* **Database Layer:** Relational SQL with atomic ACID transactions and unique constraints.
  * *Local Execution:* Self-contained SQLite database (`data/hospital.db`) allowing immediate zero-configuration local execution and testing without needing a local PostgreSQL daemon or Docker container.
  * *Production Execution:* Seamlessly connects to a managed PostgreSQL database via the `pg` connection pool when `DATABASE_URL` is configured.
* **Local Port Alignment:** Configured to run on **port 8082** locally, preserving fidelity with the original presentation (Slide 9).
* **Policy Compliance:** No duplicate or nonfunctional Java stub files are created. The architectural modernization is clearly disclosed and documented here and across all project documentation.

---

## 3. Detailed Functional Modules

### Module A: Public Website & Information Portal
1. **Homepage:** Clean hospital-themed landing page with hero CTA ("Book Consultation", "Find Doctors"), department quick links, statistics overview, and emergency contact notice.
2. **About Hospital:** Institutional vision, clinical care standards, facility highlights, and medical excellence guidelines (using clearly identified fictional demonstration data).
3. **Doctors Directory:** Filterable list of medical professionals by department, specialization, experience, and consultation fees.
4. **Departments Page:** Dedicated overviews for Cardiology, Neurology, Orthopedics, Pediatrics, General Medicine, Dermatology, and Ophthalmology.
5. **Contact Page:** Hospital address, emergency desk contact, feedback inquiry form with interactive validation.
6. **Authentication Center:** Role-based login (Patient, Doctor, Admin) and new Patient self-registration.

### Module B: Patient Module
1. **Registration & Login:** Secure authentication using bcrypt password hashing and token-based session management.
2. **Patient Dashboard:** Overview of upcoming appointments, consultation history, and health summary.
3. **Doctor Discovery:** Search by doctor name, filter by department, view doctor credentials and consultation fees.
4. **Interactive Slot Picker:** Select an available date and choose from dynamic time slots (only unbooked, active slots are selectable).
5. **Double-Booking Prevention:** Strict database-level constraint (`UNIQUE(doctor_id, appointment_date, slot_time)`) backed by transaction rollback prevents concurrent slot reservation.
6. **Appointment Cancellation & Rescheduling:** Patients can cancel or reschedule appointments before consultation time; cancelling instantly returns the slot to available status.
7. **Appointment Status Tracking:** Track progression across `Pending`, `Confirmed`, `Completed`, and `Cancelled`.
8. **Patient Profile:** Manage contact number, date of birth, blood group, and emergency contact details.

### Module C: Doctor Module
1. **Doctor Login & Dashboard:** Today's appointment roster, patient queue, and pending consultation requests.
2. **Appointment Management:** View patient appointment reasons, symptoms, and previous consultation history.
3. **Schedule & Availability Configuration:** Define active days, set consultation hours, toggle slot availability, and block personal time off.
4. **Status Progression:** Approve pending bookings, mark consultations as `Completed`, or reject/cancel with explanatory clinical notes.

### Module D: Administrator Module *(Main Focus)*
1. **Executive Analytics Dashboard:**
   * Real-time metric cards: Total Registered Patients, Total Active Doctors, Total Appointments, Pending Bookings, Confirmed Appointments, Cancelled Appointments.
   * Visual Charts: Department-wise appointment distribution, weekly booking trends, and doctor consultation volume.
   * Recent Activity Log: Real-time audit trail of logins, bookings, and status changes.
2. **User Management:**
   * **Patients:** Master list of registered patients, search by name/email/phone, toggle active/inactive account status, view individual booking history.
   * **Doctors:** Add new doctors (name, email, department, specialization, experience, room number, consultation fee), edit doctor profiles, toggle doctor availability.
3. **Appointment Oversight & Conflict Resolution:**
   * Comprehensive appointments table with multi-parameter filtering (by date range, doctor, patient, department, status).
   * Administrative override: Approve, reschedule, or cancel any appointment.
4. **Reporting & Data Export:**
   * Generate tabular summary reports for administrative review.
   * **One-Click CSV Export** of appointment records for audit and offline analysis.

---

## 4. Database Schema Specification

### Relational Schema Design
1. **`users`**
   * `id` (INTEGER PRIMARY KEY AUTOINCREMENT / SERIAL)
   * `email` (VARCHAR(150) UNIQUE NOT NULL)
   * `password_hash` (VARCHAR(255) NOT NULL)
   * `role` (VARCHAR(20) CHECK role IN ('patient', 'doctor', 'admin'))
   * `full_name` (VARCHAR(100) NOT NULL)
   * `phone` (VARCHAR(20))
   * `status` (VARCHAR(20) DEFAULT 'active')
   * `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

2. **`departments`**
   * `id` (INTEGER PRIMARY KEY AUTOINCREMENT / SERIAL)
   * `name` (VARCHAR(100) UNIQUE NOT NULL)
   * `code` (VARCHAR(20) UNIQUE NOT NULL)
   * `description` (TEXT)
   * `head_doctor` (VARCHAR(100))

3. **`doctors`**
   * `id` (INTEGER PRIMARY KEY AUTOINCREMENT / SERIAL)
   * `user_id` (INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE)
   * `department_id` (INTEGER REFERENCES departments(id))
   * `specialization` (VARCHAR(100) NOT NULL)
   * `experience_years` (INTEGER DEFAULT 0)
   * `consultation_fee` (DECIMAL(10,2) DEFAULT 0.00)
   * `room_number` (VARCHAR(50))
   * `bio` (TEXT)
   * `is_available` (BOOLEAN DEFAULT TRUE)

4. **`patients`**
   * `id` (INTEGER PRIMARY KEY AUTOINCREMENT / SERIAL)
   * `user_id` (INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE)
   * `dob` (DATE)
   * `gender` (VARCHAR(20))
   * `blood_group` (VARCHAR(10))
   * `address` (TEXT)
   * `emergency_contact` (VARCHAR(50))

5. **`doctor_schedules`**
   * `id` (INTEGER PRIMARY KEY AUTOINCREMENT / SERIAL)
   * `doctor_id` (INTEGER REFERENCES doctors(id) ON DELETE CASCADE)
   * `day_of_week` (VARCHAR(15) NOT NULL)
   * `start_time` (VARCHAR(10) NOT NULL)
   * `end_time` (VARCHAR(10) NOT NULL)
   * `slot_duration_minutes` (INTEGER DEFAULT 30)
   * `is_active` (BOOLEAN DEFAULT TRUE)

6. **`appointments`**
   * `id` (INTEGER PRIMARY KEY AUTOINCREMENT / SERIAL)
   * `appointment_number` (VARCHAR(30) UNIQUE NOT NULL)
   * `patient_id` (INTEGER REFERENCES patients(id) ON DELETE CASCADE)
   * `doctor_id` (INTEGER REFERENCES doctors(id) ON DELETE CASCADE)
   * `department_id` (INTEGER REFERENCES departments(id))
   * `appointment_date` (DATE NOT NULL)
   * `slot_time` (VARCHAR(10) NOT NULL)
   * `status` (VARCHAR(20) DEFAULT 'Pending' CHECK status IN ('Pending', 'Confirmed', 'Completed', 'Cancelled'))
   * `patient_symptoms` (TEXT)
   * `doctor_notes` (TEXT)
   * `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
   * `updated_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
   * **CRITICAL CONSTRAINT:** `UNIQUE(doctor_id, appointment_date, slot_time)` when status != 'Cancelled'

7. **`appointment_status_history`**
   * `id` (INTEGER PRIMARY KEY AUTOINCREMENT / SERIAL)
   * `appointment_id` (INTEGER REFERENCES appointments(id) ON DELETE CASCADE)
   * `previous_status` (VARCHAR(20))
   * `new_status` (VARCHAR(20) NOT NULL)
   * `changed_by_user_id` (INTEGER REFERENCES users(id))
   * `comments` (TEXT)
   * `changed_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

---

## 5. Security & Data Integrity Rules
1. **Password Protection:** All passwords are cryptographically hashed using `bcrypt` (10 salt rounds). Plaintext passwords are never stored or logged.
2. **Access Control:** Express middleware verifies JWT authentication and validates user role before permitting access to Patient, Doctor, or Administrator endpoints.
3. **Double-Booking Prevention:**
   * Application-level check inside database transaction.
   * Database unique index on `(doctor_id, appointment_date, slot_time)` active slots.
   * Cancellation releases the slot immediately for new bookings.
4. **Fictional Demonstration Data:**
   * All names, emails, addresses, medical details, and contact numbers are strictly synthetic sample data.
   * No actual hospital names, personal medical information, or real credentials are used.
5. **No Secrets in Source:**
   * All sensitive tokens and configuration utilize environment variables (`.env`).
   * `.env` is included in `.gitignore` and `.env.example` provides non-sensitive template values.

---

## 6. Implementation & Verification Plan
1. **Backend Foundation:**
   * Express server setup with CORS, JSON body parser, and security headers.
   * Database initialization script seeding departments, doctors, fictional patients, and default administrator credentials.
   * Authentication routes (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`).
   * Patient routes (`/api/patient/appointments`, `/api/patient/book`, `/api/patient/cancel`, `/api/patient/reschedule`).
   * Doctor routes (`/api/doctor/appointments`, `/api/doctor/schedule`, `/api/doctor/status`).
   * Admin routes (`/api/admin/metrics`, `/api/admin/users`, `/api/admin/doctors`, `/api/admin/appointments`, `/api/admin/export-csv`).
2. **Frontend Implementation:**
   * Clean React interface with modern medical palette (Teal, Slate, Navy, White).
   * Navigation with role-aware headers.
   * Public landing page, departments, doctors, contact.
   * Patient Portal with dynamic appointment booking wizard.
   * Doctor Portal with schedule management and patient roster.
   * Comprehensive Admin Portal with metric cards, analytics charts, user management, and CSV export.
3. **Rigorous Local Testing:**
   * Execute 16 functional test cases covering registration, login, role restrictions, booking, double-booking prevention, cancellation, doctor actions, and admin management.
   * Document results in `TEST_CASES.md` and `TEST_RESULTS.md`.
4. **GitHub Integration:**
   * Initialize clean git repo inside `hospital-management-system`.
   * Create public repository `sarathkirla-28/hospital-management-system` using isolated `GH_CONFIG_DIR`.
   * Push complete project source code.
5. **Deployment:**
   * Prepare production build.
   * Test live frontend/backend hosting options.
