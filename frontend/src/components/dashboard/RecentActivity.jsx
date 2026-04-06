import { GitCommit, GitMerge, GitPullRequest, Plus, Minus, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

function ActivityIcon({ type }) {
  const common = "h-4 w-4";
  if (type === "merge") return <GitMerge className={common} />;
  if (type === "pr") return <GitPullRequest className={common} />;
  return <GitCommit className={common} />;
}

function CommitStats({ stats }) {
  if (!stats || stats.total === 0) return null;
  
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="flex items-center gap-1 text-green-400">
        <Plus className="h-3 w-3" />
        {stats.additions}
      </span>
      <span className="flex items-center gap-1 text-red-400">
        <Minus className="h-3 w-3" />
        {stats.deletions}
      </span>
    </div>
  );
}

function PreviousComparison({ comparison }) {
  if (!comparison || comparison.total === 0) return null;
  
  return (
    <div className="mt-2 rounded-lg bg-slate-800/50 p-2 border border-slate-700">
      <p className="text-xs font-medium text-slate-300 mb-1">vs previous commit:</p>
      <div className="flex items-center gap-3 text-xs">
        <span className="flex items-center gap-1 text-green-400">
          <Plus className="h-3 w-3" />
          {comparison.additions}
        </span>
        <span className="flex items-center gap-1 text-red-400">
          <Minus className="h-3 w-3" />
          {comparison.deletions}
        </span>
        <span className="text-slate-400">
          {comparison.files} files
        </span>
      </div>
    </div>
  );
}

export default function RecentActivity({ items = [] }) {
  const [expandedCommits, setExpandedCommits] = useState(new Set());

  const toggleCommitExpansion = (itemKey) => {
    setExpandedCommits(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemKey)) {
        newSet.delete(itemKey);
      } else {
        newSet.add(itemKey);
      }
      return newSet;
    });
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0b1220] p-5 shadow-[0_10px_30px_rgba(2,6,23,0.45)]">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-100">Recent Activity</h2>
        <p className="text-sm text-slate-400">Latest updates from your workflow</p>
      </div>

      <div className="space-y-2">
        {items.map((item) => {
          const itemKey = `${item.repo}-${item.date}-${item.message}`;
          const isExpanded = expandedCommits.has(itemKey);
          const isCommit = item.type === 'commit';
          const hasComparison = isCommit && item.previousComparison && item.previousComparison.total > 0;

          return (
            <div
              key={itemKey}
              className="rounded-2xl border border-slate-800 bg-slate-900/30 overflow-hidden"
            >
              <div
                className={`flex items-start justify-between gap-3 px-3 py-2 hover:bg-slate-900/60 cursor-pointer transition-colors ${
                  isCommit && hasComparison ? 'hover:border-slate-600' : ''
                }`}
                onClick={() => isCommit && hasComparison && toggleCommitExpansion(itemKey)}
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-slate-300 ring-1 ring-slate-700">
                    <ActivityIcon type={item.type} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-200">{item.message}</p>
                    <p className="text-xs text-slate-500">
                      {item.repo} • {item.type.toUpperCase()}
                    </p>
                    {isCommit && <CommitStats stats={item.stats} />}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="text-xs text-slate-500">
                      {new Date(item.date).toLocaleDateString()} • {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {isCommit && hasComparison && (
                    <div className="text-slate-400">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  )}
                </div>
              </div>
              
              {isCommit && isExpanded && hasComparison && (
                <div className="px-3 pb-2">
                  <PreviousComparison comparison={item.previousComparison} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
