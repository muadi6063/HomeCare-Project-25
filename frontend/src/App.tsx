import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import AppNavbar from "./components/Navbar";
import Footer from "./components/Footer";

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
    // Global authentication provider — exposes login state and JWT-based user info to the entire app
    <AuthProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100">
          <AppNavbar />

          <main className="flex-grow-1 pb-5">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Available days (Admin & HealthcarePersonnel only) */}
              <Route 
                path="/availabledays"
                element={
                  <ProtectedRoute roles={["Admin", "HealthcarePersonnel"]}>
                    <AvailableDaysPage />
                  </ProtectedRoute>
                }
              />

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
                  <ProtectedRoute roles={["Admin", "HealthcarePersonnel"]}>
                    <AvailableDayDeletePage />
                  </ProtectedRoute>
                }
              />
              
              {/* Appointments (role-based access for Admin, Personnel, and Client) */}
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

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;