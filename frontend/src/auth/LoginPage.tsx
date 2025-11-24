import React, { useState } from 'react';
import { Alert, Button, Card, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login({ email, password });
      navigate('/');
    } catch {
      setError('Login failed');
    } finally {
      setBusy(false);
    }
  }

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
              className="p-0">
              Register here
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default LoginPage;
