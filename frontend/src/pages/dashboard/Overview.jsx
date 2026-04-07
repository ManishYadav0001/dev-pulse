import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import StatsCards from "../../components/dashboard/StatsCards.jsx";
import Charts from "../../components/dashboard/Charts.jsx";
import RecentActivity from "../../components/dashboard/RecentActivity.jsx";
import Insights from "../../components/dashboard/Insights.jsx";
import PRInsights from "../../components/dashboard/PRInsights.jsx";

export default function Overview() {
  const { dashboard, loading, error } = useOutletContext();
  
  // Use AI insights from dashboard API (processed by Python)
  const aiInsights = dashboard?.aiInsights?.insights || [];
  const aiSuggestions = dashboard?.aiInsights?.suggestions || [];
  const aiLoading = loading; // Use dashboard loading state
  const aiError = ""; // No separate error state needed

  // PR Insights data
  const prMetrics = dashboard?.prMetrics;
  const prInsights = dashboard?.prInsights || [];
  const prSuggestions = dashboard?.prSuggestions || [];
  const prLoading = loading;

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

      {/* PR Insights Section */}
      <div className="mt-6">
        <PRInsights 
          prMetrics={prMetrics}
          prInsights={prInsights}
          prSuggestions={prSuggestions}
          loading={prLoading}
        />
      </div>

      {/* Recent Activity - Full Width */}
      <div className="mt-6">
        <RecentActivity items={dashboard?.recentActivity || []} />
      </div>

      {/* AI Insights and Suggestions - Side by Side */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Insights
          mode="insights"
          insights={aiInsights}
          suggestions={[]}
          loading={aiLoading}
          error={aiError}
          title="AI Insights"
          subtitle="Analysis from your activity"
        />
        <Insights
          mode="suggestions"
          insights={[]}
          suggestions={aiSuggestions}
          loading={aiLoading}
          error={aiError}
          title="Smart Suggestions"
          subtitle="Recommendations to improve"
        />
      </div>
    </>
  );
}
