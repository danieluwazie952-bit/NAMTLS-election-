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
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'Arial, sans-serif',
          padding: '32px',
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '28px', marginBottom: '16px' }}>NAMATL STUDENT E-VOTING</h1>
          <hr style={{ width: '80px', border: '2px solid #FFD700', marginBottom: '24px' }} />
          <h2 style={{ color: '#ef4444' }}>APPLICATION ERROR</h2>
          <p style={{ margin: '16px 0', color: '#ccc' }}>
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
          <p style={{ marginTop: '16px', fontSize: '11px', color: '#666' }}>
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
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      padding: '32px',
      textAlign: 'center'
    }}>
      <div>
        <h1 style={{ fontSize: '36px', marginBottom: '16px' }}>NAMATL STUDENT E-VOTING</h1>
        <hr style={{ width: '80px', border: '2px solid #FFD700', margin: '0 auto 24px auto' }} />
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#003366',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      padding: '32px',
      textAlign: 'center'
    }}>
      <h1 style={{ color: '#ef4444', marginBottom: '12px' }}>ERROR 404: Page Not Found</h1>
      <p style={{ marginBottom: '20px', color: '#ccc' }}>The page you requested does not exist.</p>
      <a
        href="#/"
        style={{
          padding: '10px 24px',
          background: '#2563eb',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '4px',
          fontWeight: 'bold'
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
      <Route path="/admin" element={<AdminLogin />} />
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
