import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext"; 
import Section from "../components/hierarchy/Section";
import HierarchyTable from "../components/hierarchy/HierarchyTable";
import { Shield, Loader2 } from "lucide-react";

const API_BASE = "https://bot-website-api.onrender.com";

export default function Hierarchy() {
  const { user } = useAuth();
  const [hierarchyData, setHierarchyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHierarchy = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/hierarchy`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch hierarchy: ${response.status}`);
        }
        
        const data = await response.json();
        setHierarchyData(data);
      } catch (err) {
        console.error("Error fetching hierarchy:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHierarchy();
  }, []);

  // Helper to determine if a section should show avatars
  const shouldShowAvatars = (sectionType) => {
    return sectionType === 'commanding' || sectionType === 'divisional' || sectionType === 'sergeants';
  };

  // Helper to map data to HierarchyTable format
  const mapRowsToTableFormat = (entries, sectionType) => {
    if (sectionType === 'quota') {
      return entries.map(entry => [
        entry.rank,
        entry.requirements || ''
      ]);
    } else {
      return entries.map(entry => ({
        rank: entry.rank,
        username: entry.username || '',
        armyRank: entry.army_rank || '',
        robloxId: entry.roblox_id || null
      }));
    }
  };

  // Helper to get headers based on section type
  const getHeadersForSection = (sectionType) => {
    if (sectionType === 'quota') {
      return ["Rank", "Requirements"];
    } else {
      return ["RMP Rank", "Username", "Army Rank"];
    }
  };

  // Color mapping for themes
  const getThemeColor = (accentColor) => {
    const colorMap = {
      'yellow': 'yellow',
      'orange': 'orange',
      'red': 'red',
      'amber': 'amber',
      'blue': 'blue',
      'green': 'green',
      'purple': 'purple'
    };
    return colorMap[accentColor] || 'gray';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-red-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading hierarchy data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white px-6 py-16">
        <div className="text-center max-w-2xl mx-auto">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Unable to Load Hierarchy</h1>
          <p className="text-gray-400 mb-6">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Group sections by their visual position
  const commandingSections = hierarchyData.filter(s => s.section.section_type === 'commanding');
  const divisionalSections = hierarchyData.filter(s => s.section.section_type === 'divisional');
  const sergeantsSections = hierarchyData.filter(s => s.section.section_type === 'sergeants');
  const quotaSections = hierarchyData.filter(s => s.section.section_type === 'quota');

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white px-6 py-16">
      <h1 className="text-5xl font-extrabold text-center tracking-widest mb-16">
        Royal Military Police — Command Hierarchy
      </h1>

      <div className="max-w-7xl mx-auto space-y-32 relative">
        {/* COMMANDING GENERALS */}
        {commandingSections.map((sectionData, index) => {
          const { section, entries } = sectionData;
          if (section.is_active == false) return null;
          
          return (
            <div key={section.id} className="flex justify-center relative">
              <Section title={section.section_title} accent={getThemeColor(section.accent_color)}>
                <HierarchyTable
                  headers={getHeadersForSection(section.section_type)}
                  rows={mapRowsToTableFormat(entries, section.section_type)}
                  theme={getThemeColor(section.accent_color)}
                  showAvatar={shouldShowAvatars(section.section_type)}
                />
              </Section>
              <div className="absolute bottom-[-60px] left-1/2 w-px h-16 bg-white/30" />
            </div>
          );
        })}

        {/* DIVISIONAL COMMAND */}
        {divisionalSections.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 relative">
            {divisionalSections.map((sectionData, index) => {
              const { section, entries } = sectionData;
              if (section.is_active == false) return null;
              
              return (
                <div key={section.id} className="flex justify-center relative">
                  <Section title={section.section_title} accent={getThemeColor(section.accent_color)}>
                    <HierarchyTable
                      headers={getHeadersForSection(section.section_type)}
                      rows={mapRowsToTableFormat(entries, section.section_type)}
                      theme={getThemeColor(section.accent_color)}
                      showAvatar={shouldShowAvatars(section.section_type)}
                    />
                  </Section>
                  <div className="absolute top-[-60px] left-1/2 w-px h-16 bg-white/30" />
                </div>
              );
            })}
          </div>
        )}

        {/* SERGEANT MAJORS */}
        {sergeantsSections.map((sectionData, index) => {
          const { section, entries } = sectionData;
          if (section.is_active == false) return null;
          
          return (
            <div key={section.id} className="flex justify-center relative">
              <Section title={section.section_title} accent={getThemeColor(section.accent_color)}>
                <HierarchyTable
                  headers={getHeadersForSection(section.section_type)}
                  rows={mapRowsToTableFormat(entries, section.section_type)}
                  theme={getThemeColor(section.accent_color)}
                  showAvatar={shouldShowAvatars(section.section_type)}
                />
              </Section>
              <div className="absolute top-[-60px] left-[25%] w-px h-16 bg-white/30" />
              <div className="absolute top-[-60px] left-[75%] w-px h-16 bg-white/30" />
              <div className="absolute top-[-60px] left-[25%] w-[50%] h-px bg-white/30" />
            </div>
          );
        })}

        {/* QUOTAS */}
        {quotaSections.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-32">
            {quotaSections.map((sectionData, index) => {
              const { section, entries } = sectionData;
              if (section.is_active == false) return null;
              
              return (
                <Section key={section.id} title={section.section_title} accent={getThemeColor(section.accent_color)}>
                  <HierarchyTable
                    headers={getHeadersForSection(section.section_type)}
                    rows={mapRowsToTableFormat(entries, section.section_type)}
                    theme={getThemeColor(section.accent_color)}
                  />
                </Section>
              );
            })}
          </div>
        )}

        {/* EMPTY STATE */}
        {hierarchyData.length === 0 && (
          <div className="text-center py-16">
            <Shield className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-400 mb-2">No Hierarchy Data Available</h2>
            <p className="text-gray-500">The command hierarchy is currently being updated.</p>
          </div>
        )}
      </div>
    </div>
  );
}