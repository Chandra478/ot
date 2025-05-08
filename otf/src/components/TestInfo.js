import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container,
  Card,
  Alert,
  Button,
  Spinner,
  Badge,
  ListGroup
} from 'react-bootstrap';
import axios from '../config/axios'; // Adjust the import based on your axios setup
import { formatUTCDate, getUTCTimeRemaining } from '../utils/timeUtils';

function TestInfo() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [hasAttempted, setHasAttempted] = useState(false);

  useEffect(() => {
    const fetchTestInfo = async () => {
      try {
        const response = await axios.get(`/student/tests/${testId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        setTest(response.data.test);
        setHasAttempted(response.data.has_attempted);
        
        if (response.data.time_remaining) {
          setTimeRemaining(response.data.time_remaining);
        }
        
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load test details');
      } finally {
        setLoading(false);
      }
    };

    fetchTestInfo();
  }, [testId]);

  useEffect(() => {
    if (!test || hasAttempted) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [test, hasAttempted]);

  const handleStartTest = () => {
    navigate(`/test/${testId}`);
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
        <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
      </Container>
    );
  }

  const testStartTime = new Date(test.start_time);
  const testEndTime = new Date(testStartTime.getTime() + test.duration * 60000);
  const currentUTCTime = new Date().toISOString();
  const isTestActive = currentUTCTime >= test.start_time && currentUTCTime <= testEndTime.toISOString();
  const isTestCompleted = currentUTCTime > testEndTime.toISOString();

  return (
    <Container className="py-4">
      <Card className="shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h2>{test.title}</h2>
          <Badge bg="info" className="fs-6">
            {test.class}
          </Badge>
        </Card.Header>

        <Card.Body>
          {/* Test Status Alert */}
          {hasAttempted ? (
            <Alert variant="success" className="d-flex align-items-center gap-2">
              You've already completed this test
            </Alert>
          ) : isTestCompleted ? (
            <Alert variant="danger" className="d-flex align-items-center gap-2">
              This test has ended
            </Alert>
          ) : (
            <Alert variant={isTestActive ? 'success' : 'warning'} className="d-flex align-items-center gap-2">
              {isTestActive ? (
                <>
                  Test is active! Time remaining: {getUTCTimeRemaining(timeRemaining)}
                </>
              ) : (
                <>
                  Test starts in: {getUTCTimeRemaining(timeRemaining)}
                </>
              )}
            </Alert>
          )}

          {/* Test Details */}
          <ListGroup variant="flush" className="mb-4">
            <ListGroup.Item>
              <strong>Start Time:</strong> {formatUTCDate(test.start_time)}
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>Duration:</strong> {test.duration} minutes
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>Total Questions:</strong> {test.questions_count}
            </ListGroup.Item>
            {test.description && (
              <ListGroup.Item>
                <strong>Description:</strong> {test.description}
              </ListGroup.Item>
            )}
          </ListGroup>

          {/* Start Test Button */}
          {!hasAttempted && isTestActive && !isTestCompleted && (
            <div className="d-grid">
              <Button
                variant="primary"
                size="lg"
                onClick={handleStartTest}
              >
                Start Test Now
              </Button>
            </div>
          )}

          {/* Completed Test Message */}
          {isTestCompleted && (
            <Alert variant="info" className="mt-4">
              Test ended at {formatUTCDate(testEndTime)}
            </Alert>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

export default TestInfo;