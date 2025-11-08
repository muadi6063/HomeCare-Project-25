import React, { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, Col, Form, InputGroup, Row, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import ApiService from "../services/ApiService";
import { useAuth } from "../context/AuthContext";
import type { AppointmentDto } from "../types/homecare";

const hhmm = (s?: string | null) => (s ?? "").split(":").slice(0, 2).join(":");
const localDate = (d: any) =>
  new Date(d).toLocaleDateString("no-NO", { year: "numeric", month: "short", day: "2-digit" });

const AppointmentsPage: React.FC = () => {
  const { isAuthenticated, role } = useAuth();

  const [items, setItems] = useState<AppointmentDto[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const canCreate = isAuthenticated && (role === "Admin" || role === "HealthcarePersonnel");
  const canDelete = isAuthenticated && role === "Admin";

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setErr(null);
      setLoading(true);
      try {
        const data = await ApiService.get<AppointmentDto[]>("/AppointmentAPI/appointmentlist");
        if (!cancelled) setItems(data);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message ?? "Klarte ikke å laste avtaler.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!items) return [];
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((a) => {
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
  }, [items, q]);

  if (loading) {
    return (
      <div className="container-lg mt-5 text-center">
        <Spinner animation="border" />
      </div>
    );
  }
  if (err) {
    return (
      <div className="container-lg mt-4">
        <Alert variant="danger">Feil: {err}</Alert>
      </div>
    );
  }

  return (
    <div className="container-lg mt-4">
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-3">
        <div>
          <h2 className="mb-1">Appointments</h2>
          <small className="text-muted">
            {role === "Admin" ? "Alle avtaler" : role === "HealthcarePersonnel" ? "Dine avtaler" : "Mine avtaler"}
          </small>
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

          {canCreate && (
            <Link className="btn btn-primary" to="/appointments/create">
              + Ny appointment
            </Link>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Alert variant="info">Ingen avtaler funnet.</Alert>
      ) : (
        <Row xs={1} md={2} lg={3} xl={4} className="g-3">
          {filtered.map((a) => (
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

                {(canCreate || canDelete) && (
                  <Card.Footer className="bg-transparent">
                    <div className="d-flex gap-2">
                      {canDelete && (
                        <Link className="btn btn-sm btn-outline-danger" to={`/appointments/delete/${a.appointmentId}`}>
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
    </div>
  );
};

export default AppointmentsPage;