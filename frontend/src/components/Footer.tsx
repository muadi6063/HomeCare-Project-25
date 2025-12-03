import { Container, Row, Col } from "react-bootstrap";

// Footer component for the application
const Footer: React.FC = () => {
  return (
    <footer className="bg-dark text-light mt-auto py-4 border-top" aria-label="Site Footer">
      <Container>
        <Row className="gy-3">

          {/* OSLOMET PROJECT INFO */}
          <Col md={6}>
            <h5 className="mb-2">HomeCare Booking</h5>
            <p className="small mb-1">
              Developed as part of the Web Applications course (ITPE3200) at OsloMet.
            </p>
            <p className="small mb-0">
              Demonstrating secure development with .NET 8, React, JWT and Service Layer patterns.
            </p>
          </Col>

          {/* CONTACT */}
          <Col md={3}>
            <h6 className="mb-2">Project</h6>
            <ul className="list-unstyled small">
              <li>OsloMet — 2025</li>
              <li>Group Exam Project</li>
              <li>Homecare Appointment Tool</li>
            </ul>
          </Col>
          
          {/* CONTACT US — replaces the Information section */}
          <Col md={3}>
            <h6 className="mb-2">Contact us</h6>
            <ul className="list-unstyled small">
              <li>
                <a
                  href="mailto:support@homecare.no"
                  className="text-light text-decoration-none"
                >
                  support@homecare.no
                </a>
              </li>
              <li>
                <a
                  href="tel:+4700000000"
                  className="text-light text-decoration-none"
                >
                  +47 00 00 00 00
                </a>
              </li>
            </ul>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;