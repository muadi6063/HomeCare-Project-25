import React, { useEffect, useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import ApiService from "../services/ApiService";
import { useAuth } from "../context/AuthContext";

type AvailableDayDto = {
  availableDayId: number;
  healthcarePersonnelId: string;
  date: string;
  startTime: string;
  endTime: string;
  healthcarePersonnelName?: string;
  healthcarePersonnelEmail?: string;
};

// Helper to convert "HH:MM:SS" or "HH:MM:SS.sss" to "HH:MM"
const hhmm = (s: string) => (s ?? "").split(":").slice(0, 2).join(":");
const hhmmss = (s: string) => (s.includes(":") ? `${s}:00` : s);

// Helper to add minutes to "HH:MM"
const addMinutes = (hhmm: string, minutes: number) => {
  const [hStr, mStr] = hhmm.split(":");
  const h = parseInt(hStr || "0", 10);
  const m = parseInt(mStr || "0", 10);

  const total = h * 60 + m + minutes;
  const newH = Math.floor(total / 60) % 24;
  const newM = total % 60;

  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
};

const AvailableDayEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role, userId } = useAuth() as { role?: string; userId?: string | null };

  const [model, setModel] = useState<AvailableDayDto | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setError("");
        const data = await ApiService.get<AvailableDayDto>(`/AvailableDayAPI/${id}`);
        setModel({
          ...data,
          date: data.date.split("T")[0],
          startTime: hhmm(data.startTime),
          endTime: hhmm(data.endTime),
        });
      } catch {
        setError("Could not load available day");
      }
    }

    load();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!model) return;   

    try {
      setBusy(true);
      await ApiService.put(`/AvailableDayAPI/update/${id}`, {
        healthcarePersonnelId: model.healthcarePersonnelId,
        date: model.date,
        startTime: hhmmss(model.startTime),
        endTime: hhmmss(model.endTime),
      });
      navigate("/availabledays");
    } catch {
      setError("Update failed.");
    } finally {
      setBusy(false);
    }
  };

  // 1) First: loading / error when we don't have model yet
  if (!model) {
    return (
      <div className="container mt-4">
        {error ? (
          <Alert variant="danger">{error}</Alert>
        ) : (
          "Loading..."
        )}
      </div>
    );
  }

  // 2) When we have model: check authorization
  const canEdit =
    role === "Admin" ||
    (role === "HealthcarePersonnel" &&
      String(model.healthcarePersonnelId) === String(userId));

  if (!canEdit) {
    return (
      <div className="container mt-4">
        <Alert variant="warning">
          You don't have access to edit this available time
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2>Edit available time slot</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
        <Form.Label>Healthcare Personnel</Form.Label>
        <Form.Control
          value={
            model.healthcarePersonnelName
              ? `${model.healthcarePersonnelName} (${model.healthcarePersonnelEmail})`
              : model.healthcarePersonnelId
          }
          disabled
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Date</Form.Label>
        <Form.Control
            type="date"
            value={model.date}
            onChange={(e) => setModel({ ...model, date: e.target.value })}
            required
            disabled={busy}
            title="Please select a date"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Start time</Form.Label>
          <Form.Control
            type="time"
            value={model.startTime}
            onChange={(e) => {
              const newStart = e.target.value;
              setModel({
                ...model,
                startTime: newStart,
                endTime: addMinutes(newStart, 45), // auto-set end time
              });
            }}
            required
            disabled={busy}
            title="Please select a start time"
          />
        </Form.Group>

        <Button type="submit" disabled={busy}>
          {busy ? "Saving..." : "Save"}
        </Button>{" "}
        <Button
          variant="secondary"
          onClick={() => navigate("/availabledays")}
          disabled={busy}
        >
          Cancel
        </Button>
      </Form>
    </div>
  );
};

export default AvailableDayEditPage;