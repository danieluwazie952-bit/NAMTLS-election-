import { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import { collection, addDoc, getDocs, doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('settings');
  const [candidates, setCandidates] = useState([]);
  const [settings, setSettings] = useState({ year: '', date: '', time: '', isActive: false });
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [dept, setDept] = useState('');
  const [manifesto, setManifesto] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const candSnap = await getDocs(collection(db, "candidates"));
      setCandidates(candSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      const settingsSnap = await getDocs(collection(db, "settings"));
      if (settingsSnap.docs.length > 0) setSettings(settingsSnap.docs[0].data());
    } catch (e) {
      setError('FAILED TO LOAD: ' + e.message);
    }
    setLoading(false);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const saveSettings = async () => {
    if (!settings.year || !settings.date || !settings.time) {
      alert('Please fill Year, Date and Time');
      return;
    }
    try {
      const newSettings = { ...settings, isActive: true };
      await setDoc(doc(db, "settings", "main"), newSettings);
      setSettings(newSettings);
      alert('Election Settings Saved! Student Portal is now LIVE');
    } catch (e) {
      alert('FAILED TO SAVE: ' + e.message);
    }
  };

  const addCandidate = async () => {
    if (!name || !position) { alert('Please fill Name and Position'); return; }
    try {
      let photoURL = '';
      if (photo) {
        const storageRef = ref(storage, `candidates/${Date.now()}_${photo.name}`);
        const snap = await uploadBytes(storageRef, photo);
        photoURL = await getDownloadURL(snap.ref);
      }
      await addDoc(collection(db, "candidates"), { name, position, dept, manifesto, photoURL, votes: 0 });
      setName(''); setPosition(''); setDept(''); setManifesto(''); setPhoto(null); setPhotoPreview('');
      loadData();
      alert('Candidate Added Successfully!');
    } catch (e) {
      alert('FAILED TO ADD: ' + e.message);
    }
  };

  const printResults = () => window.print();
  const totalVotes = candidates.reduce((sum, c) => sum + (c.votes || 0), 0);

  const btnStyle = (isActive) => ({ padding: '8px 16px', borderRadius: '4px', fontWeight: '600', background: isActive ? '#2563eb' : '#e5e7eb', color: isActive ? 'white' : '#374151', border: 'none', cursor: 'pointer' });
  const inputStyle = { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '12px', boxSizing: 'border-box' };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', fontFamily: 'Arial, sans-serif' }}>
        <p>Loading Admin Panel...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '24px', borderRadius: '8px', maxWidth: '400px' }}>
          <h2>⚠️ ERROR</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '24px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
        <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#003366', marginBottom: '24px' }}>Admin Dashboard</h1>
        
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <button onClick={() => setTab('settings')} style={btnStyle(tab === 'settings')}>Election Settings</button>
          <button onClick={() => setTab('candidates')} style={btnStyle(tab === 'candidates')}>Manage Candidates</button>
          <button onClick={() => setTab('results')} style={btnStyle(tab === 'results')}>View Results</button>
        </div>
        
        {tab === 'settings' && (
          <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Set Election Details</h2>
            <input type="number" placeholder="Election Year" value={settings.year} onChange={(e) => setSettings({...settings, year: e.target.value})} style={inputStyle} />
            <input type="date" value={settings.date} onChange={(e) => setSettings({...settings, date: e.target.value})} style={inputStyle} />
            <input type="time" value={settings.time} onChange={(e) => setSettings({...settings, time: e.target.value})} style={inputStyle} />
            <button onClick={saveSettings} style={{ background: '#16a34a', color: 'white', padding: '8px 24px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}>Activate Election</button>
            <p style={{ marginTop: '8px' }}>Status: <span style={{ color: settings.isActive ? '#16a34a' : '#ca8a04', fontWeight: 'bold' }}>{settings.isActive ? 'LIVE' : 'COMING SOON'}</span></p>
          </div>
        )}
        
        {tab === 'candidates' && (
          <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ marginBottom: '16px' }}>
              <p>Total Candidates: {candidates.length}</p>
              <p>Total Votes Cast: {totalVotes}</p>
              <p>Year: {settings.year || 'Not Set'}</p>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Add Candidate</h2>
            <input type="text" placeholder="Candidate Name" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
            <input type="text" placeholder="Position" value={position} onChange={(e) => setPosition(e.target.value)} style={inputStyle} />
            <input type="text" placeholder="Department" value={dept} onChange={(e) => setDept(e.target.value)} style={inputStyle} />
            <textarea placeholder="Manifesto" value={manifesto} onChange={(e) => setManifesto(e.target.value)} rows="3" style={inputStyle} />
            <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ marginBottom: '12px', display: 'block' }} />
            {photoPreview && <img src={photoPreview} alt="Preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', marginBottom: '12px' }} />}
            <button onClick={addCandidate} style={{ background: '#2563eb', color: 'white', padding: '8px 24px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}>Add Candidate</button>
          </div>
        )}
        
        {tab === 'results' && (
          <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', margin: '0' }}>Live Election Results - {settings.year}</h2>
              <button onClick={printResults} style={{ background: '#4b5563', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Print Results</button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#e5e7eb' }}>
                  <th style={{ border: '1px solid #ccc', padding: '8px' }}>S/N</th>
                  <th style={{ border: '1px solid #ccc', padding: '8px' }}>Photo</th>
                  <th style={{ border: '1px solid #ccc', padding: '8px' }}>Candidate</th>
                  <th style={{ border: '1px solid #ccc', padding: '8px' }}>Position</th>
                  <th style={{ border: '1px solid #ccc', padding: '8px' }}>Votes</th>
                </tr>
              </thead>
              <tbody>
                {[...candidates].sort((a, b) => (b.votes || 0) - (a.votes || 0)).map((c, idx) => (
                  <tr key={c.id} style={{ textAlign: 'center' }}>
                    <td style={{ border: '1px solid #ccc', padding: '8px' }}>{idx + 1}</td>
                    <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                      {c.photoURL ? <img src={c.photoURL} alt={c.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto', display: 'block' }} onError={(e) => { e.target.style.display = 'none' }} /> : 'N/A'}
                    </td>
                    <td style={{ border: '1px solid #ccc', padding: '8px' }}>{c.name}</td>
                    <td style={{ border: '1px solid #ccc', padding: '8px' }}>{c.position}</td>
                    <td style={{ border: '1px solid #ccc', padding: '8px', fontWeight: 'bold' }}>{c.votes || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p style={{ marginTop: '24px', fontSize: '11px', textAlign: 'center', opacity: '0.5' }}>Authorized and Verified by Meta EC</p>
      </div>
    </div>
  );
}
