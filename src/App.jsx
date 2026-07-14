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
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#003366', color: 'white', fontFamily: 'Arial, sans-serif', padding: '32px', textAlign: 'center' }}>
          <h1 style={{ color: '#ffd700' }}>NAMATL STUDENT E-VOTING</h1>
          <div style={{ background: '#dc2626', color: 'white', padding: '24px', borderRadius: '8px', maxWidth: '500px', margin: '16px 0' }}>
            <h2>APPLICATION ERROR</h2>
            <p style={{ margin: '12px 0', fontSize: '14px' }}>{this.state.error && this.state.error.message ? this.state.error.message : 'Unknown error occurred'}</p>
            <button onClick={() => { this.setState({ hasError: false, error: null, errorInfo: null }); window.location.hash = '#/'; window.location.reload(); }}
              style={{ padding: '10px 24px', background: 'white', color: '#dc2626', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '12px' }}>
              Reset and Go Home
            </button>
          </div>
          <p style={{ fontSize: '12px', opacity: 0.7 }}>Check browser console (F12) for full details</p>
        </div>
      );
    }
    return this.props.children;
  }
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#003366', color: 'white', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', border: '4px solid #ffd700', borderTop: '4px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '0' }}>Loading NAMATL E-Voting Portal...</p>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#003366', color: 'white', fontFamily: 'Arial, sans-serif', textAlign: 'center', padding: '32px' }}>
      <h1 style={{ color: '#ffd700' }}>ERROR 404: Page Not Found</h1>
      <p>The page you requested does not exist.</p>
      <a href="#/" style={{ color: '#ffd700', marginTop: '16px', textDecoration: 'underline' }}>Go Home</a>
    </div>
  );
}

function AppContent() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/landing" element={<Landing />} />
      <Route path="/student-login" element={<StudentLogin />} />
      <Route path="/student" element={<StudentDashboard />} />
      <Route path="/admin" element={<AdminLogin />} />
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
