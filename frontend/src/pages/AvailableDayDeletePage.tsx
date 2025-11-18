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

const hhmm = (s?: string) => (s ?? "").split(":").slice(0, 2).join(":");

const AvailableDayDeletePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role, userId } = useAuth() as { role?: string; userId?: string | null };

  const [item, setItem] = useState<AvailableDayDto | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

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
        if (!cancelled) setItem(data);
      } catch {
        if (!cancelled) setError("Kunne ikke laste elementet.");
      }
    }

    if (id) load();
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
    } catch {
      setError("Sletting feilet.");
    } finally {
      setBusy(false);
    }
  };

  if (!item) return <div className="container mt-4">Laster…</div>;

  return (
    <div className="container mt-4">
      <h2>Slett tilgjengelig dag</h2>

      {!canDelete && (
        <Alert variant="warning" className="mt-3">
          Du har ikke tilgang til å slette denne tilgjengelige dagen.
        </Alert>
      )}

      {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

      <div className="mt-3">
        <p className="mb-3">
          Er du sikker på at du vil slette ID <strong>{item.availableDayId}</strong> —{" "}
          {new Date(item.date).toLocaleDateString("no-NO")}{" "}
          {hhmm(item.startTime)}–{hhmm(item.endTime)}?
        </p>

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
          onClick={() => navigate("/availabledays")}
          disabled={busy}
        >
          Avbryt
        </Button>
      </div>
    </div>
  );
};

export default AvailableDayDeletePage;
