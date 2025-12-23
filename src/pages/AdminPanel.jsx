import { useState, Fragment, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Edit2, 
  Trash2, 
  ChevronDown,
  ChevronUp,
  Filter,
  UserPlus,
  Crown,
  Shield,
  Users,
  Star,
  Award
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

// Filter options
const filterOptions = [
  { id: 'all', label: 'All Users', color: 'bg-gray-600', icon: Users },
  { id: 'high-command', label: 'High Command', color: 'bg-purple-600', icon: Crown },
  { id: 'SOR', label: 'SOR Division', color: 'bg-blue-600', icon: Shield },
  { id: 'SOR-HR', label: 'SOR High Ranks', color: 'bg-blue-700', icon: Award },
  { id: 'SOR-LR', label: 'SOR Low Ranks', color: 'bg-blue-800', icon: Users },
  { id: 'PW', label: 'PW Division', color: 'bg-green-600', icon: Shield },
  { id: 'PW-HR', label: 'PW High Ranks', color: 'bg-green-700', icon: Award },
  { id: 'PW-LR', label: 'PW Low Ranks', color: 'bg-green-800', icon: Users }
];

// High command ranks
const highCommandRanks = [
  "Provost Marshal", 
  "SOR Commander", 
  "SOR Executive", 
  "PW Commander", 
  "PW Executive"
];

export default function AdminPanel({ data = [] }) {
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'rank', direction: 'asc' });
  const [expandedRows, setExpandedRows] = useState({});
  const [activeFilter, setActiveFilter] = useState('all');
  const [showAddUser, setShowAddUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Add user form state
  const [newUser, setNewUser] = useState({
    username: '',
    discordId: '',
    division: '',
    type: 'HR', // HR or LR
    rank: '',
    role: 'member' // admin, moderator, member
  });

  // Initialize filteredData when data changes
  useEffect(() => {
    if (data && Array.isArray(data)) {
      setFilteredData(data);
      setIsLoading(false);
    }
  }, [data]);

  // Filter and sort data
  useEffect(() => {
    if (!data || !Array.isArray(data)) {
      setFilteredData([]);
      return;
    }

    let result = data.filter((u) =>
      [u.username, u.discordId, u.division, u.rank]
        .some((field) => field?.toString().toLowerCase().includes(search.toLowerCase()))
    );

    // Apply advanced filter
    if (activeFilter !== 'all') {
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
      const aValue = a[sortConfig.key] || '';
      const bValue = b[sortConfig.key] || '';
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setFilteredData(result);
  }, [search, data, sortConfig, activeFilter]);

  // Handle form changes
  const handleFormChange = (field, value) => {
    setNewUser(prev => {
      const updated = { ...prev, [field]: value };
      
      // If division or type changes, reset rank and update rank options
      if (field === 'division' || field === 'type') {
        updated.rank = ''; // Reset rank when division/type changes
      }
      
      return updated;
    });
  };

  // Get available ranks based on selected division and type
  const getAvailableRanks = () => {
    if (!newUser.division || !newUser.type) return [];
    return rankOptions[newUser.division]?.[newUser.type] || [];
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

  // Submit new user
  const handleSubmitUser = () => {
    if (!newUser.username || !newUser.division || !newUser.type || !newUser.rank) {
      alert("Please fill in all required fields!");
      return;
    }
    
    alert(`User added!\nName: ${newUser.username}\nDivision: ${newUser.division}\nType: ${newUser.type}\nRank: ${newUser.rank}`);
    
    // Reset form and close modal
    setNewUser({
      username: '',
      discordId: '',
      division: '',
      type: 'HR',
      rank: '',
      role: 'member'
    });
    setShowAddUser(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full"
        />
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
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="text-5xl font-bold text-center mb-4">
            <span className="bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
              Admin Panel
            </span>
          </h1>
          <p className="text-center text-gray-400">Manage users with precision and style</p>
        </motion.header>

        {/* Search & Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
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
                  placeholder="Search by Discord ID, Roblox username, division, or rank..."
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
              className="px-6 py-4 rounded-xl bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 font-semibold flex items-center justify-center gap-3 shadow-lg shadow-red-900/30 transition-all duration-300 group"
            >
              <UserPlus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              Add New User
            </motion.button>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap gap-3">
            {filterOptions.map((filter) => {
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
        </motion.div>

        {/* Table Container */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden shadow-2xl"
        >
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-900 to-black border-b border-gray-800">
                  {['Rank', 'Username', 'Discord ID', 'Division', 'Type', 'Actions'].map((header) => (
                    <th
                      key={header}
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-300 cursor-pointer hover:text-white transition-colors"
                      onClick={() => requestSort(header.toLowerCase().replace(' ', ''))}
                    >
                      <div className="flex items-center gap-2">
                        {header}
                        {sortConfig.key === header.toLowerCase().replace(' ', '') && (
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
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {Array.isArray(filteredData) && filteredData.length > 0 ? (
                    filteredData.map((u, i) => (
                      <motion.tr
                        key={u.id || i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors group"
                      >
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
                            u.division === 'SOR' ? 'bg-blue-900/20 text-blue-300 border border-blue-800/30' :
                            u.division === 'PW' ? 'bg-green-900/20 text-green-300 border border-green-800/30' :
                            'bg-gray-800 text-gray-300'
                          }`}>
                            {u.division || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            u.type === 'HR' 
                              ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-800/30' 
                              : 'bg-gray-800 text-gray-300 border border-gray-700'
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
                              onClick={() => alert(`Edit ${u.username}`)}
                            >
                              <Edit2 size={18} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1, rotate: -5 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 rounded-lg bg-red-900/30 hover:bg-red-800/50 border border-red-800/30 text-red-300 transition-all duration-300"
                              onClick={() => alert(`Delete ${u.username}`)}
                            >
                              <Trash2 size={18} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 transition-all duration-300"
                              onClick={() => toggleRow(u.id || i)}
                            >
                              {expandedRows[u.id || i] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6">
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="py-16 text-center"
                        >
                          <div className="w-24 h-24 mx-auto mb-6 bg-gray-800 rounded-full flex items-center justify-center">
                            <Search className="w-12 h-12 text-gray-600" />
                          </div>
                          <h3 className="text-2xl font-bold text-gray-400 mb-2">
                            {!data || data.length === 0 ? 'No users found' : 'No results found'}
                          </h3>
                          <p className="text-gray-500">
                            {!data || data.length === 0 
                              ? 'Add users to get started' 
                              : 'Try adjusting your search or filter criteria'}
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
                <span className="text-white font-semibold">{data?.length || 0}</span> users
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                  <span className="text-xs text-gray-400">Live</span>
                </div>
                <div className="text-sm text-gray-400">
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Add User Modal */}
        <AnimatePresence>
          {showAddUser && (
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
                  Add New User
                </h3>
                
                <div className="space-y-4">
                  {/* Username */}
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

                  {/* Discord ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Discord ID
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Discord ID (optional)"
                      className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-red-500 focus:outline-none text-white transition-colors"
                      value={newUser.discordId}
                      onChange={(e) => handleFormChange('discordId', e.target.value)}
                    />
                  </div>

                  {/* Division */}
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

                  {/* Rank Type (HR/LR) */}
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

                  {/* Rank Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Rank *
                    </label>
                    {newUser.division ? (
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
                        {newUser.division && newUser.type && (
                          <p className="mt-2 text-xs text-gray-500">
                            {getAvailableRanks().length} rank{getAvailableRanks().length !== 1 ? 's' : ''} available
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-500 text-center">
                        Select division and type first
                      </div>
                    )}
                  </div>

                  {/* Role Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Role
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {['member', 'moderator', 'admin'].map((role) => (
                        <motion.button
                          key={role}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          className={`px-3 py-2 rounded-lg border transition-all duration-300 capitalize ${
                            newUser.role === role 
                              ? role === 'admin' 
                                ? 'bg-red-900/30 border-red-700 text-red-300'
                                : role === 'moderator'
                                ? 'bg-orange-900/30 border-orange-700 text-orange-300'
                                : 'bg-gray-800 border-gray-700 text-gray-300'
                              : 'bg-gray-900 border-gray-800 text-gray-400'
                          }`}
                          onClick={() => handleFormChange('role', role)}
                        >
                          {role}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowAddUser(false);
                      setNewUser({
                        username: '',
                        discordId: '',
                        division: '',
                        type: 'HR',
                        rank: '',
                        role: 'member'
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
      </div>
    </div>
  );
}