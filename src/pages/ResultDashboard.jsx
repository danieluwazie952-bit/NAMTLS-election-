import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ResultDashboard() {
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("NUTAS Result Slip", 14, 15);
    autoTable(doc, { head: [['Course', 'Score', 'Grade']], body: [['Math', '85', 'A'], ['English', '78', 'B']] });
    doc.save('Result.pdf');
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Your Result</h1>
      <table className="w-full bg-white shadow rounded">
        <thead><tr><th className="p-2 border">Course</th><th className="p-2 border">Score</th><th className="p-2 border">Grade</th></tr></thead>
        <tbody>
          <tr><td className="p-2 border">Math</td><td className="p-2 border">85</td><td className="p-2 border">A</td></tr>
          <tr><td className="p-2 border">English</td><td className="p-2 border">78</td><td className="p-2 border">B</td></tr>
        </tbody>
      </table>
      <button onClick={downloadPDF} className="mt-6 bg-red-600 text-white px-4 py-2 rounded">Download PDF</button>
    </div>
  );
}
