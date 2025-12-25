import { useState, Fragment, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Edit2, 
  Trash2, 
  ChevronDown,
  ChevronUp,
  UserPlus,
  Crown,
  Shield,
  Users,
  Award,
  Sparkles,
  User,
  Database,
  Key,
  Layers,
  AlertCircle,
  Loader2
} from "lucide-react";

// Rank options based on division and type (HR/LR)
const rankOptions = {
  HQ: {
    HR: ["Provost Marshal"],
    LR: ["Regimental Sergeant Major"]
  },
  SOR: {
    HR: [
      "SOR Commander", 
      "SOR Executive", 
      "Squadron Commander", 
      "Squadron Executive Officer", 
      "Tactical Officer",
      "Operations Officer", 
      "Junior Operations Officer"
    ],
    LR: [
      "Operations Sergeant Major", 
      "Tactical Leader", 
      "Field Specialist", 
      "Senior Operator", 
      "Operator", 
      "Trainee Constable"
    ]
  },
  PW: {
    HR: [
      "PW Commander", 
      "PW Executive", 
      "Lieutenant Colonel", 
      "Major", 
      "Superintendent",
      "Chief Inspector",
      "Inspector"
    ],
    LR: [
      "Company Sergeant Major", 
      "Staff Sergeant", 
      "Sergeant", 
      "Senior Constable", 
      "Constable", 
      "Trainee Constable"
    ]
  }
};

// High command ranks
const highCommandRanks = [
  "Provost Marshal", 
  "SOR Commander", 
  "SOR Executive", 
  "PW Commander", 
  "PW Executive"
];

const API_BASE = import.meta.env.VITE_API_BASE || "https://bot-website-api.onrender.com";

export default function AdminPanel() {
  const { getAuthHeaders, logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'rank', direction: 'asc' });
  const [expandedRows, setExpandedRows] = useState({});
  const [activeFilter, setActiveFilter] = useState('all');
  const [showAddUser, setShowAddUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [notice, setNotice] = useState(null);
  
  // Mode toggle: 'hrlr' for HR/LR users, 'xp' for XP users
  const [mode, setMode] = useState('hrlr');
  
  // Add user form state
  const [newUser, setNewUser] = useState({
    userId: '',
    username: '',
    division: '',
    type: 'HR',
    rank: '',
  });

  // For XP user add form
  const [newXPUser, setNewXPUser] = useState({
    userId: '',
    username: '',
    xp: 0,
  });

  const [editUser, setEditUser] = useState(null);

  // Custom fetch wrapper with auth headers
  const apiFetch = useCallback(async (url, options = {}) => {
    try {
      const headers = getAuthHeaders();
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
          ...options.headers,
        },
        mode: 'cors',
        credentials: 'omit',
      });
      
      if (!response.ok) {
        let errorMessage = `HTTP error ${response.status}`;
        try {
          const errorText = await response.text();
          if (errorText) errorMessage = errorText;
        } catch {
          // Ignore if we can't parse error text
        }
        throw new Error(errorMessage);
      }
      
      // Try to parse JSON, but handle empty responses
      const text = await response.text();
      if (text) {
        return JSON.parse(text);
      } else {
        return { success: true };
      }
    } catch (error) {
      console.error('API fetch error:', error);
      throw error;
    }
  }, [getAuthHeaders]);

  // Fetch data based on mode
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setNotice(null);

      if (mode === 'hrlr') {
        // Fetch HR and LR data
        const [hrs, lrs] = await Promise.allSettled([
          apiFetch(`${API_BASE}/hr`),
          apiFetch(`${API_BASE}/lr`),
        ]);

        const handleFetchResult = (result, source) => {
          if (result.status === 'fulfilled') {
            return result.value || [];
          } else {
            console.warn(`Failed to fetch ${source}:`, result.reason);
            return [];
          }
        };

        const hrData = handleFetchResult(hrs, 'HR');
        const lrData = handleFetchResult(lrs, 'LR');

        // Normalize HR/LR data
        const normalized = [
          ...hrData.map((u) => ({
            id: `hr-${u.user_id}`,
            source: 'HR',
            user_id: u.user_id,
            username: u.username,
            division: u.division || '',
            type: 'HR',
            rank: u.rank || '',
            discordId: u.user_id,
            tryouts: u.tryouts || 0,
            events: u.events || 0,
            phases: u.phases || 0,
            courses: u.courses || 0,
            inspections: u.inspections || 0,
            joint_events: u.joint_events || 0,
          })),
          ...lrData.map((u) => ({
            id: `lr-${u.user_id}`,
            source: 'LR',
            user_id: u.user_id,
            username: u.username,
            division: u.division || '',
            type: 'LR',
            rank: u.rank || '',
            discordId: u.user_id,
            activity: u.activity || 0,
            time_guarded: u.time_guarded || 0,
            events_attended: u.events_attended || 0,
          })),
        ];

        setData(normalized);
        setFilteredData(normalized);
      } else {
        // Fetch XP users data
        const usersResult = await Promise.allSettled([
          apiFetch(`${API_BASE}/leaderboard`),
        ]);

        const userData = usersResult[0].status === 'fulfilled' ? (usersResult[0].value || []) : [];

        // Normalize XP user data
        const normalized = userData.map((u) => ({
          id: `user-${u.user_id}`,
          source: 'USER',
          user_id: u.user_id,
          username: u.username,
          xp: u.xp || 0,
          discordId: u.user_id,
        }));

        setData(normalized);
        setFilteredData(normalized);
      }

      setLastUpdated(new Date().toLocaleTimeString());
      
    } catch (err) {
      console.error('Load data error:', err);
      setError(err.message || 'Failed to load data');
      setNotice({ 
        type: 'error', 
        text: 'Failed to load data. Please check your authentication and try again.' 
      });
      
      // Set empty arrays to prevent UI errors
      setData([]);
      setFilteredData([]);
    } finally {
      setIsLoading(false);
    }
  }, [mode, apiFetch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter and sort data
  useEffect(() => {
    if (!Array.isArray(data)) {
      setFilteredData([]);
      return;
    }

    let result = data.filter((u) => {
      if (mode === 'hrlr') {
        return [u.username, u.discordId, u.division, u.rank]
          .some((field) => field?.toString().toLowerCase().includes(search.toLowerCase()));
      } else {
        return [u.username, u.discordId, u.xp]
          .some((field) => field?.toString().toLowerCase().includes(search.toLowerCase()));
      }
    });

    // Apply advanced filter (only for HR/LR mode)
    if (mode === 'hrlr' && activeFilter !== 'all') {
      switch (activeFilter) {
        case 'high-command':
          result = result.filter(u => highCommandRanks.includes(u.rank));
          break;
        case 'SOR':
          result = result.filter(u => u.division === 'SOR');
          break;
        case 'SOR-HR':
          result = result.filter(u => u.division === 'SOR' && u.type === 'HR');
          break;
        case 'SOR-LR':
          result = result.filter(u => u.division === 'SOR' && u.type === 'LR');
          break;
        case 'PW':
          result = result.filter(u => u.division === 'PW');
          break;
        case 'PW-HR':
          result = result.filter(u => u.division === 'PW' && u.type === 'HR');
          break;
        case 'PW-LR':
          result = result.filter(u => u.division === 'PW' && u.type === 'LR');
          break;
        default:
          break;
      }
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue, bValue;
      
      if (mode === 'hrlr') {
        aValue = a[sortConfig.key] || '';
        bValue = b[sortConfig.key] || '';
      } else {
        // For XP users, sort by XP by default
        if (sortConfig.key === 'xp' || sortConfig.key === 'username') {
          aValue = a[sortConfig.key] || '';
          bValue = b[sortConfig.key] || '';
        } else {
          aValue = a.username || '';
          bValue = b.username || '';
        }
      }
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setFilteredData(result);
  }, [search, data, sortConfig, activeFilter, mode]);

  // Handle add-user form changes (HR/LR)
  const handleFormChange = (field, value) => {
    setNewUser(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'division' || field === 'type') {
        updated.rank = '';
      }
      return updated;
    });
  };

  // Handle XP user form changes
  const handleXPFormChange = (field, value) => {
    setNewXPUser(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle edit-user form changes
  const handleEditChange = (field, value) => {
    setEditUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, [field]: value };
      
      // If division or type changes, reset rank
      if (field === 'division' || field === 'type') {
        updated.rank = '';
      }
      return updated;
    });
  };

  // Get available ranks based on selected division and type
  const getAvailableRanks = () => {
    if (!newUser.division || !newUser.type) return [];
    return rankOptions[newUser.division]?.[newUser.type] || [];
  };

  // Get available ranks for edit form
  const getEditRanks = () => {
    if (!editUser?.division || !editUser?.type) return [];
    return rankOptions[editUser.division]?.[editUser.type] || [];
  };

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Toggle row expansion
  const toggleRow = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Submit new HR/LR user
  const handleSubmitUser = async () => {
    if (!newUser.userId || !newUser.username || !newUser.type || !newUser.division || !newUser.rank) {
      setNotice({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    try {
      const endpoint = newUser.type === 'HR' ? `${API_BASE}/hr` : `${API_BASE}/lr`;

      const payload = {
        user_id: newUser.userId,
        username: newUser.username,
        division: newUser.division,
        rank: newUser.rank,
      };

      await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      await loadData();

      setNewUser({
        userId: '',
        username: '',
        division: '',
        type: 'HR',
        rank: '',
      });
      setShowAddUser(false);
      setNotice({ type: 'success', text: 'User added successfully.' });
    } catch (err) {
      console.error('Add user error:', err);
      setNotice({ type: 'error', text: err.message || 'Failed to add user' });
    }
  };

  // Submit new XP user
  const handleSubmitXPUser = async () => {
    if (!newXPUser.userId || !newXPUser.username) {
      setNotice({ type: 'error', text: 'Please fill in Discord ID and username' });
      return;
    }

    try {
      const payload = {
        user_id: newXPUser.userId,
        username: newXPUser.username,
        xp: Number(newXPUser.xp) || 0,
      };

      await apiFetch(`${API_BASE}/users`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      await loadData();

      setNewXPUser({
        userId: '',
        username: '',
        xp: 0,
      });
      setShowAddUser(false);
      setNotice({ type: 'success', text: 'XP User added successfully.' });
    } catch (err) {
      console.error('Add XP user error:', err);
      setNotice({ type: 'error', text: err.message || 'Failed to add XP user' });
    }
  };

  // Handle user update
  const handleUpdateUser = async () => {
    if (!editUser) return;

    try {
      const tablePath = editUser.source === 'HR' ? 'hr' : editUser.source === 'LR' ? 'lr' : 'users';
      
      // Build payload based on table structure
      let payload = {};

      // Common field for all tables
      payload.username = editUser.username || '';

      // HR table specific fields
      if (editUser.source === 'HR') {
        if (editUser.division) payload.division = editUser.division;
        if (editUser.rank) payload.rank = editUser.rank;
        payload.tryouts = editUser.tryouts === '' || editUser.tryouts == null ? 0 : Number(editUser.tryouts);
        payload.events = editUser.events === '' || editUser.events == null ? 0 : Number(editUser.events);
        payload.phases = editUser.phases === '' || editUser.phases == null ? 0 : Number(editUser.phases);
        payload.courses = editUser.courses === '' || editUser.courses == null ? 0 : Number(editUser.courses);
        payload.inspections = editUser.inspections === '' || editUser.inspections == null ? 0 : Number(editUser.inspections);
        payload.joint_events = editUser.joint_events === '' || editUser.joint_events == null ? 0 : Number(editUser.joint_events);
      }

      // LR table specific fields
      if (editUser.source === 'LR') {
        if (editUser.division) payload.division = editUser.division;
        if (editUser.rank) payload.rank = editUser.rank;
        payload.activity = editUser.activity === '' || editUser.activity == null ? 0 : Number(editUser.activity);
        payload.time_guarded = editUser.time_guarded === '' || editUser.time_guarded == null ? 0 : Number(editUser.time_guarded);
        payload.events_attended = editUser.events_attended === '' || editUser.events_attended == null ? 0 : Number(editUser.events_attended);
      }

      // Users table specific fields (XP users)
      if (editUser.source === 'USER') {
        payload.xp = editUser.xp === '' || editUser.xp == null ? 0 : Number(editUser.xp);
      }

      await apiFetch(`${API_BASE}/${tablePath}/${editUser.user_id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });

      await loadData();

      setEditUser(null);
      setNotice({ type: 'success', text: 'User updated successfully.' });
    } catch (err) {
      console.error('Update user error:', err);
      
      let errorMessage = err.message || 'Failed to update user';
      if (errorMessage.includes('42703')) {
        errorMessage = 'Database column error. Please check the user data structure.';
      }
      
      setNotice({ type: 'error', text: errorMessage });
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete ${user.username}?`)) return;
    
    try {
      const tablePath = user.source === 'HR' ? 'hr' : user.source === 'LR' ? 'lr' : 'users';
      
      await apiFetch(`${API_BASE}/${tablePath}/${user.user_id}`, {
        method: 'DELETE',
      });

      await loadData();
      setNotice({ type: 'success', text: 'User deleted successfully.' });
    } catch (err) {
      console.error('Delete user error:', err);
      setNotice({ type: 'error', text: err.message || 'Failed to delete user' });
    }
  };

  // Retry loading data
  const handleRetry = () => {
    loadData();
  };

  // Filter options for HR/LR mode
  const hrlrFilterOptions = [
    { id: 'all', label: 'All HR/LR Users', color: 'bg-gray-600', icon: Users },
    { id: 'high-command', label: 'High Command', color: 'bg-purple-600', icon: Crown },
    { id: 'SOR', label: 'SOR Division', color: 'bg-blue-600', icon: Shield },
    { id: 'SOR-HR', label: 'SOR High Ranks', color: 'bg-blue-700', icon: Award },
    { id: 'SOR-LR', label: 'SOR Low Ranks', color: 'bg-blue-800', icon: Users },
    { id: 'PW', label: 'PW Division', color: 'bg-green-600', icon: Shield },
    { id: 'PW-HR', label: 'PW High Ranks', color: 'bg-green-700', icon: Award },
    { id: 'PW-LR', label: 'PW Low Ranks', color: 'bg-green-800', icon: Users }
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-400">Loading {mode === 'hrlr' ? 'HR/LR' : 'XP'} data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-gray-100 p-4 md:p-8">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-900/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-900/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header with Navigation */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-5xl font-bold mb-2">
                <span className="bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
                  Admin Panel
                </span>
              </h1>
              <p className="text-gray-400">Manage users with precision and style</p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <button
                onClick={logout}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center gap-2"
              >
                <Key size={18} /> Logout
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-800 mb-8">
            <button
              onClick={() => navigate('/admin')}
              className={`px-6 py-3 font-semibold transition-all ${
                true ? 'border-b-2 border-red-500 text-red-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Users className="inline-block w-5 h-5 mr-2" />
              User Management
            </button>
            <button
              onClick={() => navigate('/admin/hierarchy')}
              className={`px-6 py-3 font-semibold transition-all ${
                false ? 'border-b-2 border-red-500 text-red-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Layers className="inline-block w-5 h-5 mr-2" />
              Hierarchy Editor
            </button>
          </div>
        </motion.header>

        {/* Error state with retry button */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-lg border border-red-800 bg-red-900/20 px-4 py-3 text-sm text-red-200"
          >
            <div className="flex justify-between items-center">
              <span>Error: {error}</span>
              <button
                onClick={handleRetry}
                className="ml-4 px-3 py-1 bg-red-700 hover:bg-red-600 rounded text-sm transition-colors"
              >
                Retry
              </button>
            </div>
          </motion.div>
        )}

        {/* Action notices */}
        {notice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-4 rounded-lg px-4 py-3 text-sm border ${
              notice.type === 'success'
                ? 'bg-emerald-900/20 border-emerald-700 text-emerald-200'
                : notice.type === 'warning'
                ? 'bg-yellow-900/20 border-yellow-700 text-yellow-200'
                : 'bg-red-900/20 border-red-800 text-red-200'
            }`}
          >
            <div className="flex justify-between items-center">
              <span>{notice.text}</span>
              <button
                className="ml-4 text-gray-400 hover:text-white"
                onClick={() => setNotice(null)}
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}

        {/* Mode Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-2xl p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold mb-2">Database Mode</h2>
                <p className="text-gray-400 text-sm">
                  {mode === 'hrlr' 
                    ? 'Managing HR/LR Users (Division/Rank system)' 
                    : 'Managing XP Users (Experience point system)'}
                </p>
              </div>
              
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMode('hrlr')}
                  className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-3 transition-all duration-300 ${
                    mode === 'hrlr'
                      ? 'bg-gradient-to-r from-red-700 to-red-600 shadow-lg shadow-red-900/30'
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  <Database className="w-5 h-5" />
                  HR/LR Users
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMode('xp')}
                  className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-3 transition-all duration-300 ${
                    mode === 'xp'
                      ? 'bg-gradient-to-r from-yellow-700 to-yellow-600 shadow-lg shadow-yellow-900/30'
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  <Key className="w-5 h-5" />
                  XP Users
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search & Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-6 mb-6">
            {/* Search Bar */}
            <div className="flex-1 relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-red-900/20 to-transparent rounded-xl blur group-hover:blur-sm transition-all duration-300"></div>
              <div className="relative flex items-center bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden">
                <Search className="w-5 h-5 ml-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={mode === 'hrlr' 
                    ? "Search by Discord ID, username, division, or rank..." 
                    : "Search by Discord ID, username, or XP..."}
                  className="flex-1 px-4 py-4 bg-transparent focus:outline-none text-gray-200 placeholder-gray-500"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mr-4 text-gray-400 hover:text-white transition"
                    onClick={() => setSearch("")}
                  >
                    ✕
                  </motion.button>
                )}
              </div>
            </div>

            {/* Add User Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddUser(true)}
              className={`px-6 py-4 rounded-xl font-semibold flex items-center justify-center gap-3 shadow-lg transition-all duration-300 group ${
                mode === 'hrlr'
                  ? 'bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 shadow-red-900/30'
                  : 'bg-gradient-to-r from-yellow-700 to-yellow-600 hover:from-yellow-600 hover:to-yellow-500 shadow-yellow-900/30'
              }`}
            >
              <UserPlus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              Add New {mode === 'hrlr' ? 'HR/LR User' : 'XP User'}
            </motion.button>
          </div>

          {/* Filter Chips - Only for HR/LR mode */}
          {mode === 'hrlr' && data.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {hrlrFilterOptions.map((filter) => {
                const Icon = filter.icon;
                return (
                  <motion.button
                    key={filter.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all duration-300 ${
                      activeFilter === filter.id
                        ? `${filter.color} text-white shadow-lg`
                        : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {filter.label}
                  </motion.button>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Table Container */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden shadow-2xl"
        >
          {/* Table or Empty State */}
          {data.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-800 rounded-full flex items-center justify-center">
                <Search className="w-12 h-12 text-gray-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-400 mb-2">
                No {mode === 'hrlr' ? 'HR/LR users' : 'XP users'} found
              </h3>
              <p className="text-gray-500 mb-6">
                {error 
                  ? 'There was an error loading data. Check your authentication.' 
                  : mode === 'hrlr' 
                    ? 'Add HR/LR users to get started' 
                    : 'Add XP users to get started'}
              </p>
              <button
                onClick={() => setShowAddUser(true)}
                className={`px-4 py-2 rounded-lg text-white transition-colors ${
                  mode === 'hrlr'
                    ? 'bg-red-700 hover:bg-red-600'
                    : 'bg-yellow-700 hover:bg-yellow-600'
                }`}
              >
                Add {mode === 'hrlr' ? 'HR/LR User' : 'XP User'}
              </button>
              {error && (
                <button
                  onClick={handleRetry}
                  className="ml-4 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                >
                  Retry Loading
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto max-h-[600px]">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-900 to-black border-b border-gray-800">
                      {mode === 'hrlr' ? (
                        ['Rank', 'Username', 'Discord ID', 'Division', 'Type', 'Actions'].map((header) => {
                          const key = header.toLowerCase().replace(' ', '');
                          return (
                            <th
                              key={header}
                              className="px-6 py-4 text-left text-sm font-semibold text-gray-300 cursor-pointer hover:text-white transition-colors"
                              onClick={() => requestSort(key)}
                            >
                              <div className="flex items-center gap-2">
                                {header}
                                {sortConfig.key === key && (
                                  <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="text-red-400"
                                  >
                                    {sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                  </motion.span>
                                )}
                              </div>
                            </th>
                          );
                        })
                      ) : (
                        ['Username', 'Discord ID', 'XP', 'Actions'].map((header) => {
                          const key = header.toLowerCase().replace(' ', '');
                          return (
                            <th
                              key={header}
                              className="px-6 py-4 text-left text-sm font-semibold text-gray-300 cursor-pointer hover:text-white transition-colors"
                              onClick={() => requestSort(key)}
                            >
                              <div className="flex items-center gap-2">
                                {header}
                                {sortConfig.key === key && (
                                  <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="text-yellow-400"
                                  >
                                    {sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                  </motion.span>
                                )}
                              </div>
                            </th>
                          );
                        })
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {filteredData.length > 0 ? (
                        filteredData.map((u) => (
                          <Fragment key={u.id}>
                            <motion.tr
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{ duration: 0.3 }}
                              className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors group"
                            >
                              {mode === 'hrlr' ? (
                                <>
                                  <td className="px-6 py-4">
                                    <span className={`inline-block px-3 py-1 rounded-full font-medium ${
                                      highCommandRanks.includes(u.rank)
                                        ? 'bg-gradient-to-r from-purple-900/30 to-purple-900/10 border border-purple-800/30 text-purple-300'
                                        : 'bg-gradient-to-r from-red-900/30 to-red-900/10 border border-red-800/30 text-red-300'
                                    }`}>
                                      {highCommandRanks.includes(u.rank) && (
                                        <Crown className="inline-block w-3 h-3 mr-1" />
                                      )}
                                      {u.rank || 'N/A'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 font-medium">{u.username || 'N/A'}</td>
                                  <td className="px-6 py-4 text-gray-400 font-mono">{u.discordId || "-"}</td>
                                  <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-lg ${
                                      u.division === 'SOR'
                                        ? 'bg-blue-900/20 text-blue-300 border border-blue-800/30'
                                        : u.division === 'PW'
                                        ? 'bg-green-900/20 text-green-300 border border-green-800/30'
                                        : 'bg-gray-800 text-gray-300'
                                    }`}>
                                      {u.division || 'N/A'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                      u.type === 'HR'
                                        ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-800/30'
                                        : 'bg-blue-900/30 text-blue-300 border border-blue-800/30'
                                    }`}>
                                      {u.type === 'HR' ? 'High Rank' : 'Low Rank'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                      <motion.button
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="p-2 rounded-lg bg-blue-900/30 hover:bg-blue-800/50 border border-blue-800/30 text-blue-300 transition-all duration-300"
                                        onClick={() => setEditUser({...u})}
                                      >
                                        <Edit2 size={18} />
                                      </motion.button>
                                      <motion.button
                                        whileHover={{ scale: 1.1, rotate: -5 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="p-2 rounded-lg bg-red-900/30 hover:bg-red-800/50 border border-red-800/30 text-red-300 transition-all duration-300"
                                        onClick={() => handleDeleteUser(u)}
                                      >
                                        <Trash2 size={18} />
                                      </motion.button>
                                      <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 transition-all duration-300"
                                        onClick={() => toggleRow(u.id)}
                                      >
                                        {expandedRows[u.id] ? (
                                          <ChevronUp size={18} />
                                        ) : (
                                          <ChevronDown size={18} />
                                        )}
                                      </motion.button>
                                    </div>
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="px-6 py-4 font-medium">{u.username || 'N/A'}</td>
                                  <td className="px-6 py-4 text-gray-400 font-mono">{u.discordId || "-"}</td>
                                  <td className="px-6 py-4">
                                    <span className="inline-block px-3 py-1 rounded-full font-medium bg-gradient-to-r from-yellow-900/30 to-yellow-900/10 border border-yellow-800/30 text-yellow-300">
                                      <Sparkles className="inline-block w-3 h-3 mr-1" />
                                      {u.xp || 0} XP
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                      <motion.button
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="p-2 rounded-lg bg-blue-900/30 hover:bg-blue-800/50 border border-blue-800/30 text-blue-300 transition-all duration-300"
                                        onClick={() => setEditUser({...u})}
                                      >
                                        <Edit2 size={18} />
                                      </motion.button>
                                      <motion.button
                                        whileHover={{ scale: 1.1, rotate: -5 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="p-2 rounded-lg bg-red-900/30 hover:bg-red-800/50 border border-red-800/30 text-red-300 transition-all duration-300"
                                        onClick={() => handleDeleteUser(u)}
                                      >
                                        <Trash2 size={18} />
                                      </motion.button>
                                    </div>
                                  </td>
                                </>
                              )}
                            </motion.tr>
                            {expandedRows[u.id] && mode === 'hrlr' && (
                              <tr>
                                <td colSpan="6" className="px-6 pb-4">
                                  <div className="rounded-xl border border-gray-800 bg-gray-900/70 p-4 text-sm text-gray-200">
                                    {u.source === 'HR' && (
                                      <div className="space-y-1">
                                        <div className="font-semibold text-red-300 mb-2">High Rank Stats</div>
                                        <div>Tryouts: {u.tryouts ?? 0}</div>
                                        <div>Events: {u.events ?? 0}</div>
                                        <div>Phases: {u.phases ?? 0}</div>
                                        <div>Courses: {u.courses ?? 0}</div>
                                        <div>Inspections: {u.inspections ?? 0}</div>
                                        <div>Joint Events: {u.joint_events ?? 0}</div>
                                        <div className="mt-2 text-gray-400">
                                          Division: {u.division || 'N/A'} | Rank: {u.rank || 'N/A'}
                                        </div>
                                      </div>
                                    )}
                                    {u.source === 'LR' && (
                                      <div className="space-y-1">
                                        <div className="font-semibold text-blue-300 mb-2">Low Rank Stats</div>
                                        <div>Activity: {u.activity ?? 0}</div>
                                        <div>Time Guarded: {u.time_guarded ?? 0}</div>
                                        <div>Events Attended: {u.events_attended ?? 0}</div>
                                        <div className="mt-2 text-gray-400">
                                          Division: {u.division || 'N/A'} | Rank: {u.rank || 'N/A'}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={mode === 'hrlr' ? 6 : 4}>
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="py-16 text-center"
                            >
                              <div className="w-24 h-24 mx-auto mb-6 bg-gray-800 rounded-full flex items-center justify-center">
                                <Search className="w-12 h-12 text-gray-600" />
                              </div>
                              <h3 className="text-2xl font-bold text-gray-400 mb-2">
                                No results found
                              </h3>
                              <p className="text-gray-500">
                                Try adjusting your search or filter criteria
                              </p>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {/* Stats Footer */}
              {filteredData.length > 0 && (
                <div className="px-6 py-4 bg-gray-900/50 border-t border-gray-800 flex justify-between items-center">
                  <div className="text-sm text-gray-400">
                    Showing <span className="text-white font-semibold">{filteredData.length}</span> of{" "}
                    <span className="text-white font-semibold">{data?.length || 0}</span> {mode === 'hrlr' ? 'HR/LR users' : 'XP users'}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-400">
                      Last updated: {lastUpdated || '--:--:--'}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* Add User Modal - HR/LR Mode */}
        <AnimatePresence>
          {showAddUser && mode === 'hrlr' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setShowAddUser(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                  <UserPlus className="text-red-400" />
                  Add New HR/LR User
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Discord ID *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Discord ID"
                      className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-red-500 focus:outline-none text-white transition-colors"
                      value={newUser.userId}
                      onChange={(e) => handleFormChange('userId', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Username *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Roblox username"
                      className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-red-500 focus:outline-none text-white transition-colors"
                      value={newUser.username}
                      onChange={(e) => handleFormChange('username', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Division *
                    </label>
                    <div className="relative">
                      <select
                        className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-red-500 focus:outline-none text-white appearance-none cursor-pointer"
                        value={newUser.division}
                        onChange={(e) => handleFormChange('division', e.target.value)}
                      >
                        <option value="">Select Division</option>
                        <option value="HQ">HQ</option>
                        <option value="SOR">SOR</option>
                        <option value="PW">PW</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Rank Type *
                    </label>
                    <div className="flex gap-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        className={`flex-1 px-4 py-3 rounded-lg border transition-all duration-300 ${
                          newUser.type === 'HR' 
                            ? 'bg-yellow-900/30 border-yellow-700 text-yellow-300' 
                            : 'bg-gray-800 border-gray-700 text-gray-300'
                        }`}
                        onClick={() => handleFormChange('type', 'HR')}
                      >
                        <div className="flex flex-col items-center">
                          <Crown className="w-5 h-5 mb-1" />
                          <span className="text-sm">High Rank</span>
                        </div>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        className={`flex-1 px-4 py-3 rounded-lg border transition-all duration-300 ${
                          newUser.type === 'LR' 
                            ? 'bg-blue-900/30 border-blue-700 text-blue-300' 
                            : 'bg-gray-800 border-gray-700 text-gray-300'
                        }`}
                        onClick={() => handleFormChange('type', 'LR')}
                      >
                        <div className="flex flex-col items-center">
                          <Users className="w-5 h-5 mb-1" />
                          <span className="text-sm">Low Rank</span>
                        </div>
                      </motion.button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Rank *
                    </label>
                    {newUser.division && newUser.type ? (
                      <div className="relative">
                        <select
                          className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-red-500 focus:outline-none text-white appearance-none cursor-pointer"
                          value={newUser.rank}
                          onChange={(e) => handleFormChange('rank', e.target.value)}
                          disabled={!getAvailableRanks().length}
                        >
                          <option value="">Select Rank</option>
                          {getAvailableRanks().map((rank) => (
                            <option key={rank} value={rank} className="bg-gray-800">
                              {rank}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <p className="mt-2 text-xs text-gray-500">
                          {getAvailableRanks().length} rank{getAvailableRanks().length !== 1 ? 's' : ''} available
                        </p>
                      </div>
                    ) : (
                      <div className="px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-500 text-center">
                        Select division and type first
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowAddUser(false);
                      setNewUser({
                        userId: '',
                        username: '',
                        division: '',
                        type: 'HR',
                        rank: '',
                      });
                    }}
                    className="flex-1 px-6 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSubmitUser}
                    className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-semibold transition-all"
                  >
                    Add User
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add User Modal - XP Mode */}
        <AnimatePresence>
          {showAddUser && mode === 'xp' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setShowAddUser(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                  <UserPlus className="text-yellow-400" />
                  Add New XP User
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Discord ID *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Discord ID"
                      className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-yellow-500 focus:outline-none text-white transition-colors"
                      value={newXPUser.userId}
                      onChange={(e) => handleXPFormChange('userId', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Username *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Roblox username"
                      className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-yellow-500 focus:outline-none text-white transition-colors"
                      value={newXPUser.username}
                      onChange={(e) => handleXPFormChange('username', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      XP (Optional)
                    </label>
                    <input
                      type="number"
                      placeholder="Enter XP amount"
                      className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-yellow-500 focus:outline-none text-white transition-colors"
                      value={newXPUser.xp}
                      onChange={(e) => handleXPFormChange('xp', e.target.value)}
                      min="0"
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowAddUser(false);
                      setNewXPUser({
                        userId: '',
                        username: '',
                        xp: 0,
                      });
                    }}
                    className="flex-1 px-6 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSubmitXPUser}
                    className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-yellow-700 to-yellow-600 hover:from-yellow-600 hover:to-yellow-500 text-white font-semibold transition-all"
                  >
                    Add XP User
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit User Modal */}
        <AnimatePresence>
          {editUser && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setEditUser(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                  <Edit2 className={editUser.source === 'USER' ? 'text-yellow-400' : 'text-red-400'} />
                  Edit {editUser.source === 'USER' ? 'XP User' : 'HR/LR User'}
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Discord ID
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 cursor-not-allowed"
                      value={editUser.user_id}
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      className={`w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none text-white transition-colors ${
                        editUser.source === 'USER' ? 'focus:border-yellow-500' : 'focus:border-red-500'
                      }`}
                      value={editUser.username || ''}
                      onChange={(e) => handleEditChange('username', e.target.value)}
                    />
                  </div>

                  {(editUser.source === 'HR' || editUser.source === 'LR') && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Division
                        </label>
                        <div className="relative">
                          <select
                            className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-red-500 focus:outline-none text-white appearance-none cursor-pointer"
                            value={editUser.division || ''}
                            onChange={(e) => handleEditChange('division', e.target.value)}
                          >
                            <option value="">Select Division</option>
                            <option value="HQ">HQ</option>
                            <option value="SOR">SOR</option>
                            <option value="PW">PW</option>
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Rank Type
                        </label>
                        <div className="relative">
                          <select
                            className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-red-500 focus:outline-none text-white appearance-none cursor-pointer"
                            value={editUser.type || ''}
                            onChange={(e) => handleEditChange('type', e.target.value)}
                          >
                            <option value="HR">High Rank</option>
                            <option value="LR">Low Rank</option>
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Rank
                        </label>
                        {editUser.division && editUser.type ? (
                          <div className="relative">
                            <select
                              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-red-500 focus:outline-none text-white appearance-none cursor-pointer"
                              value={editUser.rank || ''}
                              onChange={(e) => handleEditChange('rank', e.target.value)}
                            >
                              <option value="">Select Rank</option>
                              {getEditRanks().map((rank) => (
                                <option key={rank} value={rank} className="bg-gray-800">
                                  {rank}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                          </div>
                        ) : (
                          <div className="px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-500 text-center">
                            Select division and type first
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {editUser.source === 'HR' && (
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {['tryouts','events','phases','courses','inspections','joint_events'].map((field) => (
                        <div key={field}>
                          <label className="block text-xs font-medium text-gray-400 mb-1">
                            {field.replace('_', ' ').charAt(0).toUpperCase() + field.replace('_', ' ').slice(1)}
                          </label>
                          <input
                            type="number"
                            className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-red-500 focus:outline-none text-white text-sm"
                            value={editUser[field] ?? ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              handleEditChange(field, val === '' ? '' : Number(val));
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {editUser.source === 'LR' && (
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {['activity','time_guarded','events_attended'].map((field) => (
                        <div key={field}>
                          <label className="block text-xs font-medium text-gray-400 mb-1">
                            {field.replace('_', ' ').charAt(0).toUpperCase() + field.replace('_', ' ').slice(1)}
                          </label>
                          <input
                            type="number"
                            className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-red-500 focus:outline-none text-white text-sm"
                            value={editUser[field] ?? ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              handleEditChange(field, val === '' ? '' : Number(val));
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {editUser.source === 'USER' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        XP
                      </label>
                      <input
                        type="number"
                        className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-yellow-500 focus:outline-none text-white transition-colors"
                        value={editUser.xp ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleEditChange('xp', val === '' ? '' : Number(val));
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-4 mt-8">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setEditUser(null)}
                    className="flex-1 px-6 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleUpdateUser}
                    className={`flex-1 px-6 py-3 rounded-lg bg-gradient-to-r text-white font-semibold transition-all ${
                      editUser.source === 'USER'
                        ? 'from-yellow-700 to-yellow-600 hover:from-yellow-600 hover:to-yellow-500'
                        : 'from-red-700 to-red-600 hover:from-red-600 hover:to-red-500'
                    }`}
                  >
                    Save Changes
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}