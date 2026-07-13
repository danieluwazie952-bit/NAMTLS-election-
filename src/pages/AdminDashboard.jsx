import { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import { collection, addDoc, getDocs, doc, setDoc } from 'firebase/firestore';
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
      name, position, dept, manifesto, photoURL, votes: 0
    });
    setName('');
    setPosition('');
    setDept('');
    setManifesto('');
    setPhoto(null);
    setPhotoPreview('');
    loadData();
    alert('Candidate Added Successfully to Firebase');
  };

  const printResults = () => { window.print(); };
  const totalVotes = candidates.reduce((sum, c) => sum + (c.votes || 0), 0);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f3f4f6', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: '18px' }}>Loading Admin Panel...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '24px' }}>
      <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
        <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#003366', marginBottom: '24px' }}>Admin Dashboard</h1>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {['settings', 'candidates', 'results'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '8px 16px',
                borderRadius: '4px',
                fontWeight: '600',
                background: tab === t ? '#2563eb' : '#e5e7eb',
                color: tab === t ? 'white' : '#374151',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {t === 'settings' ? 'Election Settings' : t === 'candidates' ? 'Manage Candidates' : 'View Results'}
            </button>
          ))}
        </div>

        {tab === 'settings' && (
          <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Set Election Details</h2>
            <input type="number" placeholder="Election Year" value={settings.year}
              onChange={(e) => setSettings({ ...settings, year: e.target.value })}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '12px' }} />
            <input type="date" value={settings.date}
              onChange={(e) => setSettings({ ...settings, date: e.target.value })}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '12px' }} />
            <input type="time" value={settings.time}
              onChange={(e) => setSettings({ ...settings, time: e.target.value })}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '12px' }} />
            <button onClick={saveSettings}
              style={{ background: '#16a34a', color: 'white', padding: '8px 24px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Activate Election
            </button>
            <p style={{ marginTop: '8px' }}>
              Status:{' '}
              <span style={{ color: settings.isActive ? '#16a34a' : '#ca8a04', fontWeight: 'bold' }}>
                {settings.isActive ? 'LIVE' : 'COMING SOON'}
              </span>
            </p>
          </div>
        )}

        {tab === 'candidates' && (
          <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ marginBottom: '16px' }}>
              <p>Total Candidates: {candidates.length}</p>
              <p>Total Votes Cast: {totalVotes}</p>
              <p>Year: {settings.year || 'Not Set'}</p>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Add/Edit Candidate</h2>
            <input type="text" placeholder="Candidate Name" value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '12px' }} />
            <input type="text" placeholder="Position" value={position}
              onChange={(e) => setPosition(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '12px' }} />
            <input type="text" placeholder="Department" value={dept}
              onChange={(e) => setDept(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '12px' }} />
            <textarea placeholder="Manifesto" value={manifesto}
              onChange={(e) => setManifesto(e.target.value)} rows="3"
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '12px' }} />
            <input type="file" accept="image/*" onChange={handlePhotoUpload}
              style={{ marginBottom: '12px', display: 'block' }} />
            {photoPreview && (
              <img src={photoPreview} alt="Preview"
                style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', marginBottom: '12px' }} />
            )}
            <button onClick={addCandidate}
              style={{ background: '#2563eb', color: 'white', padding: '8px 24px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Add Candidate
            </button>
          </div>
        )}

        {tab === 'results' && (
          <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Live Election Results - {settings.year}</h2>
            <button onClick={printResults}
              style={{ background: '#4b5563', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '16px' }}>
              Print Results
            </button>
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
                {candidates.sort((a, b) => (b.votes || 0) - (a.votes || 0)).map((c, index) => (
                  <tr key={c.id} style={{ textAlign: 'center' }}>
                    <td style={{ border: '1px solid #ccc', padding: '8px' }}>{index + 1}</td>
                    <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                      {c.photoURL ? (
                        <img src={c.photoURL} alt={c.name}
                          style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%', margin: '0 auto' }}
                          onError={(e) => { e.target.style.display = 'none'; }} />
                      ) : 'N/A'}
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
      </div>
    </div>
  );
}
