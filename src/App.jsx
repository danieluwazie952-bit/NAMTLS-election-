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
      <Route path="/student-dashboard" element={<Navigate to="/student" replace />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="*" element={
        <div style={{minHeight:'100vh',background:'#003366',color:'white',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'40px',fontFamily:'Arial,sans-serif',textAlign:'center'}}>
          <h1 style={{fontSize:'28px',marginBottom:'16px'}}>ERROR 404: Route Not Found</h1>
          <p style={{color:'#fbbf24',fontSize:'14px'}}>The page you requested does not exist.</p>
        </div>
      } />
    </Routes>
  );
}

export default App;
