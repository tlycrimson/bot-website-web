import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
const API_BASE = import.meta.env.VITE_API_BASE || "https://bot-website-api.onrender.com";

/* =====================
   PODIUM STYLING
===================== */
const getPodiumStyle = (index) => {
  if (index === 0) {
    // Gold
    return `
      bg-gradient-to-br from-yellow-300/90 via-amber-400/90 to-yellow-500/90
      text-black border border-yellow-300
      shadow-[0_0_30px_rgba(255,215,0,0.25)]
    `;
  }

  if (index === 1) {
    // Silver
    return `
      bg-gradient-to-br from-zinc-200 via-zinc-300 to-zinc-400
      text-black border border-zinc-300
      shadow-[0_0_25px_rgba(220,220,220,0.25)]
    `;
  }

  if (index === 2) {
    // Bronze
    return `
      bg-gradient-to-br from-amber-700 via-orange-800 to-amber-900
      text-white border border-amber-700
      shadow-[0_0_25px_rgba(205,127,50,0.25)]
    `;
  }

  return "bg-black/40 border-zinc-700 text-white";
};

/* =====================
   HR TOTAL CALCULATION
===================== */
const HR_STAT_COLUMNS = [
  "tryouts",
  "events",
  "phases",
  "courses",
  "inspections",
  "joint_events",
];

const getHRTotal = (user) =>
  HR_STAT_COLUMNS.reduce(
    (sum, key) => sum + (Number(user[key]) || 0),
    0
  );

export default function Leaderboard() {
  const [xpUsers, setXpUsers] = useState([]);
  const [hrs, setHrs] = useState([]);
  const [lrs, setLrs] = useState([]);
  const [lrSort, setLrSort] = useState("activity");

  /* =====================
     FETCH DATA
  ===================== */
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

  const Spinner = ({ className = "w-10 h-10" }) => (
    <div role="status" className={`mx-auto ${className} rounded-full border-4 border-white/20 border-t-white animate-spin`} aria-label="Loading" />
  );

  const fetchData = async (signal) => {
    setLoading(true);
    setError(null);
    try {
      const [xpRes, hrRes, lrRes] = await Promise.all([
        fetch(`${API_BASE}/public/leaderboard`, { signal }),
        fetch(`${API_BASE}/public/hr`, { signal }),
        fetch(`${API_BASE}/public/lr`, { signal })
      ]);

      if (!xpRes.ok || !hrRes.ok || !lrRes.ok) throw new Error('Failed to fetch one or more leaderboard endpoints');

      const [xpJson, hrJson, lrJson] = await Promise.all([xpRes.json(), hrRes.json(), lrRes.json()]);

      setXpUsers(xpJson || []);
      setHrs(hrJson || []);
      setLrs(lrJson || []);
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

  // Fade-in when data first arrives
  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setContentVisible(true), 40);
      return () => clearTimeout(t);
    }
    setContentVisible(false);
  }, [loading]);

  /* =====================
     DERIVED LEADERBOARDS
  ===================== */
  const xpLeaderboard = [...xpUsers].slice(0, 10);

  const hrLeaderboard = [...hrs]
    .map((u) => ({ ...u, total: getHRTotal(u) }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  const lrLeaderboard = [...lrs]
    .sort((a, b) =>
      lrSort === "activity"
        ? (b.activity || 0) - (a.activity || 0)
        : (b.events_attended || 0) - (a.events_attended || 0)
    )
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black px-6 py-16 text-white">
      <h1 className="text-5xl font-extrabold text-center mb-16 tracking-widest">
        Leaderboards
      </h1>

      {loading && (
        <div className="text-center py-24">
          <Spinner className="w-12 h-12 mb-4" />
          <div>Loading leaderboards…</div>
        </div>
      )}

      {error && (
        <div className="text-center py-24 text-red-400">
          <p className="mb-4">Error loading leaderboards: {error}</p>
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
      )}

      {!loading && !error && (xpUsers.length + hrs.length + lrs.length === 0) && (
        <div className="text-center py-24">
          <Spinner className="w-12 h-12 mb-4" />
          <div className="italic opacity-70 mb-4">Waiting for leaderboard data…</div>
        </div>
      )}

      {!loading && !error && (xpUsers.length + hrs.length + lrs.length > 0) && (
        <div className={`max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 transition-all duration-700 ease-out ${contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>

        {/* ================= XP LEADERBOARD ================= */}
        <div className="bg-zinc-900 rounded-2xl p-6 shadow-2xl border border-red-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-extrabold">🏆 XP Leaderboard</h2>
            <Link
              to="/users"
              className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition"
              aria-label="View all users"
            >
              View all users
            </Link>
          </div>

          <ul className="space-y-4">
            {xpLeaderboard.map((u, i) => (
              <li
                key={u.user_id}
                className={`
                  flex justify-between items-center px-4 py-4 rounded-xl border shadow-md
                  transition-all duration-700 ease-out
                  ${getPodiumStyle(i)}
                  ${i < 3 ? "animate-podium" : ""}
                `}
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <span className="font-semibold">
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}{" "}
                  {u.username}
                </span>
                <span className="font-bold">
                  {u.xp} XP
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* ================= HR LEADERBOARD ================= */}
        <div className="bg-gradient-to-br from-red-800 via-red-900 to-black rounded-2xl p-6 shadow-2xl">
          <h2 className="text-2xl font-extrabold text-center mb-6">
            🎖️ High Rank Contribution
          </h2>

          <ul className="space-y-4">
            {hrLeaderboard.map((u, i) => (
              <li
                key={u.user_id}
                className={`
                  flex justify-between items-center px-4 py-4 rounded-xl border shadow-md
                  transition-all duration-700 ease-out
                  ${getPodiumStyle(i)}
                  ${i < 3 ? "animate-podium" : ""}
                `}
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <span className="font-semibold">
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}{" "}
                  {u.username}
                </span>
                <span className="font-bold">
                  {u.total} pts
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* ================= LR LEADERBOARD ================= */}
        <div className="bg-zinc-900 rounded-2xl p-6 shadow-2xl border border-zinc-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-extrabold">
              📊 Low Rank Performance
            </h2>

            <select
              value={lrSort}
              onChange={(e) => setLrSort(e.target.value)}
              className="
                bg-black/60 text-white border border-zinc-600
                rounded-lg px-3 py-1.5 text-sm
                focus:outline-none focus:ring-2 focus:ring-red-500
                hover:border-red-500 transition
              "
            >
              <option value="activity">Activity</option>
              <option value="events">Events</option>
            </select>
          </div>

          <ul className="space-y-4">
            {lrLeaderboard.map((u, i) => (
              <li
                key={u.user_id}
                className={`
                  flex justify-between items-center px-4 py-4 rounded-xl border shadow-md
                  transition-all duration-700 ease-out
                  ${getPodiumStyle(i)}
                  ${i < 3 ? "animate-podium" : ""}
                `}
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <span className="font-semibold">
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}{" "}
                  {u.username}
                </span>
                <span className="font-bold">
                  {lrSort === "activity"
                    ? `${u.activity || 0} minutes`
                    : `${u.events_attended || 0} events`}
                </span>
              </li>
            ))}
          </ul>
        </div>

      </div>
      )}
    </div>
  );
}
