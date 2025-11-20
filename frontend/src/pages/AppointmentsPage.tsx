import React, { useEffect, useMemo, useState } from "react";
import { Alert, Card, Col, Row, Spinner, Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import ApiService from "../services/ApiService";
import { useAuth } from "../context/AuthContext";
import type { AppointmentDto } from "../types/homecare";
import type { AvailableDaysGrouped } from "../types/homecare";

const hhmm = (s?: string | null) => (s ?? "").split(":").slice(0, 2).join(":");
const localDate = (d: any) =>
  new Date(d).toLocaleDateString("no-NO", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });

const AppointmentsPage: React.FC = () => {
  const { isAuthenticated, role, userId } = useAuth();

  const [appointments, setAppointments] = useState<AppointmentDto[] | null>(null);
  const [availableDays, setAvailableDays] = useState<AvailableDaysGrouped[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingAvailableDays, setLoadingAvailableDays] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const canDeleteAppointment = (appointment: AppointmentDto) => {
    if (!isAuthenticated) return false;
    if (role === "Admin" || role === "HealthcarePersonnel") return true;
    if (role === "Client") {
      return (
        appointment.clientEmail === userId ||
        appointment.clientId.toString() === userId
      );
    }
    return false;
  };

  const canEditAppointment = (appointment: AppointmentDto) => {
    if (!isAuthenticated) return false;
    if (role === "Admin" || role === "HealthcarePersonnel") return true;
    if (role === "Client") {
      return (
        appointment.clientEmail === userId ||
        appointment.clientId.toString() === userId
      );
    }
    return false;
  };

  // Get appointments
  useEffect(() => {
    let cancelled = false;
    async function loadAppointments() {
      setErr(null);
      setLoading(true);
      try {
        const data = await ApiService.get<AppointmentDto[]>(
          "/AppointmentAPI/appointmentlist"
        );
        if (!cancelled) setAppointments(data);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message ?? "Could not get appointments");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadAppointments();
    return () => {
      cancelled = true;
    };
  }, []);

  // Get available days for Client
  useEffect(() => {
    if (role !== "Client") return;

    let cancelled = false;
    async function loadAvailableDays() {
      setLoadingAvailableDays(true);
      try {
        const data = await ApiService.get<AvailableDaysGrouped[]>(
          "/AvailableDayAPI/availableDaysList"
        );
        if (!cancelled) setAvailableDays(data);
      } catch (e: any) {
        console.error("Could not get available days: ", e);
      } finally {
        if (!cancelled) setLoadingAvailableDays(false);
      }
    }
    loadAvailableDays();
    return () => {
      cancelled = true;
    };
  }, [role]);

  const appointmentsToShow = useMemo(() => {
    if (!appointments) return [];
    return appointments;
  }, [appointments]);

  const flatAvailableDays = useMemo(() => {
    if (!availableDays) return [];
    return availableDays.flatMap((g) =>
      g.availableDays.map((ad) => ({
        ...ad,
        personnelName: g.healthcarePersonnel.name,
      }))
    );
  }, [availableDays]);

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }
  if (err) {
    return (
      <Container className="mt-4" >
        <Alert variant="danger">Feil: {err}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-3">
        <div>
          <h2 className="mb-1">Appointments</h2>
        </div>
      </div>

     {/* AVAILABLE TIMES FOR CLIENT */}
{role === "Client" && (
  <div className="mb-5">
    <h3>Available times for booking</h3>
    {loadingAvailableDays ? (
      <div className="text-center mt-3">
        <Spinner size="sm" />
      </div>
    ) : !availableDays || availableDays.length === 0 ? (
      <Alert variant="info" className="mt-3">
        No available times found.
      </Alert>
    ) : (
      <Row className="g-3 mt-3">
        {availableDays.map((item) => (
          <Col key={item.healthcarePersonnel.userId} xs={12} md={6} lg={4}>
            <Card className="h-100 hover-card">
              <Card.Header className="bg-light">
                <h5 className="mb-1">{item.healthcarePersonnel.name}</h5>
                <small className="text-muted">{item.healthcarePersonnel.email}</small>
              </Card.Header>
              <Card.Body>
                {item.availableDays.length === 0 ? (
                  <p className="text-muted mb-0">No available time slots</p>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {item.availableDays.map((availableDay) => (
                      <div key={availableDay.availableDayId} className="p-2 border rounded bg-light">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="flex-grow-1">
                            <div className="fw-bold">{new Date(availableDay.date).toLocaleDateString("no-NO")}</div>
                            <div className="text-muted small">{hhmm(availableDay.startTime)} – {hhmm(availableDay.endTime)}</div>
                          </div>
                          <Link
                            className="btn btn-success btn-sm"
                            to={`/appointments/book/${availableDay.availableDayId}`}
                          >
                            Book
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    )}
  </div>
)}

      {/* Appointments */}
      {appointmentsToShow.length === 0 ? (
        <Alert variant="info">No appointments found</Alert>
      ) : (
        <Row xs={1} md={2} lg={3} xl={4} className="g-3 mb-5 pb-5">
          {appointmentsToShow.map((a) => (
            <Col key={a.appointmentId}>
              <Card className="h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <Card.Title className="mb-1">
                        {a.clientName ?? "Unknown Client"}
                      </Card.Title>
                      <Card.Subtitle className="text-muted small">
                        {a.clientEmail}
                      </Card.Subtitle>
                    </div>
                    <div className="text-end">
                      <div className="small text-muted">Personnel</div>
                    <span className="badge text-bg-light border">
                      {a.healthcarePersonnelName ?? "Unknown Personnel"}
                    </span>
                  </div>
                  </div>

                  <div className="mt-3">
                    <div className="small text-muted">Date</div>
                    <div>
                      {a.availableDayDate
                        ? localDate(a.availableDayDate)
                        : "—"}
                    </div>
                  </div>

                  <div className="mt-2">
                    <div className="small text-muted">Time</div>
                    <div>
                      {hhmm(a.startTime)}–{hhmm(a.endTime)}
                    </div>
                  </div>

                  <div className="mt-2">
                    <div className="small text-muted">Address</div>
                    <div>{a.address || "—"}</div>
                  </div>

                  <div className="mt-2">
                    <div className="small text-muted">Task</div>
                    <div>{a.taskDescription || "—"}</div>
                  </div>
                </Card.Body>

                {(canEditAppointment(a) || canDeleteAppointment(a)) && (
                  <Card.Footer className="bg-transparent">
                    <div className="d-flex gap-2">
                      {canEditAppointment(a) && (
                        <Link
                          className="btn btn-sm btn-outline-secondary"
                          to={`/appointments/edit/${a.appointmentId}`}
                        >
                          Edit
                        </Link>
                      )}
                      {canDeleteAppointment(a) && (
                        <Link
                          className="btn btn-sm btn-outline-danger"
                          to={`/appointments/delete/${a.appointmentId}`}
                        >
                          Delete
                        </Link>
                      )}
                    </div>
                  </Card.Footer>
                )}
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container >
  );
};

export default AppointmentsPage;
