import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import axios from 'axios';

function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:8000/api/admin/dashboard-stats', {
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
            <Container className="text-center mt-5">
                <Spinner animation="border" />
            </Container>
        );
    }

    return (
        <Container fluid>
            <h2 className="my-4">Admin Dashboard Overview</h2>
            <Row>
                <Col md={3} className="mb-4">
                    <Card className="text-white bg-primary">
                        <Card.Body>
                            <Card.Title>Total Tests</Card.Title>
                            <Card.Text className="display-4">{stats.total_tests}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} className="mb-4">
                    <Card className="text-white bg-success">
                        <Card.Body>
                            <Card.Title>Active Tests</Card.Title>
                            <Card.Text className="display-4">{stats.active_tests}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} className="mb-4">
                    <Card className="text-white bg-warning">
                        <Card.Body>
                            <Card.Title>Completed Tests</Card.Title>
                            <Card.Text className="display-4">{stats.completed_tests}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} className="mb-4">
                    <Card className="text-white bg-info">
                        <Card.Body>
                            <Card.Title>Total Students</Card.Title>
                            <Card.Text className="display-4">{stats.total_students}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default Dashboard;
