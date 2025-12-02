import React, { useState, useEffect } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import ApiService from "../services/ApiService";
import { useAuth } from "../context/AuthContext";

type HealthcarePersonnel = {
  userId: string;
  name: string;
  email: string;
  role: string;
};

const AvailableDayCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { role, userId ,name } = useAuth() as {
    role?: string;
    userId?: string | null;
    name?: string | null;
  };

  const [healthcarePersonnelId, setHealthcarePersonnelId] = useState("");
  const [personnel, setPersonnel] = useState<HealthcarePersonnel[]>([]);
  const [loadingPersonnel, setLoadingPersonnel] = useState(false);

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const canCreate = role === "Admin" || role === "HealthcarePersonnel";

  // Load the healthcare personnel list for Admin,
// and automatically set own ID for HealthcarePersonnel
  useEffect(() => {
    // HealthcarePersonnel: always themselves
    if (role === "HealthcarePersonnel" && userId) {
      setHealthcarePersonnelId(userId);
    }

    // Admin: fetch all users and filter to HealthcarePersonnel
    if (role === "Admin") {
      (async () => {
        try {
          setLoadingPersonnel(true);

          // Fetch the entire user list
          const data = await ApiService.get<HealthcarePersonnel[]>(
            "/UserAPI/userlist"
          );

          // Filter only healthcare personnel
          const hpOnly = data.filter(
            (u) => u.role === "HealthcarePersonnel"
          );

          setPersonnel(hpOnly);
        } catch  {
          setError("Could not load healthcare personnel list.");
        } finally {
          setLoadingPersonnel(false);
        }
      })();
    }
  }, [role, userId]);

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
      const errorMessage =
        err?.message.replace(/^API \d+ [^:]+:\s*/, "") ||
        "Could not create available day";
      setError(errorMessage);
    } finally {
      setBusy(false);
    }
  };

  if (!canCreate) {
    return <Alert variant="warning">No access</Alert>;
  }

  return (
    <div className="container mt-4">
      <h2>New available day</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Healthcare personnel</Form.Label>

          {role === "Admin" ? (
            <Form.Select
              value={healthcarePersonnelId}
              onChange={(e) => setHealthcarePersonnelId(e.target.value)}
              required
              disabled={busy || loadingPersonnel || personnel.length === 0}
            >
              <option value="">
                {loadingPersonnel
                  ? "Loading personnel..."
                  : "Select healthcare personnel"}
              </option>
              {personnel.map((p) => (
                <option key={p.userId} value={p.userId}>
                  {p.name} ({p.email})
                </option>
              ))}
            </Form.Select>
          ) : (
            // HealthcarePersonnel: show own id
            <Form.Control type="text" value={name ?? ""} disabled readOnly />
          )}
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Date</Form.Label>
          <Form.Control
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            title="Please select a date"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Start time</Form.Label>
          <Form.Control
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            title="Please select start time"
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

export default AvailableDayCreatePage;