import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import AdminLogin from './pages/AdminLogin';
import Dashboard1 from './pages/Dashboard1';
import Dashboard2 from './pages/Dashboard2';
import Dashboard3 from './pages/Dashboard3';
import logo from '../logo.png';

function Watermark() {
  return <img src={logo} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-15 w-[600px] pointer-events-none -z-10" alt="watermark"/>
}

// Protect admin routes
const RequireAdmin = ({ children }) => {
  const isAdmin = localStorage.getItem("admin") === "true";
  return isAdmin? children : <Navigate to="/admin-login" />
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="font-sans bg-white min-h-screen relative">
        <Watermark />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/vote" element={<Dashboard2 />} /> 
          <Route path="/admin-login" element={<AdminLogin />} />
          
          {/* ADMIN ONLY ROUTES */}
          <Route path="/dashboard1" element={<RequireAdmin><Dashboard1 /></RequireAdmin>} />
          <Route path="/results-admin" element={<RequireAdmin><Dashboard3 /></RequireAdmin>} />
        </Routes>
        <footer className="text-center py-4 bg-navy text-white text-sm">
          © 2026 NAMTLS Electoral Commission | Federal University of Petroleum Resources Effurun
        </footer>
      </div>
    </BrowserRouter>
  )
}
