import { GitCommit, GitMerge, GitPullRequest } from "lucide-react";

function ActivityIcon({ type }) {
  const common = "h-4 w-4";
  if (type === "merge") return <GitMerge className={common} />;
  if (type === "pr") return <GitPullRequest className={common} />;
  return <GitCommit className={common} />;
}

export default function RecentActivity({ items = [] }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0b1220] p-5 shadow-[0_10px_30px_rgba(2,6,23,0.45)]">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-100">Recent Activity</h2>
        <p className="text-sm text-slate-400">Latest updates from your workflow</p>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-start justify-between gap-3 rounded-2xl px-3 py-2 hover:bg-slate-900/60"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-slate-300 ring-1 ring-slate-700">
                <ActivityIcon type={item.type} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">{item.action}</p>
                <p className="text-xs text-slate-500">{item.type.toUpperCase()}</p>
              </div>
            </div>
            <span className="text-xs text-slate-500">{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
