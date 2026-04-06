import {
  Activity,
  CheckCircle2,
  GitPullRequest,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";

function TrendIcon({ trend }) {
  const common = "h-4 w-4";
  if (trend === "down") return <TrendingDown className={`${common} text-rose-400`} />;
  return <TrendingUp className={`${common} text-emerald-400`} />;
}

function MetricIcon({ metric }) {
  const common = "h-4 w-4";
  if (metric === "prs") return <GitPullRequest className={common} />;
  if (metric === "issues") return <CheckCircle2 className={common} />;
  if (metric === "productivity") return <Zap className={common} />;
  return <Activity className={common} />;
}

export default function StatsCards({ items = [] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="rounded-2xl border border-slate-800 bg-[#0b1220] p-5 shadow-[0_10px_30px_rgba(2,6,23,0.45)]"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-blue-300 ring-1 ring-slate-700">
                <MetricIcon metric={item.metric} />
              </div>
              <p className="text-3xl font-semibold text-slate-100">{item.value}</p>
              <p className="mt-1 text-sm text-slate-400">{item.title}</p>
            </div>

            <div className="flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-1 ring-1 ring-slate-700">
              <TrendIcon trend={item.trend} />
              <span
                className={[
                  "text-sm font-semibold",
                  item.trend === "down" ? "text-rose-400" : "text-emerald-400",
                ].join(" ")}
              >
                {item.change}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
