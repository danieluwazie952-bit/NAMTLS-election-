import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import Landing from './pages/Landing'
import Vote from './pages/vote'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import Dashboard1 from './pages/Dashboard1'
import Dashboard2 from './pages/Dashboard2'
import Dashboard3 from './pages/Dashboard3'
import './index.css'
import logo from './logo.png'

const firebaseConfig = {
  apiKey: "AIzaSyBwdhpv7e0Y3xNBovOpJEpRn9_jmDUOq8E",
  authDomain: "namtls-voting-2026-2027.firebaseapp.com",
  projectId: "namtls-voting-2026-2027",
  storageBucket: "namtls-voting-2026-2027.firebasestorage.app",
  messagingSenderId: "955792311858",
  appId: "1:955792311858:web:49a566b351ebab86c05e2b",
  measurementId: "G-SVDG83TZSG"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

function Watermark() {
  return <img src={logo} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-15 w-[600px] pointer-events-none -z-10" alt="watermark"/>
}

const RequireAdmin = ({ children }) => {
  const isAdmin = localStorage.getItem("admin") === "true";
  return isAdmin? children : <Navigate to="/admin-login" />
}

function App() {
  return (
    <Router basename="/">
      <div className="font-sans bg-white min-h-screen relative">
        <Watermark />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/vote" element={<Vote />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
          <Route path="/dashboard1" element={<RequireAdmin><Dashboard1 /></RequireAdmin>} /> 
          <Route path="/dashboard2" element={<RequireAdmin><Dashboard2 /></RequireAdmin>} />
          <Route path="/results-admin" element={<RequireAdmin><Dashboard3 /></RequireAdmin>} /> 
        </Routes>
        <footer className="text-center py-4 bg-blue-900 text-white text-sm">
          © 2026 NAMTLS Electoral Commission | FUPRE
        </footer>
      </div>
    </Router>
  )
}

export default App
