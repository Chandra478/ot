import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Table, Spinner, Badge, Alert } from 'react-bootstrap';
import axios from '../config/axios'; // Adjust the import based on your axios setup

function TestRankingsPage() {
  const { testId, userId } = useParams();
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`/test-results/${testId}`)
      .then(response => {
        setRankings(response.data);
        setLoading(false);
      })
      .catch(error => {
        setError(error.response?.data?.message || 'Error fetching rankings');
        setLoading(false);
      });
  }, [testId]);

  if (loading) return (
    <div className="container text-center my-5">
      <Spinner animation="border" />
    </div>
  );

  if (error) return (
    <div className="container my-5">
      <Alert variant="danger">{error}</Alert>
    </div>
  );

  return (
    <div className="container py-4">
      <div
        className="shadow-lg rounded-4 p-4"
        style={{
          background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)',
          color: '#222',
          marginBottom: 32,
          // maxWidth: 700,
          marginLeft: 'auto',
          marginRight: 'auto'
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">Test Rankings</h2>
          <Badge bg="info" className="fs-6">Test ID: {testId}</Badge>
        </div>
        <Table striped bordered hover responsive style={{ color: '#222' }}>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Student Name</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {rankings.map((result, index) => {
              const isCurrentUser = String(result.user_id) === String(userId);
              return (
                <tr key={result.user_id} className={isCurrentUser ? '' : undefined}>
                  <td>
                    {isCurrentUser ? (
                      <Badge bg="success" className="fs-6">{index + 1}</Badge>
                    ) : index + 1}
                  </td>
                  <td style={isCurrentUser ? { fontWeight: 'bold', color: '#185a9d' } : {}}>
                    {result.user.name}
                    {isCurrentUser && (
                      <Badge bg="success" className="ms-2">You</Badge>
                    )}
                  </td>
                  <td style={isCurrentUser ? { fontWeight: 'bold' } : {}}>
                    {result.score}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

export default TestRankingsPage;

