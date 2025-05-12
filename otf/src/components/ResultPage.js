import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container,
  Card,
  ListGroup,
  Alert,
  Spinner,
  Badge,
  Button
} from 'react-bootstrap';
import axios from '../config/axios';
import { formatUTCDate } from '../utils/timeUtils';
// import { formatTime } from '../utils/timeUtils';


function ResultPage() {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await axios.get(`student/results/${resultId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setResultData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load result');
      } finally {
        setLoading(false);
      }
    };
    
    fetchResult();
  }, [resultId]);

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

  return (
    <Container className="py-4">
      <Card className="shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h2>{resultData.test.title} Result</h2>
          <Badge bg="info">{resultData.test.class}</Badge>
        </Card.Header>

        <Card.Body>
          {/* Result Summary */}
          <div className="mb-4 text-center">
            <h3 className="text-success">
              Score: {resultData.result.score}/{resultData.result.total_questions}
            </h3>
            <h4 className="text-muted">
              ({resultData.result.percentage}%)
            </h4>
            <p className="text-muted">
              Submitted at: {formatUTCDate(resultData.result.submitted_at)}
            </p>
          </div>

          {/* Questions Review */}
          <ListGroup variant="flush">
            {resultData.questions.map((question, index) => (
              <ListGroup.Item key={index} className="mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <h5>Question {index + 1}</h5>
                  <Badge 
                    bg={question.student_answer === question.correct_answer ? 'success' : 'danger'}
                  >
                    {question.student_answer === question.correct_answer ? 'Correct' : 'Incorrect'}
                  </Badge>
                </div>
                
                <p className="fs-5 mb-3">{question.question}</p>
                
                <div className="ms-4">
                  {question.options.map((option, i) => (
                    <div 
                      key={i}
                      className={`p-2 mb-2 rounded ${
                        option === question.correct_answer ? 'bg-success' :
                        option === question.student_answer ? 'bg-danger' : ''
                      }`}
                    >
                      {option}
                      {option === question.correct_answer && (
                        <span className="ms-2 text-success">✓ Correct Answer</span>
                      )}
                      {option === question.student_answer && option !== question.correct_answer && (
                        <span className="ms-2 text-danger">✗ Your Answer</span>
                      )}
                    </div>
                  ))}
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default ResultPage;

