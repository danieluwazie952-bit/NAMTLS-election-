import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="landing-container" style={{
      minHeight: '100vh',
      background: '#003366',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '32px',
      fontFamily: 'Arial, sans-serif',
      color: 'white'
    }}>

      <div className="election-desktop" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <img
          src="https://namtls-election-qatt.vercel.app/logo.png"
          alt="NAMATLS Logo"
          className="landing-logo"
          style={{ width: '120px', height: '120px', marginBottom: '20px', objectFit: 'contain' }}
          onError={(e) => { e.target.style.display = 'none'; }}
        />

        <h1 style={{
          fontSize: '36px',
          fontWeight: 'bold',
          margin: '0 0 8px 0',
          letterSpacing: '2px'
        }}>
          ELECTION IS COMING SOON
        </h1>

        <hr style={{ width: '80px', border: '2px solid #FFD700', marginBottom: '24px' }} />

        <h2 style={{
          fontSize: '18px',
          fontWeight: 'normal',
          color: '#ccc',
          margin: '0 0 32px 0'
        }}>
          Official Student Union Election Portal
        </h2>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link
            to="/student-login"
            className="landing-btn"
            style={{
              padding: '12px 32px',
              background: '#2563eb',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '16px'
            }}
          >
            Student Portal
          </Link>
          <Link
            to="/admin"
            className="landing-btn"
            style={{
              padding: '12px 32px',
              background: '#FFD700',
              color: '#003366',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '16px'
            }}
          >
            Admin Login
          </Link>
        </div>
      </div>

      <div className="election-mobile" style={{
        display: 'none',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%'
      }}>
        <img
          src="https://namtls-election-qatt.vercel.app/logo.png"
          alt="NAMATLS Logo"
          className="landing-logo"
          style={{ width: '80px', height: '80px', marginBottom: '16px', objectFit: 'contain' }}
          onError={(e) => { e.target.style.display = 'none'; }}
        />

        <h1 style={{ fontSize: '22px', fontWeight: 'bold', margin: '0 0 6px 0' }}>
          ELECTION IS COMING SOON
        </h1>

        <hr style={{ width: '60px', border: '2px solid #FFD700', marginBottom: '16px' }} />

        <p style={{ fontSize: '14px', color: '#ccc', marginBottom: '24px' }}>
          Official Student Union Election Portal
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '280px' }}>
          <Link
            to="/student-login"
            className="landing-btn"
            style={{
              padding: '10px 20px',
              background: '#2563eb',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '14px',
              textAlign: 'center'
            }}
          >
            Student Portal
          </Link>
          <Link
            to="/admin"
            className="landing-btn"
            style={{
              padding: '10px 20px',
              background: '#FFD700',
              color: '#003366',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '14px',
              textAlign: 'center'
            }}
          >
            Admin Login
          </Link>
        </div>
      </div>

    </div>
  );
}
