const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'hospital_secure_jwt_secret_demo_2026';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  jwt.verify(token, JWT_SECRET, async (err, userPayload) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired authentication token' });
    }

    try {
      const user = await db.get(
        'SELECT id, email, role, full_name, phone, status FROM users WHERE id = ?',
        [userPayload.userId]
      );

      if (!user) {
        return res.status(404).json({ error: 'User account not found' });
      }

      if (user.status !== 'active') {
        return res.status(403).json({ error: 'User account has been deactivated' });
      }

      req.user = user;

      // Attach patient_id or doctor_id if applicable
      if (user.role === 'patient') {
        const patient = await db.get('SELECT id FROM patients WHERE user_id = ?', [user.id]);
        req.patientId = patient ? patient.id : null;
      } else if (user.role === 'doctor') {
        const doctor = await db.get('SELECT id, department_id FROM doctors WHERE user_id = ?', [user.id]);
        req.doctorId = doctor ? doctor.id : null;
        req.doctorDeptId = doctor ? doctor.department_id : null;
      }

      next();
    } catch (dbErr) {
      console.error('Auth middleware database error:', dbErr);
      return res.status(500).json({ error: 'Internal authentication server error' });
    }
  });
}

function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]. Current role: ${req.user.role}`
      });
    }

    next();
  };
}

module.exports = {
  authenticateToken,
  requireRole,
  JWT_SECRET
};
