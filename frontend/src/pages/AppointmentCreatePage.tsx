import React, { useEffect, useState } from "react";
import { Form, Button, Alert, Container, Card, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import ApiService from "../services/ApiService";
import { useAuth } from "../context/AuthContext";
import type { AvailableDayDto } from "../types/homecare";

const AppointmentCreatePage: React.FC = () => {
  const { availableDayId } = useParams<{ availableDayId: string }>();
  const navigate = useNavigate();
  const { email, userId } = useAuth() as { 
  email?: string | null; 
  userId?: string | null; 
};
  const [availableDay, setAvailableDay] = useState<AvailableDayDto | null>(null);
  const [taskDescription, setTaskDescription] = useState<string>("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  // Hent AvailableDay detaljer
  useEffect(() => {
    let cancelled = false;

    async function loadAvailableDay() {
      try {
        setError("");
        const data = await ApiService.get<AvailableDayDto>(`/AvailableDayAPI/${availableDayId}`);
        if (!cancelled) setAvailableDay(data);
      } catch {
        if (!cancelled) setError("Kunne ikke laste tilgjengelig dag.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (availableDayId) {
      loadAvailableDay();
    }
    return () => {
      cancelled = true;
    };
  }, [availableDayId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validering - som backend forventer
    if (!taskDescription.trim() || taskDescription.trim().length < 5) {
      setError("Oppgavebeskrivelse må være minst 5 tegn.");
      return;
    }
    if (taskDescription.trim().length > 500) {
      setError("Oppgavebeskrivelse kan være maks 500 tegn.");
      return;
    }

    if (!availableDayId || !email) {
      setError("Mangler nødvendig informasjon for booking.");
      return;
    }

    try {
      setBusy(true);
      // Fiks payload - bruk email som ClientId
      const dto = {
        ClientId: userId, // Bruk email fra innlogget bruker
        AvailableDayId: Number(availableDayId),
        TaskDescription: taskDescription.trim()
      };
      await ApiService.post("/AppointmentAPI/create", dto);
      navigate("/appointments");
    } catch (e: any) {
      setError(e?.message ?? "Klarte ikke å booke time.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (!availableDay) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">Kunne ikke finne tilgjengelig dag.</Alert>
      </Container>
    );
  }

  const hhmm = (s: string) => (s ?? "").split(":").slice(0, 2).join(":");

  return (
    <Container className="mt-4">
      <h2>Book Time</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card>
        <Card.Body>
          {/* AvailableDay informasjon - readonly */}
          <div className="mb-4 p-3 bg-light rounded">
            <h5>Timeinformasjon</h5>
            <p><strong>Dato:</strong> {new Date(availableDay.date).toLocaleDateString("no-NO")}</p>
            <p><strong>Tid:</strong> {hhmm(availableDay.startTime)} – {hhmm(availableDay.endTime)}</p>
            <p><strong>Available Day ID:</strong> {availableDay.availableDayId}</p>
            <p><strong>Booket av:</strong> {email}</p>
          </div>

          <Form onSubmit={handleSubmit}>
            {/* Kun TaskDescription felt - som backend forventer */}
            <Form.Group className="mb-3">
              <Form.Label>Oppgavebeskrivelse *</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Beskriv hva du trenger hjelp med (minst 5 tegn, maks 500 tegn)..."
                required
                disabled={busy}
                minLength={5}
                maxLength={500}
              />
              <Form.Text className="text-muted">
                {taskDescription.length}/500 tegn (minimum 5 tegn)
              </Form.Text>
            </Form.Group>

            <Button type="submit" disabled={busy} variant="success">
              {busy ? "Booker..." : "Book Time"}
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => navigate("/appointments")}
              className="ms-2"
              disabled={busy}
            >
              Avbryt
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AppointmentCreatePage;