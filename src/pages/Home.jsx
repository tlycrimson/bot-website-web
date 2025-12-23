import { Link } from "react-router-dom";
import { Users, Table, Trophy, Layout } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const buttons = [
    {
      title: "View Hierarchy",
      link: "/hierarchy",
      icon: <Layout className="w-5 h-5 inline mr-2" />,
      style: "bg-red-600 hover:bg-red-700 text-white",
    },
    {
      title: "View High Rank Tables",
      link: "/hrs",
      icon: <Table className="w-5 h-5 inline mr-2" />,
      style: "bg-black/30 border border-red-500 text-red-300 hover:bg-red-600 hover:text-white",
    },
    {
      title: "View Low Rank Tables",
      link: "/lrs",
      icon: <Table className="w-5 h-5 inline mr-2" />,
      style: "bg-black/30 border border-red-500 text-red-300 hover:bg-red-600 hover:text-white",
    },
    {
      title: "View Leaderboards",
      link: "/leaderboard",
      icon: <Trophy className="w-5 h-5 inline mr-2" />,
      style: "bg-black/30 border border-red-500 text-red-300 hover:bg-red-600 hover:text-white",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-red-900 text-white flex flex-col justify-center items-center px-6">
      {/* Hero Heading */}
      <motion.h1
        className="text-5xl md:text-6xl font-extrabold tracking-wide mb-6 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        MP Assistant
      </motion.h1>

      <motion.p
        className="text-xl text-red-200 mb-12 text-center max-w-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        A dedicated assistant for the Royal Military Police — streamline hierarchy, rank tables, and leaderboards in one place.
      </motion.p>

      {/* Buttons */}
      <div className="flex flex-wrap justify-center gap-6 mb-12">
        {buttons.map((btn, i) => (
          <motion.div
            key={btn.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
          >
            <Link
              to={btn.link}
              className={`flex items-center justify-center px-8 py-4 rounded-2xl font-semibold shadow-lg transition transform hover:scale-105 ${btn.style}`}
            >
              {btn.icon}
              {btn.title}
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Join HR Teams Section */}
      <motion.div
        className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center max-w-md hover:bg-white/20 transition"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <h2 className="text-2xl font-bold mb-3 text-red-400">
          Join our HR Teams
        </h2>
        <p className="text-sm text-zinc-200 mb-4">
          Interested in helping manage the Royal Military Police? Apply now to join the Provost Wing HR team.
        </p>
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLSdvDX6ADEJOIWTWUiaGb-vc_ga0SddKuu6skh8rre9RybQ5bw/viewform"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-6 py-3 bg-red-600 text-white font-semibold rounded-xl shadow-lg hover:bg-red-700 transition"
        >
          Apply Now
        </a>
      </motion.div>

      {/* Footer */}
      <p className="text-sm text-zinc-400 text-center mt-12">
        Private utility bot — built exclusively for this regiment.
      </p>
    </div>
  );
}
