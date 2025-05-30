import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Container, Navbar, Nav, Button, Offcanvas } from 'react-bootstrap';
import { useState } from 'react';
import { FiLogOut, FiMenu, FiHome, FiUsers, FiFileText, FiClock, FiUser , FiCompass,FiLock} from 'react-icons/fi';

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
      <Navbar
        expand="lg"
        className="fixed-top"
        style={{
          background: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)', // match index.html
          boxShadow: '0 2px 12px rgba(24,90,157,0.08)'
        }}
        variant="dark"
      >
        <Container fluid>
          <Button
            variant="dark"
            onClick={() => setShowSidebar(!showSidebar)}
            className="d-lg-none"
          >
            <FiMenu size={24} />
          </Button>
          <Navbar.Brand className="ms-3 fw-bold" style={{ letterSpacing: 1 }}>
            <img
              src="/eexam2.png"
              alt="Logo"
              style={{
                width: 36,
                height: 36,
                objectFit: 'cover',
                borderRadius: '50%',
                border: '2px solid #43cea2',
                marginRight: 10,
                background: '#fff'
              }}
            />
            Online Test System
          </Navbar.Brand>
          <div className="d-flex align-items-center">
            <span className=" me-3" style={{ color: '#fff' }}>Welcome, {user?.name}</span>
            <Button variant="outline-light" onClick={handleLogout}>
              <FiLogOut className="me-2" /> Logout
            </Button>
          </div>
        </Container>
      </Navbar>

      {/* Sidebar and Main Content */}
      <div className="d-flex" style={{ paddingTop: '70px' }}>
        {/* Sidebar - Offcanvas for mobile, regular sidebar for desktop */}
        <Offcanvas
          show={showSidebar}
          onHide={() => setShowSidebar(false)}
          responsive="lg"
          placement="start"
          className="border-end"
          style={{
            width: '250px',
            background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)', // keep sidebar light for contrast
            borderTopRightRadius: '1rem',
            borderBottomRightRadius: '1rem',
            boxShadow: '2px 0 12px rgba(24,90,157,0.08)'
          }}
        >
          <Offcanvas.Header closeButton className="d-lg-none">
            <Offcanvas.Title>Online Test System</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className="p-3">
            <Nav className="flex-column">
              {user?.role === 'admin' ? (
                <>
                  <Nav.Link as={Link} to="/admin/dashboard" className="mb-2 rounded sidebar-link">
                    <FiHome className="me-2" /> Dashboard
                  </Nav.Link>
                  <Nav.Link as={Link} to="/admin/tests" className="mb-2 rounded sidebar-link">
                    <FiFileText className="me-2" /> Manage Tests
                  </Nav.Link>
                  <Nav.Link as={Link} to="/admin/students" className="mb-2 rounded sidebar-link">
                    <FiUsers className="me-2" /> Manage Students
                  </Nav.Link>
                   <Nav.Link as={Link} to="/admin/students" className="mb-2 rounded sidebar-link">
                    <FiLock className="me-2" /> Change Password
                  </Nav.Link>
                </>
              ) : (
                <>
                  <Nav.Link as={Link} to="/student/dashboard" className="mb-2 rounded sidebar-link">
                    <FiHome className="me-2" /> Dashboard
                  </Nav.Link>
                  <Nav.Link as={Link} to="/student/upcoming-tests" className="mb-2 rounded sidebar-link">
                    <FiClock className="me-2" /> Upcoming Tests
                  </Nav.Link>
                  <Nav.Link as={Link} to="/student/results" className="mb-2 rounded sidebar-link">
                    <FiFileText className="me-2" /> Results
                  </Nav.Link>
                  <Nav.Link as={Link} to="/student/profile" className="mb-2 rounded sidebar-link">
                    <FiUser className="me-2" /> Profile
                  </Nav.Link>
                </>
              )}
            </Nav>
          </Offcanvas.Body>
        </Offcanvas>

        {/* Main Content */}
        <main className="flex-grow-1 ">
          <Container fluid>
            <Outlet />
          </Container>
        </main>
      </div>

      {/* Custom CSS for sidebar and active links */}
      <style>{`
        .fixed-top {
          height: 70px;
        }
        .sidebar-link {
          color: #185a9d !important;
          font-weight: 500;
          transition: all 0.2s;
        }
        .sidebar-link.active, .sidebar-link:focus, .sidebar-link:hover {
          background: linear-gradient(90deg, #43cea2 0%, #185a9d 100%);
          color: #fff !important;
        }
        .offcanvas {
          border-right: none !important;
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
