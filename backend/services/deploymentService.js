const axios = require("axios");

class DeploymentService {
  constructor() {
    this.githubToken = process.env.GITHUB_TOKEN;
    
    if (!this.githubToken) {
      console.warn('GITHUB_TOKEN not found in environment variables');
    }
  }

  async fetchAllUserRepos() {
    try {
      const allRepos = [];
      let page = 1;
      const perPage = 100;
      let hasMore = true;

      // Fetch all pages of repos
      while (hasMore && page <= 5) { // Max 500 repos (5 pages × 100)
        const response = await axios.get(
          'https://api.github.com/user/repos',
          {
            headers: {
              'Authorization': `token ${this.githubToken}`,
              'Accept': 'application/vnd.github.v3+json'
            },
            params: {
              per_page: perPage,
              page: page,
              sort: 'updated',
              direction: 'desc'
            }
          }
        );

        const repos = response.data;
        if (repos.length === 0) {
          hasMore = false;
        } else {
          allRepos.push(...repos.map(repo => ({
            fullName: repo.full_name,
            name: repo.name,
            owner: repo.owner.login,
            updatedAt: repo.updated_at,
            hasWorkflows: false
          })));
          page++;
        }
      }

      console.log(`Total repos fetched from GitHub: ${allRepos.length}`);
      return allRepos;

    } catch (error) {
      console.error('Error fetching user repos:', error.message);
      return [];
    }
  }

  async checkRepoHasWorkflows(owner, repo) {
    try {
      const response = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/actions/workflows`,
        {
          headers: {
            'Authorization': `token ${this.githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      return response.data.workflows && response.data.workflows.length > 0;
    } catch (error) {
      if (error.response?.status === 404) {
        return false;
      }
      console.error(`Error checking workflows for ${owner}/${repo}:`, error.message);
      return false;
    }
  }

  async fetchGitHubActionsStatus(repoFullName) {
    try {
      const [owner, repo] = repoFullName.split('/');
      
      const response = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/actions/runs`,
        {
          headers: {
            'Authorization': `token ${this.githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
          },
          params: {
            per_page: 10,
            event: 'push'
          }
        }
      );

      const runs = response.data.workflow_runs || [];
      
      if (runs.length === 0) {
        return {
          fullName: repoFullName,
          repoName: repo,
          platform: 'GitHub Actions',
          status: 'no_deployments',
          lastDeployed: null
        };
      }

      // Get the most recent successful run or latest run if none successful
      const latestRun = runs[0];
      const lastSuccessfulRun = runs.find(run => run.conclusion === 'success') || latestRun;

      let status = 'unknown';
      if (lastSuccessfulRun.conclusion === 'success') {
        status = 'success';
      } else if (lastSuccessfulRun.conclusion === 'failure') {
        status = 'failed';
      } else if (lastSuccessfulRun.status === 'in_progress') {
        status = 'running';
      } else if (lastSuccessfulRun.status === 'queued') {
        status = 'queued';
      }

      return {
        fullName: repoFullName,
        repoName: repo,
        platform: 'GitHub Actions',
        status,
        lastDeployed: lastSuccessfulRun.updated_at || lastSuccessfulRun.created_at,
        workflowName: lastSuccessfulRun.name,
        runNumber: lastSuccessfulRun.run_number
      };

    } catch (error) {
      console.error(`Error fetching GitHub Actions status for ${repoFullName}:`, error.message);
      
      if (error.response?.status === 404) {
        return {
          fullName: repoFullName,
          repoName: repoFullName.split('/')[1],
          platform: 'GitHub Actions',
          status: 'no_actions',
          lastDeployed: null
        };
      }

      return {
        fullName: repoFullName,
        repoName: repoFullName.split('/')[1],
        platform: 'GitHub Actions',
        status: 'error',
        lastDeployed: null,
        error: error.message
      };
    }
  }

  async fetchVercelStatus(repoName) {
    // Placeholder for future Vercel integration
    return {
      repoName,
      platform: 'Vercel',
      status: 'not_configured',
      lastDeployed: null
    };
  }

  async fetchRailwayStatus(repoName) {
    // Placeholder for future Railway integration
    return {
      repoName,
      platform: 'Railway',
      status: 'not_configured',
      lastDeployed: null
    };
  }

  async fetchAllDeploymentStatus() {
    if (!this.githubToken) {
      console.warn('GITHUB_TOKEN not found, cannot fetch deployment status');
      return [];
    }

    try {
      // Step 1: Fetch all user repos
      const allRepos = await this.fetchAllUserRepos();
      
      if (allRepos.length === 0) {
        console.warn('No repositories found for user');
        return [];
      }

      console.log(`Found ${allRepos.length} repositories, checking for GitHub Actions...`);

      // Step 2: Check each repo for workflows and build status (in parallel batches)
      const allDeployments = [];
      const batchSize = 10; // Process 10 repos at a time
      
      for (let i = 0; i < allRepos.length; i += batchSize) {
        const batch = allRepos.slice(i, i + batchSize);
        const batchPromises = batch.map(async (repo) => {
          const hasWorkflows = await this.checkRepoHasWorkflows(repo.owner, repo.name);
          
          if (hasWorkflows) {
            // Fetch detailed deployment status for repos with workflows
            return await this.fetchGitHubActionsStatus(repo.fullName);
          } else {
            // Return basic info for repos without workflows
            return {
              fullName: repo.fullName,
              repoName: repo.name,
              platform: 'GitHub Actions',
              status: 'no_actions',
              lastDeployed: null,
              workflowName: null,
              runNumber: null
            };
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        allDeployments.push(...batchResults);
        
        // Small delay between batches to be nice to GitHub API
        if (i + batchSize < allRepos.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      const reposWithWorkflows = allDeployments.filter(d => d.status !== 'no_actions');
      console.log(`${reposWithWorkflows.length} out of ${allDeployments.length} repositories have GitHub Actions workflows`);

      // Sort by last deployed date (most recent first), but put repos with workflows first
      const sortedDeployments = allDeployments.sort((a, b) => {
        // First, sort by whether they have workflows (workflows first)
        if (a.status !== 'no_actions' && b.status === 'no_actions') return -1;
        if (a.status === 'no_actions' && b.status !== 'no_actions') return 1;
        
        // Then sort by last deployed date
        if (!a.lastDeployed) return 1;
        if (!b.lastDeployed) return -1;
        return new Date(b.lastDeployed) - new Date(a.lastDeployed);
      });

      console.log(`Returning deployment status for ${sortedDeployments.length} repositories`);
      return sortedDeployments;

    } catch (error) {
      console.error('Error fetching deployment status:', error);
      return [];
    }
  }

  formatDeploymentTime(timestamp) {
    if (!timestamp) return 'Never';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  }

  getStatusIcon(status) {
    const icons = {
      success: '✅',
      failed: '❌',
      running: '🔄',
      queued: '⏳',
      no_deployments: '⚪',
      no_actions: '⚪',
      not_configured: '⚪',
      error: '⚠️',
      unknown: '❓'
    };
    
    return icons[status] || icons.unknown;
  }

  getStatusColor(status) {
    const colors = {
      success: 'text-green-500',
      failed: 'text-red-500',
      running: 'text-blue-500',
      queued: 'text-yellow-500',
      no_deployments: 'text-gray-400',
      no_actions: 'text-gray-400',
      not_configured: 'text-gray-400',
      error: 'text-orange-500',
      unknown: 'text-gray-400'
    };
    
    return colors[status] || colors.unknown;
  }
}

module.exports = new DeploymentService();
