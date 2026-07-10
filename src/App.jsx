import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const LOGO_URL = "https://i.imgur.com/8QZkL9P.jpg"

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export default function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [newName, setNewName] = useState('')
  const [newPosition, setNewPosition] = useState('')

  // YOU ARE ADMIN IF EMAIL = admin@namtls.com
  const isAdmin = user?.email === 'admin@namtls.com'

  useEffect(() => { fetchCandidates() }, [])

  async function fetchCandidates() {
    const { data } = await supabase.from('candidates').select('*').order('id')
    setCandidates(data || [])
  }

  async function register() {
    const { error } = await supabase.from('voters').insert([{ email, password_hash: password }])
    if (!error) alert('Registered! Now login')
    else alert(error.message)
  }

  async function login() {
    const { data } = await supabase.from('voters').select('*').eq('email', email).eq('password_hash', password).single()
    if (data) setUser(data)
    else alert('Wrong login')
  }

  async function vote(candidate_id) {
    if (user.has_voted) return alert('You already voted!')
    await supabase.from('votes').insert([{ voter_id: user.id, candidate_id }])
    await supabase.from('voters').update({ has_voted: true }).eq('id', user.id)
    await supabase.from('candidates').update({ votes: candidates.find(c=>c.id===candidate_id).votes + 1 }).eq('id', candidate_id)
    alert('Vote cast!')
    setUser({...user, has_voted: true})
    fetchCandidates()
  }

  async function addCandidate() {
    if(!newName || !newPosition) return alert('Fill name and position')
    await supabase.from('candidates').insert([{ name: newName, position: newPosition, votes: 0 }])
    setNewName('')
    setNewPosition('')
    fetchCandidates()
    alert('Candidate Added!')
  }

  async function deleteCandidate(id) {
    if(confirm('Delete this candidate?')) {
      await supabase.from('candidates').delete().eq('id', id)
      fetchCandidates()
    }
  }

  return (
    <div style={{minHeight: '100vh', backgroundImage: `url(${LOGO_URL})`, backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundSize: '400px', opacity: 0.08, padding: '20px', textAlign: 'center', fontFamily: 'Arial'}}>
      <img src={LOGO_URL} style={{width: '220px', marginBottom: '10px'}} />
      <h1 style={{color:'#003366'}}>NAMTLS ELECTORAL COMMISSION</h1>
      
      {!user? (
        <div>
          <h2>Login / Register</h2>
          <input placeholder="Email" onChange={e=>setEmail(e.target.value)} style={{display:'block', margin:'10px auto', padding:'10px', width:'80%'}} />
          <input placeholder="Password" type="password" onChange={e=>setPassword(e.target.value)} style={{display:'block', margin:'10px auto', padding:'10px', width:'80%'}} />
          <button onClick={login} style={{margin:'5px', padding:'10px 20px', background:'#003366', color:'white'}}>Login</button>
          <button onClick={register} style={{margin:'5px', padding:'10px 20px'}}>Register</button>
          <p><small>Admin email: admin@namtls.com</small></p>
        </div>
      ) : (
        <div>
          <h2>Welcome {user.email}</h2>
          {user.has_voted && <p style={{color:'green', fontWeight:'bold'}}>You have already voted ✅</p>}
          
          {isAdmin && (
            <div style={{border:'2px dashed #003366', padding:'15px', margin:'20px auto', maxWidth:'400px', background:'#fff'}}>
              <h3>Add New Candidate</h3>
              <input placeholder="Candidate Name" value={newName} onChange={e=>setNewName(e.target.value)} style={{display:'block', margin:'10px auto', padding:'10px', width:'90%'}} />
              <input placeholder="Position" value={newPosition} onChange={e=>setNewPosition(e.target.value)} style={{display:'block', margin:'10px auto', padding:'10px', width:'90%'}} />
              <button onClick={addCandidate} style={{padding:'10px 20px', background:'green', color:'white'}}>Add Candidate</button>
            </div>
          )}

          <h3>Candidates</h3>
          {candidates.map(c => (
            <div key={c.id} style={{border:'2px solid #003366', margin:'10px auto', padding:'15px', maxWidth:'350px', borderRadius:'10px', background:'#fff'}}>
              <h3>{c.name}</h3>
              <p><b>{c.position}</b></p>
              <p><b>Votes: {c.votes}</b></p>
              {!user.has_voted && !isAdmin && <button onClick={()=>vote(c.id)} style={{padding:'10px 20px', background:'#003366', color:'white'}}>Vote</button>}
              {isAdmin && <button onClick={()=>deleteCandidate(c.id)} style={{padding:'5px 10px', background:'red', color:'white', marginTop:'5px'}}>Delete</button>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
