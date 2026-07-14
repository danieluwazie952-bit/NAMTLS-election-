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

  const isElectionReady = settings.isActive && candidates.length > 0 && settings.date && settings.time;
  const electionDateTime = settings.date && settings.time ? new Date(settings.date + 'T' + settings.time) : null;
  const isElectionTime = electionDateTime ? new Date() >= electionDateTime : false;

  const handleVote = (id) => {
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
        <h2 style={{ color: '#ef4444', marginBottom: '16px' }}>ERROR</h2>
        <p style={{ marginBottom: '20px', color: '#ccc' }}>{error}</p>
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
          Go to Login
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={centerStyles}>
        <h1>NAMATL STUDENT E-VOTING</h1>
        <hr style={{ width: '80px', border: '2px solid #FFD700', margin: '16px auto' }} />
      </div>
    );
  }

  if (!student) {
    return (
      <div style={centerStyles}>
        <h2 style={{ color: '#ef4444', marginBottom: '16px' }}>NOT LOGGED IN</h2>
        <p style={{ marginBottom: '20px', color: '#ccc' }}>Please Login First</p>
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
          Go to Login
        </button>
      </div>
    );
  }

  if (!isElectionReady || !isElectionTime) {
    return (
      <div className="dashboard-container" style={centerStyles}>
        <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '13px'
            }}
          >
            Logout
          </button>
        </div>

        <div className="election-desktop" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <h1 style={{ fontSize: '36px', margin: '0 0 8px 0' }}>
            ELECTION IS COMING SOON
          </h1>
          <hr style={{ width: '80px', border: '2px solid #FFD700', marginBottom: '24px' }} />

          {isElectionReady && settings.date && settings.time && (
            <p style={{ color: '#FFD700', marginBottom: '8px' }}>
              Election starts: {settings.date} at {settings.time}
            </p>
          )}
          {!isElectionReady && (
            <p style={{ color: '#ccc', marginBottom: '8px' }}>
              The election has not been configured yet by the admin.
            </p>
          )}

          <div style={{
            marginTop: '24px',
            padding: '16px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '8px'
          }}>
            <p style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '4px' }}>
              Welcome, {student.name}
            </p>
            <p style={{ color: '#ccc', fontSize: '14px' }}>
              Matric: {student.matric}
            </p>
          </div>
        </div>

        <div className="election-mobile" style={{
          display: 'none',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%'
        }}>
          <h1 style={{ fontSize: '20px', margin: '0 0 6px 0' }}>
            ELECTION IS COMING SOON
          </h1>
          <hr style={{ width: '60px', border: '2px solid #FFD700', marginBottom: '16px' }} />

          {isElectionReady && settings.date && settings.time && (
            <p style={{ color: '#FFD700', fontSize: '13px', marginBottom: '8px', textAlign: 'center' }}>
              Election starts: {settings.date} at {settings.time}
            </p>
          )}
          {!isElectionReady && (
            <p style={{ color: '#ccc', fontSize: '13px', marginBottom: '8px', textAlign: 'center' }}>
              The election has not been configured yet by the admin.
            </p>
          )}

          <div style={{
            marginTop: '16px',
            padding: '12px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '8px',
            width: '100%',
            maxWidth: '320px',
            textAlign: 'center'
          }}>
            <p style={{ fontWeight: 'bold', fontSize: '15px', marginBottom: '2px' }}>
              Welcome, {student.name}
            </p>
            <p style={{ color: '#ccc', fontSize: '12px' }}>
              Matric: {student.matric}
            </p>
          </div>
        </div>

      </div>
    );
  }

  return (
    <div className="dashboard-container" style={baseStyles}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
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

      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>
          Student Voting Portal
        </h1>
        <p style={{ color: '#ccc', marginBottom: '24px' }}>
          Welcome, {student.name} - {student.matric}
        </p>
        <p style={{ color: '#FFD700', marginBottom: '24px' }}>
          Election Year: {settings.year}
        </p>

        {hasVoted ? (
          <div style={{
            padding: '32px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h2 style={{ color: '#16a34a' }}>You have already voted. Thank you.</h2>
          </div>
        ) : candidates.length === 0 ? (
          <div style={{
            padding: '32px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h2>No Candidates Yet</h2>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {candidates.map(candidate => (
              <div
                key={candidate.id}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '20px',
                  textAlign: 'center'
                }}
              >
                {candidate.photoURL && (
                  <img
                    src={candidate.photoURL}
                    alt={candidate.name}
                    style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      marginBottom: '12px'
                    }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
                <h2 style={{ marginBottom: '4px' }}>{candidate.name}</h2>
                <p style={{ color: '#FFD700', marginBottom: '4px' }}>
                  Position: {candidate.position}
                </p>
                <p style={{ fontSize: '13px', color: '#ccc', marginBottom: '12px' }}>
                  <strong>Manifesto:</strong> {candidate.manifesto || 'No manifesto provided'}
                </p>
                <button
                  onClick={() => handleVote(candidate.id)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#16a34a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  Vote
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
