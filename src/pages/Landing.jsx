import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex flex-col items-center justify-center text-white">
      <h1 className="text-5xl font-bold mb-4">NUTAS Result Checker</h1>
      <p className="mb-8">Check your results and manage student data</p>
      <div className="space-x-4">
        <Link to="/student-dashboard" className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold">Student Portal</Link>
        <Link to="/admin-login" className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold">Admin Login</Link>
      </div>
    </div>
  );
}
