import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";

/* ===============================
   LR RANK ORDER
================================ */
const LR_RANK_ORDER = [
  "Regimental Sergeant Major",
  "Tactical Leader",
  "Staff Sergeant",
  "Field Specialist",
  "Sergeant",
  "Senior Operator",
  "Senior Constable",
  "Operator",
  "Constable",
  "Trainee Constable",
];

const LR_RANK_PRIORITY = LR_RANK_ORDER.reduce((acc, rank, index) => {
  acc[rank] = index;
  return acc;
}, {});

const isSergeantMajor = (rank = "") =>
  rank.toLowerCase().includes("sergeant major");

const sortByLRRank = (a, b) =>
  (LR_RANK_PRIORITY[a.rank] ?? 999) - (LR_RANK_PRIORITY[b.rank] ?? 999);

// Stable sort: fall back to username for deterministic ordering
const sortByLRRankStable = (a, b) => {
  const p = sortByLRRank(a, b);
  if (p !== 0) return p;
  return (a.username || "").localeCompare(b.username || "");
};

/* ===============================
   HIGHLIGHT CLASSES
================================ */
const getHighlightClass = (value, division) => {
  if (value <= 0) return "bg-white/20 text-zinc-300";
  if (division === "PW") return "bg-black/50 text-zinc-200 border border-black/70";
  if (division === "HQ") return "bg-red-900/70 text-red-200 border border-red-800/70";
  return "bg-red-600/30 text-red-200 border border-red-500/50"; // Default SOR
};

/* ===============================
   RANK VISUAL CLASS
================================ */
const getRankVisualClass = (rank) => {
  const p = LR_RANK_PRIORITY[rank] ?? 999;
  if (p <= 0) return "border-yellow-500/70 bg-gradient-to-r from-yellow-500/20 to-transparent";
  if (p <= 3) return "border-red-500/50 bg-red-500/10";
  return "border-white/20 bg-black/50";
};

// LR insignia and badge helpers (mirrors HRs style but with an LR-appropriate emoji)
const getLRInsignia = (rank) => {
  // Sergeant Majors always get the maximum insignia
  if (isSergeantMajor(rank)) return { symbol: "★★★", color: "text-yellow-400" };
  const p = LR_RANK_PRIORITY[rank] ?? 999;
  // Use distinctive LR emoji insignia (★) with tiered counts for clarity
  if (p <= 2) return { symbol: "★★★", color: "text-yellow-400" };
  if (p <= 6) return { symbol: "★★", color: "text-red-400" };
  if (p <= 7) return { symbol: "★", color: "text-zinc-300" };
  return { symbol: "⚝", color: "text-zinc-600" };
};

const LRInsignia = ({ rank }) => {
  const { symbol, color } = getLRInsignia(rank);
  return <span className={`font-bold tracking-widest ${color}`} title={rank}>{symbol}</span>;
};

const getLRBadgeStyle = (rank) => {
  const p = LR_RANK_PRIORITY[rank] ?? 999;
  if (p === 0) return "bg-yellow-400 text-black";
  if (p <= 3) return "bg-red-600 text-white";
  if (p <= 6) return "bg-zinc-300 text-black";
  return "bg-zinc-700 text-zinc-200";
};

const LRRankBadge = ({ rank }) => (
  <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${getLRBadgeStyle(rank)}`}>
    {rank}
  </span>
);

/* ===============================
   DIVISION TABLE (CARD) WITH RANK SEPARATORS
================================ */
const CARD_MIN_HEIGHT = "min-h-[420px] sm:min-h-[480px] lg:min-h-[560px]";

const LRDivisionTable = ({ id, title, data, theme, tall = false, loading = false }) => {
  // Scale card height with content so small lists (e.g. a single sergeant major) don't show excessive empty space
  const count = (data && data.length) || 0;
  const heightClass = loading
    ? CARD_MIN_HEIGHT
    : tall
    ? "min-h-[650px]"
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
        ) : (
          data.map((user, index) => {
            const prevRank = data[index - 1]?.rank;
            const isNewRank = index === 0 || prevRank !== user.rank;

            return (
              <div key={user.user_id}>
                {/* Rank separator */}
                {isNewRank && (
                  <div className="flex items-center gap-4 my-6">
                    <div className="flex-grow h-px bg-gradient-to-r from-transparent via-red-600/50 to-transparent" />
                    <span className="text-xs font-bold tracking-widest uppercase text-red-400">{user.rank}</span>
                    <div className="flex-grow h-px bg-gradient-to-l from-transparent via-red-600/50 to-transparent" />
                  </div>
                )}

                {/* User card */}
                <div className={`relative rounded-xl p-5 border ${getRankVisualClass(user.rank)}`}>

                  {/* NAME */}
                  <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <LRInsignia rank={user.rank} />
                      <Link to={`/users/${user.user_id}`} className="font-semibold truncate hover:underline">{user.username}</Link>
                    </div>
                  </div>

                  {/* LR STATS (wrap to avoid overflow) */}
                  <div className="flex flex-wrap gap-3 overflow-x-auto text-sm font-semibold">
                    <span className={`px-3 py-1 rounded-full ${getHighlightClass(user.time_guarded, user.division)}`}>
                      Guarded: {user.time_guarded}
                    </span>
                    <span className={`px-3 py-1 rounded-full ${getHighlightClass(user.activity, user.division)}`}>
                      Activity: {user.activity}
                    </span>
                    <span className={`px-3 py-1 rounded-full ${getHighlightClass(user.events_attended, user.division)}`}>
                      Events: {user.events_attended}
                    </span>
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
/* ===============================
   MAIN PAGE WITH TRIANGLE LAYOUT
================================ */
export default function LRs() {
  const [lrs, setLrs] = useState([]);
  const [selectedTables, setSelectedTables] = useState(["SergeantMajors", "PW", "SOR"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      const res = await fetch(`${API_BASE}/public/lr`, { signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setLrs(json);
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
      const t = setTimeout(() => setContentVisible(true), 40);
      return () => clearTimeout(t);
    }
    setContentVisible(false);
  }, [loading]);

  const SergeantMajors = useMemo(
    () => lrs.filter((u) => isSergeantMajor(u.rank)).sort(sortByLRRankStable),
    [lrs]
  );
  const PW = useMemo(
    () => lrs.filter((u) => u.division === "PW" && !isSergeantMajor(u.rank)).sort(sortByLRRankStable),
    [lrs]
  );
  const SOR = useMemo(
    () => lrs.filter((u) => u.division === "SOR" && !isSergeantMajor(u.rank)).sort(sortByLRRankStable),
    [lrs]
  );

  const tableComponents = {
    SergeantMajors: (
      <LRDivisionTable id="table-SergeantMajors" title="Sergeant Majors" data={SergeantMajors} theme="bg-gradient-to-br from-red-800 via-red-900 to-black text-white" />
    ),
    PW: (
      <LRDivisionTable id="table-PW" title="Provost Wing" data={PW} theme="bg-gradient-to-br from-zinc-900 to-black border border-zinc-700" tall />
    ),
    SOR: (
      <LRDivisionTable id="table-SOR" title="Special Operations Regiment" data={SOR} theme="bg-gradient-to-br from-zinc-800 via-zinc-900 to-black border border-zinc-600" tall />
    ),
  };

  const Spinner = ({ className = "w-10 h-10" }) => (
    <div role="status" className={`mx-auto ${className} rounded-full border-4 border-white/20 border-t-white animate-spin`} aria-label="Loading" />
  );

  const toggleTable = (id) => {
    setSelectedTables((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

  /* Layout logic */
  const renderTables = () => {
    if (selectedTables.length === 3) {
      // Triangle layout
      return (
        <>
          {/* Top full-width table */}
          <div className="flex items-start justify-center mb-12">
            <div className="w-full sm:max-w-[720px] lg:max-w-[920px]">{tableComponents[selectedTables[0]]}</div>
          </div>
          {/* Bottom two tables side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {selectedTables.slice(1).map((id) => (
              <div key={id} className="flex items-start justify-center w-full">
                <div className="w-full sm:max-w-[640px] lg:max-w-[720px]">{tableComponents[id]}</div>
              </div>
            ))}
          </div>
        </>
      );
    } else if (selectedTables.length === 2) {
      // Two tables side by side
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {selectedTables.map((id) => (
            <div key={id} className="flex items-start justify-center w-full">
              <div className="w-full sm:max-w-[720px] lg:max-w-[820px]">{tableComponents[id]}</div>
            </div>
          ))}
        </div>
      );
    } else if (selectedTables.length === 1) {
      // Single table centered (top-aligned)
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
      <h1 className="text-5xl font-extrabold text-center mb-8 tracking-widest">Low Ranks</h1>

      {/* Toggle Buttons */}
      <div className="flex justify-center gap-4 mb-12 flex-wrap">
        {["SergeantMajors", "PW", "SOR"].map((id) => (
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
            {id === "SergeantMajors" ? "Sergeant Majors" : id}
          </button>
        ))}
      </div>

      {/* Loading / Error */}
      {loading ? (
        <div className="max-w-7xl mx-auto">
          <div className="h-1 mb-6 rounded overflow-hidden">
            <div className="h-full bg-red-600/60 animate-pulse" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-12 items-end">
            {/* Left skeleton (maps to second table visually) */}
            <div className="flex items-start justify-center">
              <div className="w-full sm:max-w-[640px] lg:max-w-[720px]">
                <LRDivisionTable id={`skeleton-left`} title={selectedTables[1] || "Left"} data={[]} theme="bg-gradient-to-br from-zinc-900 to-black border border-zinc-700" loading={true} />
              </div>
            </div>

            {/* Center skeleton (top) */}
            <div className="flex items-start justify-center">
              <div className="w-full sm:max-w-[720px] lg:max-w-[920px]">
                <LRDivisionTable id={`skeleton-center`} title={selectedTables[0] || "Center"} data={[]} theme="bg-gradient-to-br from-red-800 via-red-900 to-black text-white" loading={true} />
              </div>
            </div>

            {/* Right skeleton (maps to third table visually) */}
            <div className="flex items-start justify-center">
              <div className="w-full sm:max-w-[640px] lg:max-w-[720px]">
                <LRDivisionTable id={`skeleton-right`} title={selectedTables[2] || "Right"} data={[]} theme="bg-gradient-to-br from-zinc-800 via-zinc-900 to-black border border-zinc-600" loading={true} />
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
      ) : lrs.length === 0 ? (
        <div className="text-center py-24">
          <Spinner className="w-12 h-12 mb-4" />
          <div className="italic opacity-70 mb-4">Waiting for LR data…</div>
        </div>
      ) : (
        <div className={`max-w-7xl mx-auto transition-all duration-700 ease-out ${contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>{renderTables()}</div>
      )}
    </div>
  );
}
