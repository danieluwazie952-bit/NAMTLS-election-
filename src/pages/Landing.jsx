import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #003366 0%, #001a33 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      position: 'relative'
    }}>
      <Link to="/admin" style={{
        position: 'absolute',
        top: '20px',
        left: '24px',
        color: '#FFD700',
        textDecoration: 'none',
        fontSize: '36px',
        fontWeight: 'bold',
        cursor: 'pointer',
        lineHeight: '1',
        transition: 'transform 0.2s ease'
      }}
      onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
      title="Admin Login"
      >
        +
      </Link>

      <div style={{ textAlign: 'center' }}>
        <img
          src="/logo.png"
          alt="NAMTLS Logo"
          style={{
            width: '140px',
            height: '140px',
            objectFit: 'contain',
            marginBottom: '24px',
            borderRadius: '50%',
            border: '4px solid #FFD700',
            padding: '8px',
            background: 'white'
          }}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />

        <h1 style={{
          color: '#FFD700',
          fontSize: '32px',
          fontWeight: 'bold',
          margin: '0 0 8px 0',
          textTransform: 'uppercase',
          letterSpacing: '2px'
        }}>
          NAMATL STUDENT E-VOTING
        </h1>

        <p style={{
          color: '#cccccc',
          fontSize: '14px',
          margin: '0 0 40px 0'
        }}>
          National Association of Maritime Transport and Logistics Students
        </p>

        <Link to="/student-login" style={{
          display: 'inline-block',
          padding: '16px 48px',
          background: '#FFD700',
          color: '#003366',
          textDecoration: 'none',
          borderRadius: '8px',
          fontWeight: 'bold',
          fontSize: '18px',
          cursor: 'pointer',
          border: 'none',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 6px 20px rgba(255, 215, 0, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 4px 15px rgba(255, 215, 0, 0.3)';
        }}
        >
          Student Login
        </Link>
      </div>

      <p style={{
        position: 'absolute',
        bottom: '16px',
        color: '#666666',
        fontSize: '12px',
        margin: '0'
      }}>
        &copy; {new Date().getFullYear()} NAMATLS FUPRE. All rights reserved.
      </p>
    </div>
  );
}