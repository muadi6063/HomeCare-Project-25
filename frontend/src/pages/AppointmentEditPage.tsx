import React, { useEffect, useState } from "react";
import { Form, Button, Alert, Container, Card } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import ApiService from "../services/ApiService";
import { useAuth } from "../context/AuthContext";
import type { AppointmentDto } from "../types/homecare";

const hhmm = (s: string) => (s ?? "").split(":").slice(0, 2).join(":");
const hhmmss = (s: string) => (s.includes(":") ? `${s}:00` : s);

const AppointmentEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role, userId } = useAuth() as { role?: string; userId?: string | null };

  const [model, setModel] = useState<AppointmentDto | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Admin kan edit alle, Client kan kun edit sine egne
  const canEdit = role === "Admin" || 
    (role === "Client" && model && (model.clientEmail === userId || model.clientId.toString() === userId));

  useEffect(() => {
    async function load() {
      try {
        setError("");
        const data = await ApiService.get<AppointmentDto>(`/AppointmentAPI/${id}`);
        setModel({
          ...data,
          // Formater tid for input felter
          startTime: hhmm(data.startTime),
          endTime: hhmm(data.endTime),
        });
      } catch {
        setError("Kunne ikke laste avtalen.");
      }
    }

    load();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!model) return;

    if (!model.startTime || !model.endTime) {
      setError("Alle påkrevde felter må fylles ut.");
      return;
    }
    if (hhmmss(model.endTime) <= hhmmss(model.startTime)) {
      setError("Sluttid må være etter starttid.");
      return;
    }

    try {
      setBusy(true);
      await ApiService.put(`/AppointmentAPI/update/${id}`, {
        clientId: model.clientId,
        availableDayId: model.availableDayId,
        startTime: hhmmss(model.startTime),
        endTime: hhmmss(model.endTime),
        taskDescription: model.taskDescription,
      });
      navigate("/appointments");
    } catch {
      setError("Oppdatering feilet.");
    } finally {
      setBusy(false);
    }
  };

  if (!canEdit) return (
    <Container className="mt-4">
      <Alert variant="warning">Du har ikke tilgang til å redigere denne avtalen.</Alert>
    </Container>
  );
  if (!model) return <Container className="mt-4">Laster…</Container>;

  return (
    <Container className="mt-4">
      <h2>Rediger avtale</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Klient ID</Form.Label>
              <Form.Control 
                value={model.clientId} 
                disabled 
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Klient navn</Form.Label>
              <Form.Control 
                value={model.clientName || "Ukjent"} 
                disabled 
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Available Day ID</Form.Label>
              <Form.Control 
                value={model.availableDayId} 
                disabled 
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Starttid</Form.Label>
              <Form.Control
                type="time"
                value={model.startTime}
                onChange={(e) => setModel({ ...model, startTime: e.target.value })}
                required
                disabled={busy}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Sluttid</Form.Label>
              <Form.Control
                type="time"
                value={model.endTime}
                onChange={(e) => setModel({ ...model, endTime: e.target.value })}
                required
                disabled={busy}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Oppgavebeskrivelse</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={model.taskDescription || ""}
                onChange={(e) => setModel({ ...model, taskDescription: e.target.value })}
                placeholder="F.eks. medication reminder, assistance with shopping..."
                disabled={busy}
              />
            </Form.Group>

            <Button type="submit" disabled={busy}>
              {busy ? "Lagrer..." : "Lagre endringer"}
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => navigate("/appointments")} 
              disabled={busy}
              className="ms-2"
            >
              Avbryt
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AppointmentEditPage;