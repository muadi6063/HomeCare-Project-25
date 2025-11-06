import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppNavbar from './components/Navbar'; 

import Home from './pages/Home.tsx';
import LoginPage from './pages/LoginPage.tsx';
import AvailableDaysPage from './pages/AvailableDaysPage.tsx';
import AppointmentsPage from './pages/AppointmentsPage.tsx';
import AppointmentCreatePage from "./pages/AppointmentCreatePage";
import AppointmentDeletePage from "./pages/AppointmentDeletePage";

const App: React.FC = () => {
  // AuthProvider (for Context) kommer i Steg F5
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <AppNavbar /> 
        <main className="flex-grow-1 container-lg">
          <Routes>
            {/* Offentlige Ruter */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/availabledays" element={<AvailableDaysPage />} />
            <Route path="/appointments" element={<AppointmentsPage />} />
            <Route path="/appointments/create" element={<AppointmentCreatePage />} />
            <Route path="/appointments/delete/:id" element={<AppointmentDeletePage />} />

            {/* Beskyttede Ruter (ProtectedRoute) kommer i Steg F5/F8 */}

          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;