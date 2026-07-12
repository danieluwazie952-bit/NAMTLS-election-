import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 to-blue-700 text-white px-4">
      <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">
        NAMTLS E-Voting System
      </h1>
      <p className="text-xl md:text-2xl mb-8 text-center">
        Official Student Union Election Portal
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/student/dashboard"
          className="bg-white text-blue-900 px-8 py-3 rounded-lg font-semibold hover:bg-blue-100 transition text-center"
        >
          Student Portal
        </Link>
        <Link
          to="/admin"
          className="bg-yellow-500 text-blue-900 px-8 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition text-center"
        >
          Admin Login
        </Link>
      </div>
    </div>
  );
}
