import { useMemo, useState } from "react";
import Charts from "./Charts.jsx";
import RecentActivity from "./RecentActivity.jsx";

export default function RepoInsights({ repositories = [] }) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("active");
  const [topN, setTopN] = useState(10);
  const [range, setRange] = useState("30d");
  const [selectedRepo, setSelectedRepo] = useState(null);

  const rangeStart = useMemo(() => {
    if (range === "all") return null;
    const days = range === "90d" ? 90 : 30;
    const start = new Date();
    start.setDate(start.getDate() - days);
    start.setHours(0, 0, 0, 0);
    return start;
  }, [range]);

  const filterByRange = (items = [], dateKey = "date") => {
    if (!rangeStart) return items;
    return items.filter((item) => {
      const d = new Date(item?.[dateKey]);
      return !Number.isNaN(d.valueOf()) && d >= rangeStart;
    });
  };

  const filteredRepos = useMemo(() => {
    const bySearch = repositories.filter((repo) =>
      repo.name.toLowerCase().includes(search.trim().toLowerCase())
    );

    const sorted = [...bySearch];
    if (sortBy === "stars") {
      sorted.sort((a, b) => b.stars - a.stars);
    } else if (sortBy === "updated") {
      sorted.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
    } else {
      sorted.sort((a, b) => b.commits + b.pullRequests - (a.commits + a.pullRequests));
    }
    return sorted.slice(0, topN);
  }, [repositories, search, sortBy, topN]);

  return (
    <section className="mt-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Per Repository Insights</h2>
          <p className="text-sm text-slate-400">
            Repo-wise activity overview with stars, forks, commits, PRs, and issues.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="inline-flex rounded-xl border border-slate-700 bg-slate-900 p-1">
            <button
              onClick={() => setTopN(10)}
              className={[
                "rounded-lg px-3 py-1.5 text-sm",
                topN === 10 ? "bg-slate-800 text-slate-100" : "text-slate-300 hover:bg-slate-800/50",
              ].join(" ")}
            >
              Top 10
            </button>
            <button
              onClick={() => setTopN(15)}
              className={[
                "rounded-lg px-3 py-1.5 text-sm",
                topN === 15 ? "bg-slate-800 text-slate-100" : "text-slate-300 hover:bg-slate-800/50",
              ].join(" ")}
            >
              Top 15
            </button>
          </div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search repo..."
            className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-none"
          >
            <option value="active">Most Active</option>
            <option value="stars">Most Stars</option>
            <option value="updated">Recently Updated</option>
          </select>
        </div>
      </div>

      {filteredRepos.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-[#0b1220] p-8 text-center text-slate-300">
          No repositories found.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredRepos.map((repo) => (
            <button
              key={repo.name}
              onClick={() => setSelectedRepo(repo)}
              className="rounded-2xl border border-slate-800 bg-[#0b1220] p-5 text-left shadow-[0_10px_30px_rgba(2,6,23,0.45)] hover:border-slate-600"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="truncate text-base font-semibold text-slate-100">{repo.name}</p>
                {repo.language ? (
                  <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                    {repo.language}
                  </span>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm text-slate-300">
                <p>⭐ Stars: {repo.stars}</p>
                <p>🍴 Forks: {repo.forks}</p>
                <p>Commits: {repo.commits}</p>
                <p>PRs: {repo.pullRequests}</p>
                <p className="col-span-2">Issues Resolved: {repo.issuesResolved}</p>
              </div>

              <p className="mt-3 text-xs text-slate-500">
                Updated: {new Date(repo.lastUpdated).toLocaleDateString()}
              </p>
            </button>
          ))}
        </div>
      )}

      {selectedRepo ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-slate-700 bg-[#020617] p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-100">{selectedRepo.name} Details</h3>
              <div className="flex items-center gap-2">
                <select
                  value={range}
                  onChange={(e) => setRange(e.target.value)}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-100 focus:outline-none"
                >
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="all">All time</option>
                </select>
                <button
                  onClick={() => setSelectedRepo(null)}
                  className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </div>

            {selectedRepo.commitsOverTime?.length || selectedRepo.prActivity?.length ? (
              <Charts
                commitsData={filterByRange(selectedRepo.commitsOverTime || [], "date")}
                prData={filterByRange(selectedRepo.prActivity || [], "date")}
              />
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-[#0b1220] p-6 text-center text-slate-300">
                No activity charts available for this repository.
              </div>
            )}

            <div className="mt-4">
              <RecentActivity items={filterByRange(selectedRepo.recentActivity || [], "date")} />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
