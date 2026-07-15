import { useState, useEffect, Component } from 'react';
import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import StudentLogin from './pages/StudentLogin';
import StudentDashboard from './pages/StudentDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#003366',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Arial, sans-serif',
          textAlign: 'center',
          padding: '40px'
        }}>
          <h1 style={{ fontSize: '24px', margin: '0 0 8px 0' }}>NAMATL STUDENT E-VOTING</h1>
          <hr style={{ width: '60%', border: 'none', borderTop: '2px solid #FFD700', margin: '12px auto' }} />
          <h2 style={{ color: '#dc2626', margin: '20px 0 8px 0' }}>APPLICATION ERROR</h2>
          <p style={{ color: '#ccc', fontSize: '14px', margin: '0 0 16px 0' }}>
            {this.state.error && this.state.error.message ? this.state.error.message : 'Unknown error occurred'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null, errorInfo: null });
              window.location.hash = '#/';
              window.location.reload();
            }}
            style={{
              padding: '10px 24px',
              background: 'white',
              color: '#dc2626',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              marginTop: '12px'
            }}
          >
            Reset and Go Home
          </button>
          <p style={{ color: '#666', fontSize: '11px', marginTop: '24px' }}>
            Check browser console (F12) for full details
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#003366',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '24px', margin: '0 0 8px 0' }}>NAMATL STUDENT E-VOTING</h1>
      <hr style={{ width: '60%', border: 'none', borderTop: '2px solid #FFD700', margin: '12px auto' }} />
      <div style={{
        border: '4px solid #FFD700',
        borderTop: '4px solid transparent',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        animation: 'spin 1s linear infinite',
        margin: '20px auto'
      }}></div>
    </div>
  );
}

function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#003366',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center',
      padding: '40px'
    }}>
      <h1 style={{ fontSize: '28px', margin: '0 0 12px 0' }}>ERROR 404: Page Not Found</h1>
      <p style={{ color: '#ccc', margin: '0 0 24px 0' }}>The page you requested does not exist.</p>
      <a
        href="#/"
        style={{
          padding: '10px 24px',
          background: '#2563eb',
          color: 'white',
          borderRadius: '4px',
          fontWeight: 'bold',
          textDecoration: 'none'
        }}
      >
        Go Home
      </a>
    </div>
  );
}

function AppContent() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/student-login" element={<StudentLogin />} />
      <Route path="/student" element={<StudentDashboard />} />
      {/* Admin login is on a HIDDEN route - no public link to it */}
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;
