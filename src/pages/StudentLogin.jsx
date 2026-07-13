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
    localStorage.setItem('students', JSON.stringify([...students, newStudent]));
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
    navigate('/student');
  };

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-navy mb-2">
          {authMode === 'signup' ? 'Student Registration' : 'Student Login'}
        </h1>
        <p className="text-gray-600 mb-6">
          {authMode === 'signup' ? 'Create account to continue' : 'Login to continue'}
        </p>

        {authMode === 'signup' && (
          <>
            <input type="text" placeholder="Full Name" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full p-3 border rounded mb-3" />
            <input type="text" placeholder="Matric Number" value={form.matric}
              onChange={(e) => setForm({ ...form, matric: e.target.value })}
              className="w-full p-3 border rounded mb-3" />
            <input type="text" placeholder="Level (e.g. 200)" value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
              className="w-full p-3 border rounded mb-3" />
            <button onClick={handleSignup}
              className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 font-semibold">
              Register
            </button>
            <p className="text-center mt-4 text-sm">
              Already have an account?{' '}
              <button onClick={() => setAuthMode('login')} className="text-blue-600 underline">Login</button>
            </p>
          </>
        )}

        {authMode === 'login' && (
          <>
            <input type="text" placeholder="Matric Number" value={loginForm.matric}
              onChange={(e) => setLoginForm({ ...loginForm, matric: e.target.value })}
              className="w-full p-3 border rounded mb-4" />
            <button onClick={handleLogin}
              className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 font-semibold">
              Login
            </button>
            <p className="text-center mt-4 text-sm">
              Don't have an account?{' '}
              <button onClick={() => setAuthMode('signup')} className="text-blue-600 underline">Register</button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
