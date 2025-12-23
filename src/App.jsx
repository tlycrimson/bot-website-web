import { useState } from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react"; // hamburger & close icons
import Home from "./pages/Home";
import Leaderboard from "./pages/Leaderboard";
import HRs from "./pages/HRs";
import LRs from "./pages/LRs";
import Hierarchy from "./pages/Hierarchy";

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/hierarchy", label: "Hierarchy" },
    { to: "/leaderboard", label: "Leaderboard" },
    { to: "/hrs", label: "HRs" },
    { to: "/lrs", label: "LRs" },
  ];

  return (
    <>
      {/* Navigation Bar */}
      <nav className="bg-black fixed w-full z-50 shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <span className="font-extrabold text-lg tracking-wide text-red-600">
            MP Assistant
          </span>

          {/* Desktop Links */}
          <div className="hidden md:flex gap-4">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  isActive
                    ? "bg-red-600 text-white px-3 py-1 rounded-md font-semibold transition"
                    : "text-white hover:text-red-400 px-3 py-1 rounded-md transition"
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-white focus:outline-none"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-black px-4 pb-4">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  isActive
                    ? "block bg-red-600 text-white px-3 py-2 rounded-md font-semibold mb-2 transition"
                    : "block text-white hover:text-red-400 px-3 py-2 rounded-md mb-2 transition"
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      {/* Page Routes */}
      <div className="pt-20 bg-black min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/hrs" element={<HRs />} />
          <Route path="/lrs" element={<LRs />} />
          <Route path="/hierarchy" element={<Hierarchy />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
