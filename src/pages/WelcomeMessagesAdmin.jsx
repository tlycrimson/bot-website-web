import { useState, useEffect, Fragment, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Plus,
  MessageSquare,
  Eye,
  EyeOff,
  Copy,
  CheckCircle,
  AlertCircle,
  Loader2,
  Save,
  X,
  Globe,
  Shield,
  Users,
  Calendar,
  User,
  Hash,
  AtSign,
  Image as ImageIcon,
  Link
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "https://bot-website-api.onrender.com";

// Discord Embed Preview Component
const DiscordEmbedPreview = ({ embedsJson, title = "Discord Embed Preview", showTitle = true }) => {
  const [embeds, setEmbeds] = useState([]);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Parse and validate JSON
  useEffect(() => {
    if (!embedsJson) {
      setEmbeds([]);
      return;
    }

    try {
      const parsed = typeof embedsJson === 'string' ? JSON.parse(embedsJson) : embedsJson;
      
      // Ensure it's an array
      const embedsArray = Array.isArray(parsed) ? parsed : [parsed];
      
      // Validate each embed structure
      const validatedEmbeds = embedsArray.map((embed, index) => {
        const validated = { ...embed };
        
        // Discord limits
        if (validated.title && validated.title.length > 256) {
          validated.title = validated.title.substring(0, 253) + '...';
        }
        
        if (validated.description && validated.description.length > 4096) {
          validated.description = validated.description.substring(0, 4093) + '...';
        }
        
        if (validated.footer && validated.footer.text && validated.footer.text.length > 2048) {
          validated.footer.text = validated.footer.text.substring(0, 2045) + '...';
        }
        
        if (validated.author && validated.author.name && validated.author.name.length > 256) {
          validated.author.name = validated.author.name.substring(0, 253) + '...';
        }
        
        return validated;
      });
      
      setEmbeds(validatedEmbeds.slice(0, 10)); // Discord max 10 embeds
      setError(null);
    } catch (err) {
      setError('Invalid JSON format');
      setEmbeds([]);
    }
  }, [embedsJson]);

  // Format timestamp for Discord
  const formatDiscordTime = (timestamp) => {
    const date = timestamp ? new Date(timestamp) : currentTime;
    return `<t:${Math.floor(date.getTime() / 1000)}:R>`;
  };

  // Convert hex color to Discord color integer
  const parseColor = (color) => {
    if (!color) return 0x5865F2; // Discord blurple default
    
    if (typeof color === 'number') return color;
    
    if (color.startsWith('#')) {
      return parseInt(color.slice(1), 16);
    }
    
    if (color.startsWith('0x')) {
      return parseInt(color.slice(2), 16);
    }
    
    // Try named colors
    const namedColors = {
      'red': 0xED4245,
      'green': 0x57F287,
      'yellow': 0xFEE75C,
      'blue': 0x5865F2,
      'purple': 0xEB459E,
      'blurple': 0x5865F2,
      'fuchsia': 0xEB459E,
      'white': 0xFFFFFF,
      'black': 0x000000,
      'gray': 0x95A5A6,
      'dark_gray': 0x2C3E50,
      'orange': 0xE67E22,
      'gold': 0xF1C40F
    };
    
    return namedColors[color.toLowerCase()] || 0x5865F2;
  };

  // Render markdown-like text (simplified)
  const renderMarkdown = (text) => {
    if (!text) return '';
    
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/__(.*?)__/g, '<u>$1</u>')
      .replace(/~~(.*?)~~/g, '<s>$1</s>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-400 hover:text-blue-300 hover:underline">$1</a>')
      .replace(/<@(\d+)>/g, '<span class="text-blue-400">@User</span>')
      .replace(/<#(\d+)>/g, '<span class="text-green-400">#channel</span>')
      .replace(/<@&(\d+)>/g, '<span class="text-purple-400">@role</span>');
  };

  // Render a single embed
  const renderEmbed = (embed, index) => {
    const color = parseColor(embed.color);
    const hexColor = `#${color.toString(16).padStart(6, '0')}`;
    
    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        className="relative"
      >
        <div 
          className="ml-14 border-l-4 rounded-r-lg overflow-hidden"
          style={{ borderLeftColor: hexColor }}
        >
          <div className="bg-[#2F3136] p-3">
            {/* Author */}
            {embed.author && (
              <div className="flex items-center gap-2 mb-2">
                {embed.author.icon_url && (
                  <img 
                    src={embed.author.icon_url} 
                    alt="" 
                    className="w-6 h-6 rounded-full"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                )}
                <div className="text-sm font-semibold text-white">
                  {embed.author.name}
                  {embed.author.url && (
                    <a href={embed.author.url} className="text-blue-400 hover:underline ml-1">
                      <Link className="inline-block w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            )}
            
            {/* Title */}
            {embed.title && (
              <div className="mb-2">
                <a 
                  href={embed.url}
                  className={`text-lg font-semibold ${embed.url ? 'text-blue-400 hover:underline' : 'text-white'}`}
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(embed.title) }}
                />
              </div>
            )}
            
            {/* Description */}
            {embed.description && (
              <div 
                className="text-gray-300 mb-3 text-sm"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(embed.description) }}
              />
            )}
            
            {/* Fields */}
            {embed.fields && Array.isArray(embed.fields) && embed.fields.length > 0 && (
              <div className="mb-3 space-y-2">
                {embed.fields.slice(0, 25).map((field, fieldIndex) => (
                  <div key={fieldIndex} className={field.inline ? "inline-block w-1/2 pr-2" : ""}>
                    <div className="font-semibold text-white text-sm mb-1">
                      {field.name}
                    </div>
                    <div 
                      className="text-gray-300 text-sm"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(field.value || '') }}
                    />
                  </div>
                ))}
              </div>
            )}
            
            {/* Image */}
            {embed.image && embed.image.url && (
              <div className="mb-3 rounded overflow-hidden max-w-md">
                <img 
                  src={embed.image.url} 
                  alt="Embed image" 
                  className="max-w-full h-auto rounded"
                  onError={(e) => e.target.style.display = 'none'}
                />
              </div>
            )}
            
            {/* Thumbnail */}
            {embed.thumbnail && embed.thumbnail.url && (
              <div className="float-right ml-3 mb-3">
                <img 
                  src={embed.thumbnail.url} 
                  alt="Thumbnail" 
                  className="w-20 h-20 rounded-lg"
                  onError={(e) => e.target.style.display = 'none'}
                />
              </div>
            )}
            
            {/* Footer & Timestamp */}
            {(embed.footer || embed.timestamp) && (
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
                <div className="flex items-center gap-2">
                  {embed.footer && embed.footer.icon_url && (
                    <img 
                      src={embed.footer.icon_url} 
                      alt="" 
                      className="w-4 h-4 rounded-full"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  )}
                  {embed.footer && embed.footer.text && (
                    <span className="text-xs text-gray-400">
                      {embed.footer.text}
                    </span>
                  )}
                </div>
                {embed.timestamp && (
                  <span className="text-xs text-gray-500">
                    {formatDiscordTime(embed.timestamp)}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  // Render Discord message container
  const renderDiscordMessage = () => (
    <div className="bg-[#36393F] rounded-lg overflow-hidden shadow-xl max-w-2xl">
      {/* Message header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">RMP Bot</span>
              <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">BOT</span>
              <span className="text-xs text-gray-400">
                Today at {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="text-sm text-gray-400">
              Sent in <span className="text-blue-400">#welcome</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Message content */}
      <div className="p-4">
        <div className="text-gray-300 mb-4">
          <span className="text-blue-400">@newmember</span> Welcome to the server! 👋
        </div>
        
        {/* Embeds */}
        {embeds.length > 0 ? (
          <div className="space-y-3">
            {embeds.map((embed, index) => renderEmbed(embed, index))}
          </div>
        ) : (
          <div className="bg-yellow-900/20 border border-yellow-800/30 rounded-lg p-4">
            <div className="flex items-center gap-2 text-yellow-300">
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm">No valid embeds to preview</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Message reactions */}
      <div className="px-4 pb-4">
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1 bg-gray-800/50 px-2 py-1 rounded-lg cursor-pointer hover:bg-gray-700/50">
            <span className="text-lg">👋</span>
            <span className="text-xs text-gray-300">1</span>
          </div>
          <div className="flex items-center gap-1 bg-gray-800/50 px-2 py-1 rounded-lg cursor-pointer hover:bg-gray-700/50">
            <span className="text-lg">🎉</span>
            <span className="text-xs text-gray-300">3</span>
          </div>
          <div className="flex items-center gap-1 bg-gray-800/50 px-2 py-1 rounded-lg cursor-pointer hover:bg-gray-700/50">
            <span className="text-lg">👮</span>
            <span className="text-xs text-gray-300">5</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Render embed info panel
  const renderInfoPanel = () => (
    <div className="bg-gray-800/50 rounded-lg p-4">
      <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-green-400" />
        Embed Validation
      </h3>
      
      {error ? (
        <div className="text-red-400 text-sm">{error}</div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Total Embeds</span>
            <span className="text-white font-semibold">{embeds.length}/10</span>
          </div>
          
          {embeds.map((embed, index) => (
            <div key={index} className="text-sm border-l-2 border-blue-500 pl-3">
              <div className="font-semibold text-white mb-1">Embed #{index + 1}</div>
              <div className="space-y-1 text-gray-400">
                {embed.title && (
                  <div className="flex justify-between">
                    <span>Title:</span>
                    <span className="text-white">{embed.title.length}/256</span>
                  </div>
                )}
                {embed.description && (
                  <div className="flex justify-between">
                    <span>Description:</span>
                    <span className="text-white">{embed.description.length}/4096</span>
                  </div>
                )}
                {embed.fields && (
                  <div className="flex justify-between">
                    <span>Fields:</span>
                    <span className="text-white">{embed.fields.length}/25</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {embeds.length === 0 && (
            <div className="text-gray-500 text-sm italic">
              Enter valid JSON to see embed preview
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {showTitle && (
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <MessageSquare className="text-blue-400" />
            {title}
          </h3>
          <div className="text-sm text-gray-400 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {renderDiscordMessage()}
        </div>
        <div>
          {renderInfoPanel()}
          
          {/* Quick Tips */}
          <div className="mt-4 bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
              <Hash className="w-4 h-4" />
              Quick Tips
            </h4>
            <ul className="text-sm text-gray-400 space-y-2">
              <li className="flex items-start gap-2">
                <AtSign className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>Use <code className="bg-gray-900 px-1 rounded">@role</code> for role mentions</span>
              </li>
              <li className="flex items-start gap-2">
                <ImageIcon className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>Images must be direct URLs (https://...)</span>
              </li>
              <li className="flex items-start gap-2">
                <Link className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>Supports markdown: **bold**, *italic*, `code`</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
export default function WelcomeMessagesAdmin() {
  const { getAuthHeaders, logout } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [expandedMessages, setExpandedMessages] = useState({});
  const [activeFilter, setActiveFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  // Form states
  const [newMessage, setNewMessage] = useState({
    message_type: 'rmp_welcome',
    version: '',
    embeds: '',
    is_active: false
  });

  const [editMessage, setEditMessage] = useState(null);

  // Fetch wrapper
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

  // Load welcome messages
  const loadMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setNotice(null);

      const data = await apiFetch(`${API_BASE}/admin/welcome-messages`);
      
      // Process data to ensure embeds are properly formatted for display
      const processedData = Array.isArray(data) ? data.map(msg => {
        // Create a display version of embeds as string
        let embedsString = '';
        try {
          if (typeof msg.embeds === 'string') {
            embedsString = msg.embeds;
            // Try to parse and re-stringify for pretty formatting
            try {
              const parsed = JSON.parse(msg.embeds);
              embedsString = JSON.stringify(parsed, null, 2);
            } catch {
              // If it's not valid JSON, use as-is
              embedsString = msg.embeds;
            }
          } else {
            // If it's already an object/array
            embedsString = JSON.stringify(msg.embeds, null, 2);
          }
        } catch (e) {
          console.error('Error processing embeds:', e);
          embedsString = 'Error processing embeds data';
        }
        
        return {
          ...msg,
          embeds_display: embedsString
        };
      }) : [];

      setMessages(processedData);
      setFilteredMessages(processedData);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Load messages error:', err);
      setError(err.message || 'Failed to load welcome messages');
      setNotice({
        type: 'error',
        text: 'Failed to load welcome messages. Please check your authentication.'
      });
      setMessages([]);
      setFilteredMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Filter and search messages
  useEffect(() => {
    if (!Array.isArray(messages)) {
      setFilteredMessages([]);
      return;
    }

    let result = messages.filter((msg) => {
      const searchLower = search.toLowerCase();
      return (
        (msg.message_type && msg.message_type.toLowerCase().includes(searchLower)) ||
        (msg.version && msg.version.toString().includes(searchLower)) ||
        (msg.updated_by && msg.updated_by.toLowerCase().includes(searchLower))
      );
    });

    // Apply filter
    if (activeFilter !== 'all') {
      result = result.filter(msg => {
        if (activeFilter === 'active') return msg.is_active === true;
        if (activeFilter === 'inactive') return msg.is_active === false;
        if (activeFilter === 'rmp') return msg.message_type === 'rmp_welcome';
        if (activeFilter === 'hr') return msg.message_type === 'hr_welcome';
        return true;
      });
    }

    // Sort by type then version descending
    result.sort((a, b) => {
      if (a.message_type === b.message_type) {
        return b.version - a.version;
      }
      return a.message_type.localeCompare(b.message_type);
    });

    setFilteredMessages(result);
  }, [search, messages, activeFilter]);

  // Toggle message details
  const toggleMessageDetails = (id) => {
    setExpandedMessages(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Handle new message form changes
  const handleNewMessageChange = (field, value) => {
    setNewMessage(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle edit message form changes
  const handleEditMessageChange = (field, value) => {
    setEditMessage(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Create new message
  const handleCreateMessage = async () => {
    if (!newMessage.message_type || !newMessage.version || !newMessage.embeds) {
      setNotice({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    try {
      // Parse and validate embeds JSON
      let parsedEmbeds;
      try {
        parsedEmbeds = JSON.parse(newMessage.embeds);
      } catch (e) {
        setNotice({ type: 'error', text: 'Invalid JSON in embeds field. Please check your JSON syntax.' });
        return;
      }

      // Prepare payload
      const payload = {
        message_type: newMessage.message_type,
        version: parseInt(newMessage.version),
        embeds: parsedEmbeds,
        is_active: newMessage.is_active
      };

      await apiFetch(`${API_BASE}/admin/welcome-messages`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      await loadMessages();
      setShowAddModal(false);
      setNewMessage({
        message_type: 'rmp_welcome',
        version: '',
        embeds: '',
        is_active: false
      });
      setNotice({ type: 'success', text: 'Welcome message created successfully!' });
    } catch (err) {
      console.error('Create message error:', err);
      setNotice({ type: 'error', text: err.message || 'Failed to create message' });
    }
  };

  // Update message
  const handleUpdateMessage = async () => {
    if (!editMessage) return;

    try {
      // Parse embeds JSON
      let parsedEmbeds;
      try {
        parsedEmbeds = JSON.parse(editMessage.embeds);
      } catch (e) {
        setNotice({ type: 'error', text: 'Invalid JSON in embeds field. Please check your JSON syntax.' });
        return;
      }

      const payload = {
        embeds: parsedEmbeds
      };

      await apiFetch(`${API_BASE}/admin/welcome-messages/${editMessage.id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });

      await loadMessages();
      setShowEditModal(false);
      setEditMessage(null);
      setPreviewData(null);
      setNotice({ type: 'success', text: 'Welcome message updated successfully!' });
    } catch (err) {
      console.error('Update message error:', err);
      setNotice({ type: 'error', text: err.message || 'Failed to update message' });
    }
  };

  // Delete message
  const handleDeleteMessage = async (message) => {
    if (!window.confirm(`Are you sure you want to delete version ${message.version} of ${message.message_type}?`)) return;
    
    try {
      await apiFetch(`${API_BASE}/admin/welcome-messages/${message.id}`, {
        method: 'DELETE',
      });

      await loadMessages();
      setNotice({ type: 'success', text: 'Welcome message deleted successfully!' });
    } catch (err) {
      console.error('Delete message error:', err);
      setNotice({ type: 'error', text: err.message || 'Failed to delete message' });
    }
  };

  // Activate message
  const handleActivateMessage = async () => {
    if (!selectedMessage) return;

    try {
      await apiFetch(`${API_BASE}/admin/welcome-messages/${selectedMessage.id}/activate`, {
        method: 'POST',
      });

      await loadMessages();
      setShowActivateModal(false);
      setSelectedMessage(null);
      setNotice({ type: 'success', text: `Activated version ${selectedMessage.version} of ${selectedMessage.message_type}!` });
    } catch (err) {
      console.error('Activate message error:', err);
      setNotice({ type: 'error', text: err.message || 'Failed to activate message' });
    }
  };

  // Copy embeds to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setNotice({ type: 'success', text: 'Copied to clipboard!' });
      })
      .catch(err => {
        console.error('Copy failed:', err);
        setNotice({ type: 'error', text: 'Failed to copy to clipboard' });
      });
  };

  // View active messages
  const viewActiveMessages = async () => {
    try {
      const [rmpResponse, hrResponse] = await Promise.all([
        apiFetch(`${API_BASE}/admin/welcome-messages/type/rmp_welcome`),
        apiFetch(`${API_BASE}/admin/welcome-messages/type/hr_welcome`)
      ]);

      const activeMessages = [];
      if (rmpResponse.active_message) {
        activeMessages.push({
          ...rmpResponse.active_message,
          all_versions: rmpResponse.all_versions || []
        });
      }
      if (hrResponse.active_message) {
        activeMessages.push({
          ...hrResponse.active_message,
          all_versions: hrResponse.all_versions || []
        });
      }

      // For demo purposes, show in console
      console.log('Active Welcome Messages:', activeMessages);
      setNotice({ 
        type: 'info', 
        text: `Active messages: ${activeMessages.length} (check console for details)` 
      });
    } catch (err) {
      console.error('View active messages error:', err);
      setNotice({ type: 'error', text: 'Failed to fetch active messages' });
    }
  };

  // Filter options
  const filterOptions = [
    { id: 'all', label: 'All Messages', color: 'bg-gray-600', icon: MessageSquare },
    { id: 'active', label: 'Active', color: 'bg-green-600', icon: Eye },
    { id: 'inactive', label: 'Inactive', color: 'bg-gray-600', icon: EyeOff },
    { id: 'rmp', label: 'RMP Welcome', color: 'bg-blue-600', icon: Shield },
    { id: 'hr', label: 'HR Welcome', color: 'bg-purple-600', icon: Users }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-400">Loading welcome messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-gray-100 p-4 md:p-8">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-900/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-900/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-5xl font-bold mb-2">
                <span className="bg-gradient-to-r from-purple-600 to-blue-400 bg-clip-text text-transparent">
                  Welcome Messages
                </span>
              </h1>
              <p className="text-gray-400">Manage Discord welcome message embeds</p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <button
                onClick={logout}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center gap-2"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-800 mb-8">
            <button
              onClick={() => navigate('/admin')}
              className={`px-6 py-3 font-semibold transition-all ${false ? 'border-b-2 border-red-500 text-red-400' : 'text-gray-400 hover:text-white'}`}
            >
              User Management
            </button>
            <button
              onClick={() => navigate('/admin/hierarchy')}
              className={`px-6 py-3 font-semibold transition-all ${false ? 'border-b-2 border-red-500 text-red-400' : 'text-gray-400 hover:text-white'}`}
            >
              Hierarchy Editor
            </button>
            <button
              onClick={() => navigate('/admin/welcome-messages')}
              className={`px-6 py-3 font-semibold transition-all ${true ? 'border-b-2 border-purple-500 text-purple-400' : 'text-gray-400 hover:text-white'}`}
            >
              <MessageSquare className="inline-block w-5 h-5 mr-2" />
              Welcome Messages
            </button>
          </div>
        </motion.header>

        {/* Error/Notice Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-lg border border-red-800 bg-red-900/20 px-4 py-3 text-sm text-red-200"
          >
            <div className="flex justify-between items-center">
              <span>Error: {error}</span>
              <button
                onClick={loadMessages}
                className="ml-4 px-3 py-1 bg-red-700 hover:bg-red-600 rounded text-sm transition-colors"
              >
                Retry
              </button>
            </div>
          </motion.div>
        )}

        {notice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-4 rounded-lg px-4 py-3 text-sm border ${
              notice.type === 'success'
                ? 'bg-emerald-900/20 border-emerald-700 text-emerald-200'
                : notice.type === 'info'
                ? 'bg-blue-900/20 border-blue-700 text-blue-200'
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

        {/* Action Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-6 mb-6">
            {/* Search Bar */}
            <div className="flex-1 relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-transparent rounded-xl blur group-hover:blur-sm transition-all duration-300"></div>
              <div className="relative flex items-center bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden">
                <Search className="w-5 h-5 ml-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by type, version, or updated by..."
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

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowPreview(!showPreview)}
                className={`px-6 py-4 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all duration-300 ${
                  showPreview
                    ? 'bg-gradient-to-r from-green-700 to-green-600'
                    : 'bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500'
                } shadow-lg`}
              >
                <Eye className="w-5 h-5" />
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={viewActiveMessages}
                className="px-6 py-4 rounded-xl font-semibold flex items-center justify-center gap-3 bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 shadow-lg shadow-blue-900/30 transition-all duration-300"
              >
                <Eye className="w-5 h-5" />
                View Active
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddModal(true)}
                className="px-6 py-4 rounded-xl font-semibold flex items-center justify-center gap-3 bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-600 hover:to-purple-500 shadow-lg shadow-purple-900/30 transition-all duration-300"
              >
                <Plus className="w-5 h-5" />
                New Message
              </motion.button>
            </div>
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

        {/* Messages Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden shadow-2xl"
        >
          {messages.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-800 rounded-full flex items-center justify-center">
                <MessageSquare className="w-12 h-12 text-gray-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-400 mb-2">
                No welcome messages found
              </h3>
              <p className="text-gray-500 mb-6">
                Create your first welcome message to get started
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-700 to-purple-600 text-white font-semibold transition-all"
              >
                Create First Message
              </motion.button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto max-h-[600px]">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-900 to-black border-b border-gray-800">
                      {['Type', 'Version', 'Status', 'Last Updated', 'Updated By', 'Actions'].map((header) => (
                        <th
                          key={header}
                          className="px-6 py-4 text-left text-sm font-semibold text-gray-300"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {filteredMessages.length > 0 ? (
                        filteredMessages.map((msg) => (
                          <Fragment key={msg.id}>
                            <motion.tr
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{ duration: 0.3 }}
                              className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors group"
                            >
                              <td className="px-6 py-4">
                                <span className={`inline-block px-3 py-1 rounded-full font-medium ${
                                  msg.message_type === 'rmp_welcome'
                                    ? 'bg-gradient-to-r from-blue-900/30 to-blue-900/10 border border-blue-800/30 text-blue-300'
                                    : 'bg-gradient-to-r from-purple-900/30 to-purple-900/10 border border-purple-800/30 text-purple-300'
                                }`}>
                                  {msg.message_type === 'rmp_welcome' ? 'RMP Welcome' : 'HR Welcome'}
                                </span>
                              </td>
                              <td className="px-6 py-4 font-mono font-semibold">v{msg.version}</td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                                  msg.is_active
                                    ? 'bg-green-900/30 text-green-300 border border-green-800/30'
                                    : 'bg-gray-800 text-gray-400 border border-gray-700'
                                }`}>
                                  {msg.is_active ? (
                                    <>
                                      <Eye className="w-3 h-3 mr-1" /> Active
                                    </>
                                  ) : (
                                    <>
                                      <EyeOff className="w-3 h-3 mr-1" /> Inactive
                                    </>
                                  )}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-gray-400 text-sm">
                                {msg.last_updated ? new Date(msg.last_updated).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-gray-500" />
                                  <span className="text-gray-300">{msg.updated_by || 'Unknown'}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <motion.button
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-2 rounded-lg bg-blue-900/30 hover:bg-blue-800/50 border border-blue-800/30 text-blue-300 transition-all duration-300"
                                    onClick={() => {
                                      setEditMessage({...msg, embeds: msg.embeds_display});
                                      setShowEditModal(true);
                                    }}
                                    title="Edit"
                                  >
                                    <Edit2 size={18} />
                                  </motion.button>
                                  
                                  {!msg.is_active && (
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      className="p-2 rounded-lg bg-green-900/30 hover:bg-green-800/50 border border-green-800/30 text-green-300 transition-all duration-300"
                                      onClick={() => {
                                        setSelectedMessage(msg);
                                        setShowActivateModal(true);
                                      }}
                                      title="Activate"
                                    >
                                      <CheckCircle size={18} />
                                    </motion.button>
                                  )}

                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 transition-all duration-300"
                                    onClick={() => toggleMessageDetails(msg.id)}
                                    title="View Details"
                                  >
                                    {expandedMessages[msg.id] ? (
                                      <ChevronUp size={18} />
                                    ) : (
                                      <ChevronDown size={18} />
                                    )}
                                  </motion.button>

                                  <motion.button
                                    whileHover={{ scale: 1.1, rotate: -5 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-2 rounded-lg bg-red-900/30 hover:bg-red-800/50 border border-red-800/30 text-red-300 transition-all duration-300"
                                    onClick={() => handleDeleteMessage(msg)}
                                    title="Delete"
                                  >
                                    <Trash2 size={18} />
                                  </motion.button>
                                </div>
                              </td>
                            </motion.tr>
                            
                            {expandedMessages[msg.id] && (
                              <tr>
                                <td colSpan="6" className="px-6 pb-4">
                                  <div className="rounded-xl border border-gray-800 bg-gray-900/70 p-4">
                                    <div className="flex justify-between items-start mb-4">
                                      <div>
                                        <h4 className="font-semibold text-gray-200 mb-2">Message Details</h4>
                                        <div className="text-sm text-gray-400">
                                          ID: <code className="bg-gray-800 px-2 py-1 rounded">{msg.id}</code>
                                        </div>
                                      </div>
                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 transition-colors"
                                        onClick={() => copyToClipboard(msg.embeds_display)}
                                        title="Copy embeds JSON"
                                      >
                                        <Copy size={16} />
                                      </motion.button>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                      <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">Message Type</label>
                                        <div className="px-3 py-2 bg-gray-800 rounded-lg border border-gray-700">
                                          {msg.message_type}
                                        </div>
                                      </div>
                                      <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">Version</label>
                                        <div className="px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 font-mono">
                                          {msg.version}
                                        </div>
                                      </div>
                                    </div>

                                    <div>
                                      <label className="block text-xs font-medium text-gray-400 mb-2">Embeds (JSON)</label>
                                      <pre className="text-xs bg-black/50 p-4 rounded-lg overflow-x-auto border border-gray-800 max-h-64 overflow-y-auto">
                                        {msg.embeds_display}
                                      </pre>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6}>
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="py-16 text-center"
                            >
                              <div className="w-24 h-24 mx-auto mb-6 bg-gray-800 rounded-full flex items-center justify-center">
                                <Search className="w-12 h-12 text-gray-600" />
                              </div>
                              <h3 className="text-2xl font-bold text-gray-400 mb-2">
                                No messages found
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
              {filteredMessages.length > 0 && (
                <div className="px-6 py-4 bg-gray-900/50 border-t border-gray-800 flex justify-between items-center">
                  <div className="text-sm text-gray-400">
                    Showing <span className="text-white font-semibold">{filteredMessages.length}</span> of{" "}
                    <span className="text-white font-semibold">{messages.length}</span> messages
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

        {/* Discord Preview Section */}
        {showPreview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-8 bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <MessageSquare className="text-green-400" />
                Live Discord Preview
              </h3>
              <div className="flex gap-3">
                <select
                  className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm"
                  value={previewData?.id || ''}
                  onChange={(e) => {
                    const message = messages.find(m => m.id === e.target.value);
                    if (message) {
                      setPreviewData(message);
                    }
                  }}
                >
                  <option value="">Select message to preview</option>
                  {messages.map(msg => (
                    <option key={msg.id} value={msg.id}>
                      {msg.message_type === 'rmp_welcome' ? 'RMP' : 'HR'} v{msg.version} {msg.is_active ? '✓' : ''}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setPreviewData(null)}
                  className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-sm transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
            
            {previewData ? (
              <DiscordEmbedPreview 
                embedsJson={previewData.embeds_display || previewData.embeds}
                title={`Preview: ${previewData.message_type === 'rmp_welcome' ? 'RMP Welcome' : 'HR Welcome'} v${previewData.version}`}
                showTitle={false}
              />
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-8 h-8 text-gray-600" />
                </div>
                <p className="text-gray-400 mb-4">Select a message from the dropdown to preview</p>
                <p className="text-gray-500 text-sm">Or edit a message to see live preview while editing</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Add Message Modal */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setShowAddModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8 max-w-6xl w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                  <Plus className="text-purple-400" />
                  Create New Welcome Message
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left side: Form */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Message Type *
                        </label>
                        <div className="relative">
                          <select
                            className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-purple-500 focus:outline-none text-white appearance-none cursor-pointer"
                            value={newMessage.message_type}
                            onChange={(e) => handleNewMessageChange('message_type', e.target.value)}
                          >
                            <option value="rmp_welcome">RMP Welcome</option>
                            <option value="hr_welcome">HR Welcome</option>
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Version *
                        </label>
                        <input
                          type="number"
                          placeholder="e.g., 1, 2, 3"
                          className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-purple-500 focus:outline-none text-white transition-colors"
                          value={newMessage.version}
                          onChange={(e) => handleNewMessageChange('version', e.target.value)}
                          min="1"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Embeds (JSON) *
                        <span className="text-xs text-gray-500 ml-2">
                          Discord embeds JSON array
                        </span>
                      </label>
                      <textarea
                        className="w-full h-96 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-purple-500 focus:outline-none text-white font-mono text-sm transition-colors"
                        value={newMessage.embeds}
                        onChange={(e) => handleNewMessageChange('embeds', e.target.value)}
                        placeholder='[{"title": "Welcome!", "description": "Welcome to our server!", "color": 0x5865F2}]'
                      />
                      <p className="mt-2 text-xs text-gray-500">
                        Must be valid JSON. Preview updates as you type.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="is_active"
                        className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-700 rounded focus:ring-purple-500 focus:ring-offset-gray-900"
                        checked={newMessage.is_active}
                        onChange={(e) => handleNewMessageChange('is_active', e.target.checked)}
                      />
                      <label htmlFor="is_active" className="text-sm text-gray-300">
                        Set as active immediately (will deactivate other versions of same type)
                      </label>
                    </div>

                    <div className="flex gap-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setShowAddModal(false);
                          setNewMessage({
                            message_type: 'rmp_welcome',
                            version: '',
                            embeds: '',
                            is_active: false
                          });
                        }}
                        className="flex-1 px-6 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCreateMessage}
                        className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-600 hover:to-purple-500 text-white font-semibold transition-all"
                      >
                        Create Message
                      </motion.button>
                    </div>
                  </div>

                  {/* Right side: Preview */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-white flex items-center gap-2">
                        <Eye className="w-5 h-5 text-green-400" />
                        Live Preview
                      </h4>
                      <div className="text-xs text-gray-400">
                        Updates as you type
                      </div>
                    </div>
                    
                    <div className="h-[calc(100vh-300px)] overflow-y-auto">
                      <DiscordEmbedPreview 
                        embedsJson={newMessage.embeds}
                        title=""
                        showTitle={false}
                      />
                    </div>
                    
                    <div className="text-xs text-gray-500 p-3 bg-gray-800/50 rounded-lg">
                      <div className="font-semibold mb-1 text-gray-300">Example JSON:</div>
                      <pre className="text-xs bg-black/50 p-2 rounded overflow-x-auto">
{`[{
  "title": "Welcome!",
  "description": "Welcome to our server!",
  "color": "#5865F2",
  "fields": [
    {"name": "Rules", "value": "Read <#1165368313925353580>", "inline": true},
    {"name": "Support", "value": "Ask in <#1165368317532438646>", "inline": true}
  ],
  "footer": {"text": "Enjoy your stay!"}
}]`}
                      </pre>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Message Modal */}
        <AnimatePresence>
          {showEditModal && editMessage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setShowEditModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8 max-w-6xl w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                  <Edit2 className="text-blue-400" />
                  Edit Welcome Message
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left side: Form */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Message Type
                        </label>
                        <div className="px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-400">
                          {editMessage.message_type === 'rmp_welcome' ? 'RMP Welcome' : 'HR Welcome'}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Version
                        </label>
                        <div className="px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 font-mono">
                          v{editMessage.version}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Status
                      </label>
                      <div className={`inline-flex items-center px-4 py-2 rounded-lg ${
                        editMessage.is_active
                          ? 'bg-green-900/30 text-green-300 border border-green-800/30'
                          : 'bg-gray-800 text-gray-400 border border-gray-700'
                      }`}>
                        {editMessage.is_active ? (
                          <>
                            <Eye className="w-4 h-4 mr-2" /> Active
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-4 h-4 mr-2" /> Inactive
                          </>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Embeds (JSON) *
                        <span className="text-xs text-gray-500 ml-2">
                          Discord embeds JSON array
                        </span>
                      </label>
                      <textarea
                        className="w-full h-96 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none text-white font-mono text-sm transition-colors"
                        value={editMessage.embeds}
                        onChange={(e) => {
                          handleEditMessageChange('embeds', e.target.value);
                          // Update preview in real-time
                          setPreviewData({
                            ...editMessage,
                            embeds: e.target.value
                          });
                        }}
                      />
                      <p className="mt-2 text-xs text-gray-500">
                        Must be valid JSON. Changes are previewed live on the right.
                      </p>
                    </div>

                    <div className="flex gap-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setShowEditModal(false);
                          setEditMessage(null);
                          setPreviewData(null);
                        }}
                        className="flex-1 px-6 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleUpdateMessage}
                        className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white font-semibold transition-all"
                      >
                        Save Changes
                      </motion.button>
                    </div>
                  </div>

                  {/* Right side: Preview */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-white flex items-center gap-2">
                        <Eye className="w-5 h-5 text-green-400" />
                        Live Preview
                      </h4>
                      <div className="text-xs text-gray-400">
                        Updates as you type
                      </div>
                    </div>
                    
                    <div className="h-[calc(100vh-300px)] overflow-y-auto">
                      <DiscordEmbedPreview 
                        embedsJson={editMessage.embeds}
                        title=""
                        showTitle={false}
                      />
                    </div>
                    
                    <div className="text-xs text-gray-500 p-3 bg-gray-800/50 rounded-lg">
                      <div className="font-semibold mb-1 text-gray-300">Preview Notes:</div>
                      <ul className="space-y-1">
                        <li>• Actual Discord appearance may vary slightly</li>
                        <li>• Images must be publicly accessible URLs</li>
                        <li>• Color can be hex (#FF0000), decimal (16711680), or named</li>
                        <li>• Markdown formatting is supported</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Activate Message Modal */}
        <AnimatePresence>
          {showActivateModal && selectedMessage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setShowActivateModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                  <CheckCircle className="text-green-400" />
                  Activate Welcome Message
                </h3>
                
                <div className="space-y-4 mb-6">
                  <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedMessage.message_type === 'rmp_welcome'
                          ? 'bg-blue-900/30 text-blue-300'
                          : 'bg-purple-900/30 text-purple-300'
                      }`}>
                        {selectedMessage.message_type === 'rmp_welcome' ? 'RMP Welcome' : 'HR Welcome'}
                      </span>
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-700 text-gray-300">
                        v{selectedMessage.version}
                      </span>
                    </div>
                    <p className="text-gray-300">
                      Are you sure you want to activate this message?
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      This will deactivate all other versions of{' '}
                      <span className="font-semibold">
                        {selectedMessage.message_type === 'rmp_welcome' ? 'RMP Welcome' : 'HR Welcome'}
                      </span> messages.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowActivateModal(false);
                      setSelectedMessage(null);
                    }}
                    className="flex-1 px-6 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleActivateMessage}
                    className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-green-700 to-green-600 hover:from-green-600 hover:to-green-500 text-white font-semibold transition-all"
                  >
                    Activate
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