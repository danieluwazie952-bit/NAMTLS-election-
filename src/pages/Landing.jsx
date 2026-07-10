import { Link } from 'react-router-dom';
import logo from '../../logo.png';

export default function Landing() {
  return (
    <div className="bg-navy min-h-screen flex-col items-center justify-center text-white p-6">
      <img src={logo} className="w-32 h-32 mb-4" alt="NAMTLS Logo"/>
      <h1 className="text-xl font-bold text-center">NATIONAL ASSOCIATION OF MARITIME TRANSPORT AND LOGISTICS STUDENTS ELECTORAL COMMISSION</h1>
      <p className="mt-2 text-gold">Official Voting Portal</p>
      <div className="mt-8">
        <Link to="/vote" className="bg-gold text-navy px-8 py-4 rounded font-bold text-lg">Student Login/Register</Link>
      </div>
      <p className="text-xs mt-10 opacity-50">Admin? <Link to="/admin-login" className="underline">Click here</Link></p>
    </div>
  )
}
