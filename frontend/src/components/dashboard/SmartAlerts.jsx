import React from "react";
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Clock,
  GitPullRequest,
  Hammer,
  XCircle,
  CheckCircle2,
  Zap,
  ArrowRight
} from "lucide-react";

function SmartAlerts({ alerts = [], alertsSummary = [], alertRecommendations = [], loading = false }) {
  // Get severity icon
  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
      default:
        return <AlertCircle className="h-5 w-5 text-blue-400" />;
    }
  };

  // Get severity color
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'border-red-500/30 bg-red-500/10 text-red-400';
      case 'warning':
        return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400';
      default:
        return 'border-blue-500/30 bg-blue-500/10 text-blue-400';
    }
  };

  // Get alert type icon
  const getAlertTypeIcon = (type) => {
    switch (type) {
      case 'inactive':
        return <Clock className="h-4 w-4" />;
      case 'pr_delay':
        return <GitPullRequest className="h-4 w-4" />;
      case 'build_failure':
        return <Hammer className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Count total alerts and by severity
  const totalAlerts = alerts.reduce((sum, repo) => sum + repo.alerts.length, 0);
  const criticalCount = alerts.reduce((sum, repo) => 
    sum + repo.alerts.filter(a => a.severity === 'critical').length, 0);
  const warningCount = alerts.reduce((sum, repo) => 
    sum + repo.alerts.filter(a => a.severity === 'warning').length, 0);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-[#0b1220] p-6 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-slate-800"></div>
          <div className="h-6 w-32 bg-slate-800 rounded"></div>
        </div>
        <div className="space-y-3">
          <div className="h-20 bg-slate-800 rounded-xl"></div>
          <div className="h-20 bg-slate-800 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-[#0b1220] via-[#0f172a] to-[#0b1220] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden relative">
      {/* Background Glow Effect */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl"></div>
      
      {/* Header */}
      <div className="flex items-center justify-between gap-3 relative z-10 mb-5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500/30 to-orange-500/30 text-rose-400 ring-1 ring-rose-500/40 shadow-lg shadow-rose-500/20">
              <Bell className="h-5 w-5" />
            </div>
            {totalAlerts > 0 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#0b1220] animate-pulse flex items-center justify-center">
                <span className="text-[8px] font-bold text-white">{totalAlerts}</span>
              </div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Smart Alerts</h3>
            <p className="text-xs text-slate-400">Repository Health Monitoring</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {criticalCount > 0 && (
            <span className="text-xs text-red-400 bg-red-500/20 px-2 py-1 rounded-full border border-red-500/30">
              {criticalCount} Critical
            </span>
          )}
          {warningCount > 0 && (
            <span className="text-xs text-yellow-400 bg-yellow-500/20 px-2 py-1 rounded-full border border-yellow-500/30">
              {warningCount} Warning
            </span>
          )}
        </div>
      </div>

      {/* AI Summary Panel */}
      {(alertsSummary.length > 0 || alertRecommendations.length > 0) && (
        <div className="mb-6 relative z-10 rounded-xl bg-gradient-to-r from-slate-800/80 to-slate-900/80 p-4 ring-1 ring-slate-700/50 border border-indigo-500/20">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-4 w-4 text-yellow-400" />
            <span className="text-sm font-semibold text-white">AI Summary</span>
          </div>
          
          {alertsSummary.length > 0 && (
            <div className="mb-3">
              {alertsSummary.map((summary, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm text-slate-300 mb-1">
                  <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <span>{summary}</span>
                </div>
              ))}
            </div>
          )}
          
          {alertRecommendations.length > 0 && (
            <div className="border-t border-slate-700/50 pt-3">
              <div className="text-xs text-slate-400 mb-2">Recommendations:</div>
              {alertRecommendations.slice(0, 3).map((rec, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm text-slate-300 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <div className="text-center py-8 relative z-10">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-3 ring-1 ring-emerald-500/30">
            <CheckCircle2 className="h-6 w-6 text-emerald-400" />
          </div>
          <p className="text-slate-400 text-sm">All systems healthy!</p>
          <p className="text-slate-500 text-xs mt-1">No alerts detected in your repositories</p>
        </div>
      ) : (
        <div className="space-y-4 relative z-10">
          {alerts.map((repoAlert, repoIdx) => (
            <div 
              key={repoIdx}
              className="rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-4 ring-1 ring-slate-700/50"
            >
              {/* Repo Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-slate-700/50 flex items-center justify-center">
                    <span className="text-xs font-bold text-slate-400">
                      {repoAlert.repoName.split('/')[1]?.charAt(0).toUpperCase() || 'R'}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-white">{repoAlert.repoName}</span>
                </div>
                <span className="text-xs text-slate-500">
                  {repoAlert.alerts.length} alert{repoAlert.alerts.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              {/* Alert Items */}
              <div className="space-y-2">
                {repoAlert.alerts.map((alert, alertIdx) => (
                  <div 
                    key={alertIdx}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
                  >
                    <div className="mt-0.5">
                      {getSeverityIcon(alert.severity)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="p-1 rounded bg-slate-800/50">
                          {getAlertTypeIcon(alert.type)}
                        </div>
                        <span className="text-sm font-medium">{alert.message}</span>
                      </div>
                      {alert.details && (
                        <p className="text-xs opacity-80">{alert.details}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SmartAlerts;
