import React, { useState, useEffect } from "react";
import {
  Rocket,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  GitBranch,
  ExternalLink,
  Activity,
  BarChart3,
  TrendingUp
} from "lucide-react";
import API_BASE_URL from "../../config/api";

function DeployStatusPage() {
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState("all"); // all, with_workflows, without_workflows

  const fetchDeploymentStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/deploy/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch deployment status");
      }

      const data = await response.json();
      setDeployments(data.deployments || []);
      setLastUpdated(data.lastUpdated);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDeploymentStatus();
    
    // Auto-refresh every 2 minutes
    const interval = setInterval(fetchDeploymentStatus, 2 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDeploymentStatus();
  };

  const getStatusIcon = (status) => {
    const icons = {
      success: <CheckCircle className="h-5 w-5" />,
      failed: <XCircle className="h-5 w-5" />,
      running: <RefreshCw className="h-5 w-5 animate-spin" />,
      queued: <Clock className="h-5 w-5" />,
      no_deployments: <AlertCircle className="h-5 w-5" />,
      no_actions: <AlertCircle className="h-5 w-5" />,
      not_configured: <AlertCircle className="h-5 w-5" />,
      error: <AlertCircle className="h-5 w-5" />,
      unknown: <AlertCircle className="h-5 w-5" />
    };
    
    return icons[status] || icons.unknown;
  };

  const getStatusColor = (status) => {
    const colors = {
      success: "text-green-500 bg-green-500/10 border-green-500/20",
      failed: "text-red-500 bg-red-500/10 border-red-500/20",
      running: "text-blue-500 bg-blue-500/10 border-blue-500/20",
      queued: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
      no_deployments: "text-gray-400 bg-gray-500/10 border-gray-500/20",
      no_actions: "text-gray-400 bg-gray-500/10 border-gray-500/20",
      not_configured: "text-gray-400 bg-gray-500/10 border-gray-500/20",
      error: "text-orange-500 bg-orange-500/10 border-orange-500/20",
      unknown: "text-gray-400 bg-gray-500/10 border-gray-500/20"
    };
    
    return colors[status] || colors.unknown;
  };

  const getStatusText = (status) => {
    const texts = {
      success: "Deployed Successfully",
      failed: "Deployment Failed",
      running: "Deploying...",
      queued: "Queued",
      no_deployments: "No Deployments",
      no_actions: "No GitHub Actions",
      not_configured: "Not Configured",
      error: "Error",
      unknown: "Unknown Status"
    };
    
    return texts[status] || texts.unknown;
  };

  // Filter deployments
  const filteredDeployments = deployments.filter(deployment => {
    if (filter === "all") return true;
    if (filter === "with_workflows") return deployment.status !== 'no_actions';
    if (filter === "without_workflows") return deployment.status === 'no_actions';
    return true;
  });

  // Stats
  const totalRepos = deployments.length;
  const reposWithWorkflows = deployments.filter(d => d.status !== 'no_actions').length;
  const reposWithoutWorkflows = deployments.filter(d => d.status === 'no_actions').length;
  const successfulDeployments = deployments.filter(d => d.status === 'success').length;
  const failedDeployments = deployments.filter(d => d.status === 'failed').length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Deployment Status</h1>
            <p className="text-slate-400">Monitor deployment status across all repositories</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Deployment Status</h1>
            <p className="text-slate-400">Monitor deployment status across all repositories</p>
          </div>
        </div>
        <div className="rounded-2xl border border-red-800 bg-red-900/20 p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
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
            <Rocket className="h-6 w-6 text-indigo-400" />
            Deployment Status
          </h1>
          <p className="text-slate-400">Monitor deployment status across all repositories</p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-sm text-slate-400">
              Updated {new Date(lastUpdated).toLocaleTimeString()}
            </span>
          )}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-[#0b1220] p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-600/20">
              <Activity className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{totalRepos}</div>
              <div className="text-xs text-slate-400">Total Repositories</div>
            </div>
          </div>
        </div>
        
        <div className="rounded-xl border border-slate-800 bg-[#0b1220] p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-600/20">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{reposWithWorkflows}</div>
              <div className="text-xs text-slate-400">With Workflows</div>
            </div>
          </div>
        </div>
        
        <div className="rounded-xl border border-slate-800 bg-[#0b1220] p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-600/20">
              <TrendingUp className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{successfulDeployments}</div>
              <div className="text-xs text-slate-400">Successful</div>
            </div>
          </div>
        </div>
        
        <div className="rounded-xl border border-slate-800 bg-[#0b1220] p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-600/20">
              <XCircle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{failedDeployments}</div>
              <div className="text-xs text-slate-400">Failed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-400">Filter:</span>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Repositories</option>
          <option value="with_workflows">With Workflows</option>
          <option value="without_workflows">Without Workflows</option>
        </select>
      </div>

      {/* Deployments List */}
      <div className="rounded-2xl border border-slate-800 bg-[#0b1220] p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-400" />
            Repository Status
          </h3>
          <span className="text-sm text-slate-400">
            Showing {filteredDeployments.length} of {deployments.length} repositories
          </span>
        </div>

        {filteredDeployments.length === 0 ? (
          <div className="text-center py-12">
            <Rocket className="h-16 w-16 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No repositories found</p>
            <p className="text-slate-500 text-sm mt-2">
              {filter !== "all" ? "Try changing the filter" : "Check your GitHub token permissions"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDeployments.map((deployment, index) => (
              <div
                key={`${deployment.repoName}-${index}`}
                className="flex items-center justify-between p-4 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg border ${getStatusColor(deployment.status)}`}>
                    {getStatusIcon(deployment.status)}
                  </div>
                  <div>
                    <div className="font-medium text-white flex items-center gap-2">
                      {deployment.fullName || deployment.repoName}
                      {deployment.workflowName && (
                        <GitBranch className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                    <div className="text-sm text-slate-400">
                      {deployment.platform}
                      {deployment.workflowName && (
                        <span className="ml-2 text-xs text-slate-500">
                          {deployment.workflowName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={`text-sm font-medium ${getStatusColor(deployment.status).split(' ')[0]}`}>
                      {getStatusText(deployment.status)}
                    </div>
                    <div className="text-sm text-slate-400">
                      {deployment.formattedTime}
                    </div>
                    {deployment.runNumber && (
                      <div className="text-xs text-slate-500">
                        Run #{deployment.runNumber}
                      </div>
                    )}
                  </div>
                  
                  {deployment.status !== 'no_actions' && deployment.status !== 'error' && (
                    <button
                      onClick={() => {
                        const githubUrl = `https://github.com/${deployment.fullName || deployment.repoName}/actions`;
                        window.open(githubUrl, '_blank');
                      }}
                      className="p-2 rounded-lg bg-slate-700 text-slate-400 hover:text-white hover:bg-slate-600 transition-colors"
                      title="View on GitHub"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>Auto-refresh every 2 minutes</span>
        <span>GitHub Actions API</span>
      </div>
    </div>
  );
}

export default DeployStatusPage;
