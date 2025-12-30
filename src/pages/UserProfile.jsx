import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import RobloxAvatar from "../components/hierarchy/RobloxAvatar";

const API_BASE = import.meta.env.VITE_API_BASE || "https://bot-website-api.onrender.com";

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

export default function UserProfile() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [hrRecord, setHrRecord] = useState(null);
  const [lrRecord, setLrRecord] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [usersRes, hrRes, lrRes] = await Promise.all([
          fetch(`${API_BASE}/public/users`, { signal: controller.signal }),
          fetch(`${API_BASE}/public/hr`, { signal: controller.signal }),
          fetch(`${API_BASE}/public/lr`, { signal: controller.signal }),
        ]);

        if (!usersRes.ok || !hrRes.ok || !lrRes.ok) throw new Error("Failed to fetch data");

        const [usersJson, hrJson, lrJson] = await Promise.all([usersRes.json(), hrRes.json(), lrRes.json()]);
        if (cancelled) return;

        // Try to match by numeric id or username
        const numericId = String(id).replace(/[^0-9]/g, '');
        let foundUser = (Array.isArray(usersJson) ? usersJson : []).find(u => String(u.user_id) === id || String(u.user_id) === numericId || (u.username && u.username.toLowerCase() === id.toLowerCase()));
        if (!foundUser) {
          // fallback: try matching by roblox id
          foundUser = (Array.isArray(usersJson) ? usersJson : []).find(u => u.roblox_id && String(u.roblox_id) === id);
        }

        const hr = (Array.isArray(hrJson) ? hrJson : []).find(u => String(u.user_id) === (foundUser?.user_id != null ? String(foundUser.user_id) : id));
        const lr = (Array.isArray(lrJson) ? lrJson : []).find(u => String(u.user_id) === (foundUser?.user_id != null ? String(foundUser.user_id) : id));

        setUser(foundUser || null);
        setHrRecord(hr || null);
        setLrRecord(lr || null);
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message || String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; controller.abort(); };
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black px-6 py-16 text-white">
      <div className="max-w-4xl mx-auto text-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white/20 border-t-white mx-auto mb-4"></div>
        <div>Loading user profile…</div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black px-6 py-16 text-white">
      <div className="max-w-4xl mx-auto text-center py-24 text-red-400">Error loading profile: {error}</div>
    </div>
  );

  if (!user) return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black px-6 py-16 text-white">
      <div className="max-w-4xl mx-auto text-center py-24">No user found for <span className="font-semibold">{id}</span></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black px-6 py-16 text-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-6 mb-6">
          <RobloxAvatar userId={user.roblox_id} username={user.username} size={88} className="flex-shrink-0" />
          <div>
            <h1 className="text-3xl font-extrabold">{user.username} <span className="text-sm text-zinc-400">#{user.user_id}</span></h1>
            <div className="mt-2 text-sm text-zinc-300">{user.xp ?? 0} XP</div>
            <div className="mt-2 flex gap-3">
              <button onClick={() => navigator.clipboard?.writeText(String(user.user_id))} className="px-3 py-1 bg-zinc-800 rounded">Copy ID</button>
              <Link to="/search" className="px-3 py-1 bg-red-600 rounded">Back to search</Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-lg p-4 bg-gradient-to-br from-red-800 via-red-900 to-black border border-red-800">
            <h2 className="text-xl font-bold mb-3">High Rank Record</h2>
            {hrRecord ? (
              <>
                <div className="font-semibold mb-2">Rank: {hrRecord.rank}</div>
                <div className="text-sm text-zinc-300 mb-2">Total: {getHRTotal(hrRecord)} pts</div>
                <div className="grid grid-cols-2 gap-2 text-sm text-zinc-300">
                  {HR_STAT_COLUMNS.map(k => (
                    <div key={k} className="px-2 py-1 bg-black/30 rounded">{k.replace(/_/g,' ')}: {hrRecord[k] ?? 0}</div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-zinc-400">No HR record found.</div>
            )}
          </div>

          <div className="rounded-lg p-4 bg-gradient-to-br from-zinc-900 to-black border border-zinc-700">
            <h2 className="text-xl font-bold mb-3">Low Rank Record</h2>
            {lrRecord ? (
              <>
                <div className="font-semibold mb-2">Rank: {lrRecord.rank}</div>
                <div className="text-sm text-zinc-300 mb-2">Activity: {lrRecord.activity ?? 0} minutes</div>
                <div className="grid grid-cols-1 gap-2 text-sm text-zinc-300">
                  <div className="px-2 py-1 bg-black/30 rounded">Guarded: {lrRecord.time_guarded ?? 0}</div>
                  <div className="px-2 py-1 bg-black/30 rounded">Events: {lrRecord.events_attended ?? 0}</div>
                </div>
              </>
            ) : (
              <div className="text-zinc-400">No LR record found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
