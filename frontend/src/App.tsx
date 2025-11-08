import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import AppNavbar from "./components/Navbar";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";

// AvailableDay (kun Admin/HP)
import AvailableDaysPage from "./pages/AvailableDaysPage";
import AvailableDayCreatePage from "./pages/AvailableDayCreatePage";
import AvailableDayEditPage from "./pages/AvailableDayEditPage";
import AvailableDayDeletePage from "./pages/AvailableDayDeletePage";

// Appointments
import AppointmentsPage from "./pages/AppointmentsPage";
// NB: vi bruker denne som booking-side for Client (fra AvailableDay)
// beholder komponentnavnet nå, men ruten endres til /appointments/book/:availableDayId
import AppointmentCreatePage from "./pages/AppointmentCreatePage";
import AppointmentDeletePage from "./pages/AppointmentDeletePage";

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="d-flex flex-column min-vh-100">
          <AppNavbar />

          {/* Litt topp-paddding for fixed-top navbar */}
          <main className="flex-grow-1 container-lg pt-4">
            <Routes>
              {/* Public */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<LoginPage />} />

              {/* AvailableDay – KUN Admin/HealthcarePersonnel */}
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
                  <ProtectedRoute roles={["Admin"]}>
                    <AvailableDayDeletePage />
                  </ProtectedRoute>
                }
              />

              {/* Appointments */}
              {/* Client + HP/Admin kan åpne /appointments, men UI og API bestemmer hva man ser */}
              <Route
                path="/appointments"
                element={
                  <ProtectedRoute roles={["Admin", "HealthcarePersonnel", "Client"]}>
                    <AppointmentsPage />
                  </ProtectedRoute>
                }
              />

              {/* Systemoversikt – kun Admin/HP */}
              <Route
                path="/appointments/all"
                element={
                  <ProtectedRoute roles={["Admin", "HealthcarePersonnel"]}>
                    <AppointmentsPage />
                  </ProtectedRoute>
                }
              />

              {/* Booking fra AvailableDay – kun Client */}
              <Route
                path="/appointments/book/:availableDayId"
                element={
                  <ProtectedRoute roles={["Client"]}>
                    <AppointmentCreatePage />
                  </ProtectedRoute>
                }
              />

              {/* Sletting – både Client og Admin/HP (serveren håndhever eierskap/tilgang) */}
              <Route
                path="/appointments/delete/:id"
                element={
                  <ProtectedRoute roles={["Admin", "HealthcarePersonnel", "Client"]}>
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