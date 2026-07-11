import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [tab, setTab] = useState('settings');
  const [candidates, setCandidates] = useState([]);
  const [settings, setSettings] = useState({ year: '', date: '', time: '', isActive: false });
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [dept, setDept] = useState('');
  const [manifesto, setManifesto] = useState('');
  const [photo, setPhoto] = useState('');

  useEffect(() => {
    const savedCandidates = JSON.parse(localStorage.getItem('candidates')) || [];
    const savedSettings = JSON.parse(localStorage.getItem('electionSettings')) || {};
    setCandidates(savedCandidates);
    setSettings(savedSettings);
  }, []);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => { setPhoto(reader.result); };
    reader.readAsDataURL(file);
  }

  const saveSettings = () => {
    if(!settings.year ||!settings.date ||!settings.time) { alert('Please fill Year, Date and Time'); return; }
    const newSettings = {...settings, isActive: true };
    setSettings(newSettings);
    localStorage.setItem('electionSettings', JSON.stringify(newSettings));
    alert('Election Settings Saved. Student Portal is now LIVE');
  }

  const addCandidate = () => {
    if(name && position) {
      const newCandidates = [...candidates, { id: Date.now(), name, position, dept, manifesto, photo, votes: 0 }];
      setCandidates(newCandidates);
      localStorage.setItem('candidates', JSON.stringify(newCandidates));
      setName(''); setPosition(''); setDept(''); setManifesto(''); setPhoto('');
      alert('Candidate Added Successfully');
    }
  }

  const printResults = () => { window.print(); }
  const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="flex flex-wrap gap-4 mb-6">
        <button onClick={() => setTab('settings')} className={`px-4 py-2 rounded font-semibold ${tab === 'settings'? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Election Settings</button>
        <button onClick={() => setTab('candidates')} className={`px-4 py-2 rounded font-semibold ${tab === 'candidates'? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Manage Candidates</button>
        <button onClick={() => setTab('results')} className={`px-4 py-2 rounded font-semibold ${tab === 'results'? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>View Results</button>
      </div>

      {tab === 'settings' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Set Election Details</h2>
          <input type="text" placeholder="Election Year e.g 2026/2027" value={settings.year} onChange={e => setSettings({...settings, year: e.target.value})} className="w-full p-2 border rounded mb-3" />
          <input type="date" value={settings.date} onChange={e => setSettings({...settings, date: e.target.value})} className="w-full p-2 border rounded mb-3" />
          <input type="time" value={settings.time} onChange={e => setSettings({...settings, time: e.target.value})} className="w-full p-2 border rounded mb-3" />
          <button onClick={saveSettings} className="bg-green-600 text-white px-4 py-2 rounded">Activate Election</button>
          <p className="mt-3 text-sm font-bold">Status: {settings.isActive? 'LIVE' : 'COMING SOON'}</p>
        </div>
      )}

      {tab === 'candidates' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-blue-100 p-6 rounded-lg shadow">Total Candidates: {candidates.length}</div>
            <div className="bg-green-100 p-6 rounded-lg shadow">Total Votes: {totalVotes}</div>
            <div className="bg-yellow-100 p-6 rounded-lg shadow">Year: {settings.year || 'Not Set'}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-bold mb-4">Add/Edit Candidate</h2>
            <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded mb-3" />
            <input type="text" placeholder="Position e.g President" value={position} onChange={e => setPosition(e.target.value)} className="w-full p-2 border rounded mb-3" />
            <input type="text" placeholder="Department - Admin Only" value={dept} onChange={e => setDept(e.target.value)} className="w-full p-2 border rounded mb-3" />
            <textarea placeholder="Manifesto" value={manifesto} onChange={e => setManifesto(e.target.value)} className="w-full p-2 border rounded mb-3 h-24"></textarea>
            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="w-full p-2 border rounded mb-3" />
            {photo && <img src={photo} className="w-24 h-24 object-cover rounded mb-3" />}
            <button onClick={addCandidate} className="bg-green-600 text-white px-4 py-2 rounded">Add Candidate</button>
          </div>
        </div>
      )}

      {tab === 'results' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-bold">Live Election Results - {settings.year}</h2>
            <button onClick={printResults} className="bg-red-600 text-white px-4 py-2 rounded">Print Results</button>
          </div>
          <table className="w-full border">
            <thead><tr className="bg-gray-100"><th className="p-3 border text-left">S/N</th><th className="p-3 border text-left">Candidate</th><th className="p-3 border text-left">Position</th><th className="p-3 border text-left">Votes</th></tr></thead>
            <tbody>
              {candidates.sort((a,b) => b.votes - a.votes).map((c, index) => (
                <tr key={c.id}><td className="p-3 border">{index + 1}</td><td className="p-3 border flex items-center gap-2"><img src={c.photo} className="w-10 h-10 rounded-full"/>{c.name}</td><td className="p-3 border">{c.position}</td><td className="p-3 border font-bold">{c.votes}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
