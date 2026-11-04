import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, Clock, User, Phone, CheckCircle, XCircle, AlertCircle, 
  FileText, Check, Settings, ToggleLeft, ToggleRight, X 
} from 'lucide-react';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Complete Consultation Modal State
  const [activeConsultationApp, setActiveConsultationApp] = useState(null);
  const [clinicalNotes, setClinicalNotes] = useState('');

  // Schedule Management State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [weeklySchedules, setWeeklySchedules] = useState([]);
  const [isAvailable, setIsAvailable] = useState(true);

  const loadDoctorData = async () => {
    try {
      setLoading(true);
      const [profileRes, appRes] = await Promise.all([
        api.getDoctorProfile(),
        api.getDoctorAppointments(buildQueryParams())
      ]);
      setProfile(profileRes.doctor);
      setWeeklySchedules(profileRes.schedules || []);
      setIsAvailable(profileRes.doctor.is_available === 1 || profileRes.doctor.is_available === true);
      setAppointments(appRes.appointments || []);
    } catch (err) {
      console.error('Failed to load doctor dashboard:', err);
      setError(err.message || 'Error fetching doctor records');
    } finally {
      setLoading(false);
    }
  };

  const buildQueryParams = () => {
    const params = [];
    if (statusFilter) params.push(`status=${statusFilter}`);
    if (dateFilter) params.push(`date=${dateFilter}`);
    return params.length > 0 ? `?${params.join('&')}` : '';
  };

  useEffect(() => {
    loadDoctorData();
  }, [statusFilter, dateFilter]);

  const handleUpdateStatus = async (appId, newStatus, notes = null) => {
    try {
      await api.updateDoctorAppointmentStatus(appId, newStatus, notes);
      setSuccessMsg(`Appointment status updated to ${newStatus}.`);
      setActiveConsultationApp(null);
      setClinicalNotes('');
      loadDoctorData();
    } catch (err) {
      setError(err.message || 'Failed to update appointment status.');
    }
  };

  const handleToggleAvailability = async () => {
    try {
      const nextVal = !isAvailable;
      await api.updateDoctorAvailability(nextVal);
      setIsAvailable(nextVal);
      setSuccessMsg(`Practice status updated to ${nextVal ? 'Available' : 'Unavailable'}.`);
    } catch (err) {
      setError(err.message || 'Failed to toggle availability.');
    }
  };

  const handleSaveSchedules = async (e) => {
    e.preventDefault();
    try {
      await api.updateDoctorSchedules(weeklySchedules);
      setSuccessMsg('Weekly consultation schedule saved successfully.');
      setShowScheduleModal(false);
    } catch (err) {
      setError(err.message || 'Failed to save schedules.');
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

  return (
    <div style={{ padding: '2.5rem 0' }}>
      <div className="container">
        {/* Doctor Header Banner */}
        <div className="card" style={{ padding: '2rem', marginBottom: '2rem', background: 'linear-gradient(to right, #ffffff, #f0fdfa)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{
                width: '4rem',
                height: '4rem',
                borderRadius: '9999px',
                backgroundColor: '#0d9488',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.35rem'
              }}>
                {user?.full_name?.split(' ').map(n => n[0]).join('') || 'DR'}
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Doctor Clinical Console
                </div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
                  {profile?.full_name || user?.full_name}
                </h1>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  {profile?.department_name} &bull; {profile?.specialization} &bull; {profile?.room_number}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              {/* Availability Toggle */}
              <button
                onClick={handleToggleAvailability}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {isAvailable ? <ToggleRight size={20} color="#059669" /> : <ToggleLeft size={20} color="#dc2626" />}
                <span>Status: <strong>{isAvailable ? 'Taking Patients' : 'Away / Off Duty'}</strong></span>
              </button>

              {/* Schedule Manager Trigger */}
              <button
                onClick={() => setShowScheduleModal(true)}
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
              >
                <Settings size={16} />
                <span>Manage Schedule</span>
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
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

        {/* Filter Bar */}
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.75rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0f172a' }}>
            Assigned Consultations ({appointments.length})
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                style={{ padding: '0.45rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: '0.45rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.85rem', backgroundColor: '#ffffff' }}
              >
                <option value="">All Statuses</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {(dateFilter || statusFilter) && (
              <button
                onClick={() => { setDateFilter(''); setStatusFilter(''); }}
                className="btn btn-secondary btn-sm"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Appointments Ledger */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            Loading doctor schedule...
          </div>
        ) : appointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', backgroundColor: '#ffffff', borderRadius: '0.75rem', border: '1px dashed #cbd5e1' }}>
            <Calendar size={40} color="#94a3b8" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>No Appointments Found</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              There are no patient appointments matching your current filter criteria.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {appointments.map((app) => (
              <div key={app.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '3.25rem',
                    height: '3.25rem',
                    borderRadius: '0.5rem',
                    backgroundColor: '#f0fdfa',
                    color: '#0d9488',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    flexShrink: 0
                  }}>
                    <span>{app.slot_time}</span>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>{app.patient_name}</h4>
                      {getStatusBadge(app.status)}
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.375rem', fontSize: '0.85rem', color: '#64748b' }}>
                      <div>Appt #: <strong>{app.appointment_number}</strong></div>
                      <div>Date: <strong>{app.appointment_date}</strong></div>
                      <div>Contact: <strong>{app.patient_phone || app.patient_email}</strong></div>
                      {app.patient_blood && <div>Blood: <strong>{app.patient_blood}</strong></div>}
                    </div>

                    {app.patient_symptoms && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#334155', backgroundColor: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '0.375rem' }}>
                        <strong>Symptoms:</strong> {app.patient_symptoms}
                      </div>
                    )}

                    {app.doctor_notes && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#0f766e', backgroundColor: '#f0fdfa', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #ccfbf1' }}>
                        <strong>Clinical Notes:</strong> {app.doctor_notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {app.status === 'Pending' && (
                    <button
                      onClick={() => handleUpdateStatus(app.id, 'Confirmed')}
                      className="btn btn-primary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      <Check size={14} />
                      <span>Accept / Confirm</span>
                    </button>
                  )}

                  {app.status === 'Confirmed' && (
                    <button
                      onClick={() => {
                        setActiveConsultationApp(app);
                        setClinicalNotes(app.doctor_notes || '');
                      }}
                      className="btn btn-primary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      <FileText size={14} />
                      <span>Complete Consultation</span>
                    </button>
                  )}

                  {(app.status === 'Pending' || app.status === 'Confirmed') && (
                    <button
                      onClick={() => handleUpdateStatus(app.id, 'Cancelled', 'Cancelled by doctor due to schedule realignment')}
                      className="btn btn-danger btn-sm"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ========================================================================= */}
        {/* Complete Consultation Modal                                              */}
        {/* ========================================================================= */}
        {activeConsultationApp && (
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
            <div style={{ backgroundColor: '#ffffff', borderRadius: '1rem', maxWidth: '500px', width: '100%', padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
                Complete Consultation
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
                Patient: <strong>{activeConsultationApp.patient_name}</strong> (Appt #{activeConsultationApp.appointment_number})
              </p>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.375rem' }}>
                  Doctor Clinical Observations / Prescriptions
                </label>
                <textarea
                  rows={4}
                  required
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  placeholder="Enter medical diagnosis, advice, or follow-up instructions..."
                  style={{ width: '100%', padding: '0.625rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button onClick={() => setActiveConsultationApp(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateStatus(activeConsultationApp.id, 'Completed', clinicalNotes)}
                  className="btn btn-primary"
                >
                  Save & Complete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* Doctor Schedule Manager Modal                                            */}
        {/* ========================================================================= */}
        {showScheduleModal && (
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
            <div style={{ backgroundColor: '#ffffff', borderRadius: '1rem', maxWidth: '580px', width: '100%', padding: '1.75rem', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  Configure Consultation Hours
                </h3>
                <button onClick={() => setShowScheduleModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveSchedules} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => {
                  const existing = weeklySchedules.find(s => s.day_of_week === day);
                  const isDayActive = !!existing;

                  return (
                    <div key={day} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                      <div style={{ width: '110px', fontWeight: 600, color: '#1e293b' }}>
                        {day}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="time"
                          value={existing?.start_time || '09:00'}
                          disabled={!isDayActive}
                          onChange={(e) => {
                            const val = e.target.value;
                            setWeeklySchedules(prev => {
                              const updated = prev.filter(s => s.day_of_week !== day);
                              return [...updated, { day_of_week: day, start_time: val, end_time: existing?.end_time || '13:00', slot_duration_minutes: 30 }];
                            });
                          }}
                          style={{ padding: '0.35rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                        />
                        <span>to</span>
                        <input
                          type="time"
                          value={existing?.end_time || '13:00'}
                          disabled={!isDayActive}
                          onChange={(e) => {
                            const val = e.target.value;
                            setWeeklySchedules(prev => {
                              const updated = prev.filter(s => s.day_of_week !== day);
                              return [...updated, { day_of_week: day, start_time: existing?.start_time || '09:00', end_time: val, slot_duration_minutes: 30 }];
                            });
                          }}
                          style={{ padding: '0.35rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                        />
                      </div>

                      <div>
                        <button
                          type="button"
                          onClick={() => {
                            if (isDayActive) {
                              setWeeklySchedules(weeklySchedules.filter(s => s.day_of_week !== day));
                            } else {
                              setWeeklySchedules([...weeklySchedules, { day_of_week: day, start_time: '09:00', end_time: '13:00', slot_duration_minutes: 30 }]);
                            }
                          }}
                          style={{
                            padding: '0.35rem 0.65rem',
                            borderRadius: '0.375rem',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            backgroundColor: isDayActive ? '#dcfce7' : '#f1f5f9',
                            color: isDayActive ? '#15803d' : '#64748b'
                          }}
                        >
                          {isDayActive ? 'Active' : 'Off'}
                        </button>
                      </div>
                    </div>
                  );
                })}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                  <button type="button" onClick={() => setShowScheduleModal(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Consultation Hours
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
