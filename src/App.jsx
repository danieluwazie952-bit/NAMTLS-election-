import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// OFFICIAL NAMTLS LOGO
const LOGO_URL = "https://i.imgur.com/8QZkL9P.jpg" // This is your logo hosted

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export default function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [candidates, setCandidates] = useState([])

  useEffect(() => { fetchCandidates() }, [])

  async function fetchCandidates() {
    const { data } = await supabase.from('candidates').select('*')
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

  return (
    <div style={{
      minHeight: '100vh', 
      backgroundImage: `url(${LOGO_URL})`, 
      backgroundRepeat: 'no-repeat', 
      backgroundPosition: 'center', 
      backgroundSize: '400px', 
      opacity: 0.08,
      padding: '20px',
      textAlign: 'center',
      fontFamily: 'Arial'
    }}>
      <img src={LOGO_URL} style={{width: '220px', marginBottom: '10px'}} />
      <h1 style={{color:'#003366'}}>NAMTLS ELECTORAL COMMISSION</h1>
      
      {!user? (
        <div>
          <h2>Login / Register</h2>
          <input placeholder="Email" onChange={e=>setEmail(e.target.value)} style={{display:'block', margin:'10px auto', padding:'10px', width:'80%'}} />
          <input placeholder="Password" type="password" onChange={e=>setPassword(e.target.value)} style={{display:'block', margin:'10px auto', padding:'10px', width:'80%'}} />
          <button onClick={login} style={{margin:'5px', padding:'10px 20px', background:'#003366', color:'white'}}>Login</button>
          <button onClick={register} style={{margin:'5px', padding:'10px 20px'}}>Register</button>
        </div>
      ) : (
        <div>
          <h2>Vote Now</h2>
          {user.has_voted && <p style={{color:'green', fontWeight:'bold'}}>You have already voted ✅</p>}
          {candidates.map(c => (
            <div key={c.id} style={{border:'2px solid #003366', margin:'10px auto', padding:'15px', maxWidth:'350px', borderRadius:'10px', background:'#fff'}}>
              <h3>{c.name}</h3>
              <p>{c.position}</p>
              <p><b>Votes: {c.votes}</b></p>
              {!user.has_voted && <button onClick={()=>vote(c.id)} style={{padding:'10px 20px', background:'#003366', color:'white'}}>Vote</button>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
