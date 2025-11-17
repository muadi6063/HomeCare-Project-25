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

 
  let displayName = "";
  if (email) {
    const beforeAt = email.split("@")[0];
    displayName =
      beforeAt.charAt(0).toUpperCase() + beforeAt.slice(1);
  }

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

            {isHPOrAdmin && (
              <>
                <Nav.Link as={NavLink} to="/appointments">
                  Appointments
                </Nav.Link>
                <Nav.Link as={NavLink} to="/availabledays">
                  Available Days
                </Nav.Link>
              </>
            )}

            {isClient && (
              <Nav.Link as={NavLink} to="/appointments">
                Appointments
              </Nav.Link>
            )}
          </Nav>

          <Nav>
            {isAuthenticated ? (
              <>
                <Navbar.Text className="me-3">
                  {displayName}
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
