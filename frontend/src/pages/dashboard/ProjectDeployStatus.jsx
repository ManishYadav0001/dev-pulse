import React, { useState, useEffect } from "react";
import {
  Terminal,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader,
  Database,
  Key,
  Activity,
  ChevronDown,
  ChevronRight,
  GitBranch,
  Clock
} from "lucide-react";
import API_BASE_URL from "../../config/api";

function ProjectDeployStatus() {
  const [debugData, setDebugData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedRepo, setExpandedRepo] = useState(null);

  const fetchDebugInfo = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/deploy/debug`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch debug info");
      }

      const data = await response.json();
      setDebugData(data.repos || []);
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
    fetchDebugInfo();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDebugInfo, 30 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDebugInfo();
  };

  const toggleRepo = (repoName) => {
    setExpandedRepo(expandedRepo === repoName ? null : repoName);
  };

  // Stats
  const totalRepos = debugData.length;
  const activeRepos = debugData.filter(r => !r.error && !r.loading).length;
  const reposWithErrors = debugData.filter(r => r.error).length;
  const totalDeployments = debugData.reduce((sum, r) => sum + r.deploymentsCount, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Terminal className="h-6 w-6 text-indigo-400" />
              Project Deploy Status
            </h1>
            <p className="text-slate-400">Debug information for all repositories</p>
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
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Terminal className="h-6 w-6 text-red-400" />
              Project Deploy Status
            </h1>
            <p className="text-slate-400">Debug information for all repositories</p>
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
            <Terminal className="h-6 w-6 text-indigo-400" />
            Repository Debug Information
          </h1>
          <p className="text-slate-400">Debug information for all repositories</p>
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
              <GitBranch className="h-5 w-5 text-blue-400" />
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
              <div className="text-2xl font-bold text-white">{activeRepos}</div>
              <div className="text-xs text-slate-400">Active</div>
            </div>
          </div>
        </div>
        
        <div className="rounded-xl border border-slate-800 bg-[#0b1220] p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-600/20">
              <XCircle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{reposWithErrors}</div>
              <div className="text-xs text-slate-400">With Errors</div>
            </div>
          </div>
        </div>
        
        <div className="rounded-xl border border-slate-800 bg-[#0b1220] p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-600/20">
              <Database className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{totalDeployments}</div>
              <div className="text-xs text-slate-400">Total Deployments</div>
            </div>
          </div>
        </div>
      </div>

      {/* Repository Debug List */}
      <div className="rounded-2xl border border-slate-800 bg-[#0b1220] p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-400" />
            Repository Debug Information
          </h3>
          <span className="text-sm text-slate-400">
            {debugData.length} repositories
          </span>
        </div>

        {debugData.length === 0 ? (
          <div className="text-center py-12">
            <Terminal className="h-16 w-16 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No repositories found</p>
            <p className="text-slate-500 text-sm mt-2">
              Check your GitHub token permissions
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {debugData.map((repo, index) => (
              <div
                key={`${repo.repoName}-${index}`}
                className="rounded-xl border border-slate-700 bg-slate-800/50 overflow-hidden"
              >
                {/* Repo Header - Clickable */}
                <button
                  onClick={() => toggleRepo(repo.repoName)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {repo.loading ? (
                      <Loader className="h-5 w-5 text-blue-400 animate-spin" />
                    ) : repo.error ? (
                      <XCircle className="h-5 w-5 text-red-400" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    )}
                    <div>
                      <span className="text-sm font-medium text-white">
                        {repo.repoName}
                      </span>
                      {repo.deploymentsCount > 0 && (
                        <span className="ml-2 text-xs text-slate-400 bg-slate-700 px-2 py-0.5 rounded-full">
                          {repo.deploymentsCount} deployments
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      repo.loading ? 'bg-yellow-500/20 text-yellow-400' :
                      repo.error ? 'bg-red-500/20 text-red-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {repo.loading ? 'Loading' : repo.error ? 'Error' : 'Active'}
                    </span>
                    {expandedRepo === repo.repoName ? (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Debug Info - Expandable */}
                {expandedRepo === repo.repoName && (
                  <div className="px-4 pb-4 pt-2 border-t border-slate-700 bg-slate-900/30">
                    <div className="font-mono text-sm space-y-2">
                      {/* Debug Info Tree Structure */}
                      <div className="text-slate-300">
                        <div className="text-slate-500 mb-2">├── Debug Info</div>
                        
                        {/* Loading */}
                        <div className="flex items-center gap-3 pl-4">
                          <span className="text-slate-600">│</span>
                          <span className="text-slate-400 w-24">├── Loading:</span>
                          <span className={repo.loading ? "text-yellow-400" : "text-green-400"}>
                            {repo.loading ? "Yes" : "No"}
                          </span>
                        </div>

                        {/* Error */}
                        <div className="flex items-start gap-3 pl-4">
                          <span className="text-slate-600">│</span>
                          <span className="text-slate-400 w-24">├── Error:</span>
                          <span className={repo.error ? "text-red-400" : "text-green-400"}>
                            {repo.error || "None"}
                          </span>
                        </div>

                        {/* Deployments Count */}
                        <div className="flex items-center gap-3 pl-4">
                          <span className="text-slate-600">│</span>
                          <span className="text-slate-400 w-24">├── Deployments:</span>
                          <span className="text-blue-400 flex items-center gap-1">
                            <Database className="h-4 w-4" />
                            {repo.deploymentsCount}
                          </span>
                        </div>

                        {/* Token Exists */}
                        <div className="flex items-center gap-3 pl-4">
                          <span className="text-slate-600">│</span>
                          <span className="text-slate-400 w-24">└── Token:</span>
                          <span className={repo.tokenExists ? "text-green-400" : "text-red-400"}>
                            <Key className="h-4 w-4 inline mr-1" />
                            {repo.tokenExists ? "Yes" : "No"}
                          </span>
                        </div>
                      </div>

                      {/* Status Summary */}
                      <div className="pt-3 mt-3 border-t border-slate-700">
                        <div className="flex items-center gap-3">
                          <Clock className="h-4 w-4 text-indigo-400" />
                          <span className="text-slate-400">Last Checked:</span>
                          <span className="text-slate-300">{new Date().toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>Auto-refresh every 30 seconds</span>
        <span>GitHub Actions API Debug Panel</span>
      </div>
    </div>
  );
}

export default ProjectDeployStatus;
