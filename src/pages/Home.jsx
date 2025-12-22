import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-red-900 text-white flex items-center">
      <div className="max-w-4xl mx-auto px-6 text-center">

        <h1 className="text-5xl md:text-6xl font-extrabold tracking-wide mb-6">
          MP Assistant
        </h1>

        <p className="text-xl text-red-200 mb-10">
          A dedicated command assistant for our Roblox Military Roleplay unit.
        </p>

        <div className="flex justify-center gap-4 flex-wrap">
          <a
            href="https://discord.com/oauth2/authorize?CLIENT_ID=YOUR_ID&scope=bot"
            target="_blank"
            rel="noreferrer"
            className="bg-red-600 hover:bg-red-700 transition px-8 py-4 rounded-xl font-semibold"
          >
            Invite Bot
          </a>

          <Link
            to="/leaderboard"
            className="border border-red-500 text-red-300 hover:bg-red-600 hover:text-white transition px-8 py-4 rounded-xl font-semibold"
          >
            View XP Leaderboard
          </Link>
        </div>

        <p className="text-sm text-zinc-400 mt-10">
          Private utility bot — built exclusively for this unit.
        </p>

      </div>
    </div>
  );
}
