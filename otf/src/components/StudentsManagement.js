import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Row, Col, Alert, Spinner, Badge, InputGroup } from 'react-bootstrap';
// import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import axios from '../config/axios';




function StudentsManagement() {
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [currentStudent, setCurrentStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [selectedClass, setSelectedClass] = useState('all');
      const [pagination, setPagination] = useState({});
        const [currentPage, setCurrentPage] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        gender: 'male',
        class: 'Class 1',
        password: ''
    });

    useEffect(() => {
        fetchData();
        fetchClasses();
    }, [currentPage, selectedClass, search]);

    const fetchData = async () => {
        try {
            const params = {
                search,
                class: selectedClass === 'all' ? null : selectedClass
            };
            const token = localStorage.getItem('token');
            const res = await axios.get(`/admin/students?page=${currentPage}`, {
                params,
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setPagination(res.data);
            setStudents(res.data.data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load students');
            setLoading(false);
        }
    };

    const fetchClasses = async () => {
        const token = localStorage.getItem('token');
        const res = await axios.get('/admin/classes', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        setClasses(res.data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentStudent) {
                const token = localStorage.getItem('token');
                await axios.put(`/admin/students/${currentStudent.id}`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                toast.success('Student updated successfully');
            } else {
                const token = localStorage.getItem('token');
                await axios.post('/admin/students', formData, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                toast.success('Student created successfully');
            }
            setShowModal(false);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Operation failed');
        }
    };
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

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            const token = localStorage.getItem('token');
            await axios.delete(`/admin/students/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            toast.success('Student deleted successfully');
            fetchData();
        }
    };

    return (
        <div className="p-4">
            <div className="d-flex justify-content-between mb-4">
                <h2>Manage Students</h2>
                <Button onClick={() => {
                    setCurrentStudent(null);
                    setFormData({
                        name: '',
                        email: '',
                        gender: 'male',
                        class: 'Class 1',
                        password: ''
                    });
                    setShowModal(true);
                }}>
                    Add New Student
                </Button>
            </div>

            <div className="mb-4 d-flex gap-3">
                <Form.Select 
                    style={{ width: '200px' }}
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                >
                    <option value="all">All Classes</option>
                    {classes.map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                    ))}
                </Form.Select>
                
                <InputGroup style={{ width: '300px' }}>
                    <Form.Control
                        placeholder="Search students..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Button variant="outline-secondary" onClick={fetchData}>
                        Search
                    </Button>
                </InputGroup>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            {loading ? (
                <Spinner animation="border" />
            ) : (
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Class</th>
                            <th>Gender</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(student => (
                            <tr key={student.id}>
                                <td>{student.name}</td>
                                <td>{student.email}</td>
                                <td>{student.class}</td>
                                <td>
                                    <Badge bg="info">{student.gender.charAt(0).toUpperCase() + student.gender.slice(1)}</Badge>
                                </td>
                                <td>
                                    <Button 
                                        variant="warning"
                                        className="me-2"
                                        onClick={() => {
                                            setCurrentStudent(student);
                                            setFormData({
                                                name: student.name,
                                                email: student.email,
                                                gender: student.gender,
                                                class: student.class,
                                                password: ''
                                            });
                                            setShowModal(true);
                                        }}
                                    >
                                        Edit
                                    </Button>
                                    <Button 
                                        variant="danger"
                                        onClick={() => handleDelete(student.id)}
                                    >
                                        Delete
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
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
            {/* Add/Edit Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{currentStudent ? 'Edit Student' : 'Add New Student'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Full Name</Form.Label>
                                    <Form.Control
                                        name="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Gender</Form.Label>
                                    <Form.Select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={(e) => setFormData({...formData, gender: e.target.value})}
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Class</Form.Label>
                                    <Form.Select
                                        name="class"
                                        value={formData.class}
                                        onChange={(e) => setFormData({...formData, class: e.target.value})}
                                    >
                                        {[...Array(12)].map((_, i) => (
                                            <option key={i+1} value={`Class ${i+1}`}>
                                                Class {i+1}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                required={!currentStudent}
                            />
                            {currentStudent && (
                                <Form.Text className="text-muted">
                                    Leave blank to keep current password
                                </Form.Text>
                            )}
                        </Form.Group>

                        <Button variant="primary" type="submit">
                            {currentStudent ? 'Update' : 'Create'}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default StudentsManagement;
