import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Table, Spinner, Alert, Button } from 'react-bootstrap';
import axios from '../config/axios'; // Adjust the import based on your axios setup

function AdminResultsList() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await axios.get('/admin/results', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setResults(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load results');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  const getScoreColor = (percentage) => {
    if (percentage >= 75) return 'success';
    if (percentage >= 50) return 'warning';
    return 'danger';
  };

  return (
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
          <h2>My Results</h2>
        </div>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Test Title</th>
              <th>Submitted At</th>
              <th>Score</th>
              {/* <th>Rank</th> */}
              <th>Percentage</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center">
                  <Spinner animation="border" />
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="7" className="text-center">
                  <Alert variant="danger">{error}</Alert>
                </td>
              </tr>
            ) : results.map((result, index) => (
              <tr key={result.id}>
                <td>{index + 1}</td>
                <td>{result.test_title}</td>
                <td>{new Date(result.submitted_at).toLocaleString()}</td>
                <td>{result.score}/{result.total_questions}</td>
                {/* <td>
                  <span className={`badge bg-${result.rank === 1 ? 'success' : result.rank <= 3 ? 'warning' : 'secondary'}`}>
                    {result.rank}
                  </span>
                </td> */}
                <td>
                  <span className={`badge bg-${getScoreColor(result.percentage)}`}>
                    {result.percentage}%
                  </span>
                </td>
                <td>
                  <Button
                    as={Link}
                    to={`/admin/results/${result.id}`}
                    variant="primary"
                    size="sm"
                    className="me-2"
                  >
                    View
                  </Button>
                  {/* <Button
                    as={Link}
                    to={`/student/test-rankings/${result.test_id}/${result.user_id}`}
                    variant="info"
                    size="sm"
                  >
                    View Rankings
                  </Button> */}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

export default AdminResultsList;
