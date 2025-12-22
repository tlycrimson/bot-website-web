import { useEffect, useState } from "react";

export default function HR() {
  const [ranks, setRanks] = useState([]);

  useEffect(() => {
    fetch("https://bot-website-api.onrender.com/hr")
      .then(res => res.json())
      .then(data => setRanks(data));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-red-900 flex items-center justify-center px-4">
      <div className="bg-zinc-900 text-white rounded-2xl shadow-2xl w-full max-w-lg p-6 border border-red-800">

        <h1 className="text-3xl font-extrabold text-center mb-6">
          High Ranks (HR)
        </h1>

        <ul className="space-y-3">
          {ranks.map((r, i) => (
            <li
              key={i}
              className="flex justify-between items-center px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700"
            >
              <span className="font-semibold">
                {r.name}
              </span>

              <span className="text-red-400 font-bold">
                {r.abbreviation}
              </span>
            </li>
          ))}
        </ul>

      </div>
    </div>
  );
}
