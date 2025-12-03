import React, { useEffect, useState } from "react";
import { Form, Button, Alert, Container, Card } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import ApiService from "../services/ApiService";
import { useAuth } from "../context/AuthContext";
import type { AppointmentDto } from "../types/homecare";

// Helper to convert "HH:MM:SS" or "HH:MM:SS.sss" to "HH:MM"
const hhmm = (s: string) => (s ?? "").split(":").slice(0, 2).join(":");
const hhmmss = (s: string) => (s.includes(":") ? `${s}:00` : s);

const AppointmentEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role, userId } = useAuth() as { role?: string; userId?: string | null };

  const [model, setModel] = useState<AppointmentDto | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setError("");
        const data = await ApiService.get<AppointmentDto>(`/AppointmentAPI/${id}`);
        setModel({
          ...data,
          startTime: hhmm(data.startTime),
          endTime: hhmm(data.endTime),
        });
      } catch {
        setError("Could not load appointment");
      }
    }

    load();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!model) return;

    try {
      setBusy(true);
      await ApiService.put(`/AppointmentAPI/update/${id}`, {
      ClientId: model.clientId,
      AvailableDayId: model.availableDayId,
      StartTime: hhmmss(model.startTime),
      EndTime: hhmmss(model.endTime),
      TaskDescription: model.taskDescription,
      Address: model.address,
    });
    
      navigate("/appointments");
    } catch(e) {
      console.error("Update failed: ", e)
      setError("Update failed");
    } finally {
      setBusy(false);
    }
  };

  // First: if we don't have model yet, show loading/error
  if (!model) {
  return (
    <Container className="mt-4">
      {error ? <Alert variant="danger">{error}</Alert> : "Loading..."}
    </Container>
  );
}

  // We have the model: check authorization
  const canEdit =
    role === "Admin" ||
    role === "HealthcarePersonnel" ||
    (role === "Client" && userId === model.clientId);

  if (!canEdit) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">
          You do not have access to edit this appointment.
        </Alert>
      </Container>
    );
  }


  return (
    <Container className="mt-4">
      <h2>Edit appointment</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            
            <Form.Group className="mb-3">
              <Form.Label>Edit task description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={model.taskDescription || ""}
                onChange={(e) => setModel({ ...model, taskDescription: e.target.value })}
                placeholder="Tell us about your needs, your address and other relevant information"
                disabled={busy}
                required
                minLength={5}
                maxLength={500}
                title="Task description must be between 5 and 500 characters."
              />
            </Form.Group>
        
            <Form.Text className="text-muted">
              {(model.taskDescription || "").length}/500 characters
            </Form.Text>
            <Form.Group className="mb-3">

              <Form.Label>Address *</Form.Label>
              <Form.Control
                type="text"
                value={model.address || ""}
                onChange={(e) => setModel({ ...model, address: e.target.value })}
                placeholder="Service location address"
                required
                disabled={busy}
                minLength={5}
                maxLength={200}
                title="Address must be between 5 and 200 characters."
              />
            </Form.Group>

            <Button type="submit" disabled={busy}>
              {busy ? "Saving..." : "Save changes"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate("/appointments")}
              disabled={busy}
              className="ms-2"
            >
              Cancel
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AppointmentEditPage;