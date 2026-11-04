import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Stethoscope, User, Lock, Mail, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';

export default function LoginPage({ setActivePage, onLoginSuccess }) {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState('patient');
  const [email, setEmail] = useState('john.patient@hospital.demo');
  const [password, setPassword] = useState('Patient123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError('');
    if (role === 'admin') {
      setEmail('admin@hospital.demo');
      setPassword('Admin123!');
    } else if (role === 'doctor') {
      setEmail('dr.anita@hospital.demo');
      setPassword('Doctor123!');
    } else {
      setEmail('john.patient@hospital.demo');
      setPassword('Patient123!');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login(email, password, selectedRole);
      if (onLoginSuccess) onLoginSuccess(user);
      if (user.role === 'admin') setActivePage('admin-dashboard');
      else if (user.role === 'doctor') setActivePage('doctor-dashboard');
      else setActivePage('patient-dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '4rem 1rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="card" style={{ maxWidth: '460px', width: '100%', padding: '2.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
        <button
          onClick={() => setActivePage('home')}
          style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#64748b', cursor: 'pointer', fontSize: '0.85rem', marginBottom: '1.5rem' }}
        >
          <ArrowLeft size={16} />
          <span>Return Home</span>
        </button>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Sign In to Portal</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>Select your account role to continue</p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '0.5rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Role tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', backgroundColor: '#f1f5f9', padding: '0.375rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
          {['patient', 'doctor', 'admin'].map(r => (
            <button
              key={r}
              type="button"
              onClick={() => handleRoleSelect(r)}
              style={{
                padding: '0.5rem',
                border: 'none',
                borderRadius: '0.375rem',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                backgroundColor: selectedRole === r ? '#ffffff' : 'transparent',
                color: selectedRole === r ? '#0d9488' : '#64748b',
                boxShadow: selectedRole === r ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                textTransform: 'capitalize'
              }}
            >
              {r}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.375rem' }}>Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.375rem' }}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '0.75rem', marginTop: '0.5rem' }}>
            {loading ? 'Authenticating...' : `Log In as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: '#64748b' }}>
          Don't have an account?{' '}
          <button
            onClick={() => setActivePage('register')}
            style={{ background: 'none', border: 'none', color: '#0d9488', fontWeight: 700, cursor: 'pointer' }}
          >
            Register as Patient
          </button>
        </div>
      </div>
    </div>
  );
}
