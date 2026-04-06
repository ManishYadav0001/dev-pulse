import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import API_BASE_URL from "../../config/api";

export default function TopContributors() {
  const { dashboard } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [contributors, setContributors] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchContributors = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(`${API_BASE_URL}/api/contributors`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();
        if (!response.ok) {
          setError(result.message || "Failed to load contributors.");
          return;
        }
        setContributors(result.contributors || []);
      } catch (_err) {
        setError("Unable to load contributors.");
      } finally {
        setLoading(false);
      }
    };

    // If dashboard is missing token connection, contributors won't work either.
    if (dashboard?.noData) {
      setLoading(false);
      return;
    }

    fetchContributors();
  }, [dashboard]);

  if (dashboard?.noData) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-[#0b1220] p-8 text-center text-slate-300">
        {dashboard.message || "Connect GitHub to view contributors."}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-[#0b1220] p-8 text-center text-slate-300">
        Loading contributors...
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

  if (!contributors.length) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-[#0b1220] p-8 text-center text-slate-300">
        No contributors found.
      </div>
    );
  }

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-100">Top Contributors</h2>
        <p className="text-sm text-slate-400">
          Top contributors per repository (from GitHub contributors API).
        </p>
      </div>

      <div className="space-y-4">
        {contributors.map((repo) => (
          <div
            key={repo.repoName}
            className="rounded-2xl border border-slate-800 bg-[#0b1220] p-5 shadow-[0_10px_30px_rgba(2,6,23,0.45)]"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-100">{repo.repoName}</h3>
              <span className="text-xs text-slate-500">
                Total: {repo.totalContributions || 0}
              </span>
            </div>

            {!repo.topUsers?.length ? (
              <p className="text-sm text-slate-400">No contributors found for this repo.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {repo.topUsers.map((user, idx) => (
                  <a
                    key={`${repo.repoName}-${user.username}`}
                    href={`https://github.com/${user.username}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/40 p-3 hover:border-slate-600"
                  >
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="h-10 w-10 rounded-full border border-slate-700"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-slate-100">
                          {user.username}
                        </p>
                        {idx === 0 ? (
                          <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] text-amber-200">
                            👑 #1
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs text-slate-400">
                        Contributions: {user.contributions}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

