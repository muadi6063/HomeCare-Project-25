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

  // Check who can create new available days
  const canCreate =
    isAuthenticated && (role === "Admin" || role === "HealthcarePersonnel");

  // Check if user can edit a specific available day
  const canEditDay = (ad: { healthcarePersonnelId: string | number }) => {
    if (!isAuthenticated) return false;
    if (role === "Admin") return true;
    if (role === "HealthcarePersonnel") {
      return String(ad.healthcarePersonnelId) === String(userId);
    }
    return false;
  };

  // Check if user can delete a specific available day
  const canDeleteDay = (ad: { healthcarePersonnelId: string | number }) => {
    if (!isAuthenticated) return false;
    if (role === "Admin") return true;
    if (role === "HealthcarePersonnel") {
      return String(ad.healthcarePersonnelId) === String(userId);
    }
    return false;
  };

  // Load available days grouped by healthcare personnel
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const data = await ApiService.get<AvailableDaysGrouped[]>(
          "/AvailableDayAPI/availableDaysList"
        );

        // Sort days by date and start time within each group
        data.forEach((group) => {
          group.availableDays.sort((a, b) => {
            const dateCompare =
              new Date(a.date).getTime() - new Date(b.date).getTime();
            if (dateCompare !== 0) return dateCompare;
            return (a.startTime ?? "").localeCompare(b.startTime ?? "");
          });
        });

        if (!cancelled) setGroups(data);
      } catch {
        setError("Could not load available days.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="mt-5" variant="danger">
        {error}
      </Alert>
    );
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Available days</h2>
        {canCreate && (
          <Link to="/availabledays/create" className="btn btn-success">
            + Create available day
          </Link>
        )}
      </div>

      {role === "HealthcarePersonnel" && (
        <p className="text-muted" style={{ maxWidth: "650px" }}>
          Here you register and manage the days and time when you are
          available for home visits. Clients can only book appointments inside
          the time slots you publish here, so it is important to keep them
          up to date.
        </p>
      )}

      {role === "Admin" && (
        <p className="text-muted" style={{ maxWidth: "650px" }}>
          This page shows the available days registered by all healthcare
          personnel. You can use it to get an overview of capacity and to
          support staff in updating or removing time slots when needed.
        </p>
      )}

      {(!groups || groups.length === 0) ? (
        <Alert variant="info">No available days found.</Alert>
      ) : (
        <div className="row g-3">
          {groups.map((item) => {
            // Group available days by date for better display
            const groupedByDate: Record<string, typeof item.availableDays> = {};

            for (const ad of item.availableDays) {
              const dateLabel = new Date(ad.date).toLocaleDateString("no-NO", {
                year: "numeric",
                month: "short",
                day: "2-digit",
              });
              if (!groupedByDate[dateLabel]) {
                groupedByDate[dateLabel] = [];
              }
              groupedByDate[dateLabel].push(ad);
            }

            return (
              <div
                className="col-12 col-md-6 col-lg-4"
                key={item.healthcarePersonnel.userId}
              >
                <div className="card h-100 hover-card">
                  <div className="card-header bg-light">
                    <h5 className="mb-1">{item.healthcarePersonnel.name}</h5>
                    <small className="text-muted">
                      {item.healthcarePersonnel.email}
                    </small>
                  </div>

                  <div className="card-body">
                    {item.availableDays.length === 0 ? (
                      <p className="text-muted mb-0">
                        No available time slots
                      </p>
                    ) : (
                      <div className="d-flex flex-column gap-3">
                        {Object.entries(groupedByDate).map(
                          ([dateLabel, slots]) => (
                            <div key={dateLabel}>
                              <div className="fw-semibold mb-1">
                                {dateLabel}
                              </div>
                              <div className="d-flex flex-column gap-2">
                                {slots.map((availableDay) => (
                                  <div
                                    key={availableDay.availableDayId}
                                    className="d-flex justify-content-between align-items-center border rounded bg-light px-2 py-2"
                                  >
                                    <span className="small">
                                      {hhmm(availableDay.startTime)} –{" "}
                                      {hhmm(availableDay.endTime)}
                                    </span>

                                    {(canEditDay(availableDay) ||
                                      canDeleteDay(availableDay)) && (
                                      <div className="d-flex gap-1">
                                        {canEditDay(availableDay) && (
                                          <Link
                                            to={`/availabledays/edit/${availableDay.availableDayId}`}
                                            className="btn btn-sm btn-outline-secondary"
                                          >
                                            Edit
                                          </Link>
                                        )}
                                        {canDeleteDay(availableDay) && (
                                          <Link
                                            to={`/availabledays/delete/${availableDay.availableDayId}`}
                                            className="btn btn-sm btn-outline-danger"
                                          >
                                            Delete
                                          </Link>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Container>
  );
};

export default AvailableDaysPage;
