import { useState } from 'react';

export default function Dashboard2() {
  const [showPopup, setShowPopup] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [points, setPoints] = useState(100);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {showPopup && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg max-w-2xl">
            <h2 className="text-navy text-2xl font-bold">HOW TO VOTE - PLEASE READ CAREFULLY</h2>
            <ol className="list-decimal ml-6 mt-4 space-y-2 text-sm">
              <li>You have been given 100 Voting Points for this tenure.</li>
              <li>Each vote you cast costs 5 Points.</li>
              <li>Scroll down to see all positions.</li>
              <li>For each position, click ONE candidate. The card will turn GREEN to show it is selected.</li>
              <li>Note: Once you click a candidate, you CANNOT change it.</li>
              <li>Watch your 'Points Remaining' at the top.</li>
              <li>When you are done, scroll to the bottom and click 'SUBMIT ALL VOTES'.</li>
              <li>You can only vote ONCE for this tenure.</li>
            </ol>
            <label className="flex items-center mt-4"><input type="checkbox" onChange={e=>setAgreed(e.target.checked)} className="mr-2"/> I have read and I understand the voting rules</label>
            <button disabled={!agreed} onClick={()=>setShowPopup(false)} className="mt-4 w-full bg-navy text-white py-3 rounded font-bold disabled:opacity-50">Proceed to Vote</button>
          </div>
        </div>
      )}
      <div className="sticky top-0 bg-gold text-navy p-3 font-bold">Points Remaining: {points}</div>
      <h1 className="text-2xl font-bold text-navy mt-4">Student Voting Dashboard</h1>
      <p>Candidate cards will load here. Each vote = 5 points. Passport size 120x150px.</p>
    </div>
  )
}
