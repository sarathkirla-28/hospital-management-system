import React from 'react';
import { Activity, ShieldCheck, Heart, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer({ setActivePage }) {
  return (
    <footer style={{ backgroundColor: '#0f172a', color: '#f8fafc', paddingTop: '3.5rem', paddingBottom: '2.5rem', marginTop: '4rem' }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3rem'
        }}>
          {/* Column 1: Hospital Overview */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
              <div style={{
                width: '2.25rem',
                height: '2.25rem',
                borderRadius: '0.5rem',
                backgroundColor: '#0d9488',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}>
                <Activity size={20} />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                Apex<span style={{ color: '#14b8a6' }}>Care</span>
              </span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Intelligent Hospital Management and Appointment Booking System engineered to streamline patient scheduling, eliminate double-booking, and optimize doctor workflows.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#14b8a6', fontSize: '0.825rem', fontWeight: 600 }}>
              <ShieldCheck size={16} />
              <span>Demonstration Healthcare Platform</span>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: '#ffffff' }}>Quick Navigation</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.875rem' }}>
              <li>
                <button onClick={() => setActivePage('home')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textAlign: 'left' }}>
                  Home Portal
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('about')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textAlign: 'left' }}>
                  About Hospital
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('departments')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textAlign: 'left' }}>
                  Medical Departments
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('doctors')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textAlign: 'left' }}>
                  Find a Doctor
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('contact')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textAlign: 'left' }}>
                  Contact & Emergency Desk
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Demonstration Notice */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: '#ffffff' }}>Academic Project</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
              <strong>Presenter:</strong> Sarathkirla (Regd. No: 2023006411)
            </p>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
              <strong>Institution:</strong> GITAM School of Computer Science & Engineering, Visakhapatnam
            </p>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.6 }}>
              <strong>Internship:</strong> Yalamanchili Software Exports Private Limited
            </p>
          </div>

          {/* Column 4: Contact Sample */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: '#ffffff' }}>Hospital Information</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: '#94a3b8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <MapPin size={16} color="#14b8a6" />
                <span>ApexCare Medical Campus, Metro District</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <Phone size={16} color="#14b8a6" />
                <span>+1-555-0199 (Fictional Demo Line)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <Mail size={16} color="#14b8a6" />
                <span>support@hospital.demo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid #1e293b',
          paddingTop: '1.75rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.8rem',
          color: '#64748b'
        }}>
          <div>
            &copy; 2026 ApexCare Hospital Management System. Built for academic demonstration & evaluation.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <span>Engineered with</span>
            <Heart size={14} color="#ef4444" fill="#ef4444" />
            <span>by Sarathkirla</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
