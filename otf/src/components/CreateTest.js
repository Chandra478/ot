import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import axios from '../config/axios'; // Adjust the import path as necessary
import { toast } from 'react-hot-toast';

function CreateTest() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        class: 'Class 1',
        start_time: '',
        duration: 30
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('/tests', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            toast.success('Test created successfully!');
            navigate(`/tests/${response.data.id}/questions`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create test');
            toast.error('Failed to create test');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Container className="py-4">
            <h2>Create New Test</h2>
            
            {error && <Alert variant="danger" className="my-3">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Test Title</Form.Label>
                    <Form.Control
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Description (Optional)</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Class</Form.Label>
                            <Form.Select
                                name="class"
                                value={formData.class}
                                onChange={handleChange}
                                required
                            >
                                {[...Array(12)].map((_, i) => (
                                    <option key={i+1} value={`Class ${i+1}`}>
                                        Class {i+1}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Duration (minutes)</Form.Label>
                            <Form.Control
                                type="number"
                                name="duration"
                                min="1"
                                value={formData.duration}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Form.Group className="mb-4">
                    <Form.Label>Start Time</Form.Label>
                    <Form.Control
                        type="datetime-local"
                        name="start_time"
                        value={formData.start_time}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>

                <div className="d-grid gap-2">
                    <Button 
                        variant="primary" 
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Creating...' : 'Create Test'}
                    </Button>
                </div>
            </Form>
        </Container>
    );
}

export default CreateTest;
