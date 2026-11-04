import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { api } from '../api';
import { Calendar, Clock, MapPin, RefreshCw, X, Eye, FileText, CheckCircle, AlertCircle, Plus } from 'lucide-react';

export default function PatientAppointmentsPage({ activePage, setActivePage, isHistoryView = false }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals
  const [selectedDetailsApp, setSelectedDetailsApp] = useState(null);
  const [reschedulingApp, setReschedulingApp] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleSlots, setRescheduleSlots] = useState([]);
  const [rescheduleSelectedSlot, setRescheduleSelectedSlot] = useState('');
  const [cancellingApp, setCancellingApp] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.getPatientAppointments();
      setAppointments(res.appointments || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

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
        console.error('Failed to load slots for reschedule:', err);
      }
    }
    fetchRescheduleSlots();
  }, [reschedulingApp, rescheduleDate]);

  const handleCancel = async () => {
    if (!cancellingApp) return;
    try {
      await api.cancelAppointment(cancellingApp.id, cancelReason);
      setSuccess(`Appointment #${cancellingApp.appointment_number} cancelled.`);
      setCancellingApp(null);
      setCancelReason('');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReschedule = async () => {
    if (!reschedulingApp || !rescheduleDate || !rescheduleSelectedSlot) return;
    try {
      await api.rescheduleAppointment(reschedulingApp.id, rescheduleDate, rescheduleSelectedSlot);
      setSuccess('Appointment successfully rescheduled.');
      setReschedulingApp(null);
      load();
    } catch (err) {
      setError(err.message);
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

  // Filter for active vs history
  const filteredApps = appointments.filter(a => {
    if (isHistoryView) return a.status === 'Completed' || a.status === 'Cancelled';
    return a.status === 'Confirmed' || a.status === 'Pending';
  });

  return (
    <DashboardLayout
      title={isHistoryView ? 'Appointment Consultation History' : 'My Scheduled Consultations'}
      subtitle={isHistoryView ? 'Review past medical visits, diagnoses, and completed consultations' : 'Track upcoming appointments, reschedule slots, or cancel reservations'}
      activePage={activePage}
      setActivePage={setActivePage}
    >
      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.875rem 1.25rem', borderRadius: '0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '0.875rem 1.25rem', borderRadius: '0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #cbd5e1', marginBottom: '1.75rem', gap: '1.5rem' }}>
        <button
          onClick={() => setActivePage('patient-appointments')}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.75rem 0.5rem',
            fontSize: '0.95rem',
            fontWeight: !isHistoryView ? 700 : 500,
            color: !isHistoryView ? '#0d9488' : '#64748b',
            borderBottom: !isHistoryView ? '3px solid #0d9488' : '3px solid transparent',
            cursor: 'pointer'
          }}
        >
          Upcoming Appointments
        </button>
        <button
          onClick={() => setActivePage('patient-history')}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.75rem 0.5rem',
            fontSize: '0.95rem',
            fontWeight: isHistoryView ? 700 : 500,
            color: isHistoryView ? '#0d9488' : '#64748b',
            borderBottom: isHistoryView ? '3px solid #0d9488' : '3px solid transparent',
            cursor: 'pointer'
          }}
        >
          Past Consultation History
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading consultations...</div>
      ) : filteredApps.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', backgroundColor: '#ffffff', borderRadius: '0.75rem', border: '1px dashed #cbd5e1' }}>
          <Calendar size={40} color="#94a3b8" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>
            {isHistoryView ? 'No Past Appointment History' : 'No Upcoming Consultations'}
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem', marginBottom: '1.25rem' }}>
            {isHistoryView ? 'You have no completed or cancelled appointment records.' : 'You have no upcoming consultations scheduled.'}
          </p>
          {!isHistoryView && (
            <button onClick={() => setActivePage('patient-book')} className="btn btn-primary">
              <Plus size={16} />
              <span>Book Appointment Now</span>
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filteredApps.map(app => (
            <div key={app.id} className="card card-hover" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0d9488', letterSpacing: '0.05em' }}>
                  {app.appointment_number}
                </span>
                {getStatusBadge(app.status)}
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>{app.doctor_name}</h3>
              <div style={{ fontSize: '0.85rem', color: '#0d9488', fontWeight: 600 }}>{app.department_name}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>{app.specialization}</div>

              <div style={{ backgroundColor: '#f8fafc', padding: '0.875rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>Date: <strong>{app.appointment_date}</strong></div>
                <div>Slot: <strong>{app.slot_time}</strong></div>
                <div>Room: <strong>{app.room_number}</strong></div>
                <div>Fee: <strong>${Number(app.consultation_fee).toFixed(2)}</strong></div>
              </div>

              {app.patient_symptoms && (
                <div style={{ fontSize: '0.825rem', color: '#475569', marginBottom: '0.75rem' }}>
                  <strong>Reason:</strong> {app.patient_symptoms}
                </div>
              )}

              {app.doctor_notes && (
                <div style={{ backgroundColor: '#f0fdfa', border: '1px solid #ccfbf1', padding: '0.625rem', borderRadius: '0.375rem', fontSize: '0.8rem', color: '#0f766e', marginBottom: '1rem' }}>
                  <strong>Doctor Notes:</strong> {app.doctor_notes}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                <button
                  onClick={() => setSelectedDetailsApp(app)}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                >
                  <Eye size={14} />
                  <span>View Details</span>
                </button>

                {(app.status === 'Confirmed' || app.status === 'Pending') && (
                  <>
                    <button
                      onClick={() => {
                        setReschedulingApp(app);
                        setRescheduleDate(app.appointment_date);
                      }}
                      className="btn btn-secondary btn-sm"
                      title="Reschedule"
                    >
                      <RefreshCw size={14} />
                    </button>
                    <button
                      onClick={() => setCancellingApp(app)}
                      className="btn btn-danger btn-sm"
                      title="Cancel"
                    >
                      <X size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Appointment Details Modal */}
      {selectedDetailsApp && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.7)',
          zIndex: 80,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '1rem', maxWidth: '500px', width: '100%', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0d9488' }}>{selectedDetailsApp.appointment_number}</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Consultation Details</h3>
              </div>
              <button onClick={() => setSelectedDetailsApp(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <div><strong>Doctor:</strong> {selectedDetailsApp.doctor_name} ({selectedDetailsApp.department_name})</div>
              <div><strong>Room / Clinic:</strong> {selectedDetailsApp.room_number}</div>
              <div><strong>Date & Time:</strong> {selectedDetailsApp.appointment_date} at {selectedDetailsApp.slot_time}</div>
              <div><strong>Fee:</strong> ${Number(selectedDetailsApp.consultation_fee).toFixed(2)}</div>
              <div><strong>Status:</strong> {getStatusBadge(selectedDetailsApp.status)}</div>
              <div><strong>Patient Symptoms:</strong> {selectedDetailsApp.patient_symptoms || 'None recorded'}</div>
              {selectedDetailsApp.doctor_notes && (
                <div style={{ backgroundColor: '#f0fdfa', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccfbf1' }}>
                  <strong>Doctor Clinical Notes:</strong> {selectedDetailsApp.doctor_notes}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button onClick={() => setSelectedDetailsApp(null)} className="btn btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {reschedulingApp && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.7)', zIndex: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '1rem', maxWidth: '480px', width: '100%', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              Reschedule Appt #{reschedulingApp.appointment_number}
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Select a new date and available time slot with {reschedulingApp.doctor_name}.
            </p>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>New Date</label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
              />
            </div>

            {rescheduleDate && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.375rem' }}>Available Time Slots</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(85px, 1fr))', gap: '0.5rem' }}>
                  {rescheduleSlots.map(slot => (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => setRescheduleSelectedSlot(slot.time)}
                      style={{
                        padding: '0.45rem',
                        borderRadius: '0.375rem',
                        border: rescheduleSelectedSlot === slot.time ? '2px solid #0d9488' : '1px solid #cbd5e1',
                        backgroundColor: !slot.available ? '#fee2e2' : rescheduleSelectedSlot === slot.time ? '#f0fdfa' : '#ffffff',
                        color: !slot.available ? '#b91c1c' : rescheduleSelectedSlot === slot.time ? '#0d9488' : '#1e293b',
                        fontWeight: 600,
                        fontSize: '0.8rem',
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
              <button onClick={() => setReschedulingApp(null)} className="btn btn-secondary">Cancel</button>
              <button onClick={handleReschedule} disabled={!rescheduleSelectedSlot} className="btn btn-primary">Save New Slot</button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {cancellingApp && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.7)', zIndex: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '1rem', maxWidth: '440px', width: '100%', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              Cancel Appointment #{cancellingApp.appointment_number}?
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Are you sure? The consultation slot with {cancellingApp.doctor_name} on {cancellingApp.appointment_date} will be freed immediately for other patients.
            </p>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Reason for Cancellation</label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Rescheduled work hours"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={() => setCancellingApp(null)} className="btn btn-secondary">Keep</button>
              <button onClick={handleCancel} className="btn btn-danger">Confirm Cancel</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
