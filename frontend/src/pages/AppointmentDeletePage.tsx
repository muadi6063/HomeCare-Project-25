import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import ApiService from "../services/ApiService";
import type { AppointmentDto } from "../types/homecare";

const hhmm = (s?: string | null) => (s ?? "").split(":").slice(0, 2).join(":");

const AppointmentDeletePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();

  const [item, setItem] = useState<AppointmentDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const appt = await ApiService.get<AppointmentDto>(`/AppointmentAPI/${id}`);
        setItem(appt);
      } catch (e: any) {
        setErr(e?.message ?? "Kunne ikke hente avtale");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function onDelete() {
    setErr(null);
    try {
      setDeleting(true);
      await ApiService.delete(`/AppointmentAPI/delete/${id}`);
      nav("/appointments");
    } catch (e: any) {
      setErr(e?.message ?? "Sletting feilet");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <div className="container-lg mt-5">Laster…</div>;
  if (err) return <div className="container-lg mt-5 text-danger">{err}</div>;
  if (!item) return <div className="container-lg mt-5">Fant ikke avtale.</div>;

  return (
    <div className="container-lg mt-4" style={{ maxWidth: 640 }}>
      <h2>Slett avtale</h2>
      <p>Er du sikker på at du vil slette denne?</p>

      <ul>
        <li><b>ID:</b> {item.appointmentId}</li>
        <li><b>Klient:</b> {item.clientName ?? "ukjent"} ({item.clientEmail ?? "–"})</li>
        <li>
          <b>Tid:</b> {item.availableDayDate ? new Date(item.availableDayDate).toLocaleDateString("no-NO") : "—"}{" "}
          {hhmm(item.startTime)}–{hhmm(item.endTime)}
        </li>
        <li><b>Oppgave:</b> {item.taskDescription || "—"}</li>
      </ul>

      <button className="btn btn-danger" onClick={onDelete} disabled={deleting}>
        {deleting ? "Sletter…" : "Slett"}
      </button>
      <Link to="/appointments" className="btn btn-secondary ms-2">Avbryt</Link>
    </div>
  );
};

export default AppointmentDeletePage;