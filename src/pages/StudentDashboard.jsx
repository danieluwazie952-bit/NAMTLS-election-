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
        setError('ERROR: No student data found. Please Login First.');
        setLoading(false);
        return;
      }
      const saved = JSON.parse(localStorage.getItem('candidates')) || [];
      const savedSettings = JSON.parse(localStorage.getItem('electionSettings')) || {};
      setStudent(savedStudent);
      setCandidates(saved);
      setSettings(savedSettings);
      setHasVoted(localStorage.getItem('voted') === 'true');
    } catch (e) {
      setError('ERROR loading data: ' + e.message);
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('studentInfo');
    localStorage.removeItem('voted');
    navigate('/student-login');
  };

  // ===== ELECTION TIME CHECKS (startDate/startTime + endDate/endTime) =====
  const startDateTime = settings.startDate && settings.startTime
    ? new Date(settings.startDate + 'T' + settings.startTime)
    : null;
  const endDateTime = settings.endDate && settings.endTime
    ? new Date(settings.endDate + 'T' + settings.endTime)
    : null;
  const now = new Date();

  const isElectionConfigured = settings.isActive && candidates.length > 0 && settings.startDate && settings.startTime;
  const isElectionStarted = startDateTime ? now >= startDateTime : false;
  const isElectionEnded = endDateTime ? now >= endDateTime : false;
  const isVotingOpen = isElectionConfigured && isElectionStarted && !isElectionEnded;

  // ===== STATUS TEXT =====
  const getElectionStatusText = () => {
    if (!settings.isActive || !settings.startDate) return 'The election has not been configured yet by the admin.';
    if (!isElectionStarted) return `Election starts: ${settings.startDate} at ${settings.startTime}`;
    if (isElectionEnded) return `Election ended on ${settings.endDate} at ${settings.endTime}. Voting is closed.`;
    return `Election ends: ${settings.endDate} at ${settings.endTime}`;
  };

  const getElectionStatusBadge = () => {
    if (!settings.isActive || !settings.startDate) return { text: 'NOT CONFIGURED', color: '#6b7280' };
    if (!isElectionStarted) return { text: 'COMING SOON', color: '#f59e0b' };
    if (isElectionEnded) return { text: 'ENDED', color: '#dc2626' };
    return { text: 'LIVE', color: '#16a34a' };
  };

  const handleVote = (id) => {
    if (!isVotingOpen) {
      alert('Voting is not currently open.');
      return;
    }
    const updated = candidates.map(c => c.id === id ? { ...c, votes: (c.votes || 0) + 1 } : c);
    setCandidates(updated);
    localStorage.setItem('candidates', JSON.stringify(updated));
    localStorage.setItem('voted', 'true');
    setHasVoted(true);
    alert('Vote Submitted Successfully');
  };

  const baseStyles = {
    fontFamily: 'Arial, sans-serif',
    minHeight: '100vh',
    background: '#003366',
    color: 'white',
    padding: '32px'
  };
  const centerStyles = {
    ...baseStyles,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center'
  };

  if (error) {
    return (
      <div style={centerStyles}>
        <h2 style={{ color: '#dc2626' }}>ERROR</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/student-login')} style={{
          padding: '10px 24px', background: 'white', color: '#dc2626',
          border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
        }}>Go to Login</button>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={centerStyles}>
        <h1 style={{ fontSize: '24px', margin: '0 0 8px 0' }}>NAMATL STUDENT E-VOTING</h1>
        <hr style={{ width: '60%', border: 'none', borderTop: '2px solid #FFD700', margin: '12px auto' }} />
        <div style={{
          border: '4px solid #FFD700', borderTop: '4px solid transparent',
          borderRadius: '50%', width: '40px', height: '40px',
          animation: 'spin 1s linear infinite', margin: '20px auto'
        }}></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div style={centerStyles}>
        <h2>NOT LOGGED IN</h2>
        <p>Please Login First</p>
        <button onClick={() => navigate('/student-login')} style={{
          padding: '10px 24px', background: 'white', color: '#dc2626',
          border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
        }}>Go to Login</button>
      </div>
    );
  }

  const statusBadge = getElectionStatusBadge();

  // ===== IF VOTING IS NOT OPEN → Show status screen =====
  if (!isVotingOpen) {
    return (
      <div>
        {/* DESKTOP STATUS */}
        <div className="election-desktop" style={centerStyles}>
          <div style={{ position: 'absolute', top: '16px', right: '24px' }}>
            <button onClick={handleLogout} style={{
              padding: '8px 20px', background: '#dc2626', color: 'white',
              border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer'
            }}>Logout</button>
          </div>
          <div style={{
            background: 'white', color: '#003366', padding: '32px 48px',
            borderRadius: '12px', maxWidth: '500px', width: '100%', textAlign: 'center'
          }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '28px' }}>
              {isElectionEnded ? 'ELECTION ENDED' : 'ELECTION IS COMING SOON'}
            </h2>
            <hr style={{ width: '80px', border: 'none', borderTop: '3px solid #FFD700', margin: '12px auto' }} />
            <div style={{
              display: 'inline-block', padding: '6px 20px', borderRadius: '20px',
              background: statusBadge.color, color: 'white', fontWeight: 'bold', fontSize: '14px', margin: '12px 0'
            }}>{statusBadge.text}</div>
            <p style={{ color: '#666', margin: '16px 0' }}>{getElectionStatusText()}</p>
            {settings.startDate && (
              <div style={{ fontSize: '13px', color: '#888', marginTop: '8px' }}>
                {settings.startDate} at {settings.startTime}
                {settings.endDate && ` → ${settings.endDate} at ${settings.endTime}`}
              </div>
            )}
            <div style={{ marginTop: '24px', padding: '16px', background: '#f0f2f5', borderRadius: '8px' }}>
              <p style={{ margin: '0', fontWeight: 'bold', fontSize: '16px' }}>Welcome, {student.name}</p>
              <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '13px' }}>Matric: {student.matric}</p>
            </div>
          </div>
        </div>

        {/* MOBILE STATUS */}
        <div className="election-mobile" style={centerStyles}>
          <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
            <button onClick={handleLogout} style={{
              padding: '6px 16px', background: '#dc2626', color: 'white',
              border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px'
            }}>Logout</button>
          </div>
          <div style={{
            background: 'white', color: '#003366', padding: '24px',
            borderRadius: '12px', maxWidth: '100%', width: '100%', textAlign: 'center'
          }}>
            <h2 style={{ margin: '0 0 12px 0', fontSize: '22px' }}>
              {isElectionEnded ? 'ELECTION ENDED' : 'ELECTION IS COMING SOON'}
            </h2>
            <hr style={{ width: '60px', border: 'none', borderTop: '3px solid #FFD700', margin: '10px auto' }} />
            <div style={{
              display: 'inline-block', padding: '4px 16px', borderRadius: '20px',
              background: statusBadge.color, color: 'white', fontWeight: 'bold', fontSize: '12px', margin: '10px 0'
            }}>{statusBadge.text}</div>
            <p style={{ color: '#666', margin: '12px 0', fontSize: '14px' }}>{getElectionStatusText()}</p>
            <div style={{ marginTop: '16px', padding: '12px', background: '#f0f2f5', borderRadius: '8px' }}>
              <p style={{ margin: '0', fontWeight: 'bold', fontSize: '14px' }}>Welcome, {student.name}</p>
              <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '12px' }}>Matric: {student.matric}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== SHOW VOTING PORTAL =====
  return (
    <div>
      {/* DESKTOP VOTING */}
      <div className="election-desktop" style={baseStyles}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ margin: 0, fontSize: '24px' }}>Student Voting Portal</h1>
          <button onClick={handleLogout} style={{
            padding: '8px 20px', background: '#dc2626', color: 'white',
            border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer'
          }}>Logout</button>
        </div>

        <div style={{
          background: 'white', color: '#003366', padding: '20px 24px',
          borderRadius: '8px', marginBottom: '24px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px'
        }}>
          <div>
            <strong>Welcome, {student.name}</strong>
            <span style={{ color: '#666', marginLeft: '12px', fontSize: '13px' }}>{student.matric}</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#666' }}>Year: {settings.year}</span>
            <div style={{
              display: 'inline-block', padding: '4px 14px', borderRadius: '20px',
              background: '#16a34a', color: 'white', fontWeight: 'bold', fontSize: '12px'
            }}>LIVE</div>
            <span style={{ fontSize: '12px', color: '#888' }}>
              Closes: {settings.endDate} {settings.endTime}
            </span>
          </div>
        </div>

        {hasVoted ? (
          <div style={{ background: 'white', color: '#003366', padding: '40px', borderRadius: '8px', textAlign: 'center' }}>
            <h2 style={{ margin: 0, color: '#16a34a' }}>You have already voted. Thank you.</h2>
          </div>
        ) : candidates.length === 0 ? (
          <div style={{ background: 'white', color: '#003366', padding: '40px', borderRadius: '8px', textAlign: 'center' }}>
            <h2>No Candidates Yet</h2>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {candidates.map(candidate => (
              <div key={candidate.id} style={{
                background: 'white', color: '#003366', borderRadius: '8px', padding: '24px',
                textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                {candidate.photoURL && (
                  <img src={candidate.photoURL} alt={candidate.name}
                    style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', marginBottom: '12px' }}
                    onError={(e) => { e.target.style.display = 'none'; }} />
                )}
                <h2 style={{ margin: '0 0 4px 0', fontSize: '20px' }}>{candidate.name}</h2>
                <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '14px' }}>Position: {candidate.position}</p>
                <p style={{ margin: '0 0 16px 0', color: '#888', fontSize: '13px', fontStyle: 'italic' }}>
                  {candidate.manifesto || 'No manifesto provided'}
                </p>
                <button onClick={() => handleVote(candidate.id)} style={{
                  width: '100%', padding: '12px', background: '#16a34a', color: 'white',
                  border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px'
                }}>Vote</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MOBILE VOTING */}
      <div className="election-mobile" style={baseStyles}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h1 style={{ margin: 0, fontSize: '20px' }}>Student Voting Portal</h1>
          <button onClick={handleLogout} style={{
            padding: '6px 16px', background: '#dc2626', color: 'white',
            border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px'
          }}>Logout</button>
        </div>
        <div style={{
          background: 'white', color: '#003366', padding: '16px',
          borderRadius: '8px', marginBottom: '16px'
        }}>
          <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', fontSize: '14px' }}>Welcome, {student.name}</p>
          <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '12px' }}>{student.matric}</p>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: '#666' }}>Year: {settings.year}</span>
            <div style={{
              display: 'inline-block', padding: '3px 12px', borderRadius: '20px',
              background: '#16a34a', color: 'white', fontWeight: 'bold', fontSize: '11px'
            }}>LIVE</div>
            <span style={{ fontSize: '11px', color: '#888' }}>Ends: {settings.endDate} {settings.endTime}</span>
          </div>
        </div>
        {hasVoted ? (
          <div style={{ background: 'white', color: '#003366', padding: '24px', borderRadius: '8px', textAlign: 'center' }}>
            <h2 style={{ margin: 0, color: '#16a34a', fontSize: '18px' }}>You have already voted. Thank you.</h2>
          </div>
        ) : candidates.length === 0 ? (
          <div style={{ background: 'white', color: '#003366', padding: '24px', borderRadius: '8px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '18px' }}>No Candidates Yet</h2>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {candidates.map(candidate => (
              <div key={candidate.id} style={{
                background: 'white', color: '#003366', borderRadius: '8px', padding: '20px', textAlign: 'center'
              }}>
                {candidate.photoURL && (
                  <img src={candidate.photoURL} alt={candidate.name}
                    style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', marginBottom: '10px' }}
                    onError={(e) => { e.target.style.display = 'none'; }} />
                )}
                <h2 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>{candidate.name}</h2>
                <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '13px' }}>Position: {candidate.position}</p>
                <p style={{ margin: '0 0 14px 0', color: '#888', fontSize: '12px', fontStyle: 'italic' }}>
                  {candidate.manifesto || 'No manifesto provided'}
                </p>
                <button onClick={() => handleVote(candidate.id)} style={{
                  width: '100%', padding: '12px', background: '#16a34a', color: 'white',
                  border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px'
                }}>Vote</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
