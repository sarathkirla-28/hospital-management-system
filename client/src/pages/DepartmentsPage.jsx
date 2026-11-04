import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { HeartPulse, Brain, Baby, Bone, Stethoscope, Sparkles, Eye, Users, ChevronRight, Activity } from 'lucide-react';

export default function DepartmentsPage({ setActivePage, onSelectDepartment }) {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getDepartments();
        setDepartments(res.departments || []);
      } catch (err) {
        console.error('Failed to load departments:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const getDeptIcon = (name) => {
    switch (name) {
      case 'Cardiology': return <HeartPulse size={28} color="#0d9488" />;
      case 'Neurology': return <Brain size={28} color="#0d9488" />;
      case 'Pediatrics': return <Baby size={28} color="#0d9488" />;
      case 'Orthopedics': return <Bone size={28} color="#0d9488" />;
      case 'Dermatology': return <Sparkles size={28} color="#0d9488" />;
      case 'Ophthalmology': return <Eye size={28} color="#0d9488" />;
      default: return <Stethoscope size={28} color="#0d9488" />;
    }
  };

  const handleConsultDepartment = (deptId) => {
    if (onSelectDepartment) onSelectDepartment(deptId);
    setActivePage('doctors');
  };

  return (
    <div style={{ padding: '3.5rem 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3.5rem auto' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Clinical Specializations
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginTop: '0.375rem', letterSpacing: '-0.025em' }}>
            Hospital Departments
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#64748b', marginTop: '0.5rem', lineHeight: 1.6 }}>
            Explore specialized clinical faculties staffed by certified medical doctors, offering comprehensive preventative, diagnostic, and therapeutic services.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            Loading hospital departments...
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
            {departments.map((dept) => (
              <div key={dept.id} className="card card-hover" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div style={{
                    width: '3.5rem',
                    height: '3.5rem',
                    borderRadius: '0.75rem',
                    backgroundColor: '#f0fdfa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {getDeptIcon(dept.name)}
                  </div>
                  <span className="badge badge-active">{dept.code}</span>
                </div>

                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                  {dept.name}
                </h3>

                <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6, marginBottom: '1.5rem', flexGrow: 1 }}>
                  {dept.description}
                </p>

                <div style={{
                  backgroundColor: '#f8fafc',
                  padding: '0.875rem 1rem',
                  borderRadius: '0.5rem',
                  marginBottom: '1.5rem',
                  fontSize: '0.85rem'
                }}>
                  <div style={{ color: '#64748b', marginBottom: '0.25rem' }}>
                    Department Head: <strong style={{ color: '#1e293b' }}>{dept.head_doctor || 'Faculty Board'}</strong>
                  </div>
                  <div style={{ color: '#0d9488', fontWeight: 600 }}>
                    {dept.doctor_count} Certified Specialist{dept.doctor_count === 1 ? '' : 's'} on Roster
                  </div>
                </div>

                <button
                  onClick={() => handleConsultDepartment(dept.id)}
                  className="btn btn-outline"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <span>Find {dept.name} Specialists</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
