import RobloxAvatar from "./RobloxAvatar";

export default function HierarchyTable({ headers, rows, theme, showAvatar = false }) {
  const themeMap = {
    red: "border-red-600/50",
    yellow: "border-yellow-500/50",
    orange: "border-orange-500/50",
    amber: "border-amber-500/50",
    blue: "border-blue-500/50",
  };

  const headerKeyMap = {
    "RMP Rank": "rank",
    "RMP": "rank",
    "Username": "username",
    "Army Rank": "armyRank",
    "Rank": "rank",
    "Requirements": "requirements"
  };

  return (
    <div className={`rounded-2xl border ${themeMap[theme]} overflow-hidden backdrop-blur bg-black/40`}>
      <table className="w-full text-sm">
        <thead className="bg-black/60">
          <tr>
            {showAvatar && <th className="px-4 py-3 text-center uppercase tracking-wider text-xs text-zinc-300">Avatar</th>}
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 text-center uppercase tracking-wider text-xs text-zinc-300">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const isObjectRow = typeof row === "object" && !Array.isArray(row);

            return (
              <tr key={i} className="border-t border-white/5 hover:bg-white/5 transition">
                {showAvatar && isObjectRow && (
                  <td className="px-4 py-3 text-center">
                    <RobloxAvatar userId={row.robloxId} username={row.username} />
                  </td>
                )}
                {headers.map((h, j) => (
                  <td key={j} className="px-4 py-3 text-center">
                    {isObjectRow ? row[headerKeyMap[h]] ?? "" : row[j] ?? ""}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
