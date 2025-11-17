import React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AppNavbar: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, role, email, logout } = useAuth();

  const isClient = isAuthenticated && role === "Client";
  const isHPOrAdmin =
    isAuthenticated && (role === "HealthcarePersonnel" || role === "Admin");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Navbar
      bg="dark"
      variant="dark"
      expand="lg"
      fixed="top"
      className="shadow-sm"
    >
      <Container fluid className="px-3">
        <Navbar.Brand as={Link} to="/">
          HomeCare SPA
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/" end>
              Home
            </Nav.Link>

            {/* Admin/HP */}
            {isHPOrAdmin && (
              <>
                <Nav.Link as={NavLink} to="/availabledays">
                  Available days
                </Nav.Link>
                <Nav.Link as={NavLink} to="/appointments">
                  Appointments
                </Nav.Link>
              </>
            )}

            {/* Client */}
            {isClient && (
              <Nav.Link as={NavLink} to="/appointments">
                Appointments
              </Nav.Link>
            )}
          </Nav>

          {/* Right side (Auth) */}
          <Nav>
            {isAuthenticated ? (
              <>
                <Navbar.Text className="me-3">
                  {email} {role ? `(${role})` : ""}
                </Navbar.Text>
                <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
              </>
            ) : (
              <Nav.Link as={NavLink} to="/login">
                Login
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;