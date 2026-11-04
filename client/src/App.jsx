import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';

// Public Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import DepartmentsPage from './pages/DepartmentsPage';
import DoctorsPage from './pages/DoctorsPage';
import DoctorDetailsPage from './pages/DoctorDetailsPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Patient Portal Pages
import PatientDashboard from './pages/PatientDashboard';
import BookAppointmentPage from './pages/BookAppointmentPage';
import PatientAppointmentsPage from './pages/PatientAppointmentsPage';
import PatientProfilePage from './pages/PatientProfilePage';

// Doctor Portal Pages
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorTodayAppointmentsPage from './pages/DoctorTodayAppointmentsPage';
import DoctorSchedulePage from './pages/DoctorSchedulePage';
import DoctorProfilePage from './pages/DoctorProfilePage';

// Admin Portal Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminPatientsPage from './pages/AdminPatientsPage';
import AdminDoctorsPage from './pages/AdminDoctorsPage';
import AdminDepartmentsPage from './pages/AdminDepartmentsPage';
import AdminAppointmentsPage from './pages/AdminAppointmentsPage';
import AdminReportsPage from './pages/AdminReportsPage';
import AdminProfilePage from './pages/AdminProfilePage';

function MainApp() {
  const { user } = useAuth();
  const [activePage, setActivePage] = useState('home');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);

  // Auth modal
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');

  // Sync with window.location.hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      if (hash) {
        setActivePage(hash);
      }
    };

    if (window.location.hash) {
      handleHashChange();
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (page) => {
    window.location.hash = `#/${page}`;
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const isPublicPage = [
    'home', 'about', 'departments', 'doctors', 'doctor-details', 'contact', 'login', 'register'
  ].includes(activePage);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      {/* Show Public Navbar on public pages */}
      {isPublicPage && (
        <Navbar
          activePage={activePage}
          setActivePage={navigateTo}
          openAuthModal={openAuthModal}
        />
      )}

      {/* Main View Router */}
      <main style={{ flexGrow: 1 }}>
        {/* PUBLIC PAGES */}
        {activePage === 'home' && (
          <HomePage
            setActivePage={navigateTo}
            openAuthModal={openAuthModal}
          />
        )}

        {activePage === 'about' && (
          <AboutPage
            setActivePage={navigateTo}
            openAuthModal={openAuthModal}
          />
        )}

        {activePage === 'departments' && (
          <DepartmentsPage
            setActivePage={navigateTo}
            onSelectDepartment={(id) => {
              setSelectedDepartmentId(id);
              navigateTo('doctors');
            }}
          />
        )}

        {activePage === 'doctors' && (
          <DoctorsPage
            selectedDepartmentId={selectedDepartmentId}
            setActivePage={navigateTo}
            openAuthModal={openAuthModal}
            onBookDoctor={(doc) => {
              setSelectedDoctor(doc);
              setSelectedDoctorId(doc.id);
            }}
          />
        )}

        {activePage === 'doctor-details' && (
          <DoctorDetailsPage
            doctorId={selectedDoctorId}
            setActivePage={navigateTo}
            openAuthModal={openAuthModal}
            onBookDoctor={(doc) => {
              setSelectedDoctor(doc);
              navigateTo('patient-book');
            }}
          />
        )}

        {activePage === 'contact' && (
          <ContactPage />
        )}

        {activePage === 'login' && (
          <LoginPage
            setActivePage={navigateTo}
            onLoginSuccess={(u) => {
              if (u.role === 'admin') navigateTo('admin-dashboard');
              else if (u.role === 'doctor') navigateTo('doctor-dashboard');
              else navigateTo('patient-dashboard');
            }}
          />
        )}

        {activePage === 'register' && (
          <RegisterPage
            setActivePage={navigateTo}
            onLoginSuccess={() => navigateTo('patient-dashboard')}
          />
        )}

        {/* PATIENT PORTAL */}
        {activePage === 'patient-dashboard' && (
          <PatientDashboard preSelectedDoctor={selectedDoctor} />
        )}

        {activePage === 'patient-book' && (
          <BookAppointmentPage
            activePage={activePage}
            setActivePage={navigateTo}
            preSelectedDoctor={selectedDoctor}
          />
        )}

        {activePage === 'patient-appointments' && (
          <PatientAppointmentsPage
            activePage={activePage}
            setActivePage={navigateTo}
            isHistoryView={false}
          />
        )}

        {activePage === 'patient-history' && (
          <PatientAppointmentsPage
            activePage={activePage}
            setActivePage={navigateTo}
            isHistoryView={true}
          />
        )}

        {activePage === 'patient-doctors' && (
          <DoctorsPage
            setActivePage={navigateTo}
            openAuthModal={openAuthModal}
            onBookDoctor={(doc) => {
              setSelectedDoctor(doc);
              navigateTo('patient-book');
            }}
          />
        )}

        {activePage === 'patient-profile' && (
          <PatientProfilePage
            activePage={activePage}
            setActivePage={navigateTo}
          />
        )}

        {/* DOCTOR PORTAL */}
        {activePage === 'doctor-dashboard' && (
          <DoctorDashboard />
        )}

        {activePage === 'doctor-today' && (
          <DoctorTodayAppointmentsPage
            activePage={activePage}
            setActivePage={navigateTo}
            isHistory={false}
          />
        )}

        {activePage === 'doctor-history' && (
          <DoctorTodayAppointmentsPage
            activePage={activePage}
            setActivePage={navigateTo}
            isHistory={true}
          />
        )}

        {activePage === 'doctor-schedule' && (
          <DoctorSchedulePage
            activePage={activePage}
            setActivePage={navigateTo}
          />
        )}

        {activePage === 'doctor-profile' && (
          <DoctorProfilePage
            activePage={activePage}
            setActivePage={navigateTo}
          />
        )}

        {/* ADMIN PORTAL */}
        {activePage === 'admin-dashboard' && (
          <AdminDashboard />
        )}

        {activePage === 'admin-patients' && (
          <AdminPatientsPage
            activePage={activePage}
            setActivePage={navigateTo}
          />
        )}

        {activePage === 'admin-doctors' && (
          <AdminDoctorsPage
            activePage={activePage}
            setActivePage={navigateTo}
          />
        )}

        {activePage === 'admin-departments' && (
          <AdminDepartmentsPage
            activePage={activePage}
            setActivePage={navigateTo}
          />
        )}

        {activePage === 'admin-appointments' && (
          <AdminAppointmentsPage
            activePage={activePage}
            setActivePage={navigateTo}
          />
        )}

        {activePage === 'admin-reports' && (
          <AdminReportsPage
            activePage={activePage}
            setActivePage={navigateTo}
          />
        )}

        {activePage === 'admin-profile' && (
          <AdminProfilePage
            activePage={activePage}
            setActivePage={navigateTo}
          />
        )}
      </main>

      {/* Public Footer */}
      {isPublicPage && <Footer setActivePage={navigateTo} />}

      {/* Universal Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={(u) => {
          if (u.role === 'admin') navigateTo('admin-dashboard');
          else if (u.role === 'doctor') navigateTo('doctor-dashboard');
          else navigateTo('patient-dashboard');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
