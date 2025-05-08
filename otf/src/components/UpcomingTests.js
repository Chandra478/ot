import { useEffect, useState } from 'react';
import { Table, Spinner, Alert, Badge, Button, Container } from 'react-bootstrap';
import axios from '../config/axios'; // Adjust the import based on your axios setup
import { Link } from 'react-router-dom';

function UpcomingTests() {
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const fetchTests = async () => {
            try {
                const res = await axios.get('/student/upcoming-tests');
                setTests(res.data.data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load upcoming tests');
                setLoading(false);
            }
        };
        fetchTests();

        // Update time every minute
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const calculateTimeRemaining = (startTime) => {
        const start = new Date(startTime);
        const diff = start - currentTime;
        
        if (diff <= 0) return 'Test started';
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        return `${days}d ${hours}h ${minutes}m remaining`;
    };

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" />
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <h2 className="mb-4">Upcoming Tests</h2>
            
            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>Test Name</th>
                        <th>Class</th>
                        <th>Start Time</th>
                        <th>Duration</th>
                        <th>Time Remaining</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {tests.map(test => {
                        const timeRemaining = calculateTimeRemaining(test.start_time);
                        const isTestSoon = new Date(test.start_time) - currentTime < 3600000; // 1 hour

                        return (
                            <tr key={test.id}>
                                <td>{test.title}</td>
                                <td>{test.class}</td>
                                <td>{new Date(test.start_time).toLocaleString()}</td>
                                <td>{test.duration} minutes</td>
                                <td>
                                    <Badge bg={isTestSoon ? 'warning' : 'primary'}>
                                        {timeRemaining}
                                    </Badge>
                                </td>
                                <td>
                                    <Button 
                                        variant="info" 
                                        size="sm"
                                        as={Link}
                                        to={`/test-info/${test.id}`}
                                    >
                                        View Details
                                    </Button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>

            {tests.length === 0 && (
                <Alert variant="info" className="mt-4">
                    No upcoming tests found
                </Alert>
            )}
        </Container>
    );
}

export default UpcomingTests;