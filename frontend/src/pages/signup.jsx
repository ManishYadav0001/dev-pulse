import { Link } from "react-router-dom"
import { useState } from "react"

function Signup() {

  const [role, setRole] = useState("developer")

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">

      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-green-500/10 blur-3xl"></div>

      <div className="w-full max-w-md relative z-10 border border-gray-800 rounded-2xl p-8 bg-black/60 backdrop-blur">

        <h2 className="text-3xl font-bold text-center mb-6">
          Create Account 🚀
        </h2>

        <p className="text-gray-400 text-center mb-8">
          Start your journey with DevPulse
        </p>

        {/* Role Selection */}
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setRole("developer")}
            className={`w-full py-2 rounded-lg border ${
              role === "developer"
                ? "bg-blue-500 border-blue-500"
                : "border-gray-700"
            }`}
          >
            Developer
          </button>

          <button
            onClick={() => setRole("admin")}
            className={`w-full py-2 rounded-lg border ${
              role === "admin"
                ? "bg-green-500 border-green-500"
                : "border-gray-700"
            }`}
          >
            Admin
          </button>
        </div>

        {/* Form */}
        <form className="flex flex-col gap-4">

          <input
            type="text"
            placeholder="Full Name"
            className="bg-black border border-gray-700 px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500"
          />

          <input
            type="email"
            placeholder="Email"
            className="bg-black border border-gray-700 px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500"
          />

          <input
            type="password"
            placeholder="Password"
            className="bg-black border border-gray-700 px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500"
          />

          {/* Hidden role (for backend later) */}
          <input type="hidden" value={role} />

          <button className="bg-white text-black py-3 rounded-full font-medium mt-2">
            Sign Up as {role}
          </button>

        </form>

        {/* Footer */}
        <p className="text-gray-400 text-center mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 hover:underline">
            Login
          </Link>
        </p>

      </div>
    </div>
  )
}

export default Signup