import { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function Dashboard1() {
  const [tenures, setTenures] = useState([]);
  const [currentTenure, setCurrentTenure] = useState("");
  const [newTenureName, setNewTenureName] = useState("");
  const [positions, setPositions] = useState([]);
  const [newPosition, setNewPosition] = useState("");

  useEffect(() => { loadTenures(); }, []);

  const loadTenures = async () => {
    const snap = await getDocs(collection(db, "tenures"));
    setTenures(snap.docs.map(d => ({id: d.id,...d.data()})));
  }

  const createTenure = async () => {
    if(!newTenureName) return alert("Enter Tenure Name");
    await addDoc(collection(db, "tenures"), {name: newTenureName, status: "open"});
    setNewTenureName(""); loadTenures();
  }

  const closeTenure = async (id) => {
    await updateDoc(doc(db, "tenures", id), {status: "closed"});
    loadTenures();
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-navy">Dashboard 1: Candidate Management</h1>
      <div className="mt-4 flex gap-2">
        <input value={newTenureName} onChange={e=>setNewTenureName(e.target.value)} placeholder="Enter Tenure Name" className="border p-2 rounded"/>
        <button onClick={createTenure} className="bg-gold text-navy px-4 py-2 rounded font-bold">Create New Tenure</button>
      </div>
      <p className="mt-4">Select Tenure: 
        <select onChange={e=>setCurrentTenure(e.target.value)} className="border p-2 ml-2">
          <option>Select Tenure</option>
          {tenures.map(t => <option key={t.id} value={t.id}>{t.name} - {t.status}</option>)}
        </select>
      </p>
      <button onClick={()=>closeTenure(currentTenure)} className="bg-red-600 text-white px-4 py-2 rounded mt-2">Close Tenure</button>
      <p className="mt-6">Next: Add Positions and Candidates logic here. Max 3 candidates per position.</p>
    </div>
  )
}
