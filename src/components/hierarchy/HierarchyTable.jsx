export default function HierarchyTable({ headers, rows, theme }) {
  const themeMap = {
    red: "border-red-600/50",
    yellow: "border-yellow-500/50",
    orange: "border-orange-500/50",
    amber: "border-amber-500/50",
    blue: "border-blue-500/50",
  };

  return (
    <div className={`rounded-2xl border ${themeMap[theme]} overflow-hidden backdrop-blur bg-black/40`}>
      <table className="w-full text-sm">
        <thead className="bg-black/60">
          <tr>
            {headers.map(h => (
              <th
                key={h}
                className="px-4 py-3 text-left uppercase tracking-wider text-xs text-zinc-300"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-t border-white/5 hover:bg-white/5 transition"
            >
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
