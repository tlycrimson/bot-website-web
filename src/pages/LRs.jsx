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




/* ===============================
   SORT BY RANK
================================ */
const sortByLRRank = (a, b) =>
  (LR_RANK_PRIORITY[a.rank] ?? 999) -
  (LR_RANK_PRIORITY[b.rank] ?? 999);

  const getRankVisualClass = (rank) => {
  const p = LR_RANK_PRIORITY[rank] ?? 999;

  // Sergeant Majors
  if (p <= 0) {
    return "border-yellow-500/60 bg-gradient-to-r from-yellow-500/10 to-transparent";
  }

  // Senior NCOs
  if (p <= 3) {
    return "border-red-500/40 bg-red-500/5";
  }

  // Standard enlisted
  return "border-white/10 bg-black/30";
};

/* ===============================
   LR TABLE COMPONENT
================================ */
const LRDivisionTable = ({ title, data, theme, tall = false }) => (
  <div
    className={`rounded-2xl p-6 shadow-2xl ${theme} flex flex-col ${
      tall ? "min-h-[650px]" : ""
    }`}
  >
    <h2 className="text-2xl font-extrabold text-center mb-6 tracking-wide">
      {title}
    </h2>

    <div className="space-y-4 overflow-y-auto">
      {data.map((user, index) => {
        const prevRank = data[index - 1]?.rank;
        const isNewRank = index === 0 || prevRank !== user.rank;

        return(
        <div
          key={user.user_id}
          className={`rounded-xl p-4 border ${getRankVisualClass(user.rank)}`}
        >

        {isNewRank && (
          <div className="flex items-center gap-4 my-6">
            <div className="flex-grow h-px bg-gradient-to-r from-transparent via-red-600/40 to-transparent" />
            <span className="text-xs font-bold tracking-widest uppercase text-red-400">
              {user.rank}
            </span>
            <div className="flex-grow h-px bg-gradient-to-l from-transparent via-red-600/40 to-transparent" />
          </div>
        )}

          {/* NAME + RANK */}
          <div className="mb-3">
            <p className="font-semibold text-lg">{user.username}</p>
            <p className="text-sm opacity-70">{user.rank}</p>
          </div>

          {/* LR STATS — ALWAYS SHOWN */}
          <div className="flex flex-nowrap gap-2 overflow-x-auto">
            <span
              className={`px-2 py-0.5 rounded-full text-xs ${getHighlightClass(
                user.time_guarded,
                user.division
              )}`}
            >
              Guarded: {user.time_guarded}
            </span>

            <span
              className={`px-2 py-0.5 rounded-full text-xs ${getHighlightClass(
                user.activity,
                user.division
              )}`}
            >
              Activity: {user.activity}
            </span>

            <span
              className={`px-2 py-0.5 rounded-full text-xs ${getHighlightClass(
                user.events_attended,
                user.division
              )}`}
            >
              Events: {user.events_attended}
            </span>
          </div>
        </div>
      )})}
    </div>
  </div>
);

/* ===============================
   MAIN PAGE
================================ */
export default function LRs() {
  const [lrs, setLrs] = useState([]);

  useEffect(() => {
    fetch("https://bot-website-api.onrender.com/lr")
      .then((res) => res.json())
      .then((data) => setLrs(data));
  }, []);



  /* ===============================
     DIVISION SPLIT + SORT
  ================================ */
  const SergeantMajors = lrs
    .filter(u => isSergeantMajor(u.rank))
    .sort(sortByLRRank);

  const PW = lrs
    .filter(
      u =>
        u.division === "PW" &&
        !isSergeantMajor(u.rank)
    )
    .sort(sortByLRRank);

  const SOR = lrs
    .filter(
      u =>
        u.division === "SOR" &&
        !isSergeantMajor(u.rank)
    )
    .sort(sortByLRRank);


  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black px-6 py-16 text-white">
      <h1 className="text-5xl font-extrabold text-center mb-16 tracking-widest">
        Low Rank Table
      </h1>

      {/* TRIANGLE LAYOUT */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">

          {/* HQ — TOP */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="w-full lg:w-2/3">
              <LRDivisionTable
                title="Sergeant Majors"
                data={SergeantMajors}
                theme="bg-gradient-to-br from-red-800 via-red-900 to-black text-white"
              />
            </div>
          </div>

          {/* PW — LEFT */}
          <div className="lg:col-span-2 flex justify-center">
            <div className="w-full lg:max-w-3xl">
              <LRDivisionTable
                title="Provost Wing"
                data={PW}
                theme="bg-gradient-to-br from-zinc-900 to-black border border-zinc-700"
                tall
              />
            </div>
          </div>


          {/* SOR — RIGHT */}
          <div className="lg:col-span-2 flex justify-center">
            <div className="w-full lg:max-w-3xl">
              <LRDivisionTable
                title="Special Operations Regiment"
                data={SOR}
                theme="bg-gradient-to-br from-zinc-800 via-zinc-900 to-black border border-zinc-600"
                tall
              />
            </div>
          </div>


        </div>
      </div>
    </div>
  );
}
