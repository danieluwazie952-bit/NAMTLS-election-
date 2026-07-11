import { useState } from 'react';

export default function AdminDashboard() {
  const [tenureName, setTenureName] = useState('');
  const [currentTenure, setCurrentTenure] = useState(null);
  const [positions, setPositions] = useState([]); // {id, name, candidates:[]}
  const [newPos, setNewPos] = useState('');

  const createTenure = () => {
    if(tenureName) setCurrentTenure({name: tenureName, isClosed: false})
  }
  const closeTenure = () => {
    setCurrentTenure({...currentTenure, isClosed: true})
    alert("Tenure Closed. Dashboard 1 and 2 are now LOCKED for this tenure")
  }
  const addPosition = () => {
    if(newPos && positions.length < 20){
      setPositions([...positions, {id: Date.now(), name: newPos, candidates: []}]);
      setNewPos('');
    }
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <h1 className="text-2xl font-bold text-[#001F4D]">DASHBOARD 1: CANDIDATE MANAGEMENT</h1>

      {/* TENURE CONTROL */}
      <div className="bg-[#001F4D] text-white p-4 rounded-lg my-4">
        <input value={tenureName} onChange={e => setTenureName(e.target.value)} placeholder="Enter Tenure Name: 2026/2027 Tenure" className="p-2 rounded text-[#001F4D] w-64 mr-2" />
        <button onClick={createTenure} className="bg-[#D4AF37] text-[#001F4D] px-4 py-2 rounded font-bold mr-2">Create New Tenure</button>
        <button onClick={closeTenure} className="bg-red-600 text-white px-4 py-2 rounded font-bold">Close Tenure</button>
        {currentTenure && <p className="mt-2">Current: {currentTenure.name} | Status: {currentTenure.isClosed? 'CLOSED' : 'OPEN'}</p>}
      </div>

      {/* ADD POSITION */}
      <div className="my-4">
        <input value={newPos} onChange={e => setNewPos(e.target.value)} placeholder="Add Position: President" className="border-2 border-[#001F4D] p-2 rounded mr-2" />
        <button onClick={addPosition} className="bg-[#D4AF37] text-[#001F4D] px-4 py-2 rounded font-bold">Add Position</button>
      </div>

      {/* EC VIEW: ONLY NAME + POSITION */}
      {positions.map(pos => (
        <div key={pos.id} className="border-2 border-[#D4AF37] p-4 rounded-lg mb-4">
          <h2 className="font-bold text-[#001F4D] text-xl">{pos.name}</h2>
          <p className="text-sm">Candidates: {pos.candidates.length}/3 Max</p>
        </div>
      ))}
    </div>
  )
}
