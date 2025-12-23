import { useEffect, useState } from "react";

/* =========================
   RANK ORDER (AUTHORITATIVE)
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
   RANK STAT RULES
   ========================= */

const RANK_STAT_RULES = {
  FULL: [
    "tryouts",
    "events",
    "phases",
    "courses",
    "inspections",
    "joint_events"
  ],

  MID: [
    "tryouts",
    "events",
    "phases",
    "courses"
  ],

  LOW: [
    "tryouts",
    "events",
    "phases"
  ]
};

const STAT_LABELS = {
  tryouts: "Tryouts",
  events: "Events",
  phases: "Phases",
  courses: "Logistics",
  inspections: "Inspections",
  joint_events: "Joint Events"
};

const statClass = (value) =>
  value > 0
    ? "bg-red-600/20 text-red-300 border border-red-500/40"
    : "bg-white/10 text-zinc-300";


const getStatRuleForRank = (rank) => {
  const p = RANK_PRIORITY[rank] ?? 999;

  // Provost Marshal → Executives
  if (p <= RANK_PRIORITY["PW Executive"]) return "FULL";

  // Squadron Commander → Superintendent
  if (p <= RANK_PRIORITY["Superintendent"]) return "MID";

  // Everyone else
  return "LOW";
};

/* =========================
   RANK INSIGNIA
   ========================= */
const getInsignia = (rank) => {
  const p = RANK_PRIORITY[rank] ?? 999;

  if (p <= RANK_PRIORITY["PW Executive"]) {
    return { symbol: "★★★", color: "text-yellow-400" };
  }

  if (p <= RANK_PRIORITY["Superintendent"]) {
    return { symbol: "★★", color: "text-red-400" };
  }

  if (p <= RANK_PRIORITY["Company Sergeant Major"]) {
    return { symbol: "★", color: "text-zinc-300" };
  }

  if (rank === "Tactical Leader" || rank === "Staff Sergeant") {
    return { symbol: "▮▮", color: "text-zinc-400" };
  }

  if (rank === "Operator" || rank === "Constable") {
    return { symbol: "▮", color: "text-zinc-500" };
  }

  return { symbol: "◦", color: "text-zinc-600" };
};

const RankInsignia = ({ rank }) => {
  const { symbol, color } = getInsignia(rank);

  return (
    <span
      className={`font-bold tracking-widest ${color}`}
      title={rank}
    >
      {symbol}
    </span>
  );
};

   
/* =========================
   BADGE STYLING
   ========================= */

const getBadgeStyle = (rank) => {
  const p = RANK_PRIORITY[rank] ?? 999;

  if (p <= 4) return "bg-yellow-400 text-black";      // Command
  if (p <= 10) return "bg-red-600 text-white";        // Officers
  if (p <= 18) return "bg-zinc-300 text-black";       // NCOs
  return "bg-zinc-700 text-zinc-200";                 // Enlisted
};

const RankBadge = ({ rank }) => (
  <span
    className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${getBadgeStyle(rank)}`}
  >
    {rank}
  </span>
);

/* =========================
   DIVISION TABLE (CARD)
   ========================= */

const DivisionTable = ({ title, data, theme, tall = false }) => (
  <div
    className={`rounded-2xl p-6 shadow-2xl ${theme} flex flex-col ${
        tall ? "min-h-[700px]" : ""
    }`}
  >
    {/* Title */}
    <h2 className="text-2xl font-extrabold mb-8 tracking-wider text-center">
      {title}
    </h2>

    {/* Scrollable content */}
    <div className="space-y-3 overflow-y-auto pr-2">
      {data.length === 0 && (
        <p className="italic opacity-70 text-center">
          No personnel assigned
        </p>
      )}

      {data.map(user => (
        <div
          key={user.user_id}
          className="bg-black/30 backdrop-blur rounded-xl px-4 py-3"
        >
          {/* Top row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <RankInsignia rank={user.rank} />
              <span className="font-semibold truncate">
                {user.username}
              </span>
            </div>

            <RankBadge rank={user.rank} />
          </div>

          {/* Stats (RANK-BASED + HIGHLIGHTED) */}
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {Object.entries(user)
              .filter(([key]) => {
                if (
                  ["user_id", "username", "rank", "division"].includes(key)
                ) {
                  return false;
                }

                const rule = getStatRuleForRank(user.rank);
                return RANK_STAT_RULES[rule].includes(key);
              })
              .map(([key, value]) => (
                <span
                  key={key}
                  className={`px-3 py-1 rounded-full ${getHighlightClass(value, user.division)}`}
                >
                  {(STAT_LABELS[key] ?? key.replace(/_/g, " "))}: {value}
                </span>
              ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);


const getHighlightClass = (value, division) => {
  if (value <= 0) {
    return "bg-white/10 text-zinc-300";
  }

  if (division === "PW") {
    return "bg-black/40 text-zinc-200 border border-black/60";
  }

  if (division === "HQ") {
    return "bg-red-900/50 text-red-200 border border-red-800/60";
  }

  // Default (SOR)
  return "bg-red-600/20 text-red-300 border border-red-500/40";
};


/* =========================
   MAIN PAGE
   ========================= */

export default function HR() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("https://bot-website-api.onrender.com/hr")
      .then(res => res.json())
      .then(setData);
  }, []);

  const HQ = data
    .filter(u => u.division === "HQ")
    .sort(sortByRank);

  const PW = data
    .filter(u => u.division === "PW")
    .sort(sortByRank);

  const SOR = data
    .filter(u => u.division === "SOR")
    .sort(sortByRank);



  return (
  <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black px-6 py-16 text-white">
    <h1 className="text-5xl font-extrabold text-center mb-16 tracking-widest">
      High Rank Table
    </h1>

    {/* TRIANGLE STRUCTURE */}
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* HQ — TOP CENTER (AUTO HEIGHT) */}
        <div className="lg:col-span-4 flex justify-center">
        <div className="w-full lg:w-2/3">
            <DivisionTable
            title="Headquarters"
            data={HQ}
            theme="bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600 text-black"
            tall={false}
            />
        </div>
        </div>

        {/* PW — BOTTOM LEFT (TALL) */}
        <div className="lg:col-span-2">
        <DivisionTable
            title="Provost Wing"
            data={PW}
            theme="bg-gradient-to-br from-red-700 via-red-800 to-red-900"
            tall
        />
        </div>

        {/* SOR — BOTTOM RIGHT (TALL) */}
        <div className="lg:col-span-2">
        <DivisionTable
            title="Special Operations Regiment"
            data={SOR}
            theme="bg-gradient-to-br from-zinc-800 via-zinc-900 to-black border border-zinc-600"
            tall
        />
        </div>

      </div>
    </div>
  </div>
);
}
