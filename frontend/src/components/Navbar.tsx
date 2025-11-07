import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AppNavbar: React.FC = () => {
  const { isAuthenticated, role, email, logout } = useAuth();

  return (
    <Navbar bg="dark" variant="dark" expand="lg" fixed="top" className="shadow-sm">
      <Container fluid className="px-3">
        <Navbar.Brand as={Link} to="/">HomeCare SPA</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/availabledays">Available days</Nav.Link>

            {/* Hide UI */}
            {isAuthenticated && (role === 'Admin' || role === 'HealthcarePersonnel') && (
              <Nav.Link as={Link} to="/appointments">Appointments</Nav.Link>
            )}
          </Nav>

          <Nav>
            {isAuthenticated ? (
              <>
                <Navbar.Text className="me-3">
                  {email} {role ? `(${role})` : ""}
                </Navbar.Text>
                <Nav.Link onClick={logout}>Logout</Nav.Link>
              </>
            ) : (
              <Nav.Link as={Link} to="/login">Login</Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
