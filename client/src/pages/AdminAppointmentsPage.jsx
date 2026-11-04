import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { api } from '../api';
import { Calendar, Search, Filter, AlertCircle, CheckCircle, Eye, X } from 'lucide-react';

export default function AdminAppointmentsPage({ activePage, setActivePage }) {
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminAppointments();
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

  const handleStatusOverride = async (appId, newStatus) => {
    try {
      await api.updateAppointmentStatusByAdmin(appId, newStatus, 'Status overridden by Administrator');
      setSuccess(`Appointment status set to ${newStatus}.`);
      load();
      if (selectedApp && selectedApp.id === appId) {
        setSelectedApp({ ...selectedApp, status: newStatus });
      }
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
    const matchSearch = (
      a.appointment_number?.toLowerCase().includes(search.toLowerCase()) ||
      a.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
      a.doctor_name?.toLowerCase().includes(search.toLowerCase())
    );
    const matchStatus = statusFilter ? a.status === statusFilter : true;
    return matchSearch && matchStatus;
  });

  return (
    <DashboardLayout
      title="Master Appointments Oversight"
      subtitle="Complete ledger of all scheduled, active, completed, and cancelled consultations"
      activePage={activePage}
      setActivePage={setActivePage}
    >
      {success && (
        <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '0.875rem 1.25rem', borderRadius: '0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.875rem 1.25rem', borderRadius: '0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flexGrow: 1, minWidth: '220px' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by appointment #, patient, or doctor..."
            style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
          />
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.85rem', backgroundColor: '#ffffff' }}
          >
            <option value="">All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
              <th style={{ padding: '0.875rem 1rem' }}>Appt #</th>
              <th style={{ padding: '0.875rem 1rem' }}>Patient Name</th>
              <th style={{ padding: '0.875rem 1rem' }}>Doctor & Department</th>
              <th style={{ padding: '0.875rem 1rem' }}>Date & Slot</th>
              <th style={{ padding: '0.875rem 1rem' }}>Status</th>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(app => (
              <tr key={app.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: '#0d9488' }}>
                  {app.appointment_number}
                </td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{app.patient_name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{app.patient_phone || app.patient_email}</div>
                </td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{app.doctor_name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#0284c7' }}>{app.department_name} ({app.room_number})</div>
                </td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <div>{app.appointment_date}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{app.slot_time}</div>
                </td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  {getStatusBadge(app.status)}
                </td>
                <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '0.375rem' }}>
                    <button
                      onClick={() => setSelectedApp(app)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                    >
                      <Eye size={12} />
                      <span>Details</span>
                    </button>
                    {app.status !== 'Confirmed' && (
                      <button
                        onClick={() => handleStatusOverride(app.id, 'Confirmed')}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      >
                        Confirm
                      </button>
                    )}
                    {app.status !== 'Cancelled' && (
                      <button
                        onClick={() => handleStatusOverride(app.id, 'Cancelled')}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Details Modal */}
      {selectedApp && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.7)', zIndex: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '1rem', maxWidth: '500px', width: '100%', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0d9488' }}>{selectedApp.appointment_number}</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Consultation Audit Record</h3>
              </div>
              <button onClick={() => setSelectedApp(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.9rem' }}>
              <div><strong>Patient:</strong> {selectedApp.patient_name} ({selectedApp.patient_phone || selectedApp.patient_email})</div>
              <div><strong>Doctor:</strong> {selectedApp.doctor_name} ({selectedApp.department_name})</div>
              <div><strong>Room:</strong> {selectedApp.room_number} &bull; Fee: ${Number(selectedApp.consultation_fee).toFixed(2)}</div>
              <div><strong>Date & Time:</strong> {selectedApp.appointment_date} at {selectedApp.slot_time}</div>
              <div><strong>Status:</strong> {getStatusBadge(selectedApp.status)}</div>
              <div><strong>Patient Symptoms:</strong> {selectedApp.patient_symptoms || 'None recorded'}</div>
              {selectedApp.doctor_notes && (
                <div style={{ backgroundColor: '#f0fdfa', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #ccfbf1' }}>
                  <strong>Doctor Notes:</strong> {selectedApp.doctor_notes}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button onClick={() => setSelectedApp(null)} className="btn btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
