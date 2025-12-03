import React, { useEffect, useState } from "react";
import { Alert, Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import ApiService from "../services/ApiService";
import { useAuth } from "../context/AuthContext";

type AvailableDayDto = {
  availableDayId: number;
  date: string;
  startTime: string;
  endTime: string;
  healthcarePersonnelId: string;
};

// Format time string from "HH:MM:SS" to "HH:MM"
const hhmm = (s?: string) => (s ?? "").split(":").slice(0, 2).join(":");

const AvailableDayDeletePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role, userId } = useAuth() as { role?: string; userId?: string | null };

  const [item, setItem] = useState<AvailableDayDto | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Authorization check: admin can delete all, healthcare personnel only their own
  const canDelete =
    role === "Admin" ||
    (role === "HealthcarePersonnel" &&
      item &&
      String(item.healthcarePersonnelId) === String(userId));

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setError("");
        const data = await ApiService.get<AvailableDayDto>(`/AvailableDayAPI/${id}`);
        if (!cancelled) {
          setItem(data);
        }
      } catch {
        if (!cancelled) {
          setError("Could not load the element.");
        }
      }
    }

    if (id) {
      load();
    }

    // Prevent state updates if component is unmounted during request
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleDelete = async () => {
    setError("");
    try {
      setBusy(true);
      await ApiService.delete(`/AvailableDayAPI/delete/${id}`);
      navigate("/availabledays");
    } catch (e) {
      console.error("Delete failed:", e)
      setError("Delete failed.");
    } finally {
      setBusy(false);
    }
  };

  if (!item) {
    return (
      <div className="container mt-4">
        {error ? <Alert variant="danger">{error}</Alert> : "Loading…"}
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2>Delete available day</h2>

      {!canDelete && (
        <Alert variant="warning" className="mt-3">
          You do not have permission to delete this available day.
        </Alert>
      )}

      {error && (
        <Alert variant="danger" className="mt-3">
          {error}
        </Alert>
      )}

      <div className="mt-3 p-3 border rounded bg-light">
        <p className="mb-3">
          Are you sure you want to delete available day{" "}
          <strong>#{item.availableDayId}</strong> on{" "}
          {new Date(item.date).toLocaleDateString("no-NO")}{" "}
          {hhmm(item.startTime)}–{hhmm(item.endTime)}?
        </p>

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
          onClick={() => navigate("/availabledays")}
          disabled={busy}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default AvailableDayDeletePage;