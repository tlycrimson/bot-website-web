import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageSquare, User, Calendar, Image as ImageIcon, Link, Hash, AtSign, CheckCircle } from "lucide-react";

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

export default DiscordEmbedPreview;