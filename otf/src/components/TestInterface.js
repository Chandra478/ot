import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container,
  Card,
  Alert,
  Button,
  Form,
  Spinner,
  ProgressBar,
  Badge
} from 'react-bootstrap';
import axios from '../config/axios'; // Adjust the import based on your axios setup
import { formatTime } from '../utils/timeUtils';

function TestInterface() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch test data and initialize timer
  useEffect(() => {
    const fetchTestData = async () => {
      try {
        const response = await axios.get(`/tests/${testId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (response.data.has_attempted) {
          navigate(`student/results/${testId}`);
          return;
        }

        setTest(response.data.test);
        setTimeLeft(response.data.time_remaining);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load test');
      } finally {
        setLoading(false);
      }
    };

    fetchTestData();
  }, [testId, navigate]);

  // Handle countdown timer
  useEffect(() => {
    if (timeLeft <= 0 || submitting) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitting]);

  // Handle answer selection
  const handleAnswer = (questionId, option) => {
    if (!submitting) {
      setAnswers(prev => ({
        ...prev,
        [questionId]: option
      }));
    }
  };

  // Submit test answers
  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const response = await axios.post(
        `/tests/${testId}/submit`,
        { answers },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      navigate(`student/results/${response.data.result_id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
      setSubmitting(false);
    }
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
        <Button onClick={() => navigate('student/dashboard')}>Back to Dashboard</Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Card className="shadow-lg">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h2>{test.title}</h2>
          <Badge bg="danger" className="fs-6">
            Time Left: {formatTime(timeLeft)}
          </Badge>
        </Card.Header>

        <Card.Body>
          <ProgressBar 
            now={(timeLeft / (test.duration * 60)) * 100}
            variant="warning"
            animated
            className="mb-4"
          />

          <Form>
            {test.questions.map((question, index) => (
              <Card key={question.id} className="mb-4">
                <Card.Header>Question {index + 1}</Card.Header>
                <Card.Body>
                  <p className="fs-5 mb-3">{question.question}</p>
                  <div className="ms-4">
                    {question.options.map((option, i) => (
                      <Form.Check
                        key={i}
                        type="radio"
                        id={`q-${question.id}-${i}`}
                        name={`question-${question.id}`}
                        label={option}
                        checked={answers[question.id] === option}
                        onChange={() => handleAnswer(question.id, option)}
                        disabled={submitting}
                        className="mb-2"
                      />
                    ))}
                  </div>
                </Card.Body>
              </Card>
            ))}
          </Form>

          <div className="d-grid mt-4">
            <Button
              size="lg"
              variant={submitting ? 'secondary' : 'primary'}
              onClick={handleSubmit}
              disabled={submitting || timeLeft <= 0}
            >
              {submitting ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    className="me-2"
                  />
                  Submitting...
                </>
              ) : 'Submit Test'}
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default TestInterface;