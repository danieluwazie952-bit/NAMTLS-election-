import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if(username === 'admin' && password === 'admin123') {
      navigate('/admin-dashboard');
    } else {
      alert('Invalid Credentials. Use admin / admin123');
    }
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-8">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-navy mb-6 text-center">Admin Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <button type="submit" className="w-full bg-navy text-white p-3 rounded font-bold hover:bg-blue-900 transition">
          Login
        </button>
      </form>
    </div>
  );
}
