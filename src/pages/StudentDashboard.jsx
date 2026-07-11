import { useState, useEffect } from 'react';

export default function StudentDashboard() {
  const [candidates, setCandidates] = useState([]);
  const [settings, setSettings] = useState({});
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('candidates')) || [];
    const savedSettings = JSON.parse(localStorage.getItem('electionSettings')) || {};
    setCandidates(saved);
    setSettings(savedSettings);
    setHasVoted(localStorage.getItem('voted') === 'true');
  }, []);

  const isElectionReady = settings.isActive && candidates.length > 0 && settings.date && settings.time;
  const electionDateTime = new Date(`${settings.date}T${settings.time}`);
  const isElectionTime = new Date() >= electionDateTime;

  const handleVote = (id) => {
    const updated = candidates.map(c => c.id === id? {...c, votes: c.votes + 1} : c);
    setCandidates(updated);
    localStorage.setItem('candidates', JSON.stringify(updated));
    localStorage.setItem('voted', 'true');
    setHasVoted(true);
    alert('Vote Submitted Successfully');
  }

  if (!isElectionReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 to-black flex items-center justify-center text-white px-4">
        <h1 className="text-5xl font-bold text-center">ELECTION COMING SOON</h1>
      </div>
    );
  }

  if (!isElectionTime) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 to-black flex items-center justify-center text-white px-4">
        <h1 className="text-5xl font-bold text-center">ELECTION COMING SOON</h1>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-2 text-center">Student Voting Portal</h1>
      <p className="text-center mb-6">Election Year: {settings.year}</p>
      {hasVoted? <p className="text-green-600 text-center text-xl">You have already voted. Thank you.</p> :
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
      </div>}
    </div>
  );
}
