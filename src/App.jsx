import { Routes, Route } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin';
import Landing from './pages/Landing';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Watermark from './components/Watermark';

console.log('ROUTES_LOADED: Setting up routes...');

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
      </Routes>
      <Watermark />
    </>
  );
}

export default App;
