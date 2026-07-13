import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function StudentLogin() {
  const [authMode, setAuthMode] = useState('signup'); // 'signup' or 'login'
  const [form, setForm] = useState({ name: '', matric: '', level: '' });
  const [loginForm, setLoginForm] = useState({ matric: '' });
  const navigate = useNavigate();

  const handleSignup = () => {
    if(!form.name ||!form.matric ||!form.level) {
      alert('Please fill all fields');
      return;
    }
    const students = JSON.parse(localStorage.getItem('students')) || [];
    if(students.find(s => s.matric === form.matric)) {
      alert('Matric Number already registered. Please Login.');
      setAuthMode('login');
      return;
    }

    const newStudent = {...form, hasVoted: false };
    const updatedStudents = [...students, newStudent];
    localStorage.setItem('students', JSON.stringify(updatedStudents));
    localStorage.setItem('studentInfo', JSON.stringify(newStudent));
    navigate('/student');
  };

  const handleLogin = () => {
    if(!loginForm.matric) {
      alert('Please fill Matric Number');
      return;
    }
    const students = JSON.parse(localStorage.getItem('students')) || [];
    const foundStudent = students.find(s => s.matric === loginForm.matric);
    if(!foundStudent) {
      alert('Matric Number not found. Please Register.');
      return;
    }
    localStorage.setItem('studentInfo', JSON.stringify(foundStudent));
    navigate('/student');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-900 flex items-center justify-center text-white px-4"> {/* FIXED: added flex */}
      <div className="bg-white text-black p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2">{authMode === 'signup'? 'Student Registration' : 'Student Login'}</h1>
        <p className="text-center text-gray-600 mb-6">{authMode === 'signup'? 'Create account to continue' : 'Login to continue'}</p>

        {authMode === 'signup' && (
          <>
            <input type="text" placeholder="Full Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full p-3 border rounded mb-3" />
            <input type="text" placeholder="Matric Number" value={form.matric} onChange={e => setForm({...form, matric: e.target.value})} className="w-full p-3 border rounded mb-3" />
            <select value={form.level} onChange={e => setForm({...form, level: e.target.value})} className="w-full p-3 border rounded mb-4">
              <option value="">Select Level</option>
              <option value="100">100 Level</option>
              <option value="200">200 Level</option>
              <option value="300">300 Level</option>
              <option value="400">400 Level</option>
              <option value="500">500 Level</option>
            </select>
            <button onClick={handleSignup} className="w-full bg-green-600 text-white px-4 py-3 rounded font-bold hover:bg-green-700">Register</button>
            <p className="text-center mt-4 text-sm">Already have an account? <span className="text-green-600 font-bold cursor-pointer" onClick={() => setAuthMode('login')}>Login</span></p>
          </>
        )}

        {authMode === 'login' && (
          <>
            <input type="text" placeholder="Matric Number" value={loginForm.matric} onChange={e => setLoginForm({...loginForm, matric: e.target.value})} className="w-full p-3 border rounded mb-4" />
            <button onClick={handleLogin} className="w-full bg-green-600 text-white px-4 py-3 rounded font-bold hover:bg-green-700">Login</button>
            <p className="text-center mt-4 text-sm">Don't have an account? <span className="text-green-600 font-bold cursor-pointer" onClick={() => setAuthMode('signup')}>Register</span></p>
          </>
        )}
      </div>
    </div>
  );
}
