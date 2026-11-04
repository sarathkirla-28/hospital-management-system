import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, Phone, CheckCircle, Save } from 'lucide-react';

export default function AdminProfilePage({ activePage, setActivePage }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    full_name: user?.full_name || 'System Administrator',
    email: user?.email || 'admin@hospital.demo',
    phone: user?.phone || '+1-555-0100'
  });
  const [success, setSuccess] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    setSuccess('Administrator security credentials and contact info updated.');
  };

  return (
    <DashboardLayout
      title="Administrator Security & Profile"
      subtitle="Administrative contact configuration and system oversight identity"
      activePage={activePage}
      setActivePage={setActivePage}
    >
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {success && (
          <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '0.875rem 1.25rem', borderRadius: '0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={18} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Administrator Name</label>
            <input
              type="text"
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              style={{ width: '100%', padding: '0.625rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Email Address</label>
            <input
              type="email"
              disabled
              value={profile.email}
              style={{ width: '100%', padding: '0.625rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Emergency Desk Telephone</label>
            <input
              type="text"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              style={{ width: '100%', padding: '0.625rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div style={{ backgroundColor: '#f0fdfa', border: '1px solid #ccfbf1', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.85rem', color: '#0f766e' }}>
            <strong>Security Notice:</strong> As designated system administrator, your account possesses superuser clearance to override appointment states, liberate double-booked slots, activate user records, and generate audit reports.
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem', marginTop: '0.5rem' }}>
            <Save size={16} />
            <span>Update Admin Profile</span>
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
