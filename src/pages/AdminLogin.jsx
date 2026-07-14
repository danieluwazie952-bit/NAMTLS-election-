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
    if(password !== 'Officialelectoralcommission123') return alert('Wrong Password');
    if (username === 'admin' && password === 'Officialelectoralcommission123') {
      navigate('/admin-dashboard');
    } else {
      setError('Invalid Credentials. Use admin / Officialelectoralcommission123');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#003366', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', fontFamily: 'Arial, sans-serif' }}>
      <form onSubmit={handleLogin} style={{ background: 'white', padding: '32px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', color: '#003366', marginBottom: '24px' }}>Admin Login</h2>
        
        {error && (
          <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '4px', marginBottom: '16px', fontSize: '14px', textAlign: 'center' }}>
            ⚠️ {error}
          </div>
        )}
        
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} style={{width:'100%',padding:'12px',border:'1px solid #ccc',borderRadius:'4px',marginBottom:'16px',boxSizing:'border-box',fontSize:'14px'}} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{width:'100%',padding:'12px',border:'1px solid #ccc',borderRadius:'4px',marginBottom:'16px',boxSizing:'border-box',fontSize:'14px'}} required />
        <button type="submit" style={{width:'100%',padding:'12px',background:'#2563eb',color:'white',border:'none',borderRadius:'4px',fontWeight:'bold',cursor:'pointer',fontSize:'16px'}}>Login</button>
      </form>
    </div>
  );
}
