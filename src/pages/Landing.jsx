import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <>

      {/* DESKTOP VIEW - LAPTOP >768px */}
      <div className="election-desktop" style={{
        minHeight: '100vh',
        background: '#003366',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center',
        padding: '40px'
      }}>
        <img
          src="https://namtls-election-qatt.vercel.app/logo.png"
          alt="NAMATLS Logo"
          style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', marginBottom: '20px' }}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
          NAMATL STUDENTS E-VOTING
        </h1>
        <hr style={{ width: '60%', border: 'none', borderTop: '2px solid #FFD700', margin: '12px auto' }} />
        <h2 style={{ fontSize: '16px', fontWeight: 'normal', color: '#FFD700', margin: '0 0 32px 0' }}>
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

      {/* MOBILE VIEW - PHONE <768px */}
      <div className="election-mobile" style={{
        minHeight: '100vh',
        background: '#003366',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center',
        padding: '24px'
      }}>
        <img
          src="https://namtls-election-qatt.vercel.app/logo.png"
          alt="NAMATLS Logo"
          style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', marginBottom: '16px' }}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <h1 style={{ fontSize: '22px', fontWeight: 'bold', margin: '0 0 6px 0' }}>
          NAMATL STUDENTS E-VOTING
        </h1>
        <hr style={{ width: '80%', border: 'none', borderTop: '2px solid #FFD700', margin: '10px auto' }} />
        <p style={{ fontSize: '14px', color: '#FFD700', margin: '0 0 24px 0' }}>
          Official Student Union Election Portal
        </p>

        <Link
          to="/student-login"
          style={{
            display: 'inline-block',
            padding: '12px 32px',
            background: '#2563eb',
            color: 'white',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '14px',
            textDecoration: 'none',
            cursor: 'pointer'
          }}
        >
          Student Portal
        </Link>
      </div>

    </>
  );
}
