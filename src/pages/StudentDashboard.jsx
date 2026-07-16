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

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#003366',
        color: 'white',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h2 style={{ color: '#dc2626' }}>ERROR</h2>
        <p>{error}</p>
        <button
          onClick={() => navigate('/student-login')}
          style={{
            padding: '10px 24px',
            background: 'white',
            color: '#dc2626',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            marginTop: '16px'
          }}
        >
          Login
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#003366',
        color: 'white',
        fontFamily: 'Arial, sans-serif'
      }}>
        Loading...
      </div>
    );
  }

  if (!student) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#003366',
        color: 'white',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h2>NOT LOGGED IN</h2>
        <p>Please Login</p>
        <button
          onClick={() => navigate('/student-login')}
          style={{
            padding: '10px 24px',
            background: 'white',
            color: '#dc2626',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Login
        </button>
      </div>
    );
  }

  // Voting is NOT open - Show "ELECTION IS COMING SOON"
  if (!isVotingOpen) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#003366',
        color: 'white',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          background: '#001a33',
          padding: '12px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid #FFD700'
        }}>
          <h2 style={{ margin: 0, color: '#FFD700', fontSize: '18px' }}>
            NAMATL E-VOTING
          </h2>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 20px',
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Logout
          </button>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 60px)',
          padding: '32px',
          textAlign: 'center'
        }}>
          <div style={{
            background: 'rgba(255, 215, 0, 0.1)',
            border: '2px solid #FFD700',
            borderRadius: '12px',
            padding: '40px',
            maxWidth: '500px',
            width: '100%'
          }}>
            <h1 style={{
              color: '#FFD700',
              fontSize: '28px',
              margin: '0 0 8px 0',
              letterSpacing: '2px'
            }}>
              ELECTION IS COMING SOON
            </h1>
            <hr style={{
              border: 'none',
              borderTop: '1px solid rgba(255, 215, 0, 0.3)',
              margin: '16px 0'
            }} />
            <p style={{ fontSize: '16px', margin: '8px 0', color: '#cccccc' }}>
              Welcome, {student.name}
            </p>
            <p style={{ fontSize: '14px', margin: '4px 0', color: '#999999' }}>
              {student.matric}
            </p>
            {settings.startDate && (
              <p style={{ fontSize: '13px', marginTop: '20px', color: '#FFD700' }}>
                Scheduled: {settings.startDate} at {settings.startTime || 'TBA'}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Voting IS OPEN - Show full voting interface
  return (
    <div style={{
      minHeight: '100vh',
      background: '#f0f2f5',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        background: '#003366',
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <h1 style={{ margin: 0, color: '#FFD700', fontSize: '20px' }}>
          Student Voting Portal
        </h1>
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 20px',
            background: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Logout
        </button>
      </div>

      <div style={{
        background: 'white',
        padding: '16px 24px',
        borderBottom: '1px solid #ddd',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div>
          Welcome, <strong>{student.name}</strong>
          <span style={{ color: '#666', marginLeft: '12px', fontSize: '14px' }}>
            {student.matric}
          </span>
        </div>
        <div style={{ fontSize: '13px', color: '#666' }}>
          Year: {settings.year || 'N/A'}
          {' '}
          <span style={{
            display: 'inline-block',
            padding: '2px 8px',
            borderRadius: '4px',
            fontWeight: 'bold',
            fontSize: '11px',
            background: badge.color,
            color: 'white',
            marginLeft: '8px'
          }}>
            {badge.text}
          </span>
          <span style={{ marginLeft: '12px' }}>
            Closes: {settings.endDate || 'N/A'} {settings.endTime || ''}
          </span>
        </div>
      </div>

      <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
        {hasVoted ? (
          <div style={{
            background: 'white',
            borderRadius: '8px',
            padding: '40px',
            textAlign: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ color: '#16a34a', margin: '0 0 8px 0' }}>
              &#10003; You have voted. Thank you!
            </h2>
            <p style={{ color: '#666' }}>
              Your vote has been recorded successfully.
            </p>
          </div>
        ) : candidates.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: '8px',
            padding: '40px',
            textAlign: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ color: '#f59e0b', margin: '0' }}>
              No Candidates Available
            </h2>
          </div>
        ) : (
          positions.map(pos => (
            <div key={pos} style={{ marginBottom: '24px' }}>
              <h2 style={{
                color: '#003366',
                borderBottom: '3px solid #FFD700',
                paddingBottom: '8px',
                marginBottom: '16px'
              }}>
                {pos}
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '16px'
              }}>
                {grouped[pos].map(c => (
                  <div key={c.id} style={{
                    background: 'white',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    {c.photoURL && (
                      <img
                        src={c.photoURL}
                        alt={c.name}
                        style={{
                          width: '100%',
                          height: '180px',
                          objectFit: 'cover'
                        }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}
                    <div style={{ padding: '16px' }}>
                      <h3 style={{ margin: '0 0 4px 0', color: '#003366' }}>
                        {c.name}
                      </h3>
                      <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '13px' }}>
                        {c.position}
                      </p>
                      <p style={{
                        margin: '0 0 16px 0',
                        color: '#444',
                        fontSize: '14px',
                        fontStyle: c.manifesto ? 'normal' : 'italic'
                      }}>
                        {c.manifesto || 'No manifesto'}
                      </p>
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