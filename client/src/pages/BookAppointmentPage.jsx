import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { api } from '../api';
import { Calendar, Clock, Stethoscope, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

export default function BookAppointmentPage({ activePage, setActivePage, preSelectedDoctor }) {
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState(preSelectedDoctor ? String(preSelectedDoctor.department_id) : '');
  const [selectedDoctorId, setSelectedDoctorId] = useState(preSelectedDoctor ? String(preSelectedDoctor.id) : '');
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [deptRes, docRes] = await Promise.all([
          api.getDepartments(),
          api.getDoctors()
        ]);
        setDepartments(deptRes.departments || []);
        setDoctors(docRes.doctors || []);
      } catch (err) {
        console.error('Failed to load booking form:', err);
      }
    }
    load();
  }, []);

  useEffect(() => {
    async function fetchSlots() {
      if (!selectedDoctorId || !selectedDate) {
        setAvailableSlots([]);
        return;
      }
      setLoadingSlots(true);
      try {
        const res = await api.getAvailableSlots(selectedDoctorId, selectedDate);
        setAvailableSlots(res.slots || []);
        setSelectedSlot('');
      } catch (err) {
        console.error('Failed to load slots:', err);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    }
    fetchSlots();
  }, [selectedDoctorId, selectedDate]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedDoctorId || !selectedDate || !selectedSlot) {
      setError('Please select doctor, date, and available time slot.');
      return;
    }

    setBookingLoading(true);
    setError('');
    try {
      await api.bookAppointment({
        doctor_id: Number(selectedDoctorId),
        appointment_date: selectedDate,
        slot_time: selectedSlot,
        symptoms
      });
      setSuccess('Consultation successfully scheduled! Directing to your appointments ledger...');
      setTimeout(() => {
        setActivePage('patient-appointments');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to book slot.');
    } finally {
      setBookingLoading(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const selectedDoctor = doctors.find(d => String(d.id) === String(selectedDoctorId));

  return (
    <DashboardLayout
      title="Book Medical Consultation"
      subtitle="Select a certified medical doctor, date, and unreserved time slot"
      activePage={activePage}
      setActivePage={setActivePage}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.875rem 1.25rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '0.875rem 1.25rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <CheckCircle size={18} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleBook} className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* 1. Department */}
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
              Step 1: Choose Medical Department
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
              {departments.map((dept) => {
                const isSelected = selectedDeptId === String(dept.id);
                return (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => {
                      setSelectedDeptId(String(dept.id));
                      setSelectedDoctorId('');
                    }}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '0.5rem',
                      border: isSelected ? '2px solid #0d9488' : '1px solid #cbd5e1',
                      backgroundColor: isSelected ? '#f0fdfa' : '#ffffff',
                      color: isSelected ? '#0d9488' : '#334155',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    {dept.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Doctor */}
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
              Step 2: Choose Specialist Doctor
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              {doctors
                .filter(doc => selectedDeptId ? String(doc.department_id) === String(selectedDeptId) : true)
                .map((doc) => {
                  const isSelected = selectedDoctorId === String(doc.id);
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoctorId(String(doc.id))}
                      style={{
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        border: isSelected ? '2px solid #0d9488' : '1px solid #cbd5e1',
                        backgroundColor: isSelected ? '#f0fdfa' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{doc.full_name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#0d9488', fontWeight: 600 }}>{doc.department_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                        Fee: <strong>${Number(doc.consultation_fee).toFixed(2)}</strong> &bull; {doc.room_number}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* 3. Date Selection */}
          {selectedDoctorId && (
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                Step 3: Select Consultation Date
              </label>
              <input
                type="date"
                required
                min={todayStr}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{ width: '100%', maxWidth: '320px', padding: '0.625rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}
              />
            </div>
          )}

          {/* 4. Real-time Slot Picker */}
          {selectedDoctorId && selectedDate && (
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                Step 4: Select Dynamic Time Slot
              </label>

              {loadingSlots ? (
                <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Querying doctor availability...</div>
              ) : availableSlots.length === 0 ? (
                <div style={{ backgroundColor: '#fef3c7', color: '#b45309', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.85rem' }}>
                  No available consultation slots on this date. Please pick another day.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.5rem' }}>
                  {availableSlots.map(slot => {
                    const isSelected = selectedSlot === slot.time;
                    return (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => setSelectedSlot(slot.time)}
                        style={{
                          padding: '0.625rem 0.25rem',
                          borderRadius: '0.5rem',
                          border: isSelected ? '2px solid #0d9488' : '1px solid #cbd5e1',
                          backgroundColor: !slot.available ? '#fee2e2' : isSelected ? '#f0fdfa' : '#ffffff',
                          color: !slot.available ? '#b91c1c' : isSelected ? '#0d9488' : '#1e293b',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          cursor: slot.available ? 'pointer' : 'not-allowed',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.125rem'
                        }}
                      >
                        <span>{slot.time}</span>
                        <span style={{ fontSize: '0.65rem' }}>{slot.available ? 'AVAILABLE' : 'BOOKED'}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 5. Symptoms */}
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
              Step 5: Reason for Visit / Symptoms
            </label>
            <textarea
              rows={3}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="State your main medical complaint or routine checkup request..."
              style={{ width: '100%', padding: '0.625rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
            <button
              type="button"
              onClick={() => setActivePage('patient-dashboard')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={bookingLoading || !selectedSlot}
              className="btn btn-primary"
              style={{ padding: '0.75rem 1.75rem' }}
            >
              {bookingLoading ? 'Reserving...' : 'Confirm Appointment'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
