const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

// All routes in this router require Admin authorization
router.use(authenticateToken);
router.use(requireRole(['admin']));

// GET /api/admin/metrics
router.get('/metrics', async (req, res) => {
  try {
    // Metric counts
    const patientsCount = await db.get("SELECT COUNT(*) as count FROM patients");
    const doctorsCount = await db.get("SELECT COUNT(*) as count FROM doctors");
    const totalAppointments = await db.get("SELECT COUNT(*) as count FROM appointments");
    const pendingAppointments = await db.get("SELECT COUNT(*) as count FROM appointments WHERE status = 'Pending'");
    const confirmedAppointments = await db.get("SELECT COUNT(*) as count FROM appointments WHERE status = 'Confirmed'");
    const completedAppointments = await db.get("SELECT COUNT(*) as count FROM appointments WHERE status = 'Completed'");
    const cancelledAppointments = await db.get("SELECT COUNT(*) as count FROM appointments WHERE status = 'Cancelled'");

    // Department breakdown for analytics charts
    const departmentStats = await db.all(
      `SELECT dept.name, COUNT(a.id) as appointment_count
       FROM departments dept
       LEFT JOIN appointments a ON dept.id = a.department_id
       GROUP BY dept.id, dept.name
       ORDER BY appointment_count DESC`
    );

    // Recent 7-day appointment trend
    const recentTrends = await db.all(
      `SELECT appointment_date as date, COUNT(*) as count
       FROM appointments
       GROUP BY appointment_date
       ORDER BY appointment_date DESC
       LIMIT 7`
    );

    // Recent audit activity feed
    const recentActivity = await db.all(
      `SELECT 
        h.id, h.previous_status, h.new_status, h.comments, h.changed_at,
        a.appointment_number, a.appointment_date, a.slot_time,
        u_patient.full_name as patient_name,
        u_doctor.full_name as doctor_name
       FROM appointment_status_history h
       JOIN appointments a ON h.appointment_id = a.id
       JOIN patients p ON a.patient_id = p.id
       JOIN users u_patient ON p.user_id = u_patient.id
       JOIN doctors d ON a.doctor_id = d.id
       JOIN users u_doctor ON d.user_id = u_doctor.id
       ORDER BY h.changed_at DESC
       LIMIT 8`
    );

    res.json({
      metrics: {
        totalPatients: patientsCount ? patientsCount.count : 0,
        totalDoctors: doctorsCount ? doctorsCount.count : 0,
        totalAppointments: totalAppointments ? totalAppointments.count : 0,
        pendingAppointments: pendingAppointments ? pendingAppointments.count : 0,
        confirmedAppointments: confirmedAppointments ? confirmedAppointments.count : 0,
        completedAppointments: completedAppointments ? completedAppointments.count : 0,
        cancelledAppointments: cancelledAppointments ? cancelledAppointments.count : 0
      },
      charts: {
        departmentStats,
        recentTrends: recentTrends.reverse()
      },
      recentActivity
    });
  } catch (err) {
    console.error('Error fetching admin metrics:', err);
    res.status(500).json({ error: 'Failed to fetch admin metrics' });
  }
});

// GET /api/admin/users/patients (User Management - Patients)
router.get('/users/patients', async (req, res) => {
  try {
    const { search, status } = req.query;

    let sql = `
      SELECT 
        u.id as user_id, u.email, u.full_name, u.phone, u.status, u.created_at,
        p.id as patient_id, p.dob, p.gender, p.blood_group, p.address, p.emergency_contact,
        COUNT(a.id) as total_bookings
      FROM patients p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN appointments a ON p.id = a.patient_id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ' AND (u.full_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status) {
      sql += ' AND u.status = ?';
      params.push(status);
    }

    sql += ' GROUP BY p.id ORDER BY u.created_at DESC';

    const patients = await db.all(sql, params);
    res.json({ patients });
  } catch (err) {
    console.error('Error fetching patients for admin:', err);
    res.status(500).json({ error: 'Failed to fetch patients list' });
  }
});

// PUT /api/admin/users/:id/status (Activate / Deactivate account)
router.put('/users/:id/status', async (req, res) => {
  try {
    const userId = req.params.id;
    const { status } = req.body;

    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value.' });
    }

    const user = await db.get('SELECT id, role, email FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ error: 'Cannot deactivate an administrator account.' });
    }

    await db.run('UPDATE users SET status = ? WHERE id = ?', [status, userId]);

    res.json({ message: `User account status updated to ${status}.` });
  } catch (err) {
    console.error('Error toggling user status:', err);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// GET /api/admin/doctors (Doctor Management)
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await db.all(
      `SELECT 
        d.id, d.specialization, d.qualification, d.experience_years, 
        d.consultation_fee, d.room_number, d.bio, d.is_available,
        u.id as user_id, u.full_name, u.email, u.phone, u.status,
        dept.id as department_id, dept.name as department_name,
        COUNT(a.id) as total_appointments
       FROM doctors d
       JOIN users u ON d.user_id = u.id
       JOIN departments dept ON d.department_id = dept.id
       LEFT JOIN appointments a ON d.id = a.doctor_id
       GROUP BY d.id
       ORDER BY d.id ASC`
    );

    res.json({ doctors });
  } catch (err) {
    console.error('Error fetching doctors for admin:', err);
    res.status(500).json({ error: 'Failed to fetch doctors list' });
  }
});

// POST /api/admin/doctors (Add New Doctor)
router.post('/doctors', async (req, res) => {
  try {
    const {
      full_name, email, password, phone, department_id,
      specialization, qualification, experience_years, consultation_fee, room_number, bio
    } = req.body;

    if (!full_name || !email || !password || !department_id || !specialization) {
      return res.status(400).json({ error: 'Full name, email, password, department, and specialization are required.' });
    }

    const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const result = await db.transaction(async (tx) => {
      const userRes = await tx.run(
        `INSERT INTO users (email, password_hash, role, full_name, phone, status)
         VALUES (?, ?, 'doctor', ?, ?, 'active')`,
        [email.toLowerCase().trim(), password_hash, full_name.trim(), phone || null]
      );

      const userId = userRes.lastInsertRowid;

      const docRes = await tx.run(
        `INSERT INTO doctors (user_id, department_id, specialization, qualification, experience_years, consultation_fee, room_number, bio, is_available)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, true)`,
        [
          userId,
          department_id,
          specialization.trim(),
          qualification || 'MD',
          Number(experience_years) || 1,
          Number(consultation_fee) || 50.00,
          room_number || 'Room 101',
          bio || ''
        ]
      );

      const docId = docRes.lastInsertRowid;

      // Seed default schedule (Monday - Friday 09:00 - 13:00)
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      for (const d of days) {
        await tx.run(
          `INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, slot_duration_minutes, is_active)
           VALUES (?, ?, '09:00', '13:00', 30, true)`,
          [docId, d]
        );
      }

      return { docId, userId };
    });

    res.status(201).json({
      message: 'New doctor added successfully with default weekly schedule.',
      doctorId: result.docId
    });
  } catch (err) {
    console.error('Error adding doctor:', err);
    res.status(500).json({ error: 'Failed to add doctor.' });
  }
});

// PUT /api/admin/doctors/:id (Edit Doctor)
router.put('/doctors/:id', async (req, res) => {
  try {
    const doctorId = req.params.id;
    const {
      full_name, phone, department_id, specialization, qualification,
      experience_years, consultation_fee, room_number, bio, is_available, status
    } = req.body;

    const doctor = await db.get('SELECT user_id FROM doctors WHERE id = ?', [doctorId]);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found.' });
    }

    await db.transaction(async (tx) => {
      await tx.run(
        'UPDATE users SET full_name = COALESCE(?, full_name), phone = COALESCE(?, phone), status = COALESCE(?, status) WHERE id = ?',
        [full_name, phone, status, doctor.user_id]
      );

      await tx.run(
        `UPDATE doctors 
         SET department_id = COALESCE(?, department_id),
             specialization = COALESCE(?, specialization),
             qualification = COALESCE(?, qualification),
             experience_years = COALESCE(?, experience_years),
             consultation_fee = COALESCE(?, consultation_fee),
             room_number = COALESCE(?, room_number),
             bio = COALESCE(?, bio),
             is_available = COALESCE(?, is_available)
         WHERE id = ?`,
        [department_id, specialization, qualification, experience_years, consultation_fee, room_number, bio, is_available !== undefined ? !!is_available : null, doctorId]
      );
    });

    res.json({ message: 'Doctor profile updated successfully.' });
  } catch (err) {
    console.error('Error updating doctor:', err);
    res.status(500).json({ error: 'Failed to update doctor profile.' });
  }
});

// GET /api/admin/appointments (Master Appointment Management)
router.get('/appointments', async (req, res) => {
  try {
    const { search, doctor_id, department_id, status, date } = req.query;

    let sql = `
      SELECT 
        a.id, a.appointment_number, a.appointment_date, a.slot_time, a.status,
        a.patient_symptoms, a.doctor_notes, a.created_at,
        p.id as patient_id, u_pat.full_name as patient_name, u_pat.email as patient_email, u_pat.phone as patient_phone,
        d.id as doctor_id, u_doc.full_name as doctor_name, d.room_number,
        dept.id as department_id, dept.name as department_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users u_pat ON p.user_id = u_pat.id
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users u_doc ON d.user_id = u_doc.id
      JOIN departments dept ON a.department_id = dept.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ' AND (a.appointment_number LIKE ? OR u_pat.full_name LIKE ? OR u_doc.full_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (doctor_id) {
      sql += ' AND a.doctor_id = ?';
      params.push(doctor_id);
    }

    if (department_id) {
      sql += ' AND a.department_id = ?';
      params.push(department_id);
    }

    if (status) {
      sql += ' AND a.status = ?';
      params.push(status);
    }

    if (date) {
      sql += ' AND a.appointment_date = ?';
      params.push(date);
    }

    sql += ' ORDER BY a.appointment_date DESC, a.slot_time DESC';

    const appointments = await db.all(sql, params);
    res.json({ appointments });
  } catch (err) {
    console.error('Error fetching admin appointments:', err);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// PUT /api/admin/appointments/:id/status (Administrative override)
router.put('/appointments/:id/status', async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const { status, notes } = req.body;

    const validStatuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const appointment = await db.get('SELECT id, status FROM appointments WHERE id = ?', [appointmentId]);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }

    await db.transaction(async (tx) => {
      await tx.run(
        'UPDATE appointments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, appointmentId]
      );

      await tx.run(
        `INSERT INTO appointment_status_history (appointment_id, previous_status, new_status, changed_by_user_id, comments)
         VALUES (?, ?, ?, ?, ?)`,
        [appointmentId, appointment.status, status, req.user.id, notes || `Status changed by Administrator (${req.user.full_name})`]
      );
    });

    res.json({ message: `Appointment status updated to ${status}.` });
  } catch (err) {
    console.error('Error updating appointment status by admin:', err);
    res.status(500).json({ error: 'Failed to update status.' });
  }
});

// GET /api/admin/export-csv (Reporting - CSV Export)
router.get('/export-csv', async (req, res) => {
  try {
    const appointments = await db.all(
      `SELECT 
        a.appointment_number,
        a.appointment_date,
        a.slot_time,
        a.status,
        dept.name as department,
        u_doc.full_name as doctor_name,
        d.room_number,
        u_pat.full_name as patient_name,
        u_pat.email as patient_email,
        u_pat.phone as patient_phone,
        a.created_at
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       JOIN users u_pat ON p.user_id = u_pat.id
       JOIN doctors d ON a.doctor_id = d.id
       JOIN users u_doc ON d.user_id = u_doc.id
       JOIN departments dept ON a.department_id = dept.id
       ORDER BY a.appointment_date DESC, a.slot_time DESC`
    );

    const headers = [
      'Appointment Number',
      'Date',
      'Time Slot',
      'Status',
      'Department',
      'Doctor Name',
      'Room',
      'Patient Name',
      'Patient Email',
      'Patient Phone',
      'Booked At'
    ];

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = appointments.map(a => [
      escapeCsv(a.appointment_number),
      escapeCsv(a.appointment_date),
      escapeCsv(a.slot_time),
      escapeCsv(a.status),
      escapeCsv(a.department),
      escapeCsv(a.doctor_name),
      escapeCsv(a.room_number),
      escapeCsv(a.patient_name),
      escapeCsv(a.patient_email),
      escapeCsv(a.patient_phone),
      escapeCsv(a.created_at)
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\r\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="hospital_appointments_report.csv"');
    res.send(csvContent);
  } catch (err) {
    console.error('Error generating CSV export:', err);
    res.status(500).json({ error: 'Failed to generate CSV export.' });
  }
});

// POST /api/admin/departments (Add New Department)
router.post('/departments', async (req, res) => {
  try {
    const { name, code, description, head_doctor } = req.body;
    if (!name || !code) {
      return res.status(400).json({ error: 'Department name and code are required.' });
    }

    const existing = await db.get('SELECT id FROM departments WHERE code = ? OR name = ?', [code.toUpperCase().trim(), name.trim()]);
    if (existing) {
      return res.status(409).json({ error: 'A department with this name or code already exists.' });
    }

    const result = await db.run(
      'INSERT INTO departments (name, code, description, head_doctor) VALUES (?, ?, ?, ?)',
      [name.trim(), code.toUpperCase().trim(), description || null, head_doctor || null]
    );

    res.status(201).json({
      message: 'Department created successfully.',
      departmentId: result.lastInsertRowid
    });
  } catch (err) {
    console.error('Error creating department:', err);
    res.status(500).json({ error: 'Failed to create department.' });
  }
});

module.exports = router;
