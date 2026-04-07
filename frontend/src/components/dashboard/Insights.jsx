import { 
  Sparkles, 
  Lightbulb, 
  Target, 
  TrendingUp, 
  Zap,
  RefreshCw,
  Brain,
  MessageSquare,
  ArrowRight,
  CheckCircle2
} from "lucide-react";

export default function Insights({
  items = [],
  insights = [],
  suggestions = [],
  loading = false,
  error = "",
  onRegenerate,
  mode = "both", // "both", "insights", "suggestions"
  title,
  subtitle
}) {
  const isDynamicMode = Boolean(
    insights.length || suggestions.length || loading || error || onRegenerate
  );

  // Get icon based on insight content
  const getInsightIcon = (text) => {
    if (text.toLowerCase().includes('productivity')) return <TrendingUp className="h-4 w-4" />;
    if (text.toLowerCase().includes('commit')) return <Zap className="h-4 w-4" />;
    if (text.toLowerCase().includes('pr') || text.toLowerCase().includes('pull request')) return <Target className="h-4 w-4" />;
    if (text.toLowerCase().includes('improve') || text.toLowerCase().includes('suggest')) return <Lightbulb className="h-4 w-4" />;
    return <Sparkles className="h-4 w-4" />;
  };

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-[#0b1220] via-[#0f172a] to-[#0b1220] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden relative">
      {/* Background Glow Effect */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
      
      {/* Header */}
      <div className="flex items-center justify-between gap-3 relative z-10 mb-5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/30 to-purple-500/30 text-indigo-300 ring-1 ring-indigo-500/40 shadow-lg shadow-indigo-500/20">
              <Brain className="h-5 w-5" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0b1220] animate-pulse"></div>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{title || "AI Insights"}</h2>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-yellow-400" />
              {subtitle || "Powered by Machine Learning"}
            </p>
          </div>
        </div>
        {onRegenerate ? (
          <button
            onClick={onRegenerate}
            className="group flex items-center gap-1.5 rounded-lg border border-slate-600/50 bg-slate-800/50 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700/50 hover:text-white hover:border-indigo-500/50 transition-all duration-200"
          >
            <RefreshCw className="h-3 w-3 group-hover:animate-spin" />
            Refresh
          </button>
        ) : null}
      </div>

      <div className="space-y-4 relative z-10">
        {isDynamicMode ? (
          <>
            {loading ? (
              <div className="rounded-xl bg-slate-800/50 p-5 ring-1 ring-slate-700/50 border border-slate-700/30">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-8 w-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
                    </div>
                    <div className="absolute inset-0 h-8 w-8 rounded-lg bg-indigo-500/20 animate-ping"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-200">AI is analyzing your data...</p>
                    <p className="text-xs text-slate-500 mt-0.5">Generating personalized insights</p>
                  </div>
                </div>
                <div className="mt-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            ) : null}

            {!loading && error ? (
              <div className="rounded-xl bg-gradient-to-r from-rose-900/30 to-red-900/20 p-4 ring-1 ring-rose-700/40 border border-rose-700/30">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-rose-500/20 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-rose-400" />
                  </div>
                  <p className="text-sm text-rose-200">{error}</p>
                </div>
              </div>
            ) : null}

            {!loading && !error ? (
              <>
                {/* Insights Section - Show if mode is "both" or "insights" */}
                {(mode === "both" || mode === "insights") && insights.length > 0 && (
                  <div className="rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-5 ring-1 ring-slate-700/50 border border-indigo-500/20 shadow-lg shadow-indigo-500/5">
                    {mode === "insights" && (
                      <div className="flex items-center gap-2 mb-4">
                        <div className="h-8 w-8 rounded-lg bg-indigo-500/20 flex items-center justify-center ring-1 ring-indigo-500/30">
                          <MessageSquare className="h-4 w-4 text-indigo-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">Key Insights</p>
                          <p className="text-xs text-slate-400">Analysis from your activity</p>
                        </div>
                      </div>
                    )}
                    <ul className="space-y-3">
                      {insights.map((line, idx) => (
                        <li 
                          key={`insight-${idx}`} 
                          className="flex items-start gap-3 text-sm text-slate-300 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors group cursor-default"
                        >
                          <div className="mt-0.5 h-6 w-6 rounded-md bg-indigo-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-500/30 transition-colors ring-1 ring-indigo-500/20">
                            {getInsightIcon(line)}
                          </div>
                          <span className="leading-relaxed">{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suggestions Section - Show if mode is "both" or "suggestions" */}
                {(mode === "both" || mode === "suggestions") && suggestions.length > 0 && (
                  <div className="rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-5 ring-1 ring-slate-700/50 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                    {mode === "suggestions" && (
                      <div className="flex items-center gap-2 mb-4">
                        <div className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center ring-1 ring-emerald-500/30">
                          <Lightbulb className="h-4 w-4 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">Smart Suggestions</p>
                          <p className="text-xs text-slate-400">Recommendations to improve</p>
                        </div>
                      </div>
                    )}
                    <ul className="space-y-3">
                      {suggestions.map((line, idx) => (
                        <li 
                          key={`suggestion-${idx}`} 
                          className="flex items-start gap-3 text-sm text-slate-300 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors group cursor-pointer"
                        >
                          <div className="mt-0.5 h-6 w-6 rounded-md bg-emerald-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/30 transition-colors ring-1 ring-emerald-500/20">
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          </div>
                          <span className="leading-relaxed">{line}</span>
                          <ArrowRight className="h-4 w-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity ml-auto flex-shrink-0" />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Empty State */}
                {((mode === "insights" && insights.length === 0) || 
                  (mode === "suggestions" && suggestions.length === 0) ||
                  (mode === "both" && insights.length === 0 && suggestions.length === 0)) && (
                  <div className="rounded-xl bg-slate-800/50 p-8 text-center ring-1 ring-slate-700/50 border border-slate-700/30">
                    <div className="h-12 w-12 rounded-xl bg-slate-700/50 flex items-center justify-center mx-auto mb-3">
                      <Sparkles className="h-6 w-6 text-slate-500" />
                    </div>
                    <p className="text-sm text-slate-400">No {mode === "insights" ? "insights" : mode === "suggestions" ? "suggestions" : "insights"} available yet.</p>
                    <p className="text-xs text-slate-500 mt-1">Continue your activity to generate insights</p>
                  </div>
                )}
              </>
            ) : null}
          </>
        ) : (
          // Static Items Mode
          <div className="space-y-3">
            {items.slice(0, 3).map((insight, index) => (
              <div
                key={insight.id}
                className="group rounded-xl bg-gradient-to-r from-slate-800/80 to-slate-900/80 p-4 ring-1 ring-slate-700/50 border border-slate-700/30 hover:border-indigo-500/30 hover:ring-indigo-500/20 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-500/30 transition-colors ring-1 ring-indigo-500/20">
                    {index === 0 ? <TrendingUp className="h-4 w-4 text-indigo-400" /> :
                     index === 1 ? <Target className="h-4 w-4 text-indigo-400" /> :
                     <Lightbulb className="h-4 w-4 text-indigo-400" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">{insight.title}</p>
                    <p className="mt-1 text-xs text-slate-400 leading-relaxed">{insight.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
