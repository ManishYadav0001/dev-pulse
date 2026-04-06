import StatsCards from "../components/dashboard/StatsCards.jsx";
import Charts from "../components/dashboard/Charts.jsx";
import Insights from "../components/dashboard/Insights.jsx";
import RecentActivity from "../components/dashboard/RecentActivity.jsx";

import {
  activityData,
  chartData,
  insightsData,
  statsData,
} from "../data/dashboardData.js";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-100">
      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 border-b border-slate-800 pb-4">
          <h1 className="text-2xl font-semibold">Developer Dashboard</h1>
          <p className="mt-1 text-sm text-slate-400">
            A quick overview of your engineering activity.
          </p>
        </header>

        <StatsCards items={statsData} />

        <div className="mt-6">
          <Charts data={chartData} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentActivity items={activityData} />
          </div>
          <Insights items={insightsData} />
        </div>
      </main>
    </div>
  );
}