import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "https://bot-website-api.onrender.com";

const getPodiumStyle = (index) => {
  if (index === 0) {
    return `bg-gradient-to-br from-yellow-300/90 via-amber-400/90 to-yellow-500/90 text-black border border-yellow-300 shadow-[0_0_30px_rgba(255,215,0,0.25)]`;
  }
  if (index === 1) {
    return `bg-gradient-to-br from-zinc-200 via-zinc-300 to-zinc-400 text-black border border-zinc-300 shadow-[0_0_25px_rgba(220,220,220,0.25)]`;
  }
  if (index === 2) {
    return `bg-gradient-to-br from-amber-700 via-orange-800 to-amber-900 text-white border border-amber-700 shadow-[0_0_25px_rgba(205,127,50,0.25)]`;
  }
  return `bg-black/40 border-zinc-700 text-white`;
};

const Spinner = ({ className = "w-10 h-10" }) => (
  <div role="status" className={`mx-auto ${className} rounded-full border-4 border-white/20 border-t-white animate-spin`} aria-label="Loading" />
);

export default function XPLeaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      const res = await fetch(`${API_BASE}/public/users`, { signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      // sort by xp desc and remove user_id from displayed data
      const sorted = (Array.isArray(json) ? json : []).slice().sort((a, b) => (b.xp || 0) - (a.xp || 0));
      setUsers(sorted);
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

  const top3 = users.slice(0, 3);
  const rest = users.slice(3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black px-6 py-16 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-extrabold">All Users (XP Leaderboard)</h1>
          <Link to="/leaderboard" className="px-3 py-1.5 bg-white/10 text-white rounded-lg text-sm hover:bg-white/20">Back</Link>
        </div>

        {loading ? (
          <div className="text-center py-24">
            <Spinner className="w-12 h-12 mb-4" />
            <div>Loading users…</div>
          </div>
        ) : error ? (
          <div className="text-center py-24 text-red-400">
            <p className="mb-4">Error loading users: {error}</p>
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
        ) : users.length === 0 ? (
          <div className="text-center py-24">
            <Spinner className="w-12 h-12 mb-4" />
            <div className="italic opacity-70 mb-4">Waiting for users…</div>
          </div>
        ) : (          <>
            {/* Top 3 triangle */}
            <div className="flex flex-col items-center gap-6 mb-8">
              <div className="w-full max-w-4xl grid grid-cols-3 items-end gap-6">
                {/* Left: #2 */}
                <div className="flex justify-center">
                  {top3[1] ? (
                    <div className={`rounded-xl p-4 border shadow-md transition-all duration-700 ease-out w-full max-w-xs ${getPodiumStyle(1)}`} style={{ animationDelay: `180ms` }}>
                      <div className="text-sm opacity-80">#2</div>
                      <div className="font-semibold truncate text-lg">{top3[1].username}</div>
                      <div className="font-bold">{top3[1].xp} XP</div>
                    </div>
                  ) : <div className="w-full max-w-xs" />}
                </div>

                {/* Center: #1 larger */}
                <div className="flex justify-center -mb-6">
                  {top3[0] ? (
                    <div className={`rounded-2xl p-6 border shadow-2xl transition-all duration-700 ease-out w-full max-w-md ${getPodiumStyle(0)}`} style={{ transform: 'translateY(-12px)', animationDelay: `60ms` }}>
                      <div className="text-sm opacity-80">#1</div>
                      <div className="font-extrabold truncate text-2xl">{top3[0].username}</div>
                      <div className="font-bold text-lg">{top3[0].xp} XP</div>
                    </div>
                  ) : <div className="w-full max-w-md" />}
                </div>

                {/* Right: #3 */}
                <div className="flex justify-center">
                  {top3[2] ? (
                    <div className={`rounded-xl p-4 border shadow-md transition-all duration-700 ease-out w-full max-w-xs ${getPodiumStyle(2)}`} style={{ animationDelay: `240ms` }}>
                      <div className="text-sm opacity-80">#3</div>
                      <div className="font-semibold truncate text-lg">{top3[2].username}</div>
                      <div className="font-bold">{top3[2].xp} XP</div>
                    </div>
                  ) : <div className="w-full max-w-xs" />}
                </div>
              </div>
            </div>

            {/* Remaining users table (exclude user_id column), starting at #4 */}
            <div className="overflow-x-auto rounded-lg bg-zinc-900 p-4">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-zinc-300">
                    <th className="px-3 py-2 font-semibold">Rank</th>
                    <th className="px-3 py-2 font-semibold">Username</th>
                    <th className="px-3 py-2 font-semibold">XP</th>
                  </tr>
                </thead>
                <tbody>
                  {rest.map((u, j) => (
                    <tr key={u.user_id} className="border-t border-zinc-800">
                      <td className="px-3 py-2 align-top">#{j + 4}</td>
                      <td className="px-3 py-2 align-top">{u.username}</td>
                      <td className="px-3 py-2 align-top font-bold">{u.xp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
