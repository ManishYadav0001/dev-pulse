import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
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
  ArrowRight,
  RefreshCw,
  Shield,
  TrendingUp,
  Activity,
  Filter
} from "lucide-react";
import API_BASE_URL from "../../config/api";

function SmartAlertsPage() {
  const { dashboard, loading } = useOutletContext();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState("all"); // all, critical, warning

  const alerts = dashboard?.alerts || [];
  const alertsSummary = dashboard?.alertsSummary || [];
  const alertRecommendations = dashboard?.alertRecommendations || [];

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.location.reload();
  };

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

  // Filter alerts
  const filteredAlerts = alerts.map(repoAlert => ({
    ...repoAlert,
    alerts: filter === "all" 
      ? repoAlert.alerts 
      : repoAlert.alerts.filter(a => a.severity === filter)
  })).filter(repoAlert => repoAlert.alerts.length > 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Bell className="h-6 w-6 text-rose-400" />
              Smart Alerts
            </h1>
            <p className="text-slate-400">Repository Health Monitoring</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bell className="h-6 w-6 text-rose-400" />
            Smart Alerts
          </h1>
          <p className="text-slate-400">Repository Health Monitoring & AI-Powered Insights</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-800 bg-[#0b1220] p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-600/20">
              <AlertTriangle className="h-5 w-5 text-rose-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{totalAlerts}</div>
              <div className="text-xs text-slate-400">Total Alerts</div>
            </div>
          </div>
        </div>
        
        <div className="rounded-xl border border-slate-800 bg-[#0b1220] p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-600/20">
              <XCircle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{criticalCount}</div>
              <div className="text-xs text-slate-400">Critical</div>
            </div>
          </div>
        </div>
        
        <div className="rounded-xl border border-slate-800 bg-[#0b1220] p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-600/20">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{warningCount}</div>
              <div className="text-xs text-slate-400">Warnings</div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Summary Panel */}
      {(alertsSummary.length > 0 || alertRecommendations.length > 0) && (
        <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-[#0b1220] via-[#0f172a] to-[#0b1220] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden relative">
          {/* Background Glow */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl"></div>
          
          <div className="flex items-center gap-2 mb-4 relative z-10">
            <div className="h-10 w-10 rounded-xl bg-yellow-500/20 flex items-center justify-center ring-1 ring-yellow-500/30">
              <Zap className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">AI-Powered Summary</h3>
              <p className="text-xs text-slate-400">Intelligent insights from your alerts</p>
            </div>
          </div>
          
          {alertsSummary.length > 0 && (
            <div className="mb-4 relative z-10">
              <div className="text-sm text-slate-400 mb-2">Key Insights:</div>
              <div className="space-y-2">
                {alertsSummary.map((summary, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm text-slate-300 p-3 rounded-lg bg-slate-800/50">
                    <TrendingUp className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span>{summary}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {alertRecommendations.length > 0 && (
            <div className="relative z-10">
              <div className="text-sm text-slate-400 mb-2">Recommendations:</div>
              <div className="space-y-2">
                {alertRecommendations.map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm text-slate-300 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors group cursor-pointer">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>{rec}</span>
                    <ArrowRight className="h-4 w-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity ml-auto flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-slate-400" />
        <span className="text-sm text-slate-400">Filter:</span>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
        >
          <option value="all">All Alerts</option>
          <option value="critical">Critical Only</option>
          <option value="warning">Warnings Only</option>
        </select>
      </div>

      {/* Alerts List */}
      <div className="rounded-2xl border border-slate-800 bg-[#0b1220] p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-rose-400" />
            Repository Alerts
          </h3>
          <span className="text-sm text-slate-400">
            {filteredAlerts.length} repositories with alerts
          </span>
        </div>

        {alerts.length === 0 ? (
          <div className="text-center py-12">
            <div className="h-16 w-16 rounded-xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-4 ring-1 ring-emerald-500/30">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>
            <p className="text-slate-400 text-lg">All systems healthy!</p>
            <p className="text-slate-500 text-sm mt-2">No alerts detected in your repositories</p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No alerts match the selected filter</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAlerts.map((repoAlert, repoIdx) => (
              <div 
                key={repoIdx}
                className="rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-5 ring-1 ring-slate-700/50"
              >
                {/* Repo Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-slate-700/50 flex items-center justify-center">
                      <span className="text-sm font-bold text-slate-400">
                        {repoAlert.repoName.split('/')[1]?.charAt(0).toUpperCase() || 'R'}
                      </span>
                    </div>
                    <div>
                      <span className="text-base font-medium text-white">{repoAlert.repoName}</span>
                      <div className="text-xs text-slate-500">
                        {repoAlert.alerts.length} alert{repoAlert.alerts.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Alert Items */}
                <div className="space-y-2">
                  {repoAlert.alerts.map((alert, alertIdx) => (
                    <div 
                      key={alertIdx}
                      className={`flex items-start gap-3 p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
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
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            alert.severity === 'critical' 
                              ? 'bg-red-500/30 text-red-300' 
                              : 'bg-yellow-500/30 text-yellow-300'
                          }`}>
                            {alert.severity}
                          </span>
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

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>Auto-refreshes on page reload</span>
        <span>AI-Powered Alert Detection</span>
      </div>
    </div>
  );
}

export default SmartAlertsPage;
