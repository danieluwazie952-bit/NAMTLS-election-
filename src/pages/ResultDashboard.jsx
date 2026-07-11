import jsPDF from "jspdf";
import "jspdf-autotable";

export default function ResultDashboard() {
  const results = [{ sn: 1, name: "John Doe", position: "President", votes: 40, points: 120 }]

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.addImage("[image_id: 0]", 'PNG', 80, 10, 50, 50);
    doc.setFontSize(16);
    doc.text("OFFICIAL RESULT SHEET - NAMTLS ELECTORAL COMMISSION", 105, 70, {align: "center"});
    doc.text("Tenure: 2026/2027 Tenure", 105, 80, {align: "center"});
    doc.autoTable({ startY: 90, head: [['S/N', 'Candidate Name', 'Position', 'Total Votes', 'Total Points', 'Percentage']], body: results.map(r => [r.sn, r.name, r.position, r.votes, r.points, '50%']) });
    doc.text("Chairman: Name _______ Signature _______ Date _______", 14, doc.lastAutoTable.finalY + 20);
    doc.text("Certified True Copy", 105, doc.lastAutoTable.finalY + 55, {align: "center"});
    doc.save("NAMTLS-Official-Results.pdf");
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <h1 className="text-2xl font-bold text-[#001F4D]">DASHBOARD 3: RESULTS</h1>
      <table className="w-full border-collapse border-2 border-[#001F4D] mt-4">
        <thead className="bg-[#001F4D] text-white"><tr><th>S/N</th><th>Candidate Name</th><th>Position</th><th>Total Votes</th><th>Total Points</th><th>Percentage</th></tr></thead>
        <tbody>{results.map(r => <tr key={r.sn} className="text-center"><td className="border border-[#001F4D]">{r.sn}</td><td className="border border-[#001F4D]">{r.name}</td><td className="border border-[#001F4D]">{r.position}</td><td className="border border-[#001F4D]">{r.votes}</td><td className="border border-[#001F4D]">{r.points}</td><td className="border border-[#001F4D]">50%</td></tr>)}</tbody>
      </table>
      <button onClick={downloadPDF} className="mt-6 bg-[#D4AF37] text-[#001F4D] font-bold px-6 py-3 rounded">Download Official PDF</button>
    </div>
  )
}
