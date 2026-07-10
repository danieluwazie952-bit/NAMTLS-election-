import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function Dashboard3() {
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("OFFICIAL RESULT SHEET - NAMTLS ELECTORAL COMMISSION", 14, 20);
    doc.text("Tenure: 2025/2026", 14, 30);
    doc.autoTable({ startY: 40, head: [['S/N','Candidate Name','Position','Total Votes','Total Points','Percentage']] });
    doc.text("Chairman: Name _______ Signature _______ Date _______", 14, 250);
    doc.text("Certified True Copy", 14, 270);
    doc.save("Official_Result_Sheet.pdf");
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-navy">Dashboard 3: Results / INEC Chairman</h1>
      <button onClick={downloadPDF} className="bg-gold text-navy px-6 py-3 rounded font-bold mt-4">Download as PDF</button>
      <p className="mt-4">Live results table, Bar chart, Publish toggle, and Close Voting will be here.</p>
    </div>
  )
}
