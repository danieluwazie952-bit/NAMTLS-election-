import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    if (username === 'admin' && password === 'Officialelectoralcommission123') {
      navigate('/admin-dashboard');
    } else {
      setError('Invalid Credentials. Use admin / Officialelectoralcommission123');
    }
  };

  const pageStyle = {
    minHeight: '100vh',
    background: '#003366',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    fontFamily: 'Arial, sans-serif'
  };
  const cardStyle = {
    background: 'white',
    padding: '32px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px'
  };
  const inputStyle = {
    width: '100%',
    padding: '12px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    marginBottom: '16px',
    boxSizing: 'border-box',
    fontSize: '14px'
  };
  const btnStyle = {
    width: '100%',
    padding: '12px',
    background: '#FFD700',
    color: '#003366',
    border: 'none',
    borderRadius: '4px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '16px'
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h2 style={{ textAlign: 'center', color: '#003366', marginBottom: '24px' }}>
          Admin Login
        </h2>

        {error && (
          <div style={{
            padding: '10px',
            background: '#fee2e2',
            color: '#dc2626',
            borderRadius: '4px',
            marginBottom: '16px',
            fontSize: '14px',
            fontWeight: 'bold',
            textAlign: 'center',
            border: '1px solid #fecaca'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={inputStyle}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            required
          />
          <button type="submit" style={btnStyle}>
            Login
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <a href="#/" style={{ color: '#2563eb', fontSize: '13px' }}>Back to Home</a>
        </div>
      </div>
    </div>
  );
}
