import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Container, Navbar, Nav, Button, Offcanvas } from 'react-bootstrap';
import { useState } from 'react';
import { FiLogOut, FiMenu, FiHome, FiUsers, FiFileText, FiClock } from 'react-icons/fi';

const Layout = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <>
      {/* Header/Navbar */}
      <Navbar bg="dark" variant="dark" expand="lg" className="fixed-top">
        <Container fluid>
          <Button 
            variant="dark" 
            onClick={() => setShowSidebar(!showSidebar)}
            className="d-lg-none"
          >
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

      {/* Sidebar and Main Content */}
      <div className="d-flex" style={{ paddingTop: '60px' }}>
        {/* Sidebar - Offcanvas for mobile, regular sidebar for desktop */}
        <Offcanvas 
          show={showSidebar} 
          onHide={() => setShowSidebar(false)}
          responsive="lg"
          placement="start"
          className="border-end"
          style={{ width: '250px' }}
        >
          <Offcanvas.Header closeButton className="d-lg-none">
            <Offcanvas.Title>Online Test System</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className="p-3 bg-light">
            <Nav className="flex-column">
              {user?.role === 'admin' ? (
                <>
                  <Nav.Link as={Link} to="/admin/dashboard" className="mb-2 rounded">
                    <FiHome className="me-2" /> Dashboard
                  </Nav.Link>
                  <Nav.Link as={Link} to="/admin/tests" className="mb-2 rounded">
                    <FiFileText className="me-2" /> Manage Tests
                  </Nav.Link>
                  <Nav.Link as={Link} to="/admin/students" className="mb-2 rounded">
                    <FiUsers className="me-2" /> Manage Students
                  </Nav.Link>
                </>
              ) : (
                <>
                  <Nav.Link as={Link} to="/student/dashboard" className="mb-2 rounded">
                    <FiHome className="me-2" /> Dashboard
                  </Nav.Link>
                  <Nav.Link as={Link} to="/student/upcoming-tests" className="mb-2 rounded">
                    <FiClock className="me-2" /> Upcoming Tests
                  </Nav.Link>
                  <Nav.Link as={Link} to="/student/results" className="mb-2 rounded">
                    <FiFileText className="me-2" /> Results
                  </Nav.Link>
                </>
              )}
            </Nav>
          </Offcanvas.Body>
        </Offcanvas>

        {/* Main Content */}
        <main className="flex-grow-1 p-3">
          <Container fluid>
            <Outlet />
          </Container>
        </main>
      </div>

      {/* Minimal Custom CSS */}
      <style>{`
        .fixed-top {
          height: 60px;
        }
        .nav-link {
          transition: all 0.2s;
        }
        .nav-link:hover, .nav-link:focus {
          background-color: rgba(0, 0, 0, 0.05);
        }
        .nav-link.active {
          background-color: #0d6efd;
          color: white !important;
        }
        @media (min-width: 992px) {
          .offcanvas {
            visibility: visible;
            transform: none;
            position: static;
          }
          .offcanvas-body {
            padding: 0 !important;
          }
        }
      `}</style>
    </>
  );
};

export default Layout;