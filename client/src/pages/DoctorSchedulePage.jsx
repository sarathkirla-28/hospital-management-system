import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { api } from '../api';
import { Clock, Calendar, CheckCircle, AlertCircle, Save, ToggleLeft, ToggleRight } from 'lucide-react';

export default function DoctorSchedulePage({ activePage, setActivePage }) {
  const [schedules, setSchedules] = useState([]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getDoctorProfile();
        setSchedules(res.schedules || []);
        setIsAvailable(res.doctor?.is_available === true || res.doctor?.is_available === 1);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleToggleAvailability = async () => {
    try {
      const next = !isAvailable;
      await api.updateDoctorAvailability(next);
      setIsAvailable(next);
      setSuccess(`Doctor availability set to ${next ? 'Accepting Patients' : 'Away / Off Duty'}.`);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.updateDoctorSchedules(schedules);
      setSuccess('Consultation schedules updated successfully.');
    } catch (err) {
      setError(err.message);
    }
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <DashboardLayout
      title="Manage Availability & Working Schedule"
      subtitle="Configure daily consultation hours and toggle practice duty status"
      activePage={activePage}
      setActivePage={setActivePage}
    >
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        {success && (
          <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '0.875rem 1.25rem', borderRadius: '0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={18} />
            <span>{success}</span>
          </div>
        )}
        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.875rem 1.25rem', borderRadius: '0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Global Practice Duty Status Card */}
        <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>Overall Practice Duty Status</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
              When toggled off, patients cannot book new appointments with you on any date.
            </p>
          </div>
          <button
            onClick={handleToggleAvailability}
            className={`btn ${isAvailable ? 'btn-primary' : 'btn-danger'} btn-sm`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {isAvailable ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
            <span>{isAvailable ? 'Accepting Appointments' : 'Off Duty'}</span>
          </button>
        </div>

        {/* Schedule Form */}
        <form onSubmit={handleSave} className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
            Weekly Consultation Hours
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>
            Set start and end times for each day of the week. Slots will be automatically generated at 30-minute intervals.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {days.map(day => {
              const existing = schedules.find(s => s.day_of_week === day);
              const isActive = !!existing;

              return (
                <div key={day} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ width: '120px', fontWeight: 700, color: '#1e293b' }}>{day}</div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="time"
                      disabled={!isActive}
                      value={existing?.start_time || '09:00'}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSchedules(prev => {
                          const filtered = prev.filter(s => s.day_of_week !== day);
                          return [...filtered, { day_of_week: day, start_time: val, end_time: existing?.end_time || '13:00', slot_duration_minutes: 30 }];
                        });
                      }}
                      style={{ padding: '0.35rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                    <span>to</span>
                    <input
                      type="time"
                      disabled={!isActive}
                      value={existing?.end_time || '13:00'}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSchedules(prev => {
                          const filtered = prev.filter(s => s.day_of_week !== day);
                          return [...filtered, { day_of_week: day, start_time: existing?.start_time || '09:00', end_time: val, slot_duration_minutes: 30 }];
                        });
                      }}
                      style={{ padding: '0.35rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (isActive) {
                        setSchedules(schedules.filter(s => s.day_of_week !== day));
                      } else {
                        setSchedules([...schedules, { day_of_week: day, start_time: '09:00', end_time: '13:00', slot_duration_minutes: 30 }]);
                      }
                    }}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '0.375rem',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      backgroundColor: isActive ? '#dcfce7' : '#f1f5f9',
                      color: isActive ? '#15803d' : '#64748b'
                    }}
                  >
                    {isActive ? 'Available' : 'Day Off'}
                  </button>
                </div>
              );
            })}
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '1.5rem', width: '100%', padding: '0.75rem' }}>
            <Save size={16} />
            <span>Save Consultation Schedule</span>
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
