import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import StudentLogin from './pages/StudentLogin';
import StudentDashboard from './pages/StudentDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Support from './pages/Support';
import { DataChargeProvider } from './context/DataChargeContext';

function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#003366',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      color: '#FFD700',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        border: '4px solid rgba(255, 215, 0, 0.3)',
        borderTop: '4px solid #FFD700',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '16px'
      }}></div>
      <p>Loading NAMATL E-Voting Portal v2.0...</p>
    </div>
  );
}

function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#003366',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#FFD700', fontSize: '4rem', margin: '0' }}>ERROR 404</h1>
      <p style={{ fontSize: '1.2rem', margin: '8px 0 24px' }}>Page not found</p>
      <a
        href="/#/"
        style={{
          padding: '12px 32px',
          background: '#FFD700',
          color: '#003366',
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

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <DataChargeProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/support" element={<Support />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </DataChargeProvider>
  );
}

export default App;