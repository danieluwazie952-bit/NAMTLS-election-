import { useState } from 'react';

export default function StudentDashboard() {
  const [showPopup, setShowPopup] = useState(true);
  const [checked, setChecked] = useState(false);
  const [points, setPoints] = useState(100);
  const [selected, setSelected] = useState({});

  const positions = [
    { name: "PRESIDENT", candidates: [{name: "Candidate A"}, {name: "Candidate B"}] },
    { name: "SECRETARY", candidates: [{name: "Candidate C"}] }
  ]

  const vote = (posName, candidateName) => {
    if(points >= 5 &&!selected[posName]){
      setSelected({...selected, [posName]: candidateName});
      setPoints(points - 5);
    }
  }

  if(showPopup){
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full p-8 border-4 border-[#D4AF37]">
          <h2 className="text-2xl font-bold text-[#001F4D] mb-4 text-center">HOW TO VOTE - PLEASE READ CAREFULLY</h2>
          <ol className="list-decimal list-inside space-y-2 text-[#001F4D]">
            <li>You have been given <b>100 Voting Points</b> for this tenure.</li>
            <li>Each vote you cast costs <b>5 Points</b>.</li>
            <li>Scroll down to see all positions.</li>
            <li>For each position, click ONE candidate. The card will turn <span className="text-green-600 font-bold">GREEN</span>.</li>
            <li>Note: Once you click a candidate, you <b>CANNOT</b> change it.</li>
            <li>Watch your 'Points Remaining' at the top.</li>
            <li>When you are done, click 'SUBMIT ALL VOTES'.</li>
            <li>You can only vote <b>ONCE</b> for this tenure.</li>
          </ol>
          <div className="mt-6 flex items-center gap-3">
            <input type="checkbox" checked={checked} onChange={() => setChecked(!checked)} className="w-5 h-5" />
            <label>I have read and I understand the voting rules</label>
          </div>
          <button disabled={!checked} onClick={() => setShowPopup(false)} className="mt-6 w-full bg-[#D4AF37] text-[#001F4D] font-bold py-3 rounded disabled:opacity-50">Proceed to Vote</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 bg-[#001F4D] text-white p-3 text-center font-bold">Points Remaining: {points}</div>
      {positions.map(pos => (
        <div key={pos.name} className="my-8 p-4">
          <h2 className="text-2xl font-bold text-[#001F4D] text-center mb-4">{pos.name} CANDIDATES</h2>
          <div className="flex gap-4 overflow-x-auto justify-center">
            {pos.candidates.map(c => (
              <div key={c.name} onClick={() => vote(pos.name, c.name)} className={`w-48 border-4 rounded-lg p-3 cursor-pointer ${selected[pos.name] === c.name? 'bg-green-200 border-green-600' : 'border-[#D4AF37]'}`}>
                <div className="w-[120px] h-[150px] bg-gray-200 mx-auto mb-2 border-2 border-white rounded">Passport</div>
                <p className="font-bold text-[#001F4D] text-center">{c.name}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
      <button className="w-full bg-[#D4AF37] text-[#001F4D] font-bold py-4 rounded-lg m-4">SUBMIT ALL VOTES</button>
    </div>
  )
}
