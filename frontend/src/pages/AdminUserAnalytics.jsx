import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StatsCards from "../components/dashboard/StatsCards.jsx";
import Charts from "../components/dashboard/Charts.jsx";
import RecentActivity from "../components/dashboard/RecentActivity.jsx";
import Insights from "../components/dashboard/Insights.jsx";
import RepoInsights from "../components/dashboard/RepoInsights.jsx";
import API_BASE_URL from "../config/api";

export default function AdminUserAnalytics() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboard, setDashboard] = useState(null);

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

    const fetchUserAnalytics = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(`${API_BASE_URL}/api/admin/dashboard/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();
        if (!response.ok) {
          setError(result.message || "Failed to load user analytics.");
          return;
        }
        setDashboard(result);
      } catch (_err) {
        setError("Unable to fetch user analytics.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserAnalytics();
  }, [id, navigate]);

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

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100">
      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-semibold">
              {dashboard?.user?.name || "Developer"} Analytics
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              {dashboard?.user?.email || ""}
              {dashboard?.user?.githubUsername ? ` • @${dashboard.user.githubUsername}` : ""}
            </p>
          </div>
          <button
            onClick={() => navigate("/manager")}
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            Back
          </button>
        </header>

        {loading ? (
          <div className="rounded-2xl border border-slate-800 bg-[#0b1220] p-8 text-center text-slate-300">
            Loading analytics...
          </div>
        ) : null}

        {!loading && error ? (
          <div className="rounded-2xl border border-rose-700/50 bg-rose-900/10 p-8 text-center text-rose-200">
            {error}
          </div>
        ) : null}

        {!loading && !error && dashboard?.noData ? (
          <div className="rounded-2xl border border-slate-800 bg-[#0b1220] p-8 text-center text-slate-300">
            {dashboard.message || "No Data Found for this GitHub username."}
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
              <Insights
                items={[
                  {
                    id: 1,
                    title: "Admin View",
                    message:
                      "Admin can monitor every developer's GitHub productivity in real-time and drill down into individual analytics.",
                  },
                ]}
              />
            </div>

            <RepoInsights repositories={dashboard?.repositories || []} />
          </>
        ) : null}
      </main>
    </div>
  );
}
