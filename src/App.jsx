import { useState, useEffect } from 'react'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, addDoc, updateDoc, doc, increment } from 'firebase/firestore'

// PASTE YOUR FIREBASE CONFIG HERE
const firebaseConfig = {
  apiKey: "PASTE_YOURS",
  authDomain: "PASTE_YOURS",
  projectId: "PASTE_YOURS",
  storageBucket: "PASTE_YOURS",
  messagingSenderId: "PASTE_YOURS",
  appId: "PASTE_YOURS"
};

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// YOUR LOGO LINK FROM GITHUB
const LOGO_URL = "https://raw.githubusercontent.com/danieluwazie952-bit/mariti.../main/logo.png"

export default function App() {
  const [user, setUser] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [view, setView] = useState('login')

  useEffect(() => { loadCandidates() }, [])

  const loadCandidates = async () => {
    const snapshot = await getDocs(collection(db, "candidates"))
    setCandidates(snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})))
  }

  const handleLogin = async (email, password) => {
    if(email === 'admin@namtls.com' && password === 'admin123'){
      setUser({email, role: 'admin'})
      setView('admin')
      return
    }
    const snapshot = await getDocs(collection(db, "voters"))
    const found = snapshot.docs.find(d => d.data().email === email)
    if(found){
      setUser({email, role: 'voter'})
      setView('vote')
    } else {
      alert('User not found. Please register first.')
    }
  }

  const handleRegister = async (email, name) => {
    await addDoc(collection(db, "voters"), {email, name})
    alert('Registered! Now login')
  }

  const handleVote = async (candidateId) => {
    await addDoc(collection(db, "votes"), {candidate_id: candidateId, voter_email: user.email})
    await updateDoc(doc(db, "candidates", candidateId), {votes: increment(1)})
    alert('Vote submitted!')
    loadCandidates()
  }

  return (
    <div style={{position: 'relative', minHeight: '100vh'}}>
      {/* BLUE WATERMARK WITH LOGO */}
      <div style={{
        position: 'fixed', 
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `url(${LOGO_URL}) center center no-repeat`,
        backgroundSize: '400px',
        backgroundColor: '#0066cc', // THIS IS THE BLUE BACKGROUND FROM YOUR LOGO
        opacity: 0.08,
        zIndex: 0
      }} />
      
      <div style={{position: 'relative', zIndex: 1}}>
        {view === 'login' && <LoginScreen onLogin={handleLogin} onRegister={handleRegister} />}
        {view === 'admin' && <AdminPanel candidates={candidates} onLogout={() => setView('login')} />}
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
        <button style={{width: '100%', padding: 10, margin: 5}} onClick={() => onLogin(email, password)}>Login</button>
        <hr />
        <input style={{width: '100%', padding: 10, margin: 5}} placeholder="Name for Register" value={name} onChange={e => setName(e.target.value)} />
        <button style={{width: '100%', padding: 10, margin: 5}} onClick={() => onRegister(email, name)}>Register</button>
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
          <p>Current Votes: {c.votes}</p>
          <button onClick={() => onVote(c.id)}>Vote for {c.name}</button>
        </div>
      ))}
    </div>
  )
}

function AdminPanel({candidates, onLogout}) {
  return (
    <div style={{padding: 20}}>
      <img src={LOGO_URL} style={{width: '100px'}} />
      <h2>Admin Dashboard</h2>
      <button onClick={onLogout}>Logout</button>
      <h3>Live Results</h3>
      {candidates.map(c => <p key={c.id} style={{fontSize: 18}}>{c.name}: <b>{c.votes} votes</b></p>)}
    </div>
  )
}
