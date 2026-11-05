const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

// POST /api/auth/register (Patient Registration)
router.post('/register', async (req, res) => {
  try {
    const { full_name, email, password, phone, dob, gender, blood_group, address, emergency_contact } = req.body;

    // Server-side validation
    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'Full name, email, and password are required fields.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // Check if email already registered
    const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Atomic transaction for creating User and Patient profile
    const result = await db.transaction(async (tx) => {
      const userRes = await tx.run(
        `INSERT INTO users (email, password_hash, role, full_name, phone, status)
         VALUES (?, ?, 'patient', ?, ?, 'active')`,
        [email.toLowerCase().trim(), password_hash, full_name.trim(), phone || null]
      );

      const userId = userRes.lastInsertRowid;

      const patientRes = await tx.run(
        `INSERT INTO patients (user_id, dob, gender, blood_group, address, emergency_contact)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, dob || null, gender || null, blood_group || null, address || null, emergency_contact || null]
      );

      return { userId, patientId: patientRes.lastInsertRowid };
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: result.userId, role: 'patient' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful! Welcome to Intelligent Hospital Management.',
      token,
      user: {
        id: result.userId,
        patient_id: result.patientId,
        full_name: full_name.trim(),
        email: email.toLowerCase().trim(),
        role: 'patient'
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to complete registration due to server error.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password, requested_role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await db.get(
      'SELECT id, email, password_hash, role, full_name, phone, status FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ error: 'This account has been deactivated. Please contact administration.' });
    }

    // Role check if user selected a specific portal
    if (requested_role && requested_role !== user.role) {
      return res.status(403).json({
        error: `Role mismatch: This account has '${user.role}' credentials, but '${requested_role}' portal was requested.`
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Fetch role-specific details
    let roleDetails = {};
    if (user.role === 'patient') {
      const patient = await db.get('SELECT * FROM patients WHERE user_id = ?', [user.id]);
      roleDetails = { patient_id: patient ? patient.id : null, profile: patient };
    } else if (user.role === 'doctor') {
      const doctor = await db.get(
        `SELECT d.*, dept.name as department_name 
         FROM doctors d 
         JOIN departments dept ON d.department_id = dept.id 
         WHERE d.user_id = ?`,
        [user.id]
      );
      roleDetails = { doctor_id: doctor ? doctor.id : null, doctor };
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
        phone: user.phone,
        ...roleDetails
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    let roleDetails = {};
    if (req.user.role === 'patient') {
      const patient = await db.get('SELECT * FROM patients WHERE user_id = ?', [req.user.id]);
      roleDetails = { patient_id: patient ? patient.id : null, profile: patient };
    } else if (req.user.role === 'doctor') {
      const doctor = await db.get(
        `SELECT d.*, dept.name as department_name 
         FROM doctors d 
         JOIN departments dept ON d.department_id = dept.id 
         WHERE d.user_id = ?`,
        [req.user.id]
      );
      roleDetails = { doctor_id: doctor ? doctor.id : null, doctor };
    }

    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        full_name: req.user.full_name,
        phone: req.user.phone,
        status: req.user.status,
        ...roleDetails
      }
    });
  } catch (err) {
    console.error('Auth check error:', err);
    res.status(500).json({ error: 'Failed to verify session' });
  }
});

module.exports = router;
