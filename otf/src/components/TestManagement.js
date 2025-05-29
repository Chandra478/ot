import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Table, Button, Badge } from 'react-bootstrap';
// import axios from 'axios';
import axios from '../config/axios';
import { formatUTCDate, formatUTCTime } from '../utils/timeUtils';


function TestManagement() {
    const [tests, setTests] = useState([]);

    useEffect(() => {
        const fetchTests = async () => {
            const token = localStorage.getItem('token');
            const res = await axios.get('/tests', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setTests(res.data.data);
        };
        fetchTests();
    }, []);

    return (
        <div
            style={{
                // minHeight: '100vh',
                // background: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)',
                // padding: '40px 0'
            }}
        >
            <div className="container">
                <div
                    className="shadow-lg rounded-4 p-4"
                    style={{
                        background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)',
                        color: '#222',
                        marginBottom: 32
                    }}
                >
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2>Tests</h2>
                        <Button
                            as={Link}
                            to="/admin/tests/create"
                            style={{
                                background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)',
                                border: 'none',
                                fontWeight: 'bold',
                                letterSpacing: 1,
                                color: '#fff'
                            }}
                        >
                            Create New
                        </Button>
                    </div>
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Class</th>
                                <th>Questions</th>
                                <th>Start Time</th>
                                <th>Duration</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tests.map(test => (
                                <tr key={test.id}>
                                    <td>{test.title}</td>
                                    <td>{test.class}</td>
                                    <td>{test.questions_count}</td>
                                    <td>{formatUTCDate(test.start_time)} </td>
                                    <td>{test.duration} minutes</td>
                                    <td>
                                        <Badge bg={
                                            new Date() < new Date(test.start_time)
                                                ? 'warning'
                                                : new Date() < new Date(new Date(test.start_time).getTime() + test.duration * 60000)
                                                    ? 'success'
                                                    : 'secondary'
                                        }>
                                            {new Date() < new Date(test.start_time)
                                                ? 'Upcoming'
                                                : new Date() < new Date(new Date(test.start_time).getTime() + test.duration * 60000)
                                                    ? 'Active'
                                                    : 'Completed'}
                                        </Badge>
                                    </td>
                                    <td>
                                        <Button
                                            as={Link}
                                            to={`/tests/${test.id}/questions`}
                                            variant="info"
                                            size="sm"
                                        >
                                            Manage Questions
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </div>
        </div>
    );
}

export default TestManagement;

