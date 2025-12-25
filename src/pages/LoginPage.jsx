import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Shield, LogIn, Loader } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'https://bot-website-api.onrender.com';
const DISCORD_CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID || '1352437331344228394';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isAuthorized, handleDiscordCallback } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Check for Discord callback code OR token in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const token = urlParams.get('token');
    
    if (code) {
      handleDiscordCallback(code);
    } else if (token) {
      // Handle direct token redirect (from API)
      localStorage.setItem('admin_token', token);
      // Trigger auth context refresh
      window.location.href = '/admin';
    }
  }, [handleDiscordCallback]);

  // If already authenticated and authorized, redirect to admin
  useEffect(() => {
    if (isAuthenticated && isAuthorized) {
      const from = location.state?.from?.pathname || '/admin';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isAuthorized, navigate, location]);

  // Function to handle Discord login - DIRECT OAuth URL
  const handleDiscordLogin = async () => {
    setLoading(true);
    setErrorMessage(null);

    // Preferred flow: ask backend for an OAuth URL and include the current frontend
    // origin so the backend can return to the correct UI after auth.
    const next = encodeURIComponent(window.location.origin);
    const apiUrl = `${API_BASE}/auth/discord/login?next=${next}`;

    try {
      const res = await fetch(apiUrl);
      if (!res.ok) {
        let err = null;
        try { err = await res.json(); } catch (e) { err = { detail: res.statusText }; }
        console.error('API returned error for login:', err);

        if (err?.detail === 'invalid_next') {
          setErrorMessage('Your frontend origin is not allowed by the API. Update ALLOWED_FRONTEND_ORIGINS on the backend or set DEFAULT_FRONTEND.');
        } else {
          setErrorMessage(`Failed to start login: ${err?.detail || res.statusText}`);
        }
        return;
      }

      const data = await res.json();
      if (data.auth_url) {
        window.location.href = data.auth_url;
        return;
      }

      // Fallback: ask the API login endpoint to perform a redirect (server-side)
      console.warn('API did not return auth_url, redirecting to API login endpoint');
      window.location.href = `${apiUrl}`;
    } catch (err) {
      console.error('Failed to start Discord login:', err);
      setErrorMessage('Failed to start Discord login. See console for details.');
      setLoading(false);
    }
  };

  // Alternative: Keep API-based approach (if you prefer)
  const handleDiscordLoginViaAPI = async () => {
    try {
      setLoading(true);
      // Include current origin so backend can craft a redirect that returns here
      const next = encodeURIComponent(window.location.origin);
      // Fetch the Discord OAuth URL from your API
      const response = await fetch(`${API_BASE}/auth/discord/login?next=${next}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.auth_url) {
        throw new Error('No auth_url in API response');
      }
      
      console.log('API returned auth URL, redirecting...');
      window.location.href = data.auth_url;
    } catch (error) {
      console.error('Failed to start Discord login via API:', error);
      setLoading(false);
      // Fallback to direct method (which itself tries API first)
      handleDiscordLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-gray-100 p-4 md:p-8">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-900/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-900/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16 pt-8"
        >
          <h1 className="text-5xl font-bold text-center mb-4">
            <span className="bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
              Admin Portal
            </span>
          </h1>
          <p className="text-center text-gray-400">Restricted Access • HICOM & Admin Only</p>
        </motion.header>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-md mx-auto"
        >
          <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 shadow-2xl">
            {/* Security Badge */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-red-600 rounded-full blur-lg opacity-30"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-red-700 to-red-600 rounded-full flex items-center justify-center border-4 border-red-800/30">
                  <Shield className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>

            {/* Welcome Message */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-4">Secure Access Required</h2>
              <p className="text-gray-400">
                This admin panel is restricted to server administrators and HICOM members only.
                Unauthorized access is prohibited.
              </p>
            </div>

            {/* Requirements List */}
            <div className="mb-8 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <h3 className="font-semibold mb-3 text-gray-300">Access Requirements:</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  Must be a member of the Discord server
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  Must have HICOM role or be server admin
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  Your Discord account will be verified
                </li>
              </ul>
            </div>

            {/* Discord Login Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDiscordLogin} // Use direct method
              disabled={loading}
              className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-[#5865F2] to-[#4752C4] hover:from-[#4752C4] hover:to-[#3C45A5] text-white font-semibold flex items-center justify-center gap-3 shadow-lg shadow-[#5865F2]/30 transition-all duration-300 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader className="w-6 h-6 animate-spin" />
                  <span className="text-lg">Connecting to Discord...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
                  <span className="text-lg">Login with Discord</span>
                </>
              )}
            </motion.button>

            {/* Debug Info (remove in production) */}
            <div className="mt-4 p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
              <p className="text-xs text-gray-500 text-center">
                <strong>Debug Info:</strong> Using direct OAuth URL
                <br />
                Redirect URI (backend callback): {`${API_BASE}/auth/callback`}
                Frontend origin sent as `next`: {window.location.origin}
                <br />
                Client ID: {DISCORD_CLIENT_ID}
              </p>
            </div>

            {/* Display errors from the login flow */}
            {errorMessage && (
              <div className="mt-4 p-3 bg-red-900/60 text-red-200 rounded-lg text-sm text-center">
                {errorMessage}
              </div>
            )}

            {/* Footer Note */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                By logging in, you agree to our terms of service and privacy policy.
                All actions are logged for security purposes.
              </p>
            </div>
          </div>

          {/* Admin Note */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Need access? Contact server administration.
              <br />
              <span className="text-red-400 font-medium">Admin Discord ID: 353167234698444802</span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;