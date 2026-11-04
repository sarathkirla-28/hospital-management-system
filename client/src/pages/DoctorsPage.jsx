import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, Calendar, Clock, MapPin, DollarSign, Award, Stethoscope, ChevronRight } from 'lucide-react';

export default function DoctorsPage({ selectedDepartmentId, onBookDoctor, openAuthModal, setActivePage }) {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState(selectedDepartmentId || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [docRes, deptRes] = await Promise.all([
          api.getDoctors(),
          api.getDepartments()
        ]);
        setDoctors(docRes.doctors || []);
        setDepartments(deptRes.departments || []);
      } catch (err) {
        console.error('Error fetching doctors:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredDoctors = doctors.filter((doc) => {
    const matchSearch = doc.full_name.toLowerCase().includes(search.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter ? String(doc.department_id) === String(deptFilter) : true;
    return matchSearch && matchDept;
  });

  const handleBookClick = (doctor) => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    if (user.role === 'patient') {
      if (onBookDoctor) onBookDoctor(doctor);
      setActivePage('patient-dashboard');
    } else {
      alert(`You are currently logged in as a ${user.role}. Please log in with a patient account to book consultations.`);
    }
  };

  return (
    <div style={{ padding: '3.5rem 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3rem auto' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Medical Staff Directory
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginTop: '0.375rem', letterSpacing: '-0.025em' }}>
            Our Medical Doctors
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#64748b', marginTop: '0.5rem', lineHeight: 1.6 }}>
            Browse certified physicians across all hospital faculties. Filter by department, check consultation schedules, and book slots in real time.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="card" style={{ padding: '1.25rem', marginBottom: '2.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flexGrow: 1, minWidth: '240px' }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by doctor name or clinical specialty..."
              style={{
                width: '100%',
                padding: '0.625rem 1rem 0.625rem 2.5rem',
                borderRadius: '0.5rem',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Department Filter Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '220px' }}>
            <Filter size={18} color="#0d9488" />
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem 0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                outline: 'none',
                backgroundColor: '#ffffff'
              }}
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Doctors Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            Loading doctor profiles...
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', backgroundColor: '#ffffff', borderRadius: '0.75rem', border: '1px dashed #cbd5e1' }}>
            <Stethoscope size={36} color="#94a3b8" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>No Doctors Found</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              No doctors matched your search criteria. Try clearing the filter or searching with another term.
            </p>
            <button
              onClick={() => { setSearch(''); setDeptFilter(''); }}
              className="btn btn-secondary btn-sm"
              style={{ marginTop: '1rem' }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
            {filteredDoctors.map((doc) => (
              <div key={doc.id} className="card card-hover" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                {/* Doctor Head */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div style={{
                    width: '4rem',
                    height: '4rem',
                    borderRadius: '9999px',
                    backgroundColor: '#e0f2fe',
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1.25rem',
                    boxShadow: '0 4px 8px rgba(2, 132, 199, 0.15)',
                    flexShrink: 0
                  }}>
                    {doc.full_name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>{doc.full_name}</h3>
                    <div style={{ fontSize: '0.85rem', color: '#0d9488', fontWeight: 600 }}>{doc.department_name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{doc.qualification}</div>
                  </div>
                </div>

                <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.5, marginBottom: '1.25rem', flexGrow: 1 }}>
                  {doc.bio}
                </p>

                {/* Details Pills */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem',
                  backgroundColor: '#f8fafc',
                  padding: '0.875rem',
                  borderRadius: '0.5rem',
                  marginBottom: '1.25rem',
                  fontSize: '0.825rem'
                }}>
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>Experience:</span>
                    <strong style={{ color: '#0f172a' }}>{doc.experience_years} Years</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>Fee:</span>
                    <strong style={{ color: '#0d9488' }}>${Number(doc.consultation_fee).toFixed(2)}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>Room / Clinic:</span>
                    <strong style={{ color: '#0f172a' }}>{doc.room_number}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>Availability:</span>
                    <strong style={{ color: doc.is_available ? '#059669' : '#dc2626' }}>
                      {doc.is_available ? 'Accepting Patients' : 'Not Available'}
                    </strong>
                  </div>
                </div>

                {/* Schedules preview */}
                {doc.schedules && doc.schedules.length > 0 && (
                  <div style={{ marginBottom: '1.25rem', fontSize: '0.75rem', color: '#64748b' }}>
                    <div style={{ fontWeight: 600, color: '#334155', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={12} color="#0d9488" />
                      <span>Consultation Schedule:</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                      {doc.schedules.map((s, idx) => (
                        <span key={idx} style={{ backgroundColor: '#f1f5f9', padding: '0.2rem 0.45rem', borderRadius: '0.25rem', fontWeight: 500 }}>
                          {s.day_of_week.slice(0, 3)}: {s.start_time}-{s.end_time}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => handleBookClick(doc)}
                  disabled={!doc.is_available}
                  className="btn btn-primary"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <Calendar size={16} />
                  <span>{doc.is_available ? 'Book Appointment' : 'Currently Unavailable'}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
