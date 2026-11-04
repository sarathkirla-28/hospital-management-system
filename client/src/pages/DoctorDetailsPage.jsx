import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { Stethoscope, Calendar, Clock, MapPin, DollarSign, Award, ArrowLeft, CheckCircle, Shield } from 'lucide-react';

export default function DoctorDetailsPage({ doctorId, setActivePage, openAuthModal, onBookDoctor }) {
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getDoctors();
        const found = res.doctors?.find(d => String(d.id) === String(doctorId)) || res.doctors?.[0];
        setDoctor(found);
      } catch (err) {
        console.error('Failed to load doctor details:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [doctorId]);

  if (loading) {
    return <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>Loading doctor details...</div>;
  }

  if (!doctor) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h3>Doctor profile not found</h3>
        <button onClick={() => setActivePage('doctors')} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          Back to Doctors Directory
        </button>
      </div>
    );
  }

  const handleBook = () => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    if (user.role === 'patient') {
      if (onBookDoctor) onBookDoctor(doctor);
      setActivePage('patient-book');
    } else {
      alert(`You are currently logged in as ${user.role}. Please log in with a patient account to book consultations.`);
    }
  };

  return (
    <div style={{ padding: '3.5rem 0' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        {/* Back button */}
        <button
          onClick={() => setActivePage('doctors')}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#0d9488',
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: '1.5rem'
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to All Doctors</span>
        </button>

        {/* Profile Header Card */}
        <div className="card" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center' }}>
            <div style={{
              width: '6rem',
              height: '6rem',
              borderRadius: '9999px',
              backgroundColor: '#e0f2fe',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '2rem',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.2)'
            }}>
              {doctor.full_name.split(' ').map(n => n[0]).join('')}
            </div>

            <div style={{ flexGrow: 1 }}>
              <div style={{ display: 'inline-flex', padding: '0.25rem 0.625rem', backgroundColor: '#f0fdfa', color: '#0d9488', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.375rem' }}>
                {doctor.department_name}
              </div>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>{doctor.full_name}</h1>
              <p style={{ fontSize: '1rem', color: '#64748b', marginTop: '0.25rem' }}>
                {doctor.qualification} &bull; {doctor.specialization}
              </p>
            </div>

            <div>
              <button
                onClick={handleBook}
                className="btn btn-primary"
                style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
              >
                <Calendar size={18} />
                <span>Book Consultation</span>
              </button>
            </div>
          </div>
        </div>

        {/* Grid Information */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
              Professional Biography
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6 }}>
              {doctor.bio}
            </p>
          </div>

          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
              Clinical Credentials
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Clinical Experience:</span>
                <strong>{doctor.experience_years} Years</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Consultation Fee:</span>
                <strong style={{ color: '#0d9488' }}>${Number(doctor.consultation_fee).toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Clinic Location:</span>
                <strong>{doctor.room_number}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Duty Status:</span>
                <strong style={{ color: doctor.is_available ? '#059669' : '#dc2626' }}>
                  {doctor.is_available ? 'Available' : 'Away'}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Roster */}
        {doctor.schedules && doctor.schedules.length > 0 && (
          <div className="card" style={{ padding: '1.75rem', marginTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="#0d9488" />
              <span>Weekly Consultation Hours</span>
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              {doctor.schedules.map((s, idx) => (
                <div key={idx} style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{s.day_of_week}</div>
                  <div style={{ fontSize: '0.85rem', color: '#0d9488', marginTop: '0.25rem' }}>
                    {s.start_time} - {s.end_time}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.125rem' }}>
                    {s.slot_duration_minutes || 30} min slots
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
