import { useState, useEffect } from 'react';
import { Card, Spinner, Alert, Badge, Image, Form, Button } from 'react-bootstrap';
import axios from '../config/axios';
import { toast, Toaster } from 'react-hot-toast';

function StudentProfile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        email: '',
        class: '',
        avatar: null,
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get('/student/profile', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setProfile(response.data);
                setFormData({
                    id: response.data.id,
                    name: response.data.name,
                    email: response.data.email,
                    class: response.data.class
                });
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load profile');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        setFormData({
            ...formData,
            avatar: e.target.files[0]
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formPayload = new FormData();
            formPayload.append('id', formData.id);
            formPayload.append('name', formData.name);
            formPayload.append('email', formData.email);
            formPayload.append('class', formData.class);
            if (formData.avatar) {
                formPayload.append('avatar', formData.avatar);
            }

            if (formData.oldPassword) {
                formPayload.append('oldPassword', formData.oldPassword);
                formPayload.append('newPassword', formData.newPassword);
                formPayload.append('confirmPassword', formData.confirmPassword);
            }

            const response = await axios.put('/student/profile', formPayload, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setProfile(response.data);
            setIsEditing(false);
            setError('');
            toast.success('Profile updated successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
            toast.error('Failed to update profile!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="" style={{}}>
            <Toaster />
            <Card className="border-0 shadow-lg rounded-4" style={{ background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)', color: '#185a9d' }}>
                {loading && (
                    <div className="text-center p-4">
                        <Spinner animation="border" />
                    </div>
                )}

                {error && (
                    <Alert variant="danger" className="m-3">
                        {error}
                    </Alert>
                )}

                {!loading && !error && profile && (
                    <>
                        <Card.Header className="bg-transparent border-0">
                            <div className="d-flex align-items-center gap-3">
                                <div className="profile-avatar">
                                    {!isEditing && (profile.avatar ? (
                                        <Image
                                            src={profile.avatar}
                                            roundedCircle
                                            width={100}
                                            height={100}
                                            style={{ border: '3px solid #43cea2', background: '#fff' }}
                                        />
                                    ) : (
                                        <div className="avatar-placeholder" style={{ border: '3px solid #43cea2', color: '#185a9d' }}>
                                            {profile.name[0]}
                                        </div>
                                    ))}
                                </div>
                                
                                {isEditing ? (
                                    <Form onSubmit={handleSubmit} className="flex-grow-1">
                                        <Form.Group className="mb-3 d-none">
                                            <Form.Label>ID</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="id"
                                                value={formData.id}
                                                onChange={handleInputChange}
                                                required
                                                readOnly
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label>Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label>Email</Form.Label>
                                            <Form.Control
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label>Class</Form.Label>
                                            <Form.Select
                                                name="class"
                                                value={formData.class}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                {Array.from({ length: 12 }).map((_, i) => (
                                                    <option value={i + 1} key={i + 1}>
                                                        Class {i + 1}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label>Profile Picture</Form.Label>
                                            <Form.Control
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label>Old Password</Form.Label>
                                            <Form.Control
                                                type="password"
                                                name="oldPassword"
                                                value={formData.oldPassword}
                                                onChange={handleInputChange}
                                                autoComplete="off"
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label>New Password</Form.Label>
                                            <Form.Control
                                                type="password"
                                                name="newPassword"
                                                value={formData.newPassword}
                                                onChange={handleInputChange}
                                                autoComplete="off"
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label>Confirm New Password</Form.Label>
                                            <Form.Control
                                                type="password"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleInputChange}
                                                autoComplete="off"
                                            />
                                        </Form.Group>

                                        <div className="d-flex gap-2">
                                            <Button
                                                type="submit"
                                                className="custom-btn"
                                                disabled={loading}
                                            >
                                                {loading ? 'Updating...' : 'Update Profile'}
                                            </Button>
                                            <Button
                                                className="custom-btn"
                                                style={{ background: 'linear-gradient(90deg, #185a9d 0%, #43cea2 100%)' }}
                                                onClick={() => setIsEditing(false)}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </Form>
                                ) : (
                                    <div>
                                        <h3 className="mb-2">{profile.name}</h3>
                                        <Badge bg="info" className="mb-2 custom-badge">
                                            Class {profile.class}
                                        </Badge>
                                        <div className="text-light small">
                                            <div>{profile.email}</div>
                                            <div>Member since {new Date(profile.registration_date).toLocaleDateString()}</div>
                                        </div>
                                        <Button
                                            variant="light"
                                            className="mt-3 custom-btn"
                                            onClick={() => setIsEditing(true)}
                                        >
                                            Edit Profile
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </Card.Header>
                    </>
                )}
            </Card>

            <style>{`
                .profile-avatar {
                    border: 3px solid #43cea2;
                    border-radius: 50%;
                    overflow: hidden;
                    flex-shrink: 0;
                }
                .avatar-placeholder {
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    background: #fff;
                    color: #185a9d;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 36px;
                    font-weight: bold;
                    border: 3px solid #43cea2;
                }
                .custom-badge {
                    background: linear-gradient(90deg, #43cea2 0%, #185a9d 100%);
                    color: #fff !important;
                    border-radius: 12px;
                    font-weight: 600;
                    padding: 0.5em 1em;
                }
                .custom-btn {
                    background: linear-gradient(90deg, #43cea2 0%, #185a9d 100%);
                    color: #fff !important;
                    border: none;
                    font-weight: bold;
                }
                .custom-btn:active, .custom-btn:focus, .custom-btn:hover {
                    background: linear-gradient(90deg, #185a9d 0%, #43cea2 100%);
                    color: #fff !important;
                }
                .card, .card-body, .card-header, .form-label, .form-control, .form-select, .text-light, .text-white, .btn-link {
                    color: #185a9d !important;
                }
            `}</style>
        </div>
    );
}

export default StudentProfile;

