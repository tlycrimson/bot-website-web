import { useEffect, useState, useMemo } from "react";

/* =========================
   RANK ORDER
========================= */
const RANK_ORDER = [
  "Provost Marshal",
  "SOR Commander",
  "PW Commander",
  "SOR Executive",
  "PW Executive",
  "Squadron Commander",
  "Lieutenant Colonel",
  "Regimental Sergeant Major",
  "Squadron Executive Officer",
  "Major",
  "Tactical Officer",
  "Superintendent",
  "Operations Officer",
  "Chief Inspector",
  "Junior Operations Officer",
  "Inspector",
  "Operations Sergeant Major",
  "Company Sergeant Major"
];

const RANK_PRIORITY = RANK_ORDER.reduce((acc, rank, index) => {
  acc[rank] = index;
  return acc;
}, {});

const sortByRank = (a, b) =>
  (RANK_PRIORITY[a.rank] ?? 999) - (RANK_PRIORITY[b.rank] ?? 999);

// Stable sort: fall back to username for deterministic ordering
const sortByRankStable = (a, b) => {
  const p = sortByRank(a, b);
  if (p !== 0) return p;
  return (a.username || "").localeCompare(b.username || "");
};

/* =========================
   STAT RULES & LABELS
========================= */
const RANK_STAT_RULES = {
  FULL: ["tryouts", "events", "phases", "courses", "inspections", "joint_events"],
  MID: ["tryouts", "events", "phases", "courses"],
  LOW: ["tryouts", "events", "phases"]
};

const STAT_LABELS = {
  tryouts: "Tryouts",
  events: "Events",
  phases: "Phases",
  courses: "Logistics",
  inspections: "Inspections",
  joint_events: "Joint Events"
};

const getStatRuleForRank = (rank) => {
  const p = RANK_PRIORITY[rank] ?? 999;
  if (p <= RANK_PRIORITY["PW Executive"]) return "FULL";
  if (p <= RANK_PRIORITY["Superintendent"]) return "MID";
  return "LOW";
};

/* =========================
   HIGHLIGHT CLASS
========================= */
const getHighlightClass = (value, division) => {
  if (value <= 0) return "bg-white/20 text-zinc-300";
  if (division === "PW") return "bg-black/50 text-zinc-200 border border-black/70";
  if (division === "HQ") return "bg-red-900/70 text-red-200 border border-red-800/70";
  return "bg-red-600/30 text-red-200 border border-red-500/50"; // Default SOR
};

/* =========================
   HI-COM RANK CHECK
========================= */
const isHiComRank = (rank) => {
  const hiComRanks = [
    "SOR Commander",
    "PW Commander",
    "SOR Executive",
    "PW Executive",
    "Squadron Executive Officer"
  ];
  return hiComRanks.includes(rank);
};

/* =========================
   RANK INSIGNIA & BADGE
========================= */
const getInsignia = (rank) => {
  const p = RANK_PRIORITY[rank] ?? 999;
  if (p <= RANK_PRIORITY["PW Executive"]) return { symbol: "★★★", color: "text-yellow-400" };
  if (p <= RANK_PRIORITY["Superintendent"]) return { symbol: "★★", color: "text-red-400" };
  if (p <= RANK_PRIORITY["Company Sergeant Major"]) return { symbol: "★", color: "text-zinc-300" };
  return { symbol: "◦", color: "text-zinc-600" };
};

const RankInsignia = ({ rank }) => {
  const { symbol, color } = getInsignia(rank);
  return <span className={`font-bold tracking-widest ${color}`} title={rank}>{symbol}</span>;
};

const getBadgeStyle = (rank) => {
  const p = RANK_PRIORITY[rank] ?? 999;
  if (p <= 4) return "bg-yellow-400 text-black";
  if (p <= 10) return "bg-red-600 text-white";
  if (p <= 18) return "bg-zinc-300 text-black";
  return "bg-zinc-700 text-zinc-200";
};

const RankBadge = ({ rank }) => (
  <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${getBadgeStyle(rank)}`}>{rank}</span>
);

/* =========================
   DIVISION TABLE (CARD)
========================= */
const CARD_MIN_HEIGHT = "min-h-[420px] sm:min-h-[480px] lg:min-h-[560px]";

const DivisionTable = ({ id, title, data, theme, tall = false, loading = false }) => {
  // Scale card height to the amount of content so small lists (e.g. one HQ entry) don't leave large empty space.
  const count = (data && data.length) || 0;
  const heightClass = loading
    ? CARD_MIN_HEIGHT
    : count >= 8
    ? CARD_MIN_HEIGHT
    : count >= 4
    ? "min-h-[320px] sm:min-h-[360px] lg:min-h-[420px]"
    : count >= 1
    ? "min-h-[140px] sm:min-h-[160px] lg:min-h-[200px]"
    : "min-h-[180px] sm:min-h-[220px] lg:min-h-[260px]";

  return (
    <div id={id} className={`rounded-2xl p-6 shadow-2xl ${theme} flex flex-col ${heightClass} transform transition-transform duration-300 hover:scale-105`}>
      <h2 className="text-2xl font-extrabold text-center mb-6 tracking-wide">{title}</h2>
      <div className="space-y-4 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-80">
            <div className="w-24 h-4 bg-white/10 rounded mb-3 animate-pulse" />
            <div className="w-48 h-4 bg-white/8 rounded mb-2 animate-pulse" />
            <div className="w-32 h-4 bg-white/6 rounded animate-pulse" />
          </div>
        ) : data.length === 0 ? (
          <p className="italic opacity-70 text-center">No personnel assigned</p>
        ) : (
          data.map((user, index) => {
            const prevRank = data[index - 1]?.rank;
            const isNewRank = index === 0 || prevRank !== user.rank;

            return (
              <div key={user.user_id}>
                {isNewRank && (
                  <div className="flex items-center gap-4 my-6">
                    <div className="flex-grow h-px bg-gradient-to-r from-transparent via-red-600/50 to-transparent" />
                    <span className="text-xs font-bold tracking-widest uppercase text-red-400">{user.rank}</span>
                    <div className="flex-grow h-px bg-gradient-to-l from-transparent via-red-600/50 to-transparent" />
                  </div>
                )}

                <div className="rounded-xl p-5 border bg-black/50 border-white/20">
                  {/* Top row */}
                  <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <RankInsignia rank={user.rank} />
                      <span className="font-semibold truncate">{user.username}</span>
                    </div>
                    <RankBadge rank={user.rank} />
                  </div>

                  {/* Stats */}
                  <div
                    className={`flex flex-wrap gap-3 overflow-x-auto text-sm font-semibold`}
                  >
                    {Object.entries(user)
                      .filter(([key]) => !["user_id", "username", "rank", "division"].includes(key))
                      .filter(([key]) => RANK_STAT_RULES[getStatRuleForRank(user.rank)].includes(key))
                      .map(([key, value]) => (
                        <span
                          key={key}
                          className={`px-4 py-2 rounded-full ${getHighlightClass(value, user.division)} ${
                            isHiComRank(user.rank) ? "text-base" : "text-sm"
                          }`}
                        >
                          {(STAT_LABELS[key] ?? key.replace(/_/g, " "))}: {value}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

/* =========================
   MAIN HR PAGE WITH TRIANGLE LAYOUT, TABLE TOGGLE, AND CTA
========================= */
export default function HR() {
  const [data, setData] = useState([]);
  const [selectedTables, setSelectedTables] = useState(["HQ", "PW", "SOR"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // For a smooth fade-in when content loads
  const [contentVisible, setContentVisible] = useState(false);

  // Retry cooldown: avoid repeated manual retries (2 minute cooldown)
  const [lastRetryAt, setLastRetryAt] = useState(0);
  const [retryTimer, setRetryTimer] = useState(0);
  const RETRY_COOLDOWN_MS = 2 * 60 * 1000;
  const canRetry = () => !lastRetryAt || (Date.now() - lastRetryAt) > RETRY_COOLDOWN_MS;

  useEffect(() => {
    if (!lastRetryAt) { setRetryTimer(0); return; }
    const id = setInterval(() => {
      const rem = Math.ceil((RETRY_COOLDOWN_MS - (Date.now() - lastRetryAt)) / 1000);
      if (rem <= 0) { setRetryTimer(0); clearInterval(id); }
      else setRetryTimer(rem);
    }, 1000);
    return () => clearInterval(id);
  }, [lastRetryAt]);

  const fetchData = async (signal) => {
    setLoading(true);
    setError(null);
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || "https://bot-website-api.onrender.com";
      const res = await fetch(`${API_BASE}/public/hr`, { signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      if (err.name !== 'AbortError') setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, []);

  // Trigger content fade-in when loading completes
  useEffect(() => {
    if (!loading) {
      // small delay to allow DOM paint then animate
      const t = setTimeout(() => setContentVisible(true), 40);
      return () => clearTimeout(t);
    }
    setContentVisible(false);
  }, [loading]);

  // Spinner used for waiting/empty states
  const Spinner = ({ className = "w-10 h-10" }) => (
    <div role="status" className={`mx-auto ${className} rounded-full border-4 border-white/20 border-t-white animate-spin`} aria-label="Loading" />
  );

  const PW_RANKS = ["PW Executive","PW Commander","Lieutenant Colonel","Major","Superintendent","Inspector","Company Sergeant Major"];
  const SOR_RANKS = ["SOR Executive","SOR Commander","Squadron Executive Officer","Tactical Officer","Operations Officer","Regimental Sergeant Major"];

  const HQ = useMemo(() => data.filter(u => u.division === "HQ").sort(sortByRankStable), [data]);
  const PW = useMemo(() => data.filter(u => u.division === "PW" && PW_RANKS.includes(u.rank)).sort(sortByRankStable), [data]);
  const SOR = useMemo(() => data.filter(u => u.division === "SOR" && SOR_RANKS.includes(u.rank)).sort(sortByRankStable), [data]);

  // Theme tweaks: make PW more dynamic/visible
  const HQ_THEME = "bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600 text-black";
  const PW_THEME = "bg-gradient-to-br from-red-700 via-pink-700 to-rose-900 text-white ring-1 ring-red-700/20 hover:scale-105 transform transition";
  const SOR_THEME = "bg-gradient-to-br from-zinc-800 via-zinc-900 to-black border border-zinc-600 text-white";

  const tableComponents = {
    HQ: <DivisionTable id="table-HQ" title="Headquarters" data={HQ} theme={HQ_THEME} loading={loading} />,
    PW: <DivisionTable id="table-PW" title="Provost Wing" data={PW} theme={PW_THEME} loading={loading} />,
    SOR: <DivisionTable id="table-SOR" title="Special Operations Regiment" data={SOR} theme={SOR_THEME} loading={loading} />,
  };

  const toggleTable = (id) => {
    setSelectedTables(prev => (prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]));
  };

  const renderTables = () => {
    if (selectedTables.length === 3) {
      return (
        <>
          <div className="flex items-start justify-center mb-12">
            <div className="w-full sm:max-w-[720px] lg:max-w-[920px]">{tableComponents[selectedTables[0]]}</div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {selectedTables.slice(1).map(id => (
              <div key={id} className="flex items-start justify-center w-full">
                <div className="w-full sm:max-w-[640px] lg:max-w-[720px]">{tableComponents[id]}</div>
              </div>
            ))}
          </div>
        </>
      );
    } else if (selectedTables.length === 2) {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {selectedTables.map(id => (
            <div key={id} className="flex items-start justify-center w-full">
              <div className="w-full sm:max-w-[720px] lg:max-w-[820px]">{tableComponents[id]}</div>
            </div>
          ))}
        </div>
      );
    } else if (selectedTables.length === 1) {
      return (
        <div className="flex items-start justify-center">
          <div className="w-full sm:max-w-[720px] lg:max-w-[920px]">{tableComponents[selectedTables[0]]}</div>
        </div>
      );
    } else {
      return <p className="text-center text-zinc-400">No tables selected</p>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black px-6 py-16 text-white">
      <h1 className="text-5xl md:text-6xl font-extrabold text-center mb-8 tracking-tight text-white">
        High Ranks
      </h1>

      {/* CTA Section - moved below toggles for cleaner header */}

      {/* Toggle Buttons */}
      <div className="flex justify-center gap-4 mb-12 flex-wrap">
        {["HQ", "PW", "SOR"].map(id => (
          <button
            key={id}
            onClick={() => toggleTable(id)}
            aria-pressed={selectedTables.includes(id)}
            aria-controls={`table-${id}`}
            className={`px-6 py-2 rounded-xl font-semibold transition ${
              selectedTables.includes(id)
                ? "bg-red-600 text-white"
                : "bg-white/10 text-white hover:bg-red-700"
            }`}
          >
            {id}
          </button>
        ))}
      </div>

      {/* CTA: compact and below toggles to avoid header clutter */}
      <div className="max-w-3xl mx-auto mb-12">
        <div className="bg-white/6 rounded-2xl p-4 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-red-400">Join the PW HR Team</h3>
              <p className="text-sm text-zinc-300">Help manage the Royal Military Police — we're recruiting.</p>
            </div>
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSdvDX6ADEJOIWTWUiaGb-vc_ga0SddKuu6skh8rre9RybQ5bw/viewform"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
            >
              Apply Now
            </a>
          </div>
        </div>
      </div>

      {/* Loading / Error / Empty */}
      {loading ? (
        /* Balanced skeleton grid to keep table widths consistent while loading, plus subtle loading bar */
        <div className="max-w-7xl mx-auto">
          <div className="h-1 mb-6 rounded overflow-hidden">
            <div className="h-full bg-red-600/60 animate-pulse" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-12 items-end">
            {/* Left skeleton (maps to second table visually) */}
            <div className="flex justify-center">
              <div className="w-full sm:max-w-[640px] lg:max-w-[720px]">
                <DivisionTable id={`skeleton-left`} title={selectedTables[1] || "Left"} data={[]} theme={PW_THEME} loading={true} />
              </div>
            </div>

            {/* Center skeleton (top) */}
            <div className="flex justify-center">
              <div className="w-full sm:max-w-[720px] lg:max-w-[920px]">
                <DivisionTable id={`skeleton-center`} title={selectedTables[0] || "Center"} data={[]} theme={HQ_THEME} loading={true} />
              </div>
            </div>

            {/* Right skeleton (maps to third table visually) */}
            <div className="flex justify-center">
              <div className="w-full sm:max-w-[640px] lg:max-w-[720px]">
                <DivisionTable id={`skeleton-right`} title={selectedTables[2] || "Right"} data={[]} theme={SOR_THEME} loading={true} />
              </div>
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-red-400 mb-4">Error loading data: {error}</p>
          <button
            onClick={() => {
              if (!canRetry()) return;
              setLastRetryAt(Date.now());
              setRetryTimer(Math.ceil(RETRY_COOLDOWN_MS / 1000));
              fetchData();
            }}
            className="px-4 py-2 bg-red-600 rounded-md"
            disabled={!canRetry()}
          >
            {retryTimer > 0 ? `Retry (${retryTimer}s)` : "Retry"}
          </button>
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-24">
          <Spinner className="w-12 h-12 mb-4" />
          <div className="italic opacity-70 mb-4">Waiting for HR data…</div>
        </div>
      ) : (
        <div className={`max-w-7xl mx-auto transition-all duration-700 ease-out ${contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>{renderTables()}</div>
      )}
    </div>
  );
}
