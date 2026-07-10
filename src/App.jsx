import { useState, useEffect } from 'react'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, increment, onSnapshot } from 'firebase/firestore'

// YOUR FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyBwdhpv7e0Y3xNBovOpJEpRn9_jmDUOq8E",
  authDomain: "namtls-voting-2026-2027.firebaseapp.com",
  projectId: "namtls-voting-2026-2027",
  storageBucket: "namtls-voting-2026-2027.firebasestorage.app",
  messagingSenderId: "955792311858",
  appId: "1:955792311858:web:49a566b351ebab86c05e2b",
  measurementId: "G-SVDG83TZSG"
};

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// YOUR LOGO LINK FROM GITHUB
const LOGO_URL = "https://raw.githubusercontent.com/danieluwazie952-bit/mariti.../main/logo.png"

export default function App() {
  const [user, setUser] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [voters, setVoters] = useState([])
  const [view, setView] = useState('login')

  // LIVE UPDATES
  useEffect(() => {
    const unsub1 = onSnapshot(collection(db, "candidates"), (snapshot) => {
      setCandidates(snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})))
    })
    const unsub2 = onSnapshot(collection(db, "voters"), (snapshot) => {
      setVoters(snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})))
    })
    return () => {unsub1(); unsub2()}
  }, [])

  const handleLogin = async (email, password) => {
    if(email === 'admin@namtls.com' && password === 'admin123'){
      setUser({email, role: 'admin'})
      setView('admin')
      return
    }
    const found = voters.find(v => v.email === email)
    if(found){
      setUser({email, role: 'voter'})
      setView('vote')
    } else {
      alert('User not found. Please register first.')
    }
  }

  const handleRegister = async (email, name) => {
    await addDoc(collection(db, "voters"), {email, name, hasVoted: false})
    alert('Registered! Now login')
  }

  const handleVote = async (candidateId) => {
    const alreadyVoted = voters.find(v => v.email === user.email)?.hasVoted
    if(alreadyVoted){
      alert('You have already voted!')
      return
    }
    await addDoc(collection(db, "votes"), {candidate_id: candidateId, voter_email: user.email})
    await updateDoc(doc(db, "candidates", candidateId), {votes: increment(1)})
    await updateDoc(doc(db, "voters", voters.find(v => v.email === user.email).id), {hasVoted: true})
    alert('Vote submitted!')
  }

  return (
    <div style={{position: 'relative', minHeight: '100vh'}}>
      {/* BLUE WATERMARK */}
      <div style={{
        position: 'fixed', 
        top: 0, left: 0, width: '100%', height: '100%',
        background: `url(${LOGO_URL}) center center no-repeat`,
        backgroundSize: '400px',
        backgroundColor: '#0066cc',
        opacity: 0.08,
        zIndex: 0
      }} />
      
      <div style={{position: 'relative', zIndex: 1}}>
        {view === 'login' && <LoginScreen onLogin={handleLogin} onRegister={handleRegister} />}
        {view === 'admin' && <AdminPanel candidates={candidates} voters={voters} onLogout={() => setView('login')} />}
        {view === 'vote' && <VotingScreen user={user} candidates={candidates} onVote={handleVote} onLogout={() => setView('login')} />}
      </div>
    </div>
  )
}

function LoginScreen({onLogin, onRegister}) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  return (
    <div style={{minHeight: '100vh', padding: '40px 20px', textAlign: 'center'}}>
      <img src={LOGO_URL} style={{width: '180px', marginBottom: '20px'}} />
      <h1>NAMTLS Voting Portal 2026</h1>
      <div style={{maxWidth: '400px', margin: '0 auto', background: 'white', padding: 20, borderRadius: 10}}>
        <input style={{width: '100%', padding: 10, margin: 5}} placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input style={{width: '100%', padding: 10, margin: 5}} placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button style={{width: '100%', padding: 10, margin: 5, background: '#0066cc', color: 'white', border: 'none'}} onClick={() => onLogin(email, password)}>Login</button>
        <hr />
        <input style={{width: '100%', padding: 10, margin: 5}} placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} />
        <button style={{width: '100%', padding: 10, margin: 5}} onClick={() => onRegister(email, name)}>Register as Voter</button>
        <p><small>Admin: admin@namtls.com / admin123</small></p>
      </div>
    </div>
  )
}

function VotingScreen({user, candidates, onVote, onLogout}) {
  return (
    <div style={{padding: 20}}>
      <img src={LOGO_URL} style={{width: '100px'}} />
      <h2>Welcome {user.email}</h2>
      <button onClick={onLogout}>Logout</button>
      <h3>Cast Your Vote</h3>
      {candidates.map(c => (
        <div key={c.id} style={{border: '2px solid #0066cc', borderRadius: 8, margin: 10, padding: 15, background: 'white'}}>
          <p><b>{c.name}</b> - {c.position}</p>
          <p>Current Votes: {c.votes || 0}</p>
          <button style={{background: '#0066cc', color: 'white', padding: 8}} onClick={() => onVote(c.id)}>Vote</button>
        </div>
      ))}
    </div>
  )
}

function AdminPanel({candidates, voters, onLogout}) {
  const [newName, setNewName] = useState('')
  const [newPosition, setNewPosition] = useState('')
  const [newVoterEmail, setNewVoterEmail] = useState('')
  const [newVoterName, setNewVoterName] = useState('')

  const addCandidate = async () => {
    if(!newName || !newPosition) return alert('Fill all fields')
    await addDoc(collection(db, "candidates"), {name: newName, position: newPosition, votes: 0})
    setNewName(''); setNewPosition('')
  }

  const deleteCandidate = async (id) => {
    if(confirm('Delete this candidate?')) await deleteDoc(doc(db, "candidates", id))
  }

  const addVoter = async () => {
    if(!newVoterEmail || !newVoterName) return alert('Fill all fields')
    await addDoc(collection(db, "voters"), {email: newVoterEmail, name: newVoterName, hasVoted: false})
    setNewVoterEmail(''); setNewVoterName('')
  }

  return (
    <div style={{padding: 20}}>
      <img src={LOGO_URL} style={{width: '100px'}} />
      <h2>Admin Dashboard</h2>
      <button onClick={onLogout}>Logout</button>
      
      <div style={{background: 'white', padding: 15, margin: 10, borderRadius: 8}}>
        <h3>Add Candidate</h3>
        <input style={{padding: 8, margin: 5}} placeholder="Candidate Name" value={newName} onChange={e => setNewName(e.target.value)} />
        <input style={{padding: 8, margin: 5}} placeholder="Position" value={newPosition} onChange={e => setNewPosition(e.target.value)} />
        <button style={{background: '#0066cc', color: 'white', padding: 8}} onClick={addCandidate}>Add Candidate</button>
      </div>

      <div style={{background: 'white', padding: 15, margin: 10, borderRadius: 8}}>
        <h3>Add Voter</h3>
        <input style={{padding: 8, margin: 5}} placeholder="Voter Email" value={newVoterEmail} onChange={e => setNewVoterEmail(e.target.value)} />
        <input style={{padding: 8, margin: 5}} placeholder="Voter Name" value={newVoterName} onChange={e => setNewVoterName(e.target.value)} />
        <button style={{background: '#0066cc', color: 'white', padding: 8}} onClick={addVoter}>Add Voter</button>
      </div>

      <div style={{background: 'white', padding: 15, margin: 10, borderRadius: 8}}>
        <h3>Live Results</h3>
        {candidates.map(c => (
          <div key={c.id} style={{display: 'flex', justifyContent: 'space-between', margin: 5}}>
            <p>{c.name} - {c.position}: <b>{c.votes || 0} votes</b></p>
            <button style={{background: 'red', color: 'white'}} onClick={() => deleteCandidate(c.id)}>Delete</button>
          </div>
        ))}
      </div>

      <div style={{background: 'white', padding: 15, margin: 10, borderRadius: 8}}>
        <h3>Registered Voters: {voters.length}</h3>
        {voters.map(v => <p key={v.id}>{v.name} - {v.email} {v.hasVoted ? '✅ Voted' : '❌ Not Voted'}</p>)}
      </div>
    </div>
  )
}
