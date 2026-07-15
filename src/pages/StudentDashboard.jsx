import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [settings, setSettings] = useState({});
  const [hasVoted, setHasVoted] = useState(false);
  const [student, setStudent] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const savedStudent = JSON.parse(localStorage.getItem('studentInfo'));
      if (!savedStudent) {
        setError('No student data found. Please Login First.');
        setLoading(false);
        return;
      }
      const savedCandidates = JSON.parse(localStorage.getItem('candidates')) || [];
      const savedSettings = JSON.parse(localStorage.getItem('electionSettings')) || {};
      setStudent(savedStudent);
      setCandidates(savedCandidates);
      setSettings(savedSettings);
      setHasVoted(localStorage.getItem('voted') === 'true');
    } catch (e) {
      setError('Error loading data: ' + e.message);
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('studentInfo');
    localStorage.removeItem('voted');
    navigate('/student-login');
  };

  const startDateTime = settings.startDate && settings.startTime
    ? new Date(settings.startDate + 'T' + settings.startTime) : null;
  const endDateTime = settings.endDate && settings.endTime
    ? new Date(settings.endDate + 'T' + settings.endTime) : null;
  const now = new Date();
  const isElectionStarted = startDateTime ? now >= startDateTime : false;
  const isElectionEnded = endDateTime ? now >= endDateTime : false;
  const isVotingOpen = settings.isActive && startDateTime && isElectionStarted && !isElectionEnded;

  const handleVote = (id) => {
    if (!isVotingOpen) {
      alert('Voting is not currently open.');
      return;
    }
    if (!window.confirm('Are you sure you want to vote for this candidate? This action CANNOT be undone.')) {
      return;
    }
    const updated = candidates.map(c =>
      c.id === id ? { ...c, votes: (c.votes || 0) + 1 } : c
    );
    setCandidates(updated);
    localStorage.setItem('candidates', JSON.stringify(updated));
    localStorage.setItem('voted', 'true');
    setHasVoted(true);
    alert('Vote Submitted Successfully! Thank you for participating.');
  };

  const getElectionStatus = () => {
    if (!settings.isActive || !settings.startDate) return { text: 'NOT CONFIGURED', color: '#6b7280' };
    if (!isElectionStarted) return { text: 'COMING SOON', color: '#f59e0b' };
    if (isElectionEnded) return { text: 'ENDED', color: '#dc2626' };
    return { text: 'LIVE', color: '#16a34a' };
  };

  const statusBadge = getElectionStatus();

  // Group candidates by position
  const groupedByPosition = {};
  candidates.forEach(c => {
    if (!groupedByPosition[c.position]) groupedByPosition[c.position] = [];
    groupedByPosition[c.position].push(c);
  });
  const positions = Object.keys(groupedByPosition);

  // ERROR VIEW
  if (error) {
    return (
      <div style={{
        minHeight: '100vh', background: '#003366', color: 'white',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', fontFamily: 'Arial, sans-serif',
        padding: '32px', textAlign: 'center'
      }}>
        <h2>ERROR</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/student-login')} style={{
          padding: '10px 24px', background: 'white', color: '#dc2626',
          border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
        }}>
          Go to Login
        </button>
      </div>
    );
  }

  // LOADING VIEW
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#003366', color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <p>Loading...</p>
      </div>
    );
  }

  // NOT LOGGED IN VIEW
  if (!student) {
    return (
      <div style={{
        minHeight: '100vh', background: '#003366', color: 'white',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', fontFamily: 'Arial, sans-serif',
        padding: '32px', textAlign: 'center'
      }}>
        <h2>NOT LOGGED IN</h2>
        <p>Please Login First</p>
        <button onClick={() => navigate('/student-login')} style={{
          padding: '10px 24px', background: 'white', color: '#dc2626',
          border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
        }}>
          Go to Login
        </button>
      </div>
    );
  }

  // ELECTION NOT OPEN VIEW (coming soon or ended)
  if (!isVotingOpen) {
    return (
      <div style={{ minHeight: '100vh', background: '#003366', color: 'white', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 32px' }}>
          <button onClick={handleLogout} style={{
            padding: '8px 16px', background: '#dc2626', color: 'white',
            border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
          }}>
            Logout
          </button>
        </div>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', textAlign: 'center', padding: '32px', minHeight: '60vh'
        }}>
          <h2 style={{ color: '#ffd700' }}>
            {isElectionEnded ? 'ELECTION ENDED' : 'ELECTION IS COMING SOON'}
          </h2>
          <hr style={{ width: '200px', borderColor: '#ffd700' }} />
          {settings.startDate && (
            <p>
              {isElectionEnded
                ? 'Election ended on ' + settings.endDate + ' at ' + settings.endTime
                : 'Election starts: ' + settings.startDate + ' at ' + settings.startTime
              }
            </p>
          )}
          <p>Welcome, {student.name}</p>
          <p style={{ fontSize: '13px', opacity: 0.7 }}>{student.matric}</p>
        </div>
      </div>
    );
  }

  // MAIN VOTING VIEW
  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div style={{
        background: '#003366', color: 'white', padding: '16px 32px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>Student Voting Portal</h1>
        <button onClick={handleLogout} style={{
          padding: '8px 16px', background: '#dc2626', color: 'white',
          border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
        }}>
          Logout
        </button>
      </div>

      {/* Info Bar */}
      <div style={{
        background: 'white', padding: '12px 32px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid #e5e7eb', fontSize: '14px'
      }}>
        <span>
          Welcome, <strong>{student.name}</strong>
          <span style={{ color: '#666', marginLeft: '8px' }}>{student.matric}</span>
        </span>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span>Year: {settings.year}</span>
          <span style={{
            background: statusBadge.color, color: 'white',
            padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold'
          }}>
            {statusBadge.text}
          </span>
          <span style={{ color: '#666' }}>
            Closes: {settings.endDate} {settings.endTime}
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '24px 32px' }}>
        {hasVoted ? (
          <div style={{
            background: 'white', padding: '40px', borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center'
          }}>
            <h2 style={{ color: '#16a34a' }}>You have already voted. Thank you!</h2>
            <p>Your vote has been recorded successfully.</p>
          </div>
        ) : candidates.length === 0 ? (
          <div style={{
            background: 'white', padding: '40px', borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center'
          }}>
            <h2>No Candidates Available</h2>
            <p>The admin has not added any candidates yet.</p>
          </div>
        ) : (
          /* Candidates grouped by position */
          positions.map(pos => (
            <div key={pos} style={{ marginBottom: '32px' }}>
              <h2 style={{
                color: '#003366', borderBottom: '2px solid #003366',
                paddingBottom: '8px'
              }}>
                {pos}
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '16px'
              }}>
                {groupedByPosition[pos].map(c => (
                  <div key={c.id} style={{
                    background: 'white', padding: '20px', borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center'
                  }}>
                    {c.photoURL && (
                      <img
                        src={c.photoURL}
                        alt={c.name}
                        style={{
                          width: '80px', height: '80px', borderRadius: '50%',
                          objectFit: 'cover', marginBottom: '12px'
                        }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>{c.name}</h3>
                    <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>
                      {c.position}
                    </p>
                    <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#666' }}>
                      {c.manifesto || 'No manifesto provided'}
                    </p>
                    <button
                      onClick={() => handleVote(c.id)}
                      style={{
                        width: '100%', padding: '12px', background: '#16a34a',
                        color: 'white', border: 'none', borderRadius: '6px',
                        fontWeight: 'bold', cursor: 'pointer', fontSize: '16px'
                      }}
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