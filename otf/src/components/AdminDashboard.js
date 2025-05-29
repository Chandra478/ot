import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import axios from '../config/axios'; // Adjust the import path as necessary

function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('/admin/dashboard-stats', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setStats(res.data);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
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
                <Spinner animation="border" variant="light" />
            </div>
        );
    }

    return (
        <div
            style={{
                // minHeight: '100vh',
                // background: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)',
                padding: '40px 0'
            }}
        >
            <Container>
                <h2 className="my-4 text-white text-center fw-bold" style={{ letterSpacing: 1 }}>
                    Admin Dashboard Overview
                </h2>
                <Row className="justify-content-center">
                    <Col md={3} className="mb-4">
                        <Card className="shadow rounded-4 border-0" style={{
                            background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)',
                            color: '#185a9d'
                        }}>
                            <Card.Body className="text-center">
                                <Card.Title>Total Tests</Card.Title>
                                <Card.Text className="display-4 fw-bold">{stats.total_tests}</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3} className="mb-4">
                        <Card className="shadow rounded-4 border-0" style={{
                            background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)',
                            color: '#43cea2'
                        }}>
                            <Card.Body className="text-center">
                                <Card.Title>Active Tests</Card.Title>
                                <Card.Text className="display-4 fw-bold">{stats.active_tests}</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3} className="mb-4">
                        <Card className="shadow rounded-4 border-0" style={{
                            background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)',
                            color: '#f0ad4e'
                        }}>
                            <Card.Body className="text-center">
                                <Card.Title>Completed Tests</Card.Title>
                                <Card.Text className="display-4 fw-bold">{stats.completed_tests}</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3} className="mb-4">
                        <Card className="shadow rounded-4 border-0" style={{
                            background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)',
                            color: '#185a9d'
                        }}>
                            <Card.Body className="text-center">
                                <Card.Title>Total Students</Card.Title>
                                <Card.Text className="display-4 fw-bold">{stats.total_students}</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default Dashboard;
