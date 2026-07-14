import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const candSnap = await getDocs(collection(db, 'candidates'));
      setCandidates(candSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      const settingsSnap = await getDocs(collection(db, 'settings'));
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
      await setDoc(doc(db, 'settings', 'main'), newSettings);
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
      await addDoc(collection(db, 'candidates'), { name, position, dept, manifesto, photoURL, votes: 0 });
      setName(''); setPosition(''); setDept(''); setManifesto(''); setPhoto(null); setPhotoPreview('');
      loadData();
      alert('Candidate Added Successfully!');
    } catch (e) {
      alert('FAILED TO ADD: ' + e.message);
    }
  };

  const printResults = () => window.print();
  const totalVotes = candidates.reduce((sum, c) => sum + (c.votes || 0), 0);

  const btnStyle = (isActive) => ({
    padding: '8px 16px',
    borderRadius: '4px',
    fontWeight: '600',
    background: isActive ? '#2563eb' : '#e5e7eb',
    color: isActive ? 'white' : '#374151',
    border: 'none',
    cursor: 'pointer',
    marginRight: '4px',
    marginBottom: '4px'
  });

  const inputStyle = {
    width: '100%',
    padding: '8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    marginBottom: '12px',
    boxSizing: 'border-box'
  };

  const handleLogout = () => {
    navigate('/admin');
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#f0f2f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <p>Loading Admin Panel...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#f0f2f5',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif',
        padding: '32px',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#ef4444', marginBottom: '16px' }}>ERROR</h2>
        <p style={{ color: '#666' }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f0f2f5',
      fontFamily: 'Arial, sans-serif',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        padding: '24px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <h1 style={{ color: '#003366', margin: 0 }}>Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '13px'
            }}
          >
            Logout
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <button onClick={() => setTab('settings')} style={btnStyle(tab === 'settings')}>
            Election Settings
          </button>
          <button onClick={() => setTab('candidates')} style={btnStyle(tab === 'candidates')}>
            Manage Candidates
          </button>
          <button onClick={() => setTab('results')} style={btnStyle(tab === 'results')}>
            View Results
          </button>
        </div>

        {tab === 'settings' && (
          <div>
            <h2 style={{ color: '#003366', marginBottom: '16px' }}>Set Election Details</h2>
            <input
              type="number"
              placeholder="Election Year (e.g. 2026)"
              value={settings.year}
              onChange={(e) => setSettings({ ...settings, year: e.target.value })}
              style={inputStyle}
            />
            <input
              type="date"
              value={settings.date}
              onChange={(e) => setSettings({ ...settings, date: e.target.value })}
              style={inputStyle}
            />
            <input
              type="time"
              value={settings.time}
              onChange={(e) => setSettings({ ...settings, time: e.target.value })}
              style={inputStyle}
            />
            <button
              onClick={saveSettings}
              style={{
                padding: '10px 24px',
                background: '#16a34a',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Activate Election
            </button>
            <p style={{ marginTop: '12px' }}>
              Status:{' '}
              <span style={{ color: settings.isActive ? '#16a34a' : '#ca8a04', fontWeight: 'bold' }}>
                {settings.isActive ? 'LIVE' : 'COMING SOON'}
              </span>
            </p>
          </div>
        )}

        {tab === 'candidates' && (
          <div>
            <div style={{
              display: 'flex',
              gap: '16px',
              marginBottom: '20px',
              flexWrap: 'wrap'
            }}>
              <div style={{ background: '#f0f2f5', padding: '12px', borderRadius: '4px', textAlign: 'center' }}>
                <strong>Total Candidates:</strong> {candidates.length}
              </div>
              <div style={{ background: '#f0f2f5', padding: '12px', borderRadius: '4px', textAlign: 'center' }}>
                <strong>Total Votes Cast:</strong> {totalVotes}
              </div>
              <div style={{ background: '#f0f2f5', padding: '12px', borderRadius: '4px', textAlign: 'center' }}>
                <strong>Year:</strong> {settings.year || 'Not Set'}
              </div>
            </div>

            <h3 style={{ color: '#003366', marginBottom: '12px' }}>Add Candidate</h3>
            <input
              placeholder="Candidate Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="Position (e.g. President, VP)"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="Department (optional)"
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              style={inputStyle}
            />
            <textarea
              placeholder="Manifesto (optional)"
              value={manifesto}
              onChange={(e) => setManifesto(e.target.value)}
              rows={3}
              style={inputStyle}
            />
            <div style={{ marginBottom: '12px' }}>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'block' }} />
              {photoPreview && (
                <img
                  src={photoPreview}
                  alt="Preview"
                  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', marginTop: '8px' }}
                />
              )}
            </div>
            <button
              onClick={addCandidate}
              style={{
                padding: '10px 24px',
                background: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Add Candidate
            </button>

            <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid #ddd' }} />

            <h3 style={{ color: '#003366', marginBottom: '12px' }}>
              Current Candidates ({candidates.length})
            </h3>
            {candidates.length === 0 ? (
              <p style={{ color: '#666' }}>No candidates added yet.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ background: '#003366', color: 'white' }}>
                      <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #003366' }}>Photo</th>
                      <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #003366' }}>Name</th>
                      <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #003366' }}>Position</th>
                      <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #003366' }}>Dept</th>
                      <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #003366' }}>Votes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.map((c) => (
                      <tr key={c.id} style={{ borderBottom: '1px solid #ddd' }}>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                          {c.photoURL ? (
                            <img
                              src={c.photoURL}
                              alt={c.name}
                              style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : 'N/A'}
                        </td>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>{c.name}</td>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>{c.position}</td>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>{c.dept || '-'}</td>
                        <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}>{c.votes || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === 'results' && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              <h2 style={{ color: '#003366', margin: 0 }}>Election Results - {settings.year}</h2>
              <button
                onClick={printResults}
                style={{
                  padding: '8px 16px',
                  background: '#4b5563',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Print Results
              </button>
            </div>

            <div style={{ background: '#f0f2f5', padding: '16px', borderRadius: '4px', marginBottom: '16px' }}>
              <p><strong>Total Candidates:</strong> {candidates.length}</p>
              <p><strong>Total Votes Cast:</strong> {totalVotes}</p>
              <p><strong>Status:</strong> {settings.isActive ? 'LIVE' : 'Not Active'}</p>
            </div>

            {candidates.length === 0 ? (
              <p style={{ color: '#666' }}>No candidates to display results for.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
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
                    {[...candidates]
                      .sort((a, b) => (b.votes || 0) - (a.votes || 0))
                      .map((c, idx) => (
                        <tr key={c.id} style={{ textAlign: 'center' }}>
                          <td style={{ border: '1px solid #ccc', padding: '8px' }}>{idx + 1}</td>
                          <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                            {c.photoURL ? (
                              <img
                                src={c.photoURL}
                                alt={c.name}
                                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto', display: 'block' }}
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
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

            {candidates.length > 0 && (
              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <p style={{ color: '#666', fontSize: '14px' }}>
                  Winner:{' '}
                  <strong>
                    {candidates.sort((a, b) => (b.votes || 0) - (a.votes || 0))[0]?.name}
                  </strong>{' '}
                  with {candidates.sort((a, b) => (b.votes || 0) - (a.votes || 0))[0]?.votes || 0} votes
                </p>
              </div>
            )}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <a href="#/" style={{ color: '#2563eb', fontSize: '13px' }}>Back to Home</a>
        </div>
      </div>
    </div>
  );
}
