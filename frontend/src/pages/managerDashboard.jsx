import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config/api";

function ManagerDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token) {
      navigate("/login");
      return;
    }
    if (user.role !== "admin") {
      navigate("/dashboard");
      return;
    }

    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const result = await response.json();
        if (!response.ok) {
          setError(result.message || "Failed to fetch users.");
          return;
        }
        setUsers(result);
      } catch (_err) {
        setError("Unable to load users.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100">
      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-slate-400">
              Select a developer to view detailed GitHub analytics.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            Logout
          </button>
        </header>

        {loading ? (
          <div className="rounded-2xl border border-slate-800 bg-[#0b1220] p-8 text-center text-slate-300">
            Loading users...
          </div>
        ) : null}

        {!loading && error ? (
          <div className="rounded-2xl border border-rose-700/50 bg-rose-900/10 p-8 text-center text-rose-200">
            {error}
          </div>
        ) : null}

        {!loading && !error && users.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-[#0b1220] p-8 text-center text-slate-300">
            No developers found.
          </div>
        ) : null}

        {!loading && !error && users.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {users.map((user) => (
              <button
                key={user._id}
                onClick={() => navigate(`/admin/user/${user._id}`)}
                className="rounded-2xl border border-slate-800 bg-[#0b1220] p-5 text-left shadow-[0_10px_30px_rgba(2,6,23,0.45)] hover:border-slate-600"
              >
                <div className="flex items-center gap-3">
                  {user.githubAvatar ? (
                    <img
                      src={user.githubAvatar}
                      alt="GitHub avatar"
                      className="h-10 w-10 rounded-full border border-slate-700"
                    />
                  ) : null}
                  <p className="text-lg font-semibold text-slate-100">{user.name}</p>
                </div>
                <p className="mt-1 text-sm text-slate-400">{user.email}</p>
                <p className="mt-3 text-xs text-slate-500">
                  GitHub: {user.githubUsername || "Not set"}
                </p>
              </button>
            ))}
          </div>
        ) : null}
      </main>
    </div>
  );
}

export default ManagerDashboard;