import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../services/ApiService";

type CreateAppointmentDto = {
  clientId: string;
  availableDayId: number;
  startTime: string;
  endTime: string;
  taskDescription: string;
};

const toHHmmss = (v: string) => (v?.includes(":") ? `${v}:00` : v);

const AppointmentCreatePage: React.FC = () => {
  const nav = useNavigate();

  const [clientId, setClientId] = useState<string>("");
  const [availableDayId, setAvailableDayId] = useState<number | "">("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [taskDescription, setTaskDescription] = useState<string>("");

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (!clientId || !availableDayId || !startTime || !endTime) {
      setErr("Alle påkrevde felter må fylles ut.");
      return;
    }
    if (toHHmmss(endTime) <= toHHmmss(startTime)) {
      setErr("Sluttid må være etter starttid.");
      return;
    }

    const dto: CreateAppointmentDto = {
      clientId,
      availableDayId: Number(availableDayId),
      startTime: toHHmmss(startTime),
      endTime: toHHmmss(endTime),
      taskDescription,
    };

    try {
      setSaving(true);
      await ApiService.post("/AppointmentAPI/create", dto);
      nav("/appointments");
    } catch (e: any) {
      setErr(e?.message ?? "Kunne ikke opprette avtale");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container-lg mt-4" style={{ maxWidth: 520 }}>
      <h2>Ny avtale</h2>
      {err && <p className="text-danger mt-2">{err}</p>}

      <form onSubmit={onSubmit} className="mt-3">
        <div className="mb-3">
          <label className="form-label">ClientId (GUID)</label>
          <input
            type="text"
            className="form-control"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="f.eks. 84269a9d-5b5e-4169-9da4-fe038de55bd4"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">AvailableDayId</label>
          <input
            type="number"
            className="form-control"
            value={availableDayId}
            onChange={(e) => setAvailableDayId(e.target.value ? Number(e.target.value) : "")}
            required
          />
        </div>

        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Starttid</label>
            <input
              type="time"
              className="form-control"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Sluttid</label>
            <input
              type="time"
              className="form-control"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="mb-3 mt-3">
          <label className="form-label">Oppgave (taskDescription)</label>
          <textarea
            className="form-control"
            rows={3}
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            placeholder="F.eks. medication reminder …"
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
