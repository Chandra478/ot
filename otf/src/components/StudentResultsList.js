import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Table, Spinner, Alert } from 'react-bootstrap';
import axios from '../config/axios'; // Adjust the import based on your axios setup

function StudentResultsList() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await axios.get('/student/results', {
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
    <div>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Test Title</th>
            <th>Submitted At</th>
            <th>Score</th>
            <th>Rank</th>
            <th>Percentage</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="6" className="text-center">
                <Spinner animation="border" />
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan="6" className="text-center">
                <Alert variant="danger">{error}</Alert>
              </td>
            </tr>
          ) : results.map((result, index) => (
            <tr key={result.id}>
              <td>{index + 1}</td>
              <td>{result.test_title}</td>
              <td>{new Date(result.submitted_at).toLocaleString()}</td>
              <td>{result.score}/{result.total_questions}</td>
              <td>
                <span className={`badge bg-${result.rank === 1 ? 'success' : result.rank <= 3 ? 'warning' : 'danger'}`}>
                  {result.rank}
                </span>
              </td>
              <td>
                <span className={`badge bg-${getScoreColor(result.percentage)}`}>
                  {result.percentage}%
                </span>
              </td>
              <td>
                <Link to={`/student/results/${result.id}`} className="btn btn-sm btn-primary ">
                  View
                </Link> 
                {' '}
                <Link to={`/student/test-rankings/${result.test_id}/${result.user_id}`} className="btn btn-sm btn-primary">
                  View Rankings
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default StudentResultsList;
