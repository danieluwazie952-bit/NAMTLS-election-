import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, storage } from '../firebase';
import { collection, addDoc, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// ===== CONFIGURABLE CANDIDATE LIMIT =====
// Set to 0 or false for NO LIMIT (Infinity).
// Set to any positive number (e.g., 5) to enforce a limit.
const MAX_CANDIDATES = 0; // 0 = no limit, or set to 5, 10, etc.

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

  // ===== CHECK CANDIDATE LIMIT =====
  const isCandidateLimitReached = () => {
    if (MAX_CANDIDATES === 0 || MAX_CANDIDATES === false) return false;
    return candidates.length >= MAX_CANDIDATES;
  };

  const getCandidateLimitMessage = () => {
    if (MAX_CANDIDATES === 0 || MAX_CANDIDATES === false) return '';
    const remaining = MAX_CANDIDATES - candidates.length;
    if (remaining <= 0) return `Maximum of ${MAX_CANDIDATES} candidates reached. Remove a candidate first.`;
    return `You can add ${remaining} more candidate(s). Maximum: ${MAX_CANDIDATES}`;
  };

  // ===== ACTIVATE ELECTION =====
  const saveSettings = async () => {
    if (!settings.year || !settings.date || !settings.time) {
      alert('Please fill all election details: Year, Date, and Time');
      return;
    }
    try {
      const settingsSnap = await getDocs(collection(db, 'settings'));
      if (settingsSnap.docs.length > 0) {
        await setDoc(doc(db, 'settings', settingsSnap.docs[0].id), settings);
      } else {
        await addDoc(collection(db, 'settings'), settings);
      }
      alert('Election settings saved!');
      loadData();
    } catch (e) {
      alert('FAILED TO SAVE: ' + e.message);
    }
  };

  const toggleElection = async () => {
    try {
      const newStatus = !settings.isActive;
      const settingsSnap = await getDocs(collection(db, 'settings'));
      if (settingsSnap.docs.length > 0) {
        await setDoc(doc(db, 'settings', settingsSnap.docs[0].id), { ...settings, isActive: newStatus });
      } else {
        await addDoc(collection(db, 'settings'), { ...settings, isActive: newStatus });
      }
      setSettings(prev => ({ ...prev, isActive: newStatus }));
      alert(newStatus ? 'Election is now ACTIVE!' : 'Election deactivated.');
      loadData();
    } catch (e) {
      alert('FAILED: ' + e.message);
    }
  };

  // ===== DELETE ELECTION =====
  const deleteElection = async () => {
    const confirmDelete = window.confirm(
      'DELETE ENTIRE ELECTION?\n\nThis will delete ALL candidates, votes, and settings. This CANNOT be undone.\nAre you sure?'
    );
    if (!confirmDelete) return;

    try {
      const candSnap = await getDocs(collection(db, 'candidates'));
      const deletePromises = candSnap.docs.map((candDoc) => {
        const data = candDoc.data();
        if (data.photoURL && data.photoURL.includes('firebasestorage')) {
          try {
            const decodedUrl = decodeURIComponent(data.photoURL);
            const match = decodedUrl.match(/\/o\/(.+?)\?/);
            if (match && match[1]) {
              const photoRef = ref(storage, match[1]);
              deleteObject(photoRef).catch(() => {});
            }
          } catch (_) {}
        }
        return deleteDoc(doc(db, 'candidates', candDoc.id));
      });
      await Promise.all(deletePromises);

      const settingsSnap = await getDocs(collection(db, 'settings'));
      const deleteSettingsPromises = settingsSnap.docs.map((sDoc) =>
        deleteDoc(doc(db, 'settings', sDoc.id))
      );
      await Promise.all(deleteSettingsPromises);

      localStorage.removeItem('candidates');
      localStorage.removeItem('electionSettings');
      localStorage.removeItem('voted');

      setSettings({ year: '', date: '', time: '', isActive: false });
      setCandidates([]);
      alert('Election has been deleted successfully. All data cleared from Firebase.');
    } catch (e) {
      alert('FAILED TO DELETE ELECTION: ' + e.message);
    }
  };

  // ===== ADD CANDIDATE =====
  const addCandidate = async () => {
    if (!name || !position) { alert('Please fill Name and Position'); return; }

    // Enforce candidate limit
    if (isCandidateLimitReached()) {
      alert(getCandidateLimitMessage());
      return;
    }

    try {
      let photoURL = '';
      if (photo) {
        const storageRef = ref(storage, `candidates/${Date.now()}_${photo.name}`);
        const snap = await uploadBytes(storageRef, photo);
        photoURL = await getDownloadURL(snap.ref);
      }
      await addDoc(collection(db, 'candidates'), {
        name,
        position,
        dept,
        manifesto,
        photoURL,
        votes: 0
      });
      setName('');
      setPosition('');
      setDept('');
      setManifesto('');
      setPhoto(null);
      setPhotoPreview('');
      loadData();
      alert('Candidate Added Successfully!');
    } catch (e) {
      alert('FAILED TO ADD: ' + e.message);
    }
  };

  // ===== DELETE SINGLE CANDIDATE =====
  const deleteCandidate = async (candidateId, photoURL) => {
    const confirmDelete = window.confirm('Delete this candidate? This cannot be undone.');
    if (!confirmDelete) return;

    try {
      if (photoURL && photoURL.includes('firebasestorage')) {
        try {
          const decodedUrl = decodeURIComponent(photoURL);
          const match = decodedUrl.match(/\/o\/(.+?)\?/);
          if (match && match[1]) {
            const photoRef = ref(storage, match[1]);
            await deleteObject(photoRef);
          }
        } catch (photoErr) {}
      }
      await deleteDoc(doc(db, 'candidates', candidateId));
      loadData();
      alert('Candidate deleted successfully.');
    } catch (e) {
      alert('FAILED TO DELETE CANDIDATE: ' + e.message);
    }
  };

  // ===== CLEAR RESULTS (reset votes to 0) =====
  const clearResults = async () => {
    const confirmClear = window.confirm(
      'Reset ALL votes to 0? This will clear all voting results but keep candidates.'
    );
    if (!confirmClear) return;

    try {
      const candSnap = await getDocs(collection(db, 'candidates'));
      const updatePromises = candSnap.docs.map((candDoc) =>
        updateDoc(doc(db, 'candidates', candDoc.id), { votes: 0 })
      );
      await Promise.all(updatePromises);
      localStorage.removeItem('voted');
      loadData();
      alert('All votes have been reset to 0.');
    } catch (e) {
      alert('FAILED TO CLEAR RESULTS: ' + e.message);
    }
  };

  const totalVotes = candidates.reduce((sum, c) => sum + (c.votes || 0), 0);

  const calculatePoints = (votes) => {
    return ((votes || 0) / 2).toFixed(1);
  };

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
    const authKeysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('auth') || key.includes('token') || key.includes('session') || key.includes('admin'))) {
        authKeysToRemove.push(key);
      }
    }
    authKeysToRemove.forEach(key => localStorage.removeItem(key));
    localStorage.removeItem('adminAuthenticated');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('firebaseAuth');
    navigate('/admin-login');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#003366', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ border: '4px solid #FFD700', borderTop: '4px solid transparent', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          Loading Admin Panel...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#003366', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#dc2626' }}>ERROR</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const sortedByVotes = [...candidates].sort((a, b) => (b.votes || 0) - (a.votes || 0));
  const winner = sortedByVotes[0];

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', fontFamily: 'Arial, sans-serif' }}>
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
        }
        .print-only { display: none; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>

      {/* HEADER */}
      <div className="no-print" style={{
        background: '#003366',
        color: 'white',
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: '20px' }}>Admin Dashboard</h1>
        <button onClick={handleLogout} style={{
          padding: '8px 20px',
          background: '#dc2626',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}>Logout</button>
      </div>

      {/* TAB BUTTONS */}
      <div className="no-print" style={{ padding: '12px 24px', background: 'white', borderBottom: '1px solid #ddd' }}>
        <button onClick={() => setTab('settings')} style={btnStyle(tab === 'settings')}>Election Settings</button>
        <button onClick={() => setTab('candidates')} style={btnStyle(tab === 'candidates')}>Manage Candidates</button>
        <button onClick={() => setTab('results')} style={btnStyle(tab === 'results')}>View Results</button>
      </div>

      {/* ===== TAB: SETTINGS ===== */}
      {tab === 'settings' && (
        <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ margin: '0 0 16px 0', color: '#003366' }}>Set Election Details</h2>

            <label style={{ fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Election Year</label>
            <input placeholder="e.g. 2026/2027" value={settings.year} onChange={(e) => setSettings({ ...settings, year: e.target.value })} style={inputStyle} />

            <label style={{ fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Election Date</label>
            <input placeholder="e.g. 15-July-2026" value={settings.date} onChange={(e) => setSettings({ ...settings, date: e.target.value })} style={inputStyle} />

            <label style={{ fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Election Time</label>
            <input placeholder="e.g. 10:00 AM" value={settings.time} onChange={(e) => setSettings({ ...settings, time: e.target.value })} style={inputStyle} />

            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button onClick={saveSettings} style={{
                padding: '10px 24px', background: '#2563eb', color: 'white',
                border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer'
              }}>Save Settings</button>
              <button onClick={toggleElection} style={{
                padding: '10px 24px',
                background: settings.isActive ? '#dc2626' : '#16a34a',
                color: 'white', border: 'none', borderRadius: '4px',
                fontWeight: 'bold', cursor: 'pointer'
              }}>
                {settings.isActive ? 'Deactivate Election' : 'Activate Election'}
              </button>
              {settings.isActive && (
                <button onClick={deleteElection} style={{
                  padding: '10px 24px', background: '#6b7280', color: 'white',
                  border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer'
                }}>Delete Election (Clear All)</button>
              )}
            </div>

            <div style={{ marginTop: '16px', padding: '12px', background: '#f0f2f5', borderRadius: '4px' }}>
              <strong>Status:</strong>{' '}
              <span style={{ color: settings.isActive ? '#16a34a' : '#6b7280', fontWeight: 'bold' }}>
                {settings.isActive ? 'LIVE' : 'COMING SOON'}
              </span>
              {settings.isActive && (
                <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#666' }}>
                  Election: {settings.year} | Date: {settings.date} | Time: {settings.time}
                </p>
              )}
            </div>

            {/* Candidate Limit Info */}
            <div style={{ marginTop: '16px', padding: '12px', background: '#e0f2fe', borderRadius: '4px', border: '1px solid #bae6fd' }}>
              <strong>Candidate Limit:</strong>{' '}
              {MAX_CANDIDATES === 0 || MAX_CANDIDATES === false
                ? <span>No limit (unlimited candidates)</span>
                : <span>Maximum {MAX_CANDIDATES} candidates</span>
              }
              <br />
              <span style={{ fontSize: '12px', color: '#666' }}>
                Current candidates: {candidates.length}
                {MAX_CANDIDATES > 0 && ` / ${MAX_CANDIDATES}`}
              </span>
              <br />
              <span style={{ fontSize: '11px', color: '#0369a1' }}>
                To change limit, edit MAX_CANDIDATES at the top of AdminDashboard.jsx
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ===== TAB: CANDIDATES ===== */}
      {tab === 'candidates' && (
        <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, color: '#003366' }}>Manage Candidates</h2>
              <span style={{ fontWeight: 'bold', color: '#666' }}>
                Total Candidates: {candidates.length}
                {MAX_CANDIDATES > 0 && ` / ${MAX_CANDIDATES}`}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <div style={{ padding: '12px', background: '#f0f2f5', borderRadius: '4px', flex: '1', minWidth: '150px', textAlign: 'center' }}>
                <strong>Total Votes Cast:</strong><br/>{totalVotes}
              </div>
              <div style={{ padding: '12px', background: '#f0f2f5', borderRadius: '4px', flex: '1', minWidth: '150px', textAlign: 'center' }}>
                <strong>Year:</strong><br/>{settings.year || 'Not Set'}
              </div>
            </div>

            {/* Candidate Limit Warning */}
            {isCandidateLimitReached() && (
              <div style={{ padding: '10px', background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '4px', marginBottom: '16px', color: '#92400e', fontWeight: 'bold', fontSize: '13px' }}>
                {getCandidateLimitMessage()}
              </div>
            )}

            {!isCandidateLimitReached() && getCandidateLimitMessage() && (
              <div style={{ padding: '10px', background: '#e0f2fe', border: '1px solid #bae6fd', borderRadius: '4px', marginBottom: '16px', color: '#0369a1', fontSize: '13px' }}>
                {getCandidateLimitMessage()}
              </div>
            )}

            <h3 style={{ color: '#003366', margin: '16px 0 12px 0' }}>Add Candidate</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <input placeholder="Candidate Name" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
              <input placeholder="Position" value={position} onChange={(e) => setPosition(e.target.value)} style={inputStyle} />
              <input placeholder="Department (optional)" value={dept} onChange={(e) => setDept(e.target.value)} style={inputStyle} />
              <input placeholder="Manifesto (optional)" value={manifesto} onChange={(e) => setManifesto(e.target.value)} style={inputStyle} />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Photo (optional)</label>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ fontSize: '13px' }} />
              {photoPreview && (
                <img src={photoPreview} alt="Preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', marginTop: '8px' }} />
              )}
            </div>

            <button
              onClick={addCandidate}
              disabled={isCandidateLimitReached()}
              style={{
                padding: '10px 24px',
                background: isCandidateLimitReached() ? '#9ca3af' : '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontWeight: 'bold',
                cursor: isCandidateLimitReached() ? 'not-allowed' : 'pointer'
              }}
            >
              {isCandidateLimitReached() ? 'Max Candidates Reached' : 'Add Candidate'}
            </button>

            {/* Candidates List */}
            <div style={{ marginTop: '24px' }}>
              <h3 style={{ color: '#003366', margin: '0 0 12px 0' }}>All Candidates ({candidates.length})</h3>
              {candidates.length === 0 ? (
                <p style={{ color: '#666', fontStyle: 'italic' }}>No candidates added yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {candidates.map((cand) => (
                    <div key={cand.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      background: '#f9fafb',
                      borderRadius: '4px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {cand.photoURL && (
                          <img src={cand.photoURL} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                        )}
                        <div>
                          <strong>{cand.name}</strong>
                          <span style={{ color: '#666', fontSize: '13px', marginLeft: '8px' }}>{cand.position}</span>
                          {cand.dept && <span style={{ color: '#999', fontSize: '12px', marginLeft: '8px' }}>({cand.dept})</span>}
                          <span style={{ color: '#2563eb', fontSize: '12px', marginLeft: '8px' }}>Votes: {cand.votes || 0}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteCandidate(cand.id, cand.photoURL)}
                        style={{
                          padding: '6px 12px',
                          background: '#dc2626',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      >Delete</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== TAB: RESULTS ===== */}
      {tab === 'results' && (
        <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>

          {/* Admin controls - hidden from print */}
          <div className="no-print" style={{
            background: 'white',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            marginBottom: '24px',
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <button onClick={clearResults} style={{
              padding: '8px 20px', background: '#dc2626', color: 'white',
              border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer'
            }}>Clear All Votes</button>
            <button onClick={() => window.print()} style={{
              padding: '8px 20px', background: '#003366', color: 'white',
              border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer'
            }}>Print / Export PDF</button>
          </div>

          {/* ===== PRINTABLE RESULT AREA ===== */}
          <div id="result-print-area" style={{
            background: 'white',
            padding: '40px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            {/* Title */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h1 style={{ fontSize: '22px', color: '#003366', margin: '0 0 4px 0' }}>
                NAMATL STUDENT E-VOTING
              </h1>
              <hr style={{ width: '80px', border: 'none', borderTop: '3px solid #FFD700', margin: '8px auto' }} />
              {settings.year && (
                <p style={{ fontSize: '14px', color: '#666', margin: '0' }}>{settings.year} Election</p>
              )}
            </div>

            {/* Official Results Header */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2 style={{
                fontSize: '20px',
                color: '#003366',
                fontWeight: 'bold',
                margin: '0 0 8px 0',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                borderBottom: '2px solid #003366',
                paddingBottom: '8px',
                display: 'inline-block'
              }}>
                OFFICIAL ELECTION RESULTS
              </h2>
            </div>

            {/* Results Content */}
            {candidates.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#666'
              }}>
                <p style={{ fontSize: '18px', fontStyle: 'italic' }}>
                  No candidates to display results for
                </p>
              </div>
            ) : (
              <>
                {/* Clean Table */}
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  marginBottom: '32px',
                  fontSize: '14px'
                }}>
                  <thead>
                    <tr style={{ background: '#003366', color: 'white' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', border: '1px solid #003366' }}>S/N</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', border: '1px solid #003366' }}>Candidate Name</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', border: '1px solid #003366' }}>Position</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', border: '1px solid #003366' }}>Votes</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', border: '1px solid #003366' }}>Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedByVotes.map((cand, index) => (
                      <tr key={cand.id} style={{
                        background: index === 0 ? '#fefce8' : (index % 2 === 0 ? '#f9fafb' : 'white'),
                        fontWeight: index === 0 ? 'bold' : 'normal'
                      }}>
                        <td style={{ padding: '10px 16px', border: '1px solid #d1d5db', textAlign: 'center' }}>{index + 1}</td>
                        <td style={{ padding: '10px 16px', border: '1px solid #d1d5db' }}>
                          {index === 0 && <span style={{ color: '#16a34a' }}>🏆 </span>}
                          {cand.name}
                        </td>
                        <td style={{ padding: '10px 16px', border: '1px solid #d1d5db' }}>{cand.position}</td>
                        <td style={{ padding: '10px 16px', border: '1px solid #d1d5db', textAlign: 'center' }}>{cand.votes || 0}</td>
                        <td style={{ padding: '10px 16px', border: '1px solid #d1d5db', textAlign: 'center' }}>{calculatePoints(cand.votes)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Winner Announcement */}
                {winner && (
                  <div style={{
                    textAlign: 'center',
                    padding: '16px',
                    background: '#fefce8',
                    border: '2px solid #16a34a',
                    borderRadius: '8px',
                    marginBottom: '32px'
                  }}>
                    <p style={{ fontSize: '16px', margin: '0', color: '#003366' }}>
                      <strong>Winner:</strong>{' '}
                      <span style={{ color: '#16a34a', fontSize: '18px' }}>{winner.name}</span>{' '}
                      with {winner.votes || 0} votes ({calculatePoints(winner.votes)} points)
                    </p>
                  </div>
                )}

                {/* Approval Box */}
                <div style={{
                  marginTop: '40px',
                  borderTop: '2px solid #003366',
                  paddingTop: '24px',
                  textAlign: 'right'
                }}>
                  <div style={{
                    border: '2px solid #003366',
                    padding: '16px 24px',
                    borderRadius: '4px',
                    display: 'inline-block',
                    textAlign: 'center',
                    minWidth: '300px',
                    maxWidth: '100%'
                  }}>
                    <p style={{ fontWeight: 'bold', color: '#003366', margin: '0 0 4px 0', fontSize: '14px' }}>
                      Approved by the Electoral Chairman
                    </p>
                    <hr style={{ width: '200px', margin: '8px auto', border: '1px solid #003366' }} />
                    <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0 0' }}>
                      Electoral Chairman Signature
                    </p>

                    <div style={{ marginTop: '24px' }}>
                      <hr style={{ width: '200px', margin: '8px auto', border: '1px solid #003366' }} />
                      <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0 0' }}>
                        Electoral Secretary Signature
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div style={{ textAlign: 'center', marginTop: '20px' }} className="no-print">
            <a href="#/" style={{ color: '#2563eb', fontSize: '13px' }}>Back to Home</a>
          </div>
        </div>
      )}
    </div>
  );
}
