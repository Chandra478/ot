import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './components/Login';
import { Container } from 'react-bootstrap';
import Register from './components/Register';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import TestManagement from './components/TestManagement';
import CreateTest from './components/CreateTest';
import PrivateRoute from './components/PrivateRoute';
import QuestionManagement from './components/QuestionManagement';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import StudentsManagement from './components/StudentsManagement';
import { Toaster } from 'react-hot-toast';
import UpcomingTests from './components/UpcomingTests';
import TestInfo from './components/TestInfo';
import TestInterface from './components/TestInterface';
import ResultPage from './components/ResultPage';
import StudentResultsList from './components/StudentResultsList';
import StudentProfile from './components/StudentProfile';
function ProtectedRoute({ children, role }) {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route index element={<Login />} />
        <Route path="login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/tests" element={<ProtectedRoute role="admin"><TestManagement /></ProtectedRoute>} />
            <Route path="/admin/students" element={<ProtectedRoute role="admin"><StudentsManagement /></ProtectedRoute>} />
            <Route path="/admin/tests/create" element={<ProtectedRoute role="admin"><CreateTest /></ProtectedRoute>} />
            <Route path="/tests/:testId/questions" element={<ProtectedRoute role="admin"><QuestionManagement /></ProtectedRoute>} />
            <Route path="/student/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
            <Route path="/student/upcoming-tests" element={<ProtectedRoute role="student"><UpcomingTests /></ProtectedRoute>} />
            <Route path="/test-info/:testId" element={<ProtectedRoute><TestInfo /></ProtectedRoute>} />
            <Route path="/test/:testId" element={<ProtectedRoute role="student"><TestInterface /></ProtectedRoute>} />
            <Route path="student/results/:resultId" element={<ProtectedRoute role="student"><ResultPage /></ProtectedRoute>} />
            <Route path="student/results/" element={<ProtectedRoute role="student"><StudentResultsList /></ProtectedRoute>} />
            <Route path="student/profile" element={<ProtectedRoute role="student"><StudentProfile /></ProtectedRoute>} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

