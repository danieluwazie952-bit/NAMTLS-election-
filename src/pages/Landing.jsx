import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh', background: '#003366', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif', color: 'white', padding: '32px', textAlign: 'center' }}>
      <img src="https://namtls-election-qatt.vercel.app/logo.png" alt="NAMTLS Logo" style={{ width: '120px', height: '120px', objectFit: 'contain', marginBottom: '24px' }} onError={(e) => { e.target.style.display = 'none'; }} />
      
      <h1 className="election-text">
        <span className="desktop">ELECTION IS COMING SOON</span>
        <span className="mobile">ELECTION IS COMING<br/>SOON</span>
      </h1>
      <style>{`.mobile{display:none}@media(max-width:768px){.desktop{display:none}.mobile{display:block}}`}</style>
      
      <p style={{ fontSize: '18px', marginBottom: '32px', opacity: '0.9' }}>
        Official Student Union Election Portal
      </p>
      
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to="/student-login" style={{ padding: '14px 32px', background: '#2563eb', color: 'white', textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px' }}>
          Student Portal
        </Link>
        <Link to="/admin" style={{ padding: '14px 32px', background: '#16a34a', color: 'white', textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px' }}>
          Admin Login
        </Link>
      </div>
      
      <footer style={{ marginTop: '48px', fontSize: '11px', opacity: '0.6' }}>
        <p>Authorized and Verified by EC</p>
      </footer>
    </div>
  );
}
