import React, { useEffect, useState } from 'react';
import { Container, Spinner, Alert } from 'react-bootstrap';
import type { AvailableDaysGrouped } from '../types/homecare';

const AvailableDaysPage: React.FC = () => {
  const [groups, setGroups] = useState<AvailableDaysGrouped[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hhmm = (s: string | null | undefined) =>
    (s ?? '').split(':').slice(0, 2).join(':');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch('/api/AvailableDayAPI/availableDaysList');
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`GET failed (${res.status}) ${text}`);
        }

        const json = (await res.json()) as AvailableDaysGrouped[];
        if (!cancelled) setGroups(json);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? 'Unknown error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">Feil ved lasting: {error}</Alert>
      </Container>
    );
  }

  if (!groups || groups.length === 0) {
    return (
      <Container className="mt-5">
        <Alert variant="info">Ingen ledige dager funnet.</Alert>
      </Container>
    );
  }

  //flat liste for grid
  const flattenDays = (gs: AvailableDaysGrouped[]) =>
    gs.flatMap(g =>
      g.availableDays.map(ad => ({
        ...ad,
        personnelName: g.healthcarePersonnel.name,
        personnelEmail: g.healthcarePersonnel.email,
      }))
    );

  return (
    <div className="container-lg mt-4">
      <h2>Ledige dager</h2>
      <p className="text-muted">Alle tilgjengelige tider</p>

      <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-3">
        {flattenDays(groups).map(ad => (
          <div className="col" key={ad.availableDayId}>
            <div className="card h-100 hover-card">
              <div className="card-body">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span className="badge text-bg-light border">{ad.personnelName}</span>
                </div>
                <h5 className="card-title mb-1">
                  {new Date(ad.date).toLocaleDateString('no-NO')}
                </h5>
                <p className="card-text mb-2">
                  Tid: {hhmm(ad.startTime)} – {hhmm(ad.endTime)}
                </p>
                <p className="card-text text-muted small mb-0">ID: {ad.availableDayId}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvailableDaysPage;
