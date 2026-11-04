import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { api } from '../api';
import { Activity, Plus, CheckCircle, AlertCircle, X, Stethoscope } from 'lucide-react';

export default function AdminDepartmentsPage({ activePage, setActivePage }) {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDept, setNewDept] = useState({ name: '', code: '', description: '', head_doctor: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.getDepartments();
      setDepartments(res.departments || []);
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
      await api.addDepartment(newDept);
      setSuccess(`Department ${newDept.name} created successfully.`);
      setShowAddModal(false);
      setNewDept({ name: '', code: '', description: '', head_doctor: '' });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <DashboardLayout
      title="Clinical Departments Management"
      subtitle="Configure hospital medical departments, unit codes, and faculty head physicians"
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

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        <button onClick={() => setShowAddModal(true)} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <Plus size={16} />
          <span>Add Department</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {departments.map(dept => (
          <div key={dept.id} className="card card-hover" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span className="badge badge-active">{dept.code}</span>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                {dept.doctor_count || 0} Specialists
              </span>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              {dept.name}
            </h3>

            <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1.25rem', flexGrow: 1 }}>
              {dept.description}
            </p>

            <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '0.375rem', fontSize: '0.825rem', color: '#334155' }}>
              Head of Department: <strong>{dept.head_doctor || 'Faculty Board'}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Add Department Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.7)', zIndex: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '1rem', maxWidth: '480px', width: '100%', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Add Clinical Department</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Department Name *</label>
                <input
                  type="text" required value={newDept.name}
                  onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                  placeholder="e.g. Oncology"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Code *</label>
                  <input
                    type="text" required value={newDept.code}
                    onChange={(e) => setNewDept({ ...newDept, code: e.target.value.toUpperCase() })}
                    placeholder="ONCO"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Head Doctor</label>
                  <input
                    type="text" value={newDept.head_doctor}
                    onChange={(e) => setNewDept({ ...newDept, head_doctor: e.target.value })}
                    placeholder="Dr. Name"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Description</label>
                <textarea
                  rows={3} required value={newDept.description}
                  onChange={(e) => setNewDept({ ...newDept, description: e.target.value })}
                  placeholder="Clinical mandate and diagnostic services provided..."
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Create Department</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
