import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import API_BASE_URL from "../../config/api";

const linkBase =
  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboard, setDashboard] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(`${API_BASE_URL}/api/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();
        if (!response.ok) {
          setError(result.message || "Failed to load dashboard.");
          return;
        }

        if (result.role !== "developer") {
          navigate("/manager");
          return;
        }

        setDashboard(result);
      } catch (_err) {
        setError("Unable to fetch dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  const contextValue = useMemo(
    () => ({ dashboard, loading, error, setError }),
    [dashboard, loading, error]
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100">
      <div className="mx-auto flex max-w-[1400px] gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <aside className="w-64 shrink-0">
          <div className="sticky top-0 h-screen py-6">
            <div className="flex h-full flex-col rounded-2xl border border-slate-800 bg-[#0b1220] p-4 shadow-[0_10px_30px_rgba(2,6,23,0.45)]">
            <div className="mb-4">
              <p className="text-lg font-semibold">DevPulse</p>
              <p className="text-xs text-slate-500">Developer intelligence</p>
            </div>

            <nav className="space-y-2">
              <NavLink
                to="/dashboard/overview"
                className={({ isActive }) =>
                  [
                    linkBase,
                    isActive
                      ? "bg-slate-900 text-slate-100 ring-1 ring-slate-700"
                      : "text-slate-400 hover:bg-slate-900/60",
                  ].join(" ")
                }
              >
                Overall Insights
              </NavLink>
              <NavLink
                to="/dashboard/repos"
                className={({ isActive }) =>
                  [
                    linkBase,
                    isActive
                      ? "bg-slate-900 text-slate-100 ring-1 ring-slate-700"
                      : "text-slate-400 hover:bg-slate-900/60",
                  ].join(" ")
                }
              >
                Repositories
              </NavLink>
              <NavLink
                to="/dashboard/contributors"
                className={({ isActive }) =>
                  [
                    linkBase,
                    isActive
                      ? "bg-slate-900 text-slate-100 ring-1 ring-slate-700"
                      : "text-slate-400 hover:bg-slate-900/60",
                  ].join(" ")
                }
              >
                Top Contributors
              </NavLink>
              <NavLink
                to="/dashboard/deploy-status"
                className={({ isActive }) =>
                  [
                    linkBase,
                    isActive
                      ? "bg-slate-900 text-slate-100 ring-1 ring-slate-700"
                      : "text-slate-400 hover:bg-slate-900/60",
                  ].join(" ")
                }
              >
                Deploy Status
              </NavLink>
              <NavLink
                to="/dashboard/project-deploy-status"
                className={({ isActive }) =>
                  [
                    linkBase,
                    isActive
                      ? "bg-slate-900 text-slate-100 ring-1 ring-slate-700"
                      : "text-slate-400 hover:bg-slate-900/60",
                  ].join(" ")
                }
              >
                Repository Debug Information
              </NavLink>
            </nav>
            <div className="mt-auto pt-4 text-xs text-slate-500">
              Built with GitHub OAuth
            </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="mb-6 flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h1 className="text-2xl font-semibold">Developer Dashboard</h1>
              <p className="mt-1 text-sm text-slate-400">
                A quick overview of your engineering activity.
              </p>
              {dashboard?.user?.githubUsername ? (
                <div className="mt-3 flex items-center gap-2 text-sm text-slate-300">
                  {dashboard?.user?.githubAvatar ? (
                    <img
                      src={dashboard.user.githubAvatar}
                      alt="GitHub avatar"
                      className="h-7 w-7 rounded-full border border-slate-700"
                    />
                  ) : null}
                  <span>@{dashboard.user.githubUsername}</span>
                </div>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => (window.location.href = `${API_BASE_URL}/auth/github/reconnect`)}
                className="rounded-xl border border-indigo-700/60 bg-indigo-900/20 px-4 py-2 text-sm font-medium text-indigo-200 hover:bg-indigo-900/40"
              >
                Reconnect GitHub
              </button>
              <button
                onClick={handleLogout}
                className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
              >
                Logout
              </button>
            </div>
          </header>

          <Outlet context={contextValue} />
        </main>
      </div>
    </div>
  );
}

