import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Table, Button, Modal, Form, Row, Col, Alert, Spinner, Badge } from 'react-bootstrap';
import axios from '../config/axios';
import { toast } from 'react-hot-toast';

function QuestionManagement() {
    const { testId } = useParams();
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [test, setTest] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState('');
    const [topic, setTopic] = useState('');
    const [difficulty, setDifficulty] = useState('easy');
    const [pagination, setPagination] = useState({});
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const [testRes, questionsRes] = await Promise.all([
                    axios.get(`admin/tests/${testId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }),
                    axios.get(`/tests/${testId}/questions?page=${currentPage}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }),
                ]);
                setTest(testRes.data);
                setQuestions(questionsRes.data.data);
                setPagination(questionsRes.data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load data');
                setLoading(false);
            }
        };
        fetchData();
    }, [testId, currentPage]);

    const goToNextPage = () => {
        if (pagination.next_page_url) {
            setCurrentPage((prev) => prev + 1);
        }
    };

    const goToPrevPage = () => {
        if (pagination.prev_page_url) {
            setCurrentPage((prev) => prev - 1);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            question: formData.get('question'),
            options: [
                formData.get('option1'),
                formData.get('option2'),
                formData.get('option3'),
                formData.get('option4')
            ],
            correct_answer: formData.get('correct_answer')
        };

        try {
            if (currentQuestion) {
                await axios.put(`/tests/${testId}/questions/${currentQuestion.id}`, data, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
            } else {
                data.correct_answer = formData.get('option' + formData.get('correct_answer'));
                await axios.post(`/tests/${testId}/questions`, data, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
            }
            setShowModal(false);
            refreshQuestions();
        } catch (err) {
            setError(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            await axios.post(`/tests/${testId}/generate-questions`, { topic, difficulty, testId }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            toast.success('Questions generated successfully', {
                position: 'top-center',
                duration: 3000,
            });
            setShowGenerateModal(false);
            refreshQuestions();
        } catch (err) {
            setError(err.response?.data?.message || 'Generation failed');
        } finally {
            setGenerating(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this question?')) {
            await axios.delete(`/tests/${testId}/questions/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            refreshQuestions();
        }
    };

    const refreshQuestions = async () => {
        const res = await axios.get(`/tests/${testId}/questions`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
        setQuestions(res.data.data);
    };

    if (loading) return <Spinner animation="border" />;

    return (
        <Container className="py-4">
            {error && <Alert variant="danger">{error}</Alert>}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>
                    Questions for: {test?.title}
                    <Badge bg="secondary" className="ms-2">{test?.class}</Badge>
                </h2>
                <div>
                    <Button variant="primary" onClick={() => {
                        setCurrentQuestion(null);
                        setShowModal(true);
                    }} className="me-2">
                        Add Question
                    </Button>
                    <Button variant="success" onClick={() => setShowGenerateModal(true)}>
                        Generate Questions
                    </Button>
                </div>
            </div>

            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Question</th>
                        <th>Options</th>
                        <th>Correct Answer</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {questions.map((q, index) => (
                        <tr key={q.id}>
                            <td>{index + 1}</td>
                            <td>{q.question}</td>
                            <td>
                                <ol>
                                    {q.options.map((opt, i) => (
                                        <li key={i}>{opt}</li>
                                    ))}
                                </ol>
                            </td>
                            <td>{q.correct_answer}</td>
                            <td>
                                <Button
                                    variant="info"
                                    size="sm"
                                    onClick={() => {
                                        setCurrentQuestion(q);
                                        setShowModal(true);
                                    }}
                                    className="me-2"
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleDelete(q.id)}
                                >
                                    Delete
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <nav aria-label="Page navigation example">
                <ul className="pagination">
                    <li className="page-item">
                        <Button variant="light" onClick={goToPrevPage} disabled={!pagination.prev_page_url}>
                            Previous
                        </Button>
                    </li>
                    <li className="page-item active">
                        <span className="page-link">
                            Page {pagination.current_page}
                        </span>
                    </li>
                    <li className="page-item">
                        <Button variant="light" onClick={goToNextPage} disabled={!pagination.next_page_url}>
                            Next
                        </Button>
                    </li>
                </ul>
            </nav>
            {/* Add/Edit Question Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{currentQuestion ? 'Edit Question' : 'Add New Question'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Question</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="question"
                                defaultValue={currentQuestion?.question || ''}
                                required
                            />
                        </Form.Group>

                        <Row>
                            {[1, 2, 3, 4].map(num => (
                                <Col md={6} key={num}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Option {num}</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name={`option${num}`}
                                            defaultValue={currentQuestion?.options?.[num - 1] || ''}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                            ))}
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Correct Answer</Form.Label>
                            <Form.Select
                                name="correct_answer"
                                defaultValue={currentQuestion?.correct_answer || ''}
                                required
                            >
                                <option value="">Select correct answer</option>
                                {[1, 2, 3, 4].map(num => (
                                    <option
                                        key={num}
                                        value={currentQuestion?.options?.[num - 1] || num}
                                    >
                                        Option {num}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Button type="submit" variant="primary">
                            {currentQuestion ? 'Update' : 'Save'}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Generate Questions Modal */}
            <Modal show={showGenerateModal} onHide={() => setShowGenerateModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Generate Questions</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Topic</Form.Label>
                            <Form.Control
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Number of Questions</Form.Label>
                            <Form.Control
                                type="text"
                                min="1"
                                max="20"
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Button variant="success" onClick={handleGenerate} disabled={generating}>
                            {generating ? <Spinner animation="border" size="sm" /> : 'Generate'}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
}

export default QuestionManagement;
