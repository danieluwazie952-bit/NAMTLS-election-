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
    const students = JSON.parse(localStorage.getItem('students')) || [];
    if (students.find(s => s.matric === form.matric)) {
      alert('Matric Number already registered. Please Login.');
      setAuthMode('login');
      return;
    }

    const newStudent = { ...form, hasVoted: false };
    const updatedStudents = [...students, newStudent];
    localStorage.setItem('students', JSON.stringify(updatedStudents));
    localStorage.setItem('studentInfo', JSON.stringify(newStudent));
    navigate('/student');
  };

  const handleLogin = () => {
    if (!loginForm.matric) {
      alert('Please fill Matric Number');
      return;
    }
    const students = JSON.parse(localStorage.getItem('students')) || [];
    const foundStudent = students.find(s => s.matric === loginForm.matric);
    if (!foundStudent) {
      alert('Matric Number not found. Please Register.');
      return;
    }
    localStorage.setItem('studentInfo', JSON.stringify(foundStudent));
    localStorage.setItem('voted', foundStudent.hasVoted ? 'true' : 'false');
    navigate('/student');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#003366',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        background: 'white',
        padding: '32px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#003366', marginBottom: '8px' }}>
          {authMode === 'signup' ? 'Student Registration' : 'Student Login'}
        </h1>
        <p style={{ color: '#666', marginBottom: '24px' }}>
          {authMode === 'signup' ? 'Create account to continue' : 'Login to continue'}
        </p>

        {authMode === 'signup' ? (
          <>
            <input
              type="text" placeholder="Full Name" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '12px' }}
            />
            <input
              type="text" placeholder="Matric Number" value={form.matric}
              onChange={(e) => setForm({ ...form, matric: e.target.value })}
              style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '12px' }}
            />
            <input
              type="text" placeholder="Level (e.g. 200)" value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
              style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '12px' }}
            />
            <button
              onClick={handleSignup}
              style={{ width: '100%', padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Register
            </button>
            <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px' }}>
              Already have an account?{' '}
              <button onClick={() => setAuthMode('login')} style={{ color: '#2563eb', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>Login</button>
            </p>
          </>
        ) : (
          <>
            <input
              type="text" placeholder="Matric Number" value={loginForm.matric}
              onChange={(e) => setLoginForm({ ...loginForm, matric: e.target.value })}
              style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '16px' }}
            />
            <button
              onClick={handleLogin}
              style={{ width: '100%', padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Login
            </button>
            <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px' }}>
              Don't have an account?{' '}
              <button onClick={() => setAuthMode('signup')} style={{ color: '#2563eb', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>Register</button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
