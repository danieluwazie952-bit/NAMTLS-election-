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
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center',
      padding: '40px',
      position: 'relative'
    }}>
      {/* + Icon Top-Left for Admin Access */}
      <a
        href="#/admin-login"
        style={{
          position: 'fixed',
          top: '12px',
          left: '12px',
          width: '36px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255,255,255,0.15)',
          color: 'rgba(255,255,255,0.5)',
          borderRadius: '50%',
          fontSize: '22px',
          fontWeight: 'bold',
          textDecoration: 'none',
          cursor: 'pointer',
          zIndex: 9999,
          border: 'none',
          transition: 'all 0.2s',
          userSelect: 'none'
        }}
        title="Admin Access"
        onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.3)'; e.target.style.color = 'rgba(255,255,255,0.8)'; }}
        onMouseLeave={e => { e.target.style.background = 'rgba(255,255,255,0.15)'; e.target.style.color = 'rgba(255,255,255,0.5)'; }}
      >
        +
      </a>

      {/* Logo */}
      <img
        src="https://namtls-election-qatt.vercel.app/logo.png"
        alt="NAMATLS Logo"
        style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          objectFit: 'cover',
          marginBottom: '20px'
        }}
        onError={e => { e.target.style.display = 'none'; }}
      />

      {/* Title */}
      <h1 style={{
        fontSize: '28px',
        fontWeight: 'bold',
        margin: '0 0 8px 0'
      }}>
        NAMATL STUDENTS E-VOTING
      </h1>

      {/* Divider */}
      <hr style={{
        width: '60%',
        border: 'none',
        borderTop: '2px solid #FFD700',
        margin: '12px auto'
      }} />

      {/* Subtitle */}
      <h2 style={{
        fontSize: '16px',
        fontWeight: 'normal',
        color: '#FFD700',
        margin: '0 0 32px 0'
      }}>
        Official Student Union Election Portal
      </h2>

      {/* SINGLE Student Portal Button */}
      <Link
        to="/student-login"
        style={{
          display: 'inline-block',
          padding: '14px 40px',
          background: '#2563eb',
          color: 'white',
          borderRadius: '8px',
          fontWeight: 'bold',
          fontSize: '16px',
          textDecoration: 'none',
          cursor: 'pointer',
          transition: 'background 0.2s'
        }}
        onMouseEnter={e => e.target.style.background = '#1d4ed8'}
        onMouseLeave={e => e.target.style.background = '#2563eb'}
      >
        Student Portal
      </Link>

      {/* Responsive override */}
      <style>{`
        @media (max-width: 768px) {
          div[style*="padding: 40px"] {
            padding: 24px !important;
          }
        }
      `}</style>
    </div>
  );
}
