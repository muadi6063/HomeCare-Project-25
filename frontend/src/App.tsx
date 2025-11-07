import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppNavbar from './components/Navbar'; 

import Home from './pages/Home.tsx';
import LoginPage from './pages/LoginPage.tsx';
import AvailableDaysPage from './pages/AvailableDaysPage.tsx';
import AppointmentsPage from './pages/AppointmentsPage.tsx';
import AppointmentCreatePage from "./pages/AppointmentCreatePage";
import AppointmentDeletePage from "./pages/AppointmentDeletePage";

import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="d-flex flex-column min-vh-100">
          <AppNavbar /> 
          <main className="flex-grow-1 container-lg">
            <Routes>
              {/* Public pages */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/availabledays" element={<AvailableDaysPage />} />

              {/* Protected routes */}
              <Route
                path="/appointments"
                element={
                  <ProtectedRoute roles={['Admin', 'HealthcarePersonnel']}>
                    <AppointmentsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/appointments/create"
                element={
                  <ProtectedRoute roles={['HealthcarePersonnel', 'Admin']}>
                    <AppointmentCreatePage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/appointments/delete/:id"
                element={
                  <ProtectedRoute roles={['Admin']}>
                    <AppointmentDeletePage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
