import React from "react";
import { Navbar, Nav, Container, Modal, Button } from "react-bootstrap";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AppNavbar: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, role, name, logout } = useAuth();

  // Check user roles for conditional menu rendering
  const isHPOrAdmin =
    isAuthenticated && (role === "HealthcarePersonnel" || role === "Admin");

  const [showLogoutModal, setShowLogoutModal] = React.useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigate("/login");
  };

  const displayName = name || "User";

  return (
    <>
      <Navbar
        bg="dark"
        variant="dark"
        expand="lg"
        fixed="top"
        className="shadow-sm"
        aria-label="Main navigation" // For accessibility
      >
        <Container fluid className="px-3">
          <Navbar.Brand as={Link} to="/">
            HomeCare
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />

          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {isAuthenticated && (
                <Nav.Link as={NavLink} to="/appointments">
                  Appointments
                </Nav.Link>
              )}

              {isHPOrAdmin && (
                <Nav.Link as={NavLink} to="/availabledays">
                  Available Days
                </Nav.Link>
              )}
            </Nav>

            <Nav className="d-flex align-items-center">
              {isAuthenticated ? (
                <>
                  <Nav.Link disabled className="me-3 text-light">  {/* We use nav.Link disabled to keep displayname at same heigh as the rest */}
                    {displayName}
                  </Nav.Link>
                  <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
                </>
              ) : (
                <>
                <Nav.Link as={NavLink} to="/register">
                    Register
                  </Nav.Link>
                  <Nav.Link as={NavLink} to="/login">
                    Login
                  </Nav.Link>
                </>
                
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Modal
        show={showLogoutModal}
        onHide={() => setShowLogoutModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm logout</Modal.Title>
        </Modal.Header>
        <Modal.Body>
         Are you sure you want to log out?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLogoutModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmLogout}>
            Log out
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AppNavbar;