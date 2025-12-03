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

   // Authorization check: admin/personnel can delete all, client only their own
  const canDelete =
  role === "Admin" ||
  role === "HealthcarePersonnel" ||
  (role === "Client" && item && userId === item.clientId);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setError("");
        const data = await ApiService.get<AppointmentDto>(`/AppointmentAPI/${id}`);
        if (!cancelled) setItem(data);
      } catch {
        if (!cancelled) setError("Could not load the element.");
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
    } catch(e) {
      console.error("Delete failed: ", e)
      setError("Delete failed.");
    } finally {
      setBusy(false);
    }
  };

  if (!item) {
    return (
      <Container className="mt-4">
        {error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        "Loading…"
      )}
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h2>Delete appointment</h2>

      {!canDelete && (
        <Alert variant="warning" className="mt-3">
          You do not have permission to delete this appointment.
        </Alert>
      )}

      {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

      <Card>
        <Card.Body>
          <p className="mb-3">
            Sure you want to delete this appointment? <strong>#{item.appointmentId}</strong>?
          </p>

          <div className="mb-3">
            <strong>Client:</strong> {item.clientName ?? "Unknown"} ({item.clientEmail ?? "—"})
          </div>
          <div className="mb-3">
            <strong>Address:</strong> {item.address ?? "—"}
          </div>
          <div className="mb-3">
            <strong>Time:</strong> {item.availableDayDate ? new Date(item.availableDayDate).toLocaleDateString("no-NO") : "—"} {hhmm(item.startTime)}–{hhmm(item.endTime)}
          </div>
          <div className="mb-3">
            <strong>Assignment:</strong> {item.taskDescription || "—"}
          </div>
          <div className="mb-3">
            <strong>Personnel:</strong> {item.healthcarePersonnelName ?? "—"}
          </div>

          <Button
            variant="danger"
            className="me-2"
            onClick={handleDelete}
            disabled={!canDelete || busy}
          >
            {busy ? "Deleting..." : "Delete"}
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate("/appointments")}
            disabled={busy}
          >
            Cancel
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AppointmentDeletePage;