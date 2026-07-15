import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, storage } from '../firebase';
import {
  collection, addDoc, getDocs, doc, setDoc, deleteDoc, updateDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const MAX_PER_POSITION = 5;

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('settings');
  const [candidates, setCandidates] = useState([]);
  const [settings, setSettings] = useState({
    year: '', startDate: '', startTime: '',
    endDate: '', endTime: '', isActive: false
  });
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

  const getCountForPosition = (pos) => {
    return candidates.filter(c => c.position === pos).length;
  };

  const isPositionFull = (pos) => {
    return getCountForPosition(pos) >= MAX_PER_POSITION;
  };

  const addCandidate = async () => {
    if (!name || !position) {
      alert('Please fill Name and Position');
      return;
    }
    if (isPositionFull(position)) {
      alert(
        'Position "' + position + '" already has ' +
        getCountForPosition(position) + ' candidates. ' +
        'Maximum is ' + MAX_PER_POSITION + '.'
      );
      return;
    }
    try {
      let photoURL = '';
      if (photo) {
        const storageRef = ref(storage, 'candidates/' + Date.now() + '_' + photo.name);
        const snapshot = await uploadBytes(storageRef, photo);
        photoURL = await getDownloadURL(snapshot.ref);
      }
      await addDoc(collection(db, 'candidates'), {
        name: name,
        position: position,
        dept: dept,
        manifesto: manifesto,
        photoURL: photoURL,
        votes: 0
      });
      setName('');
      setPosition('');
      setDept('');
      setManifesto('');
      setPhoto(null);
      setPhotoPreview('');
      loadData();
      alert('Candidate added successfully!');
    } catch (e) {
      alert('FAILED TO ADD: ' + e.message);
    }
  };

  const deleteCandidate = async (id, photoURL) => {
    if (!window.confirm('Delete this candidate?')) return;
    try {
      if (photoURL) {
        try {
          await deleteObject(ref(storage, photoURL));
        } catch (_) {}
      }
      await deleteDoc(doc(db, 'candidates', id));
      loadData();
    } catch (e) {
      alert('FAILED TO DELETE: ' + e.message);
    }
  };

  const saveSettings = async () => {
    if (!settings.year || !settings.startDate || !settings.startTime ||
        !settings.endDate || !settings.endTime) {
      alert('Please fill all fields');
      return;
    }
    try {
      await setDoc(doc(db, 'settings', 'main'), {
        ...settings, isActive: true
      });
      alert('Election Settings Saved!');
      loadData();
    } catch (e) {
      alert('FAILED TO SAVE: ' + e.message);
    }
  };

  const toggleElection = async () => {
    try {
      await setDoc(doc(db, 'settings', 'main'), {
        ...settings, isActive: !settings.isActive
      });
      loadData();
    } catch (e) {
      alert('FAILED: ' + e.message);
    }
  };

  const deleteAllElectionData = async () => {
    if (!window.confirm('Delete ALL election data?')) return;
    try {
      const candSnap = await getDocs(collection(db, 'candidates'));
      for (const d of candSnap.docs) {
        if (d.data().photoURL) {
          try { await deleteObject(ref(storage, d.data().photoURL)); } catch (_) {}
        }
        await deleteDoc(doc(db, 'candidates', d.id));
      }
      await setDoc(doc(db, 'settings', 'main'), {
        year: '', startDate: '', startTime: '',
        endDate: '', endTime: '', isActive: false
      });
      loadData();
      alert('All election data cleared.');
    } catch (e) {
      alert('FAILED: ' + e.message);
    }
  };

  const clearAllVotes = async () => {
    if (!window.confirm('Clear ALL votes?')) return;
    try {
      const candSnap = await getDocs(collection(db, 'candidates'));
      for (const d of candSnap.docs) {
        await updateDoc(doc(db, 'candidates', d.id), { votes: 0 });
      }
      loadData();
      alert('All votes cleared.');
    } catch (e) {
      alert('FAILED: ' + e.message);
    }
  };

  const handleLogout = () => { navigate('/admin'); };

  const calculatePoints = (votes) => { return (votes || 0) * 10; };

  const totalVotes = candidates.reduce((sum, c) => sum + (c.votes || 0), 0);

  const startDateTime = settings.startDate && settings.startTime
    ? new Date(settings.startDate + 'T' + settings.startTime) : null;
  const endDateTime = settings.endDate && settings.endTime
    ? new Date(settings.endDate + 'T' + settings.endTime) : null;
  const now = new Date();
  const isElectionStarted = startDateTime ? now >= startDateTime : false;
  const isElectionEnded = endDateTime ? now >= endDateTime : false;

  const getElectionPhase = () => {
    if (!settings.isActive) return { label: 'INACTIVE', color: '#6b7280' };
    if (!settings.startDate) return { label: 'NOT CONFIGURED', color: '#6b7280' };
    if (!isElectionStarted) return { label: 'COMING SOON', color: '#f59e0b' };
    if (isElectionEnded) return { label: 'ENDED', color: '#dc2626' };
    return { label: 'LIVE', color: '#16a34a' };
  };

  const phase = getElectionPhase();
  const sortedByVotes = [...candidates].sort((a, b) => (b.votes || 0) - (a.votes || 0));

  const inputStyle = {
    width: '100%', padding: '8px', border: '1px solid #ccc',
    borderRadius: '4px', marginBottom: '12px', boxSizing: 'border-box'
  };

  const btnStyle = (isActive) => ({
    padding: '8px 16px', borderRadius: '4px', fontWeight: '600',
    background: isActive ? '#2563eb' : '#e5e7eb',
    color: isActive ? 'white' : '#374151', border: 'none', cursor: 'pointer'
  });

  const positionCounts = {};
  candidates.forEach(c => {
    positionCounts[c.position] = (positionCounts[c.position] || 0) + 1;
  });
  const positions = Object.keys(positionCounts);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#003366', color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        Loading Admin Panel...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh', background: '#003366', color: 'white',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', fontFamily: 'Arial, sans-serif',
        padding: '32px', textAlign: 'center'
      }}>
        <h2 style={{ color: '#dc2626' }}>ERROR</h2>
        <p>{error}</p>
        <button onClick={loadData} style={{
          padding: '10px 24px', background: '#2563eb', color: 'white',
          border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold',
          marginTop: '12px'
        }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div style={{
        background: '#003366', color: 'white', padding: '16px 32px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>Admin Dashboard</h1>
        <button onClick={handleLogout} style={{
          padding: '8px 16px', background: '#dc2626', color: 'white',
          border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
        }}>
          Logout
        </button>
      </div>

      {/* Tab Navigation */}
      <div style={{
        padding: '16px 32px', display: 'flex', gap: '8px',
        background: 'white', borderBottom: '1px solid #e5e7eb'
      }}>
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

      {/* Content */}
      <div style={{ padding: '24px 32px' }}>
        {/* SETTINGS TAB */}
        {tab === 'settings' && (
          <div style={{
            background: 'white', padding: '24px', borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)', maxWidth: '600px'
          }}>
            <h2 style={{ marginTop: 0 }}>Set Election Details</h2>
            <input
              placeholder="Year"
              value={settings.year}
              onChange={(e) => setSettings({ ...settings, year: e.target.value })}
              style={inputStyle}
            />
            <input
              type="date"
              value={settings.startDate}
              onChange={(e) => setSettings({ ...settings, startDate: e.target.value })}
              style={inputStyle}
            />
            <input
              type="time"
              value={settings.startTime}
              onChange={(e) => setSettings({ ...settings, startTime: e.target.value })}
              style={inputStyle}
            />
            <input
              type="date"
              value={settings.endDate}
              onChange={(e) => setSettings({ ...settings, endDate: e.target.value })}
              style={inputStyle}
            />
            <input
              type="time"
              value={settings.endTime}
              onChange={(e) => setSettings({ ...settings, endTime: e.target.value })}
              style={inputStyle}
            />
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button onClick={saveSettings} style={{
                padding: '10px 20px', background: '#2563eb', color: 'white',
                border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
              }}>
                Save Settings
              </button>
              <button onClick={toggleElection} style={{
                padding: '10px 20px',
                background: settings.isActive ? '#dc2626' : '#16a34a',
                color: 'white', border: 'none', borderRadius: '4px',
                cursor: 'pointer', fontWeight: 'bold'
              }}>
                {settings.isActive ? 'Deactivate Election' : 'Activate Election'}
              </button>
              <button onClick={deleteAllElectionData} style={{
                padding: '10px 20px', background: '#6b7280', color: 'white',
                border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
              }}>
                Delete All Data
              </button>
            </div>
            <div style={{
              padding: '16px', background: '#f9fafb',
              borderRadius: '4px', fontSize: '14px'
            }}>
              <p><strong>Status: </strong>
                <span style={{ color: phase.color }}>{phase.label}</span>
              </p>
              {settings.startDate && (
                <p>
                  Start: {settings.startDate} at {settings.startTime}<br />
                  End: {settings.endDate} at {settings.endTime}<br />
                  Year: {settings.year}
                </p>
              )}
              <p>
                <strong>Candidate Limit:</strong> Maximum of {MAX_PER_POSITION} candidates
                {' '}<strong>per position</strong>
              </p>
              <p>
                Total candidates: {candidates.length} across {positions.length} positions
              </p>
              {positions.map(pos => (
                <p key={pos} style={{ margin: '4px 0', fontSize: '13px' }}>
                  {pos}: {positionCounts[pos]}/{MAX_PER_POSITION}
                  {' '}{positionCounts[pos] >= MAX_PER_POSITION
                    ? '(FULL)'
                    : '(' + (MAX_PER_POSITION - positionCounts[pos]) + ' slots left)'
                  }
                </p>
              ))}
            </div>
          </div>
        )}

        {/* CANDIDATES TAB */}
        {tab === 'candidates' && (
          <div style={{
            background: 'white', padding: '24px', borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: '16px'
            }}>
              <h2 style={{ margin: 0 }}>Manage Candidates</h2>
              <div style={{ textAlign: 'right', fontSize: '14px', color: '#666' }}>
                <p style={{ margin: 0 }}>Total Candidates: {candidates.length}</p>
                <p style={{ margin: 0 }}>Total Votes Cast: {totalVotes}</p>
                <p style={{ margin: 0 }}>Year: {settings.year || 'Not Set'}</p>
                <p style={{ margin: 0, fontWeight: 'bold' }}>Phase: {phase.label}</p>
              </div>
            </div>

            {/* Per-position limits summary */}
            <div style={{
              background: '#f0fdf4', padding: '12px', borderRadius: '4px',
              marginBottom: '16px', fontSize: '14px'
            }}>
              <strong>Per-Position Limits (Max {MAX_PER_POSITION} per position):</strong>
              {positions.length === 0 ? (
                <p style={{ margin: '4px 0' }}>No positions yet</p>
              ) : (
                positions.map(pos => (
                  <p key={pos} style={{ margin: '4px 0' }}>
                    {pos}: {positionCounts[pos]}/{MAX_PER_POSITION}
                    {' '}{positionCounts[pos] >= MAX_PER_POSITION ? ' FULL' : ''}
                  </p>
                ))
              )}
            </div>

            {/* Add Candidate Form */}
            <div style={{
              padding: '16px', background: '#f9fafb',
              borderRadius: '4px', marginBottom: '16px'
            }}>
              <h3 style={{ marginTop: 0 }}>Add Candidate</h3>
              <input
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={inputStyle}
              />
              <input
                placeholder="Position (e.g. President)"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                style={inputStyle}
              />
              {isPositionFull(position) && position && (
                <p style={{ color: '#dc2626', fontSize: '13px', margin: '-8px 0 12px 0' }}>
                  Position "{position}" already has {getCountForPosition(position)} candidates
                  (max {MAX_PER_POSITION}).
                </p>
              )}
              <input
                placeholder="Department"
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                style={inputStyle}
              />
              <textarea
                placeholder="Manifesto"
                value={manifesto}
                onChange={(e) => setManifesto(e.target.value)}
                style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
              />
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
                  Photo
                </label>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} />
                {photoPreview && (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    style={{
                      width: '80px', height: '80px', objectFit: 'cover',
                      borderRadius: '4px', marginTop: '8px'
                    }}
                  />
                )}
              </div>
              <button
                onClick={addCandidate}
                disabled={isPositionFull(position)}
                style={{
                  padding: '10px 20px',
                  background: isPositionFull(position) ? '#9ca3af' : '#2563eb',
                  color: 'white', border: 'none', borderRadius: '4px',
                  cursor: isPositionFull(position) ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {isPositionFull(position) ? 'Position Full' : 'Add Candidate'}
              </button>
            </div>

            {/* Candidate List */}
            <h3>All Candidates ({candidates.length})</h3>
            {candidates.length === 0 ? (
              <p style={{ color: '#666' }}>No candidates added yet.</p>
            ) : (
              <div>
                {candidates.map(c => {
                  const voteCount = c.votes || 0;
                  return (
                    <div key={c.id} style={{
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between', padding: '12px',
                      border: '1px solid #e5e7eb', borderRadius: '4px',
                      marginBottom: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {c.photoURL && (
                          <img
                            src={c.photoURL}
                            alt=""
                            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%' }}
                          />
                        )}
                        <div>
                          <strong>{c.name}</strong> - {c.position}
                          {c.dept && <span style={{ color: '#666', fontSize: '13px' }}> ({c.dept})</span>}
                          <span style={{ color: '#666', fontSize: '13px', marginLeft: '8px' }}>
                            Votes: {voteCount}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteCandidate(c.id, c.photoURL)}
                        style={{
                          padding: '6px 12px', background: '#dc2626', color: 'white',
                          border: 'none', borderRadius: '4px', cursor: 'pointer',
                          fontSize: '12px', fontWeight: 'bold'
                        }}
                      >
                        X
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* RESULTS TAB */}
        {tab === 'results' && (
          <div style={{
            background: 'white', padding: '24px', borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '16px' }}>
              <button onClick={clearAllVotes} style={{
                padding: '8px 20px', background: '#dc2626', color: 'white',
                border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer'
              }}>
                Clear Votes
              </button>
              <button onClick={() => window.print()} style={{
                padding: '8px 20px', background: '#003366', color: 'white',
                border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer'
              }}>
                Print
              </button>
            </div>

            <div style={{ padding: '24px', border: '1px solid #e5e7eb', borderRadius: '4px' }}>
              <h1 style={{ textAlign: 'center', color: '#003366' }}>
                NAMATL STUDENT E-VOTING
              </h1>
              <hr />
              {settings.year && (
                <p style={{ textAlign: 'center', fontWeight: 'bold' }}>{settings.year}</p>
              )}
              <h2 style={{ textAlign: 'center' }}>OFFICIAL RESULTS</h2>

              {candidates.length === 0 ? (
                <p style={{ textAlign: 'center' }}>No candidates available.</p>
              ) : (
                <div>
                  {positions.map(pos => {
                    const posCandidates = sortedByVotes.filter(c => c.position === pos);
                    const winner = posCandidates[0];
                    return (
                      <div key={pos} style={{ marginBottom: '32px' }}>
                        <h3 style={{ color: '#003366', borderBottom: '2px solid #003366', paddingBottom: '8px' }}>
                          {pos}
                        </h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px' }}>
                          <thead>
                            <tr style={{ background: '#003366', color: 'white' }}>
                              <th style={{ padding: '8px', border: '1px solid #003366' }}>#</th>
                              <th style={{ padding: '8px', border: '1px solid #003366' }}>Candidate</th>
                              <th style={{ padding: '8px', border: '1px solid #003366' }}>Votes</th>
                              <th style={{ padding: '8px', border: '1px solid #003366' }}>Points</th>
                            </tr>
                          </thead>
                          <tbody>
                            {posCandidates.map((c, i) => (
                              <tr key={c.id} style={{ background: i === 0 ? '#f0fdf4' : 'white' }}>
                                <td style={{ padding: '8px', border: '1px solid #d1d5db', textAlign: 'center' }}>
                                  {i + 1}
                                </td>
                                <td style={{ padding: '8px', border: '1px solid #d1d5db' }}>
                                  {i === 0 ? 'WINNER ' : ''}{c.name}
                                </td>
                                <td style={{ padding: '8px', border: '1px solid #d1d5db', textAlign: 'center' }}>
                                  {c.votes || 0}
                                </td>
                                <td style={{ padding: '8px', border: '1px solid #d1d5db', textAlign: 'center' }}>
                                  {calculatePoints(c.votes)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {winner && (
                          <p style={{ fontWeight: 'bold', color: '#16a34a' }}>
                            Winner: {winner.name} ({winner.votes || 0} votes - {calculatePoints(winner.votes)} points)
                          </p>
                        )}
                      </div>
                    );
                  })}
                  <hr />
                  <p style={{ textAlign: 'center', fontStyle: 'italic' }}>
                    Approved by Electoral Chairman
                  </p>
                  <hr />
                  <p style={{ textAlign: 'center' }}>Chairman Signature</p>
                  <hr />
                </div>
              )}
              <p style={{ textAlign: 'center', marginTop: '24px' }}>
                <a href="#/" style={{ color: '#2563eb' }}>Home</a>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}