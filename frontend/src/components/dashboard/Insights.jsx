import { Sparkles } from "lucide-react";

export default function Insights({ items = [] }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0b1220] p-5 shadow-[0_10px_30px_rgba(2,6,23,0.45)]">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/30">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-100">AI Insights</h2>
          <p className="text-sm text-slate-400">Smart suggestions for your week</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {items.slice(0, 3).map((insight) => (
          <div
            key={insight.id}
            className="rounded-2xl bg-slate-900/70 p-4 ring-1 ring-slate-700"
          >
            <p className="text-sm font-semibold text-slate-200">{insight.title}</p>
            <p className="mt-1 text-sm text-slate-400">{insight.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
