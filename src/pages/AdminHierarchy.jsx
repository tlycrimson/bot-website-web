import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  ChevronUp, 
  ChevronDown,
  Layers,
  Users,
  Award,
  Shield,
  Eye,
  EyeOff,
  UserPlus,
  ArrowLeft,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const API_BASE = "https://bot-website-api.onrender.com";

export default function AdminHierarchy() {
  const { getAuthHeaders, logout } = useAuth();
  const navigate = useNavigate();
  const [hierarchyData, setHierarchyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  
  // Editing states
  const [editingSection, setEditingSection] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);
  const [editingHeader, setEditingHeader] = useState(null);
  
  // New item states
  const [newSection, setNewSection] = useState({
    section_title: "",
    section_type: "commanding",
    accent_color: "yellow",
    display_order: 0,
    is_active: true
  });
  
  const [newEntry, setNewEntry] = useState({
    section_id: "",
    rank: "",
    username: "",
    army_rank: "",
    roblox_id: "",
    requirements: "",
    display_order: 0
  });
  
  const [newHeader, setNewHeader] = useState({
    section_id: "",
    header_text: "",
    display_order: 0
  });

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
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API fetch error:', error);
      throw error;
    }
  }, [getAuthHeaders]);

  // Load hierarchy data
  const loadHierarchyData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiFetch(`${API_BASE}/admin/hierarchy`);
      setHierarchyData(data);
      
    } catch (err) {
      console.error('Failed to load hierarchy:', err);
      setError(err.message || 'Failed to load hierarchy data');
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    loadHierarchyData();
  }, [loadHierarchyData]);

  // Handle section operations
  const handleCreateSection = async () => {
    if (!newSection.section_title || !newSection.section_type) {
      setNotice({ type: 'error', text: 'Please fill in section title and type' });
      return;
    }

    try {
      await apiFetch(`${API_BASE}/admin/hierarchy/sections`, {
        method: 'POST',
        body: JSON.stringify(newSection),
      });

      await loadHierarchyData();
      setNewSection({
        section_title: "",
        section_type: "commanding",
        accent_color: "yellow",
        display_order: 0,
        is_active: true
      });
      setNotice({ type: 'success', text: 'Section created successfully' });
    } catch (err) {
      setNotice({ type: 'error', text: err.message || 'Failed to create section' });
    }
  };

  const handleUpdateSection = async () => {
    if (!editingSection) return;

    try {
      await apiFetch(`${API_BASE}/admin/hierarchy/sections/${editingSection.id}`, {
        method: 'PATCH',
        body: JSON.stringify(editingSection),
      });

      await loadHierarchyData();
      setEditingSection(null);
      setNotice({ type: 'success', text: 'Section updated successfully' });
    } catch (err) {
      setNotice({ type: 'error', text: err.message || 'Failed to update section' });
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm('Are you sure? This will delete all entries and headers in this section.')) return;

    try {
      await apiFetch(`${API_BASE}/admin/hierarchy/sections/${sectionId}`, {
        method: 'DELETE',
      });

      await loadHierarchyData();
      setNotice({ type: 'success', text: 'Section deleted successfully' });
    } catch (err) {
      setNotice({ type: 'error', text: err.message || 'Failed to delete section' });
    }
  };

  // Handle entry operations
  const handleCreateEntry = async () => {
    if (!newEntry.section_id || !newEntry.rank) {
      setNotice({ type: 'error', text: 'Please select a section and enter a rank' });
      return;
    }

    try {
      await apiFetch(`${API_BASE}/admin/hierarchy/entries`, {
        method: 'POST',
        body: JSON.stringify(newEntry),
      });

      await loadHierarchyData();
      setNewEntry({
        section_id: "",
        rank: "",
        username: "",
        army_rank: "",
        roblox_id: "",
        requirements: "",
        display_order: 0
      });
      setNotice({ type: 'success', text: 'Entry created successfully' });
    } catch (err) {
      setNotice({ type: 'error', text: err.message || 'Failed to create entry' });
    }
  };

  const handleUpdateEntry = async () => {
    if (!editingEntry) return;

    try {
      await apiFetch(`${API_BASE}/admin/hierarchy/entries/${editingEntry.id}`, {
        method: 'PATCH',
        body: JSON.stringify(editingEntry),
      });

      await loadHierarchyData();
      setEditingEntry(null);
      setNotice({ type: 'success', text: 'Entry updated successfully' });
    } catch (err) {
      setNotice({ type: 'error', text: err.message || 'Failed to update entry' });
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (!window.confirm('Are you sure?')) return;

    try {
      await apiFetch(`${API_BASE}/admin/hierarchy/entries/${entryId}`, {
        method: 'DELETE',
      });

      await loadHierarchyData();
      setNotice({ type: 'success', text: 'Entry deleted successfully' });
    } catch (err) {
      setNotice({ type: 'error', text: err.message || 'Failed to delete entry' });
    }
  };

  // Handle header operations
  const handleCreateHeader = async () => {
    if (!newHeader.section_id || !newHeader.header_text) {
      setNotice({ type: 'error', text: 'Please select a section and enter header text' });
      return;
    }

    try {
      await apiFetch(`${API_BASE}/admin/hierarchy/headers`, {
        method: 'POST',
        body: JSON.stringify(newHeader),
      });

      await loadHierarchyData();
      setNewHeader({
        section_id: "",
        header_text: "",
        display_order: 0
      });
      setNotice({ type: 'success', text: 'Header created successfully' });
    } catch (err) {
      setNotice({ type: 'error', text: err.message || 'Failed to create header' });
    }
  };

  const handleUpdateHeader = async () => {
    if (!editingHeader) return;

    try {
      await apiFetch(`${API_BASE}/admin/hierarchy/headers/${editingHeader.id}`, {
        method: 'PATCH',
        body: JSON.stringify(editingHeader),
      });

      await loadHierarchyData();
      setEditingHeader(null);
      setNotice({ type: 'success', text: 'Header updated successfully' });
    } catch (err) {
      setNotice({ type: 'error', text: err.message || 'Failed to update header' });
    }
  };

  const handleDeleteHeader = async (headerId) => {
    if (!window.confirm('Are you sure?')) return;

    try {
      await apiFetch(`${API_BASE}/admin/hierarchy/headers/${headerId}`, {
        method: 'DELETE',
      });

      await loadHierarchyData();
      setNotice({ type: 'success', text: 'Header deleted successfully' });
    } catch (err) {
      setNotice({ type: 'error', text: err.message || 'Failed to delete header' });
    }
  };

  // Move item up/down
  const moveItem = async (type, id, direction) => {
    try {
      const endpoint = `${API_BASE}/admin/hierarchy/${type}/${id}`;
      const currentItem = hierarchyData
        .flatMap(section => 
          type === 'sections' ? [section.section] :
          type === 'entries' ? section.entries :
          section.headers
        )
        .find(item => item.id === id);

      if (!currentItem) return;

      const newOrder = currentItem.display_order + (direction === 'up' ? -1 : 1);
      
      await apiFetch(endpoint, {
        method: 'PATCH',
        body: JSON.stringify({ display_order: newOrder }),
      });

      await loadHierarchyData();
      setNotice({ type: 'success', text: `Moved ${type.slice(0, -1)} ${direction}` });
    } catch (err) {
      setNotice({ type: 'error', text: err.message || 'Failed to move item' });
    }
  };

  // Toggle section visibility
  const toggleSectionVisibility = async (sectionId) => {
    try {
      const section = hierarchyData.find(s => s.section.id === sectionId)?.section;
      if (!section) return;

      await apiFetch(`${API_BASE}/admin/hierarchy/sections/${sectionId}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: !section.is_active }),
      });

      await loadHierarchyData();
      setNotice({ 
        type: 'success', 
        text: `Section ${!section.is_active ? 'activated' : 'deactivated'}` 
      });
    } catch (err) {
      setNotice({ type: 'error', text: err.message || 'Failed to toggle section visibility' });
    }
  };

  // Color classes for badges
  const getColorClass = (color) => {
    const colorMap = {
      yellow: 'bg-yellow-500',
      orange: 'bg-orange-500', 
      red: 'bg-red-500',
      amber: 'bg-amber-500',
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
    };
    return colorMap[color] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading hierarchy data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-gray-100 p-4 md:p-8">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-900/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-900/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header with Navigation */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <button
                onClick={() => navigate('/admin')}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-5xl font-bold">
                  <span className="bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
                    Hierarchy Manager
                  </span>
                </h1>
                <p className="text-gray-400">Edit and manage the command hierarchy</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center gap-2"
            >
              Logout
            </button>
          </div>
        </motion.header>

        {/* Notice */}
        {notice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 rounded-lg px-4 py-3 text-sm border ${
              notice.type === 'success'
                ? 'bg-emerald-900/20 border-emerald-700 text-emerald-200'
                : 'bg-red-900/20 border-red-800 text-red-200'
            }`}
          >
            <div className="flex justify-between items-center">
              <span>{notice.text}</span>
              <button onClick={() => setNotice(null)} className="ml-4 text-gray-400 hover:text-white">✕</button>
            </div>
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-800 bg-red-900/20 px-4 py-3 text-sm text-red-200">
            <AlertCircle className="inline-block w-4 h-4 mr-2" />
            Error: {error}
          </div>
        )}

        {/* Create New Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 mb-8"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Plus className="text-red-400" />
            Create New Section
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Section Title</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-red-500 focus:outline-none text-white"
                value={newSection.section_title}
                onChange={(e) => setNewSection({...newSection, section_title: e.target.value})}
                placeholder="e.g., Special Operations Regiment"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Section Type</label>
              <select
                className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-red-500 focus:outline-none text-white"
                value={newSection.section_type}
                onChange={(e) => setNewSection({...newSection, section_type: e.target.value})}
              >
                <option value="commanding">Commanding Generals</option>
                <option value="divisional">Divisional Command</option>
                <option value="sergeants">Sergeant Majors</option>
                <option value="quota">Quota Requirements</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Accent Color</label>
              <select
                className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-red-500 focus:outline-none text-white"
                value={newSection.accent_color}
                onChange={(e) => setNewSection({...newSection, accent_color: e.target.value})}
              >
                <option value="yellow">Yellow</option>
                <option value="orange">Orange</option>
                <option value="red">Red</option>
                <option value="amber">Amber</option>
                <option value="blue">Blue</option>
                <option value="green">Green</option>
                <option value="purple">Purple</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Display Order</label>
              <input
                type="number"
                className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-red-500 focus:outline-none text-white"
                value={newSection.display_order}
                onChange={(e) => setNewSection({...newSection, display_order: parseInt(e.target.value) || 0})}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                className="mr-2 w-4 h-4 rounded bg-gray-800 border-gray-700 text-red-500"
                checked={newSection.is_active}
                onChange={(e) => setNewSection({...newSection, is_active: e.target.checked})}
              />
              <label htmlFor="isActive" className="text-sm text-gray-400">Active (visible on hierarchy page)</label>
            </div>
            
            <button
              onClick={handleCreateSection}
              className="ml-auto px-6 py-3 rounded-lg bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-semibold transition-all"
            >
              Create Section
            </button>
          </div>
        </motion.div>

        {/* Existing Sections */}
        <AnimatePresence>
          {hierarchyData.map((sectionData, sectionIndex) => {
            const { section, headers, entries } = sectionData;
            const isEditing = editingSection?.id === section.id;

            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 mb-8"
              >
                {/* Section Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-8 rounded-full ${getColorClass(section.accent_color)}`}></div>
                    {isEditing ? (
                      <input
                        type="text"
                        className="text-2xl font-bold bg-gray-800 border border-gray-700 px-4 py-2 rounded-lg text-white"
                        value={editingSection.section_title}
                        onChange={(e) => setEditingSection({...editingSection, section_title: e.target.value})}
                      />
                    ) : (
                      <h2 className="text-2xl font-bold">{section.section_title}</h2>
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      section.is_active 
                        ? 'bg-emerald-900/30 text-emerald-300 border border-emerald-800/30' 
                        : 'bg-gray-800 text-gray-300 border border-gray-700'
                    }`}>
                      {section.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleSectionVisibility(section.id)}
                      className={`p-2 rounded-lg ${
                        section.is_active 
                          ? 'bg-emerald-900/30 hover:bg-emerald-800/50 text-emerald-300' 
                          : 'bg-gray-800 hover:bg-gray-700 text-gray-400'
                      }`}
                      title={section.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {section.is_active ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                    
                    <button
                      onClick={() => moveItem('sections', section.id, 'up')}
                      className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400"
                      disabled={sectionIndex === 0}
                      title="Move up"
                    >
                      <ChevronUp size={18} />
                    </button>
                    <button
                      onClick={() => moveItem('sections', section.id, 'down')}
                      className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400"
                      disabled={sectionIndex === hierarchyData.length - 1}
                      title="Move down"
                    >
                      <ChevronDown size={18} />
                    </button>
                    
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleUpdateSection}
                          className="p-2 rounded-lg bg-emerald-900/30 hover:bg-emerald-800/50 text-emerald-300"
                          title="Save changes"
                        >
                          <Save size={18} />
                        </button>
                        <button
                          onClick={() => setEditingSection(null)}
                          className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400"
                          title="Cancel"
                        >
                          <X size={18} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditingSection(section)}
                          className="p-2 rounded-lg bg-blue-900/30 hover:bg-blue-800/50 text-blue-300"
                          title="Edit section"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteSection(section.id)}
                          className="p-2 rounded-lg bg-red-900/30 hover:bg-red-800/50 text-red-300"
                          title="Delete section"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Section Type & Color */}
                {isEditing && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Type</label>
                      <select
                        className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white"
                        value={editingSection.section_type}
                        onChange={(e) => setEditingSection({...editingSection, section_type: e.target.value})}
                      >
                        <option value="commanding">Commanding Generals</option>
                        <option value="divisional">Divisional Command</option>
                        <option value="sergeants">Sergeant Majors</option>
                        <option value="quota">Quota Requirements</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Accent Color</label>
                      <select
                        className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white"
                        value={editingSection.accent_color}
                        onChange={(e) => setEditingSection({...editingSection, accent_color: e.target.value})}
                      >
                        <option value="yellow">Yellow</option>
                        <option value="orange">Orange</option>
                        <option value="red">Red</option>
                        <option value="amber">Amber</option>
                        <option value="blue">Blue</option>
                        <option value="green">Green</option>
                        <option value="purple">Purple</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Headers */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Layers size={18} />
                      Table Headers
                    </h3>
                    <button
                      onClick={() => setNewHeader({...newHeader, section_id: section.id})}
                      className="px-3 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm flex items-center gap-2"
                    >
                      <Plus size={14} /> Add Header
                    </button>
                  </div>

                  <div className="space-y-2">
                    {headers.map((header, headerIndex) => {
                      const isEditingHeader = editingHeader?.id === header.id;
                      
                      return (
                        <div key={header.id} className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg">
                          {isEditingHeader ? (
                            <input
                              type="text"
                              className="flex-1 px-3 py-2 rounded bg-gray-700 border border-gray-600 text-white"
                              value={editingHeader.header_text}
                              onChange={(e) => setEditingHeader({...editingHeader, header_text: e.target.value})}
                            />
                          ) : (
                            <span className="flex-1 font-medium">{header.header_text}</span>
                          )}
                          
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 mr-2">Order: {header.display_order}</span>
                            
                            <button
                              onClick={() => moveItem('headers', header.id, 'up')}
                              className="p-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-400"
                              disabled={headerIndex === 0}
                              title="Move up"
                            >
                              <ChevronUp size={14} />
                            </button>
                            <button
                              onClick={() => moveItem('headers', header.id, 'down')}
                              className="p-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-400"
                              disabled={headerIndex === headers.length - 1}
                              title="Move down"
                            >
                              <ChevronDown size={14} />
                            </button>
                            
                            {isEditingHeader ? (
                              <>
                                <button
                                  onClick={handleUpdateHeader}
                                  className="p-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white"
                                  title="Save"
                                >
                                  <Save size={14} />
                                </button>
                                <button
                                  onClick={() => setEditingHeader(null)}
                                  className="p-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-400"
                                  title="Cancel"
                                >
                                  <X size={14} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => setEditingHeader(header)}
                                  className="p-1 rounded bg-blue-700 hover:bg-blue-600 text-white"
                                  title="Edit"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteHeader(header.id)}
                                  className="p-1 rounded bg-red-700 hover:bg-red-600 text-white"
                                  title="Delete"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    
                    {headers.length === 0 && (
                      <div className="text-center py-4 text-gray-500 italic">
                        No headers for this section yet
                      </div>
                    )}
                  </div>

                  {/* Add Header Form */}
                  {newHeader.section_id === section.id && (
                    <div className="mt-4 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">Header Text</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-white"
                            value={newHeader.header_text}
                            onChange={(e) => setNewHeader({...newHeader, header_text: e.target.value})}
                            placeholder="e.g., RMP Rank"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">Display Order</label>
                          <input
                            type="number"
                            className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-white"
                            value={newHeader.display_order}
                            onChange={(e) => setNewHeader({...newHeader, display_order: parseInt(e.target.value) || 0})}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setNewHeader({ section_id: "", header_text: "", display_order: 0 })}
                          className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleCreateHeader}
                          className="px-3 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white"
                        >
                          Create Header
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Entries */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Users size={18} />
                      Entries ({entries.length})
                    </h3>
                    <button
                      onClick={() => setNewEntry({...newEntry, section_id: section.id})}
                      className="px-3 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm flex items-center gap-2"
                    >
                      <UserPlus size={14} /> Add Entry
                    </button>
                  </div>

                  {/* Add Entry Form */}
                  {newEntry.section_id === section.id && (
                    <div className="mb-6 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                      <h4 className="font-semibold mb-3">Add New Entry</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">Rank *</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-white"
                            value={newEntry.rank}
                            onChange={(e) => setNewEntry({...newEntry, rank: e.target.value})}
                            placeholder="e.g., SOR Commander"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-white"
                            value={newEntry.username}
                            onChange={(e) => setNewEntry({...newEntry, username: e.target.value})}
                            placeholder="e.g., JohnDoe"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">Army Rank</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-white"
                            value={newEntry.army_rank}
                            onChange={(e) => setNewEntry({...newEntry, army_rank: e.target.value})}
                            placeholder="e.g., Colonel"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">Roblox ID</label>
                          <input
                            type="number"
                            className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-white"
                            value={newEntry.roblox_id}
                            onChange={(e) => setNewEntry({...newEntry, roblox_id: e.target.value})}
                            placeholder="123456789"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-400 mb-1">Requirements</label>
                          <textarea
                            className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-white"
                            value={newEntry.requirements}
                            onChange={(e) => setNewEntry({...newEntry, requirements: e.target.value})}
                            placeholder="Requirements for this rank..."
                            rows="2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">Display Order</label>
                          <input
                            type="number"
                            className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-white"
                            value={newEntry.display_order}
                            onChange={(e) => setNewEntry({...newEntry, display_order: parseInt(e.target.value) || 0})}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setNewEntry({ section_id: "", rank: "", username: "", army_rank: "", roblox_id: "", requirements: "", display_order: 0 })}
                          className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleCreateEntry}
                          className="px-3 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white"
                        >
                          Create Entry
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Entries List */}
                  <div className="space-y-3">
                    {entries.map((entry, entryIndex) => {
                      const isEditingEntry = editingEntry?.id === entry.id;
                      
                      return (
                        <div key={entry.id} className="p-4 bg-gray-800/50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              {isEditingEntry ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Rank *</label>
                                    <input
                                      type="text"
                                      className="w-full px-3 py-1 rounded bg-gray-700 border border-gray-600 text-white text-sm"
                                      value={editingEntry.rank}
                                      onChange={(e) => setEditingEntry({...editingEntry, rank: e.target.value})}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Username</label>
                                    <input
                                      type="text"
                                      className="w-full px-3 py-1 rounded bg-gray-700 border border-gray-600 text-white text-sm"
                                      value={editingEntry.username}
                                      onChange={(e) => setEditingEntry({...editingEntry, username: e.target.value})}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Army Rank</label>
                                    <input
                                      type="text"
                                      className="w-full px-3 py-1 rounded bg-gray-700 border border-gray-600 text-white text-sm"
                                      value={editingEntry.army_rank}
                                      onChange={(e) => setEditingEntry({...editingEntry, army_rank: e.target.value})}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Roblox ID</label>
                                    <input
                                      type="number"
                                      className="w-full px-3 py-1 rounded bg-gray-700 border border-gray-600 text-white text-sm"
                                      value={editingEntry.roblox_id}
                                      onChange={(e) => setEditingEntry({...editingEntry, roblox_id: e.target.value})}
                                    />
                                  </div>
                                  <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Requirements</label>
                                    <textarea
                                      className="w-full px-3 py-1 rounded bg-gray-700 border border-gray-600 text-white text-sm"
                                      value={editingEntry.requirements}
                                      onChange={(e) => setEditingEntry({...editingEntry, requirements: e.target.value})}
                                      rows="2"
                                    />
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div className="flex items-center gap-3 mb-2">
                                    <span className="font-semibold text-lg">{entry.rank}</span>
                                    {entry.username && (
                                      <span className="text-gray-400">({entry.username})</span>
                                    )}
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    {entry.army_rank && (
                                      <div>
                                        <span className="text-gray-500">Army Rank:</span> {entry.army_rank}
                                      </div>
                                    )}
                                    {entry.roblox_id && (
                                      <div>
                                        <span className="text-gray-500">Roblox ID:</span> {entry.roblox_id}
                                      </div>
                                    )}
                                    {entry.requirements && (
                                      <div className="md:col-span-2">
                                        <span className="text-gray-500">Requirements:</span> {entry.requirements}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2 ml-4">
                              <span className="text-xs text-gray-500 mr-2">Order: {entry.display_order}</span>
                              
                              <button
                                onClick={() => moveItem('entries', entry.id, 'up')}
                                className="p-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-400"
                                disabled={entryIndex === 0}
                                title="Move up"
                              >
                                <ChevronUp size={14} />
                              </button>
                              <button
                                onClick={() => moveItem('entries', entry.id, 'down')}
                                className="p-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-400"
                                disabled={entryIndex === entries.length - 1}
                                title="Move down"
                              >
                                <ChevronDown size={14} />
                              </button>
                              
                              {isEditingEntry ? (
                                <>
                                  <button
                                    onClick={handleUpdateEntry}
                                    className="p-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white"
                                    title="Save"
                                  >
                                    <Save size={14} />
                                  </button>
                                  <button
                                    onClick={() => setEditingEntry(null)}
                                    className="p-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-400"
                                    title="Cancel"
                                  >
                                    <X size={14} />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => setEditingEntry(entry)}
                                    className="p-1 rounded bg-blue-700 hover:bg-blue-600 text-white"
                                    title="Edit"
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteEntry(entry.id)}
                                    className="p-1 rounded bg-red-700 hover:bg-red-600 text-white"
                                    title="Delete"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {entries.length === 0 && (
                      <div className="text-center py-8 text-gray-500 italic border-2 border-dashed border-gray-800 rounded-lg">
                        No entries for this section yet
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Empty State */}
        {hierarchyData.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="text-gray-500 mb-4">
              <Shield size={64} className="mx-auto opacity-50" />
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No Hierarchy Sections Yet</h3>
            <p className="text-gray-500">Create your first section above to get started</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}