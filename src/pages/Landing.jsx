import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh', background: '#003366', color: 'white', fontFamily: 'Arial, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '32px' }}>
      <div style={{ maxWidth: '600px' }}>
        <img src="/logo.png" alt="NAMTLS Logo" style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', marginBottom: '24px' }} onError={(e) => { e.target.style.display = 'none'; }} />
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', margin: '0 0 16px 0', color: '#ffd700' }}>NAMATL STUDENT E-VOTING</h1>
        <h2 style={{ fontSize: '22px', fontWeight: '600', margin: '0 0 8px 0' }}>ELECTION IS COMING SOON</h2>
        <p style={{ fontSize: '18px', margin: '0 0 32px 0', opacity: '0.9' }}>Official Student Union Election Portal</p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/student-login" style={{ padding: '14px 32px', background: '#2563eb', color: 'white', textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px' }}>Student Portal</Link>
          <Link to="/admin" style={{ padding: '14px 32px', background: '#16a34a', color: 'white', textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px' }}>Admin Login</Link>
        </div>
      </div>
    </div>
  );
}