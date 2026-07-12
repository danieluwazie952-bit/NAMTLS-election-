import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
      </Routes>
    </Router>
  );
}
export default App;
