import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import StudentLogin from './pages/StudentLogin';
import StudentDashboard from './pages/StudentDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

function App() {
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
        </div>
      } />
    </Routes>
  );
}

export default App;
