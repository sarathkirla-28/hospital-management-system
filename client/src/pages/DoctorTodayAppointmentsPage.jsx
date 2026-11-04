import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { api } from '../api';
import { Calendar, Clock, User, Phone, Check, X, FileText, CheckCircle, AlertCircle, Eye } from 'lucide-react';

export default function DoctorTodayAppointmentsPage({ activePage, setActivePage, isHistory = false }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Complete consultation modal
  const [activeConsultationApp, setActiveConsultationApp] = useState(null);
  const [clinicalNotes, setClinicalNotes] = useState('');

  // Patient detail modal
  const [viewPatientApp, setViewPatientApp] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.getDoctorAppointments();
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

  const handleUpdateStatus = async (appId, status, notes = null) => {
    try {
      await api.updateDoctorAppointmentStatus(appId, status, notes);
      setSuccess(`Consultation marked as ${status}.`);
      setActiveConsultationApp(null);
      setClinicalNotes('');
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

  const filtered = appointments.filter(a => {
    if (isHistory) return a.status === 'Completed' || a.status === 'Cancelled';
    return a.status === 'Confirmed' || a.status === 'Pending';
  });

  return (
    <DashboardLayout
      title={isHistory ? "Doctor Consultation History" : "Today's Consultation Schedule"}
      subtitle={isHistory ? "Completed consultations and medical notes archive" : "Active patient queue, clinical diagnosis, and status progression"}
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
          onClick={() => setActivePage('doctor-today')}
          style={{
            background: 'none', border: 'none', padding: '0.75rem 0.5rem', fontSize: '0.95rem',
            fontWeight: !isHistory ? 700 : 500, color: !isHistory ? '#0d9488' : '#64748b',
            borderBottom: !isHistory ? '3px solid #0d9488' : '3px solid transparent', cursor: 'pointer'
          }}
        >
          Active Consultations
        </button>
        <button
          onClick={() => setActivePage('doctor-history')}
          style={{
            background: 'none', border: 'none', padding: '0.75rem 0.5rem', fontSize: '0.95rem',
            fontWeight: isHistory ? 700 : 500, color: isHistory ? '#0d9488' : '#64748b',
            borderBottom: isHistory ? '3px solid #0d9488' : '3px solid transparent', cursor: 'pointer'
          }}
        >
          Consultation Archive
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading patient queue...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', backgroundColor: '#ffffff', borderRadius: '0.75rem', border: '1px dashed #cbd5e1' }}>
          <Calendar size={40} color="#94a3b8" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>
            {isHistory ? 'No Past Records' : 'No Active Appointments in Queue'}
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            {isHistory ? 'No past consultation history on file.' : 'You have completed all pending consultations for today.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map(app => (
            <div key={app.id} className="card card-hover" style={{ padding: '1.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                <div style={{
                  width: '3.5rem', height: '3.5rem', borderRadius: '0.5rem', backgroundColor: '#f0fdfa',
                  color: '#0d9488', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '0.9rem', flexShrink: 0
                }}>
                  <span>{app.slot_time}</span>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>{app.patient_name}</h4>
                    {getStatusBadge(app.status)}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
                    Appt <strong>{app.appointment_number}</strong> &bull; Date: <strong>{app.appointment_date}</strong> &bull; Contact: <strong>{app.patient_phone || app.patient_email}</strong>
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

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setViewPatientApp(app)}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  <Eye size={14} />
                  <span>Patient Info</span>
                </button>

                {app.status === 'Pending' && (
                  <button
                    onClick={() => handleUpdateStatus(app.id, 'Confirmed')}
                    className="btn btn-primary btn-sm"
                  >
                    Accept
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
                    <span>Complete Visit</span>
                  </button>
                )}

                {(app.status === 'Pending' || app.status === 'Confirmed') && (
                  <button
                    onClick={() => handleUpdateStatus(app.id, 'Cancelled', 'Cancelled by doctor due to schedule change')}
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

      {/* Patient Info Modal */}
      {viewPatientApp && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.7)', zIndex: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '1rem', maxWidth: '480px', width: '100%', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Patient Clinical Record</h3>
              <button onClick={() => setViewPatientApp(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <div><strong>Name:</strong> {viewPatientApp.patient_name}</div>
              <div><strong>Email:</strong> {viewPatientApp.patient_email}</div>
              <div><strong>Phone:</strong> {viewPatientApp.patient_phone || 'N/A'}</div>
              <div><strong>Appointment #:</strong> {viewPatientApp.appointment_number}</div>
              <div><strong>Scheduled For:</strong> {viewPatientApp.appointment_date} at {viewPatientApp.slot_time}</div>
              <div><strong>Symptoms / Reason:</strong> {viewPatientApp.patient_symptoms || 'None recorded'}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button onClick={() => setViewPatientApp(null)} className="btn btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Consultation Modal */}
      {activeConsultationApp && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.7)', zIndex: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '1rem', maxWidth: '500px', width: '100%', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>Complete Consultation</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Patient: <strong>{activeConsultationApp.patient_name}</strong> (#{activeConsultationApp.appointment_number})
            </p>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Clinical Observations / Prescription Notes
              </label>
              <textarea
                rows={4}
                required
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                placeholder="Enter clinical assessment, prescription notes, or diet advice..."
                style={{ width: '100%', padding: '0.625rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={() => setActiveConsultationApp(null)} className="btn btn-secondary">Cancel</button>
              <button onClick={() => handleUpdateStatus(activeConsultationApp.id, 'Completed', clinicalNotes)} className="btn btn-primary">
                Save & Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
