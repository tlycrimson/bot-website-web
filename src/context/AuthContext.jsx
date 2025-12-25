import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE || "https://bot-website-api.onrender.com";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const navigate = useNavigate();

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = useCallback(async (token) => {
    try {
      const response = await fetch(`${API_BASE}/auth/check-permissions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsAuthenticated(true);
        setIsAuthorized(data.authorized);
      } else {
        // Token invalid or expired
        logout();
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  const loginWithDiscord = async () => {
    // Let the API generate an OAuth URL. Pass current frontend origin as `next`
    const next = encodeURIComponent(window.location.origin);

    try {
      const res = await fetch(`${API_BASE}/auth/discord/login?next=${next}`);
      if (!res.ok) {
        // Try to parse JSON error detail
        let err = null;
        try { err = await res.json(); } catch (e) { err = { detail: res.statusText }; }
        console.error('Failed to start Discord login:', err);
        throw new Error(err?.detail || 'Failed to start Discord login');
      }

      const data = await res.json();
      if (data?.auth_url) {
        window.location.href = data.auth_url;
      } else {
        // Fallback: redirect to the API login endpoint (server should redirect to Discord)
        window.location.href = `${API_BASE}/auth/discord/login?next=${next}`;
      }
    } catch (error) {
      console.error('loginWithDiscord error:', error);
      // Let callers handle errors (UI can catch this when calling loginWithDiscord)
      throw error;
    }
  };

  const handleDiscordCallback = async (code) => {
    try {
      const response = await fetch(`${API_BASE}/auth/callback?code=${code}&format=json`);
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('admin_token', data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        
        // Check permissions
        await checkPermissions(data.token);
        
        navigate('/admin');
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      console.error('Discord callback failed:', error);
      logout();
    }
  };

  const checkPermissions = async (token) => {
    try {
      const response = await fetch(`${API_BASE}/auth/check-permissions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsAuthorized(data.authorized);
        return data.authorized;
      } else {
        setIsAuthorized(false);
        return false;
      }
    } catch (error) {
      console.error('Permission check failed:', error);
      setIsAuthorized(false);
      return false;
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token');
    setUser(null);
    setIsAuthenticated(false);
    setIsAuthorized(false);
    navigate('/');
  }, [navigate]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('admin_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    isAuthorized,
    loginWithDiscord,
    handleDiscordCallback,
    logout,
    getAuthHeaders,
    checkPermissions
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};