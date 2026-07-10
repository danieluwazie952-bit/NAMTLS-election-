import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [pass, setPass] = useState("");
  const navigate = useNavigate();
  const ADMIN_KEY = "NAMSEC124ky4";

  const login = () => {
    if(pass === ADMIN_KEY) {
      localStorage.setItem("admin", "true");
      navigate("/dashboard1");
    } else alert("Invalid Access Key");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy">
      <div className="bg-white p-8 rounded shadow-lg w-96">
        <h2 className="text-2xl font-bold text-navy mb-4">EC Chairman Login</h2>
        <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Enter Special Access Key" className="w-full border p-3 rounded mb-4"/>
        <button onClick={login} className="w-full bg-navy text-white py-3 rounded font-bold">Login</button>
      </div>
    </div>
  )
}
