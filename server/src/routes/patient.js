const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

// All routes in this file require patient authentication
router.use(authenticateToken);
router.use(requireRole(['patient']));

// GET /api/patient/profile
router.get('/profile', async (req, res) => {
  try {
    const patient = await db.get(
      `SELECT p.*, u.full_name, u.email, u.phone 
       FROM patients p 
       JOIN users u ON p.user_id = u.id 
       WHERE p.id = ?`,
      [req.patientId]
    );

    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found.' });
    }

    res.json({ patient });
  } catch (err) {
    console.error('Error fetching patient profile:', err);
    res.status(500).json({ error: 'Failed to fetch patient profile' });
  }
});

// PUT /api/patient/profile
router.put('/profile', async (req, res) => {
  try {
    const { full_name, phone, dob, gender, blood_group, address, emergency_contact } = req.body;

    await db.transaction(async (tx) => {
      tx.run(
        'UPDATE users SET full_name = ?, phone = ? WHERE id = ?',
        [full_name, phone, req.user.id]
      );

      tx.run(
        `UPDATE patients 
         SET dob = ?, gender = ?, blood_group = ?, address = ?, emergency_contact = ? 
         WHERE id = ?`,
        [dob, gender, blood_group, address, emergency_contact, req.patientId]
      );
    });

    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Error updating patient profile:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// GET /api/patient/appointments
router.get('/appointments', async (req, res) => {
  try {
    const appointments = await db.all(
      `SELECT 
        a.id, a.appointment_number, a.appointment_date, a.slot_time, a.status,
        a.patient_symptoms, a.doctor_notes, a.created_at,
        doc.id as doctor_id, doc.specialization, doc.room_number, doc.consultation_fee,
        u_doc.full_name as doctor_name, u_doc.phone as doctor_phone,
        dept.id as department_id, dept.name as department_name
       FROM appointments a
       JOIN doctors doc ON a.doctor_id = doc.id
       JOIN users u_doc ON doc.user_id = u_doc.id
       JOIN departments dept ON a.department_id = dept.id
       WHERE a.patient_id = ?
       ORDER BY a.appointment_date DESC, a.slot_time DESC`,
      [req.patientId]
    );

    res.json({ appointments });
  } catch (err) {
    console.error('Error fetching patient appointments:', err);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// POST /api/patient/appointments (Book Appointment with strict double-booking prevention)
router.post('/appointments', async (req, res) => {
  try {
    const { doctor_id, appointment_date, slot_time, symptoms } = req.body;

    if (!doctor_id || !appointment_date || !slot_time) {
      return res.status(400).json({ error: 'Doctor, appointment date, and time slot are required.' });
    }

    // Verify date is not in the past
    const todayStr = new Date().toISOString().split('T')[0];
    if (appointment_date < todayStr) {
      return res.status(400).json({ error: 'Cannot book appointments for past dates.' });
    }

    // Verify doctor exists and is active
    const doctor = await db.get(
      `SELECT d.id, d.department_id, d.is_available, u.full_name, u.status 
       FROM doctors d 
       JOIN users u ON d.user_id = u.id 
       WHERE d.id = ?`,
      [doctor_id]
    );

    if (!doctor || doctor.status !== 'active' || !doctor.is_available) {
      return res.status(400).json({ error: 'The selected doctor is currently not accepting appointments.' });
    }

    // Atomic Booking Transaction with Double Booking Protection
    let newAppointment;
    try {
      newAppointment = await db.transaction(async (tx) => {
        // 1. Check if slot is already occupied
        const existing = tx.get(
          `SELECT id FROM appointments 
           WHERE doctor_id = ? AND appointment_date = ? AND slot_time = ? AND status != 'Cancelled'`,
          [doctor_id, appointment_date, slot_time]
        );

        if (existing) {
          throw new Error('SLOT_ALREADY_BOOKED');
        }

        // 2. Generate unique appointment number
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const appNumber = `APT-${new Date().getFullYear()}-${randomSuffix}`;

        // 3. Insert appointment
        const appRes = tx.run(
          `INSERT INTO appointments (appointment_number, patient_id, doctor_id, department_id, appointment_date, slot_time, status, patient_symptoms)
           VALUES (?, ?, ?, ?, ?, ?, 'Confirmed', ?)`,
          [appNumber, req.patientId, doctor_id, doctor.department_id, appointment_date, slot_time, symptoms || null]
        );

        // 4. Log status history
        tx.run(
          `INSERT INTO appointment_status_history (appointment_id, previous_status, new_status, changed_by_user_id, comments)
           VALUES (?, NULL, 'Confirmed', ?, 'Appointment booked online by patient')`,
          [appRes.lastInsertRowid, req.user.id]
        );

        return {
          id: appRes.lastInsertRowid,
          appointment_number: appNumber,
          doctor_name: doctor.full_name,
          appointment_date,
          slot_time,
          status: 'Confirmed'
        };
      });
    } catch (txErr) {
      if (txErr.message === 'SLOT_ALREADY_BOOKED' || txErr.message.includes('UNIQUE constraint failed') || txErr.message.includes('duplicate key')) {
        return res.status(409).json({
          error: 'This time slot is already booked. Please select another time slot or date.'
        });
      }
      throw txErr;
    }

    res.status(201).json({
      message: 'Appointment booked successfully!',
      appointment: newAppointment
    });
  } catch (err) {
    console.error('Error booking appointment:', err);
    res.status(500).json({ error: 'Failed to complete appointment booking. Please try again.' });
  }
});

// PUT /api/patient/appointments/:id/cancel
router.put('/appointments/:id/cancel', async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const { reason } = req.body;

    const appointment = await db.get(
      'SELECT id, patient_id, status FROM appointments WHERE id = ?',
      [appointmentId]
    );

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }

    if (appointment.patient_id !== req.patientId) {
      return res.status(403).json({ error: 'Unauthorized to cancel this appointment.' });
    }

    if (appointment.status === 'Cancelled') {
      return res.status(400).json({ error: 'This appointment is already cancelled.' });
    }

    if (appointment.status === 'Completed') {
      return res.status(400).json({ error: 'Completed appointments cannot be cancelled.' });
    }

    await db.transaction(async (tx) => {
      tx.run(
        "UPDATE appointments SET status = 'Cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [appointmentId]
      );

      tx.run(
        `INSERT INTO appointment_status_history (appointment_id, previous_status, new_status, changed_by_user_id, comments)
         VALUES (?, ?, 'Cancelled', ?, ?)`,
        [appointmentId, appointment.status, req.user.id, reason || 'Cancelled by patient']
      );
    });

    res.json({
      message: 'Appointment successfully cancelled. The time slot is now available again.',
      appointmentId
    });
  } catch (err) {
    console.error('Error cancelling appointment:', err);
    res.status(500).json({ error: 'Failed to cancel appointment.' });
  }
});

// PUT /api/patient/appointments/:id/reschedule
router.put('/appointments/:id/reschedule', async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const { new_date, new_slot } = req.body;

    if (!new_date || !new_slot) {
      return res.status(400).json({ error: 'New appointment date and time slot are required.' });
    }

    const appointment = await db.get(
      'SELECT id, patient_id, doctor_id, status FROM appointments WHERE id = ?',
      [appointmentId]
    );

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }

    if (appointment.patient_id !== req.patientId) {
      return res.status(403).json({ error: 'Unauthorized to reschedule this appointment.' });
    }

    if (appointment.status === 'Cancelled' || appointment.status === 'Completed') {
      return res.status(400).json({ error: `Cannot reschedule an appointment that is already ${appointment.status}.` });
    }

    // Atomic reschedule
    try {
      await db.transaction(async (tx) => {
        // Check slot availability
        const slotCheck = tx.get(
          `SELECT id FROM appointments 
           WHERE doctor_id = ? AND appointment_date = ? AND slot_time = ? AND status != 'Cancelled' AND id != ?`,
          [appointment.doctor_id, new_date, new_slot, appointmentId]
        );

        if (slotCheck) {
          throw new Error('SLOT_OCCUPIED');
        }

        tx.run(
          `UPDATE appointments 
           SET appointment_date = ?, slot_time = ?, status = 'Confirmed', updated_at = CURRENT_TIMESTAMP 
           WHERE id = ?`,
          [new_date, new_slot, appointmentId]
        );

        tx.run(
          `INSERT INTO appointment_status_history (appointment_id, previous_status, new_status, changed_by_user_id, comments)
           VALUES (?, ?, 'Confirmed', ?, 'Rescheduled by patient')`,
          [appointmentId, appointment.status, req.user.id]
        );
      });
    } catch (txErr) {
      if (txErr.message === 'SLOT_OCCUPIED' || txErr.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ error: 'The requested new slot is not available. Please pick another time.' });
      }
      throw txErr;
    }

    res.json({ message: 'Appointment rescheduled successfully!' });
  } catch (err) {
    console.error('Error rescheduling appointment:', err);
    res.status(500).json({ error: 'Failed to reschedule appointment.' });
  }
});

module.exports = router;
