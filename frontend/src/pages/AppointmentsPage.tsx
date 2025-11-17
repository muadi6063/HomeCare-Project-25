import React, { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, Col, Form, InputGroup, Row, Spinner, Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import ApiService from "../services/ApiService";
import { useAuth } from "../context/AuthContext";
import type { AppointmentDto } from "../types/homecare";
import type { AvailableDaysGrouped } from "../types/homecare";

const hhmm = (s?: string | null) => (s ?? "").split(":").slice(0, 2).join(":");
const localDate = (d: any) =>
  new Date(d).toLocaleDateString("no-NO", { year: "numeric", month: "short", day: "2-digit" });

const AppointmentsPage: React.FC = () => {
  const { isAuthenticated, role, userId } = useAuth();

  const [appointments, setAppointments] = useState<AppointmentDto[] | null>(null);
  const [availableDays, setAvailableDays] = useState<AvailableDaysGrouped[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingAvailableDays, setLoadingAvailableDays] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");

  // Client kan lage appointments (booking)
  const canCreate = isAuthenticated;
  // Admin kan slette alle, Client kan kun slette sine egne
  const canDeleteAppointment = (appointment: AppointmentDto) => {
    if (!isAuthenticated) return false;
    if (role === "Admin") return true;
    if (role === "Client") {
      return appointment.clientEmail === userId || appointment.clientId.toString() === userId;
    }
    return false;
  };
  // Admin kan edit alle, Client kan kun edit sine egne
  const canEditAppointment = (appointment: AppointmentDto) => {
    if (!isAuthenticated) return false;
    if (role === "Admin") return true;
    if (role === "Client") {
      return appointment.clientEmail === userId || appointment.clientId.toString() === userId;
    }
    return false;
  };

  // Hent appointments
  useEffect(() => {
    let cancelled = false;
    async function loadAppointments() {
      setErr(null);
      setLoading(true);
      try {
        const data = await ApiService.get<AppointmentDto[]>("/AppointmentAPI/appointmentlist");
        if (!cancelled) setAppointments(data);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message ?? "Klarte ikke å laste avtaler.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadAppointments();
    return () => {
      cancelled = true;
    };
  }, []);

  // Hent available days for Client
  useEffect(() => {
    if (role !== "Client") return;

    let cancelled = false;
    async function loadAvailableDays() {
      setLoadingAvailableDays(true);
      try {
        const data = await ApiService.get<AvailableDaysGrouped[]>("/AvailableDayAPI/availableDaysList");
        if (!cancelled) setAvailableDays(data);
      } catch (e: any) {
        console.error("Kunne ikke hente ledige dager:", e);
      } finally {
        if (!cancelled) setLoadingAvailableDays(false);
      }
    }
    loadAvailableDays();
    return () => {
      cancelled = true;
    };
  }, [role]);

  const filteredAppointments = useMemo(() => {
    if (!appointments) return [];
    const s = q.trim().toLowerCase();
    if (!s) return appointments;
    return appointments.filter((a) => {
      const hay = [
        a.clientName,
        a.clientEmail,
        a.taskDescription,
        a.healthcarePersonnelName,
        a.availableDayDate,
        a.startTime,
        a.endTime,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(s);
    });
  }, [appointments, q]);

  // Flat available days for enkel visning
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
      <Container className="mt-4">
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

        <div className="d-flex gap-2">
          <InputGroup>
            <Form.Control
              placeholder="Søk (navn, e-post, oppgave...)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            {q && (
              <Button variant="outline-secondary" onClick={() => setQ("")}>
                Tøm
              </Button>
            )}
          </InputGroup>

          {/* Kun Admin/HP ser "Ny appointment" - Client booker via AvailableDays */}
          {canCreate && role !== "Client" && (
            <Link className="btn btn-primary" to="/appointments/create">
              + Ny appointment
            </Link>
          )}
        </div>
      </div>

      {/* LEDIGE TIDER FOR CLIENT - som AvailableDaysPage */}
      {role === "Client" && (
        <div className="mb-5">
          <h3>Ledige tider for booking</h3>
          {loadingAvailableDays ? (
            <div className="text-center mt-3"><Spinner size="sm" /></div>
          ) : flatAvailableDays.length === 0 ? (
            <Alert variant="info" className="mt-3">Ingen ledige tider funnet.</Alert>
          ) : (
            <Row className="g-3 mt-3">
              {flatAvailableDays.map((ad) => (
                <Col key={ad.availableDayId} xs={12} md={6} lg={4}>
                  <Card className="h-100">
                    <Card.Body className="d-flex flex-column">
                      <Card.Title>{new Date(ad.date).toLocaleDateString("no-NO")}</Card.Title>
                      <Card.Text>
                        {hhmm(ad.startTime)} – {hhmm(ad.endTime)}
                      </Card.Text>
                      <Card.Text className="text-muted small mb-1">
                        {ad.personnelName ?? "Ukjent personell"}
                      </Card.Text>
                      <div className="mt-auto">
                        <Link 
                          className="btn btn-success btn-sm" 
                          to={`/appointments/book/${ad.availableDayId}`}
                        >
                          Book Time
                        </Link>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>
      )}

      {/* MINE/ALLE AVTALER */}
      {filteredAppointments.length === 0 ? (
        <Alert variant="info">Ingen avtaler funnet.</Alert>
      ) : (
        <Row xs={1} md={2} lg={3} xl={4} className="g-3">
          {filteredAppointments.map((a) => (
            <Col key={a.appointmentId}>
              <Card className="h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <Card.Title className="mb-1">{a.clientName ?? "Ukjent klient"}</Card.Title>
                      <Card.Subtitle className="text-muted small">{a.clientEmail}</Card.Subtitle>
                    </div>
                    <span className="badge text-bg-light border">
                      {a.healthcarePersonnelName ?? "Personell"}
                    </span>
                  </div>

                  <div className="mt-3">
                    <div className="small text-muted">Dato</div>
                    <div>{a.availableDayDate ? localDate(a.availableDayDate) : "—"}</div>
                  </div>

                  <div className="mt-2">
                    <div className="small text-muted">Tid</div>
                    <div>
                      {hhmm(a.startTime)}–{hhmm(a.endTime)}
                    </div>
                  </div>

                  <div className="mt-2">
                    <div className="small text-muted">Oppgave</div>
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
    </Container>
  );
};

export default AppointmentsPage;