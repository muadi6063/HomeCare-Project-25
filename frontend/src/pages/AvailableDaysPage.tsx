import React, { useEffect, useState } from "react";
import { Container, Spinner, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import ApiService from "../services/ApiService";
import { useAuth } from "../context/AuthContext";
import type { AvailableDaysGrouped } from "../types/homecare";

const hhmm = (s: string | null | undefined) =>
  (s ?? "").split(":").slice(0, 2).join(":");

const AvailableDaysPage: React.FC = () => {
  const { isAuthenticated, role, userId } = useAuth();
  const [groups, setGroups] = useState<AvailableDaysGrouped[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canCreate =
    isAuthenticated && (role === "Admin" || role === "HealthcarePersonnel");

  const canEditDay = (ad: { healthcarePersonnelId: number }) => {
    if (!isAuthenticated) return false;
    if (role === "Admin") return true;
    if (role === "HealthcarePersonnel") {
      return String(ad.healthcarePersonnelId) === String(userId);
    }
    return false;
  };

  const canDeleteDay = (ad: { healthcarePersonnelId: number }) => {
    if (!isAuthenticated) return false;
    if (role === "Admin") return true;
    if (role === "HealthcarePersonnel") {
      return String(ad.healthcarePersonnelId) === String(userId);
    }
    return false;
  };

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await ApiService.get<AvailableDaysGrouped[]>(
          "/AvailableDayAPI/availableDaysList"
        );

        data.forEach(group => {
          group.availableDays.sort((a, b) => {
            const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
            if (dateCompare !== 0) return dateCompare;
            return (a.startTime ?? "").localeCompare(b.startTime ?? "");
          });
        });
        
        if (!cancelled) setGroups(data);
      } catch (e: any) {
        if (!cancelled) setError("Kunne ikke hente tilgjengelige dager.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <div className="text-center mt-5"><Spinner /></div>;
  if (error) return <Alert className="mt-5" variant="danger">{error}</Alert>;

  if (!groups || groups.length === 0) {
    return (
      <Container className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>Available Days</h2>
          {canCreate && (
            <Link to="/availabledays/create" className="btn btn-primary">
              + New Available Day
            </Link>
          )}
        </div>
        <Alert variant="info">No available days found.</Alert>
      </Container>
    );
  }

  return (
  <Container className="mt-4">
    <div className="d-flex justify-content-between align-items-center mb-4">
      <h2>Available Days</h2>
      {canCreate && (
        <Link to="/availabledays/create" className="btn btn-success">
          Create Available Day
        </Link>
      )}
    </div>

    <div className="row g-3">
      {groups.map((item) => (
        <div className="col-12 col-md-6 col-lg-4" key={item.healthcarePersonnel.userId}>
          <div className="card h-100 hover-card">
            <div className="card-header bg-light">
              <h5 className="mb-1">{item.healthcarePersonnel.name}</h5>
              <small className="text-muted">{item.healthcarePersonnel.email}</small>
            </div>
            <div className="card-body">
              {item.availableDays.length === 0 ? (
                <p className="text-muted mb-0">No available time slots</p>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {item.availableDays.map((availableDay) => (
                    <div key={availableDay.availableDayId} className="p-2 border rounded bg-light">
                      <div className="d-flex justify-content-between">
                        <div>
                          <div className="fw-bold">{new Date(availableDay.date).toLocaleDateString("no-NO")}</div>
                          <div className="text-muted small">{hhmm(availableDay.startTime)} – {hhmm(availableDay.endTime)}</div>
                        </div>
                        {(canEditDay(availableDay) || canDeleteDay(availableDay)) && (
                          <div className="d-flex gap-1">
                            {canEditDay(availableDay) && (
                              <Link to={`/availabledays/edit/${availableDay.availableDayId}`} className="btn btn-sm btn-outline-secondary">
                                Edit
                              </Link>
                            )}
                            {canDeleteDay(availableDay) && (
                              <Link to={`/availabledays/delete/${availableDay.availableDayId}`} className="btn btn-sm btn-outline-danger">
                                Delete
                              </Link>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  </Container>
);
}

export default AvailableDaysPage;
