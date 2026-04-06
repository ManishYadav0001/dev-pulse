import { Link, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import API_BASE_URL from "../config/api"

function Login() {
  const [role, setRole] = useState("developer")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const oauthToken = params.get("oauthToken")
    const oauthError = params.get("oauthError")

    if (oauthError) {
      setError("GitHub login failed. Please try again.")
      return
    }

    if (!oauthToken) return

    const loadProfileAndRedirect = async () => {
      try {
        localStorage.setItem("token", oauthToken)
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${oauthToken}`,
          },
        })
        const result = await response.json()
        if (!response.ok) {
          setError(result.message || "OAuth login failed.")
          localStorage.removeItem("token")
          return
        }
        localStorage.setItem("user", JSON.stringify(result.user))
        window.history.replaceState({}, "", "/login")
        if (result.user.role === "admin") {
          navigate("/manager")
        } else {
          navigate("/dashboard")
        }
      } catch (_err) {
        setError("Unable to complete GitHub login.")
      }
    }

    loadProfileAndRedirect()
  }, [navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Email and password are required.")
      return
    }

    try {
      setLoading(true)

      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role }),
      })

      const result = await response.json()
      if (!response.ok) {
        setError(result.message || "Login failed.")
        return
      }

      localStorage.setItem("token", result.token)
      localStorage.setItem("user", JSON.stringify(result.user))

      if (result.user.role === "admin") {
        navigate("/manager")
      } else {
        navigate("/dashboard")
      }
    } catch (_error) {
      setError("Unable to connect to server.")
    } finally {
      setLoading(false)
    }
  }

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

        {/* 🔹 Role Selection */}
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
        <form onSubmit={handleLogin} className="flex flex-col gap-4">

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-black border border-gray-700 px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-black border border-gray-700 px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500"
          />

          {error ? <p className="text-red-400 text-sm">{error}</p> : null}

          <button
            disabled={loading}
            className="bg-white text-black py-3 rounded-full font-medium mt-2 disabled:opacity-60"
          >
            {loading ? "Logging in..." : `Login as ${role}`}
          </button>

        </form>

        <button
          onClick={() => (window.location.href = `${API_BASE_URL}/auth/github`)}
          className="mt-3 w-full rounded-full border border-slate-500 bg-transparent py-3 text-white hover:bg-white/10"
        >
          Continue with GitHub
        </button>

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