import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import StatsCards from "../../components/dashboard/StatsCards.jsx";
import Charts from "../../components/dashboard/Charts.jsx";
import RecentActivity from "../../components/dashboard/RecentActivity.jsx";
import Insights from "../../components/dashboard/Insights.jsx";
import API_BASE_URL from "../../config/api";

export default function Overview() {
  const { dashboard, loading, error } = useOutletContext();
  const [aiInsights, setAiInsights] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

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

  const fetchAIInsights = async (force = false) => {
    if (!dashboard?.stats || !dashboard?.charts || !dashboard?.recentActivity) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setAiLoading(true);
      setAiError("");
      const response = await fetch(`${API_BASE_URL}/api/ai/insights`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          stats: dashboard.stats,
          charts: dashboard.charts,
          recentActivity: dashboard.recentActivity,
          force,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        setAiError(result.message || "Failed to generate AI insights.");
        setAiInsights([]);
        setAiSuggestions([]);
        return;
      }

      setAiInsights(Array.isArray(result.insights) ? result.insights : []);
      setAiSuggestions(Array.isArray(result.suggestions) ? result.suggestions : []);
      if ((!result.insights || !result.insights.length) && (!result.suggestions || !result.suggestions.length)) {
        setAiError("No insights available.");
      }
    } catch (_err) {
      setAiError("AI insights are unavailable right now.");
      setAiInsights([]);
      setAiSuggestions([]);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && !error && !dashboard?.noData) {
      fetchAIInsights(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, error, dashboard?.stats, dashboard?.charts, dashboard?.recentActivity, dashboard?.noData]);

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
        <Insights
          insights={aiInsights}
          suggestions={aiSuggestions}
          loading={aiLoading}
          error={aiError}
          onRegenerate={() => fetchAIInsights(true)}
        />
      </div>
    </>
  );
}

