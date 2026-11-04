import React from 'react';
import { Shield, Award, Users, CheckCircle, Activity, Building, Server, Database } from 'lucide-react';

export default function AboutPage({ setActivePage, openAuthModal }) {
  return (
    <div style={{ padding: '3.5rem 0' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            System Architecture & Institutional Context
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginTop: '0.375rem', letterSpacing: '-0.025em' }}>
            About ApexCare Hospital System
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#64748b', maxWidth: '680px', margin: '0.75rem auto 0 auto', lineHeight: 1.6 }}>
            An intelligent, web-based appointment management application built to solve healthcare scheduling congestion, eliminate double-booking, and deliver real-time doctor availability.
          </p>
        </div>

        {/* Fictional Demonstration Notice Alert */}
        <div style={{
          backgroundColor: '#f0fdfa',
          border: '1px solid #99f6e4',
          borderRadius: '0.75rem',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'flex-start',
          marginBottom: '3rem'
        }}>
          <Shield size={24} color="#0d9488" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f766e', marginBottom: '0.25rem' }}>
              Academic Demonstration Project Disclosure
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#115e59', lineHeight: 1.5 }}>
              This web application is developed strictly as a real full-stack software development internship deliverable. All doctor names, patient identities, departmental descriptions, phone numbers, and consultation data are fictional demonstration data generated for software testing and evaluation. No real medical records or sensitive patient clinical data are collected or processed.
            </p>
          </div>
        </div>

        {/* Academic Profile Card */}
        <div className="card" style={{ padding: '2rem', marginBottom: '3rem', borderLeft: '4px solid #0d9488' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
            Internship & Student Information
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', fontSize: '0.9rem' }}>
            <div>
              <span style={{ color: '#64748b', display: 'block' }}>Student Developer:</span>
              <strong style={{ color: '#0f172a', fontSize: '1rem' }}>Sarathkirla</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block' }}>Registration Number:</span>
              <strong style={{ color: '#0f172a', fontSize: '1rem' }}>2023006411</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block' }}>Degree Program:</span>
              <strong style={{ color: '#0f172a' }}>B.Tech in Computer Science and Engineering</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block' }}>Department / Institution:</span>
              <strong style={{ color: '#0f172a' }}>GITAM School of Computer Science & Engineering, Visakhapatnam</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block' }}>Internship Organization:</span>
              <strong style={{ color: '#0f172a' }}>Yalamanchili Software Exports Private Limited</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block' }}>Primary Role & Responsibility:</span>
              <strong style={{ color: '#0d9488' }}>Admin Panel Development & Management</strong>
            </div>
          </div>
        </div>

        {/* Core Architectural Pillars */}
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.625rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem', textAlign: 'center' }}>
            Key System Capabilities
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', backgroundColor: '#f0fdfa', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <CheckCircle size={20} color="#0d9488" />
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                Atomic Double-Booking Prevention
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5 }}>
                Enforced by database-level partial unique constraints and transactional atomicity. If two patients attempt to select the same slot simultaneously, only the first transaction commits, returning HTTP 409 to the second.
              </p>
            </div>

            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', backgroundColor: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Server size={20} color="#0284c7" />
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                Role-Based Access Control (RBAC)
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5 }}>
                Strict cryptographic JWT tokens and Express middleware isolate patient, doctor, and administrator boundaries. Patients cannot view administrative dashboards or alter doctor rosters.
              </p>
            </div>

            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Database size={20} color="#d97706" />
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                Relational SQL Persistence
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5 }}>
                Designed with a 7-table normalized schema storing users, patients, doctors, departments, schedules, appointments, and audit status history with full referential integrity.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', backgroundColor: '#f8fafc', padding: '2.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
            Ready to test the system?
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Use one of our pre-configured demo logins or register a new patient account to test the booking flow.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button onClick={() => openAuthModal('login')} className="btn btn-primary">
              Launch Portal Login
            </button>
            <button onClick={() => setActivePage('doctors')} className="btn btn-secondary">
              Browse Doctors
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
