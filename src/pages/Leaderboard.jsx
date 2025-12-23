import { useEffect, useState } from "react";

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
  useEffect(() => {
    fetch("https://bot-website-api.onrender.com/leaderboard")
      .then((res) => res.json())
      .then(setXpUsers);

    fetch("https://bot-website-api.onrender.com/hr")
      .then((res) => res.json())
      .then(setHrs);

    fetch("https://bot-website-api.onrender.com/lr")
      .then((res) => res.json())
      .then(setLrs);
  }, []);

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

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">

        {/* ================= XP LEADERBOARD ================= */}
        <div className="bg-zinc-900 rounded-2xl p-6 shadow-2xl border border-red-800">
          <h2 className="text-2xl font-extrabold text-center mb-6">
            🏆 XP Leaderboard
          </h2>

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
                    ? `${u.activity || 0} activity`
                    : `${u.events_attended || 0} events`}
                </span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}
