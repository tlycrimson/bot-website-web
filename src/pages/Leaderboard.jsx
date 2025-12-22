import { useEffect, useState } from "react";

export default function Leaderboard() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("https://bot-website-api.onrender.com/leaderboard")
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-red-900 flex items-center justify-center px-4">
      <div className="bg-zinc-900 text-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-red-800">


        <h1 className="text-3xl font-extrabold text-center mb-6">
          🏆 XP Leaderboard
        </h1>

        <ul className="space-y-3">
          {users.map((u, i) => (
            <li
              key={u.user_id}
              className={`flex justify-between items-center px-4 py-3 rounded-xl border ${
                i === 0
                  ? "bg-red-900 border-red-500"
                  : i === 1
                  ? "bg-zinc-800 border-zinc-700"
                  : i === 2
                  ? "bg-zinc-800 border-zinc-700"
                  : "bg-zinc-900 border-zinc-800"
              }`}
            >
              <span className="font-semibold">
                #{i + 1} {u.username}
              </span>
              <span className="font-bold text-red-400"> 
                {u.xp} XP
              </span>
            </li>
          ))}
        </ul>

      </div>
    </div>
  );
}
