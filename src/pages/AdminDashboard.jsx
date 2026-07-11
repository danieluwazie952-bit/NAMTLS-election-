export default function AdminDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-blue-100 p-6 rounded-lg shadow">Total Students: 250</div>
        <div className="bg-green-100 p-6 rounded-lg shadow">Results Uploaded: 120</div>
        <div className="bg-yellow-100 p-6 rounded-lg shadow">Pending: 130</div>
      </div>
      <button className="mt-6 bg-blue-600 text-white px-4 py-2 rounded">Upload Results</button>
    </div>
  );
}
