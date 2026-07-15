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
          fontSize: '24px',
          fontWeight: 'bold',
          textDecoration: 'none',
          cursor: 'pointer',
          zIndex: 9999,
          border: 'none',
          userSelect: 'none',
          lineHeight: '1'
        }}
        title="Admin Access"
      >
        +
      </a>

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
        onError={function(e) { e.target.style.display = 'none'; }}
      />

      <h1 style={{
        fontSize: '28px',
        fontWeight: 'bold',
        margin: '0 0 8px 0'
      }}>
        NAMATL STUDENTS E-VOTING
      </h1>

      <hr style={{
        width: '60%',
        border: 'none',
        borderTop: '2px solid #FFD700',
        margin: '12px auto'
      }} />

      <h2 style={{
        fontSize: '16px',
        fontWeight: 'normal',
        color: '#FFD700',
        margin: '0 0 32px 0'
      }}>
        Official Student Union Election Portal
      </h2>

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
          cursor: 'pointer'
        }}
      >
        Student Portal
      </Link>
    </div>
  );
}
