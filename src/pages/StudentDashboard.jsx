import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Watermark from '../components/Watermark';

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState([]);
  const [settings, setSettings] = useState({});
  const [hasVoted, setHasVoted] = useState(false);
  const [student, setStudent] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('candidates')) || [];
      const savedSettings = JSON.parse(localStorage.getItem('electionSettings')) || {};
      const savedStudent = JSON.parse(localStorage.getItem('studentInfo'));

      if (!savedStudent) {
        navigate('/student-login');
        return;
      }

      setStudent(savedStudent);
      setCandidates(saved);
      setSettings(savedSettings);
      setHasVoted(localStorage.getItem('voted') === 'true');
    } catch (e) {
      console.log("Error loading data", e);
    }
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('studentInfo');
    localStorage.removeItem('voted');
    navigate('/student-login');
  };

  const isElectionReady = settings.isActive && candidates.length > 0 && settings.date && settings.time;
  const electionDateTime = settings.date && settings.time ? new Date(`${settings.date}T${settings.time}`) : null;
  const isElectionTime = electionDateTime ? new Date() >= electionDateTime : false;

  const handleVote = (id) => {
    const updated = candidates.map(c => c.id === id ? { ...c, votes: (c.votes || 0) + 1 } : c);
    setCandidates(updated);
    localStorage.setItem('candidates', JSON.stringify(updated));
    localStorage.setItem('voted', 'true');
    setHasVoted(true);
    alert('Vote Submitted Successfully');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy flex flex-col items-center justify-center text-white">
        <Watermark />
        <p className="mt-4 text-lg">Loading Voting Portal...</p>
      </div>
    );
  }

  if (!student) {
    return <div className="min-h-screen bg-navy flex items-center justify-center text-white">Redirecting...</div>;
  }

  if (!isElectionReady || !isElectionTime) {
    return (
      <div className="min-h-screen bg-navy flex flex-col items-center justify-center text-white p-8">
        <Watermark />
        <button onClick={handleLogout} className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Logout</button>
        <h1 className="text-4xl font-bold text-gold mb-4">ELECTION COMING SOON</h1>
        {isElectionReady && settings.date && settings.time && (
          <p className="text-lg mb-2">Election starts: {settings.date} at {settings.time}</p>
        )}
        <p className="text-xl">Welcome, {student.name}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy text-white p-8">
      <Watermark />
      <button onClick={handleLogout} className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Logout</button>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gold mb-6">Student Voting Portal</h1>
        <p className="mb-2">Welcome, {student.name} - {student.matric}</p>
        <p className="mb-6">Election Year: {settings.year}</p>

        {hasVoted ? (
          <p className="text-green-400 text-xl font-bold">You have already voted. Thank you.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {candidates.map(candidate => (
              <div key={candidate.id} className="bg-white text-gray-800 rounded-lg p-6 shadow-lg">
                {candidate.photoURL && (
                  <img
                    src={candidate.photoURL}
                    alt={candidate.name}
                    className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
                <h2 className="text-xl font-bold text-center">{candidate.name}</h2>
                <p className="text-center text-gray-600">Position: {candidate.position}</p>
                <p className="mt-2 text-sm"><strong>Manifesto:</strong> {candidate.manifesto || 'No manifesto provided'}</p>
                <button
                  onClick={() => handleVote(candidate.id)}
                  className="mt-4 w-full bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-bold"
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
