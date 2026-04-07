const axios = require("axios");

class DeployDebugService {
  constructor() {
    this.githubToken = process.env.GITHUB_TOKEN;
  }

  async fetchAllUserRepos() {
    try {
      const allRepos = [];
      let page = 1;
      const perPage = 100;
      let hasMore = true;

      while (hasMore && page <= 5) {
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
            owner: repo.owner.login
          })));
          page++;
        }
      }

      return allRepos;
    } catch (error) {
      console.error('Error fetching user repos:', error.message);
      return [];
    }
  }

  async fetchRepoDebugInfo(repoFullName) {
    const debugInfo = {
      repoName: repoFullName,
      loading: true,
      error: null,
      deploymentsCount: 0,
      tokenExists: !!this.githubToken
    };

    if (!this.githubToken) {
      debugInfo.loading = false;
      debugInfo.error = "GITHUB_TOKEN not found";
      return debugInfo;
    }

    try {
      const [owner, repo] = repoFullName.split('/');
      
      // Fetch workflow runs
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
      debugInfo.deploymentsCount = runs.length;
      debugInfo.loading = false;

    } catch (error) {
      debugInfo.loading = false;
      
      if (error.response?.status === 404) {
        debugInfo.error = "No GitHub Actions workflows found";
      } else if (error.response?.status === 403) {
        debugInfo.error = "API rate limit exceeded";
      } else if (error.response?.status === 401) {
        debugInfo.error = "Invalid GitHub token";
      } else {
        debugInfo.error = error.message || "Unknown error";
      }
    }

    return debugInfo;
  }

  async fetchAllDebugInfo() {
    if (!this.githubToken) {
      return [{
        repoName: "N/A",
        loading: false,
        error: "GITHUB_TOKEN not configured in .env",
        deploymentsCount: 0,
        tokenExists: false
      }];
    }

    try {
      // Fetch all repos
      const repos = await this.fetchAllUserRepos();
      
      if (repos.length === 0) {
        return [{
          repoName: "N/A",
          loading: false,
          error: "No repositories found for user",
          deploymentsCount: 0,
          tokenExists: true
        }];
      }

      // Fetch debug info for each repo (in batches)
      const debugInfos = [];
      const batchSize = 5;
      
      for (let i = 0; i < repos.length; i += batchSize) {
        const batch = repos.slice(i, i + batchSize);
        const batchPromises = batch.map(repo => 
          this.fetchRepoDebugInfo(repo.fullName)
        );
        
        const batchResults = await Promise.all(batchPromises);
        debugInfos.push(...batchResults);
        
        // Small delay between batches
        if (i + batchSize < repos.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      return debugInfos;

    } catch (error) {
      return [{
        repoName: "N/A",
        loading: false,
        error: `Service error: ${error.message}`,
        deploymentsCount: 0,
        tokenExists: !!this.githubToken
      }];
    }
  }
}

module.exports = new DeployDebugService();
