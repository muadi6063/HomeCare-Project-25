import React, { useEffect, useState } from "react";
import { Alert, Button, Container, Card } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import ApiService from "../services/ApiService";
import { useAuth } from "../context/AuthContext";
import type { AppointmentDto } from "../types/homecare";

const hhmm = (s?: string | null) => (s ?? "").split(":").slice(0, 2).join(":");

const AppointmentDeletePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role, userId } = useAuth() as { role?: string; userId?: string | null };

  const [item, setItem] = useState<AppointmentDto | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Admin kan slette alle, Client kan kun slette sine egne
  const canDelete = role === "Admin" || 
    (role === "Client" && item && (item.clientEmail === userId || item.clientId.toString() === userId));

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setError("");
        const data = await ApiService.get<AppointmentDto>(`/AppointmentAPI/${id}`);
        if (!cancelled) setItem(data);
      } catch {
        if (!cancelled) setError("Kunne ikke laste avtalen.");
      }
    }

    if (id) load();
    return () => { cancelled = true; };
  }, [id]);

  const handleDelete = async () => {
    setError("");
    try {
      setBusy(true);
      await ApiService.delete(`/AppointmentAPI/delete/${id}`);
      navigate("/appointments");
    } catch {
      setError("Sletting feilet.");
    } finally {
      setBusy(false);
    }
  };

  if (!item) return <Container className="mt-4">Laster…</Container>;

  return (
    <Container className="mt-4">
      <h2>Slett avtale</h2>

      {!canDelete && (
        <Alert variant="warning" className="mt-3">
          Du har ikke tilgang til å slette denne avtalen.
        </Alert>
      )}

      {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

      <Card>
        <Card.Body>
          <p className="mb-3">
            Er du sikker på at du vil slette avtale <strong>#{item.appointmentId}</strong>?
          </p>

          <div className="mb-3">
            <strong>Klient:</strong> {item.clientName ?? "Ukjent"} ({item.clientEmail ?? "—"})
          </div>
          <div className="mb-3">
            <strong>Tid:</strong> {item.availableDayDate ? new Date(item.availableDayDate).toLocaleDateString("no-NO") : "—"} {hhmm(item.startTime)}–{hhmm(item.endTime)}
          </div>
          <div className="mb-3">
            <strong>Oppgave:</strong> {item.taskDescription || "—"}
          </div>
          <div className="mb-3">
            <strong>Personell:</strong> {item.healthcarePersonnelName ?? "—"}
          </div>

          <Button
            variant="danger"
            className="me-2"
            onClick={handleDelete}
            disabled={!canDelete || busy}
          >
            {busy ? "Sletter..." : "Slett"}
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate("/appointments")}
            disabled={busy}
          >
            Avbryt
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AppointmentDeletePage;