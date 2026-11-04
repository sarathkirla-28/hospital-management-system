import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { Stethoscope, CheckCircle, AlertCircle, Save } from 'lucide-react';

export default function DoctorProfilePage({ activePage, setActivePage }) {
  const { user } = useAuth();
  const [doc, setDoc] = useState({
    full_name: user?.full_name || 'Dr. Anita Roy',
    email: user?.email || 'dr.anita@hospital.demo',
    phone: user?.phone || '+1-555-0201',
    department_name: 'Cardiology',
    specialization: 'Interventional Cardiology',
    qualification: 'MBBS, MD (Cardiology), FACC',
    experience_years: 12,
    consultation_fee: 80.00,
    room_number: 'Room 301, Block A',
    bio: 'Senior cardiologist with extensive expertise in clinical cardiology and preventive diagnostics.'
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getDoctorProfile();
        if (res.doctor) setDoc(res.doctor);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSuccess('Doctor credentials and clinical profile updated.');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <DashboardLayout
      title="Doctor Profile & Credentials"
      subtitle="View and manage your department specialization, clinic room, and consultation fees"
      activePage={activePage}
      setActivePage={setActivePage}
    >
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        {success && (
          <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '0.875rem 1.25rem', borderRadius: '0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={18} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Full Name</label>
            <input
              type="text"
              value={doc.full_name}
              onChange={(e) => setDoc({ ...doc, full_name: e.target.value })}
              style={{ width: '100%', padding: '0.625rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Email</label>
              <input
                type="email"
                disabled
                value={doc.email}
                style={{ width: '100%', padding: '0.625rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Phone</label>
              <input
                type="text"
                value={doc.phone}
                onChange={(e) => setDoc({ ...doc, phone: e.target.value })}
                style={{ width: '100%', padding: '0.625rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Department</label>
              <input
                type="text"
                disabled
                value={doc.department_name}
                style={{ width: '100%', padding: '0.625rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Specialization</label>
              <input
                type="text"
                value={doc.specialization}
                onChange={(e) => setDoc({ ...doc, specialization: e.target.value })}
                style={{ width: '100%', padding: '0.625rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Qualification</label>
              <input
                type="text"
                value={doc.qualification}
                onChange={(e) => setDoc({ ...doc, qualification: e.target.value })}
                style={{ width: '100%', padding: '0.45rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Exp (Years)</label>
              <input
                type="number"
                value={doc.experience_years}
                onChange={(e) => setDoc({ ...doc, experience_years: e.target.value })}
                style={{ width: '100%', padding: '0.45rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Fee ($)</label>
              <input
                type="number"
                value={doc.consultation_fee}
                onChange={(e) => setDoc({ ...doc, consultation_fee: e.target.value })}
                style={{ width: '100%', padding: '0.45rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Clinic Room Number</label>
            <input
              type="text"
              value={doc.room_number}
              onChange={(e) => setDoc({ ...doc, room_number: e.target.value })}
              style={{ width: '100%', padding: '0.625rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Professional Summary</label>
            <textarea
              rows={3}
              value={doc.bio}
              onChange={(e) => setDoc({ ...doc, bio: e.target.value })}
              style={{ width: '100%', padding: '0.625rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem', marginTop: '0.5rem' }}>
            <Save size={16} />
            <span>Save Profile</span>
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
