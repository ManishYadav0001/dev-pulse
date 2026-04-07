import React, { useState, useEffect } from "react";
import {
  Rocket,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  GitBranch,
  ExternalLink
} from "lucide-react";
import API_BASE_URL from "../../config/api";

function DeployStatusCard() {
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
      success: <CheckCircle className="h-4 w-4" />,
      failed: <XCircle className="h-4 w-4" />,
      running: <RefreshCw className="h-4 w-4 animate-spin" />,
      queued: <Clock className="h-4 w-4" />,
      no_deployments: <AlertCircle className="h-4 w-4" />,
      no_actions: <AlertCircle className="h-4 w-4" />,
      not_configured: <AlertCircle className="h-4 w-4" />,
      error: <AlertCircle className="h-4 w-4" />,
      unknown: <AlertCircle className="h-4 w-4" />
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

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-[#0b1220] p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-indigo-400" />
            <h3 className="text-lg font-semibold text-white">Deployment Status</h3>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-800 bg-red-900/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-red-400" />
            <h3 className="text-lg font-semibold text-white">Deployment Status</h3>
          </div>
        </div>
        <div className="text-center py-4">
          <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-3 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0b1220] p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Rocket className="h-5 w-5 text-indigo-400" />
          <h3 className="text-lg font-semibold text-white">Deployment Status</h3>
          {lastUpdated && (
            <span className="text-xs text-slate-400">
              Updated {new Date(lastUpdated).toLocaleTimeString()}
            </span>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {deployments.length === 0 ? (
        <div className="text-center py-8">
          <Rocket className="h-12 w-12 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No repositories found</p>
          <p className="text-slate-500 text-xs mt-2">
            Check your GitHub token permissions
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {deployments.map((deployment, index) => (
            <div
              key={`${deployment.repoName}-${index}`}
              className="flex items-center justify-between p-3 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg border ${getStatusColor(deployment.status)}`}>
                  {getStatusIcon(deployment.status)}
                </div>
                <div>
                  <div className="font-medium text-white flex items-center gap-2">
                    {deployment.repoName}
                    {deployment.workflowName && (
                      <GitBranch className="h-3 w-3 text-slate-400" />
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
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className={`text-sm font-medium ${getStatusColor(deployment.status).split(' ')[0]}`}>
                    {getStatusText(deployment.status)}
                  </div>
                  <div className="text-xs text-slate-400">
                    {deployment.formattedTime}
                  </div>
                  {deployment.runNumber && (
                    <div className="text-xs text-slate-500">
                      #{deployment.runNumber}
                    </div>
                  )}
                </div>
                
                {deployment.status !== 'no_actions' && deployment.status !== 'error' && (
                  <button
                    onClick={() => {
                      // Extract owner from full repo name if available, otherwise use current user
                      const repoFullName = deployment.fullName || deployment.repoName;
                      const githubUrl = `https://github.com/${repoFullName}/actions`;
                      window.open(githubUrl, '_blank');
                    }}
                    className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                    title="View on GitHub"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {deployments.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{deployments.length} repositories monitored</span>
            <span>Auto-refresh every 2 minutes</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeployStatusCard;
