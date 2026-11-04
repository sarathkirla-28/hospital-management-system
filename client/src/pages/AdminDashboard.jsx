import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import {
  Users, Stethoscope, Calendar, Clock, Download, Plus, Search, Filter, 
  ShieldCheck, AlertCircle, CheckCircle, XCircle, RefreshCw, Edit2, 
  Check, X, FileText, Activity, TrendingUp, BarChart2
} from 'lucide-react';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut, Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'appointments', 'patients', 'doctors', 'reports'

  // Metrics & Charts State
  const [metrics, setMetrics] = useState(null);
  const [charts, setCharts] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);

  // Appointments Ledger State
  const [appointments, setAppointments] = useState([]);
  const [appSearch, setAppSearch] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState('');
  const [appDateFilter, setAppDateFilter] = useState('');

  // Patients Management State
  const [patients, setPatients] = useState([]);
  const [patientSearch, setPatientSearch] = useState('');

  // Doctors Management State
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);

  // New Doctor Form
  const [newDocData, setNewDocData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    department_id: '',
    specialization: '',
    qualification: 'MD',
    experience_years: '5',
    consultation_fee: '75',
    room_number: 'Room 201',
    bio: ''
  });

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadAllAdminData = async () => {
    try {
      setLoading(true);
      const [metricsRes, appRes, patRes, docRes, deptRes] = await Promise.all([
        api.getAdminMetrics(),
        api.getAdminAppointments(buildAppParams()),
        api.getAdminPatients(patientSearch ? `?search=${patientSearch}` : ''),
        api.getAdminDoctors(),
        api.getDepartments()
      ]);

      setMetrics(metricsRes.metrics);
      setCharts(metricsRes.charts);
      setRecentActivity(metricsRes.recentActivity || []);
      setAppointments(appRes.appointments || []);
      setPatients(patRes.patients || []);
      setDoctors(docRes.doctors || []);
      setDepartments(deptRes.departments || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      setError(err.message || 'Error fetching administrative records');
    } finally {
      setLoading(false);
    }
  };

  const buildAppParams = () => {
    const params = [];
    if (appSearch) params.push(`search=${appSearch}`);
    if (appStatusFilter) params.push(`status=${appStatusFilter}`);
    if (appDateFilter) params.push(`date=${appDateFilter}`);
    return params.length > 0 ? `?${params.join('&')}` : '';
  };

  useEffect(() => {
    loadAllAdminData();
  }, [appStatusFilter, appDateFilter]);

  const handleSearchAppointments = (e) => {
    e.preventDefault();
    api.getAdminAppointments(buildAppParams())
      .then(res => setAppointments(res.appointments || []))
      .catch(err => setError(err.message));
  };

  const handleSearchPatients = (e) => {
    e.preventDefault();
    api.getAdminPatients(`?search=${patientSearch}`)
      .then(res => setPatients(res.patients || []))
      .catch(err => setError(err.message));
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await api.toggleUserStatus(userId, newStatus);
      setSuccessMsg(`User account status updated to ${newStatus}.`);
      loadAllAdminData();
    } catch (err) {
      setError(err.message || 'Failed to toggle status.');
    }
  };

  const handleAdminStatusOverride = async (appId, newStatus) => {
    try {
      await api.updateAppointmentStatusByAdmin(appId, newStatus, `Status overridden by Admin (${user.full_name})`);
      setSuccessMsg(`Appointment status overridden to ${newStatus}.`);
      loadAllAdminData();
    } catch (err) {
      setError(err.message || 'Failed to update appointment status.');
    }
  };

  const handleAddDoctorSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.addDoctor(newDocData);
      setSuccessMsg('New doctor added successfully with active schedule.');
      setShowAddDoctorModal(false);
      setNewDocData({
        full_name: '', email: '', password: '', phone: '', department_id: '',
        specialization: '', qualification: 'MD', experience_years: '5', consultation_fee: '75',
        room_number: 'Room 201', bio: ''
      });
      loadAllAdminData();
    } catch (err) {
      setError(err.message || 'Failed to add doctor.');
    }
  };

  const handleExportCsv = async () => {
    try {
      const blob = await api.exportAppointmentsCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hospital_appointments_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setSuccessMsg('Appointments CSV report downloaded successfully.');
    } catch (err) {
      setError('Failed to export CSV report: ' + err.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed': return <span className="badge badge-confirmed">Confirmed</span>;
      case 'Pending': return <span className="badge badge-pending">Pending</span>;
      case 'Completed': return <span className="badge badge-completed">Completed</span>;
      case 'Cancelled': return <span className="badge badge-cancelled">Cancelled</span>;
      default: return <span className="badge badge-inactive">{status}</span>;
    }
  };

  // Prepare chart data
  const deptLabels = charts?.departmentStats?.map(d => d.name) || [];
  const deptCounts = charts?.departmentStats?.map(d => d.appointment_count) || [];

  const doughnutData = {
    labels: deptLabels,
    datasets: [{
      data: deptCounts,
      backgroundColor: ['#0d9488', '#0284c7', '#6366f1', '#f59e0b', '#ec4899', '#10b981', '#8b5cf6'],
      borderWidth: 1
    }]
  };

  const trendLabels = charts?.recentTrends?.map(t => t.date) || [];
  const trendCounts = charts?.recentTrends?.map(t => t.count) || [];

  const lineData = {
    labels: trendLabels.length > 0 ? trendLabels : ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'],
    datasets: [{
      label: 'Daily Bookings',
      data: trendCounts.length > 0 ? trendCounts : [2, 4, 3, 5, 4],
      borderColor: '#0d9488',
      backgroundColor: 'rgba(13, 148, 136, 0.1)',
      fill: true,
      tension: 0.3
    }]
  };

  return (
    <div style={{ padding: '2.5rem 0' }}>
      <div className="container">
        {/* Header & Controls */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 700, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <ShieldCheck size={18} />
              <span>Administrator Executive Control Panel</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>
              Hospital Operations Command
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleExportCsv}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
            >
              <Download size={16} color="#0d9488" />
              <span>Export CSV Report</span>
            </button>
            <button
              onClick={() => setShowAddDoctorModal(true)}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
            >
              <Plus size={16} />
              <span>Add New Doctor</span>
            </button>
          </div>
        </div>

        {/* Feedback Banners */}
        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.875rem 1.25rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
            <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#b91c1c', cursor: 'pointer' }}><X size={16} /></button>
          </div>
        )}

        {successMsg && (
          <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '0.875rem 1.25rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={18} />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg('')} style={{ background: 'none', border: 'none', color: '#065f46', cursor: 'pointer' }}><X size={16} /></button>
          </div>
        )}

        {/* Executive Metric Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
          <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #0d9488' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Patients</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>{metrics?.totalPatients || 0}</div>
            <div style={{ fontSize: '0.75rem', color: '#0d9488', marginTop: '0.25rem' }}>Registered Profiles</div>
          </div>

          <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #0284c7' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Active Doctors</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>{metrics?.totalDoctors || 0}</div>
            <div style={{ fontSize: '0.75rem', color: '#0284c7', marginTop: '0.25rem' }}>Specialists on Duty</div>
          </div>

          <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #4f46e5' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Bookings</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>{metrics?.totalAppointments || 0}</div>
            <div style={{ fontSize: '0.75rem', color: '#4f46e5', marginTop: '0.25rem' }}>Lifetime Records</div>
          </div>

          <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #d97706' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Pending</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#d97706', marginTop: '0.25rem' }}>{metrics?.pendingAppointments || 0}</div>
            <div style={{ fontSize: '0.75rem', color: '#d97706', marginTop: '0.25rem' }}>Awaiting Doctor Review</div>
          </div>

          <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #16a34a' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Confirmed</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#16a34a', marginTop: '0.25rem' }}>{metrics?.confirmedAppointments || 0}</div>
            <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.25rem' }}>Scheduled Visits</div>
          </div>

          <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #dc2626' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Cancelled</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#dc2626', marginTop: '0.25rem' }}>{metrics?.cancelledAppointments || 0}</div>
            <div style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }}>Slots Liberated</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', flexWrap: 'wrap', borderBottom: '1px solid #cbd5e1', marginBottom: '2rem', gap: '1rem' }}>
          {[
            { id: 'overview', label: 'Overview & Visual Analytics' },
            { id: 'appointments', label: `Master Appointments (${appointments.length})` },
            { id: 'patients', label: `Manage Patients (${patients.length})` },
            { id: 'doctors', label: `Manage Doctors (${doctors.length})` },
            { id: 'reports', label: 'Audit & Reports' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'none',
                border: 'none',
                padding: '0.75rem 0.5rem',
                fontSize: '0.95rem',
                fontWeight: activeTab === tab.id ? 700 : 500,
                color: activeTab === tab.id ? '#0d9488' : '#64748b',
                borderBottom: activeTab === tab.id ? '3px solid #0d9488' : '3px solid transparent',
                cursor: 'pointer'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: Overview & Analytics                                               */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div>
            {/* Visual Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
              <div className="card" style={{ padding: '1.75rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingUp size={18} color="#0d9488" />
                  <span>Recent Booking Volume Trend</span>
                </h3>
                <div style={{ height: '240px' }}>
                  <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>

              <div className="card" style={{ padding: '1.75rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BarChart2 size={18} color="#0284c7" />
                  <span>Departmental Consultation Distribution</span>
                </h3>
                <div style={{ height: '240px' }}>
                  <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>
            </div>

            {/* Recent Audit Feed */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={18} color="#0d9488" />
                <span>Recent System Activity & Status Transitions</span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {recentActivity.map((act) => (
                  <div key={act.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem', fontSize: '0.85rem' }}>
                    <div>
                      <strong style={{ color: '#0f172a' }}>{act.patient_name}</strong> &bull; Appt <strong>{act.appointment_number}</strong> with Dr. {act.doctor_name}
                      <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
                        {act.comments || 'Status update logged'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {act.previous_status && <span style={{ color: '#64748b' }}>{act.previous_status} &rarr;</span>}
                      {getStatusBadge(act.new_status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: Master Appointments Ledger                                         */}
        {/* ========================================================================= */}
        {activeTab === 'appointments' && (
          <div>
            {/* Filter Bar */}
            <form onSubmit={handleSearchAppointments} className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{ flexGrow: 1, minWidth: '220px' }}>
                <input
                  type="text"
                  value={appSearch}
                  onChange={(e) => setAppSearch(e.target.value)}
                  placeholder="Search by appointment #, patient, or doctor..."
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <select
                  value={appStatusFilter}
                  onChange={(e) => setAppStatusFilter(e.target.value)}
                  style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.85rem', backgroundColor: '#ffffff' }}
                >
                  <option value="">All Statuses</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <input
                  type="date"
                  value={appDateFilter}
                  onChange={(e) => setAppDateFilter(e.target.value)}
                  style={{ padding: '0.45rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-sm">
                Filter Ledger
              </button>
            </form>

            {/* Table */}
            <div className="card" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                    <th style={{ padding: '0.875rem 1rem' }}>Appt #</th>
                    <th style={{ padding: '0.875rem 1rem' }}>Patient Name</th>
                    <th style={{ padding: '0.875rem 1rem' }}>Doctor & Dept</th>
                    <th style={{ padding: '0.875rem 1rem' }}>Date & Time</th>
                    <th style={{ padding: '0.875rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>Admin Override</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((app) => (
                    <tr key={app.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: '#0d9488' }}>
                        {app.appointment_number}
                      </td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{app.patient_name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{app.patient_phone || app.patient_email}</div>
                      </td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{app.doctor_name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#0284c7' }}>{app.department_name} ({app.room_number})</div>
                      </td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <div>{app.appointment_date}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{app.slot_time}</div>
                      </td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        {getStatusBadge(app.status)}
                      </td>
                      <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.375rem' }}>
                          {app.status !== 'Confirmed' && (
                            <button
                              onClick={() => handleAdminStatusOverride(app.id, 'Confirmed')}
                              className="btn btn-secondary btn-sm"
                              title="Approve / Confirm"
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            >
                              Confirm
                            </button>
                          )}
                          {app.status !== 'Completed' && (
                            <button
                              onClick={() => handleAdminStatusOverride(app.id, 'Completed')}
                              className="btn btn-secondary btn-sm"
                              title="Mark Completed"
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            >
                              Complete
                            </button>
                          )}
                          {app.status !== 'Cancelled' && (
                            <button
                              onClick={() => handleAdminStatusOverride(app.id, 'Cancelled')}
                              className="btn btn-danger btn-sm"
                              title="Cancel & Free Slot"
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: User Management - Patients                                         */}
        {/* ========================================================================= */}
        {activeTab === 'patients' && (
          <div>
            <form onSubmit={handleSearchPatients} className="card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem' }}>
              <input
                type="text"
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                placeholder="Search registered patients by name, email, or phone..."
                style={{ flexGrow: 1, padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              />
              <button type="submit" className="btn btn-primary btn-sm">
                Search Patients
              </button>
            </form>

            <div className="card" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                    <th style={{ padding: '0.875rem 1rem' }}>Patient Name</th>
                    <th style={{ padding: '0.875rem 1rem' }}>Email & Phone</th>
                    <th style={{ padding: '0.875rem 1rem' }}>Blood Group & DOB</th>
                    <th style={{ padding: '0.875rem 1rem' }}>Total Bookings</th>
                    <th style={{ padding: '0.875rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>Account Action</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((pat) => (
                    <tr key={pat.patient_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.875rem 1rem', fontWeight: 600, color: '#0f172a' }}>
                        {pat.full_name}
                      </td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <div>{pat.email}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{pat.phone || 'No phone'}</div>
                      </td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <div>Blood: <strong>{pat.blood_group || 'N/A'}</strong></div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>DOB: {pat.dob || 'N/A'}</div>
                      </td>
                      <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: '#0d9488' }}>
                        {pat.total_bookings} Bookings
                      </td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <span className={`badge ${pat.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>
                          {pat.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                        <button
                          onClick={() => handleToggleUserStatus(pat.user_id, pat.status)}
                          className={`btn ${pat.status === 'active' ? 'btn-danger' : 'btn-primary'} btn-sm`}
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        >
                          {pat.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: User Management - Doctors                                          */}
        {/* ========================================================================= */}
        {activeTab === 'doctors' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.25rem' }}>
              <button
                onClick={() => setShowAddDoctorModal(true)}
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
              >
                <Plus size={16} />
                <span>Add Doctor Profile</span>
              </button>
            </div>

            <div className="card" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                    <th style={{ padding: '0.875rem 1rem' }}>Doctor Name</th>
                    <th style={{ padding: '0.875rem 1rem' }}>Department & Spec</th>
                    <th style={{ padding: '0.875rem 1rem' }}>Clinic Room</th>
                    <th style={{ padding: '0.875rem 1rem' }}>Consultation Fee</th>
                    <th style={{ padding: '0.875rem 1rem' }}>Appointments Handled</th>
                    <th style={{ padding: '0.875rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map((doc) => (
                    <tr key={doc.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.875rem 1rem', fontWeight: 600, color: '#0f172a' }}>
                        {doc.full_name}
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{doc.email}</div>
                      </td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <div style={{ fontWeight: 600, color: '#0d9488' }}>{doc.department_name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{doc.specialization}</div>
                      </td>
                      <td style={{ padding: '0.875rem 1rem' }}>{doc.room_number}</td>
                      <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: '#0f172a' }}>
                        ${Number(doc.consultation_fee).toFixed(2)}
                      </td>
                      <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: '#4f46e5' }}>
                        {doc.total_appointments} visits
                      </td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <span className={`badge ${doc.is_available ? 'badge-confirmed' : 'badge-inactive'}`}>
                          {doc.is_available ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                        <button
                          onClick={() => handleToggleUserStatus(doc.user_id, doc.status)}
                          className={`btn ${doc.status === 'active' ? 'btn-danger' : 'btn-primary'} btn-sm`}
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        >
                          {doc.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: Audit & Reports                                                    */}
        {/* ========================================================================= */}
        {activeTab === 'reports' && (
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  Hospital Management Audit & Reporting
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Generate and export structured clinical and scheduling reports for hospital administrative oversight.
                </p>
              </div>
              <button onClick={handleExportCsv} className="btn btn-primary">
                <Download size={18} />
                <span>Export Appointments CSV</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>Appointment Success Ratio</h4>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a' }}>
                  {metrics?.totalAppointments > 0 ? (((metrics.completedAppointments + metrics.confirmedAppointments) / metrics.totalAppointments) * 100).toFixed(1) : 100}%
                </div>
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>Percentage of fulfilled appointments</p>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>Cancellation Ratio</h4>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#dc2626' }}>
                  {metrics?.totalAppointments > 0 ? ((metrics.cancelledAppointments / metrics.totalAppointments) * 100).toFixed(1) : 0}%
                </div>
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>Percentage of freed/cancelled slots</p>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>Active Departments</h4>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0284c7' }}>
                  {departments.length}
                </div>
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>Operational clinical units</p>
              </div>
            </div>

            <div style={{ backgroundColor: '#f0fdfa', border: '1px solid #ccfbf1', padding: '1.25rem', borderRadius: '0.5rem', fontSize: '0.85rem', color: '#0f766e' }}>
              <strong>Admin Audit Trail Compliance:</strong> Every appointment state change (Creation, Confirmation, Completion, Cancellation) is timestamped and recorded in the relational `appointment_status_history` table for accountability.
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* Modal: Add New Doctor                                                     */}
        {/* ========================================================================= */}
        {showAddDoctorModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 60,
            padding: '1rem'
          }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '1rem', maxWidth: '540px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Add New Doctor Account</h3>
                <button onClick={() => setShowAddDoctorModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
              </div>

              <form onSubmit={handleAddDoctorSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Full Doctor Name *</label>
                  <input
                    type="text"
                    required
                    value={newDocData.full_name}
                    onChange={(e) => setNewDocData({ ...newDocData, full_name: e.target.value })}
                    placeholder="e.g. Dr. Robert Wilson"
                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Email *</label>
                    <input
                      type="email"
                      required
                      value={newDocData.email}
                      onChange={(e) => setNewDocData({ ...newDocData, email: e.target.value })}
                      placeholder="dr.robert@hospital.demo"
                      style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Password *</label>
                    <input
                      type="password"
                      required
                      value={newDocData.password}
                      onChange={(e) => setNewDocData({ ...newDocData, password: e.target.value })}
                      placeholder="••••••••"
                      style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Department *</label>
                    <select
                      required
                      value={newDocData.department_id}
                      onChange={(e) => setNewDocData({ ...newDocData, department_id: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', backgroundColor: '#ffffff' }}
                    >
                      <option value="">-- Choose Department --</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Specialization *</label>
                    <input
                      type="text"
                      required
                      value={newDocData.specialization}
                      onChange={(e) => setNewDocData({ ...newDocData, specialization: e.target.value })}
                      placeholder="e.g. Clinical Neurology"
                      style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Qualification</label>
                    <input
                      type="text"
                      value={newDocData.qualification}
                      onChange={(e) => setNewDocData({ ...newDocData, qualification: e.target.value })}
                      style={{ width: '100%', padding: '0.45rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Exp (Yrs)</label>
                    <input
                      type="number"
                      value={newDocData.experience_years}
                      onChange={(e) => setNewDocData({ ...newDocData, experience_years: e.target.value })}
                      style={{ width: '100%', padding: '0.45rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Fee ($)</label>
                    <input
                      type="number"
                      value={newDocData.consultation_fee}
                      onChange={(e) => setNewDocData({ ...newDocData, consultation_fee: e.target.value })}
                      style={{ width: '100%', padding: '0.45rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Room / Clinic</label>
                    <input
                      type="text"
                      value={newDocData.room_number}
                      onChange={(e) => setNewDocData({ ...newDocData, room_number: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Phone</label>
                    <input
                      type="text"
                      value={newDocData.phone}
                      onChange={(e) => setNewDocData({ ...newDocData, phone: e.target.value })}
                      placeholder="+1-555-0255"
                      style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Doctor Bio</label>
                  <textarea
                    rows={2}
                    value={newDocData.bio}
                    onChange={(e) => setNewDocData({ ...newDocData, bio: e.target.value })}
                    placeholder="Short professional summary..."
                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                  <button type="button" onClick={() => setShowAddDoctorModal(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Doctor Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
