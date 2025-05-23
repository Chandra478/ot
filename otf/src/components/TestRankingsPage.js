import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Table, Spinner, Container } from 'react-bootstrap';
import axios from '../config/axios'; // Adjust the import based on your axios setup

function TestRankingsPage() {
  const { testId, userId } = useParams();
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
console.log('testId:', testId);
    console.log('userId:', userId);
  useEffect(() => {
    axios.get(`/test-results/${testId}`)
      .then(response => {
        setRankings(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching rankings:', error);
        setLoading(false);
      });
  }, [testId]);

  if (loading) return (
    <Container className="text-center my-5">
      <Spinner animation="border" />
    </Container>
  );

  return (
    <Container className="my-4">
      <h2 className="mb-4">Test Rankings</h2>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Student ID</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {rankings.map((result, index) => (
            <tr key={result.user_id} className={result.user_id == userId ? 'bg-dark' : ''}>
              <td> {result.user_id+' '+userId},  ---{index + 1}</td>
              <td>{result.user_id}</td>
              <td>{result.score}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default TestRankingsPage;

