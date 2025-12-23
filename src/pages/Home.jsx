import { motion } from "framer-motion";
import { Users, Table, Trophy } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col bg-black text-white min-h-screen">

      {/* Hero Section */}
      <section className="flex-grow flex flex-col items-center justify-center text-center px-6">
        <motion.h1
          className="text-5xl md:text-6xl font-extrabold tracking-wide mb-4"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          MP Assistant
        </motion.h1>
        <motion.p
          className="text-xl text-red-200 mb-10 max-w-2xl"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          A dedicated assistant for the Royal Military Police, helping you manage hierarchy, ranks, and leaderboards efficiently.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          className="flex justify-center gap-4 flex-wrap mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <a
            href="/hierarchy"
            className="bg-red-600 hover:bg-red-700 transition px-8 py-4 rounded-xl font-semibold shadow-lg transform hover:scale-105"
          >
            View Hierarchy
          </a>
          <a
            href="/hrs"
            className="border border-red-500 text-red-300 hover:bg-red-600 hover:text-white transition px-8 py-4 rounded-xl font-semibold transform hover:scale-105"
          >
            High Rank Tables
          </a>
          <a
            href="/lrs"
            className="border border-red-500 text-red-300 hover:bg-red-600 hover:text-white transition px-8 py-4 rounded-xl font-semibold transform hover:scale-105"
          >
            Low Rank Tables
          </a>
          <a
            href="/leaderboard"
            className="border border-red-500 text-red-300 hover:bg-red-600 hover:text-white transition px-8 py-4 rounded-xl font-semibold transform hover:scale-105"
          >
            Leaderboards
          </a>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="bg-zinc-900 py-16 px-6">
        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            className="bg-zinc-800 p-6 rounded-xl shadow-lg flex flex-col items-center hover:scale-105 transition"
            whileHover={{ scale: 1.05 }}
          >
            <Users className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Hierarchy Management</h3>
            <p className="text-center">Admins with HICOM role can edit server hierarchy easily.</p>
          </motion.div>

          <motion.div
            className="bg-zinc-800 p-6 rounded-xl shadow-lg flex flex-col items-center hover:scale-105 transition"
            whileHover={{ scale: 1.05 }}
          >
            <Table className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Rank Tables</h3>
            <p className="text-center">Access high and low rank tables to track personnel efficiently.</p>
          </motion.div>

          <motion.div
            className="bg-zinc-800 p-6 rounded-xl shadow-lg flex flex-col items-center hover:scale-105 transition"
            whileHover={{ scale: 1.05 }}
          >
            <Trophy className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Leaderboards</h3>
            <p className="text-center">Monitor performance stats and see who’s topping the charts.</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 text-zinc-400">
        &copy; 2025 MP Assistant — Built exclusively for the Royal Military Police regiment.
      </footer>
    </div>
  );
}
