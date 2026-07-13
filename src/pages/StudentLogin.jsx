import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function StudentLogin() {
  const [authMode, setAuthMode] = useState('signup');
  const [form, setForm] = useState({ name: '', matric: '', level: '' });
  const [loginForm, setLoginForm] = useState({ matric: '' });
  const navigate = useNavigate();

  const handleSignup = () => {
    if (!form.name || !form.matric || !form.level) {
      alert('Please fill all fields');
      return;
    }
    try {
      const students = JSON.parse(localStorage.getItem('students')) || [];
      if (students.find(s => s.matric === form.matric)) {
        alert('Matric Number already registered. Please Login.');
        setAuthMode('login');
        return;
      }
      const newStudent = { ...form, hasVoted: false };
      localStorage.setItem('students', JSON.stringify([...students, newStudent]));
      localStorage.setItem('studentInfo', JSON.stringify(newStudent));
      localStorage.setItem('voted', 'false');
      navigate('/student');
    } catch (e) {
      alert('ERROR: Could not save to localStorage: ' + e.message);
    }
  };

  const handleLogin = () => {
    if (!loginForm.matric) {
      alert('Please fill Matric Number');
      return;
    }
    try {
      const students = JSON.parse(localStorage.getItem('students')) || [];
      const foundStudent = students.find(s => s.matric === loginForm.matric);
      if (!foundStudent) {
        alert('Matric Number not found. Please Register.');
        return;
      }
      localStorage.setItem('studentInfo', JSON.stringify(foundStudent));
      navigate('/student');
    } catch (e) {
      alert('ERROR: Could not read localStorage: ' + e.message);
    }
  };

  const pageStyle = { minHeight: '100vh', background: '#003366', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', fontFamily: 'Arial, sans-serif' };
  const cardStyle = { background: 'white', padding: '32px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' };
  const inputStyle = { width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '12px', boxSizing: 'border-box' as 'border-box', fontSize: '14px' };
  const btnStyle = { width: '100%', padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' };
  const linkStyle = { color: '#2563eb', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#003366', marginBottom: '8px' }}>
          {authMode === 'signup' ? 'Student Registration' : 'Student Login'}
        </h1>
        <p style={{ color: '#666', marginBottom: '24px' }}>
          {authMode === 'signup' ? 'Create account to continue' : 'Login with your Matric Number'}
        </p>

        {authMode === 'signup' ? (
          <div>
            <input type="text" placeholder="Full Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} style={inputStyle} />
            <input type="text" placeholder="Matric Number" value={form.matric} onChange={(e) => setForm({...form, matric: e.target.value})} style={inputStyle} />
            <input type="text" placeholder="Level (e.g. 200)" value={form.level} onChange={(e) => setForm({...form, level: e.target.value})} style={inputStyle} />
            <button onClick={handleSignup} style={btnStyle}>Register</button>
            <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px' }}>
              Already have an account?{' '}
              <button onClick={() => setAuthMode('login')} style={linkStyle}>Login</button>
            </p>
          </div>
        ) : (
          <div>
            <input type="text" placeholder="Matric Number" value={loginForm.matric} onChange={(e) => setLoginForm({...loginForm, matric: e.target.value})} style={{...inputStyle, marginBottom: '16px'}} />
            <button onClick={handleLogin} style={btnStyle}>Login</button>
            <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px' }}>
              Don't have an account?{' '}
              <button onClick={() => setAuthMode('signup')} style={linkStyle}>Register</button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
