import React from "react";
import {
  GitPullRequest,
  Clock,
  Timer,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Zap,
  ArrowRight
} from "lucide-react";

function PRInsights({ prMetrics, prInsights = [], prSuggestions = [], loading = false }) {
  // Format hours to seconds for display
  const formatHours = (hours) => {
    if (hours === null || hours === undefined) return "No data";
    if (hours === 0) return "0s";
    
    // Convert hours to seconds
    const seconds = Math.round(hours * 3600);
    
    // Format based on duration
    if (seconds < 60) return `${seconds}s`; // Less than 1 minute
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`; // Less than 1 hour
    if (seconds < 86400) {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      return `${h}h ${m}m`; // Less than 1 day
    }
    
    // More than 1 day
    const days = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    return `${days}d ${h}h`;
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-[#0b1220] p-6 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-slate-800"></div>
          <div className="h-6 w-32 bg-slate-800 rounded"></div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="h-20 bg-slate-800 rounded-xl"></div>
          <div className="h-20 bg-slate-800 rounded-xl"></div>
          <div className="h-20 bg-slate-800 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!prMetrics || prMetrics.totalPRs === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-[#0b1220] p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/30">
            <GitPullRequest className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">PR Insights</h3>
            <p className="text-xs text-slate-400">Pull Request Analytics</p>
          </div>
        </div>
        <div className="text-center py-8">
          <GitPullRequest className="h-12 w-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No PR data available</p>
          <p className="text-slate-500 text-xs mt-1">No merged pull requests found in your repositories</p>
          <p className="text-slate-600 text-xs mt-2">Note: Only PRs created by you are counted</p>
        </div>
      </div>
    );
  }

  const { avgMergeTime, avgReviewTime, openPRs, totalPRs, mergedPRs, bottlenecks = [] } = prMetrics;

  // Get severity color
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'warning': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    }
  };

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-[#0b1220] via-[#0f172a] to-[#0b1220] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden relative">
      {/* Background Glow Effect */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
      
      {/* Header */}
      <div className="flex items-center justify-between gap-3 relative z-10 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/30 to-purple-500/30 text-indigo-400 ring-1 ring-indigo-500/40 shadow-lg shadow-indigo-500/20">
            <GitPullRequest className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">PR Insights</h3>
            <p className="text-xs text-slate-400">Pull Request Analytics</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 bg-slate-800/50 px-2 py-1 rounded-full">
            {totalPRs} Total
          </span>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 relative z-10">
        {/* Avg Merge Time */}
        <div className="rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-4 ring-1 ring-slate-700/50 border border-indigo-500/20">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/20 flex items-center justify-center ring-1 ring-indigo-500/30">
              <Clock className="h-4 w-4 text-indigo-400" />
            </div>
            <span className="text-xs text-slate-400">Avg Merge Time</span>
          </div>
          <div className="text-2xl font-bold text-white">{formatHours(avgMergeTime)}</div>
          <div className="text-xs text-slate-500 mt-1">
            {mergedPRs > 0 ? `From ${mergedPRs} merged PRs` : 'No merged PRs yet'}
          </div>
        </div>

        {/* Avg Review Time */}
        <div className="rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-4 ring-1 ring-slate-700/50 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-lg bg-purple-500/20 flex items-center justify-center ring-1 ring-purple-500/30">
              <Timer className="h-4 w-4 text-purple-400" />
            </div>
            <span className="text-xs text-slate-400">Avg Review Time</span>
          </div>
          <div className="text-2xl font-bold text-white">{formatHours(avgReviewTime)}</div>
          <div className="text-xs text-slate-500 mt-1">
            {mergedPRs > 0 || prMetrics.totalPRs > 0 ? `Based on ${prMetrics.totalPRs} PRs` : 'No PRs available'}
          </div>
        </div>

        {/* Pending PRs */}
        <div className="rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-4 ring-1 ring-slate-700/50 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center ring-1 ring-emerald-500/30">
              <GitPullRequest className="h-4 w-4 text-emerald-400" />
            </div>
            <span className="text-xs text-slate-400">Pending PRs</span>
          </div>
          <div className="text-2xl font-bold text-white">{openPRs}</div>
          <div className="text-xs text-slate-500 mt-1">
            Currently open
          </div>
        </div>
      </div>

      {/* No Merged PRs Message */}
      {prMetrics.totalPRs > 0 && mergedPRs === 0 && (
        <div className="mb-6 relative z-10 rounded-lg p-3 bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-start gap-2 text-sm text-blue-300">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">No merged PRs yet.</span>
              <span className="block text-xs text-blue-400 mt-1">
                You have {openPRs} open PR{openPRs !== 1 ? 's' : ''}. Metrics will be calculated once PRs are merged.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Bottlenecks */}
      {bottlenecks && bottlenecks.length > 0 && (
        <div className="mb-6 relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
            <span className="text-sm font-semibold text-white">Detected Bottlenecks</span>
          </div>
          <div className="space-y-2">
            {bottlenecks.map((bottleneck, idx) => (
              <div 
                key={idx}
                className={`rounded-lg p-3 border ${getSeverityColor(bottleneck.severity)}`}
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">{bottleneck.message}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Insights */}
      {prInsights.length > 0 && (
        <div className="mb-6 relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/20 flex items-center justify-center ring-1 ring-indigo-500/30">
              <TrendingUp className="h-4 w-4 text-indigo-400" />
            </div>
            <span className="text-sm font-bold text-white">AI Insights</span>
          </div>
          <div className="space-y-2">
            {prInsights.map((insight, idx) => (
              <div 
                key={idx}
                className="flex items-start gap-3 text-sm text-slate-300 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
              >
                <div className="mt-0.5 h-6 w-6 rounded-md bg-indigo-500/20 flex items-center justify-center flex-shrink-0 ring-1 ring-indigo-500/20">
                  <Zap className="h-3 w-3 text-indigo-400" />
                </div>
                <span className="leading-relaxed">{insight}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {prSuggestions.length > 0 && (
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center ring-1 ring-emerald-500/30">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </div>
            <span className="text-sm font-bold text-white">Recommendations</span>
          </div>
          <div className="space-y-2">
            {prSuggestions.map((suggestion, idx) => (
              <div 
                key={idx}
                className="flex items-start gap-3 text-sm text-slate-300 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors group cursor-pointer"
              >
                <div className="mt-0.5 h-6 w-6 rounded-md bg-emerald-500/20 flex items-center justify-center flex-shrink-0 ring-1 ring-emerald-500/20">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                </div>
                <span className="leading-relaxed">{suggestion}</span>
                <ArrowRight className="h-4 w-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity ml-auto flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PRInsights;
