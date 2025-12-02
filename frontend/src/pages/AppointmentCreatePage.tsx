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
  const [address, setAddress] = useState<string>("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadAvailableDay() {
      try {
        setError("");
        const data = await ApiService.get<AvailableDayDto>(`/AvailableDayAPI/${availableDayId}`);
        if (!cancelled) setAvailableDay(data);
      } catch {
        if (!cancelled) setError("Could not load available day.");
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

    if (!availableDayId || !email || !userId) {
    setError("Missing required information for booking");
    return;
    } 

    try {
      setBusy(true);
      const dto = {
        ClientId: userId,
        AvailableDayId: Number(availableDayId),
        TaskDescription: taskDescription.trim(),
        Address: address.trim(),
      };
      await ApiService.post("/AppointmentAPI/create", dto);
      navigate("/appointments");
    } catch (e: any) {
      setError(e?.message ?? "Booking failed");
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
        <Alert variant="danger">Cannot find any available days.</Alert>
      </Container>
    );
  }

  const hhmm = (s: string) => (s ?? "").split(":").slice(0, 2).join(":");

  const personnelLabel =
    availableDay.healthcarePersonnelName ??
    availableDay.healthcarePersonnelEmail ??
    "Ukjent personell";

  return (
    <Container className="mt-4">
      <h2>Book Time</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card>
        <Card.Body>
          <div className="mb-4 p-3 bg-light rounded">
            <h5>Appointment details</h5>
            <p><strong>Date:</strong> {new Date(availableDay.date).toLocaleDateString("no-NO")}</p>
            <p><strong>Time:</strong> {hhmm(availableDay.startTime)} – {hhmm(availableDay.endTime)}</p>
            <p><strong>Healthcare personell:</strong> {personnelLabel}</p>
            <p><strong>Available Day ID:</strong> {availableDay.availableDayId}</p>
            <p><strong>Booked by:</strong> {email}</p>
          </div>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Task description *</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Describe what you need help with (minimum 5 characters, max 500 characters)..."
                required
                disabled={busy}
                minLength={5}
                maxLength={500}
                title="Task description must be between 5 and 500 characters."
              />
              <Form.Text className="text-muted">
                {taskDescription.length}/500 characters (minimum 5 characters)
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
            <Form.Label>Address *</Form.Label>
            <Form.Control
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Where should the visit take place? (e.g., Pilestredet 35, Oslo)"
              required
              disabled={busy}
              minLength={5}
              maxLength={200}
              title="Address must be between 5 and 200 characters."
            />
            <Form.Text className="text-muted">
              Enter the address where you need the service
            </Form.Text>
          </Form.Group>


            <Button type="submit" disabled={busy} variant="success">
              {busy ? "Booking..." : "Book appointment"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate("/appointments")}
              className="ms-2"
              disabled={busy}
            >
              Cancel
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AppointmentCreatePage;