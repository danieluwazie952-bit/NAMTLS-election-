import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [settings, setSettings] = useState({});
  const [hasVoted, setHasVoted] = useState(false);
  const [student, setStudent] = useState(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [voteConfirmed, setVoteConfirmed] = useState(false);
  const navigate = useNavigate();

  const tutorialSteps = [
    {
      title: 'Welcome to the NAMATL Student E-Voting Portal',
      content: 'This is the official platform for casting your vote in the Student Union Election. Please read the instructions carefully before proceeding.'
    },
    {
      title: 'How to Vote',
      content: '1. You will see a list of all candidates running for various positions.\n2. Review each candidate\'s name, position, and manifesto.\n3. Click the "Vote" button under your preferred candidate.\n4. You can only vote ONCE and for ONE candidate.'
    },
    {
      title: 'Important Rules',
      content: '• Each student can vote only ONCE\n• Your vote is final and cannot be changed after submission\n• You can only vote for one candidate\n• Ensure you have reviewed all candidates before voting\n• Do not share your voting access with anyone'
    },
    {
      title: 'Ready to Vote?',
      content: 'If you have read and understood all the instructions, click "Proceed to Vote" to access the ballot. If you need to review the instructions again, click "Review Again".'
    }
  ];

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
      const voted = localStorage.getItem('voted') === 'true';
      setHasVoted(voted);
      const tutorialDone = localStorage.getItem('tutorialDone_' + savedStudent.matric) === 'true';
      setShowTutorial(!voted && !tutorialDone);
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

  const handleNextTutorial = () => {
    if (tutorialStep < tutorialSteps.length - 1) {
      setTutorialStep(tutorialStep + 1);
    }
  };

  const handlePreviousTutorial = () => {
    if (tutorialStep > 0) {
      setTutorialStep(tutorialStep - 1);
    }
  };

  const handleProceedToVote = () => {
    if (student) {
      localStorage.setItem('tutorialDone_' + student.matric, 'true');
    }
    setShowTutorial(false);
    setTutorialStep(0);
  };

  const handleReviewAgain = () => {
    setTutorialStep(0);
  };

  const handleVote = (id) => {
    if (!isVotingOpen) {
      alert('Voting is not currently open.');
      return;
    }
    if (!voteConfirmed) {
      const confirmVote = window.confirm('Are you sure you want to vote for this candidate? This action CANNOT be undone.');
      if (!confirmVote) return;
    }
    const updated = candidates.map(c => c.id === id ? { ...c, votes: (c.votes || 0) + 1 } : c);
    setCandidates(updated);
    localStorage.setItem('candidates', JSON.stringify(updated));
    localStorage.setItem('voted', 'true');
    setHasVoted(true);
    setVoteConfirmed(true);
    alert('Vote Submitted Successfully! Thank you for participating.');
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
        <button onClick={() => navigate('/student-login')} style={{ padding: '10px 24px', background: 'white', color: '#dc2626', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Go to Login</button>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={centerStyles}>
        <h1 style={{ fontSize: '24px', margin: '0 0 8px 0' }}>NAMATL STUDENT E-VOTING</h1>
        <hr style={{ width: '60%', border: 'none', borderTop: '2px solid #FFD700', margin: '12px auto' }} />
        <div style={{ border: '4px solid #FFD700', borderTop: '4px solid transparent', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '20px auto' }}></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div style={centerStyles}>
        <h2>NOT LOGGED IN</h2>
        <p>Please Login First</p>
        <button onClick={() => navigate('/student-login')} style={{ padding: '10px 24px', background: 'white', color: '#dc2626', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Go to Login</button>
      </div>
    );
  }

  const statusBadge = getElectionStatusBadge();

  // TUTORIAL POPUP OVERLAY
  if (showTutorial && isVotingOpen && !hasVoted) {
    const step = tutorialSteps[tutorialStep];
    const isLastStep = tutorialStep === tutorialSteps.length - 1;
    return (
      <div style={baseStyles}>
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }}>
          <div style={{
            background: 'white',
            color: '#003366',
            borderRadius: '12px',
            maxWidth: '550px',
            width: '90%',
            padding: '32px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            position: 'relative'
          }}>
            {/* Step indicator */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '20px'
            }}>
              {tutorialSteps.map((_, i) => (
                <div key={i} style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: i === tutorialStep ? '#FFD700' : '#d1d5db',
                  transition: 'background 0.3s'
                }} />
              ))}
            </div>

            {/* Step number */}
            <div style={{
              textAlign: 'center',
              color: '#9ca3af',
              fontSize: '12px',
              fontWeight: 'bold',
              marginBottom: '8px',
              letterSpacing: '2px'
            }}>
              STEP {tutorialStep + 1} OF {tutorialSteps.length}
            </div>

            {/* Title */}
            <h2 style={{
              textAlign: 'center',
              margin: '0 0 16px 0',
              fontSize: '20px',
              color: '#003366'
            }}>
              {step.title}
            </h2>

            <hr style={{
              width: '60px',
              border: 'none',
              borderTop: '3px solid #FFD700',
              margin: '0 auto 20px auto'
            }} />

            {/* Content */}
            <div style={{
              padding: '16px',
              background: '#f8fafc',
              borderRadius: '8px',
              marginBottom: '24px',
              fontSize: '14px',
              lineHeight: '1.7',
              color: '#374151',
              whiteSpace: 'pre-line'
            }}>
              {step.content}
            </div>

            {/* Navigation buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px'
            }}>
              {tutorialStep > 0 ? (
                <button
                  onClick={handlePreviousTutorial}
                  style={{
                    padding: '10px 20px',
                    background: '#e5e7eb',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  ← Previous
                </button>
              ) : (
                <div />
              )}

              {isLastStep ? (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={handleReviewAgain}
                    style={{
                      padding: '10px 20px',
                      background: '#fef3c7',
                      color: '#92400e',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Review Again
                  </button>
                  <button
                    onClick={handleProceedToVote}
                    style={{
                      padding: '10px 24px',
                      background: '#16a34a',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Proceed to Vote →
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleNextTutorial}
                  style={{
                    padding: '10px 24px',
                    background: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Next →
                </button>
              )}
            </div>

            {/* Skip link */}
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button
                onClick={handleProceedToVote}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  fontSize: '12px',
                  textDecoration: 'underline'
                }}
              >
                Skip tutorial and vote now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // NOT VOTING OPEN VIEW (before election starts or after it ends)
  if (!isVotingOpen) {
    return (
      <div style={{ minHeight: '100vh', background: '#003366', color: 'white', fontFamily: 'Arial, sans-serif', padding: '0' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px' }}>
          <button onClick={handleLogout} style={{ padding: '8px 20px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Logout</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 80px)', padding: '16px' }}>
          <div style={{ background: 'white', color: '#003366', padding: '32px 48px', borderRadius: '12px', maxWidth: '500px', width: '100%', textAlign: 'center' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '28px' }}>{isElectionEnded ? 'ELECTION ENDED' : 'ELECTION IS COMING SOON'}</h2>
            <hr style={{ width: '80px', border: 'none', borderTop: '3px solid #FFD700', margin: '12px auto' }} />
            <div style={{ display: 'inline-block', padding: '6px 20px', borderRadius: '20px', background: statusBadge.color, color: 'white', fontWeight: 'bold', fontSize: '14px', margin: '12px 0' }}>{statusBadge.text}</div>
            <p style={{ color: '#666', margin: '16px 0' }}>{getElectionStatusText()}</p>
            {settings.startDate && (
              <div style={{ fontSize: '13px', color: '#888', marginTop: '8px' }}>{settings.startDate} at {settings.startTime}{settings.endDate && ` → ${settings.endDate} at ${settings.endTime}`}</div>
            )}
            <div style={{ marginTop: '24px', padding: '16px', background: '#f0f2f5', borderRadius: '8px' }}>
              <p style={{ margin: '0', fontWeight: 'bold', fontSize: '16px' }}>Welcome, {student.name}</p>
              <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '13px' }}>Matric: {student.matric}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // MAIN VOTING VIEW
  return (
    <div style={baseStyles}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>Student Voting Portal</h1>
        <button onClick={handleLogout} style={{ padding: '8px 20px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Logout</button>
      </div>

      {/* Info Bar */}
      <div style={{ background: 'white', color: '#003366', padding: '20px 24px', borderRadius: '8px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <strong>Welcome, {student.name}</strong>
          <span style={{ color: '#666', marginLeft: '12px', fontSize: '13px' }}>{student.matric}</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: '#666' }}>Year: {settings.year}</span>
          <div style={{ display: 'inline-block', padding: '4px 14px', borderRadius: '20px', background: '#16a34a', color: 'white', fontWeight: 'bold', fontSize: '12px' }}>LIVE</div>
          <span style={{ fontSize: '12px', color: '#888' }}>Closes: {settings.endDate} {settings.endTime}</span>
        </div>
      </div>

      {hasVoted ? (
        <div style={{ background: 'white', color: '#003366', padding: '60px 40px', borderRadius: '8px', textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 12px 0', color: '#16a34a' }}>✓ You have already voted. Thank you.</h2>
          <p style={{ color: '#666', margin: '0' }}>Your vote has been recorded successfully.</p>
        </div>
      ) : candidates.length === 0 ? (
        <div style={{ background: 'white', color: '#003366', padding: '60px 40px', borderRadius: '8px', textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 8px 0' }}>No Candidates Available</h2>
          <p style={{ color: '#666', margin: '0' }}>The admin has not added any candidates yet.</p>
        </div>
      ) : (
        <>
          {/* Tutorial re-open button */}
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <button
              onClick={() => {
                setShowTutorial(true);
                setTutorialStep(0);
              }}
              style={{
                background: 'rgba(255,255,255,0.15)',
                color: '#FFD700',
                border: '1px solid rgba(255,215,0,0.3)',
                borderRadius: '6px',
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 'bold'
              }}
            >
              ? Review Voting Instructions
            </button>
          </div>

          {/* Candidates Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {candidates.map(candidate => (
              <div key={candidate.id} style={{ background: 'white', color: '#003366', borderRadius: '8px', padding: '24px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                {candidate.photoURL && (
                  <img src={candidate.photoURL} alt={candidate.name} style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', marginBottom: '12px' }}
                    onError={(e) => { e.target.style.display = 'none'; }} />
                )}
                <h2 style={{ margin: '0 0 4px 0', fontSize: '20px' }}>{candidate.name}</h2>
                <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '14px' }}>Position: {candidate.position}</p>
                <p style={{ margin: '0 0 16px 0', color: '#888', fontSize: '13px', fontStyle: 'italic' }}>{candidate.manifesto || 'No manifesto provided'}</p>
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
                    fontSize: '16px',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => e.target.style.background = '#15803d'}
                  onMouseLeave={e => e.target.style.background = '#16a34a'}
                >
                  Vote
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
