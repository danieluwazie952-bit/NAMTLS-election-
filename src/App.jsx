import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center font-poppins">
      <h1 className="text-4xl font-bold text-green-400">NAMTLS Election Platform</h1>
      <p className="mt-4 text-lg">Official Platform for FUPRE Maritime Students</p>
      <button 
        onClick={() => setCount((count) => count + 1)}
        className="mt-6 px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg font-bold"
      >
        Clicked {count} times
      </button>
    </div>
  )
}

export default App
