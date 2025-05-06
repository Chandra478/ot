import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function TestInterface() {
  const { testId } = useParams();
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const fetchTest = async () => {
      const res = await axios.get(`/api/tests/${testId}`);
      setTest(res.data);
      setTimeLeft(res.data.duration * 60);
    };

    fetchTest();

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
  }, []);

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    await axios.post('/api/submit-test', {
      testId,
      answers
    });
    // Redirect to results
  };

  return (
    <div>
      <h2>{test?.title}</h2>
      <div>Time Left: {Math.floor(timeLeft/60)}:{timeLeft%60}</div>
      <div className="timer-alert" style={{
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '10px 20px',
    borderRadius: '5px',
    background: timeLeft > 300 ? '#d4edda' : '#fff3cd'
}}>
    <strong>Time Remaining:</strong> {formatTime(timeLeft)}
</div>
      {test?.questions.map((q, index) => (
        <div key={q.id}>
          <h4>{index + 1}. {q.question}</h4>
          {q.options.map((opt, i) => (
            <div key={i}>
              <input 
                type="radio" 
                name={`question-${q.id}`} 
                onChange={() => handleAnswer(q.id, opt)}
              />
              {opt}
            </div>
          ))}
        </div>
      ))}
      
      <button onClick={handleSubmit}>Submit Test</button>
    </div>
  );
}