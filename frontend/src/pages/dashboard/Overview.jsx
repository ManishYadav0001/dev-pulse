import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import StatsCards from "../../components/dashboard/StatsCards.jsx";
import Charts from "../../components/dashboard/Charts.jsx";
import RecentActivity from "../../components/dashboard/RecentActivity.jsx";
import Insights from "../../components/dashboard/Insights.jsx";
import API_BASE_URL from "../../config/api";

export default function Overview() {
  const { dashboard, loading, error } = useOutletContext();

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

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-[#0b1220] p-8 text-center text-slate-300">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-700/50 bg-rose-900/10 p-8 text-center text-rose-200">
        {error}
      </div>
    );
  }

  if (dashboard?.noData) {
    return (
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
    );
  }

  return (
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
    </>
  );
}

