import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Table, Button, Badge } from 'react-bootstrap';
import axios from 'axios';

function TestManagement() {
    const [tests, setTests] = useState([]);

    useEffect(() => {
        const fetchTests = async () => {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:8000/api/tests', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setTests(res.data.data);
        };
        fetchTests();
    }, []);

    return (
        <div>
            <h2>Tests <Button as={Link} to="/admin/tests/create">Create New</Button></h2>
            
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Class</th>
                        <th>Questions</th>
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
                            <td>
                                <Badge bg={new Date(test.start_time) > new Date() ? 'warning' : 'success'}>
                                    {new Date(test.start_time) > new Date() ? 'Upcoming' : 'Active'}
                                </Badge>
                            </td>
                            <td>
                                <Button as={Link} to={`/tests/${test.id}/questions`} variant="info" size="sm">
                                    Manage Questions
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
}

export default TestManagement;