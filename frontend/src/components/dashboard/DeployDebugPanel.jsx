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
  Activity
} from "lucide-react";
import API_BASE_URL from "../../config/api";

function DeployDebugPanel() {
  const [debugData, setDebugData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
    
    // Auto-refresh every 30 seconds for debug panel
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

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-800 bg-[#0b1220] p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Terminal className="h-4 w-4 text-indigo-400" />
            Project Deploy Status
          </h3>
        </div>
        <div className="flex items-center justify-center py-4">
          <Loader className="h-5 w-5 text-indigo-400 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-800 bg-red-900/20 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Terminal className="h-4 w-4 text-red-400" />
            Project Deploy Status
          </h3>
          <button
            onClick={handleRefresh}
            className="p-1 rounded text-slate-400 hover:text-white"
          >
            <RefreshCw className="h-3 w-3" />
          </button>
        </div>
        <div className="text-center py-2">
          <AlertCircle className="h-4 w-4 text-red-400 mx-auto mb-1" />
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0b1220] p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Terminal className="h-4 w-4 text-indigo-400" />
          Project Deploy Status
        </h3>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-1 rounded text-slate-400 hover:text-white transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {debugData.length === 0 ? (
        <div className="text-center py-3">
          <AlertCircle className="h-4 w-4 text-slate-500 mx-auto mb-1" />
          <p className="text-slate-500 text-xs">No repositories found</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {debugData.map((repo, index) => (
            <div
              key={`${repo.repoName}-${index}`}
              className="rounded-lg border border-slate-700 bg-slate-800/50 overflow-hidden"
            >
              {/* Repo Header - Clickable */}
              <button
                onClick={() => toggleRepo(repo.repoName)}
                className="w-full flex items-center justify-between p-2.5 text-left hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {repo.loading ? (
                    <Loader className="h-3 w-3 text-blue-400 animate-spin" />
                  ) : repo.error ? (
                    <XCircle className="h-3 w-3 text-red-400" />
                  ) : (
                    <CheckCircle className="h-3 w-3 text-green-400" />
                  )}
                  <span className="text-xs font-medium text-white truncate max-w-[120px]">
                    {repo.repoName}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {repo.deploymentsCount > 0 && (
                    <span className="text-xs text-slate-400 bg-slate-700 px-1.5 py-0.5 rounded">
                      {repo.deploymentsCount}
                    </span>
                  )}
                  <span className={`text-xs transform transition-transform ${expandedRepo === repo.repoName ? 'rotate-90' : ''}`}>
                    ▶
                  </span>
                </div>
              </button>

              {/* Debug Info - Expandable */}
              {expandedRepo === repo.repoName && (
                <div className="px-3 pb-3 pt-1 border-t border-slate-700 bg-slate-900/30">
                  <div className="text-xs space-y-1.5">
                    {/* Debug Info Tree Structure */}
                    <div className="font-mono">
                      <div className="text-slate-500 mb-1">├── Debug Info</div>
                      
                      {/* Loading */}
                      <div className="flex items-center gap-2 pl-4">
                        <span className="text-slate-600">│</span>
                        <span className="text-slate-400">├── Loading:</span>
                        <span className={repo.loading ? "text-yellow-400" : "text-green-400"}>
                          {repo.loading ? "Yes" : "No"}
                        </span>
                      </div>

                      {/* Error */}
                      <div className="flex items-center gap-2 pl-4">
                        <span className="text-slate-600">│</span>
                        <span className="text-slate-400">├── Error:</span>
                        <span className={repo.error ? "text-red-400" : "text-green-400"}>
                          {repo.error || "None"}
                        </span>
                      </div>

                      {/* Deployments Count */}
                      <div className="flex items-center gap-2 pl-4">
                        <span className="text-slate-600">│</span>
                        <span className="text-slate-400">├── Deployments:</span>
                        <span className="text-blue-400 flex items-center gap-1">
                          <Database className="h-3 w-3" />
                          {repo.deploymentsCount}
                        </span>
                      </div>

                      {/* Token Exists */}
                      <div className="flex items-center gap-2 pl-4">
                        <span className="text-slate-600">│</span>
                        <span className="text-slate-400">└── Token:</span>
                        <span className={repo.tokenExists ? "text-green-400" : "text-red-400"}>
                          <Key className="h-3 w-3 inline mr-1" />
                          {repo.tokenExists ? "Yes" : "No"}
                        </span>
                      </div>
                    </div>

                    {/* Status Summary */}
                    <div className="pt-2 mt-2 border-t border-slate-700">
                      <div className="flex items-center gap-2">
                        <Activity className="h-3 w-3 text-indigo-400" />
                        <span className="text-slate-400">Status:</span>
                        {repo.loading ? (
                          <span className="text-yellow-400">Loading...</span>
                        ) : repo.error ? (
                          <span className="text-red-400">Error</span>
                        ) : (
                          <span className="text-green-400">Active</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-slate-700 flex items-center justify-between text-xs text-slate-500">
        <span>{debugData.length} repos</span>
        <span>Auto-refresh: 30s</span>
      </div>
    </div>
  );
}

export default DeployDebugPanel;
