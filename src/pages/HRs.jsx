import { useEffect, useState } from "react";

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
const DivisionTable = ({ title, data, theme, tall = false }) => (
  <div className={`rounded-2xl p-6 shadow-2xl ${theme} flex flex-col ${tall ? "min-h-[650px]" : ""}`}>
    <h2 className="text-2xl font-extrabold text-center mb-6 tracking-wide">{title}</h2>
    <div className="space-y-4 overflow-y-auto">
      {data.length === 0 && <p className="italic opacity-70 text-center">No personnel assigned</p>}
      {data.map((user, index) => {
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
                className={`flex ${isHiComRank(user.rank) ? "flex-wrap gap-3" : "flex-nowrap gap-3"} overflow-x-auto text-sm font-semibold`}
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
      })}
    </div>
  </div>
);

/* =========================
   MAIN HR PAGE WITH TRIANGLE LAYOUT & TABLE TOGGLE
========================= */
export default function HR() {
  const [data, setData] = useState([]);
  const [selectedTables, setSelectedTables] = useState(["HQ", "PW", "SOR"]);

  useEffect(() => {
    fetch("https://bot-website-api.onrender.com/hr")
      .then(res => res.json())
      .then(setData);
  }, []);

  // Define PW and SOR ranks explicitly to preserve correct order
  const PW_RANKS = [
    "PW Executive",
    "PW Commander",
    "Lieutenant Colonel",
    "Major",
    "Superintendent",
    "Inspector",
    "Company Sergeant Major"
  ];

  const SOR_RANKS = [
    "SOR Executive",
    "SOR Commander",
    "Squadron Executive Officer",
    "Tactical Officer",
    "Operations Officer",
    "Regimental Sergeant Major"
  ];

  const HQ = data.filter(u => u.division === "HQ").sort(sortByRank); // Only Provost Marshal
  const PW = data.filter(u => u.division === "PW" && PW_RANKS.includes(u.rank)).sort(sortByRank);
  const SOR = data.filter(u => u.division === "SOR" && SOR_RANKS.includes(u.rank)).sort(sortByRank);

  const tableComponents = {
    HQ: <DivisionTable title="Headquarters" data={HQ} theme="bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600 text-black" />,
    PW: <DivisionTable title="Provost Wing" data={PW} theme="bg-gradient-to-br from-red-700 via-red-800 to-red-900 text-white" tall />,
    SOR: <DivisionTable title="Special Operations Regiment" data={SOR} theme="bg-gradient-to-br from-zinc-800 via-zinc-900 to-black border border-zinc-600 text-white" tall />,
  };

  const toggleTable = (id) => {
    if (selectedTables.includes(id)) setSelectedTables(selectedTables.filter(t => t !== id));
    else setSelectedTables([...selectedTables, id]);
  };

  const renderTables = () => {
    if (selectedTables.length === 3) {
      return (
        <>
          <div className="flex justify-center mb-12">
            <div className="w-full lg:w-2/3">{tableComponents[selectedTables[0]]}</div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {selectedTables.slice(1).map(id => (
              <div key={id} className="flex justify-center w-full">{tableComponents[id]}</div>
            ))}
          </div>
        </>
      );
    } else if (selectedTables.length === 2) {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {selectedTables.map(id => (
            <div key={id} className="flex justify-center w-full">{tableComponents[id]}</div>
          ))}
        </div>
      );
    } else if (selectedTables.length === 1) {
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
      <h1 className="text-5xl md:text-6xl font-extrabold text-center mb-8 tracking-tight text-white-600">
          High Ranks
        </h1>
      


      {/* Toggle Buttons */}
      <div className="flex justify-center gap-4 mb-12 flex-wrap">
        {["HQ", "PW", "SOR"].map(id => (
          <button
            key={id}
            onClick={() => toggleTable(id)}
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

      {/* Render tables */}
      <div className="max-w-7xl mx-auto">{renderTables()}</div>
    </div>
  );
}
