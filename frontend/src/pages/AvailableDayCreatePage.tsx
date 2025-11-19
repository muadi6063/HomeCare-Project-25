// src/pages/AvailableDayCreatePage.tsx
import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import ApiService from "../services/ApiService";
import { useAuth } from "../context/AuthContext";

const AvailableDayCreatePage = () => {
  const navigate = useNavigate();
  const { role, userId } = useAuth() as { role?: string; userId?: string | null };

  const [healthcarePersonnelId, setHealthcarePersonnelId] = useState(userId || "");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const canCreate = role === "Admin" || role === "HealthcarePersonnel";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!healthcarePersonnelId || !date || !startTime) {
      setError("All fields must be filled out");
      return;
    }

      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        setError("Date must be in the future.");
        return;
      }

    try {
      setBusy(true);
      await ApiService.post("/AvailableDayAPI/create", {
        healthcarePersonnelId,
        date,
        startTime: startTime + ":00",
      });
      navigate("/availabledays");
    } catch (err: any) {
      const errorMessage = err?.message.replace(/^API \d+ [^:]+:\s*/, '') || "Could not create available day";
      setError(errorMessage);
    } finally {
      setBusy(false);
    }
  };

  if (!canCreate) return <Alert variant="warning">Ingen tilgang</Alert>;

  return (
    <div className="container mt-4">
      <h2>New available day</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Healthcare Personnel Id</Form.Label>
          <Form.Control
            value={healthcarePersonnelId}
            onChange={(e) => setHealthcarePersonnelId(e.target.value)}
            required
            disabled={!!userId}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Date</Form.Label>
          <Form.Control
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Start time</Form.Label>
          <Form.Control
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </Form.Group>

        <Button type="submit" disabled={busy}>
          {busy ? "Saving..." : "Save"}
        </Button>{" "}
        <Button variant="secondary" onClick={() => navigate("/availabledays")}>
          Avbryt
        </Button>
      </Form>
    </div>
  );
};

export default AvailableDayCreatePage;
