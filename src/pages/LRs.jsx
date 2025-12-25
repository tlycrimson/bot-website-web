import { useEffect, useState } from "react";

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

/* ===============================
   DIVISION TABLE (CARD) WITH RANK SEPARATORS
================================ */
const LRDivisionTable = ({ title, data, theme, tall = false }) => (
  <div className={`rounded-2xl p-6 shadow-2xl ${theme} flex flex-col ${tall ? "min-h-[650px]" : ""}`}>
    <h2 className="text-2xl font-extrabold text-center mb-6 tracking-wide">{title}</h2>

    <div className="space-y-4 overflow-y-auto">
      {data.map((user, index) => {
        const prevRank = data[index - 1]?.rank;
        const isNewRank = index === 0 || prevRank !== user.rank;

        return (
          <div key={user.user_id}>
            {/* Rank separator */}
            {isNewRank && (
              <div className="flex items-center gap-4 my-6">
                <div className="flex-grow h-px bg-gradient-to-r from-transparent via-red-600/50 to-transparent" />
                <span className="text-xs font-bold tracking-widest uppercase text-red-400">
                  {user.rank}
                </span>
                <div className="flex-grow h-px bg-gradient-to-l from-transparent via-red-600/50 to-transparent" />
              </div>
            )}

            {/* User card */}
            <div className={`rounded-xl p-5 border ${getRankVisualClass(user.rank)}`}>
              {/* NAME + RANK */}
              <div className="mb-4">
                <p className="font-semibold text-lg">{user.username}</p>
                <p className="text-sm opacity-80">{user.rank}</p>
              </div>

              {/* LR STATS */}
              <div className="flex flex-nowrap gap-3 overflow-x-auto">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getHighlightClass(user.time_guarded, user.division)}`}>
                  Guarded: {user.time_guarded}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getHighlightClass(user.activity, user.division)}`}>
                  Activity: {user.activity}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getHighlightClass(user.events_attended, user.division)}`}>
                  Events: {user.events_attended}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

/* ===============================
   MAIN PAGE WITH TRIANGLE LAYOUT
================================ */
export default function LRs() {
  const [lrs, setLrs] = useState([]);
  const [selectedTables, setSelectedTables] = useState(["SergeantMajors", "PW", "SOR"]);

  useEffect(() => {
    fetch("https://bot-website-api.onrender.com/public/lr")
      .then((res) => res.json())
      .then(setLrs);
  }, []);

  const SergeantMajors = lrs.filter((u) => isSergeantMajor(u.rank)).sort(sortByLRRank);
  const PW = lrs.filter((u) => u.division === "PW" && !isSergeantMajor(u.rank)).sort(sortByLRRank);
  const SOR = lrs.filter((u) => u.division === "SOR" && !isSergeantMajor(u.rank)).sort(sortByLRRank);

  const tableComponents = {
    SergeantMajors: <LRDivisionTable title="Sergeant Majors" data={SergeantMajors} theme="bg-gradient-to-br from-red-800 via-red-900 to-black text-white" />,
    PW: <LRDivisionTable title="Provost Wing" data={PW} theme="bg-gradient-to-br from-zinc-900 to-black border border-zinc-700" tall />,
    SOR: <LRDivisionTable title="Special Operations Regiment" data={SOR} theme="bg-gradient-to-br from-zinc-800 via-zinc-900 to-black border border-zinc-600" tall />,
  };

  const toggleTable = (id) => {
    if (selectedTables.includes(id)) {
      setSelectedTables(selectedTables.filter((t) => t !== id));
    } else {
      setSelectedTables([...selectedTables, id]);
    }
  };

  /* Layout logic */
  const renderTables = () => {
    if (selectedTables.length === 3) {
      // Triangle layout
      return (
        <>
          {/* Top full-width table */}
          <div className="flex justify-center mb-12">
            <div className="w-full lg:w-2/3">{tableComponents[selectedTables[0]]}</div>
          </div>
          {/* Bottom two tables side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {selectedTables.slice(1).map((id) => (
              <div key={id} className="flex justify-center">
                <div className="w-full lg:w-full">{tableComponents[id]}</div>
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
            <div key={id} className="flex justify-center">
              <div className="w-full lg:w-full">{tableComponents[id]}</div>
            </div>
          ))}
        </div>
      );
    } else if (selectedTables.length === 1) {
      // Single table centered
      return (
        <div className="flex justify-center">
          <div className="w-full lg:w-2/3">{tableComponents[selectedTables[0]]}</div>
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

      {/* Render tables */}
      <div className="max-w-7xl mx-auto">{renderTables()}</div>
    </div>
  );
}
