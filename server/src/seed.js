const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('./db');

async function seedDatabase() {
  console.log('--- Initializing Database Schema ---');
  const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  // Split and execute statements
  const statements = schemaSql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (const statement of statements) {
    try {
      await db.run(statement);
    } catch (err) {
      // Ignore if index or table already exists
      if (!err.message.includes('already exists')) {
        console.warn('Schema execution warning:', err.message);
      }
    }
  }

  // Check if admin user already exists
  const existingAdmin = await db.get("SELECT id FROM users WHERE email = ?", ['admin@hospital.demo']);
  if (existingAdmin) {
    console.log('Database already initialized with seed data.');
    return;
  }

  console.log('--- Seeding Fictional Demonstration Data ---');

  // Password hashes
  const salt = await bcrypt.genSalt(10);
  const adminPass = await bcrypt.hash('Admin123!', salt);
  const doctorPass = await bcrypt.hash('Doctor123!', salt);
  const patientPass = await bcrypt.hash('Patient123!', salt);

  // 1. Insert Administrator
  const adminResult = await db.run(
    `INSERT INTO users (email, password_hash, role, full_name, phone, status)
     VALUES (?, ?, 'admin', 'Hospital Administrator', '+1-555-0100', 'active')`,
    ['admin@hospital.demo', adminPass]
  );
  console.log('Created Admin user (admin@hospital.demo)');

  // 2. Insert Departments
  const departmentsData = [
    { name: 'Cardiology', code: 'CARD', desc: 'Heart care, cardiovascular diagnostics, and hypertension management.', icon: 'HeartPulse', head: 'Dr. Anita Roy' },
    { name: 'Neurology', code: 'NEUR', desc: 'Brain, spinal cord disorders, and neurological rehabilitation.', icon: 'Brain', head: 'Dr. David Chen' },
    { name: 'Pediatrics', code: 'PED', desc: 'Child healthcare, vaccinations, and adolescent wellness.', icon: 'Baby', head: 'Dr. Sarah Johnson' },
    { name: 'Orthopedics', code: 'ORTH', desc: 'Bone, joint health, fracture care, and sports medicine.', icon: 'Bone', head: 'Dr. Rajesh Kumar' },
    { name: 'General Medicine', code: 'GMED', desc: 'Comprehensive primary care, chronic illness, and preventive medicine.', icon: 'Stethoscope', head: 'Dr. Marcus Vance' },
    { name: 'Dermatology', code: 'DERM', desc: 'Skin health, clinical dermatological therapies, and allergy care.', icon: 'Sparkles', head: 'Dr. Elena Rostova' },
    { name: 'Ophthalmology', code: 'OPHT', desc: 'Vision assessment, eye health diagnostics, and corrective care.', icon: 'Eye', head: 'Dr. Kevin Zhao' }
  ];

  const deptIds = {};
  for (const d of departmentsData) {
    const res = await db.run(
      `INSERT INTO departments (name, code, description, icon_name, head_doctor) VALUES (?, ?, ?, ?, ?)`,
      [d.name, d.code, d.desc, d.icon, d.head]
    );
    deptIds[d.name] = res.lastInsertRowid;
  }
  console.log(`Created ${departmentsData.length} Departments`);

  // 3. Insert Doctors
  const doctorsData = [
    {
      name: 'Dr. Anita Roy',
      email: 'dr.anita@hospital.demo',
      phone: '+1-555-0201',
      deptId: deptIds['Cardiology'],
      specialization: 'Interventional Cardiology',
      qualification: 'MBBS, MD (Cardiology), FACC',
      experience: 12,
      fee: 80.00,
      room: 'Room 301, Block A',
      bio: 'Senior cardiologist focusing on preventative cardiology, lipid disorders, and non-invasive cardiovascular imaging.',
      schedules: [
        { day: 'Monday', start: '09:00', end: '13:00' },
        { day: 'Wednesday', start: '09:00', end: '13:00' },
        { day: 'Friday', start: '09:00', end: '13:00' }
      ]
    },
    {
      name: 'Dr. David Chen',
      email: 'dr.david@hospital.demo',
      phone: '+1-555-0202',
      deptId: deptIds['Neurology'],
      specialization: 'Clinical Neurophysiology',
      qualification: 'MD, DM (Neurology)',
      experience: 10,
      fee: 95.00,
      room: 'Room 204, Block B',
      bio: 'Specialist in migraine management, neuromuscular disorders, and electrodiagnostic evaluations.',
      schedules: [
        { day: 'Tuesday', start: '10:00', end: '14:00' },
        { day: 'Thursday', start: '10:00', end: '14:00' },
        { day: 'Saturday', start: '09:00', end: '13:00' }
      ]
    },
    {
      name: 'Dr. Sarah Johnson',
      email: 'dr.sarah@hospital.demo',
      phone: '+1-555-0203',
      deptId: deptIds['Pediatrics'],
      specialization: 'Pediatric Care & Neonatology',
      qualification: 'MBBS, MD (Pediatrics)',
      experience: 8,
      fee: 65.00,
      room: 'Room 102, Block C',
      bio: 'Dedicated pediatrician providing developmental assessments, infant care, and pediatric health checkups.',
      schedules: [
        { day: 'Monday', start: '09:00', end: '12:00' },
        { day: 'Tuesday', start: '09:00', end: '12:00' },
        { day: 'Wednesday', start: '09:00', end: '12:00' },
        { day: 'Thursday', start: '09:00', end: '12:00' },
        { day: 'Friday', start: '09:00', end: '12:00' }
      ]
    },
    {
      name: 'Dr. Rajesh Kumar',
      email: 'dr.rajesh@hospital.demo',
      phone: '+1-555-0204',
      deptId: deptIds['Orthopedics'],
      specialization: 'Joint Replacement & Sports Medicine',
      qualification: 'MS (Orthopedics), MCh Ortho',
      experience: 14,
      fee: 85.00,
      room: 'Room 405, Block A',
      bio: 'Orthopedic specialist in joint preservation, arthritis care, and post-injury musculoskeletal recovery.',
      schedules: [
        { day: 'Monday', start: '11:00', end: '15:00' },
        { day: 'Wednesday', start: '11:00', end: '15:00' },
        { day: 'Saturday', start: '10:00', end: '14:00' }
      ]
    }
  ];

  const doctorMap = [];
  for (const d of doctorsData) {
    const userRes = await db.run(
      `INSERT INTO users (email, password_hash, role, full_name, phone, status) VALUES (?, ?, 'doctor', ?, ?, 'active')`,
      [d.email, doctorPass, d.name, d.phone]
    );
    const docRes = await db.run(
      `INSERT INTO doctors (user_id, department_id, specialization, qualification, experience_years, consultation_fee, room_number, bio, is_available)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [userRes.lastInsertRowid, d.deptId, d.specialization, d.qualification, d.experience, d.fee, d.room, d.bio]
    );

    const docId = docRes.lastInsertRowid;
    doctorMap.push({ id: docId, name: d.name, deptId: d.deptId });

    for (const s of d.schedules) {
      await db.run(
        `INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, slot_duration_minutes, is_active)
         VALUES (?, ?, ?, ?, 30, 1)`,
        [docId, s.day, s.start, s.end]
      );
    }
  }
  console.log(`Created ${doctorsData.length} Doctors with schedules`);

  // 4. Insert Patients
  const patientsData = [
    {
      name: 'John Smith',
      email: 'john.patient@hospital.demo',
      phone: '+1-555-0301',
      dob: '1988-04-12',
      gender: 'Male',
      blood: 'O+',
      address: '742 Evergreen Terrace, Springfield',
      emergency: 'Mary Smith (+1-555-0302)'
    },
    {
      name: 'Emily Davis',
      email: 'emily.patient@hospital.demo',
      phone: '+1-555-0303',
      dob: '1995-09-23',
      gender: 'Female',
      blood: 'A+',
      address: '221B Baker Street, Springfield',
      emergency: 'Robert Davis (+1-555-0304)'
    },
    {
      name: 'Michael Brown',
      email: 'michael.patient@hospital.demo',
      phone: '+1-555-0305',
      dob: '1976-11-05',
      gender: 'Male',
      blood: 'B+',
      address: '42 Wallaby Way, Springfield',
      emergency: 'Susan Brown (+1-555-0306)'
    }
  ];

  const patientMap = [];
  for (const p of patientsData) {
    const userRes = await db.run(
      `INSERT INTO users (email, password_hash, role, full_name, phone, status) VALUES (?, ?, 'patient', ?, ?, 'active')`,
      [p.email, patientPass, p.name, p.phone]
    );
    const patRes = await db.run(
      `INSERT INTO patients (user_id, dob, gender, blood_group, address, emergency_contact) VALUES (?, ?, ?, ?, ?, ?)`,
      [userRes.lastInsertRowid, p.dob, p.gender, p.blood, p.address, p.emergency]
    );
    patientMap.push({ id: patRes.lastInsertRowid, name: p.name });
  }
  console.log(`Created ${patientsData.length} Patients`);

  // 5. Insert Demonstrative Appointments
  const today = new Date();
  const formatOffsetDate = (offsetDays) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };

  const sampleAppointments = [
    {
      appNo: 'APT-2026-1001',
      patientId: patientMap[0].id,
      doctorId: doctorMap[0].id,
      deptId: doctorMap[0].deptId,
      date: formatOffsetDate(-3),
      slot: '09:30',
      status: 'Completed',
      symptoms: 'Routine hypertension follow-up and blood pressure monitoring.',
      notes: 'Blood pressure stable at 122/80. Maintained current dietary regimen.'
    },
    {
      appNo: 'APT-2026-1002',
      patientId: patientMap[1].id,
      doctorId: doctorMap[1].id,
      deptId: doctorMap[1].deptId,
      date: formatOffsetDate(-1),
      slot: '10:30',
      status: 'Completed',
      symptoms: 'Recurrent morning headaches and visual aura.',
      notes: 'Initial clinical assessment completed. Advised sleep log and hydration.'
    },
    {
      appNo: 'APT-2026-1003',
      patientId: patientMap[2].id,
      doctorId: doctorMap[3].id,
      deptId: doctorMap[3].deptId,
      date: formatOffsetDate(1),
      slot: '11:30',
      status: 'Confirmed',
      symptoms: 'Right knee stiffness after jogging, mild swelling.',
      notes: null
    },
    {
      appNo: 'APT-2026-1004',
      patientId: patientMap[0].id,
      doctorId: doctorMap[2].id,
      deptId: doctorMap[2].deptId,
      date: formatOffsetDate(2),
      slot: '10:00',
      status: 'Pending',
      symptoms: 'Child seasonal immunization checkup and allergy assessment.',
      notes: null
    },
    {
      appNo: 'APT-2026-1005',
      patientId: patientMap[1].id,
      doctorId: doctorMap[0].id,
      deptId: doctorMap[0].deptId,
      date: formatOffsetDate(3),
      slot: '11:00',
      status: 'Confirmed',
      symptoms: 'Mild palpitations following caffeine intake.',
      notes: null
    }
  ];

  for (const a of sampleAppointments) {
    const appRes = await db.run(
      `INSERT INTO appointments (appointment_number, patient_id, doctor_id, department_id, appointment_date, slot_time, status, patient_symptoms, doctor_notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [a.appNo, a.patientId, a.doctorId, a.deptId, a.date, a.slot, a.status, a.symptoms, a.notes]
    );

    await db.run(
      `INSERT INTO appointment_status_history (appointment_id, previous_status, new_status, comments)
       VALUES (?, NULL, ?, 'Initial booking record')`,
      [appRes.lastInsertRowid, a.status]
    );
  }
  console.log(`Created ${sampleAppointments.length} Demonstrative Appointments with history`);
  console.log('--- Database Seeding Completed Successfully ---');
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seeding error:', err);
      process.exit(1);
    });
}

module.exports = seedDatabase;
