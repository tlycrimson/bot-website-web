export default function Section({ title, accent, children }) {
  const accentMap = {
    red: "text-red-400",
    yellow: "text-yellow-400",
    orange: "text-orange-400",
    amber: "text-amber-400",
    blue: "text-blue-400",
  };

  return (
    <div>
      <h2 className={`text-2xl font-extrabold mb-6 tracking-wide ${accentMap[accent]}`}>
        {title}
      </h2>
      {children}
    </div>
  );
}
