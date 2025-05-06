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
import QuestionManagement from './components/QuestionManagement'; // Ensure you have this component
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';

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
      <Routes>
        <Route index element={<Login />} />
        <Route path="login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/tests"
              element={
                <ProtectedRoute role="admin">
                  <TestManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/tests/create"
              element={
                <ProtectedRoute role="admin">
                  <CreateTest />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tests/:testId/questions"
              element={
                <ProtectedRoute role="admin">
                  <QuestionManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

