import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, updateDoc, doc, query, where, onSnapshot, increment } from 'firebase/firestore';

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState([]);
  const [settings, setSettings] = useState({});
  const [student, setStudent] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [authMode, setAuthMode] = useState('signup'); // 'signup' or 'login'
  const [form, setForm] = useState({ name: '', matric: '', level: '' });
  const [loginForm, setLoginForm] = useState({ matric: '' });

  useEffect(() => {
    // Load candidates in real-time
    const unsubCand = onSnapshot(collection(db, "candidates"), (snap) => {
      setCandidates(snap.docs.map(d => ({ id: d.id,...d.data() })));
    });

    // Load settings in real-time
    const unsubSet = onSnapshot(collection(db, "settings"), (snap) => {
      if(snap.docs.length > 0) setSettings(snap.docs[0].data());
      setLoading(false);
    });

    // Check if student is already logged in
    const savedStudent = JSON.parse(localStorage.getItem('studentInfo'));
    if(savedStudent) {
      setStudent(savedStudent);
      setHasVoted(savedStudent.hasVoted);
    }

    return () => { unsubCand(); unsubSet(); }
  }, []);

  const handleSignup = async () => {
    if(!form.name ||!form.matric ||!form.level) {
      alert('Please fill all fields');
      return;
    }
    // Check if matric already exists
    const q = query(collection(db, "students"), where("matric", "==", form.matric));
    const snap = await getDocs(q);
    if(!snap.empty) {
      alert('Matric Number already registered. Please Login.');
      setAuthMode('login');
      return;
    }

    const newStudent = {...form, hasVoted: false };
    await addDoc(collection(db, "students"), newStudent);
    localStorage.setItem('studentInfo', JSON.stringify(newStudent));
    setStudent(newStudent);
  };

  const handleLogin = async () => {
    if(!loginForm.matric) {
      alert('Please fill Matric Number');
      return;
    }
    const q = query(collection(db, "students"), where("matric", "==", loginForm.matric));
    const snap = await getDocs(q);
    if(snap.empty) {
      alert('Matric Number not found. Please Register.');
      return;
    }
    const studentData = snap.docs[0].data();
    localStorage.setItem('studentInfo', JSON.stringify(studentData));
    setStudent(studentData);
    setHasVoted(studentData.hasVoted);
  };

  const handleLogout = () => {
    localStorage.removeItem('studentInfo');
    setStudent(null);
    setAuthMode('login');
  };

  const isElectionReady = settings.isActive && candidates.length > 0 && settings.date && settings.time;
  const electionDateTime = new Date(`${settings.date}T${settings.time}`);
  const isElectionTime = new Date() >= electionDateTime;

  const handleVote = async (id) => {
    const candidateRef = doc(db, "candidates", id);
    await updateDoc(candidateRef, { votes: increment(1) });

    // Mark student as voted
    const q = query(collection(db, "students"), where("matric", "==", student.matric));
    const snap = await getDocs(q);
    const studentRef = doc(db, "students", snap.docs[0].id);
    await updateDoc(studentRef, { hasVoted: true });

    localStorage.setItem('studentInfo', JSON.stringify({...student, hasVoted: true}));
    setHasVoted(true);
    alert('Vote Submitted Successfully');
  }

  if(loading) {
    return (
      <div className="min-h-screen bg-green-800 flex flex-col items-center justify-center">
        <img src="/logo.png" alt="Logo" className="w-32 h-32 mb-4 animate-pulse" />
        <p className="text-white text-xl font-semibold">Loading Voting Portal...</p>
      </div>
    )
  }

  // STEP 1: STUDENT SIGN UP / LOGIN
  if (!student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-900 flex flex-col items-center justify-center text-white px-4">
        <div className="bg-white text-black p-8 rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-2">{authMode === 'signup'? 'Student Registration' : 'Student Login'}</h1>
          <p className="text-center text-gray-600 mb-6">{authMode === 'signup'? 'Create account to continue' : 'Login to continue'}</p>

          {authMode === 'signup' && (
            <>
              <input type="text" placeholder="Full Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full p-3 border rounded mb-3" />
              <input type="text" placeholder="Matric Number" value={form.matric} onChange={e => setForm({...form, matric: e.target.value})} className="w-full p-3 border rounded mb-3" />
              <select value={form.level} onChange={e => setForm({...form, level: e.target.value})} className="w-full p-3 border rounded mb-4">
                <option value="">Select Level</option>
                <option value="100">100 Level</option>
                <option value="200">200 Level</option>
                <option value="300">300 Level</option>
                <option value="400">400 Level</option>
                <option value="500">500 Level</option>
              </select>
              <button onClick={handleSignup} className="w-full bg-green-600 text-white px-4 py-3 rounded font-bold hover:bg-green-700">Register</button>
              <p className="text-center mt-4 text-sm">Already have an account? <span className="text-green-600 font-bold cursor-pointer" onClick={() => setAuthMode('login')}>Login</span></p>
            </>
          )}

          {authMode === 'login' && (
            <>
              <input type="text" placeholder="Matric Number" value={loginForm.matric} onChange={e => setLoginForm({...loginForm, matric: e.target.value})} className="w-full p-3 border rounded mb-4" />
              <button onClick={handleLogin} className="w-full bg-green-600 text-white px-4 py-3 rounded font-bold hover:bg-green-700">Login</button>
              <p className="text-center mt-4 text-sm">Don't have an account? <span className="text-green-600 font-bold cursor-pointer" onClick={() => setAuthMode('signup')}>Register</span></p>
            </>
          )}
        </div>
      </div>
    );
  }

  // STEP 2: ELECTION NOT READY
  if (!isElectionReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 to-black flex flex-col items-center justify-center text-white px-4">
        <button onClick={handleLogout} className="absolute top-4 right-4 bg-red-600 px-4 py-2 rounded">Logout</button>
        <h1 className="text-5xl font-bold text-center">ELECTION COMING SOON</h1>
        <p className="mt-4 text-lg">Welcome, {student.name}</p>
      </div>
    );
  }

  // STEP 3: ELECTION TIME NOT YET REACHED
  if (!isElectionTime) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 to-black flex flex-col items-center justify-center text-white px-4">
        <button onClick={handleLogout} className="absolute top-4 right-4 bg-red-600 px-4 py-2 rounded">Logout</button>
        <h1 className="text-5xl font-bold text-center">ELECTION COMING SOON</h1>
        <p className="mt-4 text-lg">Election starts: {settings.date} at {settings.time}</p>
        <p className="mt-2">Welcome, {student.name}</p>
      </div>
    );
  }

  // STEP 4: VOTING PAGE
  return (
    <div className="p-8 bg-gray-50 min-h-screen relative">
      {/* WATERMARK LOGO */}
      <img src="/logo.png" alt="Watermark" className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] opacity-5 pointer-events-none" />
      <button onClick={handleLogout} className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded z-20">Logout</button>

      <div className="relative z-10">
        <h1 className="text-3xl font-bold mb-2 text-center">Student Voting Portal</h1>
        <p className="text-center mb-2">Welcome, {student.name} - {student.matric} - {student.level} Level</p>
        <p className="text-center mb-6">Election Year: {settings.year}</p>
        {hasVoted? (
          <p className="text-green-600 text-center text-xl">You have already voted. Thank you.</p>
        ) : (
          <div className="grid gap-6 max-w-4xl mx-auto">
            {candidates.map(candidate => (
              <div key={candidate.id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <img src={candidate.photo} alt={candidate.name} className="w-32 h-32 object-cover rounded-full border-4 border-green-600" />
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">{candidate.name}</h2>
                    <p className="text-lg text-blue-700 font-semibold">Position: {candidate.position}</p>
                    <p className="mt-3"><b>Manifesto:</b> {candidate.manifesto || 'No manifesto provided'}</p>
                  </div>
                  <button onClick={() => handleVote(candidate.id)} className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-bold">Vote</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
