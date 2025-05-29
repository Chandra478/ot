import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Spinner, Alert, Button, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../config/axios'; // Adjust the import based on your axios setup

function StudentDashboard() {
    const [dashboardData, setDashboardData] = useState(null);
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [dashboardRes, testsRes] = await Promise.all([
                    axios.get('/student/dashboard'),
                    axios.get('/student/tests')
                ]);
                
                setDashboardData(dashboardRes.data);
                setTests(testsRes.data.data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load dashboard');
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getTestStatus = (test) => {
        const now = new Date();
        const start = new Date(test.start_time);
        const end = new Date(start.getTime() + test.duration * 60000);
        
        if (now < start) return 'upcoming';
        if (now > end) return 'completed';
        return 'active';
    };

    if (loading) return (
        <Container className="text-center mt-5">
            <Spinner animation="border" />
        </Container>
    );

    if (error) return (
        <Container className="mt-5">
            <Alert variant="danger">{error}</Alert>
        </Container>
    );

    return (
        <div>
            <Container fluid className="p-4">
                <Row className="mb-4 justify-content-center">
                    <Col md={10}>
                        <div className="text-center mb-4">
                            <img
                                src="/eexam2.png"
                                alt="Logo"
                                className="rounded-circle"
                                style={{ width: 60, height: 60, objectFit: 'cover', marginBottom: 10, border: '2px solid #2575fc' }}
                            />
                            <h2 className="fw-bold" style={{ color: '#185a9d', letterSpacing: 1 }}>Student Dashboard</h2>
                        </div>
                    </Col>
                </Row>
                {/* Stats Row */}
                <Row className="mb-4">
                    <Col md={3}>
                        <Card className="text-white bg-primary">
                            <Card.Body>
                                <Card.Title>Total Tests</Card.Title>
                                <Card.Text className="display-4">
                                    {dashboardData.stats.total_tests}
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="text-white bg-success">
                            <Card.Body>
                                <Card.Title>Completed Tests</Card.Title>
                                <Card.Text className="display-4">
                                    {dashboardData.stats.completed_tests}
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="text-white bg-warning">
                            <Card.Body>
                                <Card.Title>Upcoming Tests</Card.Title>
                                <Card.Text className="display-4">
                                    {dashboardData.stats.upcoming_tests}
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="text-white bg-info">
                            <Card.Body>
                                <Card.Title>Average Score</Card.Title>
                                <Card.Text className="display-4">
                                    {dashboardData.stats.average_score || 'N/A'}
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Recent Tests */}
                <Card className="mb-4 shadow-lg rounded-4 border-0" style={{ background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)', color: '#222' }}>
                    <Card.Header className="bg-transparent border-0">
                        <h4 className="fw-bold" style={{ color: '#185a9d', letterSpacing: 1 }}>Recent Test Results</h4>
                    </Card.Header>
                    <Card.Body>
                        <Table striped hover responsive>
                            <thead>
                                <tr>
                                    <th>Test Name</th>
                                    <th>Date</th>
                                    <th>Score</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dashboardData.recent_tests.map(result => (
                                    <tr key={result.id} onClick={() => navigate(`/student/results/${result.id}`)}>
                                        <td>{result.test.title}</td>
                                        <td>{new Date(result.submitted_at).toLocaleDateString()}</td>
                                        <td>{result.score}</td>
                                        <td>
                                            <Badge bg={(result.score / result.total_questions) * 100 >= 30 ? 'success' : 'danger'}>
                                                {(result.score / result.total_questions) * 100 >= 30 ? 'Passed' : 'Failed'}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>

                {/* Upcoming/Available Tests */}
                <Card className="shadow-lg rounded-4 border-0" style={{ background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)', color: '#222' }}>
                    <Card.Header className="bg-transparent border-0">
                        <h4 className="fw-bold" style={{ color: '#185a9d', letterSpacing: 1 }}>Your Tests</h4>
                    </Card.Header>
                    <Card.Body>
                        <Table striped hover responsive>
                            <thead>
                                <tr>
                                    <th>Test Name</th>
                                    <th>Class</th>
                                    <th>Start Time</th>
                                    <th>Duration</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tests.map(test => {
                                    const status = getTestStatus(test);
                                    const hasResult = test.results.length > 0;
                                    
                                    return (
                                        <tr key={test.id} >
                                            <td>{test.title}</td>
                                            <td>{test.class}</td>
                                            <td>{new Date(test.start_time).toLocaleString()}</td>
                                            <td>{test.duration} mins</td>
                                            <td>
                                                <Badge bg={
                                                    status === 'active' ? 'success' :
                                                    status === 'upcoming' ? 'warning' : 'secondary'
                                                }>
                                                    {status}
                                                </Badge>
                                            </td>
                                            <td>
                                                {status === 'active' && !hasResult && (
                                                    <Button as={Link} to={`/test/${test.id}`} variant="primary" size="sm">
                                                        Start Test
                                                    </Button>
                                                )}
                                                {hasResult && (
                                                    <span className="text-muted">Completed</span>
                                                )}
                                                {status === 'upcoming' && (
                                                    <span className="text-muted">Not Available Yet</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
}

export default StudentDashboard;
