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

  const flat = groups.flatMap((g) =>
    g.availableDays.map((ad) => ({
      ...ad,
      personnelName: g.healthcarePersonnel.name,
    }))
  );

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

      <div className="row g-3">
        {flat.map((ad) => (
          <div className="col-12 col-md-6 col-lg-4" key={ad.availableDayId}>
            <div className="card h-100">
              <div className="card-body">
                <h5>{new Date(ad.date).toLocaleDateString("no-NO")}</h5>
                <p>
                  {hhmm(ad.startTime)} – {hhmm(ad.endTime)}
                </p>
                <p className="text-muted small mb-1">
                  {ad.personnelName ?? "Unknown staff"}
                </p>

                {(canEditDay(ad) || canDeleteDay(ad)) && (
                  <div className="d-flex gap-2">
                    {canEditDay(ad) && (
                      <Link
                        className="btn btn-sm btn-outline-secondary"
                        to={`/availabledays/edit/${ad.availableDayId}`}
                      >
                        Edit
                      </Link>
                    )}
                    {canDeleteDay(ad) && (
                      <Link
                        className="btn btn-sm btn-outline-danger"
                        to={`/availabledays/delete/${ad.availableDayId}`}
                      >
                        Delete
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
};

export default AvailableDaysPage;
