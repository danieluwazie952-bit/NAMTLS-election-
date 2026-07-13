import { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import { collection, addDoc, getDocs, updateDoc, doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('settings');
  const [candidates, setCandidates] = useState([]);
  const [settings, setSettings] = useState({ year: '', date: '', time: '', isActive: false });
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [dept, setDept] = useState('');
  const [manifesto, setManifesto] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const candSnap = await getDocs(collection(db, "candidates"));
      setCandidates(candSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      const settingsSnap = await getDocs(collection(db, "settings"));
      if (settingsSnap.docs.length > 0) {
        setSettings(settingsSnap.docs[0].data());
      }
    } catch (e) {
      console.error("Error loading data:", e);
      alert("Could not connect to Firebase. Check your network and Firebase config.");
    }
    setLoading(false);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    setPhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => { setPhotoPreview(reader.result); };
    reader.readAsDataURL(file);
  };

  const saveSettings = async () => {
    if (!settings.year || !settings.date || !settings.time) {
      alert('Please fill Year, Date and Time');
      return;
    }
    const newSettings = { ...settings, isActive: true };
    await setDoc(doc(db, "settings", "main"), newSettings);
    setSettings(newSettings);
    alert('Election Settings Saved to Firebase. Student Portal is now LIVE');
  };

  const addCandidate = async () => {
    if (!name || !position) {
      alert('Please fill Name and Position');
      return;
    }
    let photoURL = '';
    if (photo) {
      const storageRef = ref(storage, `candidates/${Date.now()}_${photo.name}`);
      const snap = await uploadBytes(storageRef, photo);
      photoURL = await getDownloadURL(snap.ref);
    }
    await addDoc(collection(db, "candidates"), {
      name,
      position,
      dept,
      manifesto,
      photoURL,
      votes: 0
    });
    setName(''); setPosition(''); setDept(''); setManifesto('');
    setPhoto(null); setPhotoPreview('');
    loadData();
    alert('Candidate Added Successfully to Firebase');
  };

  const printResults = () => { window.print(); };
  const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <img src="/logo.png" alt="Logo" className="w-20 h-20 mb-4" onError={(e) => { e.target.style.display = 'none'; }} />
        <p className="text-lg">Loading Admin Panel...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-navy mb-6">Admin Dashboard</h1>
        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab('settings')} className={`px-4 py-2 rounded font-semibold ${tab === 'settings' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Election Settings</button>
          <button onClick={() => setTab('candidates')} className={`px-4 py-2 rounded font-semibold ${tab === 'candidates' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Manage Candidates</button>
          <button onClick={() => setTab('results')} className={`px-4 py-2 rounded font-semibold ${tab === 'results' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>View Results</button>
        </div>

        {tab === 'settings' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Set Election Details</h2>
            <input type="number" placeholder="Election Year" value={settings.year} onChange={(e) => setSettings({ ...settings, year: e.target.value })} className="w-full p-2 border rounded mb-3" />
            <input type="date" value={settings.date} onChange={(e) => setSettings({ ...settings, date: e.target.value })} className="w-full p-2 border rounded mb-3" />
            <input type="time" value={settings.time} onChange={(e) => setSettings({ ...settings, time: e.target.value })} className="w-full p-2 border rounded mb-3" />
            <button onClick={saveSettings} className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">Activate Election</button>
            <p className="mt-2">Status: <span className={settings.isActive ? 'text-green-600 font-bold' : 'text-yellow-600'}>{settings.isActive ? 'LIVE' : 'COMING SOON'}</span></p>
          </div>
        )}

        {tab === 'candidates' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="mb-4">
              <p>Total Candidates: {candidates.length}</p>
              <p>Total Votes Cast: {totalVotes}</p>
              <p>Year: {settings.year || 'Not Set'}</p>
            </div>
            <h2 className="text-xl font-semibold mb-4">Add/Edit Candidate</h2>
            <input type="text" placeholder="Candidate Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded mb-3" />
            <input type="text" placeholder="Position" value={position} onChange={(e) => setPosition(e.target.value)} className="w-full p-2 border rounded mb-3" />
            <input type="text" placeholder="Department" value={dept} onChange={(e) => setDept(e.target.value)} className="w-full p-2 border rounded mb-3" />
            <textarea placeholder="Manifesto" value={manifesto} onChange={(e) => setManifesto(e.target.value)} className="w-full p-2 border rounded mb-3" rows="3" />
            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="mb-3" />
            {photoPreview && <img src={photoPreview} alt="Preview" className="w-20 h-20 object-cover rounded mb-3" />}
            <button onClick={addCandidate} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Add Candidate</button>
          </div>
        )}

        {tab === 'results' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Live Election Results - {settings.year}</h2>
            <button onClick={printResults} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 mb-4">Print Results</button>
            <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">S/N</th>
                  <th className="border p-2">Photo</th>
                  <th className="border p-2">Candidate</th>
                  <th className="border p-2">Position</th>
                  <th className="border p-2">Votes</th>
                </tr>
              </thead>
              <tbody>
                {candidates.sort((a, b) => b.votes - a.votes).map((c, index) => (
                  <tr key={c.id} className="text-center">
                    <td className="border p-2">{index + 1}</td>
                    <td className="border p-2">
                      {c.photoURL && <img src={c.photoURL} alt={c.name} className="w-10 h-10 object-cover rounded-full mx-auto" onError={(e) => { e.target.style.display = 'none'; }} />}
                    </td>
                    <td className="border p-2">{c.name}</td>
                    <td className="border p-2">{c.position}</td>
                    <td className="border p-2 font-bold">{c.votes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
