import { useState, useEffect, useRef } from "react";
import { Routes, Route, NavLink, Navigate, useLocation } from "react-router-dom"; 
import { Menu, X, Shield, Layers } from "lucide-react";
import RMPBotIcon from "./assets/RMP_Bot_icon.png";
import Home from "./pages/Home";
import Leaderboard from "./pages/Leaderboard";
import XPLeaderboard from "./pages/XPLeaderboard";
import HRs from "./pages/HRs";
import LRs from "./pages/LRs";
import Hierarchy from "./pages/Hierarchy";
import AdminPanel from "./pages/AdminPanel";
import AdminHierarchy from "./pages/AdminHierarchy"; // NEW
import LoginPage from "./pages/LoginPage";
import { useAuth } from "./context/AuthContext";  
import { ProtectedRoute } from "./components/ProtectedRoute";
import AuthRedirect from './pages/AuthRedirect';

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAuthenticated, isAuthorized, logout } = useAuth();

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/hierarchy", label: "Hierarchy" },
    { to: "/leaderboard", label: "Leaderboard" },
    { to: "/hrs", label: "HRs" },
    { to: "/lrs", label: "LRs" },
  ];

  // Reactive admin route detection
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Mobile menu ref & accessibility helpers
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    if (menuOpen) {
      // focus the first interactive element inside the mobile menu
      const el = mobileMenuRef.current?.querySelector('a,button');
      if (el) el.focus();
    }
  }, [menuOpen]);

  // Close mobile menu with Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      {/* Navigation Bar */}
      <nav className="bg-black/60 backdrop-blur-sm fixed w-full z-50 shadow-md" role="navigation" aria-label="Main navigation">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-20 focus:left-4 bg-white/5 px-3 py-2 rounded-md">Skip to content</a>
        <div className="max-w-6xl mx-auto px-4 py-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <NavLink to="/" className="flex items-center gap-3" aria-label="MP Assistant Home">
              <img src={RMPBotIcon} alt="RMP Bot" className="w-8 h-8 rounded-md object-cover" loading="lazy" decoding="async" />
              <span className="font-extrabold text-base tracking-wide text-red-600">MP Assistant</span>
            </NavLink>

            {/* Admin badge if logged in and on admin routes */}
            {isAuthenticated && isAuthorized && user && isAdminRoute && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-red-900/30 border border-red-800/30 rounded-lg">
                <Shield className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-300">Admin Mode</span>
              </div>
            )}
          </div>

          {/* Desktop Links - Show different navigation based on route */}
          <div className="hidden md:flex items-center gap-4">
            {isAdminRoute ? (
              // Admin navigation (when on admin pages)
              <div className="flex items-center gap-4">
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    isActive
                      ? "bg-red-600 text-white px-3 py-1 rounded-md font-semibold transition flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                      : "text-white hover:text-red-400 px-3 py-1 rounded-md transition flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  }
                >
                  <Shield size={16} />
                  User Management
                </NavLink>
                <NavLink
                  to="/admin/hierarchy"
                  className={({ isActive }) =>
                    isActive
                      ? "bg-red-600 text-white px-3 py-1 rounded-md font-semibold transition flex items-center gap-2"
                      : "text-white hover:text-red-400 px-3 py-1 rounded-md transition flex items-center gap-2"
                  }
                >
                  <Layers size={16} />
                  Hierarchy Editor
                </NavLink>
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="px-3 py-1 bg-red-700 hover:bg-red-600 text-white rounded-md text-sm font-semibold transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              // Regular site navigation
              <>
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      isActive
                        ? "bg-red-600 text-white px-3 py-1 rounded-md font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                        : "text-white hover:text-red-400 px-3 py-1 rounded-md transition focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
                
                {/* Admin Access */}
                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-700">
                  {isAuthenticated && isAuthorized ? (
                    // Authenticated admin: Show Admin link + user info
                    <>
                      <NavLink
                        to="/admin"
                        className={({ isActive }) =>
                          isActive
                            ? "bg-red-600 text-white px-3 py-1 rounded-md font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                            : "text-white hover:text-red-400 px-3 py-1 rounded-md transition focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                        }
                      >
                        Admin
                      </NavLink>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-300">
                          {user?.username}
                        </span>
                      </div>
                    </>
                  ) : isAuthenticated ? (
                    // Authenticated but not authorized
                    <div className="text-gray-400 text-sm">
                      <span className="text-yellow-500">⚠️</span> No Admin Access
                    </div>
                  ) : (
                    // Not authenticated: Show Admin link that goes to login
                    <NavLink
                      to="/admin"
                      className={({ isActive }) =>
                        isActive
                          ? "bg-red-600 text-white px-3 py-1 rounded-md font-semibold transition"
                          : "text-white hover:text-red-400 px-3 py-1 rounded-md transition"
                      }
                    >
                      Admin
                    </NavLink>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-md"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label="Toggle navigation menu"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div id="mobile-menu" ref={mobileMenuRef} className="md:hidden bg-black px-4 pb-4" aria-hidden={!menuOpen}>
            {isAdminRoute ? (
              // Admin mobile navigation
              <div className="space-y-2">
                <NavLink
                  to="/admin"
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    isActive
                    ? "block bg-red-600 text-white px-3 py-2 rounded-md font-semibold transition flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    : "block text-white hover:text-red-400 px-3 py-2 rounded-md transition flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  }
                >
                  <Shield size={16} />
                  User Management
                </NavLink>
                <NavLink
                  to="/admin/hierarchy"
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    isActive
                      ? "block bg-red-600 text-white px-3 py-2 rounded-md font-semibold transition flex items-center gap-2"
                      : "block text-white hover:text-red-400 px-3 py-2 rounded-md transition flex items-center gap-2"
                  }
                >
                  <Layers size={16} />
                  Hierarchy Editor
                </NavLink>
                <NavLink
                  to="/"
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  className="block text-white hover:text-red-400 px-3 py-2 rounded-md transition"
                >
                  Logout & Return to Site
                </NavLink>
              </div>
            ) : (
              // Regular mobile navigation
              <>
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      isActive
                        ? "block bg-red-600 text-white px-3 py-2 rounded-md font-semibold mb-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                        : "block text-white hover:text-red-400 px-3 py-2 rounded-md mb-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
                
                {/* Mobile Admin Link */}
                <div className="border-t border-gray-700 pt-3 mt-2">
                  {isAuthenticated && isAuthorized ? (
                    // Authenticated admin mobile
                    <>
                      <NavLink
                        to="/admin"
                        onClick={() => setMenuOpen(false)}
                        className={({ isActive }) =>
                          isActive
                            ? "block bg-red-600 text-white px-3 py-2 rounded-md font-semibold mb-2 transition"
                            : "block text-white hover:text-red-400 px-3 py-2 rounded-md mb-2 transition"
                        }
                      >
                        Admin Panel
                      </NavLink>
                      <div className="px-3 py-2 mb-2 text-gray-300 text-sm">
                        Logged in as: {user?.username}
                      </div>
                    </>
                  ) : isAuthenticated ? (
                    // Authenticated but not authorized mobile
                    <div className="px-3 py-2 mb-2 text-yellow-500 text-sm border border-yellow-800/30 rounded-md">
                      ⚠️ You don't have admin access
                    </div>
                  ) : (
                    // Not authenticated mobile
                    <NavLink
                      to="/admin"
                      onClick={() => setMenuOpen(false)}
                      className={({ isActive }) =>
                        isActive
                          ? "block bg-red-600 text-white px-3 py-2 rounded-md font-semibold mb-2 transition"
                          : "block text-white hover:text-red-400 px-3 py-2 rounded-md mb-2 transition"
                      }
                    >
                      Admin
                    </NavLink>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </nav>

      {/* Page Routes */}
      <main id="main" className="pt-20 bg-black min-h-screen">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/users" element={<XPLeaderboard />} />
          <Route path="/hrs" element={<HRs />} />
          <Route path="/lrs" element={<LRs />} />
          <Route path="/hierarchy" element={<Hierarchy />} />
          <Route path="/auth/redirect" element={<AuthRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/hierarchy" 
            element={
              <ProtectedRoute>
                <AdminHierarchy /> {/* Changed from HierarchyManager */}
              </ProtectedRoute>
            } 
          />
          
          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default App;