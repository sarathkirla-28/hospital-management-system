import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, Clock, User, Phone, MapPin, AlertCircle, CheckCircle, 
  X, RefreshCw, Plus, Stethoscope, FileText, ChevronRight 
} from 'lucide-react';

export default function PatientDashboard({ preSelectedDoctor }) {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Booking Wizard State
  const [showBookingWizard, setShowBookingWizard] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState(preSelectedDoctor ? String(preSelectedDoctor.id) : '');
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Reschedule Modal State
  const [reschedulingApp, setReschedulingApp] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleSlots, setRescheduleSlots] = useState([]);
  const [rescheduleSelectedSlot, setRescheduleSelectedSlot] = useState('');
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  // Cancellation Modal State
  const [cancellingApp, setCancellingApp] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  // Profile Edit State
  const [activeTab, setActiveTab] = useState('appointments'); // 'appointments' or 'profile'
  const [profileData, setProfileData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    dob: user?.profile?.dob || '',
    gender: user?.profile?.gender || 'Male',
    blood_group: user?.profile?.blood_group || 'O+',
    address: user?.profile?.address || '',
    emergency_contact: user?.profile?.emergency_contact || ''
  });

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.getPatientAppointments();
      setAppointments(res.appointments || []);
    } catch (err) {
      console.error('Error fetching patient appointments:', err);
      setError(err.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
    async function loadWizardDeps() {
      try {
        const [deptRes, docRes] = await Promise.all([
          api.getDepartments(),
          api.getDoctors()
        ]);
        setDepartments(deptRes.departments || []);
        setDoctors(docRes.doctors || []);
        if (preSelectedDoctor) {
          setSelectedDoctorId(String(preSelectedDoctor.id));
          setSelectedDeptId(String(preSelectedDoctor.department_id));
          setShowBookingWizard(true);
        }
      } catch (err) {
        console.error('Failed to load wizard dependencies:', err);
      }
    }
    loadWizardDeps();
  }, [preSelectedDoctor]);

  // Load available slots whenever selected doctor or date changes
  useEffect(() => {
    async function fetchSlots() {
      if (!selectedDoctorId || !selectedDate) {
        setAvailableSlots([]);
        return;
      }
      setLoadingSlots(true);
      try {
        const res = await api.getAvailableSlots(selectedDoctorId, selectedDate);
        setAvailableSlots(res.slots || []);
        setSelectedSlot('');
      } catch (err) {
        console.error('Failed to load slots:', err);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    }
    fetchSlots();
  }, [selectedDoctorId, selectedDate]);

  // Handle Reschedule Slot Fetching
  useEffect(() => {
    async function fetchRescheduleSlots() {
      if (!reschedulingApp || !rescheduleDate) {
        setRescheduleSlots([]);
        return;
      }
      try {
        const res = await api.getAvailableSlots(reschedulingApp.doctor_id, rescheduleDate);
        setRescheduleSlots(res.slots || []);
      } catch (err) {
        console.error('Failed to load reschedule slots:', err);
      }
    }
    fetchRescheduleSlots();
  }, [reschedulingApp, rescheduleDate]);

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!selectedDoctorId || !selectedDate || !selectedSlot) {
      setError('Please select a doctor, appointment date, and time slot.');
      return;
    }
    setBookingLoading(true);
    setError('');
    try {
      await api.bookAppointment({
        doctor_id: Number(selectedDoctorId),
        appointment_date: selectedDate,
        slot_time: selectedSlot,
        symptoms
      });
      setSuccessMsg('Appointment booked successfully! Slot reserved.');
      setShowBookingWizard(false);
      setSelectedDate('');
      setSelectedSlot('');
      setSymptoms('');
      loadAppointments();
    } catch (err) {
      setError(err.message || 'Failed to book appointment. Slot might already be taken.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelConfirm = async () => {
    if (!cancellingApp) return;
    try {
      await api.cancelAppointment(cancellingApp.id, cancelReason);
      setSuccessMsg(`Appointment #${cancellingApp.appointment_number} cancelled. Slot liberated.`);
      setCancellingApp(null);
      setCancelReason('');
      loadAppointments();
    } catch (err) {
      setError(err.message || 'Failed to cancel appointment');
    }
  };

  const handleRescheduleConfirm = async () => {
    if (!reschedulingApp || !rescheduleDate || !rescheduleSelectedSlot) {
      setError('Please choose a new date and time slot.');
      return;
    }
    setRescheduleLoading(true);
    try {
      await api.rescheduleAppointment(reschedulingApp.id, rescheduleDate, rescheduleSelectedSlot);
      setSuccessMsg('Appointment rescheduled successfully.');
      setReschedulingApp(null);
      setRescheduleDate('');
      setRescheduleSelectedSlot('');
      loadAppointments();
    } catch (err) {
      setError(err.message || 'Failed to reschedule.');
    } finally {
      setRescheduleLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.updatePatientProfile(profileData);
      setSuccessMsg('Profile details updated successfully.');
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed': return <span className="badge badge-confirmed">Confirmed</span>;
      case 'Pending': return <span className="badge badge-pending">Pending</span>;
      case 'Completed': return <span className="badge badge-completed">Completed</span>;
      case 'Cancelled': return <span className="badge badge-cancelled">Cancelled</span>;
      default: return <span className="badge badge-inactive">{status}</span>;
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div style={{ padding: '2.5rem 0' }}>
      <div className="container">
        {/* Welcome Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Patient Healthcare Portal
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>
              Welcome, {user?.full_name}
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => { setShowBookingWizard(true); setError(''); }}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Plus size={18} />
              <span>Book New Consultation</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert Banners */}
        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.875rem 1.25rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
            <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#b91c1c', cursor: 'pointer' }}><X size={16} /></button>
          </div>
        )}

        {successMsg && (
          <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '0.875rem 1.25rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={18} />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg('')} style={{ background: 'none', border: 'none', color: '#065f46', cursor: 'pointer' }}><X size={16} /></button>
          </div>
        )}

        {/* Tab Switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid #cbd5e1', marginBottom: '2rem', gap: '1.5rem' }}>
          <button
            onClick={() => setActiveTab('appointments')}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.75rem 0.5rem',
              fontSize: '1rem',
              fontWeight: activeTab === 'appointments' ? 700 : 500,
              color: activeTab === 'appointments' ? '#0d9488' : '#64748b',
              borderBottom: activeTab === 'appointments' ? '3px solid #0d9488' : '3px solid transparent',
              cursor: 'pointer'
            }}
          >
            My Appointments ({appointments.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.75rem 0.5rem',
              fontSize: '1rem',
              fontWeight: activeTab === 'profile' ? 700 : 500,
              color: activeTab === 'profile' ? '#0d9488' : '#64748b',
              borderBottom: activeTab === 'profile' ? '3px solid #0d9488' : '3px solid transparent',
              cursor: 'pointer'
            }}
          >
            My Patient Profile
          </button>
        </div>

        {activeTab === 'appointments' ? (
          /* Appointments List */
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                Loading appointment records...
              </div>
            ) : appointments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', backgroundColor: '#ffffff', borderRadius: '0.75rem', border: '1px dashed #cbd5e1' }}>
                <Calendar size={40} color="#94a3b8" style={{ margin: '0 auto 1rem auto' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>No Appointments Scheduled</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem', maxWidth: '420px', margin: '0.25rem auto 1.5rem auto' }}>
                  You currently have no scheduled hospital appointments. Choose a department and book a certified medical doctor online.
                </p>
                <button
                  onClick={() => setShowBookingWizard(true)}
                  className="btn btn-primary"
                >
                  <Plus size={16} />
                  <span>Schedule Consultation</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
                {appointments.map((app) => (
                  <div key={app.id} className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0d9488', letterSpacing: '0.05em' }}>
                          {app.appointment_number}
                        </span>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginTop: '0.125rem' }}>
                          {app.doctor_name}
                        </h3>
                        <div style={{ fontSize: '0.825rem', color: '#64748b' }}>{app.department_name} ({app.specialization})</div>
                      </div>
                      {getStatusBadge(app.status)}
                    </div>

                    <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#334155' }}>
                        <Calendar size={15} color="#0d9488" />
                        <strong>{app.appointment_date}</strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#334155' }}>
                        <Clock size={15} color="#0d9488" />
                        <strong>{app.slot_time}</strong>
                      </div>
                      <div style={{ color: '#64748b' }}>
                        Clinic: <strong style={{ color: '#0f172a' }}>{app.room_number}</strong>
                      </div>
                      <div style={{ color: '#64748b' }}>
                        Fee: <strong style={{ color: '#0d9488' }}>${Number(app.consultation_fee).toFixed(2)}</strong>
                      </div>
                    </div>

                    {app.patient_symptoms && (
                      <div style={{ fontSize: '0.825rem', color: '#475569', marginBottom: '1rem', flexGrow: 1 }}>
                        <strong>Reason:</strong> {app.patient_symptoms}
                      </div>
                    )}

                    {app.doctor_notes && (
                      <div style={{ backgroundColor: '#f0fdfa', border: '1px solid #ccfbf1', padding: '0.75rem', borderRadius: '0.375rem', fontSize: '0.8rem', color: '#0f766e', marginBottom: '1rem' }}>
                        <strong>Doctor Clinical Notes:</strong> {app.doctor_notes}
                      </div>
                    )}

                    {/* Actions: Cancel or Reschedule (if Pending/Confirmed) */}
                    {(app.status === 'Confirmed' || app.status === 'Pending') && (
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                        <button
                          onClick={() => {
                            setReschedulingApp(app);
                            setRescheduleDate(app.appointment_date);
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ flex: 1 }}
                        >
                          <RefreshCw size={14} />
                          <span>Reschedule</span>
                        </button>
                        <button
                          onClick={() => setCancellingApp(app)}
                          className="btn btn-danger btn-sm"
                          style={{ flex: 1 }}
                        >
                          <X size={14} />
                          <span>Cancel</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Profile Tab */
          <div className="card" style={{ padding: '2rem', maxWidth: '640px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>
              Personal & Emergency Clinical Information
            </h3>
            <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Full Name</label>
                <input
                  type="text"
                  value={profileData.full_name}
                  onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                  style={{ width: '100%', padding: '0.625rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Phone</label>
                  <input
                    type="text"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Blood Group</label>
                  <select
                    value={profileData.blood_group}
                    onChange={(e) => setProfileData({ ...profileData, blood_group: e.target.value })}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', backgroundColor: '#ffffff' }}
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Residential Address</label>
                <input
                  type="text"
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  style={{ width: '100%', padding: '0.625rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Emergency Contact Name & Phone</label>
                <input
                  type="text"
                  value={profileData.emergency_contact}
                  onChange={(e) => setProfileData({ ...profileData, emergency_contact: e.target.value })}
                  style={{ width: '100%', padding: '0.625rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                Save Profile Changes
              </button>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* Dynamic Appointment Booking Wizard Modal                                  */}
        {/* ========================================================================= */}
        {showBookingWizard && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 60,
            padding: '1rem'
          }}>
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '1rem',
              maxWidth: '560px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  Schedule New Clinical Consultation
                </h3>
                <button onClick={() => setShowBookingWizard(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleBookAppointment} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* 1. Department Selector */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.375rem' }}>
                    1. Select Department
                  </label>
                  <select
                    value={selectedDeptId}
                    onChange={(e) => {
                      setSelectedDeptId(e.target.value);
                      setSelectedDoctorId('');
                    }}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', backgroundColor: '#ffffff' }}
                  >
                    <option value="">-- Choose Department --</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                {/* 2. Doctor Selector */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.375rem' }}>
                    2. Select Doctor
                  </label>
                  <select
                    required
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', backgroundColor: '#ffffff' }}
                  >
                    <option value="">-- Choose Specialist --</option>
                    {doctors
                      .filter((doc) => selectedDeptId ? String(doc.department_id) === String(selectedDeptId) : true)
                      .map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          {doc.full_name} ({doc.department_name} - ${Number(doc.consultation_fee).toFixed(2)})
                        </option>
                      ))}
                  </select>
                </div>

                {/* 3. Appointment Date */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.375rem' }}>
                    3. Select Date
                  </label>
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}
                  />
                </div>

                {/* 4. Real-time Slot Picker */}
                {selectedDoctorId && selectedDate && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                      4. Select Available Time Slot
                    </label>

                    {loadingSlots ? (
                      <div style={{ fontSize: '0.85rem', color: '#64748b', padding: '0.5rem 0' }}>
                        Verifying real-time doctor availability...
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <div style={{ backgroundColor: '#fef3c7', color: '#b45309', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.85rem' }}>
                        Doctor has no consultation hours or all slots are filled on this date.
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '0.5rem' }}>
                        {availableSlots.map((slot) => {
                          const isSelected = selectedSlot === slot.time;
                          return (
                            <button
                              key={slot.time}
                              type="button"
                              disabled={!slot.available}
                              onClick={() => setSelectedSlot(slot.time)}
                              style={{
                                padding: '0.5rem 0.25rem',
                                borderRadius: '0.375rem',
                                border: isSelected ? '2px solid #0d9488' : '1px solid #cbd5e1',
                                backgroundColor: !slot.available ? '#fee2e2' : isSelected ? '#f0fdfa' : '#ffffff',
                                color: !slot.available ? '#b91c1c' : isSelected ? '#0d9488' : '#1e293b',
                                fontWeight: 600,
                                fontSize: '0.85rem',
                                cursor: slot.available ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.125rem'
                              }}
                            >
                              <span>{slot.time}</span>
                              <span style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>
                                {slot.available ? 'Free' : 'Booked'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* 5. Patient Symptoms / Medical Reason */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.375rem' }}>
                    5. Symptoms / Consultation Reason
                  </label>
                  <textarea
                    rows={3}
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="Briefly state reason for visit or primary symptoms..."
                    style={{ width: '100%', padding: '0.625rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowBookingWizard(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={bookingLoading || !selectedSlot}
                    className="btn btn-primary"
                  >
                    {bookingLoading ? 'Reserving...' : 'Confirm Appointment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* Reschedule Modal                                                          */}
        {/* ========================================================================= */}
        {reschedulingApp && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 60,
            padding: '1rem'
          }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '1rem', maxWidth: '480px', width: '100%', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                Reschedule Appointment #{reschedulingApp.appointment_number}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
                With {reschedulingApp.doctor_name}
              </p>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  Select New Date
                </label>
                <input
                  type="date"
                  min={todayStr}
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                />
              </div>

              {rescheduleDate && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                    Select New Available Slot
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '0.5rem' }}>
                    {rescheduleSlots.map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => setRescheduleSelectedSlot(slot.time)}
                        style={{
                          padding: '0.4rem',
                          borderRadius: '0.375rem',
                          border: rescheduleSelectedSlot === slot.time ? '2px solid #0d9488' : '1px solid #cbd5e1',
                          backgroundColor: !slot.available ? '#fee2e2' : rescheduleSelectedSlot === slot.time ? '#f0fdfa' : '#ffffff',
                          color: !slot.available ? '#b91c1c' : rescheduleSelectedSlot === slot.time ? '#0d9488' : '#1e293b',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: slot.available ? 'pointer' : 'not-allowed'
                        }}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button onClick={() => setReschedulingApp(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button
                  onClick={handleRescheduleConfirm}
                  disabled={rescheduleLoading || !rescheduleSelectedSlot}
                  className="btn btn-primary"
                >
                  {rescheduleLoading ? 'Updating...' : 'Save New Slot'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* Cancellation Confirmation Modal                                          */}
        {/* ========================================================================= */}
        {cancellingApp && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 60,
            padding: '1rem'
          }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '1rem', maxWidth: '440px', width: '100%', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                Cancel Appointment #{cancellingApp.appointment_number}?
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
                Are you sure you want to cancel your consultation with {cancellingApp.doctor_name} on {cancellingApp.appointment_date} at {cancellingApp.slot_time}? The slot will immediately become available to other patients.
              </p>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  Reason for Cancellation (Optional)
                </label>
                <input
                  type="text"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Schedule conflict or feeling recovered"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button onClick={() => setCancellingApp(null)} className="btn btn-secondary">
                  Keep Appointment
                </button>
                <button onClick={handleCancelConfirm} className="btn btn-danger">
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
