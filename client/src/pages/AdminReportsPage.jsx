import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { api } from '../api';
import { BarChart2, TrendingUp, Download, CheckCircle, AlertCircle, FileText, Activity } from 'lucide-react';
import { Doughnut, Line, Bar } from 'react-chartjs-2';

export default function AdminReportsPage({ activePage, setActivePage }) {
  const [metrics, setMetrics] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await api.getAdminMetrics();
        setMetrics(res.metrics);
        setCharts(res.charts);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleDownloadCsv = async () => {
    try {
      const blob = await api.exportAppointmentsCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hospital_appointments_audit_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setSuccess('Appointments audit report CSV downloaded successfully.');
    } catch (err) {
      setError('Failed to download CSV: ' + err.message);
    }
  };

  // Chart data
  const deptLabels = charts?.departmentStats?.map(d => d.name) || ['Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics'];
  const deptCounts = charts?.departmentStats?.map(d => d.appointment_count) || [2, 1, 1, 1];

  const doughnutData = {
    labels: deptLabels,
    datasets: [{
      data: deptCounts,
      backgroundColor: ['#0d9488', '#0284c7', '#6366f1', '#f59e0b', '#ec4899', '#10b981', '#8b5cf6'],
      borderWidth: 1
    }]
  };

  const trendLabels = charts?.recentTrends?.map(t => t.date) || ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'];
  const trendCounts = charts?.recentTrends?.map(t => t.count) || [2, 4, 3, 5, 4];

  const lineData = {
    labels: trendLabels,
    datasets: [{
      label: 'Consultations Scheduled',
      data: trendCounts,
      borderColor: '#0d9488',
      backgroundColor: 'rgba(13, 148, 136, 0.1)',
      fill: true,
      tension: 0.3
    }]
  };

  return (
    <DashboardLayout
      title="Analytics, Metrics & CSV Reporting"
      subtitle="Statistical overview of clinical department loads, booking velocity, and data export"
      activePage={activePage}
      setActivePage={setActivePage}
    >
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

      {/* Action Banner */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', background: 'linear-gradient(to right, #ffffff, #f0fdfa)' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Official Appointment Audit Export</h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
            Download complete comma-separated values (CSV) of all patient appointments, clinical room assignments, and doctor timestamps.
          </p>
        </div>
        <button onClick={handleDownloadCsv} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Download size={18} />
          <span>Download Appointments CSV</span>
        </button>
      </div>

      {/* Visual Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} color="#0d9488" />
            <span>Consultation Trend</span>
          </h3>
          <div style={{ height: '240px' }}>
            <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart2 size={18} color="#0284c7" />
            <span>Departmental Allocation</span>
          </h3>
          <div style={{ height: '240px' }}>
            <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      {/* Summary Statistics Table */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
          Operational Efficiency Metrics
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
          <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>TOTAL APPOINTMENTS</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>{metrics?.totalAppointments || 5}</div>
          </div>
          <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>CONFIRMATION RATE</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a', marginTop: '0.25rem' }}>
              {metrics?.totalAppointments ? (((metrics.confirmedAppointments + metrics.completedAppointments) / metrics.totalAppointments) * 100).toFixed(1) : 100}%
            </div>
          </div>
          <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>REGISTERED PATIENT POOL</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0284c7', marginTop: '0.25rem' }}>{metrics?.totalPatients || 3}</div>
          </div>
          <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>CLINICAL FACULTY HEADCOUNT</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0d9488', marginTop: '0.25rem' }}>{metrics?.totalDoctors || 4}</div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
