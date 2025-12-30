import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "https://bot-website-api.onrender.com";

const Spinner = ({ className = "w-8 h-8" }) => (
  <div role="status" className={`mx-auto ${className} rounded-full border-4 border-white/20 border-t-white animate-spin`} aria-label="Loading" />
);

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

export default function Search() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState({ users: [], hrs: [], lrs: [] });
  const controllerRef = useRef(null);

  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
    };
  }, []);

  // Debounce search input for better UX
  useEffect(() => {
    const t = setTimeout(() => {
      if (query.trim()) doSearch(query);
      else setResults({ users: [], hrs: [], lrs: [] });
    }, 450);
    return () => clearTimeout(t);
  }, [query]);

  const scoreRecord = (u, q, qLower, isNumeric, type) => {
    let score = 0;
    if (!u) return 0;

    // Exact ID match
    if (isNumeric && u.user_id && String(u.user_id) === q) score += 200;
    if (u.roblox_id && String(u.roblox_id) === q) score += 150;

    // Username scoring
    if (u.username) {
      const name = u.username.toLowerCase();
      if (name === qLower) score += 120;
      else if (name.startsWith(qLower)) score += 80;
      else if (name.includes(qLower)) score += 40;
    }

    // Rank / army_rank / other fields
    if (u.rank && typeof u.rank === 'string' && u.rank.toLowerCase().includes(qLower)) score += 30;
    if (u.army_rank && typeof u.army_rank === 'string' && u.army_rank.toLowerCase().includes(qLower)) score += 20;

    // Type bias (prefer direct users over HR/LR records for identical names)
    if (type === 'users') score += 5;

    // Slight tiebreakers
    if (u.xp) score += Math.min(30, Math.floor(Number(u.xp) / 1000));
    if (u.activity) score += Math.min(20, Math.floor(Number(u.activity) / 60));

    return score;
  };

  const highlightText = (text = '', q = '') => {
    if (!q) return text;
    const i = text.toLowerCase().indexOf(q.toLowerCase());
    if (i === -1) return text;
    const before = text.slice(0, i);
    const match = text.slice(i, i + q.length);
    const after = text.slice(i + q.length);
    return (
      <span>
        {before}
        <mark className="bg-red-600/30 text-white px-1 rounded">{match}</mark>
        {after}
      </span>
    );
  };

  const doSearch = async (q) => {
    const trimmed = (q || "").trim();
    if (!trimmed) {
      setResults({ users: [], hrs: [], lrs: [] });
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      const [usersRes, hrRes, lrRes] = await Promise.all([
        fetch(`${API_BASE}/public/users`, { signal: controller.signal }),
        fetch(`${API_BASE}/public/hr`, { signal: controller.signal }),
        fetch(`${API_BASE}/public/lr`, { signal: controller.signal }),
      ]);

      if (!usersRes.ok || !hrRes.ok || !lrRes.ok) throw new Error('Failed to fetch data');

      const [usersJson, hrJson, lrJson] = await Promise.all([usersRes.json(), hrRes.json(), lrRes.json()]);

      const qLower = trimmed.toLowerCase();
      const isNumeric = /^[0-9]+$/.test(trimmed);

      const usersList = (Array.isArray(usersJson) ? usersJson : []).map(u => ({ _raw: u, score: scoreRecord(u, trimmed, qLower, isNumeric, 'users') })).filter(x => x.score > 0).sort((a,b) => b.score - a.score);
      const hrList = (Array.isArray(hrJson) ? hrJson : []).map(u => ({ _raw: u, score: scoreRecord(u, trimmed, qLower, isNumeric, 'hrs') })).filter(x => x.score > 0).sort((a,b) => b.score - a.score);
      const lrList = (Array.isArray(lrJson) ? lrJson : []).map(u => ({ _raw: u, score: scoreRecord(u, trimmed, qLower, isNumeric, 'lrs') })).filter(x => x.score > 0).sort((a,b) => b.score - a.score);

      setResults({ users: usersList.map(x => x._raw), hrs: hrList.map(x => x._raw), lrs: lrList.map(x => x._raw) });
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error(err);
        setError(err.message || "Search failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e) => {
    e?.preventDefault();
    doSearch(query);
  };

  const handleCopyId = async (id) => {
    try {
      await navigator.clipboard.writeText(String(id));
      setNoticeTemp('Copied ID to clipboard');
    } catch (e) {
      console.error('copy failed', e);
    }
  };

  const [noticeTemp, setNoticeTemp] = useState(null);
  useEffect(() => {
    if (!noticeTemp) return;
    const id = setTimeout(() => setNoticeTemp(null), 2000);
    return () => clearTimeout(id);
  }, [noticeTemp]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black px-6 py-16 text-white">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-6">User Search</h1>
        <form onSubmit={onSubmit} className="flex gap-3 mb-6">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by username or user ID"
            className="flex-1 px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label="Search by username or user ID"
          />
          <button className="px-4 py-3 bg-red-600 rounded-lg font-semibold hover:bg-red-700" onClick={onSubmit}>
            Search
          </button>
        </form>

        <div className="mb-6">
          <div className="sr-only" aria-live="polite">{loading ? 'Searching…' : `${results.users.length} user matches, ${results.hrs.length} HR matches, ${results.lrs.length} LR matches`}</div>

          {loading && (
            <div className="text-center py-6">
              <Spinner className="w-10 h-10 mb-4" />
              <div>Searching…</div>
            </div>
          )}

          {error && (
            <div className="text-center text-red-400 py-4">Error: {error}</div>
          )}

          {!loading && !error && results.users.length === 0 && results.hrs.length === 0 && results.lrs.length === 0 && (
            <div className="text-center text-zinc-400 py-8">No results. Try a username, rank, or user ID.</div>
          )}

          {noticeTemp && (
            <div className="text-center text-emerald-400 py-2">{noticeTemp}</div>
          )}
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-lg font-bold mb-2">Users ({results.users.length})</h3>
            <div className="space-y-4">
              {results.users.map(u => (
                <div key={u.user_id} className="rounded-lg p-4 bg-zinc-900 border border-zinc-800">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-semibold"><Link to={`/users/${u.user_id}`} className="hover:underline">{u.username}</Link> <span className="text-sm ml-2 text-zinc-400">#{u.user_id}</span></div>
                      <div className="text-sm text-zinc-400">{u.xp ?? 0} XP</div>
                      <div className="mt-2">
                        <Link to={`/users/${u.user_id}`} className="px-3 py-1 bg-red-600 rounded text-sm">View profile</Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-1 md:col-span-1">
            <h3 className="text-lg font-bold mb-2">High Rank Records ({results.hrs.length})</h3>
            <div className="space-y-4">
              {results.hrs.map(u => (
                <div key={u.user_id} className="rounded-lg p-4 bg-gradient-to-br from-red-800 via-red-900 to-black border border-red-800">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-semibold"><Link to={`/users/${u.user_id}`} className="hover:underline">{u.username}</Link> <span className="text-sm ml-2 text-zinc-200">#{u.user_id}</span></div>
                      <div className="text-sm text-zinc-200">Total: {getHRTotal(u)} pts</div>
                    </div>
                    <div className="text-sm text-zinc-200">Rank: {u.rank}</div>
                  </div>

                  <div className="mt-2 text-sm text-zinc-300 grid grid-cols-2 gap-2">
                    {HR_STAT_COLUMNS.map(k => (
                      <div key={k} className="px-2 py-1 bg-black/30 rounded">{k.replace(/_/g, ' ')}: {u[k] ?? 0}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-1 md:col-span-1">
            <h3 className="text-lg font-bold mb-2">Low Rank Records ({results.lrs.length})</h3>
            <div className="space-y-4">
              {results.lrs.map(u => (
                <div key={u.user_id} className="rounded-lg p-4 bg-gradient-to-br from-zinc-900 to-black border border-zinc-700">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-semibold"><Link to={`/users/${u.user_id}`} className="hover:underline">{u.username}</Link> <span className="text-sm ml-2 text-zinc-400">#{u.user_id}</span></div>
                      <div className="text-sm text-zinc-400">Activity: {u.activity ?? 0} minutes</div>
                    </div>
                    <div className="text-sm text-zinc-400">Rank: {u.rank}</div>
                  </div>

                  <div className="mt-2 text-sm text-zinc-300 grid grid-cols-2 gap-2">
                    <div className="px-2 py-1 bg-black/30 rounded">Guarded: {u.time_guarded ?? 0}</div>
                    <div className="px-2 py-1 bg-black/30 rounded">Events: {u.events_attended ?? 0}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
