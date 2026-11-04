const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/public/departments
router.get('/departments', async (req, res) => {
  try {
    const departments = await db.all(
      `SELECT d.*, COUNT(doc.id) as doctor_count 
       FROM departments d
       LEFT JOIN doctors doc ON d.id = doc.department_id AND doc.is_available = 1
       GROUP BY d.id
       ORDER BY d.name ASC`
    );
    res.json({ departments });
  } catch (err) {
    console.error('Error fetching departments:', err);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

// GET /api/public/doctors
router.get('/doctors', async (req, res) => {
  try {
    const { department_id, search } = req.query;

    let sql = `
      SELECT 
        d.id, d.specialization, d.qualification, d.experience_years, 
        d.consultation_fee, d.room_number, d.bio, d.is_available,
        u.full_name, u.email, u.phone,
        dept.id as department_id, dept.name as department_name, dept.code as department_code
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      JOIN departments dept ON d.department_id = dept.id
      WHERE u.status = 'active'
    `;
    const params = [];

    if (department_id) {
      sql += ' AND d.department_id = ?';
      params.push(department_id);
    }

    if (search) {
      sql += ' AND (u.full_name LIKE ? OR d.specialization LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY d.experience_years DESC';

    const doctors = await db.all(sql, params);

    // Fetch schedules for each doctor
    for (const doc of doctors) {
      const schedules = await db.all(
        'SELECT day_of_week, start_time, end_time, slot_duration_minutes FROM doctor_schedules WHERE doctor_id = ? AND is_active = 1',
        [doc.id]
      );
      doc.schedules = schedules;
    }

    res.json({ doctors });
  } catch (err) {
    console.error('Error fetching doctors:', err);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

// GET /api/public/doctors/:id/available-slots?date=YYYY-MM-DD
router.get('/doctors/:id/available-slots', async (req, res) => {
  try {
    const doctorId = req.params.id;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Query parameter "date" (YYYY-MM-DD) is required.' });
    }

    // Verify doctor exists and is available
    const doctor = await db.get(
      'SELECT d.id, d.is_available, u.full_name FROM doctors d JOIN users u ON d.user_id = u.id WHERE d.id = ?',
      [doctorId]
    );

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found.' });
    }

    if (!doctor.is_available) {
      return res.json({
        available: false,
        message: `${doctor.full_name} is currently not taking appointments.`,
        slots: []
      });
    }

    // Determine Day of Week for selected date
    const selectedDate = new Date(date + 'T00:00:00');
    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format. Please use YYYY-MM-DD.' });
    }

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = days[selectedDate.getDay()];

    // Find schedule for that day
    const schedule = await db.get(
      'SELECT start_time, end_time, slot_duration_minutes FROM doctor_schedules WHERE doctor_id = ? AND day_of_week = ? AND is_active = 1',
      [doctorId, dayOfWeek]
    );

    if (!schedule) {
      return res.json({
        available: false,
        dayOfWeek,
        message: `${doctor.full_name} has no scheduled consultation hours on ${dayOfWeek}s.`,
        slots: []
      });
    }

    // Generate potential slots
    const parseMinutes = (timeStr) => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

    const formatMinutes = (totalMin) => {
      const h = Math.floor(totalMin / 60).toString().padStart(2, '0');
      const m = (totalMin % 60).toString().padStart(2, '0');
      return `${h}:${m}`;
    };

    const startMin = parseMinutes(schedule.start_time);
    const endMin = parseMinutes(schedule.end_time);
    const step = schedule.slot_duration_minutes || 30;

    const allSlots = [];
    for (let time = startMin; time < endMin; time += step) {
      allSlots.push(formatMinutes(time));
    }

    // Query already booked slots for this doctor and date (excluding Cancelled)
    const bookedAppointments = await db.all(
      `SELECT slot_time FROM appointments WHERE doctor_id = ? AND appointment_date = ? AND status != 'Cancelled'`,
      [doctorId, date]
    );

    const bookedSet = new Set(bookedAppointments.map(a => a.slot_time));

    const slotDetails = allSlots.map(slot => ({
      time: slot,
      isBooked: bookedSet.has(slot),
      available: !bookedSet.has(slot)
    }));

    res.json({
      available: true,
      dayOfWeek,
      schedule: {
        startTime: schedule.start_time,
        endTime: schedule.end_time,
        slotDuration: step
      },
      slots: slotDetails,
      totalSlots: slotDetails.length,
      availableCount: slotDetails.filter(s => s.available).length
    });
  } catch (err) {
    console.error('Error fetching available slots:', err);
    res.status(500).json({ error: 'Failed to calculate available appointment slots' });
  }
});

// GET /api/public/stats
router.get('/stats', async (req, res) => {
  try {
    const totalDoctors = await db.get("SELECT COUNT(*) as count FROM doctors WHERE is_available = 1");
    const totalDepartments = await db.get("SELECT COUNT(*) as count FROM departments");
    const totalAppointments = await db.get("SELECT COUNT(*) as count FROM appointments WHERE status = 'Completed'");

    res.json({
      activeDoctors: totalDoctors ? totalDoctors.count : 0,
      departments: totalDepartments ? totalDepartments.count : 0,
      completedConsultations: totalAppointments ? totalAppointments.count : 0,
      satisfactionRate: '98.5%'
    });
  } catch (err) {
    console.error('Error fetching public stats:', err);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;
