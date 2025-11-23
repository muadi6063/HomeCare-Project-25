// src/pages/Home.tsx
import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
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
    <Container className="py-5">
      {/* HERO-SECTION */}
      <Row className="align-items-center hero-section mb-5 gx-lg-5">
        {/* Tekst */}
        <Col md={6} className="mb-4 mb-md-0">
          <p className="text-primary text-uppercase fw-semibold small mb-2">
            Safe help from home
          </p>
          <h1 className="fw-semibold mb-3 hero-title">
            HomeCare Booking
          </h1>
          <p className="lead mb-3 text-muted">
            A web-based booking tool for organising homecare visits, so older
            adults can receive safe and practical support at home.
          </p>

          {!isAuthenticated && (
            <p className="text-muted mb-4">
              Clients and relatives use this portal to request help with everyday
              tasks. Healthcare staff use it to publish available time slots and
              follow up appointments.
            </p>
          )}
          {isClient && (
            <p className="text-muted mb-4">
              You are signed in as a client. Use the options below to manage your
              homecare appointments.
            </p>
          )}
          {isHPOrAdmin && (
            <p className="text-muted mb-4">
              You are signed in as{" "}
              {isAdmin ? "an administrator" : "healthcare personnel"}. Use this
              page as an entry point to availability and appointment management.
            </p>
          )}

          {/* Call-to-action knapper når man ikke er logget inn */}
          {!isAuthenticated && (
            <div className="d-flex flex-wrap gap-2">
              <Link to="/register" className="btn btn-primary">
                Create account
              </Link>
              <Link to="/login" className="btn btn-outline-primary">
                Log in
              </Link>
            </div>
          )}

          {/* Klient snarvei */}
          {isClient && (
            <Link to="/appointments" className="btn btn-primary mt-2">
              Go to my appointments
            </Link>
          )}

          {/* Ansatt/Admin snarvei */}
          {isHPOrAdmin && (
            <div className="d-flex flex-wrap gap-2 mt-2">
              <Link to="/availabledays" className="btn btn-primary">
                Manage available days
              </Link>
              <Link to="/appointments" className="btn btn-outline-primary">
                View appointments
              </Link>
            </div>
          )}
        </Col>

        {/* Bilde */}
        <Col md={6}>
          <div className="hero-image-wrapper shadow-sm">
            <img
              src={heroImg}
              alt="Homecare nurse talking with an older adult"
              className="img-fluid rounded-4 hero-image"
            />
          </div>
        </Col>
      </Row>

      {/* INFORMASJONSKORT */}
      <Row className="g-4 justify-content-center">
        {!isAuthenticated && (
          <>
            <Col md={6} lg={5}>
              <Card className="h-100 shadow-sm border-0 rounded-4">
                <Card.Body>
                  <Card.Subtitle className="text-uppercase text-muted mb-2">
                    For clients
                  </Card.Subtitle>
                  <Card.Title>Access your homecare services</Card.Title>
                  <Card.Text>
                    Create a client account or log in to request homecare visits,
                    view upcoming bookings and keep a simple overview of the help
                    you receive at home.
                  </Card.Text>
                  <Card.Text className="text-muted">
                    The portal is designed to be calm and easy to use, also for
                    older adults and relatives who help them.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} lg={5}>
              <Card className="h-100 shadow-sm border-0 rounded-4">
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
                    All visits are booked in fixed time slots to keep days
                    predictable for both clients and staff.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </>
        )}

        {/* Klient-kort */}
        {isClient && (
          <Col md={8} lg={7}>
            <Card className="h-100 shadow-sm border-0 rounded-4">
              <Card.Body>
                <Card.Subtitle className="text-uppercase text-muted mb-2">
                  Client dashboard
                </Card.Subtitle>
                <Card.Title>Manage your homecare visits</Card.Title>
                <Card.Text>
                  From your appointments page you can see upcoming visits, review
                  details of each booking and request new help when you need it.
                </Card.Text>
                <Card.Text className="text-muted mb-0">
                  You can also cancel or change existing bookings within the
                  rules agreed with your local homecare service.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        )}

        {/* Ansatt/Admin kort */}
        {isHPOrAdmin && (
          <>
            <Col md={6} lg={5}>
              <Card className="h-100 shadow-sm border-0 rounded-4">
                <Card.Body>
                  <Card.Subtitle className="text-uppercase text-muted mb-2">
                    Healthcare personnel
                  </Card.Subtitle>
                  <Card.Title>Publish your availability</Card.Title>
                  <Card.Text>
                    Register the days and time intervals when you are available
                    for homecare visits. Clients will only be able to book within
                    these available slots.
                  </Card.Text>
                  <Card.Text className="text-muted mb-0">
                    This keeps the booking process predictable and prevents
                    double-bookings for the same time period.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} lg={5}>
              <Card className="h-100 shadow-sm border-0 rounded-4">
                <Card.Body>
                  <Card.Subtitle className="text-uppercase text-muted mb-2">
                    Appointments
                  </Card.Subtitle>
                  <Card.Title>Follow up bookings</Card.Title>
                  <Card.Text>
                    Get an overview of who is visited when, and by whom. Use the
                    appointments view to coordinate work in the homecare team.
                  </Card.Text>
                  <Card.Text className="text-muted mb-0">
                    Administrators see the full overview, while individual staff
                    can focus on the visits relevant to them.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </>
        )}
      </Row>

      {/* HOW TO USE */}
      <Row className="justify-content-center mt-5">
        <Col md={10} lg={8}>
          <h3 className="h5 mb-3">How to use HomeCare Booking</h3>

          {!isAuthenticated && (
            <ol className="mb-0 text-muted">
              <li>Create a client account or log in with your existing details.</li>
              <li>
                Go to <strong>Appointments</strong> in the top menu.
              </li>
              <li>
                Select a suitable time slot and describe what kind of help you
                need.
              </li>
              <li>
                Your bookings will always be available under{" "}
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
                View available time slots published by your healthcare personnel.
              </li>
              <li>
                Book a visit and describe the help you need (shopping, cleaning,
                medication reminders, etc.).
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
              <li>Clients will only be able to book from the slots you provide.</li>
              <li>
                Use <strong>Appointments</strong> to follow up bookings and
                coordinate daily work.
              </li>
              <li>Administrators can view and manage the entire booking system.</li>
            </ol>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
