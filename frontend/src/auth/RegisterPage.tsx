import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Form, Container } from 'react-bootstrap';
import ApiService from '../services/ApiService';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

    const [userData, setUserData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Client',
    });
    const [registrationError, setRegistrationError] = useState<string | null>(null);
    const [registrationSuccess, setRegistrationSuccess] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

    const handleRegistration = async (e: React.FormEvent) => {
        e.preventDefault();
        setRegistrationError(null);
        setRegistrationSuccess(null);

        try {
        setIsSubmitting(true);
        const payload = {
            username: userData.email,
            name: userData.name,
            email: userData.email,
            password: userData.password,
            role: userData.role,
        };
        await ApiService.post('/AuthAPI/register', payload);
        setRegistrationSuccess('Registrering vellykket! Du kan nå logge inn.');
        setTimeout(() => navigate('/login'), 2000);
        } catch (err: any) {
        if (err instanceof Error) {
            setRegistrationError(err.message);
        } else {
            setRegistrationError('En ukjent feil oppstod.');
        }
        console.error(err)
        } finally{
            setIsSubmitting(false)
        }
    };

    return (
    <Container className="mt-5 d-flex justify-content-center">
      <Card style={{ maxWidth: 500, width: '100%' }}>
        <Card.Body>
          <Card.Title className="mb-3">Register New User</Card.Title>

          {registrationError && <Alert variant="danger">{registrationError}</Alert>}
          {registrationSuccess && <Alert variant="success">{registrationSuccess}</Alert>}

          <Form onSubmit={handleRegistration}>
            <Form.Group className="mb-3" controlId="name">
              <Form.Label>Full Name *</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={userData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                required
                disabled={isSubmitting}
                minLength={2}
                title="Please enter your full name"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email Address *</Form.Label>
              <Form.Control
                type="email"
                name="email"
                autoComplete="email"
                value={userData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                required
                disabled={isSubmitting}
                title="Please enter your email address"
              />
              <Form.Text className="text-muted">
                Your email will be used as your username.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Password *</Form.Label>
              <Form.Control
                type="password"
                name="password"
                autoComplete="new-password"
                value={userData.password}
                onChange={handleInputChange}
                placeholder="Minimum 6 characters"
                required
                disabled={isSubmitting}
                minLength={6}
                title="Please enter your password"
              />
              <Form.Text className="text-muted">
                Password must be at least 6 characters long.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3" controlId="role">
              <Form.Label>Role *</Form.Label>
              <Form.Select
                name="role"
                value={userData.role}
                onChange={(e) => setUserData({ ...userData, role: e.target.value })}
                required
                disabled={isSubmitting}
              >
                <option value="Client">Client</option>
                <option value="HealthcarePersonnel">HealthcarePersonnel</option>
              </Form.Select>
              <Form.Text className="text-muted">
                Select whether you are a client or healthcare personnel.
              </Form.Text>
            </Form.Group>

            <div className="d-grid">
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? 'Registering...' : 'Register'}
              </Button>
            </div>

            <div className="mt-3 text-center">
              <span className="text-muted">Already have an account? </span>
              <Button
                variant="link"
                onClick={() => navigate('/login')}
                disabled={isSubmitting}
                className="p-0"
              >
                Login here
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default RegisterPage;