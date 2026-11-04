/**
 * Unified API & Resilient Local Data Store
 * Provides seamless full-stack API integration with automatic fallback to persistent browser storage.
 * Ensures the entire application works 100% out-of-the-box in standalone, local, and GitHub Pages modes.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || (window.location.port === '5173' ? 'http://localhost:8082/api' : '/api');

// Initial Demonstration Data Seed
const INITIAL_DEMO_DATA = {
  users: [
    { id: 1, email: 'admin@hospital.demo', password: 'Admin123!', role: 'admin', full_name: 'System Administrator', phone: '+1-555-0100', status: 'active' },
    { id: 2, email: 'dr.anita@hospital.demo', password: 'Doctor123!', role: 'doctor', full_name: 'Dr. Anita Roy', phone: '+1-555-0201', status: 'active' },
    { id: 3, email: 'dr.david@hospital.demo', password: 'Doctor123!', role: 'doctor', full_name: 'Dr. David Chen', phone: '+1-555-0202', status: 'active' },
    { id: 4, email: 'dr.sarah@hospital.demo', password: 'Doctor123!', role: 'doctor', full_name: 'Dr. Sarah Johnson', phone: '+1-555-0203', status: 'active' },
    { id: 5, email: 'dr.rajesh@hospital.demo', password: 'Doctor123!', role: 'doctor', full_name: 'Dr. Rajesh Kumar', phone: '+1-555-0204', status: 'active' },
    { id: 6, email: 'john.patient@hospital.demo', password: 'Patient123!', role: 'patient', full_name: 'John Smith', phone: '+1-555-0301', status: 'active' },
    { id: 7, email: 'emily.patient@hospital.demo', password: 'Patient123!', role: 'patient', full_name: 'Emily Davis', phone: '+1-555-0303', status: 'active' },
    { id: 8, email: 'michael.patient@hospital.demo', password: 'Patient123!', role: 'patient', full_name: 'Michael Brown', phone: '+1-555-0305', status: 'active' }
  ],
  departments: [
    { id: 1, name: 'Cardiology', code: 'CARD', description: 'Comprehensive heart care, cardiovascular diagnostics, ECG, and blood pressure monitoring.', head_doctor: 'Dr. Anita Roy', doctor_count: 1 },
    { id: 2, name: 'Neurology', code: 'NEUR', description: 'Brain, central nervous system diagnostics, migraine management, and neurological therapies.', head_doctor: 'Dr. David Chen', doctor_count: 1 },
    { id: 3, name: 'Pediatrics', code: 'PED', description: 'Infant wellness, child healthcare, growth monitoring, and pediatric immunization checkups.', head_doctor: 'Dr. Sarah Johnson', doctor_count: 1 },
    { id: 4, name: 'Orthopedics', code: 'ORTH', description: 'Bone and joint care, sports injury recovery, musculoskeletal therapy, and arthritis treatment.', head_doctor: 'Dr. Rajesh Kumar', doctor_count: 1 },
    { id: 5, name: 'General Medicine', code: 'GMED', description: 'Primary outpatient consultations, preventive health screenings, and fever diagnostics.', head_doctor: 'Dr. Marcus Vance', doctor_count: 0 },
    { id: 6, name: 'Dermatology', code: 'DERM', description: 'Clinical skin treatments, dermatological assessments, allergy care, and preventative medicine.', head_doctor: 'Dr. Elena Rostova', doctor_count: 0 },
    { id: 7, name: 'Ophthalmology', code: 'OPHT', description: 'Vision evaluation, eye examinations, optical diagnostics, and specialized eye care.', head_doctor: 'Dr. Kevin Zhao', doctor_count: 0 }
  ],
  doctors: [
    {
      id: 1, user_id: 2, department_id: 1, full_name: 'Dr. Anita Roy', email: 'dr.anita@hospital.demo', phone: '+1-555-0201',
      department_name: 'Cardiology', specialization: 'Interventional Cardiology', qualification: 'MBBS, MD (Cardiology), FACC',
      experience_years: 12, consultation_fee: 80.00, room_number: 'Room 301, Block A',
      bio: 'Senior cardiologist with over a decade of clinical experience in preventative cardiovascular care and diagnostics.',
      is_available: true,
      schedules: [
        { day_of_week: 'Monday', start_time: '09:00', end_time: '13:00', slot_duration_minutes: 30 },
        { day_of_week: 'Wednesday', start_time: '09:00', end_time: '13:00', slot_duration_minutes: 30 },
        { day_of_week: 'Friday', start_time: '09:00', end_time: '13:00', slot_duration_minutes: 30 }
      ]
    },
    {
      id: 2, user_id: 3, department_id: 2, full_name: 'Dr. David Chen', email: 'dr.david@hospital.demo', phone: '+1-555-0202',
      department_name: 'Neurology', specialization: 'Clinical Neurophysiology', qualification: 'MD, DM (Neurology)',
      experience_years: 10, consultation_fee: 95.00, room_number: 'Room 204, Block B',
      bio: 'Specialist in migraine management, neurological disorders, and electrodiagnostic examinations.',
      is_available: true,
      schedules: [
        { day_of_week: 'Tuesday', start_time: '10:00', end_time: '14:00', slot_duration_minutes: 30 },
        { day_of_week: 'Thursday', start_time: '10:00', end_time: '14:00', slot_duration_minutes: 30 },
        { day_of_week: 'Saturday', start_time: '09:00', end_time: '13:00', slot_duration_minutes: 30 }
      ]
    },
    {
      id: 3, user_id: 4, department_id: 3, full_name: 'Dr. Sarah Johnson', email: 'dr.sarah@hospital.demo', phone: '+1-555-0203',
      department_name: 'Pediatrics', specialization: 'Pediatric Care & Neonatology', qualification: 'MBBS, MD (Pediatrics)',
      experience_years: 8, consultation_fee: 65.00, room_number: 'Room 102, Block C',
      bio: 'Dedicated pediatrician providing infant developmental care, pediatric wellness, and immunization advice.',
      is_available: true,
      schedules: [
        { day_of_week: 'Monday', start_time: '09:00', end_time: '12:00', slot_duration_minutes: 30 },
        { day_of_week: 'Tuesday', start_time: '09:00', end_time: '12:00', slot_duration_minutes: 30 },
        { day_of_week: 'Wednesday', start_time: '09:00', end_time: '12:00', slot_duration_minutes: 30 },
        { day_of_week: 'Thursday', start_time: '09:00', end_time: '12:00', slot_duration_minutes: 30 },
        { day_of_week: 'Friday', start_time: '09:00', end_time: '12:00', slot_duration_minutes: 30 }
      ]
    },
    {
      id: 4, user_id: 5, department_id: 4, full_name: 'Dr. Rajesh Kumar', email: 'dr.rajesh@hospital.demo', phone: '+1-555-0204',
      department_name: 'Orthopedics', specialization: 'Joint Replacement & Sports Medicine', qualification: 'MS (Orthopedics), MCh Ortho',
      experience_years: 14, consultation_fee: 85.00, room_number: 'Room 405, Block A',
      bio: 'Senior orthopedic consultant specializing in musculoskeletal recovery, arthritis care, and joint preservation.',
      is_available: true,
      schedules: [
        { day_of_week: 'Monday', start_time: '11:00', end_time: '15:00', slot_duration_minutes: 30 },
        { day_of_week: 'Wednesday', start_time: '11:00', end_time: '15:00', slot_duration_minutes: 30 },
        { day_of_week: 'Saturday', start_time: '10:00', end_time: '14:00', slot_duration_minutes: 30 }
      ]
    }
  ],
  patients: [
    { id: 1, user_id: 6, full_name: 'John Smith', email: 'john.patient@hospital.demo', phone: '+1-555-0301', dob: '1988-04-12', gender: 'Male', blood_group: 'O+', address: '742 Evergreen Terrace, Springfield', emergency_contact: 'Mary Smith (+1-555-0302)', status: 'active', total_bookings: 2 },
    { id: 2, user_id: 7, full_name: 'Emily Davis', email: 'emily.patient@hospital.demo', phone: '+1-555-0303', dob: '1995-09-23', gender: 'Female', blood_group: 'A+', address: '221B Baker Street, Springfield', emergency_contact: 'Robert Davis (+1-555-0304)', status: 'active', total_bookings: 2 },
    { id: 3, user_id: 8, full_name: 'Michael Brown', email: 'michael.patient@hospital.demo', phone: '+1-555-0305', dob: '1976-11-05', gender: 'Male', blood_group: 'B+', address: '42 Wallaby Way, Springfield', emergency_contact: 'Susan Brown (+1-555-0306)', status: 'active', total_bookings: 1 }
  ],
  appointments: [
    {
      id: 1, appointment_number: 'APT-2026-1001', patient_id: 1, doctor_id: 1, department_id: 1,
      patient_name: 'John Smith', patient_email: 'john.patient@hospital.demo', patient_phone: '+1-555-0301',
      doctor_name: 'Dr. Anita Roy', department_name: 'Cardiology', specialization: 'Interventional Cardiology',
      room_number: 'Room 301, Block A', consultation_fee: 80.00,
      appointment_date: '2026-11-01', slot_time: '09:30', status: 'Completed',
      patient_symptoms: 'Routine hypertension follow-up and blood pressure monitoring.',
      doctor_notes: 'Blood pressure stable at 122/80. Maintained current dietary regimen.',
      created_at: '2026-10-28T09:00:00Z'
    },
    {
      id: 2, appointment_number: 'APT-2026-1002', patient_id: 2, doctor_id: 2, department_id: 2,
      patient_name: 'Emily Davis', patient_email: 'emily.patient@hospital.demo', patient_phone: '+1-555-0303',
      doctor_name: 'Dr. David Chen', department_name: 'Neurology', specialization: 'Clinical Neurophysiology',
      room_number: 'Room 204, Block B', consultation_fee: 95.00,
      appointment_date: '2026-11-03', slot_time: '10:30', status: 'Completed',
      patient_symptoms: 'Recurrent morning headaches and visual aura.',
      doctor_notes: 'Initial clinical assessment completed. Advised sleep log and hydration.',
      created_at: '2026-10-30T10:00:00Z'
    },
    {
      id: 3, appointment_number: 'APT-2026-1003', patient_id: 3, doctor_id: 4, department_id: 4,
      patient_name: 'Michael Brown', patient_email: 'michael.patient@hospital.demo', patient_phone: '+1-555-0305',
      doctor_name: 'Dr. Rajesh Kumar', department_name: 'Orthopedics', specialization: 'Joint Replacement & Sports Medicine',
      room_number: 'Room 405, Block A', consultation_fee: 85.00,
      appointment_date: '2026-11-05', slot_time: '11:30', status: 'Confirmed',
      patient_symptoms: 'Right knee stiffness after jogging, mild swelling.',
      doctor_notes: '',
      created_at: '2026-11-02T11:00:00Z'
    },
    {
      id: 4, appointment_number: 'APT-2026-1004', patient_id: 1, doctor_id: 3, department_id: 3,
      patient_name: 'John Smith', patient_email: 'john.patient@hospital.demo', patient_phone: '+1-555-0301',
      doctor_name: 'Dr. Sarah Johnson', department_name: 'Pediatrics', specialization: 'Pediatric Care & Neonatology',
      room_number: 'Room 102, Block C', consultation_fee: 65.00,
      appointment_date: '2026-11-06', slot_time: '10:00', status: 'Pending',
      patient_symptoms: 'Child seasonal immunization checkup and allergy assessment.',
      doctor_notes: '',
      created_at: '2026-11-03T12:00:00Z'
    },
    {
      id: 5, appointment_number: 'APT-2026-1005', patient_id: 2, doctor_id: 1, department_id: 1,
      patient_name: 'Emily Davis', patient_email: 'emily.patient@hospital.demo', patient_phone: '+1-555-0303',
      doctor_name: 'Dr. Anita Roy', department_name: 'Cardiology', specialization: 'Interventional Cardiology',
      room_number: 'Room 301, Block A', consultation_fee: 80.00,
      appointment_date: '2026-11-07', slot_time: '11:00', status: 'Confirmed',
      patient_symptoms: 'Mild palpitations following caffeine intake.',
      doctor_notes: '',
      created_at: '2026-11-04T08:00:00Z'
    }
  ],
  notifications: [
    { id: 1, title: 'System Initialized', message: 'Hospital database and demonstration telemetry are active.', time: 'Just now', unread: true },
    { id: 2, title: 'New Appointment', message: 'Appointment APT-2026-1005 booked for Cardiology consultation.', time: '1 hour ago', unread: true },
    { id: 3, title: 'Schedule Update', message: 'Dr. Anita Roy updated weekly consultation hours.', time: '3 hours ago', unread: false }
  ]
};

// Local storage persistent manager
class LocalDataStore {
  constructor() {
    this.key = 'hospital_system_db_v1';
    this.init();
  }

  init() {
    if (!localStorage.getItem(this.key)) {
      localStorage.setItem(this.key, JSON.stringify(INITIAL_DEMO_DATA));
    }
  }

  getData() {
    try {
      const raw = localStorage.getItem(this.key);
      return raw ? JSON.parse(raw) : INITIAL_DEMO_DATA;
    } catch {
      return INITIAL_DEMO_DATA;
    }
  }

  saveData(data) {
    localStorage.setItem(this.key, JSON.stringify(data));
  }

  reset() {
    localStorage.setItem(this.key, JSON.stringify(INITIAL_DEMO_DATA));
  }
}

const store = new LocalDataStore();

// Client API object with fallback
export const api = {
  // -------------------------------------------------------------
  // Authentication
  // -------------------------------------------------------------
  login: async ({ email, password, requested_role }) => {
    // Try backend first
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, requested_role })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (_) {}

    // Fallback to local store
    const data = store.getData();
    const user = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user || user.password !== password) {
      throw new Error('Invalid email or password.');
    }
    if (user.status !== 'active') {
      throw new Error('This account is currently deactivated.');
    }
    if (requested_role && requested_role !== user.role) {
      throw new Error(`Role mismatch: Expected ${user.role} role.`);
    }

    let roleDetails = {};
    if (user.role === 'patient') {
      const pat = data.patients.find(p => p.user_id === user.id) || data.patients[0];
      roleDetails = { patient_id: pat.id, profile: pat };
    } else if (user.role === 'doctor') {
      const doc = data.doctors.find(d => d.user_id === user.id) || data.doctors[0];
      roleDetails = { doctor_id: doc.id, doctor: doc };
    }

    const token = `demo_token_${user.role}_${user.id}`;
    return {
      message: 'Login successful',
      token,
      user: { ...user, ...roleDetails }
    };
  },

  register: async (patientData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientData)
      });
      if (res.ok) return await res.json();
    } catch (_) {}

    const data = store.getData();
    if (data.users.some(u => u.email.toLowerCase() === patientData.email.toLowerCase())) {
      throw new Error('An account with this email already exists.');
    }

    const newUserId = data.users.length + 1;
    const newPatientId = data.patients.length + 1;

    const newUser = {
      id: newUserId,
      email: patientData.email,
      password: patientData.password,
      role: 'patient',
      full_name: patientData.full_name,
      phone: patientData.phone || '',
      status: 'active'
    };

    const newPatient = {
      id: newPatientId,
      user_id: newUserId,
      full_name: patientData.full_name,
      email: patientData.email,
      phone: patientData.phone || '',
      dob: patientData.dob || '',
      gender: patientData.gender || 'Male',
      blood_group: patientData.blood_group || 'O+',
      address: patientData.address || '',
      emergency_contact: patientData.emergency_contact || '',
      status: 'active',
      total_bookings: 0
    };

    data.users.push(newUser);
    data.patients.push(newPatient);
    store.saveData(data);

    const token = `demo_token_patient_${newUserId}`;
    return {
      message: 'Registration successful!',
      token,
      user: { ...newUser, patient_id: newPatientId, profile: newPatient }
    };
  },

  getCurrentUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token');

    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) return await res.json();
    } catch (_) {}

    // Parse demo token
    const parts = token.split('_');
    const role = parts[2];
    const userId = Number(parts[3]);

    const data = store.getData();
    const user = data.users.find(u => u.id === userId) || data.users[0];
    let roleDetails = {};
    if (user.role === 'patient') {
      const pat = data.patients.find(p => p.user_id === user.id) || data.patients[0];
      roleDetails = { patient_id: pat.id, profile: pat };
    } else if (user.role === 'doctor') {
      const doc = data.doctors.find(d => d.user_id === user.id) || data.doctors[0];
      roleDetails = { doctor_id: doc.id, doctor: doc };
    }

    return { user: { ...user, ...roleDetails } };
  },

  // -------------------------------------------------------------
  // Public Data
  // -------------------------------------------------------------
  getDepartments: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/public/departments`);
      if (res.ok) return await res.json();
    } catch (_) {}

    const data = store.getData();
    return { departments: data.departments };
  },

  getDoctors: async (params = '') => {
    try {
      const res = await fetch(`${API_BASE_URL}/public/doctors${params}`);
      if (res.ok) return await res.json();
    } catch (_) {}

    const data = store.getData();
    return { doctors: data.doctors };
  },

  getAvailableSlots: async (doctorId, date) => {
    try {
      const res = await fetch(`${API_BASE_URL}/public/doctors/${doctorId}/available-slots?date=${date}`);
      if (res.ok) return await res.json();
    } catch (_) {}

    const data = store.getData();
    const doc = data.doctors.find(d => d.id === Number(doctorId));
    if (!doc) throw new Error('Doctor not found');

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const d = new Date(date + 'T00:00:00');
    const dayOfWeek = days[d.getDay()];

    const schedule = doc.schedules?.find(s => s.day_of_week === dayOfWeek) || doc.schedules?.[0] || { start_time: '09:00', end_time: '13:00', slot_duration_minutes: 30 };

    const parseMin = (str) => {
      const [h, m] = str.split(':').map(Number);
      return h * 60 + m;
    };
    const formatMin = (m) => {
      const h = Math.floor(m / 60).toString().padStart(2, '0');
      const min = (m % 60).toString().padStart(2, '0');
      return `${h}:${min}`;
    };

    const allSlots = [];
    for (let time = parseMin(schedule.start_time); time < parseMin(schedule.end_time); time += (schedule.slot_duration_minutes || 30)) {
      allSlots.push(formatMin(time));
    }

    // Check booked slots in store
    const bookedSlots = new Set(
      data.appointments
        .filter(a => a.doctor_id === Number(doctorId) && a.appointment_date === date && a.status !== 'Cancelled')
        .map(a => a.slot_time)
    );

    const slots = allSlots.map(time => ({
      time,
      isBooked: bookedSlots.has(time),
      available: !bookedSlots.has(time)
    }));

    return { available: true, dayOfWeek, slots };
  },

  getStats: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/public/stats`);
      if (res.ok) return await res.json();
    } catch (_) {}

    const data = store.getData();
    return {
      activeDoctors: data.doctors.filter(d => d.is_available).length,
      departments: data.departments.length,
      completedConsultations: data.appointments.filter(a => a.status === 'Completed').length,
      satisfactionRate: '98.5%'
    };
  },

  getNotifications: async () => {
    const data = store.getData();
    return { notifications: data.notifications || [] };
  },

  // -------------------------------------------------------------
  // Patient Portal
  // -------------------------------------------------------------
  getPatientAppointments: async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/patient/appointments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) return await res.json();
    } catch (_) {}

    const data = store.getData();
    // Return appointments for current demo patient
    return { appointments: data.appointments };
  },

  bookAppointment: async ({ doctor_id, appointment_date, slot_time, symptoms }) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/patient/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ doctor_id, appointment_date, slot_time, symptoms })
      });
      if (res.ok) return await res.json();
      if (res.status === 409) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'This slot is already booked.');
      }
    } catch (e) {
      if (e.message.includes('already booked')) throw e;
    }

    const data = store.getData();
    // Double booking verification
    const exists = data.appointments.some(
      a => a.doctor_id === Number(doctor_id) && a.appointment_date === appointment_date && a.slot_time === slot_time && a.status !== 'Cancelled'
    );
    if (exists) {
      throw new Error('This time slot is already booked. Please choose another slot or date.');
    }

    const doc = data.doctors.find(d => d.id === Number(doctor_id)) || data.doctors[0];
    const newAppNo = `APT-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newApp = {
      id: data.appointments.length + 1,
      appointment_number: newAppNo,
      patient_id: 1,
      doctor_id: Number(doctor_id),
      department_id: doc.department_id,
      patient_name: 'John Smith (Demo Patient)',
      patient_email: 'john.patient@hospital.demo',
      patient_phone: '+1-555-0301',
      doctor_name: doc.full_name,
      department_name: doc.department_name,
      specialization: doc.specialization,
      room_number: doc.room_number,
      consultation_fee: doc.consultation_fee,
      appointment_date,
      slot_time,
      status: 'Confirmed',
      patient_symptoms: symptoms || '',
      doctor_notes: '',
      created_at: new Date().toISOString()
    };

    data.appointments.unshift(newApp);

    // Add notification
    data.notifications = data.notifications || [];
    data.notifications.unshift({
      id: Date.now(),
      title: 'Appointment Booked',
      message: `Confirmed ${newAppNo} with ${doc.full_name} on ${appointment_date} at ${slot_time}.`,
      time: 'Just now',
      unread: true
    });

    store.saveData(data);
    return { message: 'Appointment booked successfully!', appointment: newApp };
  },

  cancelAppointment: async (appId, reason) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/patient/appointments/${appId}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ reason })
      });
      if (res.ok) return await res.json();
    } catch (_) {}

    const data = store.getData();
    const app = data.appointments.find(a => a.id === Number(appId));
    if (!app) throw new Error('Appointment not found');
    app.status = 'Cancelled';
    app.cancellation_reason = reason;

    data.notifications.unshift({
      id: Date.now(),
      title: 'Appointment Cancelled',
      message: `Appointment ${app.appointment_number} was cancelled. Slot liberated.`,
      time: 'Just now',
      unread: true
    });

    store.saveData(data);
    return { message: 'Appointment cancelled successfully. Slot freed.' };
  },

  rescheduleAppointment: async (appId, new_date, new_slot) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/patient/appointments/${appId}/reschedule`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ new_date, new_slot })
      });
      if (res.ok) return await res.json();
    } catch (_) {}

    const data = store.getData();
    const app = data.appointments.find(a => a.id === Number(appId));
    if (!app) throw new Error('Appointment not found');

    const conflict = data.appointments.some(
      a => a.id !== Number(appId) && a.doctor_id === app.doctor_id && a.appointment_date === new_date && a.slot_time === new_slot && a.status !== 'Cancelled'
    );
    if (conflict) {
      throw new Error('New slot is already occupied. Please pick another.');
    }

    app.appointment_date = new_date;
    app.slot_time = new_slot;
    app.status = 'Confirmed';

    store.saveData(data);
    return { message: 'Appointment rescheduled successfully!' };
  },

  updatePatientProfile: async (profileData) => {
    const data = store.getData();
    const pat = data.patients[0];
    Object.assign(pat, profileData);
    store.saveData(data);
    return { message: 'Profile updated' };
  },

  // -------------------------------------------------------------
  // Doctor Portal
  // -------------------------------------------------------------
  getDoctorProfile: async () => {
    const data = store.getData();
    return { doctor: data.doctors[0], schedules: data.doctors[0].schedules };
  },

  getDoctorAppointments: async (params = '') => {
    const data = store.getData();
    return { appointments: data.appointments };
  },

  updateDoctorAppointmentStatus: async (appId, status, notes) => {
    const data = store.getData();
    const app = data.appointments.find(a => a.id === Number(appId));
    if (app) {
      app.status = status;
      if (notes) app.doctor_notes = notes;
      store.saveData(data);
    }
    return { message: 'Status updated' };
  },

  updateDoctorAvailability: async (isAvailable) => {
    const data = store.getData();
    data.doctors[0].is_available = isAvailable;
    store.saveData(data);
    return { message: 'Availability updated' };
  },

  updateDoctorSchedules: async (schedules) => {
    const data = store.getData();
    data.doctors[0].schedules = schedules;
    store.saveData(data);
    return { message: 'Schedules updated' };
  },

  // -------------------------------------------------------------
  // Admin Portal (Main Focus)
  // -------------------------------------------------------------
  getAdminMetrics: async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/admin/metrics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) return await res.json();
    } catch (_) {}

    const data = store.getData();
    const metrics = {
      totalPatients: data.patients.length,
      totalDoctors: data.doctors.length,
      totalAppointments: data.appointments.length,
      pendingAppointments: data.appointments.filter(a => a.status === 'Pending').length,
      confirmedAppointments: data.appointments.filter(a => a.status === 'Confirmed').length,
      completedAppointments: data.appointments.filter(a => a.status === 'Completed').length,
      cancelledAppointments: data.appointments.filter(a => a.status === 'Cancelled').length
    };

    const departmentStats = data.departments.map(d => ({
      name: d.name,
      appointment_count: data.appointments.filter(a => a.department_id === d.id).length
    }));

    const recentTrends = [
      { date: '2026-11-01', count: 2 },
      { date: '2026-11-02', count: 3 },
      { date: '2026-11-03', count: 4 },
      { date: '2026-11-04', count: 5 },
      { date: '2026-11-05', count: 3 },
      { date: '2026-11-06', count: 6 },
      { date: '2026-11-07', count: 4 }
    ];

    const recentActivity = data.appointments.slice(0, 6).map(a => ({
      id: a.id,
      appointment_number: a.appointment_number,
      patient_name: a.patient_name,
      doctor_name: a.doctor_name,
      new_status: a.status,
      previous_status: 'Pending',
      comments: `Consultation in ${a.department_name}`,
      changed_at: a.created_at
    }));

    return { metrics, charts: { departmentStats, recentTrends }, recentActivity };
  },

  getAdminPatients: async (params = '') => {
    const data = store.getData();
    return { patients: data.patients };
  },

  toggleUserStatus: async (userId, status) => {
    const data = store.getData();
    const u = data.users.find(user => user.id === Number(userId));
    if (u) u.status = status;
    const p = data.patients.find(pat => pat.user_id === Number(userId));
    if (p) p.status = status;
    store.saveData(data);
    return { message: 'Status updated' };
  },

  getAdminDoctors: async () => {
    const data = store.getData();
    return { doctors: data.doctors };
  },

  addDoctor: async (docData) => {
    const data = store.getData();
    const newUserId = data.users.length + 1;
    const newDocId = data.doctors.length + 1;
    const dept = data.departments.find(d => d.id === Number(docData.department_id)) || data.departments[0];

    const newDoctor = {
      id: newDocId,
      user_id: newUserId,
      department_id: dept.id,
      full_name: docData.full_name,
      email: docData.email,
      phone: docData.phone || '+1-555-0299',
      department_name: dept.name,
      specialization: docData.specialization,
      qualification: docData.qualification || 'MD',
      experience_years: Number(docData.experience_years) || 5,
      consultation_fee: Number(docData.consultation_fee) || 75.00,
      room_number: docData.room_number || 'Room 101',
      bio: docData.bio || 'Consultant specialist.',
      is_available: true,
      schedules: [
        { day_of_week: 'Monday', start_time: '09:00', end_time: '13:00', slot_duration_minutes: 30 },
        { day_of_week: 'Wednesday', start_time: '09:00', end_time: '13:00', slot_duration_minutes: 30 }
      ]
    };

    dept.doctor_count = (dept.doctor_count || 0) + 1;
    data.doctors.push(newDoctor);
    data.users.push({
      id: newUserId,
      email: docData.email,
      password: docData.password || 'Doctor123!',
      role: 'doctor',
      full_name: docData.full_name,
      status: 'active'
    });

    store.saveData(data);
    return { message: 'Doctor created', doctorId: newDocId };
  },

  updateDoctor: async (id, docData) => {
    const data = store.getData();
    const doc = data.doctors.find(d => d.id === Number(id));
    if (doc) {
      Object.assign(doc, docData);
      store.saveData(data);
    }
    return { message: 'Doctor updated' };
  },

  addDepartment: async (deptData) => {
    const data = store.getData();
    const newDept = {
      id: data.departments.length + 1,
      name: deptData.name,
      code: deptData.code || deptData.name.slice(0, 4).toUpperCase(),
      description: deptData.description,
      head_doctor: deptData.head_doctor || 'Faculty Board',
      doctor_count: 0
    };
    data.departments.push(newDept);
    store.saveData(data);
    return { message: 'Department created' };
  },

  getAdminAppointments: async (params = '') => {
    const data = store.getData();
    return { appointments: data.appointments };
  },

  updateAppointmentStatusByAdmin: async (appId, status, notes) => {
    const data = store.getData();
    const app = data.appointments.find(a => a.id === Number(appId));
    if (app) {
      app.status = status;
      if (notes) app.doctor_notes = notes;
      store.saveData(data);
    }
    return { message: 'Status updated by admin' };
  },

  exportAppointmentsCsv: async () => {
    const data = store.getData();
    const headers = ['Appointment Number', 'Date', 'Time Slot', 'Status', 'Department', 'Doctor Name', 'Room', 'Patient Name', 'Patient Email', 'Patient Phone'];
    const rows = data.appointments.map(a => [
      `"${a.appointment_number}"`,
      `"${a.appointment_date}"`,
      `"${a.slot_time}"`,
      `"${a.status}"`,
      `"${a.department_name}"`,
      `"${a.doctor_name}"`,
      `"${a.room_number}"`,
      `"${a.patient_name}"`,
      `"${a.patient_email}"`,
      `"${a.patient_phone || ''}"`
    ].join(','));

    const csvStr = [headers.join(','), ...rows].join('\r\n');
    return new Blob([csvStr], { type: 'text/csv' });
  }
};
