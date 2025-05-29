import { useState } from 'react';
import { Form, Button, Alert, Container, Card, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../config/axios';
import './Register.css'; // Create this CSS file

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    gender: '',
    class: ''
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.class) newErrors.class = 'Class is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await axios.post('/register', formData);
      navigate('/login', { state: { registrationSuccess: true } });
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear errors when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: null
      });
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={4}>
            <Card
              className="shadow-lg rounded-4 border-0"
              style={{
                background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)',
                color: '#222'
              }}
            >
              <Card.Body className="p-4">
                <div className="text-center mb-4">
                  <img
                    src="/eexam2.png"
                    alt="Logo"
                    className="rounded-circle"
                    style={{ width: 60, height: 60, objectFit: 'cover', marginBottom: 10, border: '2px solid #2575fc' }}
                  />
                  <h2 className="fw-bold" style={{ color: '#185a9d', letterSpacing: 1 }}>Student Registration</h2>
                </div>
                {apiError && (
                  <Alert 
                    variant="danger" 
                    className="text-center"
                    onClose={() => setApiError('')} 
                    dismissible
                  >
                    {apiError}
                  </Alert>
                )}
                <Form onSubmit={handleSubmit} noValidate>
                  <Form.Group className="mb-3">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      isInvalid={!!errors.name}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.name}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      isInvalid={!!errors.email}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.email}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      isInvalid={!!errors.password}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.password}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Gender</Form.Label>
                        <Form.Select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          isInvalid={!!errors.gender}
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          {errors.gender}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Class</Form.Label>
                        <Form.Select
                          name="class"
                          value={formData.class}
                          onChange={handleChange}
                          isInvalid={!!errors.class}
                        >
                          <option value="">Select Class</option>
                          {[...Array(12)].map((_, i) => (
                            <option key={i+1} value={`Class ${i+1}`}>
                              Class {i+1}
                            </option>
                          ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          {errors.class}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="d-grid mb-3">
                    <Button
                      style={{
                        background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)',
                        border: 'none',
                        fontWeight: 'bold',
                        letterSpacing: 1
                      }}
                      type="submit"
                      size="lg"
                    >
                      Register
                    </Button>
                  </div>

                  <div className="text-center">
                    <span className="text-muted">Already have an account? </span>
                    <Link to="/login" className="text-decoration-none">
                      Login here
                    </Link>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Register;
