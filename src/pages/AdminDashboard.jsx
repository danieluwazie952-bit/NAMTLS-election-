import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, storage } from '../firebase';
import { collection, addDoc, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

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

  // ===== ACTIVATE ELECTION =====
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

  // ===== DELETE ELECTION (DEACTIVATE + CLEAR DATA) =====
  const deleteElection = async () => {
    const confirmDelete = window.confirm(
      'WARNING: This will deactivate the election and delete ALL candidates, votes, and results from Firebase. This cannot be undone. Continue?'
    );
    if (!confirmDelete) return;

    try {
      const candSnap = await getDocs(collection(db, 'candidates'));
      const deletePromises = candSnap.docs.map(async (candDoc) => {
        const data = candDoc.data();
        // FIX BUG 2: Use stored photoPath instead of full URL
        // Since we stored photoURL as full URL, we need to extract the path
        if (data.photoURL && data.photoURL.includes('firebasestorage')) {
          try {
            // Extract the path from the full URL
            const decodedUrl = decodeURIComponent(data.photoURL);
            const match = decodedUrl.match(/\/o\/(.+?)\?/);
            if (match && match[1]) {
              const photoRef = ref(storage, match[1]);
              await deleteObject(photoRef);
            }
          } catch (photoErr) {
            // Ignore if photo doesn't exist in storage
          }
        }
        await deleteDoc(doc(db, 'candidates', candDoc.id));
      });
      await Promise.all(deletePromises);

      await setDoc(doc(db, 'settings', 'main'), {
        year: '',
        date: '',
        time: '',
        isActive: false
      });

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
      // FIX BUG 2: Extract storage path from full URL
      if (photoURL && photoURL.includes('firebasestorage')) {
        try {
          const decodedUrl = decodeURIComponent(photoURL);
          const match = decodedUrl.match(/\/o\/(.+?)\?/);
          if (match && match[1]) {
            const photoRef = ref(storage, match[1]);
            await deleteObject(photoRef);
          }
        } catch (photoErr) {
          // Ignore storage errors
        }
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

  const printResults = () => window.print();
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

  // FIX BUG 1: Proper logout with auth state cleanup
  const handleLogout = () => {
    // Clear any auth tokens or session data from localStorage
    const authKeysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('auth') || key.includes('token') || key.includes('session') || key.includes('admin'))) {
        authKeysToRemove.push(key);
      }
    }
    authKeysToRemove.forEach(key => localStorage.removeItem(key));
    // Also clear common auth patterns
    localStorage.removeItem('adminAuthenticated');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('firebaseAuth');
    // Navigate to login
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

  // FIX BUG 5: Helper to sort without mutating state
  const sortedByVotes = [...candidates].sort((a, b) => (b.votes || 0) - (a.votes || 0));
  const winner = sortedByVotes[0];

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
        {/* HEADER */}
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

        {/* TAB BUTTONS */}
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

        {/* ===== TAB: SETTINGS ===== */}
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

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px' }}>
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

              {settings.isActive && (
                <button
                  onClick={deleteElection}
                  style={{
                    padding: '10px 24px',
                    background: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Delete Election (Clear All)
                </button>
              )}
            </div>

            <p style={{ marginTop: '12px' }}>
              Status:{' '}
              <span style={{ color: settings.isActive ? '#16a34a' : '#ca8a04', fontWeight: 'bold' }}>
                {settings.isActive ? 'LIVE' : 'COMING SOON'}
              </span>
            </p>
            {settings.isActive && (
              <p style={{ fontSize: '13px', color: '#666' }}>
                Election: {settings.year} | Date: {settings.date} | Time: {settings.time}
              </p>
            )}
          </div>
        )}

        {/* ===== TAB: CANDIDATES ===== */}
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
                      <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #003366' }}>Action</th>
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
                        <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
                          <button
                            onClick={() => deleteCandidate(c.id, c.photoURL)}
                            style={{
                              padding: '4px 12px',
                              background: '#dc2626',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontWeight: 'bold',
                              fontSize: '12px'
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ===== TAB: RESULTS ===== */}
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
              <h2 style={{ color: '#003366', margin: 0 }}>Election Results - {settings.year || 'N/A'}</h2>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
                  Print
                </button>
                {totalVotes > 0 && (
                  <button
                    onClick={clearResults}
                    style={{
                      padding: '8px 16px',
                      background: '#f59e0b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    Clear Results
                  </button>
                )}
              </div>
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
                    <tr style={{ background: '#003366', color: 'white' }}>
                      <th style={{ border: '1px solid #003366', padding: '8px' }}>S/N</th>
                      <th style={{ border: '1px solid #003366', padding: '8px' }}>Photo</th>
                      <th style={{ border: '1px solid #003366', padding: '8px' }}>Candidate</th>
                      <th style={{ border: '1px solid #003366', padding: '8px' }}>Position</th>
                      <th style={{ border: '1px solid #003366', padding: '8px' }}>Votes</th>
                      <th style={{ border: '1px solid #003366', padding: '8px' }}>Point</th>
                      <th style={{ border: '1px solid #003366', padding: '8px' }}>CandidateID</th>
                      <th style={{ border: '1px solid #003366', padding: '8px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedByVotes.map((c, idx) => (
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
                        <td style={{ border: '1px solid #ccc', padding: '8px', fontWeight: 'bold' }}>{c.name}</td>
                        <td style={{ border: '1px solid #ccc', padding: '8px' }}>{c.position}</td>
                        <td style={{ border: '1px solid #ccc', padding: '8px', fontWeight: 'bold' }}>{c.votes || 0}</td>
                        <td style={{ border: '1px solid #ccc', padding: '8px', fontWeight: 'bold', color: '#2563eb' }}>{calculatePoints(c.votes)}</td>
                        <td style={{ border: '1px solid #ccc', padding: '8px', fontSize: '11px', color: '#666' }}>{c.id}</td>
                        <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                          <button
                            onClick={() => deleteCandidate(c.id, c.photoURL)}
                            style={{
                              padding: '4px 10px',
                              background: '#dc2626',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontWeight: 'bold',
                              fontSize: '11px'
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {candidates.length > 0 && winner && (
              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <p style={{ color: '#666', fontSize: '14px' }}>
                  Winner:{' '}
                  <strong style={{ color: '#16a34a' }}>{winner.name}</strong>{' '}
                  with {winner.votes || 0} votes
                  {' '}({calculatePoints(winner.votes)} points)
                </p>
              </div>
            )}

            {/* APPROVAL & SIGNATURE SECTION */}
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
                <p style={{ fontWeight: 'bold', color: '#003366', marginBottom: '4px', fontSize: '14px' }}>
                  Approved by the Electoral Chairman
                </p>
                <hr style={{ width: '200px', margin: '8px auto', border: '1px solid #003366' }} />
                <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  Electoral Chairman Signature
                </p>

                <div style={{ marginTop: '24px' }}>
                  <hr style={{ width: '200px', margin: '8px auto', border: '1px solid #003366' }} />
                  <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    Electoral Secretary Signature
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <a href="#/" style={{ color: '#2563eb', fontSize: '13px' }}>Back to Home</a>
        </div>
      </div>
    </div>
  );
}
