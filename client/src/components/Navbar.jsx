import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, Calendar, User, Shield, Stethoscope, LogOut, Menu, X } from 'lucide-react';

export default function Navbar({ activePage, setActivePage, openAuthModal }) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'departments', label: 'Departments' },
    { id: 'doctors', label: 'Doctors' },
    { id: 'contact', label: 'Contact & Emergency' }
  ];

  const handleNavClick = (id) => {
    setActivePage(id);
    setMobileMenuOpen(false);
  };

  const getDashboardId = () => {
    if (!user) return null;
    if (user.role === 'admin') return 'admin-dashboard';
    if (user.role === 'doctor') return 'doctor-dashboard';
    return 'patient-dashboard';
  };

  return (
    <header style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '4.5rem' }}>
        {/* Brand Logo */}
        <div 
          onClick={() => handleNavClick('home')} 
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
        >
          <div style={{
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '0.625rem',
            backgroundColor: '#0d9488',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(13, 148, 136, 0.3)'
          }}>
            <Activity size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#0f172a', letterSpacing: '-0.025em' }}>
              Apex<span style={{ color: '#0d9488' }}>Care</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Hospital Management System
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'none', mdDisplay: 'flex', gap: '1.75rem', alignItems: 'center' }} className="desktop-nav">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              style={{
                background: 'none',
                border: 'none',
                padding: '0.5rem 0',
                cursor: 'pointer',
                fontSize: '0.925rem',
                fontWeight: activePage === link.id ? 700 : 500,
                color: activePage === link.id ? '#0d9488' : '#334155',
                borderBottom: activePage === link.id ? '2px solid #0d9488' : '2px solid transparent',
                transition: 'all 0.2s ease'
              }}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Auth / Role Action Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {/* Role Portal Shortcut */}
              <button
                onClick={() => handleNavClick(getDashboardId())}
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
              >
                {user.role === 'admin' && <Shield size={16} />}
                {user.role === 'doctor' && <Stethoscope size={16} />}
                {user.role === 'patient' && <Calendar size={16} />}
                <span>
                  {user.role === 'admin' ? 'Admin Console' : user.role === 'doctor' ? 'Doctor Portal' : 'Patient Portal'}
                </span>
              </button>

              {/* User Identity Chip */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.375rem 0.75rem',
                borderRadius: '0.5rem',
                backgroundColor: '#f1f5f9',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#1e293b'
              }}>
                <User size={16} color="#0d9488" />
                <span>{user.full_name}</span>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="btn btn-secondary btn-sm"
                title="Logout"
                style={{ padding: '0.375rem 0.5rem' }}
              >
                <LogOut size={16} color="#dc2626" />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={() => openAuthModal('login')}
                className="btn btn-secondary btn-sm"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuthModal('register')}
                className="btn btn-primary btn-sm"
              >
                Book Appointment
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#334155',
              padding: '0.25rem'
            }}
            className="mobile-menu-btn"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          padding: '1rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              style={{
                textAlign: 'left',
                background: 'none',
                border: 'none',
                padding: '0.5rem 0',
                fontSize: '1rem',
                fontWeight: activePage === link.id ? 700 : 500,
                color: activePage === link.id ? '#0d9488' : '#1e293b',
                cursor: 'pointer'
              }}
            >
              {link.label}
            </button>
          ))}
          {user && (
            <button
              onClick={() => handleNavClick(getDashboardId())}
              style={{
                textAlign: 'left',
                background: 'none',
                border: 'none',
                padding: '0.5rem 0',
                fontSize: '1rem',
                fontWeight: 700,
                color: '#0d9488',
                cursor: 'pointer'
              }}
            >
              Go to {user.role === 'admin' ? 'Admin Console' : user.role === 'doctor' ? 'Doctor Portal' : 'Patient Portal'}
            </button>
          )}
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .mobile-menu-btn { display: none !important; }
        }
        @media (max-width: 767px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </header>
  );
}
