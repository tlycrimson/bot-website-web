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

/* ===============================
   SORT BY RANK
================================ */
const sortByLRRank = (a, b) =>
  LR_RANK_ORDER.indexOf(a.rank) - LR_RANK_ORDER.indexOf(b.rank);

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
      {data.map((user) => (
        <div
          key={user.user_id}
          className="bg-black/30 rounded-xl p-4 border border-white/10"
        >
          {/* NAME + RANK */}
          <div className="mb-3">
            <p className="font-semibold text-lg">{user.username}</p>
            <p className="text-sm opacity-70">{user.rank}</p>
          </div>

          {/* LR STATS — ALWAYS SHOWN */}
          <div className="flex flex-wrap gap-2">
            <span
              className={`px-3 py-1 rounded-full text-sm ${getHighlightClass(
                user.time_guarded,
                user.division
              )}`}
            >
              Guarded: {user.time_guarded}
            </span>

            <span
              className={`px-3 py-1 rounded-full text-sm ${getHighlightClass(
                user.activity,
                user.division
              )}`}
            >
              Activity: {user.activity}
            </span>

            <span
              className={`px-3 py-1 rounded-full text-sm ${getHighlightClass(
                user.events_attended,
                user.division
              )}`}
            >
              Events: {user.events_attended}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ===============================
   MAIN PAGE
================================ */
export default function LRs() {
  const [lrs, setLrs] = useState([]);

  useEffect(() => {
    fetch("https://bot-website-api.onrender.com/lrs")
      .then((res) => res.json())
      .then((data) => setLrs(data));
  }, []);

  /* ===============================
     DIVISION SPLIT + SORT
  ================================ */
  const HQ = lrs
    .filter((u) => u.division === "HQ")
    .sort(sortByLRRank);

  const PW = lrs
    .filter((u) => u.division === "PW")
    .sort(sortByLRRank);

  const SOR = lrs
    .filter((u) => u.division === "SOR")
    .sort(sortByLRRank);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black px-6 py-16 text-white">
      <h1 className="text-5xl font-extrabold text-center mb-16 tracking-widest">
        Low Ranks
      </h1>

      {/* TRIANGLE LAYOUT */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">

          {/* HQ — TOP */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="w-full lg:w-2/3">
              <LRDivisionTable
                title="Headquarters"
                data={HQ}
                theme="bg-gradient-to-br from-red-800 via-red-900 to-black text-white"
              />
            </div>
          </div>

          {/* PW — LEFT */}
          <div className="lg:col-span-2">
            <LRDivisionTable
              title="Provost Wing"
              data={PW}
              theme="bg-gradient-to-br from-zinc-900 to-black border border-zinc-700"
              tall
            />
          </div>

          {/* SOR — RIGHT */}
          <div className="lg:col-span-2">
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
  );
}
