import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#003366',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px',
      textAlign: 'center'
    }}>
      <img
        src="/logo.png"
        alt="NAMTLS Logo"
        style={{ width: '120px', height: '120px', marginBottom: '24px' }}
        onError={(e) => { e.target.style.display = 'none'; }}
      />
      <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#FFD700', marginBottom: '8px' }}>
        NAMTLS E-Voting System
      </h1>
      <p style={{ color: '#94a3b8', fontSize: '18px', marginBottom: '32px' }}>
        Official Student Union Election Portal
      </p>
      <div style={{ display: 'flex', gap: '16px' }}>
        <Link to="/student-login"
          style={{
            background: '#2563eb',
            color: 'white',
            padding: '12px 32px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '16px'
          }}>
          Student Portal
        </Link>
        <Link to="/admin"
          style={{
            background: '#16a34a',
            color: 'white',
            padding: '12px 32px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '16px'
          }}>
          Admin Login
        </Link>
      </div>
    </div>
  );
}
