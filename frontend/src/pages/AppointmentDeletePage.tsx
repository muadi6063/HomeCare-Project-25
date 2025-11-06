import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const handleResponse = async (r: Response) => {
  if (!r.ok) throw new Error((await r.text()) || "Network error");
  if (r.status === 204) return null;
  return r.json();
};

const getAppointment = async (id: number) => {
  const res = await fetch(`${API_URL}/api/appointmentapi/${id}`);
  return handleResponse(res);
};

const deleteAppointment = async (id: number) => {
  const res = await fetch(`${API_URL}/api/appointmentapi/delete/${id}`, {
    method: "DELETE",
  });
  return handleResponse(res);
};

type Appointment = {
  appointmentId: number;
  clientId: number;
  availableDayId: number;
  notes?: string | null;
};

const AppointmentDeletePage: React.FC = () => {
  const { id } = useParams();
  const nav = useNavigate();

  const [item, setItem] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const appt = await getAppointment(Number(id));
        setItem(appt);
      } catch (e: any) {
        setErr(e?.message ?? "Kunne ikke hente avtale");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const onDelete = async () => {
    setDeleting(true);
    setErr(null);
    try {
      await deleteAppointment(Number(id));
      nav("/appointments");
    } catch (e: any) {
      setErr(e?.message ?? "Sletting feilet");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="mt-5">Laster…</div>;
  if (err) return <div className="mt-5" style={{ color: "red" }}>{err}</div>;
  if (!item) return <div className="mt-5">Fant ikke avtale.</div>;

  return (
    <div className="mt-4">
      <h2>Slett avtale</h2>
      <p>Er du sikker på at du vil slette denne?</p>

      <ul>
        <li><b>ID:</b> {item.appointmentId}</li>
        <li><b>ClientId:</b> {item.clientId}</li>
        <li><b>AvailableDayId:</b> {item.availableDayId}</li>
        {item.notes && <li><b>Notater:</b> {item.notes}</li>}
      </ul>

      <button className="btn btn-danger" onClick={onDelete} disabled={deleting}>
        {deleting ? "Sletter…" : "Slett"}
      </button>
      <Link to="/appointments" className="btn btn-secondary ms-2">Avbryt</Link>
    </div>
  );
};

export default AppointmentDeletePage;
