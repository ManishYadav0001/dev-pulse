import StatsCards from "../components/dashboard/StatsCards.jsx";
import Charts from "../components/dashboard/Charts.jsx";
import Insights from "../components/dashboard/Insights.jsx";
import RecentActivity from "../components/dashboard/RecentActivity.jsx";
import RepoInsights from "../components/dashboard/RepoInsights.jsx";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config/api";

export default function Dashboard() {
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
          headers: {
            Authorization: `Bearer ${token}`,
          },
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

  const statsItems = useMemo(() => {
    if (!dashboard?.stats) return [];
    return [
      {
        id: 1,
        title: "Total Commits",
        value: dashboard.stats.commits,
        change: `${dashboard.stats.commits}`,
        trend: "up",
        metric: "commits",
      },
      {
        id: 2,
        title: "Pull Requests",
        value: dashboard.stats.pullRequests,
        change: `${dashboard.stats.pullRequests}`,
        trend: "up",
        metric: "prs",
      },
      {
        id: 3,
        title: "Issues Resolved",
        value: dashboard.stats.issuesResolved,
        change: `${dashboard.stats.issuesResolved}`,
        trend: "up",
        metric: "issues",
      },
      {
        id: 4,
        title: "Productivity Score",
        value: dashboard.stats.productivityScore,
        change: `${dashboard.stats.productivityScore}`,
        trend: "up",
        metric: "productivity",
      },
    ];
  }, [dashboard]);

  const insightsItems = [
    {
      id: 1,
      title: "Hackathon Highlight",
      message:
        "Admin can monitor every developer's GitHub productivity in real-time and drill down into individual analytics.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100">
      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
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

        {loading ? (
          <div className="rounded-2xl border border-slate-800 bg-[#0b1220] p-8 text-center text-slate-300">
            Loading dashboard...
          </div>
        ) : null}

        {!loading && error ? (
          <div className="rounded-2xl border border-rose-700/50 bg-rose-900/10 p-8 text-center text-rose-200">
            {error}
          </div>
        ) : null}

        {!loading && !error && dashboard?.noData ? (
          <div className="rounded-2xl border border-slate-800 bg-[#0b1220] p-8 text-center text-slate-300">
            {dashboard.message || "No Data Found. Please connect GitHub to continue."}
            <div className="mt-4">
              <button
                onClick={() => (window.location.href = `${API_BASE_URL}/auth/github/reconnect`)}
                className="rounded-xl border border-indigo-700/60 bg-indigo-900/20 px-4 py-2 text-sm font-medium text-indigo-200 hover:bg-indigo-900/40"
              >
                Connect GitHub
              </button>
            </div>
          </div>
        ) : null}

        {!loading && !error && !dashboard?.noData ? (
          <>
            {dashboard?.message ? (
              <div className="mb-4 rounded-2xl border border-amber-700/40 bg-amber-900/10 p-4 text-sm text-amber-200">
                {dashboard.message}
              </div>
            ) : null}
            <StatsCards items={statsItems} />

            <div className="mt-6">
              <Charts
                commitsData={dashboard?.charts?.commitsOverTime || []}
                prData={dashboard?.charts?.prActivity || []}
              />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <RecentActivity items={dashboard?.recentActivity || []} />
              </div>
              <Insights items={insightsItems} />
            </div>

            <RepoInsights repositories={dashboard?.repositories || []} />
          </>
        ) : null}
      </main>
    </div>
  );
}