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

  const baseStyles = { fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#003366', color: 'white', padding: '32px' };
  const centerStyles = { ...baseStyles, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' };

  if (error) {
    return (
      <div style={centerStyles}>
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '24px', borderRadius: '8px', maxWidth: '400px' }}>
          <h2 style={{ margin: '0 0 12px 0' }}>⚠️ ERROR</h2>
          <p style={{ margin: '0 0 16px 0' }}>{error}</p>
          <button onClick={() => navigate('/student-login')} style={{padding:'10px 24px',background:'white',color:'#dc2626',border:'none',borderRadius:'4px',cursor:'pointer',fontWeight:'bold'}}>Go to Login</button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={centerStyles}>
        <p>Loading Voting Portal...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div style={centerStyles}>
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '24px', borderRadius: '8px', maxWidth: '400px' }}>
          <h2 style={{ margin: '0 0 12px 0' }}>⚠️ NOT LOGGED IN</h2>
          <p style={{ margin: '0 0 16px 0' }}>Please Login First</p>
          <button onClick={() => navigate('/student-login')} style={{padding:'10px 24px',background:'white',color:'#dc2626',border:'none',borderRadius:'4px',cursor:'pointer',fontWeight:'bold'}}>Go to Login</button>
        </div>
      </div>
    );
  }

  if (!isElectionReady || !isElectionTime) {
    return (
      <div style={centerStyles}>
        <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
          <button onClick={handleLogout} style={{padding:'8px 16px',background:'#dc2626',color:'white',border:'none',borderRadius:'4px',cursor:'pointer'}}>Logout</button>
        </div>
        <h1 style={{ color: '#ffd700', fontSize: '36px', marginBottom: '16px' }}>ELECTION COMING SOON</h1>
        {isElectionReady && settings.date && settings.time && (
          <p>Election starts: {settings.date} at {settings.time}</p>
        )}
        {!isElectionReady && (
          <p>The election has not been configured yet by the admin.</p>
        )}
        <p>Welcome, {student.name}</p>
        <p>Matric: {student.matric}</p>
      </div>
    );
  }

  return (
    <div style={baseStyles}>
      <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
        <button onClick={handleLogout} style={{padding:'8px 16px',background:'#dc2626',color:'white',border:'none',borderRadius:'4px',cursor:'pointer'}}>Logout</button>
      </div>
      
      <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', fontSize: '30px', marginBottom: '24px' }}>Student Voting Portal</h1>
        <p style={{ textAlign: 'center', marginBottom: '24px' }}>Welcome, {student.name} - {student.matric}</p>
        <p style={{ textAlign: 'center', marginBottom: '24px' }}>Election Year: {settings.year}</p>
        
        {hasVoted ? (
          <p style={{ textAlign: 'center', color: '#86efac', fontSize: '18px' }}>You have already voted. Thank you.</p>
        ) : candidates.length === 0 ? (
          <p style={{ textAlign: 'center' }}>No Candidates Yet</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {candidates.map(candidate => (
              <div key={candidate.id} style={{ background: 'white', color: '#1f2937', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                {candidate.photoURL && (
                  <img src={candidate.photoURL} alt={candidate.name} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 12px', display: 'block' }} onError={(e) => { e.target.style.display = 'none'; }} />
                )}
                <h2 style={{ margin: '0 0 8px', textAlign: 'center' }}>{candidate.name}</h2>
                <p style={{ margin: '0 0 4px', textAlign: 'center', color: '#2563eb', fontWeight: '600' }}>Position: {candidate.position}</p>
                <p style={{ margin: '0 0 16px', color: '#6b7280', fontSize: '14px' }}><strong>Manifesto:</strong> {candidate.manifesto || 'No manifesto provided'}</p>
                <button onClick={() => handleVote(candidate.id)} style={{width:'100%',padding:'12px',background:'#16a34a',color:'white',border:'none',borderRadius:'6px',fontWeight:'bold',cursor:'pointer',fontSize:'16px'}}>Vote</button>
              </div>
            ))}
          </div>
        )}
        <p style={{ marginTop: '32px', fontSize: '11px', textAlign: 'center', opacity: '0.5' }}>Authorized and Verified by Meta EC</p>
      </div>
    </div>
  );
}
