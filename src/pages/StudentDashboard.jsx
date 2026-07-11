export default function StudentDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p><b>Name:</b> Daniel Uwaizie</p>
        <p><b>Mat No:</b> NUTAS/2024/001</p>
        <p><b>Department:</b> Computer Science</p>
        <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded">Check Result</button>
      </div>
    </div>
  );
}
