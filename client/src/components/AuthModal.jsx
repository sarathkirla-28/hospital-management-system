import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Shield, Stethoscope, User, Lock, Mail, Phone, Calendar, AlertCircle } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, initialMode = 'login', onLoginSuccess }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  const [selectedRole, setSelectedRole] = useState('patient'); // 'patient', 'doctor', 'admin'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Registration form state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regDob, setRegDob] = useState('');
  const [regGender, setRegGender] = useState('Male');
  const [regBlood, setRegBlood] = useState('O+');
  const [regAddress, setRegAddress] = useState('');

  if (!isOpen) return null;

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError('');
    if (role === 'admin') {
      setLoginEmail('admin@hospital.demo');
      setLoginPassword('Admin123!');
    } else if (role === 'doctor') {
      setLoginEmail('dr.anita@hospital.demo');
      setLoginPassword('Doctor123!');
    } else {
      setLoginEmail('john.patient@hospital.demo');
      setLoginPassword('Patient123!');
    }
  };

  const handleQuickFill = (role) => {
    handleRoleSelect(role);
    setMode('login');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(loginEmail, loginPassword, selectedRole);
      onClose();
      if (onLoginSuccess) onLoginSuccess(user);
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await register({
        full_name: regFullName,
        email: regEmail,
        password: regPassword,
        phone: regPhone,
        dob: regDob,
        gender: regGender,
        blood_group: regBlood,
        address: regAddress
      });
      onClose();
      if (onLoginSuccess) onLoginSuccess(user);
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '1rem',
        maxWidth: '480px',
        width: '100%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        overflow: 'hidden',
        position: 'relative',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f8fafc'
        }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
              {mode === 'login' ? 'Hospital Portal Access' : 'Patient Registration'}
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
              {mode === 'login' ? 'Select your role and sign in securely' : 'Create an account to book and manage appointments'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              padding: '0.25rem',
              borderRadius: '0.375rem'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
          {error && (
            <div style={{
              backgroundColor: '#fee2e2',
              color: '#b91c1c',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.25rem'
            }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {mode === 'login' ? (
            <>
              {/* Role Switcher Tabs */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.5rem',
                backgroundColor: '#f1f5f9',
                padding: '0.375rem',
                borderRadius: '0.625rem',
                marginBottom: '1.5rem'
              }}>
                <button
                  type="button"
                  onClick={() => handleRoleSelect('patient')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.375rem',
                    padding: '0.5rem 0.25rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    backgroundColor: selectedRole === 'patient' ? '#ffffff' : 'transparent',
                    color: selectedRole === 'patient' ? '#0d9488' : '#64748b',
                    boxShadow: selectedRole === 'patient' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  <User size={15} />
                  <span>Patient</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSelect('doctor')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.375rem',
                    padding: '0.5rem 0.25rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    backgroundColor: selectedRole === 'doctor' ? '#ffffff' : 'transparent',
                    color: selectedRole === 'doctor' ? '#0d9488' : '#64748b',
                    boxShadow: selectedRole === 'doctor' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  <Stethoscope size={15} />
                  <span>Doctor</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSelect('admin')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.375rem',
                    padding: '0.5rem 0.25rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    backgroundColor: selectedRole === 'admin' ? '#ffffff' : 'transparent',
                    color: selectedRole === 'admin' ? '#0d9488' : '#64748b',
                    boxShadow: selectedRole === 'admin' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  <Shield size={15} />
                  <span>Admin</span>
                </button>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.375rem' }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="name@hospital.demo"
                      style={{
                        width: '100%',
                        padding: '0.625rem 0.75rem 0.625rem 2.25rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.375rem' }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      style={{
                        width: '100%',
                        padding: '0.625rem 0.75rem 0.625rem 2.25rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
                >
                  {loading ? 'Authenticating...' : `Sign In as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}
                </button>
              </form>

              {/* Quick One-Click Demo Buttons */}
              <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.625rem' }}>
                  Quick Demo Credentials (One-Click Fill)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('admin')}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '0.375rem',
                      border: '1px solid #cbd5e1',
                      background: '#f8fafc',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Demo Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('doctor')}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '0.375rem',
                      border: '1px solid #cbd5e1',
                      background: '#f8fafc',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Demo Doctor
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('patient')}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '0.375rem',
                      border: '1px solid #cbd5e1',
                      background: '#f8fafc',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Demo Patient
                  </button>
                </div>
              </div>

              {/* Switch to Registration */}
              <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.85rem', color: '#64748b' }}>
                New patient?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(''); }}
                  style={{ background: 'none', border: 'none', color: '#0d9488', fontWeight: 700, cursor: 'pointer' }}
                >
                  Create an account
                </button>
              </div>
            </>
          ) : (
            /* Patient Registration Form */
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="e.g. Rachel Green"
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="rachel@example.com"
                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+1-555-0123"
                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  Password (min 6 characters) *
                </label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={regDob}
                    onChange={(e) => setRegDob(e.target.value)}
                    style={{ width: '100%', padding: '0.45rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                    Gender
                  </label>
                  <select
                    value={regGender}
                    onChange={(e) => setRegGender(e.target.value)}
                    style={{ width: '100%', padding: '0.45rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                    Blood Group
                  </label>
                  <select
                    value={regBlood}
                    onChange={(e) => setRegBlood(e.target.value)}
                    style={{ width: '100%', padding: '0.45rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  Address
                </label>
                <input
                  type="text"
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                  placeholder="Street, City, State"
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
              >
                {loading ? 'Registering...' : 'Complete Registration & Sign In'}
              </button>

              <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem' }}>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); }}
                  style={{ background: 'none', border: 'none', color: '#0d9488', fontWeight: 700, cursor: 'pointer' }}
                >
                  Sign in
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
