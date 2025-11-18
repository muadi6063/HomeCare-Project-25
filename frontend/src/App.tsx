import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import AppNavbar from "./components/Navbar";

// Pages
import Home from "./pages/Home";
import LoginPage from "./auth/LoginPage";
import RegisterPage from "./auth/RegisterPage";

// AvailableDay 
import AvailableDaysPage from "./pages/AvailableDaysPage";
import AvailableDayCreatePage from "./pages/AvailableDayCreatePage";
import AvailableDayEditPage from "./pages/AvailableDayEditPage";
import AvailableDayDeletePage from "./pages/AvailableDayDeletePage";

// Appointments
import AppointmentsPage from "./pages/AppointmentsPage";
import AppointmentCreatePage from "./pages/AppointmentCreatePage";
import AppointmentEditPage from "./pages/AppointmentEditPage";
import AppointmentDeletePage from "./pages/AppointmentDeletePage";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100">
          <AppNavbar />
          <main className="flex-grow-1 container-lg">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage/>} />
              <Route path="/availabledays" element={<AvailableDaysPage />} />
              
              {/* AvailableDays - Admin/HealthcarePersonnel */}
              <Route 
                path="/availabledays/create" 
                element={
                  <ProtectedRoute roles={["Admin", "HealthcarePersonnel"]}>
                    <AvailableDayCreatePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/availabledays/edit/:id" 
                element={
                  <ProtectedRoute roles={["Admin", "HealthcarePersonnel"]}>
                    <AvailableDayEditPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/availabledays/delete/:id" 
                element={
                  <ProtectedRoute roles={["Admin"]}>
                    <AvailableDayDeletePage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Appointments - Alle authorized users */}
              <Route 
                path="/appointments" 
                element={
                  <ProtectedRoute roles={["Admin", "HealthcarePersonnel", "Client"]}>
                    <AppointmentsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/appointments/book/:availableDayId" 
                element={
                  <ProtectedRoute roles={["Client"]}>
                    <AppointmentCreatePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/appointments/edit/:id" 
                element={
                  <ProtectedRoute roles={["Admin", "HealthcarePersonnel", "Client"]}>
                    <AppointmentEditPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/appointments/delete/:id" 
                element={
                  <ProtectedRoute roles={["Admin", "HealthcarePersonnel", "Client"]}>
                    <AppointmentDeletePage />
                  </ProtectedRoute>
                } 
              />

              {/* Catch-all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;