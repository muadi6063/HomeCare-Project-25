import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;
const headers = { "Content-Type": "application/json" };

const handleResponse = async (r: Response) => {
  if (!r.ok) throw new Error((await r.text()) || "Network error");
  if (r.status === 204) return null;
  return r.json();
};

const createAppointment = async (dto: any) => {
  const res = await fetch(`${API_URL}/api/appointmentapi/create`, {
    method: "POST",
    headers,
    body: JSON.stringify(dto),
  });
  return handleResponse(res);
};

const AppointmentCreatePage: React.FC = () => {
  const nav = useNavigate();

  const [clientId, setClientId] = useState<number>(0);
  const [availableDayId, setAvailableDayId] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    try {
      const dto = { clientId, availableDayId, notes };
      await createAppointment(dto);
      nav("/appointments");
    } catch (e: any) {
      setErr(e?.message ?? "Kunne ikke opprette avtale");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-4">
      <h2>Ny avtale</h2>
      {err && <p style={{ color: "red" }}>{err}</p>}

      <form onSubmit={onSubmit} className="mt-3" style={{ maxWidth: 420 }}>
        <div className="mb-3">
          <label className="form-label">Client ID</label>
          <input
            type="number"
            className="form-control"
            value={clientId}
            onChange={(e) => setClientId(Number(e.target.value))}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Available Day ID</label>
          <input
            type="number"
            className="form-control"
            value={availableDayId}
            onChange={(e) => setAvailableDayId(Number(e.target.value))}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Notater</label>
          <textarea
            className="form-control"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <button className="btn btn-primary" disabled={saving}>
          {saving ? "Lagrer…" : "Opprett"}
        </button>
        <button
          type="button"
          className="btn btn-secondary ms-2"
          onClick={() => nav("/appointments")}
          disabled={saving}
        >
          Avbryt
        </button>
      </form>
    </div>
  );
};

export default AppointmentCreatePage;
