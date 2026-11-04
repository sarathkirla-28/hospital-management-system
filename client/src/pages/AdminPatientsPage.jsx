import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { api } from '../api';
import { Users, Search, AlertCircle, CheckCircle, Eye, X } from 'lucide-react';

export default function AdminPatientsPage({ activePage, setActivePage }) {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminPatients(search ? `?search=${search}` : '');
      setPatients(res.patients || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    load();
  };

  const handleToggle = async (userId, status) => {
    try {
      const next = status === 'active' ? 'inactive' : 'active';
      await api.toggleUserStatus(userId, next);
      setSuccess(`Account status updated to ${next}.`);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <DashboardLayout
      title="Registered Patients Management"
      subtitle="View, search, audit, and activate/deactivate patient accounts"
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

      {/* Search Header */}
      <form onSubmit={handleSearch} className="card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem' }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by patient name, email, or telephone number..."
          style={{ flexGrow: 1, padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
        />
        <button type="submit" className="btn btn-primary btn-sm">
          <Search size={16} />
          <span>Search</span>
        </button>
      </form>

      {/* Table */}
      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
              <th style={{ padding: '0.875rem 1rem' }}>Patient Name</th>
              <th style={{ padding: '0.875rem 1rem' }}>Contact Info</th>
              <th style={{ padding: '0.875rem 1rem' }}>Blood Group & DOB</th>
              <th style={{ padding: '0.875rem 1rem' }}>Consultations</th>
              <th style={{ padding: '0.875rem 1rem' }}>Status</th>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map(p => (
              <tr key={p.id || p.patient_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: '#0f172a' }}>
                  {p.full_name}
                </td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <div>{p.email}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.phone || 'No phone recorded'}</div>
                </td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <div>Blood: <strong>{p.blood_group || 'O+'}</strong></div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>DOB: {p.dob || '1990-01-01'}</div>
                </td>
                <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: '#0d9488' }}>
                  {p.total_bookings || 0} Visits
                </td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <span className={`badge ${p.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>
                    {p.status}
                  </span>
                </td>
                <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '0.375rem' }}>
                    <button
                      onClick={() => setSelectedPatient(p)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                    >
                      <Eye size={12} />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => handleToggle(p.user_id, p.status)}
                      className={`btn ${p.status === 'active' ? 'btn-danger' : 'btn-primary'} btn-sm`}
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                    >
                      {p.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedPatient && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.7)', zIndex: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '1rem', maxWidth: '480px', width: '100%', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Patient Dossier</h3>
              <button onClick={() => setSelectedPatient(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.9rem' }}>
              <div><strong>Name:</strong> {selectedPatient.full_name}</div>
              <div><strong>Email:</strong> {selectedPatient.email}</div>
              <div><strong>Phone:</strong> {selectedPatient.phone}</div>
              <div><strong>DOB:</strong> {selectedPatient.dob}</div>
              <div><strong>Gender:</strong> {selectedPatient.gender}</div>
              <div><strong>Blood Group:</strong> {selectedPatient.blood_group}</div>
              <div><strong>Address:</strong> {selectedPatient.address}</div>
              <div><strong>Emergency Contact:</strong> {selectedPatient.emergency_contact}</div>
              <div><strong>Account Status:</strong> {selectedPatient.status}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <button onClick={() => setSelectedPatient(null)} className="btn btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
