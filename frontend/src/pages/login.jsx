import { Link } from "react-router-dom"

function Login() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">

      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-green-500/10 blur-3xl"></div>

      <div className="w-full max-w-md relative z-10 border border-gray-800 rounded-2xl p-8 bg-black/60 backdrop-blur">

        <h2 className="text-3xl font-bold text-center mb-6">
          Welcome Back 👋
        </h2>

        <p className="text-gray-400 text-center mb-8">
          Login to your DevPulse account
        </p>

        {/* Form */}
        <form className="flex flex-col gap-4">

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

          <button className="bg-white text-black py-3 rounded-full font-medium mt-2">
            Login
          </button>

        </form>

        {/* Footer */}
        <p className="text-gray-400 text-center mt-6">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-blue-400 hover:underline">
            Sign Up
          </Link>
        </p>

      </div>
    </div>
  )
}

export default Login