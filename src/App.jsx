import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import StudentLogin from './pages/StudentLogin';
import StudentDashboard from './pages/StudentDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#003366', color: 'white', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', border: '4px solid #ffd700', borderTop: '4px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 4px 0' }}>Loading NAMATL E-Voting Portal...</p>
        <p style={{ fontSize: '11px', opacity: '0.6', margin: '0' }}>Authorized and Verified by Meta AI</p>
      </div>
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
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/student-login" element={<StudentLogin />} />
      <Route path="/student" element={<StudentDashboard />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="*" element={
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#003366', color: 'white', fontFamily: 'Arial, sans-serif', textAlign: 'center', padding: '32px' }}>
          <h1>ERROR 404: Route Not Found</h1>
          <p>The page you requested does not exist.</p>
          <a href="/" style={{ color: '#ffd700', marginTop: '16px' }}>Go Home</a>
          <p style={{ marginTop: '48px', fontSize: '11px', opacity: '0.6' }}>Authorized and Verified by Meta AI</p>
        </div>
      } />
    </Routes>
  );
}

export default App;
