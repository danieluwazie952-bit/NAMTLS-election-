import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 to-blue-700 flex flex-col items-center justify-center text-white px-4">
      <h1 className="text-5xl font-bold mb-4 text-center">NUTAS E-Voting System</h1>
      <p className="mb-8 text-lg text-center">Official Student Union Election Portal</p>
      <div className="space-x-4">
        <Link to="/student-dashboard" className="bg-white text-green-700 px-6 py-3 rounded-lg font-semibold">Student Portal</Link>
        <Link to="/admin-login" className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold">Admin Login</Link>
      </div>
    </div>
  );
}
