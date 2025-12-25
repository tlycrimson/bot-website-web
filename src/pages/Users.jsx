import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "https://bot-website-api.onrender.com";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/public/users`, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setUsers(json);
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message || String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, []);

  const keys = users.length > 0 ? Object.keys(users[0]) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black px-6 py-16 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-extrabold">All Users</h1>
          <Link to="/leaderboard" className="px-3 py-1.5 bg-white/10 text-white rounded-lg text-sm hover:bg-white/20">Back</Link>
        </div>

        {loading ? (
          <div className="text-center py-24">Loading users…</div>
        ) : error ? (
          <div className="text-center py-24 text-red-400">Error loading users: {error}</div>
        ) : users.length === 0 ? (
          <div className="text-center py-24 italic opacity-70">No users returned from API</div>
        ) : (
          <div className="overflow-x-auto rounded-lg bg-zinc-900 p-4">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-zinc-300">
                  {keys.map((k) => (
                    <th key={k} className="px-3 py-2 font-semibold">{k}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.user_id} className="border-t border-zinc-800">
                    {keys.map((k) => (
                      <td key={k} className="px-3 py-2 align-top">
                        {typeof u[k] === 'object' ? JSON.stringify(u[k]) : String(u[k])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
