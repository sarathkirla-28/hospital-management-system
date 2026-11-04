import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { 
  Activity, Calendar, Users, Stethoscope, Shield, Settings, 
  LogOut, Bell, Home, ChevronRight, Menu, X, FileText, BarChart2, 
  Clock, Plus, CheckCircle, AlertTriangle 
} from 'lucide-react';

export default function DashboardLayout({ 
  title, 
  subtitle, 
  activePage, 
  setActivePage, 
  children,
  statsBadge = null
}) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    api.getNotifications().then(res => setNotifications(res.notifications || [])).catch(() => {});
  }, []);

  const patientNav = [
    { id: 'patient-dashboard', label: 'Patient Dashboard', icon: <Home size={18} /> },
    { id: 'patient-book', label: 'Book Appointment', icon: <Plus size={18} /> },
    { id: 'patient-appointments', label: 'My Appointments', icon: <Calendar size={18} /> },
    { id: 'patient-history', label: 'Appointment History', icon: <Clock size={18} /> },
    { id: 'patient-doctors', label: 'Available Specialists', icon: <Stethoscope size={18} /> },
    { id: 'patient-profile', label: 'My Patient Profile', icon: <Settings size={18} /> }
  ];

  const doctorNav = [
    { id: 'doctor-dashboard', label: 'Doctor Dashboard', icon: <Home size={18} /> },
    { id: 'doctor-today', label: "Today's Consultations", icon: <Clock size={18} /> },
    { id: 'doctor-schedule', label: 'Manage Availability & Schedule', icon: <Calendar size={18} /> },
    { id: 'doctor-history', label: 'Consultation History', icon: <FileText size={18} /> },
    { id: 'doctor-profile', label: 'Doctor Profile', icon: <Stethoscope size={18} /> }
  ];

  const adminNav = [
    { id: 'admin-dashboard', label: 'Admin Command Center', icon: <Home size={18} /> },
    { id: 'admin-appointments', label: 'Manage All Appointments', icon: <Calendar size={18} /> },
    { id: 'admin-patients', label: 'Manage Patients', icon: <Users size={18} /> },
    { id: 'admin-doctors', label: 'Manage Doctors', icon: <Stethoscope size={18} /> },
    { id: 'admin-departments', label: 'Manage Departments', icon: <Activity size={18} /> },
    { id: 'admin-reports', label: 'Analytics & CSV Reports', icon: <BarChart2 size={18} /> },
    { id: 'admin-profile', label: 'Admin Profile', icon: <Shield size={18} /> }
  ];

  const currentNav = user?.role === 'admin' ? adminNav : user?.role === 'doctor' ? doctorNav : patientNav;

  const handleNavClick = (id) => {
    setActivePage(id);
    setSidebarOpen(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 4.5rem)', backgroundColor: '#f8fafc' }}>
      {/* Sidebar for Desktop */}
      <aside style={{
        width: '260px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0
      }} className="desktop-sidebar">
        {/* User Role Badge Banner */}
        <div style={{ padding: '1.25rem', borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '9999px',
              backgroundColor: user?.role === 'admin' ? '#0f172a' : user?.role === 'doctor' ? '#0d9488' : '#0284c7',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.9rem'
            }}>
              {user?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{user?.full_name}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0d9488', textTransform: 'uppercase' }}>
                {user?.role === 'admin' ? 'Administrator' : user?.role === 'doctor' ? 'Clinical Doctor' : 'Registered Patient'}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav style={{ padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', flexGrow: 1 }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0.5rem 0.75rem' }}>
            Navigation Menu
          </div>
          {currentNav.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.625rem 0.75rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  background: isActive ? '#f0fdfa' : 'transparent',
                  color: isActive ? '#0d9488' : '#475569',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                {item.icon}
                <span style={{ flexGrow: 1 }}>{item.label}</span>
                {isActive && <div style={{ width: '6px', height: '6px', borderRadius: '9999px', backgroundColor: '#0d9488' }} />}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div style={{ padding: '1rem', borderTop: '1px solid #f1f5f9' }}>
          <button
            onClick={() => setActivePage('home')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              width: '100%',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.375rem',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer',
              marginBottom: '0.5rem'
            }}
          >
            <Home size={14} />
            <span>Public Website</span>
          </button>
          <button
            onClick={logout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              width: '100%',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.375rem',
              border: 'none',
              background: '#fee2e2',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#b91c1c',
              cursor: 'pointer'
            }}
          >
            <LogOut size={14} />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header Bar */}
        <div style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          {/* Title & Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => setSidebarOpen(true)}
              className="mobile-sidebar-toggle"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: '#334155' }}
            >
              <Menu size={20} />
            </button>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{title}</h2>
              {subtitle && <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{subtitle}</p>}
            </div>
          </div>

          {/* Right Header Badges & Notification Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' }}>
            {statsBadge}

            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                style={{
                  background: 'none',
                  border: '1px solid #cbd5e1',
                  borderRadius: '0.5rem',
                  padding: '0.45rem',
                  cursor: 'pointer',
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}
              >
                <Bell size={18} />
                {notifications.some(n => n.unread) && (
                  <span style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '9999px',
                    backgroundColor: '#ef4444'
                  }} />
                )}
              </button>

              {/* Notification Popover */}
              {notificationsOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '2.5rem',
                  width: '300px',
                  backgroundColor: '#ffffff',
                  borderRadius: '0.75rem',
                  border: '1px solid #cbd5e1',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  zIndex: 50,
                  padding: '1rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Hospital Notifications</span>
                    <button onClick={() => setNotificationsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={14} /></button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    {notifications.map((n) => (
                      <div key={n.id} style={{ padding: '0.5rem', backgroundColor: n.unread ? '#f0fdfa' : '#f8fafc', borderRadius: '0.375rem', fontSize: '0.8rem' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{n.title}</div>
                        <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.125rem' }}>{n.message}</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.7rem', marginTop: '0.25rem' }}>{n.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.5rem', flexGrow: 1 }}>
          {children}
        </div>
      </div>

      {/* Mobile Drawer Sidebar */}
      {sidebarOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          zIndex: 70,
          display: 'flex'
        }}>
          <div style={{
            width: '280px',
            backgroundColor: '#ffffff',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: '1rem',
            boxShadow: '0 20px 25px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>
                Apex<span style={{ color: '#0d9488' }}>Care</span> Menu
              </div>
              <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexGrow: 1 }}>
              {currentNav.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.625rem',
                    borderRadius: '0.375rem',
                    border: 'none',
                    background: activePage === item.id ? '#f0fdfa' : 'transparent',
                    color: activePage === item.id ? '#0d9488' : '#334155',
                    fontWeight: activePage === item.id ? 700 : 500,
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .desktop-sidebar { display: none !important; }
          .mobile-sidebar-toggle { display: block !important; }
        }
        @media (min-width: 901px) {
          .desktop-sidebar { display: flex !important; }
          .mobile-sidebar-toggle { display: none !important; }
        }
      `}</style>
    </div>
  );
}
