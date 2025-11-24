// src/pages/Home.tsx
import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import heroImg from "../assets/home-hero.jpg";

const Home: React.FC = () => {
  const { isAuthenticated, role } = useAuth();

  const isClient = isAuthenticated && role === "Client";
  const isHP = isAuthenticated && role === "HealthcarePersonnel";
  const isAdmin = isAuthenticated && role === "Admin";
  const isHPOrAdmin = isHP || isAdmin;

  return (
    <Container className="py-4">
      {/* HERO SECTION */}
      <Row className="align-items-center hero-section mb-5 gx-lg-5">
        {/* Text side */}
        <Col md={6} className="mb-4 mb-md-0">
          <span className="text-uppercase text-muted fw-semibold small d-inline-block mb-2">
            Safe help at home
          </span>
          <h1 className="fw-semibold mb-3 hero-title">HomeCare Booking</h1>
          <p className="lead mb-3">
            A web-based booking tool for organising homecare visits, so older
            adults can receive safe and practical support at home.
          </p>

          {!isAuthenticated && (
            <p className="mb-4 text-muted">
              Clients and relatives use this portal to request help with
              everyday tasks. Healthcare staff use it to publish available
              time slots and follow up appointments.
            </p>
          )}

          {isClient && (
            <p className="mb-4 text-muted">
              You are signed in as a client. Go to{" "}
              <strong>Appointments</strong> to see available time slots and
              manage your visits.
            </p>
          )}

          {isHPOrAdmin && (
            <p className="mb-4 text-muted">
              You are signed in as{" "}
              <strong>{isAdmin ? "an administrator" : "healthcare personnel"}</strong>.
              Use the links below to manage available days and appointments.
            </p>
          )}

          {/* Primary actions in hero */}
          <div className="d-flex flex-wrap gap-2">
            {!isAuthenticated && (
              <>
                <Button as={Link} to="/register" variant="primary">
                  Create client account
                </Button>
                <Button as={Link} to="/login" variant="outline-primary">
                  Log in
                </Button>
              </>
            )}

            {isClient && (
              <Button as={Link} to="/appointments" variant="primary">
                Go to my appointments
              </Button>
            )}

            {isHPOrAdmin && (
              <>
                <Button as={Link} to="/availabledays" variant="primary">
                  Manage available days
                </Button>
                <Button as={Link} to="/appointments" variant="outline-primary">
                  View appointments
                </Button>
              </>
            )}
          </div>
        </Col>

        {/* Image side */}
        <Col md={6}>
          <div className="hero-image-wrapper">
            <img
              src={heroImg}
              alt="Healthcare worker supporting an older adult at home"
              className="hero-image"
            />
          </div>
        </Col>
      </Row>

      {/* INFO CARDS */}
      <Row className="g-4 justify-content-center">
        {/* Not signed in: focus on explanation + client entry */}
        {!isAuthenticated && (
          <>
            <Col md={6} lg={5}>
              <Card className="h-100 hover-card">
                <Card.Body>
                  <Card.Subtitle className="text-uppercase text-muted mb-2">
                    For clients & relatives
                  </Card.Subtitle>
                  <Card.Title>Access your homecare services</Card.Title>
                  <Card.Text>
                    Create a client account or log in to request homecare
                    visits, view upcoming bookings and keep a simple overview
                    of the help you receive at home.
                  </Card.Text>
                  <Card.Text className="text-muted">
                    The portal is designed to be calm and easy to use, also for
                    older adults and family members who support them.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} lg={5}>
              <Card className="h-100 hover-card">
                <Card.Body>
                  <Card.Subtitle className="text-uppercase text-muted mb-2">
                    About the service
                  </Card.Subtitle>
                  <Card.Title>Support with everyday tasks</Card.Title>
                  <Card.Text>
                    HomeCare Booking is used by homecare services to plan visits
                    for tasks such as:
                  </Card.Text>
                  <ul className="mb-2">
                    <li>shopping and practical errands</li>
                    <li>light cleaning and household support</li>
                    <li>medication reminders and daily check-ins</li>
                  </ul>
                  <Card.Text className="text-muted mb-0">
                    All visits are booked in fixed time slots to make the day
                    predictable for both clients and staff.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </>
        )}

        {/* Client dashboard card */}
        {isClient && (
          <Col md={8} lg={7}>
            <Card className="h-100 hover-card">
              <Card.Body>
                <Card.Subtitle className="text-uppercase text-muted mb-2">
                  Client dashboard
                </Card.Subtitle>
                <Card.Title>Manage your homecare visits</Card.Title>
                <Card.Text>
                  From your appointments page you can see upcoming visits,
                  review details of each booking and request new help when you
                  need it.
                </Card.Text>
                <Card.Text className="text-muted">
                  You can cancel or change existing bookings within the rules
                  agreed with your local homecare service.
                </Card.Text>
                <Button
                  as={Link}
                  to="/appointments"
                  variant="primary"
                  className="mt-2"
                >
                  Go to appointments
                </Button>
              </Card.Body>
            </Card>
          </Col>
        )}

        {/* Staff / admin dashboard cards */}
        {isHPOrAdmin && (
          <>
            <Col md={6} lg={5}>
              <Card className="h-100 hover-card">
                <Card.Body>
                  <Card.Subtitle className="text-uppercase text-muted mb-2">
                    Healthcare personnel
                  </Card.Subtitle>
                  <Card.Title>Publish your availability</Card.Title>
                  <Card.Text>
                    Register the days and time intervals when you are available
                    for homecare visits. Clients can only book within these
                    published slots.
                  </Card.Text>
                  <Card.Text className="text-muted mb-0">
                    This keeps the booking process predictable and prevents
                    double-bookings for the same time period.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} lg={5}>
              <Card className="h-100 hover-card">
                <Card.Body>
                  <Card.Subtitle className="text-uppercase text-muted mb-2">
                    Appointments overview
                  </Card.Subtitle>
                  <Card.Title>Follow up bookings</Card.Title>
                  <Card.Text>
                    Use the appointments view to see who is visited when, and by
                    whom. This helps coordinate work in the homecare team.
                  </Card.Text>
                  <Card.Text className="text-muted mb-0">
                    Administrators can see the full overview, while individual
                    staff focus on the visits relevant to them.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </>
        )}
      </Row>

      {/* HOW TO USE SECTION */}
      <Row className="justify-content-center mt-5">
        <Col md={10} lg={8}>
          <h3 className="h5 mb-3">How to use HomeCare Booking</h3>
          <div className="home-howto-list">
            {!isAuthenticated && (
              <ol className="mb-0 text-muted">
                <li>Create a client account or log in.</li>
                <li>
                  Open <strong>Appointments</strong> from the top menu.
                </li>
                <li>
                  Choose a suitable time slot and describe what kind of help you
                  need.
                </li>
                <li>
                  Your bookings are always available under{" "}
                  <strong>Appointments</strong> so you can review or update them
                  later.
                </li>
              </ol>
            )}

            {isClient && (
              <ol className="mb-0 text-muted">
                <li>
                  Open <strong>Appointments</strong> from the top menu.
                </li>
                <li>
                  View available time slots published by your homecare staff.
                </li>
                <li>
                  Book a visit and describe the help you need (shopping,
                  cleaning, medication reminders, etc.).
                </li>
                <li>
                  See all upcoming or past visits in the{" "}
                  <strong>Appointments</strong> list.
                </li>
              </ol>
            )}

            {isHPOrAdmin && (
              <ol className="mb-0 text-muted">
                <li>
                  Open <strong>Available days</strong> to publish when you are
                  available for home visits.
                </li>
                <li>
                  Clients can only book from the time slots you provide.
                </li>
                <li>
                  Use <strong>Appointments</strong> to follow up bookings and
                  coordinate daily work.
                </li>
                <li>
                  Administrators can view and manage the entire booking system.
                </li>
              </ol>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
