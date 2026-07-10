import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

const LOGO_URL = "https://i.imgur.com/8KmNP3A.png"

export default function App() {
  const [user, setUser] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [view, setView] = useState('login') // login, vote, admin

  useEffect(() => { loadCandidates() }, [])

  const loadCandidates = async () => {
    const { data } = await supabase.from('candidates').select('*')
    setCandidates(data || [])
  }

  const handleLogin = async (email, password) => {
    if(email === 'admin@namtls.com' && password === 'admin123'){
      setUser({email, role: 'admin'})
      setView('admin')
      return
    }
    const { data } = await supabase.from('voters').select('*').eq('email', email)
    if(data && data.length > 0){
      setUser({email, role: 'voter'})
      setView('vote')
    } else {
      alert('User not found. Please register first.')
    }
  }

  const handleRegister = async (email, name) => {
    const { error } = await supabase.from('voters').insert([{email, name}])
    if(error) alert(error.message)
    else alert('Registered! Now login')
  }

  const handleVote = async (candidateId) => {
    await supabase.from('votes').insert([{candidate_id: candidateId, voter_email: user.email}])
    await supabase.from('candidates').update({votes: candidates.find(c=>c.id===candidateId).votes + 1}).eq('id', candidateId)
    alert('Vote submitted!')
    loadCandidates()
  }

  if(view === 'login') return <LoginScreen onLogin={handleLogin} onRegister={handleRegister} />
  if(view === 'admin') return <AdminPanel candidates={candidates} onLogout={() => setView('login')} />
  if(view === 'vote') return <VotingScreen user={user} candidates={candidates} onVote={handleVote} onLogout={() => setView('login')} />
}

function LoginScreen({onLogin, onRegister}) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  return (
    <div style={{minHeight: '100vh', padding: '40px 20px', textAlign: 'center', background: '#f0f8ff'}}>
      <img src={LOGO_URL} style={{width: '180px', marginBottom: '20px'}} />
      <h1>NAMTLS Voting Portal</h1>
      <div style={{maxWidth: '400px', margin: '0 auto'}}>
        <input style={{width: '100%', padding: 10, margin: 5}} placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input style={{width: '100%', padding: 10, margin: 5}} placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button style={{width: '100%', padding: 10, margin: 5}} onClick={() => onLogin(email, password)}>Login</button>
        <hr />
        <input style={{width: '100%', padding: 10, margin: 5}} placeholder="Name for Register" value={name} onChange={e => setName(e.target.value)} />
        <button style={{width: '100%', padding: 10, margin: 5}} onClick={() => onRegister(email, name)}>Register</button>
        <p>Admin login: admin@namtls.com / admin123</p>
      </div>
    </div>
  )
}

function VotingScreen({user, candidates, onVote, onLogout}) {
  return (
    <div style={{padding: 20}}>
      <h2>Welcome {user.email}</h2>
      <button onClick={onLogout}>Logout</button>
      <h3>Cast Your Vote</h3>
      {candidates.map(c => (
        <div key={c.id} style={{border: '2px solid #007bff', borderRadius: 8, margin: 10, padding: 15}}>
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
      <h2>Admin Dashboard</h2>
      <button onClick={onLogout}>Logout</button>
      <h3>Live Results</h3>
      {candidates.map(c => <p key={c.id} style={{fontSize: 18}}>{c.name}: <b>{c.votes} votes</b></p>)}
    </div>
  )
}
