import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Container, Navbar, Nav, Button, Offcanvas } from 'react-bootstrap';
import { useState } from 'react';
import { FiLogOut, FiMenu, FiHome, FiUsers, FiFileText, FiClock } from 'react-icons/fi';
import './Layout.css'; // Create this CSS file

const Layout = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const Sidebar = () => (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Online Test System</h3>
      </div>
      <Nav className="flex-column">
        {user?.role === 'admin' ? (
          <>
            <Nav.Link as={Link} to="/admin/dashboard">
              <FiHome className="me-2" /> Dashboard
            </Nav.Link>
            <Nav.Link as={Link} to="/admin/tests">
              <FiFileText className="me-2" /> Manage Tests
            </Nav.Link>
            <Nav.Link as={Link} to="/admin/students">
              <FiUsers className="me-2" /> Manage Students
            </Nav.Link>
          </>
        ) : (
          <>
            <Nav.Link as={Link} to="/student">
              <FiHome className="me-2" /> Dashboard
            </Nav.Link>
            <Nav.Link as={Link} to="/student/upcoming-tests">
              <FiClock className="me-2" /> Upcoming Tests
            </Nav.Link>
            <Nav.Link as={Link} to="/student/results">
              <FiFileText className="me-2" /> Results
            </Nav.Link>
          </>
        )}
      </Nav>
    </div>
  );

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" className="header">
        <Container fluid>
          <Button variant="dark" onClick={() => setShowSidebar(!showSidebar)}>
            <FiMenu size={24} />
          </Button>
          <Navbar.Brand className="ms-3">Online Test System</Navbar.Brand>
          <div className="d-flex align-items-center">
            <span className="text-light me-3">Welcome, {user?.name}</span>
            <Button variant="outline-light" onClick={handleLogout}>
              <FiLogOut className="me-2" /> Logout
            </Button>
          </div>
        </Container>
      </Navbar>

      <div className="main-content">
        <Sidebar />
        <div className="content-wrapper">
          <Container fluid>
            <Outlet />
          </Container>
        </div>
      </div>
    </>
  );
};

export default Layout;
