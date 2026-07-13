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
        <div style={{background:'#dc2626',padding:'24px',borderRadius:'8px',maxWidth:'500px',width:'100%'}}>
          <h2 style={{margin:'0 0 12px 0',fontSize:'20px'}}>⚠️ ERROR</h2>
          <p style={{margin:'0 0 16px 0',fontSize:'14px',fontFamily:'monospace',wordBreak:'break-word'}}>{error}</p>
          <button onClick={() => navigate('/student-login')} style={{padding:'10px 24px',background:'white',color:'#dc2626',border:'none',borderRadius:'4px',cursor:'pointer',fontWeight:'bold'}}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={centerStyles}>
        <p style={{fontSize:'18px'}}>Loading Voting Portal...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div style={centerStyles}>
        <div style={{background:'#dc2626',padding:'24px',borderRadius:'8px',maxWidth:'500px',width:'100%'}}>
          <h2 style={{margin:'0 0 12px 0',fontSize:'20px'}}>⚠️ NOT LOGGED IN</h2>
          <p style={{margin:'0 0 16px 0',fontSize:'14px'}}>Please Login First</p>
          <button onClick={() => navigate('/student-login')} style={{padding:'10px 24px',background:'white',color:'#dc2626',border:'none',borderRadius:'4px',cursor:'pointer',fontWeight:'bold'}}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!isElectionReady || !isElectionTime) {
    return (
      <div style={centerStyles}>
        <button onClick={handleLogout} style={{position:'absolute',top:'16px',right:'16px',background:'#dc2626',color:'white',padding:'8px 16px',border:'none',borderRadius:'4px',cursor:'pointer',fontSize:'14px'}}>Logout</button>
        <h1 style={{fontSize:'36px',fontWeight:'bold',color:'#FFD700',marginBottom:'16px'}}>ELECTION COMING SOON</h1>
        {isElectionReady && settings.date && settings.time && (
          <p style={{fontSize:'18px',marginBottom:'8px'}}>Election starts: {settings.date} at {settings.time}</p>
        )}
        {!isElectionReady && (
          <p style={{fontSize:'16px',color:'#94a3b8',marginBottom:'16px'}}>The election has not been configured yet by the admin.</p>
        )}
        <p style={{fontSize:'20px'}}>Welcome, {student.name}</p>
        <p style={{fontSize:'14px',color:'#94a3b8',marginTop:'8px'}}>Matric: {student.matric}</p>
      </div>
    );
  }

  return (
    <div style={baseStyles}>
      <button onClick={handleLogout} style={{position:'absolute',top:'16px',right:'16px',background:'#dc2626',color:'white',padding:'8px 16px',border:'none',borderRadius:'4px',cursor:'pointer',fontSize:'14px'}}>Logout</button>
      <div style={{maxWidth:'800px',margin:'0 auto'}}>
        <h1 style={{fontSize:'30px',fontWeight:'bold',color:'#FFD700',marginBottom:'16px'}}>Student Voting Portal</h1>
        <p style={{marginBottom:'8px'}}>Welcome, {student.name} - {student.matric}</p>
        <p style={{marginBottom:'24px'}}>Election Year: {settings.year}</p>

        {hasVoted ? (
          <p style={{color:'#22c55e',fontSize:'20px',fontWeight:'bold'}}>You have already voted. Thank you.</p>
        ) : candidates.length === 0 ? (
          <p style={{color:'#facc15',fontSize:'18px',fontWeight:'bold'}}>No Candidates Yet</p>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:'24px'}}>
            {candidates.map(candidate => (
              <div key={candidate.id} style={{background:'white',color:'#333',borderRadius:'8px',padding:'24px',boxShadow:'0 4px 6px rgba(0,0,0,0.1)'}}>
                {candidate.photoURL && (
                  <img src={candidate.photoURL} alt={candidate.name}
                    style={{width:'96px',height:'96px',borderRadius:'50%',objectFit:'cover',margin:'0 auto 16px',display:'block'}}
                    onError={(e) => { e.target.style.display = 'none'; }} />
                )}
                <h2 style={{fontSize:'20px',fontWeight:'bold',textAlign:'center',marginBottom:'8px'}}>{candidate.name}</h2>
                <p style={{textAlign:'center',color:'#666',marginBottom:'8px'}}>Position: {candidate.position}</p>
                <p style={{fontSize:'14px',marginBottom:'16px'}}><strong>Manifesto:</strong> {candidate.manifesto || 'No manifesto provided'}</p>
                <button onClick={() => handleVote(candidate.id)}
                  style={{width:'100%',padding:'12px',background:'#16a34a',color:'white',border:'none',borderRadius:'6px',fontWeight:'bold',cursor:'pointer',fontSize:'16px'}}>
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
