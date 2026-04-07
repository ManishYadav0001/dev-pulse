const deploymentService = require("../services/deploymentService");

const getDeploymentStatus = async (req, res) => {
  try {
    const deploymentStatus = await deploymentService.fetchAllDeploymentStatus();
    
    // Format the response with additional metadata
    const formattedStatus = deploymentStatus.map(deployment => ({
      repoName: deployment.repoName,
      platform: deployment.platform,
      status: deployment.status,
      lastDeployed: deployment.lastDeployed,
      formattedTime: deploymentService.formatDeploymentTime(deployment.lastDeployed),
      statusIcon: deploymentService.getStatusIcon(deployment.status),
      statusColor: deploymentService.getStatusColor(deployment.status),
      workflowName: deployment.workflowName,
      runNumber: deployment.runNumber,
      error: deployment.error
    }));

    return res.status(200).json({
      deployments: formattedStatus,
      totalRepos: formattedStatus.length,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error("Deployment status fetch error:", error.message);
    return res.status(500).json({ 
      message: "Failed to fetch deployment status",
      error: error.message 
    });
  }
};

const getDeploymentStatusByRepo = async (req, res) => {
  try {
    const { repoName } = req.params;
    
    if (!repoName) {
      return res.status(400).json({ message: "Repository name is required" });
    }

    // Try to fetch the specific repo directly from GitHub
    try {
      const axios = require('axios');
      const token = process.env.GITHUB_TOKEN;
      
      // First, try to get the repo to verify it exists and get owner info
      const repoResponse = await axios.get(
        `https://api.github.com/repos/${repoName}`,
        {
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      const owner = repoResponse.data.owner.login;
      const repo = repoResponse.data.name;
      const repoFullName = `${owner}/${repo}`;

      const deploymentStatus = await deploymentService.fetchGitHubActionsStatus(repoFullName);
      
      const formattedStatus = {
        repoName: deploymentStatus.repoName,
        platform: deploymentStatus.platform,
        status: deploymentStatus.status,
        lastDeployed: deploymentStatus.lastDeployed,
        formattedTime: deploymentService.formatDeploymentTime(deploymentStatus.lastDeployed),
        statusIcon: deploymentService.getStatusIcon(deploymentStatus.status),
        statusColor: deploymentService.getStatusColor(deploymentStatus.status),
        workflowName: deploymentStatus.workflowName,
        runNumber: deploymentStatus.runNumber,
        error: deploymentStatus.error
      };

      return res.status(200).json(formattedStatus);

    } catch (error) {
      if (error.response?.status === 404) {
        return res.status(404).json({ message: "Repository not found" });
      }
      throw error;
    }

  } catch (error) {
    console.error("Repository deployment status fetch error:", error.message);
    return res.status(500).json({ 
      message: "Failed to fetch repository deployment status",
      error: error.message 
    });
  }
};

module.exports = {
  getDeploymentStatus,
  getDeploymentStatusByRepo
};
