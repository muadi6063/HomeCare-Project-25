import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppNavbar from './components/Navbar'; 

import Home from './pages/Home.tsx';
import LoginPage from './pages/LoginPage.tsx';
import AvailableDaysPage from './pages/AvailableDaysPage.tsx';
import AppointmentsPage from './pages/AppointmentsPage.tsx';

const App: React.FC = () => {
  // AuthProvider (for Context) kommer i Steg F5
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <AppNavbar /> 
        <main className="flex-grow-1 container"> 
          <Routes>
            {/* Offentlige Ruter */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/availabledays" element={<AvailableDaysPage />} />
            <Route path="/appointments" element={<AppointmentsPage />} />

            {/* Beskyttede Ruter (ProtectedRoute) kommer i Steg F5/F8 */}

          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;