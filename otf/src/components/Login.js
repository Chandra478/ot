import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Alert, Container, Card, Row, Col } from 'react-bootstrap';
// import axios from 'axios';
import axios from '../config/axios';


function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [validated, setValidated] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      const response = await axios.post('/login', {
        email,
        password
      });
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Redirect based on role
      if (response.data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    }
  };

  const handleAdminClick = () => {
    setEmail('admin@test.com');
    setPassword('password');
  };

  const handleStudentClick = () => {
    setEmail('student@test.com');
    setPassword('student123');
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
                background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)', // light blue gradient
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
                  <h2 className="fw-bold" style={{ color: '#185a9d', letterSpacing: 1 }}>Login</h2>
                </div>
                {error && (
                  <Alert 
                    variant="danger" 
                    className="text-center"
                    onClose={() => setError('')} 
                    dismissible
                  >
                    {error}
                  </Alert>
                )}

                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      isInvalid={!!error}
                    />
                    <Form.Control.Feedback type="invalid">
                      Please enter a valid email
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      isInvalid={!!error}
                    />
                    <Form.Control.Feedback type="invalid">
                      Password is required
                    </Form.Control.Feedback>
                  </Form.Group>

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
                      Login
                    </Button>
                  </div>

                  <div className="text-center">
                    <span className="text-muted">Don't have an account? </span>
                    <Link to="/register" className="text-decoration-none">
                      Register here
                    </Link>
                  </div>

                  {/* <div className="text-center mt-4">
                    <Button variant="secondary" onClick={handleAdminClick} className="me-2">
                      Admin
                    </Button>
                    <Button variant="secondary" onClick={handleStudentClick}>
                      Student
                    </Button>
                  </div> */}
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Login;
