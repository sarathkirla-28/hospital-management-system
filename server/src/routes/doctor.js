const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);
router.use(requireRole(['doctor']));

// GET /api/doctor/profile
router.get('/profile', async (req, res) => {
  try {
    const doctor = await db.get(
      `SELECT d.*, u.full_name, u.email, u.phone, dept.name as department_name, dept.code as department_code
       FROM doctors d
       JOIN users u ON d.user_id = u.id
       JOIN departments dept ON d.department_id = dept.id
       WHERE d.id = ?`,
      [req.doctorId]
    );

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor profile not found.' });
    }

    const schedules = await db.all(
      'SELECT * FROM doctor_schedules WHERE doctor_id = ? ORDER BY id ASC',
      [req.doctorId]
    );

    res.json({ doctor, schedules });
  } catch (err) {
    console.error('Error fetching doctor profile:', err);
    res.status(500).json({ error: 'Failed to fetch doctor profile' });
  }
});

// GET /api/doctor/appointments
router.get('/appointments', async (req, res) => {
  try {
    const { date, status } = req.query;

    let sql = `
      SELECT 
        a.id, a.appointment_number, a.appointment_date, a.slot_time, a.status,
        a.patient_symptoms, a.doctor_notes, a.created_at,
        p.id as patient_id, p.dob as patient_dob, p.gender as patient_gender,
        p.blood_group as patient_blood, p.emergency_contact,
        u_pat.full_name as patient_name, u_pat.phone as patient_phone, u_pat.email as patient_email
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users u_pat ON p.user_id = u_pat.id
      WHERE a.doctor_id = ?
    `;
    const params = [req.doctorId];

    if (date) {
      sql += ' AND a.appointment_date = ?';
      params.push(date);
    }

    if (status) {
      sql += ' AND a.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY a.appointment_date DESC, a.slot_time ASC';

    const appointments = await db.all(sql, params);
    res.json({ appointments });
  } catch (err) {
    console.error('Error fetching doctor appointments:', err);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// PUT /api/doctor/appointments/:id/status
router.put('/appointments/:id/status', async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const { status, doctor_notes } = req.body;

    const validStatuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const appointment = await db.get(
      'SELECT id, doctor_id, status FROM appointments WHERE id = ?',
      [appointmentId]
    );

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }

    if (appointment.doctor_id !== req.doctorId) {
      return res.status(403).json({ error: 'Unauthorized to update this appointment.' });
    }

    await db.transaction(async (tx) => {
      await tx.run(
        `UPDATE appointments 
         SET status = ?, doctor_notes = COALESCE(?, doctor_notes), updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [status, doctor_notes || null, appointmentId]
      );

      await tx.run(
        `INSERT INTO appointment_status_history (appointment_id, previous_status, new_status, changed_by_user_id, comments)
         VALUES (?, ?, ?, ?, ?)`,
        [appointmentId, appointment.status, status, req.user.id, `Status updated by Doctor (${req.user.full_name})`]
      );
    });

    res.json({ message: `Appointment status updated to ${status}.` });
  } catch (err) {
    console.error('Error updating appointment status:', err);
    res.status(500).json({ error: 'Failed to update status.' });
  }
});

// PUT /api/doctor/availability
router.put('/availability', async (req, res) => {
  try {
    const { is_available } = req.body;
    const availVal = !!is_available;

    await db.run(
      'UPDATE doctors SET is_available = ? WHERE id = ?',
      [availVal, req.doctorId]
    );

    res.json({
      message: `Availability updated to ${is_available ? 'Available' : 'Unavailable'}.`,
      is_available: !!availVal
    });
  } catch (err) {
    console.error('Error updating doctor availability:', err);
    res.status(500).json({ error: 'Failed to update availability.' });
  }
});

// POST /api/doctor/schedules
router.post('/schedules', async (req, res) => {
  try {
    const { schedules } = req.body; // array of { day_of_week, start_time, end_time, slot_duration_minutes }

    if (!Array.isArray(schedules)) {
      return res.status(400).json({ error: 'schedules must be an array.' });
    }

    await db.transaction(async (tx) => {
      // Clear existing schedules for this doctor
      await tx.run('DELETE FROM doctor_schedules WHERE doctor_id = ?', [req.doctorId]);

      for (const s of schedules) {
        await tx.run(
          `INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, slot_duration_minutes, is_active)
           VALUES (?, ?, ?, ?, ?, true)`,
          [req.doctorId, s.day_of_week, s.start_time, s.end_time, s.slot_duration_minutes || 30]
        );
      }
    });

    res.json({ message: 'Doctor consultation schedule updated successfully.' });
  } catch (err) {
    console.error('Error saving doctor schedules:', err);
    res.status(500).json({ error: 'Failed to update schedule.' });
  }
});

module.exports = router;
