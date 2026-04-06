import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"

function Home() {
  return (
    <div className="bg-black text-white min-h-screen">

      {/* 🔹 Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 border-b border-gray-800">
        <h1 className="text-xl font-bold text-blue-400">DevPulse</h1>

        <div className="hidden md:flex gap-8 text-gray-300">
          <a href="#">Home</a>
          <a href="#features">Features</a>
          <a href="#how">How It Works</a>
        </div>

        <div className="flex gap-4 ">
          <Link to="/login" className="text-gray-300 mt-2">Login</Link>
          <Link to="/signup">
          <button className="bg-white text-black px-4 py-2 rounded-full font-medium">
            Get Started
          </button>
          </Link>
        </div>
      </nav>

      {/* 🔹 Hero Section */}
      <section className="text-center py-20 px-6 relative">

        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-green-500/10 blur-3xl"></div>

        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
          The complete platform <br />
          for{" "}
          <span className="bg-gradient-to-r from-blue-400 to-green-400 text-transparent bg-clip-text">
            developer insights
          </span>
        </h1>

        <p className="mt-6 text-gray-400 max-w-2xl mx-auto">
          Track developer productivity, gain actionable insights, and empower your
          team with real-time analytics.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <Link to="/signup">
          <button className="bg-white text-black px-6 py-3 rounded-full flex items-center gap-2">
            Get Started Free <ArrowRight size={16} />
          </button>
          </Link>

        
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
          {[
            ["10K+", "Developers"],
            ["500+", "Companies"],
            ["99.9%", "Uptime"],
            ["50M+", "Events"],
          ].map((item, i) => (
            <div key={i} className="border border-gray-800 rounded-xl p-4">
              <h2 className="text-2xl font-bold">{item[0]}</h2>
              <p className="text-gray-400 text-sm">{item[1]}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 🔹 Features */}
      <section id="features" className="py-20 px-6 text-center">
        <h2 className="text-4xl font-bold mb-4">
          Everything you need to understand your team
        </h2>

        <p className="text-gray-400 max-w-xl mx-auto mb-12">
          Powerful tools designed to give you complete visibility into developer productivity.
        </p>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">

          <div className="border border-gray-800 rounded-xl p-6 hover:scale-105 transition">
            <h3 className="text-xl font-semibold mb-3">Developer Insights</h3>
            <p className="text-gray-400 text-sm">
              Track commits, PRs, and productivity across your team.
            </p>
          </div>

          <div className="border border-gray-800 rounded-xl p-6 hover:scale-105 transition">
            <h3 className="text-xl font-semibold mb-3">Manager Dashboard</h3>
            <p className="text-gray-400 text-sm">
              Get a bird’s-eye view of team performance with analytics.
            </p>
          </div>

          <div className="border border-gray-800 rounded-xl p-6 hover:scale-105 transition">
            <h3 className="text-xl font-semibold mb-3">Real-time Analytics</h3>
            <p className="text-gray-400 text-sm">
              Live updates and actionable insights instantly.
            </p>
          </div>

        </div>
      </section>

      {/* 🔹 How it Works */}
      <section id="how" className="py-20 px-6 text-center">
        <h2 className="text-4xl font-bold mb-4">
          Get started in minutes, not days
        </h2>

        <p className="text-gray-400 mb-12">
          A simple process to unlock powerful developer insights.
        </p>

        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">

          {[
            "Connect Repos",
            "Collect Data",
            "Analyze",
            "Optimize",
          ].map((step, i) => (
            <div key={i} className="border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-2">
                {i + 1}. {step}
              </h3>
              <p className="text-gray-400 text-sm">
                Simple setup and powerful results instantly.
              </p>
            </div>
          ))}

        </div>
      </section>

      {/* 🔹 CTA */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-4xl mx-auto border border-gray-800 rounded-2xl p-10 bg-gradient-to-r from-blue-500/10 to-green-500/10">

          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to transform your workflow?
          </h2>

          <p className="text-gray-400 mb-6">
            Join thousands of teams using DevPulse.
          </p>
         <Link to="/signup">
          <button className="bg-white text-black px-6 py-3 rounded-full">
            Get Started Now
          </button>
          </Link>

        </div>
      </section>

      {/* 🔹 Footer */}
      <footer className="text-center text-gray-500 py-6 border-t border-gray-800">
        © 2026 DevPulse. All rights reserved.
      </footer>
    </div>
  )
}

export default Home