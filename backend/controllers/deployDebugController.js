const deployDebugService = require("../services/deployDebugService");

const getDeployDebugInfo = async (req, res) => {
  try {
    const debugInfo = await deployDebugService.fetchAllDebugInfo();

    return res.status(200).json({
      repos: debugInfo,
      totalRepos: debugInfo.length,
      lastUpdated: new Date().toISOString(),
      tokenConfigured: !!process.env.GITHUB_TOKEN
    });

  } catch (error) {
    console.error("Deploy debug info fetch error:", error.message);
    return res.status(500).json({ 
      message: "Failed to fetch deploy debug info",
      error: error.message,
      repos: [{
        repoName: "N/A",
        loading: false,
        error: `Server error: ${error.message}`,
        deploymentsCount: 0,
        tokenExists: !!process.env.GITHUB_TOKEN
      }]
    });
  }
};

module.exports = {
  getDeployDebugInfo
};
