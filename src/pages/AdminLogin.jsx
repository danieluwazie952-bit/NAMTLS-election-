import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin123') {
      navigate('/admin-dashboard');
    } else {
      alert('Invalid Credentials. Use admin / admin123');
    }
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
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#003366', marginBottom: '24px' }}>Admin Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text" placeholder="Username" value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '16px' }}
            required
          />
          <input
            type="password" placeholder="Password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '16px' }}
            required
          />
          <button type="submit"
            style={{ width: '100%', padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
