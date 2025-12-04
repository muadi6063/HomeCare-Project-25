import React from "react";
import { Navbar, Nav, Container, Modal, Button } from "react-bootstrap";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AppNavbar: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, role, name, logout } = useAuth();

  // Determine if user has elevated access (used for conditional navigation)
  const isHPOrAdmin =
    isAuthenticated && (role === "HealthcarePersonnel" || role === "Admin");

  // Show confirmation modal before completing logout
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
        aria-label="Main navigation"
      >
        <Container fluid className="px-3">
          <Navbar.Brand as={Link} to="/">
            HomeCareHub
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
                  {/* Disabled Nav.Link used only for layout alignment with other menu items */}
                  <Nav.Link disabled className="me-3 text-light">
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

        <Modal.Body>Are you sure you want to log out?</Modal.Body>

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