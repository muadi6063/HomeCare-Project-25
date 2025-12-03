import React, { useState } from 'react';
import { Alert, Button, Card, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const { login } = useAuth(); // Global auth helper: calls backend and stores JWT
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false); // Tracks pending login request to disable form while submitting
  const [error, setError] = useState<string | null>(null);

  // Handle login form submit: call auth API, show errors, and redirect on success
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);

    try {
      await login({ email, password });
      navigate('/'); // Redirect after successful login
    } catch (err: any) {
      // Normalize different error shapes into a user-friendly message
      const msg =
        err instanceof Error && err.message
          ? err.message
          : 'Login failed: Check username and password';

      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="d-flex justify-content-center mt-5">
      <Card style={{ maxWidth: 420, width: '100%' }}>
        <Card.Body>
          <Card.Title className="mb-3">Login</Card.Title>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={onSubmit}>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                title="Please enter your email address"
                disabled={busy}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                title="Please enter your password"
                disabled={busy}
              />
            </Form.Group>

            <div className="d-grid">
              <Button type="submit" disabled={busy}>
                {busy ? 'Logging in…' : 'Login'}
              </Button>
            </div>
          </Form>

          <div className="mt-3 text-center">
            <span className="text-muted">Don't have an account? </span>
            <Button
              variant="link"
              onClick={() => navigate('/register')}
              disabled={busy}
              className="p-0"
            >
              Register here
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default LoginPage;