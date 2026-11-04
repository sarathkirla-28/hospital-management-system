# System Architecture & Technical Specifications

**Project:** Intelligent Hospital Management System (Hospital Appointment Booking System)  
**Developer:** Sarathkirla (`sarathkirla-28`, Regd. No: 2023006411)  
**Institution:** GITAM School of Computer Science & Engineering, Visakhapatnam  
**Internship:** Yalamanchili Software Exports Private Limited  

---

## 1. Architectural Evolution & Technical Disclosure

### Baseline Presentation Specification
The original academic presentation (`Sarath internship ppt -6411.pptx`) defines:
* **Frontend:** HTML & CSS
* **Backend:** Java Servlets
* **Database:** SQL Database
* **Local Web Server:** Apache Tomcat on port 8082
* **Demonstration Tunneling:** ngrok

### Implemented Production Architecture
To deliver a high-performance, responsive, zero-friction, modern web application suitable for public cloud hosting and automated CI/CD:
* **Frontend Tier:** React 19 Single Page Application (SPA) bundled with Vite, styled with custom hospital-themed CSS design tokens, Lucide medical icons, and Chart.js for data visualization.
* **Backend Tier:** Node.js with Express 5 RESTful API, structured into modular controllers, routes, and security middlewares.
* **Database Tier:** Relational SQL schema with ACID transactional integrity. Uses `better-sqlite3` locally for immediate zero-configuration operation and supports PostgreSQL via `pg` pool when `DATABASE_URL` is set in production.
* **Port Compatibility:** Configured to run on **port 8082** locally, preserving fidelity with Slide 9 of the internship presentation.
* **Resilient Dual-Mode Execution:** The frontend features an integrated, persistent local data layer (`LocalDataStore`) that mirrors every backend endpoint. This ensures that the application runs with 100% full functionality even when hosted statically (e.g., GitHub Pages) or offline, while seamlessly integrating with the live REST backend whenever available.

---

## 2. System Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                  CLIENT TIER                                      |
|                                                                                   |
|  +--------------------+  +--------------------+  +--------------------+           |
|  |   Public Portal    |  |   Patient Portal   |  |   Doctor Portal    |           |
|  | (Home, About, Dept,|  | (Booking Wizard,   |  | (Queue, Diagnosis, |           |
|  |  Doctors, Contact) |  |  History, Profile) |  |  Schedules, Avail) |           |
|  +--------------------+  +--------------------+  +--------------------+           |
|                                     |                                             |
|                          +--------------------+                                   |
|                          |    Admin Console   | (Student Primary Focus)           |
|                          | (Metrics, Patients,|                                   |
|                          |  Doctors, CSV Rpt) |                                   |
|                          +--------------------+                                   |
|                                     |                                             |
|                          +--------------------+                                   |
|                          |     API Layer      |                                   |
|                          | (Dual-Mode Engine) |                                   |
|                          +--------------------+                                   |
+-------------------------------------|---------------------------------------------+
                                      | HTTP/REST (Port 8082)
+-------------------------------------v---------------------------------------------+
|                                 SERVER TIER                                       |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                     Express Server (CORS, JSON Parser)                      |  |
|  +-----------------------------------------------------------------------------+  |
|           |                       |                         |                     |
|  +-----------------+    +-------------------+    +--------------------+           |
|  | Auth Middleware |    | Public & Patient  |    | Doctor & Admin     |           |
|  |  (JWT & RBAC)   |    |    Controllers    |    |   Controllers      |           |
|  +-----------------+    +-------------------+    +--------------------+           |
|                                   |                                               |
+-----------------------------------|-----------------------------------------------+
                                    | SQL Queries & Transactions
+-----------------------------------v-----------------------------------------------+
|                                DATABASE TIER                                      |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  | Normalized Tables: users, patients, doctors, departments, doctor_schedules,  |  |
|  |                    appointments, appointment_status_history                 |  |
|  +-----------------------------------------------------------------------------+  |
|  | CRITICAL CONSTRAINT: UNIQUE(doctor_id, appointment_date, slot_time)         |  |
|  |                      WHERE status != 'Cancelled'                            |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 3. Concurrency Control & Double-Booking Prevention

### The Problem
In hospital booking systems, two patients viewing the same doctor's schedule simultaneously may click "Confirm Appointment" for the same time slot at the exact same millisecond. Frontend checks alone fail under concurrent load.

### Implemented Solution
Double-booking prevention is enforced through a two-stage defense:

1. **Database-Level Partial Unique Index:**
   ```sql
   CREATE UNIQUE INDEX idx_unique_active_booking 
   ON appointments (doctor_id, appointment_date, slot_time) 
   WHERE status != 'Cancelled';
   ```
   * Any attempt to insert or update an active appointment for an already-occupied doctor slot fails at the database storage engine.
   * When an appointment is cancelled, it leaves the partial index, automatically liberating the slot for other patients.

2. **Atomic Transactional Rollback:**
   ```javascript
   await db.transaction(async (tx) => {
     const existing = tx.get(
       `SELECT id FROM appointments 
        WHERE doctor_id = ? AND appointment_date = ? AND slot_time = ? AND status != 'Cancelled'`,
       [doctor_id, appointment_date, slot_time]
     );
     if (existing) throw new Error('SLOT_ALREADY_BOOKED');
     
     // Insert appointment & record audit trail atomically
   });
   ```
   * If a conflict occurs, the database transaction rolls back cleanly, returning **HTTP 409 Conflict** with an informative error message.

---

## 4. Security & Role-Based Access Control (RBAC)

1. **Password Hashing:** Passwords are cryptographically salted and hashed using `bcrypt` (10 rounds). Plaintext passwords are never stored or logged.
2. **Stateless JWT Authorization:** Tokens encode user IDs and roles (`patient`, `doctor`, `admin`) with a 7-day expiration.
3. **Role Enforcement Middleware:** Endpoints are protected by `requireRole(['admin'])` or `requireRole(['doctor', 'admin'])`. Patients attempting to query doctor lists or admin metrics receive immediate HTTP 403 Forbidden responses.
4. **Audit Trail Logging:** All appointment state transitions are recorded with user ID, previous status, new status, timestamp, and clinical notes in `appointment_status_history`.
