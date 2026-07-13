import { Routes, Route } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin';
import Landing from './pages/Landing';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import StudentLogin from './pages/StudentLogin';
import Watermark from './components/Watermark';

console.log('ROUTES_LOADED: Setting up routes...');

function App() {
  return (
    <>
      <Watermark />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </>
  );
}

export default App;
