import { useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export default function Support() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !message) {
      setError('Name and message are required');
      return;
    }
    try {
      await addDoc(collection(db, 'supportMessages'), {
        name,
        email: email || 'Not provided',
        message,
        timestamp: serverTimestamp(),
        status: 'unread'
      });
      setSubmitted(true);
      setError('');
      setName('');
      setEmail('');
      setMessage('');
    } catch (e) {
      setError('Failed to send message: ' + e.message);
    }
  };

  const containerStyle = {
    minHeight: '100vh',
    background: '#f0f2f5',
    fontFamily: 'Arial, sans-serif',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  };

  const cardStyle = {
    background: 'white',
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '500px'
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span style={{ fontSize: '48px' }}>&#128172;</span>
          <h1 style={{ color: '#003366', margin: '8px 0' }}>Chat / Support</h1>
          <p style={{ color: '#666', fontSize: '14px' }}>Submit your complaints or request help</p>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <span style={{ fontSize: '48px', color: '#16a34a' }}>&#10003;</span>
            <h2 style={{ color: '#16a34a', margin: '12px 0' }}>Message Sent!</h2>
            <p style={{ color: '#666' }}>Your message has been received. We'll get back to you.</p>
            <Link to="/" style={{ color: '#2563eb', marginTop: '16px', display: 'inline-block' }}>Back to Home</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ padding: '10px', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', fontWeight: 'bold', textAlign: 'center' }}>
                {error}
              </div>
            )}

            <input
              placeholder="Your Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '14px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                marginBottom: '12px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              required
            />
            <input
              placeholder="Your Email (optional)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '14px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                marginBottom: '12px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
            <textarea
              placeholder="Your message / complaint *"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="5"
              style={{
                width: '100%',
                padding: '14px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '14px',
                boxSizing: 'border-box',
                resize: 'vertical',
                fontFamily: 'Arial, sans-serif'
              }}
              required
            />

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '14px',
                background: '#003366',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '16px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => { e.target.style.background = '#002244'; }}
              onMouseLeave={(e) => { e.target.style.background = '#003366'; }}
            >
              Send Message
            </button>

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <Link to="/" style={{ color: '#2563eb', fontSize: '14px' }}>Back to Home</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}