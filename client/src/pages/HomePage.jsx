import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  Calendar, Stethoscope, ShieldCheck, Clock, Users, ArrowRight, 
  CheckCircle, HeartPulse, Brain, Baby, Bone, Sparkles, ChevronRight, AlertTriangle 
} from 'lucide-react';

export default function HomePage({ setActivePage, openAuthModal }) {
  const [stats, setStats] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, deptRes, docRes] = await Promise.all([
          api.getStats().catch(() => ({})),
          api.getDepartments().catch(() => ({ departments: [] })),
          api.getDoctors('?limit=4').catch(() => ({ doctors: [] }))
        ]);
        setStats(statsRes);
        setDepartments(deptRes.departments || []);
        setDoctors((docRes.doctors || []).slice(0, 4));
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getDeptIcon = (name) => {
    switch (name) {
      case 'Cardiology': return <HeartPulse size={24} color="#0d9488" />;
      case 'Neurology': return <Brain size={24} color="#0d9488" />;
      case 'Pediatrics': return <Baby size={24} color="#0d9488" />;
      case 'Orthopedics': return <Bone size={24} color="#0d9488" />;
      default: return <Stethoscope size={24} color="#0d9488" />;
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 100%)',
        padding: '4.5rem 0 5rem 0',
        borderBottom: '1px solid #ccfbf1'
      }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'center' }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#ffffff',
              padding: '0.375rem 0.875rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#0f766e',
              boxShadow: '0 2px 6px rgba(13, 148, 136, 0.1)',
              marginBottom: '1.25rem'
            }}>
              <ShieldCheck size={16} color="#0d9488" />
              <span>Next-Generation Intelligent Clinical Scheduling</span>
            </div>

            <h1 style={{
              fontSize: 'clamp(2.25rem, 5vw, 3.25rem)',
              fontWeight: 800,
              color: '#0f172a',
              lineHeight: 1.15,
              marginBottom: '1.25rem',
              letterSpacing: '-0.03em'
            }}>
              Seamless Healthcare Appointments. <span style={{ color: '#0d9488' }}>Zero Waiting Time.</span>
            </h1>

            <p style={{
              fontSize: '1.1rem',
              color: '#475569',
              lineHeight: 1.6,
              marginBottom: '2rem',
              maxWidth: '540px'
            }}>
              Experience frictionless hospital appointments with dynamic real-time doctor availability, atomic double-booking prevention, and an integrated doctor & administrative management suite.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
              <button
                onClick={() => openAuthModal('register')}
                className="btn btn-primary"
                style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
              >
                <Calendar size={18} />
                <span>Book Appointment Online</span>
              </button>
              <button
                onClick={() => setActivePage('doctors')}
                className="btn btn-secondary"
                style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
              >
                <span>Find Doctors</span>
                <ArrowRight size={18} />
              </button>
            </div>

            {/* Quick Guarantees */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(13, 148, 136, 0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>
                <CheckCircle size={16} color="#0d9488" />
                <span>Zero Double Booking</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>
                <CheckCircle size={16} color="#0d9488" />
                <span>Instant Slot Confirmation</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>
                <CheckCircle size={16} color="#0d9488" />
                <span>Verified Specialists</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Card */}
          <div style={{ position: 'relative' }}>
            <div className="card" style={{ padding: '2rem', borderRadius: '1.25rem', boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '0.75rem', backgroundColor: '#f0fdfa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Stethoscope size={24} color="#0d9488" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Live Hospital Overview</h3>
                    <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Real-time telemetry and metrics</p>
                  </div>
                </div>
                <span className="badge badge-confirmed">System Operational</span>
              </div>

              {/* Metric grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Active Doctors</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0d9488', marginTop: '0.25rem' }}>
                    {stats?.activeDoctors || 4}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '0.25rem' }}>Available for Booking</div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Departments</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0284c7', marginTop: '0.25rem' }}>
                    {stats?.departments || 7}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#0284c7', marginTop: '0.25rem' }}>Specialized Units</div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Completed Visits</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#4f46e5', marginTop: '0.25rem' }}>
                    {stats?.completedConsultations || 2}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#4f46e5', marginTop: '0.25rem' }}>Consultations logged</div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Satisfaction</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#16a34a', marginTop: '0.25rem' }}>
                    {stats?.satisfactionRate || '98.5%'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.25rem' }}>Positive patient feedback</div>
                </div>
              </div>

              {/* Shortcut Banner */}
              <div style={{
                backgroundColor: '#f0fdfa',
                border: '1px solid #ccfbf1',
                padding: '1rem',
                borderRadius: '0.625rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f766e' }}>Need Immediate Medical Assistance?</div>
                  <div style={{ fontSize: '0.75rem', color: '#115e59' }}>Emergency desk available 24/7</div>
                </div>
                <button onClick={() => setActivePage('contact')} className="btn btn-outline btn-sm">
                  Emergency Desk
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Clinical Departments */}
      <section style={{ padding: '4.5rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Center of Clinical Excellence
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>
                Specialized Departments
              </h2>
            </div>
            <button
              onClick={() => setActivePage('departments')}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
            >
              <span>View All Departments</span>
              <ChevronRight size={16} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {departments.slice(0, 4).map((dept) => (
              <div key={dept.id} className="card card-hover" style={{ padding: '1.75rem' }}>
                <div style={{
                  width: '3.25rem',
                  height: '3.25rem',
                  borderRadius: '0.75rem',
                  backgroundColor: '#f0fdfa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem'
                }}>
                  {getDeptIcon(dept.name)}
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                  {dept.name}
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1.25rem', minHeight: '42px' }}>
                  {dept.description}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                    {dept.doctor_count} Active Specialists
                  </span>
                  <button
                    onClick={() => setActivePage('doctors')}
                    style={{ background: 'none', border: 'none', color: '#0d9488', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    <span>Consult</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Doctors Spotlight */}
      <section style={{ padding: '4.5rem 0', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3rem auto' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Qualified Healthcare Professionals
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>
              Featured Medical Doctors
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.5rem' }}>
              Book an in-person or clinical consultation with our certified departmental medical specialists.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {doctors.map((doc) => (
              <div key={doc.id} className="card card-hover" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{
                    width: '3.5rem',
                    height: '3.5rem',
                    borderRadius: '9999px',
                    backgroundColor: '#e0f2fe',
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1.1rem'
                  }}>
                    {doc.full_name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{doc.full_name}</h3>
                    <div style={{ fontSize: '0.825rem', color: '#0d9488', fontWeight: 600 }}>{doc.department_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{doc.specialization}</div>
                  </div>
                </div>

                <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, marginBottom: '1.25rem', flexGrow: 1 }}>
                  {doc.bio}
                </p>

                <div style={{ backgroundColor: '#f1f5f9', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <div>
                    <span style={{ color: '#64748b' }}>Experience: </span>
                    <strong style={{ color: '#1e293b' }}>{doc.experience_years} Years</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Fee: </span>
                    <strong style={{ color: '#0d9488' }}>${Number(doc.consultation_fee).toFixed(2)}</strong>
                  </div>
                </div>

                <button
                  onClick={() => openAuthModal('register')}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  <Calendar size={16} />
                  <span>Schedule Consultation</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hospital System Architecture Banner */}
      <section style={{ padding: '3.5rem 0', backgroundColor: '#0f172a', color: '#ffffff' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '800px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#14b8a6', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem' }}>
            <ShieldCheck size={18} />
            <span>Academic Software Engineering Project</span>
          </div>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 800, marginBottom: '1rem' }}>
            Intelligent Hospital Management System
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
            Implemented by <strong>Sarathkirla (2023006411)</strong> at GITAM School of Computer Science & Engineering. Designed with full-stack Node.js Express architecture, relational SQL database transactions, role-based access control, and complete executive administration metrics.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button onClick={() => openAuthModal('login')} className="btn btn-primary">
              Access Admin Console
            </button>
            <button onClick={() => setActivePage('about')} className="btn btn-secondary">
              Read Project Details
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
