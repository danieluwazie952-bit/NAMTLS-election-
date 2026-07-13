import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-navy flex flex-col items-center justify-center text-white p-8">
      <img src="/logo.png" alt="NAMTLS Logo" className="w-32 h-32 mb-6 rounded-full border-4 border-gold" />
      <h1 className="text-4xl font-bold mb-4">NAMTLS E-Voting System</h1>
      <p className="text-xl mb-8 text-gray-300">Official Student Union Election Portal</p>
      <div className="flex gap-6">
        <Link to="/student/dashboard" className="bg-gold text-navy px-8 py-3 rounded-lg font-bold hover:bg-yellow-400 transition">
          Student Portal
        </Link>
        <Link to="/admin" className="bg-white text-navy px-8 py-3 rounded-lg font-bold hover:bg-gray-200 transition">
          Admin Login
        </Link>
      </div>
    </div>
  );
}
