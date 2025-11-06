import React, {useEffect,useState} from 'react';
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const headers = {'Content-Type': 'application/json'};

const handleResponse = async (response: Response) => {
  if (response.ok){
    if (response.status === 204) return null;
    return response.json();
  }
  const errorText = await response.text();
  throw new Error(errorText || 'Network response was not ok');
};

const fetchAppointments = async () => {
  const res = await fetch(`${API_URL}/api/appointmentapi/appointmentlist`);
  return handleResponse(res);
};
const fetchAppointmentById = async (id: number) => {
  const res = await fetch(`${API_URL}/api/appointmentapi/${id}`);
  return handleResponse(res);
};
const createAppointment = async (dto: any) => {
  const res = await fetch(`${API_URL}/api/appointmentapi/create`, {
  method: 'POST',
  headers,
  body: JSON.stringify(dto),
  });
  return handleResponse(res);
};
const updateAppointment = async (id: number, dto: any) =>{
  const res = await fetch(`${API_URL}/api/appointmentapi/update/${id} `,{
    method: 'PUT',
    headers,
    body: JSON.stringify(dto),
  });
  return handleResponse(res); 
};
const deleteAppointment = async (id: number) => {
  const res = await fetch('${API_URL/api/appointmentapi/delete/${id}',{
    method: 'DELETE'
  });
  return handleResponse(res);
};

type Appointment = {
  appointmentId: number;
  clientId: number;
  availableDayId: number;
  startTime: string;
  endTime: string;
  notes?: string | null;
};

const AppointmentsPage: React.FC = () => {
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await fetchAppointments();
        setItems(data ?? []);
      } catch (e: any) {
        setErr(e?.message ?? 'Kunne ikke hente appointments');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDelete = async (id: number) => {
    await deleteAppointment(id);
    setItems((prev: Appointment[]) =>
    prev.filter((a: Appointment) => a.appointmentId !== id)
  );
  };

  if (loading) return <div className="mt-5">Laster…</div>;
  if (err) return <div className="mt-5" style={{ color: 'red' }}>{err}</div>;

  return (
    <div className="mt-5">
      <h1>Appointments</h1>
      <Link to="/appointments/create" className="btn btn-primary mb-3">
        Ny avtale
      </Link>
      <ul>
        {items.map(a => (
          <li key={a.appointmentId} style={{ marginBottom: 8 }}>
            #{a.appointmentId} • client {a.clientId} • {a.startTime}–{a.endTime}
           <Link to={`/appointments/delete/${a.appointmentId}`}
           className='btn btn-outline-danger btn-sm ms-2'
           >
            Slett
           </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AppointmentsPage;






