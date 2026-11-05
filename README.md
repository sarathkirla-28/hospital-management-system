# Intelligent Hospital Management System (Hospital Appointment Booking System)

[![Live Web App](https://img.shields.io/badge/Vercel-Live%20Frontend-brightgreen)](https://client-gamma-eight-82.vercel.app)
[![API Backend](https://img.shields.io/badge/Render-Live%20Backend-blue)](https://hospital-management-backend-vaky.onrender.com/api/health)
[![Database](https://img.shields.io/badge/PostgreSQL-Render%20Cloud-blueviolet)](https://dashboard.render.com/)
[![Test Suite](https://img.shields.io/badge/Test%20Suite-16%2F16%20Passed%20(100%25)-success)](./TEST_RESULTS.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](https://opensource.org/licenses/MIT)
[![Academic Evaluation](https://img.shields.io/badge/GITAM%20B.Tech-Internship%202026-blue)](https://www.gitam.edu/)

A full-stack, responsive hospital appointment booking and clinical administration web application designed to eliminate patient waiting queues, guarantee zero double-booking through relational database constraints, and provide comprehensive administrative oversight.

### 🌐 Verified Live Deployments
* **Production Web App (Vercel):** [https://client-gamma-eight-82.vercel.app](https://client-gamma-eight-82.vercel.app)
* **API Backend Server (Render):** [https://hospital-management-backend-vaky.onrender.com](https://hospital-management-backend-vaky.onrender.com)
* **Backend Health Check:** [https://hospital-management-backend-vaky.onrender.com/api/health](https://hospital-management-backend-vaky.onrender.com/api/health)
* **Database:** Production PostgreSQL on Render (`hospital-db`)

---

## 1. Academic & Student Information

* **Student Developer:** Sarathkirla (`sarathkirla-28`)
* **Registration Number:** `2023006411`
* **Academic Institution:** Department of Computer Science and Systems Engineering, GITAM School of Computer Science and Engineering, GITAM (Deemed to be University), Visakhapatnam.
* **Internship Organization:** Yalamanchili Software Exports Private Limited, Visakhapatnam.
* **Assigned Primary Responsibility:** **Admin Panel Development and Management** (Admin Dashboard, User Management, Appointment Monitoring, Conflict Resolution, Analytics & CSV Export).

---

## 2. Technology Stack & Evolution Disclosure

### Original Academic Presentation Stack
As presented in `Sarath internship ppt -6411.pptx`:
* **Frontend:** HTML & CSS
* **Backend:** Java Servlets
* **Database:** SQL Database
* **Local Web Server:** Apache Tomcat (port 8082)
* **Demonstration Tunneling:** ngrok

### Implemented Production Architecture
To deliver a high-performance, responsive, zero-friction, modern web application suitable for public cloud hosting and continuous demonstration:
* **Frontend:** React 19 SPA bundled with Vite, custom medical design system with accessible contrast, Lucide icons, and Chart.js.
* **Backend:** Node.js with Express 5 REST API, JWT session security, and role-based middleware.
* **Database:** Relational SQL with atomic ACID transactions and unique constraints. Supports self-contained SQLite locally (`server/data/hospital.db`) and PostgreSQL in production via `DATABASE_URL`.
* **Configured Port:** Runs on **port 8082** locally, preserving direct fidelity with the presentation specification (Slide 9).
* **Dual-Mode Resilient Execution:** The client features a persistent browser data store (`LocalDataStore`) that mirrors every backend endpoint. It runs with 100% full interactive fidelity in standalone mode (e.g. GitHub Pages) and seamlessly connects to the Express backend when online.

---

## 3. Demonstration Credentials

Pre-configured synthetic accounts are provided for immediate demonstration and grading:

| Portal | Role | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Admin Console** | `admin` | `admin@hospital.demo` | `Admin123!` | Executive dashboard, manage users, override appointments, export CSV. |
| **Doctor Portal** | `doctor` | `dr.anita@hospital.demo` | `Doctor123!` | Consultation queue, patient records, clinical notes, availability toggle. |
| **Patient Portal** | `patient` | `john.patient@hospital.demo` | `Patient123!` | Interactive booking wizard, reschedule slots, cancel, view medical notes. |

*(All patient, doctor, and hospital records are strictly fictional demonstration data generated for software testing).*

---

## 4. Key Functional Modules

### A. Public Website
* **Home Page:** Hero banner with quick appointment booking CTA, live telemetry metrics, and department highlights.
* **About Hospital:** Institutional mission, clinical standards, and academic project disclosure.
* **Departments Directory:** 7 clinical units (Cardiology, Neurology, Pediatrics, Orthopedics, General Medicine, Dermatology, Ophthalmology).
* **Doctors Directory:** Filterable specialist directory with search, department filtering, credentials, consultation fees, and schedule popovers.
* **Doctor Details:** Dedicated physician dossier with biography, clinical qualifications, room number, and consultation hours.
* **Contact & Emergency Desk:** Interactive inquiry form, department directory, and emergency notice.
* **Authentication Center:** Role-based login and self-registration for new patients.

### B. Patient Portal
* **Patient Dashboard:** Scheduled visits overview, quick booking shortcuts, and recent consultation history.
* **Dynamic Booking Wizard:** 5-step booking flow with dynamic time slot generation filtering out already-booked or blocked slots.
* **Double-Booking Prevention:** Atomic verification and database partial unique constraint preventing concurrent slot reservations.
* **Rescheduling & Cancellation:** Instant appointment cancellation that immediately frees the slot for other patients.
* **Patient Profile:** Manage residential address, emergency contact, date of birth, and blood group.

### C. Doctor Portal
* **Doctor Dashboard:** Daily consultation schedule, patient queue, and appointment status telemetry.
* **Clinical Observations:** Add doctor notes, diagnoses, and medical advice when marking consultations as `Completed`.
* **Schedule & Availability Manager:** Toggle overall practice duty status (Taking Patients / Off Duty) and define weekly consultation hours.

### D. Administrator Console *(Sarath's Core Focus)*
* **Executive Dashboard:** Real-time metric cards for Total Patients, Active Doctors, Total Bookings, Pending, Confirmed, and Cancelled.
* **Visual Analytics Charts:** Real-time Chart.js visual charts for daily booking trends and departmental consultation distribution.
* **User Management:** View all registered patients, search/filter, and activate/deactivate accounts.
* **Doctor Management:** Add new doctors with automatic weekly schedule seeding, edit consultation fees, and assign clinic rooms.
* **Department Management:** Create and configure clinical departments and assign department head physicians.
* **Master Appointments Ledger:** Comprehensive appointment oversight with multi-parameter filtering and administrative status override.
* **Report Generation & CSV Export:** Downloadable comma-separated values (CSV) export for hospital administrative audit.

---

## 5. Local Setup & Execution

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+ or v24 LTS)
* npm (v9+)

### Installation & Execution
```bash
# 1. Clone repository
git clone https://github.com/sarathkirla-28/hospital-management-system.git
cd hospital-management-system

# 2. Install backend dependencies
cd server
npm install

# 3. Install frontend dependencies and build
cd ../client
npm install
npm run build

# 4. Launch full-stack server on port 8082
cd ../server
node src/index.js
```
Open **http://localhost:8082** in your browser.

---

## 6. Automated Testing Suite

The project includes an automated test harness executing 16 comprehensive test cases:

```bash
node tests/test_suite.js
```

### Verified Test Cases:
1. Patient Registration (`HTTP 201 Created`)
2. Valid Login for Admin and Doctor (`JWT tokens verified`)
3. Invalid Login Rejection (`HTTP 401 Unauthorized`)
4. Patient Access Restrictions (`HTTP 403 Forbidden` on admin & doctor endpoints)
5. Doctor Access Restrictions (`HTTP 403 Forbidden` on admin endpoints)
6. Admin Access Verification (`HTTP 200 OK` on protected metrics)
7. Doctor Search and Department Filtering
8. Atomic Appointment Booking
9. **Double-Booking Prevention (`HTTP 409 Conflict` on concurrent booking)**
10. **Appointment Cancellation & Slot Liberation (Slot immediately available for re-booking)**
11. Appointment Rescheduling
12. Doctor Weekly Schedule Management
13. Admin User Management & Account Status Toggle
14. Appointment Status Updates with Clinical Notes
15. Relational Database Persistence Across Queries
16. Admin CSV Report Generation and Export

*Detailed logs and proof are documented in [TEST_RESULTS.md](./TEST_RESULTS.md).*

---

## 7. Project Documentation Index

* [`PROJECT_ANALYSIS.md`](./PROJECT_ANALYSIS.md) - Requirements analysis and source document reconciliation.
* [`ARCHITECTURE.md`](./ARCHITECTURE.md) - System architecture and concurrency control.
* [`DATABASE_SCHEMA.md`](./DATABASE_SCHEMA.md) - Normalized 7-table schema, relationships, and constraints.
* [`TEST_CASES.md`](./TEST_CASES.md) - Test cases specification.
* [`TEST_RESULTS.md`](./TEST_RESULTS.md) - Official execution results report (16/16 Passed).
* [`DEPLOYMENT.md`](./DEPLOYMENT.md) - Local, ngrok tunneling, and production deployment guide.

---

## 8. Academic Integrity & License

This project is licensed under the MIT License. All data, medical scenarios, and doctor profiles are entirely fictional and designed exclusively for academic evaluation.
