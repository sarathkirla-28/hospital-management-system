import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { api } from '../api';
import { Stethoscope, Plus, Edit2, Search, AlertCircle, CheckCircle, X, Save } from 'lucide-react';

export default function AdminDoctorsPage({ activePage, setActivePage }) {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Add Form
  const [newDoc, setNewDoc] = useState({
    full_name: '', email: '', password: '', phone: '', department_id: '',
    specialization: '', qualification: 'MD', experience_years: '5', consultation_fee: '75',
    room_number: 'Room 201', bio: ''
  });

  const load = async () => {
    try {
      setLoading(true);
      const [docRes, deptRes] = await Promise.all([
        api.getAdminDoctors(),
        api.getDepartments()
      ]);
      setDoctors(docRes.doctors || []);
      setDepartments(deptRes.departments || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.addDoctor(newDoc);
      setSuccess('New doctor created with active weekly consultation schedule.');
      setShowAddModal(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.updateDoctor(editingDoctor.id, editingDoctor);
      setSuccess(`Doctor ${editingDoctor.full_name} updated successfully.`);
      setEditingDoctor(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleStatus = async (userId, status) => {
    try {
      const next = status === 'active' ? 'inactive' : 'active';
      await api.toggleUserStatus(userId, next);
      setSuccess(`Doctor account status set to ${next}.`);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredDoctors = doctors.filter(d =>
    d.full_name.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization.toLowerCase().includes(search.toLowerCase()) ||
    d.department_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout
      title="Medical Faculty & Doctors Directory"
      subtitle="Oversee medical specialists, add new staff accounts, and configure consultation fees"
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

      {/* Header Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ flexGrow: 1, maxWidth: '400px' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by doctor, specialty, or department..."
            style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
          />
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
        >
          <Plus size={16} />
          <span>Add New Doctor</span>
        </button>
      </div>

      {/* Doctors Table */}
      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
              <th style={{ padding: '0.875rem 1rem' }}>Doctor</th>
              <th style={{ padding: '0.875rem 1rem' }}>Department & Spec</th>
              <th style={{ padding: '0.875rem 1rem' }}>Clinic Room</th>
              <th style={{ padding: '0.875rem 1rem' }}>Consultation Fee</th>
              <th style={{ padding: '0.875rem 1rem' }}>Duty Status</th>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDoctors.map(doc => (
              <tr key={doc.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{doc.full_name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{doc.email}</div>
                </td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <div style={{ fontWeight: 600, color: '#0d9488' }}>{doc.department_name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{doc.specialization}</div>
                </td>
                <td style={{ padding: '0.875rem 1rem' }}>{doc.room_number}</td>
                <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: '#0f172a' }}>
                  ${Number(doc.consultation_fee).toFixed(2)}
                </td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <span className={`badge ${doc.is_available ? 'badge-confirmed' : 'badge-inactive'}`}>
                    {doc.is_available ? 'Available' : 'Away'}
                  </span>
                </td>
                <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '0.375rem' }}>
                    <button
                      onClick={() => setEditingDoctor({ ...doc })}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                    >
                      <Edit2 size={12} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleToggleStatus(doc.user_id, doc.status)}
                      className={`btn ${doc.status === 'active' ? 'btn-danger' : 'btn-primary'} btn-sm`}
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                    >
                      {doc.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Doctor Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.7)', zIndex: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '1rem', maxWidth: '540px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Add New Doctor Account</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Full Doctor Name *</label>
                <input
                  type="text" required value={newDoc.full_name}
                  onChange={(e) => setNewDoc({ ...newDoc, full_name: e.target.value })}
                  placeholder="e.g. Dr. Arthur Dent"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Email *</label>
                  <input
                    type="email" required value={newDoc.email}
                    onChange={(e) => setNewDoc({ ...newDoc, email: e.target.value })}
                    placeholder="arthur@hospital.demo"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Password *</label>
                  <input
                    type="password" required value={newDoc.password}
                    onChange={(e) => setNewDoc({ ...newDoc, password: e.target.value })}
                    placeholder="••••••••"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Department *</label>
                  <select
                    required value={newDoc.department_id}
                    onChange={(e) => setNewDoc({ ...newDoc, department_id: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', backgroundColor: '#ffffff' }}
                  >
                    <option value="">-- Select --</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Specialization *</label>
                  <input
                    type="text" required value={newDoc.specialization}
                    onChange={(e) => setNewDoc({ ...newDoc, specialization: e.target.value })}
                    placeholder="e.g. Clinical Neurology"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Qualification</label>
                  <input
                    type="text" value={newDoc.qualification}
                    onChange={(e) => setNewDoc({ ...newDoc, qualification: e.target.value })}
                    style={{ width: '100%', padding: '0.45rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Exp (Yrs)</label>
                  <input
                    type="number" value={newDoc.experience_years}
                    onChange={(e) => setNewDoc({ ...newDoc, experience_years: e.target.value })}
                    style={{ width: '100%', padding: '0.45rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Fee ($)</label>
                  <input
                    type="number" value={newDoc.consultation_fee}
                    onChange={(e) => setNewDoc({ ...newDoc, consultation_fee: e.target.value })}
                    style={{ width: '100%', padding: '0.45rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Clinic Room Number</label>
                <input
                  type="text" value={newDoc.room_number}
                  onChange={(e) => setNewDoc({ ...newDoc, room_number: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Create Doctor</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Doctor Modal */}
      {editingDoctor && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.7)', zIndex: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '1rem', maxWidth: '500px', width: '100%', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Edit Doctor: {editingDoctor.full_name}</h3>
              <button onClick={() => setEditingDoctor(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Specialization</label>
                <input
                  type="text" value={editingDoctor.specialization}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, specialization: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Consultation Fee ($)</label>
                  <input
                    type="number" value={editingDoctor.consultation_fee}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, consultation_fee: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Clinic Room</label>
                  <input
                    type="text" value={editingDoctor.room_number}
                    onChange={(e) => setEditingDoctor({ ...editingDoctor, room_number: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Professional Summary</label>
                <textarea
                  rows={2} value={editingDoctor.bio}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, bio: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setEditingDoctor(null)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
