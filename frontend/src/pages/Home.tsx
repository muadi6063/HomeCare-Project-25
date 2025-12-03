import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import heroImg from "../assets/home-hero.jpg";
import socialWorkerImg from "../assets/social-worker.jpg";

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
                <Link to="/register" className="btn btn-primary">
                  Create client account
                </Link>
                <Link to="/login" className="btn btn-outline-primary">
                  Log in
                </Link>
              </>
            )}

            {isClient && (
              <Link to="/appointments" className="btn btn-primary">
                Go to my appointments
              </Link>
            )}

            {isHPOrAdmin && (
              <>
                <Link to="/availabledays" className="btn btn-primary">
                  Manage available days
                </Link>
                <Link to="/appointments" className="btn btn-outline-primary">
                  View appointments
                </Link>
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
      <Row className="g-4">
        {/* Not signed in: focus on explanation + client entry */}
        {!isAuthenticated && (
          <>
            <Col md={6} lg={6}>
              <Card className="h-100">
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

            <Col md={6} lg={6}>
              <Card className="h-100">
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
          <Col xs={12}>
            <Card className="h-100">
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
              </Card.Body>
            </Card>
          </Col>
        )}

        {/* Staff / admin dashboard cards */}
        {isHPOrAdmin && (
          <>
            <Col md={6} lg={6}>
              <Card className="h-100">
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

            <Col md={6} lg={6}>
              <Card className="h-100">
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
      
      {/* EXTENDED INFORMATION SECTION */}
      <Row className="mt-5">
        <Col xs={12}>
          <h3 className="h4 fw-semibold mb-4">About HomeCare Services</h3>
          <p className="text-muted mb-4" style={{ maxWidth: "760px" }}>
            HomeCare Booking is built in collaboration with local health services to give 
            clients a simple, predictable and secure way to receive support at home. 
            Our healthcare personnel are trained professionals with backgrounds in 
            nursing, elderly care, rehabilitation and general medical support.
          </p>
        </Col>
      </Row>

      {/* THREE-COLUMN VALUE CARDS */}
      <Row className="g-4 mb-5">
        <Col md={4}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Body>
              <Card.Title className="mb-2">Skilled healthcare staff</Card.Title>
              <Card.Text className="text-muted">
                All our healthcare personnel are certified professionals, including 
                registered nurses, assistant nurses, care workers, and individuals 
                with additional training in elderly and home-based healthcare.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Body>
              <Card.Title className="mb-2">Safe and predictable</Card.Title>
              <Card.Text className="text-muted">
                Visits are booked in fixed time slots so both clients and family members 
                know exactly when help arrives. Our goal is to make everyday routines 
                stable, calm and respectful.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Body>
              <Card.Title className="mb-2">Built with dignity in mind</Card.Title>
              <Card.Text className="text-muted">
                We design our services from the perspective of older adults: large text, simple 
                navigation, gentle colours and predictable layouts to make the experience 
                comfortable and stress-free.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* IMAGE + TEXT SECTION */}
      <Row className="align-items-center my-5 gx-lg-5">
        <Col lg={6} className="mb-4 mb-lg-0">
          <img
            src={socialWorkerImg}
            alt="Homecare nurse assisting client"
            className="img-fluid rounded shadow"
          />
        </Col>

        <Col lg={6}>
          <h3 className="fw-semibold mb-3">Who we are</h3>
          <p className="text-muted mb-3">
            HomeCare Booking is created as a modern coordination tool for home-based 
            healthcare teams. Our mission is to improve how visits are planned, booked, 
            communicated and followed up, for the benefit of both clients and staff.
          </p>
          <p className="text-muted mb-3">
            The service is used daily by homecare departments across municipalities. 
            Staff members log in to publish availability, follow up bookings and assist clients 
            in receiving the help they need in a structured and caring way.
          </p>
          <p className="text-muted mb-0">
            Clients and relatives use the portal to request support, keep track of visits and 
            stay connected with their local care team.
          </p>
        </Col>
      </Row>

      {/* TWO-COLUMN SERVICE FEATURES */}
      <Row className="g-4 mt-5 mb-5">
        <Col md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <Card.Subtitle className="text-uppercase text-muted mb-2">
                Our commitment
              </Card.Subtitle>
              <Card.Title className="mb-2">Quality care at home</Card.Title>
              <Card.Text className="text-muted">
                We believe that everyone deserves high-quality support in their own home. 
                That's why our staff follow professional guidelines for safe, respectful and 
                personalised homecare.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <Card.Subtitle className="text-uppercase text-muted mb-2">
                Community
              </Card.Subtitle>
              <Card.Title className="mb-2">Supporting families</Card.Title>
              <Card.Text className="text-muted">
                Our system makes it easier for relatives to stay updated and feel secure, 
                knowing that their loved ones receive the care they need, when they need it.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

            {/* HOW TO USE SECTION */}
      <Row className="mt-5">
        <Col xs={12}>
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