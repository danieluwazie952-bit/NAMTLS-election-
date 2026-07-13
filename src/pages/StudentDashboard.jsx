import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState([]);
  const [settings, setSettings] = useState({});
  const [hasVoted, setHasVoted] = useState(false);
  const [student, setStudent] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('candidates')) || [];
    const savedSettings = JSON.parse(localStorage.getItem('electionSettings')) || {};
    const savedStudent = JSON.parse(localStorage.getItem('studentInfo'));

    if(!savedStudent) {
      navigate('/student-login'); // If not logged in, send back
      return;
    }

    setStudent(savedStudent);
    setCandidates(saved);
    setSettings(savedSettings);
    setHasVoted(localStorage.getItem('voted') === 'true');
    setLoading(false); // Stop loading only after we check everything
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('studentInfo');
    navigate('/student-login');
  };

  // FIX 1: Add default values so it doesn't crash
  const isElectionReady = settings.isActive && candidates.length > 0 && settings.date && settings.time;
  const electionDateTime = settings.date && settings.time? new Date(`${settings.date}T${settings.time}`) : new Date(0);
  const isElectionTime = new Date() >= electionDateTime;

  const handleVote = (id) => {
    const updated = candidates.map(c => c.id === id? {...c, votes: (c.votes || 0) + 1} : c);
    setCandidates(updated);
    localStorage.setItem('candidates', JSON.stringify(updated));
    localStorage.setItem('voted', 'true');
    setHasVoted(true);
    alert('Vote Submitted Successfully');
  }

  if(loading) {
    return (
      <div className="min-h-screen bg-green-800 flex-col items-center justify-center">
        <img src="/logo.png" alt="Logo" className="w-32 h-32 mb-4 animate-pulse" />
        <p className="text-white text-xl font-semibold">Loading Voting Portal...</p>
      </div>
    )
  }

  // FIX 2: Don't show student?.name if student is still null
  if (!student) return null;

  if (!isElectionReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 to-black flex flex-col items-center justify-center text-white px-4">
        <button onClick={handleLogout} className="absolute top-4 right-4 bg-red-600 px-4 py-2 rounded">Logout</button>
        <h1 className="text-5xl font-bold text-center">ELECTION NOT SETUP</h1>
        <p className="mt-4 text-lg">Welcome, {student.name}</p>
        <p className="mt-2 text-sm text-gray-300">Admin needs to add candidates and set election date/time</p>
      </div>
    );
  }

  if (!isElectionTime) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 to-black flex-col items-center justify-center text-white px-4">
        <button onClick={handleLogout} className="absolute top-4 right-4 bg-red-600 px-4 py-2 rounded">Logout</button>
        <h1 className="text-5xl font-bold text-center">ELECTION COMING SOON</h1>
        <p className="mt-4 text-lg">Election starts: {settings.date} at {settings.time}</p>
        <p className="mt-2">Welcome, {student.name}</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen relative">
      <img src="/logo.png" alt="Watermark" className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] opacity-5 pointer-events-none" />
      <button onClick={handleLogout} className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded z-20">Logout</button>

      <div className="relative z-10">
        <h1 className="text-3xl font-bold mb-2 text-center">Student Voting Portal</h1>
        <p className="text-center mb-2">Welcome, {student.name} - {student.matric}</p>
        <p className="text-center mb-6">Election Year: {settings.year}</p>
        {hasVoted? (
          <p className="text-green-600 text-center text-xl">You have already voted. Thank you.</p>
        ) : (
          <div className="grid gap-6 max-w-4xl mx-auto">
            {candidates.map(candidate => (
              <div key={candidate.id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <img src={candidate.photo} alt={candidate.name} className="w-32 h-32 object-cover rounded-full border-4 border-green-600" />
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">{candidate.name}</h2>
                    <p className="text-lg text-blue-700 font-semibold">Position: {candidate.position}</p>
                    <p className="mt-3"><b>Manifesto:</b> {candidate.manifesto || 'No manifesto provided'}</p>
                  </div>
                  <button onClick={() => handleVote(candidate.id)} className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-bold">Vote</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
