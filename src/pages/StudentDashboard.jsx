import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [settings, setSettings] = useState({});
  const [hasVoted, setHasVoted] = useState(false);
  const [student, setStudent] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedStudent = JSON.parse(localStorage.getItem('studentInfo'));
        if (!savedStudent) {
          setError('No student data. Please Login.');
          setLoading(false);
          return;
        }
        setStudent(savedStudent);

        const savedCandidates = JSON.parse(localStorage.getItem('candidates')) || [];
        setCandidates(savedCandidates);

        try {
          const settingsSnap = await getDoc(doc(db, 'settings', 'main'));
          if (settingsSnap.exists()) {
            const fbSettings = settingsSnap.data();
            setSettings(fbSettings);
            localStorage.setItem('electionSettings', JSON.stringify(fbSettings));
          } else {
            const savedSettings = JSON.parse(localStorage.getItem('electionSettings')) || {};
            setSettings(savedSettings);
          }
        } catch (e) {
          const savedSettings = JSON.parse(localStorage.getItem('electionSettings')) || {};
          setSettings(savedSettings);
        }

        setHasVoted(localStorage.getItem('voted') === 'true');
      } catch (e) {
        setError('Error: ' + e.message);
      }
      setLoading(false);
    };

    loadData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('studentInfo');
    localStorage.removeItem('voted');
    navigate('/student-login');
  };

  const startDateTime = settings.startDate && settings.startTime
    ? new Date(settings.startDate + 'T' + settings.startTime)
    : null;
  const endDateTime = settings.endDate && settings.endTime
    ? new Date(settings.endDate + 'T' + settings.endTime)
    : null;
  const now = new Date();
  const isElectionStarted = startDateTime ? now >= startDateTime : false;
  const isElectionEnded = endDateTime ? now >= endDateTime : false;
  const isVotingOpen = settings.isActive && startDateTime && isElectionStarted && !isElectionEnded;

  const handleVote = (id) => {
    if (!isVotingOpen) {
      alert('Voting is not open.');
      return;
    }
    if (!window.confirm('Vote for this candidate? This action cannot be undone.')) return;

    const updated = candidates.map(c =>
      c.id === id ? { ...c, votes: (c.votes || 0) + 1 } : c
    );
    setCandidates(updated);
    localStorage.setItem('candidates', JSON.stringify(updated));
    localStorage.setItem('voted', 'true');
    setHasVoted(true);
    alert('Vote Submitted! Thank you.');
  };

  const getStatusBadge = () => {
    if (!settings.isActive || !settings.startDate) return { text: 'NOT CONFIGURED', color: '#6b7280' };
    if (!isElectionStarted) return { text: 'COMING SOON', color: '#f59e0b' };
    if (isElectionEnded) return { text: 'ENDED', color: '#dc2626' };
    return { text: 'LIVE', color: '#16a34a' };
  };

  const badge = getStatusBadge();
  const grouped = {};
  candidates.forEach(c => {
    if (!grouped[c.position]) grouped[c.position] = [];
    grouped[c.position].push(c);
  });
  const positions = Object.keys(grouped);

  const pageStyle = {
    minHeight: '100vh',
    background: '#f0f2f5',
    fontFamily: 'Arial, sans-serif'
  };

  const headerStyle = {
    background: '#003366',
    color: 'white',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const cardStyle = {
    background: 'white',
    borderRadius: '8px',
    padding: '20px',
    margin: '16px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  const btnStyle = {
    padding: '8px 20px',
    background: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold'
  };

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#003366', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'white' }}>
        <h2>ERROR</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/student-login')} style={{ padding: '10px 24px', background: 'white', color: '#dc2626', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '16px' }}>
          Login
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#003366', color: 'white', fontSize: '1.2rem' }}>
        Loading...
      </div>
    );
  }

  if (!student) {
    return (
      <div style={{ minHeight: '100vh', background: '#003366', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'white' }}>
        <h2>NOT LOGGED IN</h2>
        <p>Please Login</p>
        <button onClick={() => navigate('/student-login')} style={{ padding: '10px 24px', background: 'white', color: '#dc2626', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Login
        </button>
      </div>
    );
  }

  // ELECTION IS COMING SOON — when election is not active/started
  if (!isVotingOpen) {
    return (
      <div style={pageStyle}>
        <div style={headerStyle}>
          <h2 style={{ margin: 0 }}>NAMATL E-VOTING</h2>
          <button onClick={handleLogout} style={btnStyle}>Logout</button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <div style={{ ...cardStyle, maxWidth: '500px', textAlign: 'center' }}>
            <h1 style={{ color: '#f59e0b', fontSize: '2rem', marginBottom: '10px' }}>ELECTION IS COMING SOON</h1>
            <hr style={{ border: '1px solid #f59e0b', width: '60px', margin: '16px auto' }} />
            <p style={{ fontSize: '1.1rem', color: '#333' }}>Welcome, {student.name}</p>
            <p style={{ color: '#666', marginBottom: '16px' }}>{student.matric}</p>
            {settings.startDate && (
              <p style={{ color: '#888', fontSize: '0.9rem' }}>
                Scheduled: {settings.startDate} at {settings.startTime || 'TBA'}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // VOTING IS OPEN — show full voting interface
  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <h2 style={{ margin: 0 }}>Student Voting Portal</h2>
        <button onClick={handleLogout} style={btnStyle}>Logout</button>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '16px' }}>
        <div style={cardStyle}>
          <p>Welcome, <strong>{student.name}</strong> — {student.matric}</p>
          <p>
            Year: {settings.year || 'N/A'} {' '}
            <span style={{ background: badge.color, color: 'white', padding: '2px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              {badge.text}
            </span>{' '}
            Closes: {settings.endDate || 'N/A'} {settings.endTime || ''}
          </p>
        </div>

        {hasVoted ? (
          <div style={{ ...cardStyle, textAlign: 'center', borderLeft: '4px solid #16a34a' }}>
            <h2 style={{ color: '#16a34a' }}>&#10003; You have voted. Thank you!</h2>
            <p>Your vote has been recorded successfully.</p>
          </div>
        ) : candidates.length === 0 ? (
          <div style={{ ...cardStyle, textAlign: 'center' }}>
            <h2>No Candidates Available</h2>
          </div>
        ) : (
          positions.map(pos => (
            <div key={pos} style={cardStyle}>
              <h2 style={{ color: '#003366', borderBottom: '2px solid #FFD700', paddingBottom: '8px' }}>{pos}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px', marginTop: '16px' }}>
                {grouped[pos].map(c => (
                  <div key={c.id} style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                    {c.photoURL && (
                      <img
                        src={c.photoURL}
                        alt={c.name}
                        style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', marginBottom: '12px' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}
                    <h3 style={{ margin: '0 0 4px 0', color: '#003366' }}>{c.name}</h3>
                    <p style={{ color: '#666', margin: '0 0 8px 0', fontSize: '0.9rem' }}>{c.position}</p>
                    <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '12px' }}>{c.manifesto || 'No manifesto'}</p>
                    <button
                      onClick={() => handleVote(c.id)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: '#16a34a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontSize: '16px',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => { e.target.style.background = '#15803d'; }}
                      onMouseLeave={(e) => { e.target.style.background = '#16a34a'; }}
                    >
                      Vote
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}