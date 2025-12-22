import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Leaderboard from "./pages/Leaderboard";
import HR from "./pages/HR";
import LR from "./pages/LR";


function App() {
  return (
    <>
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <span className="font-extrabold text-lg tracking-wide text-red-600">
            MP Assistant
          </span>


          <div className="space-x-4">
            <Link className="text-gray-600 hover:text-black" to="/">
              Home
            </Link>
            <Link className="text-gray-600 hover:text-black" to="/leaderboard">
              Leaderboard
            </Link>
            <Link to="/hrs" className="text-gray-400 hover:text-red-500">
              HR
            </Link>
            <Link to="/lrs" className="text-gray-400 hover:text-red-500">
              LR
            </Link>
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/hrs" element={<HR />} />
        <Route path="/lrs" element={<LR />} />
      </Routes>
    </>
  );
}

export default App;
