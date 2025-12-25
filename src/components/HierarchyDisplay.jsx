import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Users, Award, Star, Target } from "lucide-react";

const API_BASE = "https://bot-website-api.onrender.com";

export default function HierarchyDisplay() {
  const [hierarchyData, setHierarchyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadHierarchy = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/hierarchy`);
        if (!response.ok) throw new Error('Failed to load hierarchy');
        const data = await response.json();
        setHierarchyData(data);
      } catch (err) {
        console.error('Error loading hierarchy:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadHierarchy();
  }, []);

  // Color mapping for different section types
  const getColorClasses = (accentColor) => {
    const colorMap = {
      yellow: 'bg-yellow-500',
      orange: 'bg-orange-500',
      red: 'bg-red-500',
      amber: 'bg-amber-500',
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
    };
    return colorMap[accentColor] || 'bg-gray-500';
  };

  // Get icon for section type
  const getSectionIcon = (sectionType) => {
    const iconMap = {
      commanding: Shield,
      divisional: Target,
      sergeants: Users,
      quota: Award,
    };
    return iconMap[sectionType] || Star;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading hierarchy...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center text-red-400">
          <p>Error loading hierarchy: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/10 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold text-center mb-4"
          >
            <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              Royal Military Police
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-center text-gray-400"
          >
            Command Structure & Hierarchy
          </motion.p>
        </div>
      </div>

      {/* Hierarchy Sections */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {hierarchyData.map((sectionData, index) => {
          const { section, headers, entries } = sectionData;
          const SectionIcon = getSectionIcon(section.section_type);
          const colorClass = getColorClasses(section.accent_color);

          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="mb-12"
            >
              {/* Section Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-2 h-10 rounded-full ${colorClass}`}></div>
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  <SectionIcon className="text-gray-400" />
                  {section.section_title}
                </h2>
              </div>

              {/* Table */}
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-800">
                {/* Table Headers */}
                {headers.length > 0 && (
                  <div className="bg-gray-800/50 grid grid-cols-6 gap-4 p-4 border-b border-gray-700">
                    {headers.map((header, idx) => (
                      <div key={idx} className="font-semibold text-gray-300">
                        {header.header_text}
                      </div>
                    ))}
                  </div>
                )}

                {/* Table Rows */}
                <div className="divide-y divide-gray-800">
                  {entries.map((entry, idx) => (
                    <div key={idx} className="grid grid-cols-6 gap-4 p-4 hover:bg-gray-800/30 transition-colors">
                      <div className="col-span-2">
                        <div className="font-semibold">{entry.rank}</div>
                        {entry.army_rank && (
                          <div className="text-sm text-gray-400">{entry.army_rank}</div>
                        )}
                      </div>
                      <div>{entry.username || '-'}</div>
                      <div>{entry.roblox_id || '-'}</div>
                      <div className="col-span-2">{entry.requirements || '-'}</div>
                    </div>
                  ))}
                </div>

                {/* Empty State */}
                {entries.length === 0 && (
                  <div className="py-12 text-center text-gray-500">
                    No entries in this section
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* Empty State for No Sections */}
        {hierarchyData.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-500 mb-4">
              <Shield size={64} className="mx-auto opacity-50" />
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No Hierarchy Available</h3>
            <p className="text-gray-500">The hierarchy data is currently being prepared.</p>
          </div>
        )}
      </div>
    </div>
  );
}