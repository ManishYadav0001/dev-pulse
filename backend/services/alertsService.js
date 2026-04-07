const axios = require("axios");

class AlertsService {
  constructor() {
    this.githubToken = process.env.GITHUB_TOKEN;
  }

  /**
   * Detect alerts for all user repositories
   */
  async detectAlertsForUser(githubUsername, accessToken) {
    if (!accessToken) {
      return [];
    }

    try {
      const githubClient = axios.create({
        baseURL: "https://api.github.com",
        headers: {
          Authorization: `token ${accessToken}`,
          Accept: "application/vnd.github.v3+json"
        }
      });

      // Fetch all repos
      const repos = await this.fetchAllUserRepos(githubClient);
      
      if (repos.length === 0) {
        return [];
      }

      // Detect alerts for each repo (in batches)
      const repoAlerts = [];
      const batchSize = 5;
      
      for (let i = 0; i < repos.length; i += batchSize) {
        const batch = repos.slice(i, i + batchSize);
        const batchPromises = batch.map(repo => 
          this.detectRepoAlerts(githubClient, repo)
        );
        
        const batchResults = await Promise.all(batchPromises);
        repoAlerts.push(...batchResults.filter(result => result.alerts.length > 0));
        
        // Small delay between batches
        if (i + batchSize < repos.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      return repoAlerts;

    } catch (error) {
      console.error("[ALERTS] Error detecting alerts:", error.message);
      return [];
    }
  }

  /**
   * Fetch all user repositories
   */
  async fetchAllUserRepos(githubClient) {
    try {
      const allRepos = [];
      let page = 1;
      const perPage = 100;
      let hasMore = true;

      while (hasMore && page <= 5) {
        const response = await githubClient.get('/user/repos', {
          params: {
            per_page: perPage,
            page: page,
            sort: 'updated',
            direction: 'desc'
          }
        });

        const repos = response.data;
        if (repos.length === 0) {
          hasMore = false;
        } else {
          allRepos.push(...repos.map(repo => ({
            fullName: repo.full_name,
            name: repo.name,
            owner: repo.owner.login,
            updatedAt: repo.updated_at,
            pushedAt: repo.pushed_at
          })));
          page++;
        }
      }

      return allRepos;
    } catch (error) {
      console.error("[ALERTS] Error fetching repos:", error.message);
      return [];
    }
  }

  /**
   * Detect alerts for a specific repository
   */
  async detectRepoAlerts(githubClient, repo) {
    const alerts = [];
    const [owner, repoName] = repo.fullName.split('/');

    try {
      // 1. Check for inactive repository (no commits in 21 days)
      const inactivityAlert = await this.checkInactivity(githubClient, owner, repoName, repo.pushedAt);
      if (inactivityAlert) {
        alerts.push(inactivityAlert);
      }

      // 2. Check for PRs pending too long (> 3 days)
      const prAlerts = await this.checkPendingPRs(githubClient, owner, repoName);
      alerts.push(...prAlerts);

      // 3. Check for build failures (last 3 runs failed)
      const buildAlert = await this.checkBuildFailures(githubClient, owner, repoName);
      if (buildAlert) {
        alerts.push(buildAlert);
      }

    } catch (error) {
      console.error(`[ALERTS] Error checking ${repo.fullName}:`, error.message);
    }

    return {
      repoName: repo.fullName,
      alerts
    };
  }

  /**
   * Check if repository is inactive (no commits in 21 days)
   */
  async checkInactivity(githubClient, owner, repoName, pushedAt) {
    try {
      // Fetch latest commit
      const response = await githubClient.get(
        `/repos/${owner}/${repoName}/commits`,
        { params: { per_page: 1 } }
      );

      if (response.data.length === 0) {
        return {
          type: "inactive",
          message: "Repository has no commits",
          severity: "warning",
          details: "No commit history found"
        };
      }

      const lastCommitDate = new Date(response.data[0].commit.committer.date);
      const now = new Date();
      const daysSinceLastCommit = (now - lastCommitDate) / (1000 * 60 * 60 * 24);

      if (daysSinceLastCommit > 21) {
        return {
          type: "inactive",
          message: `Repository is inactive for over 3 weeks`,
          severity: "warning",
          details: `Last commit was ${Math.round(daysSinceLastCommit)} days ago`
        };
      }

      return null;
    } catch (error) {
      if (error.response?.status === 404) {
        return null; // No commits yet
      }
      console.error(`[ALERTS] Error checking inactivity for ${repoName}:`, error.message);
      return null;
    }
  }

  /**
   * Check for PRs pending too long (> 3 days)
   */
  async checkPendingPRs(githubClient, owner, repoName) {
    const alerts = [];
    
    try {
      const response = await githubClient.get(
        `/repos/${owner}/${repoName}/pulls`,
        { params: { state: 'open', per_page: 10 } }
      );

      const openPRs = response.data;
      const now = new Date();

      for (const pr of openPRs) {
        const createdDate = new Date(pr.created_at);
        const daysOpen = (now - createdDate) / (1000 * 60 * 60 * 24);

        if (daysOpen > 3) {
          alerts.push({
            type: "pr_delay",
            message: `PR #${pr.number} has been pending for more than 3 days`,
            severity: "warning",
            details: `Open for ${Math.round(daysOpen)} days: ${pr.title}`,
            prNumber: pr.number,
            prTitle: pr.title
          });
        }
      }

    } catch (error) {
      console.error(`[ALERTS] Error checking PRs for ${repoName}:`, error.message);
    }

    return alerts;
  }

  /**
   * Check for build failures (last 3 runs failed)
   */
  async checkBuildFailures(githubClient, owner, repoName) {
    try {
      const response = await githubClient.get(
        `/repos/${owner}/${repoName}/actions/runs`,
        { params: { per_page: 3 } }
      );

      const runs = response.data.workflow_runs || [];
      
      if (runs.length === 0) {
        return null; // No CI runs
      }

      // Check if last 3 runs failed
      const failedRuns = runs.filter(run => run.conclusion === 'failure');
      
      if (failedRuns.length >= 3) {
        return {
          type: "build_failure",
          message: "Build failing repeatedly — check CI pipeline",
          severity: "critical",
          details: `Last ${failedRuns.length} workflow runs failed`,
          failedCount: failedRuns.length
        };
      }

      // Check if last 2 runs failed (warning)
      if (failedRuns.length === 2) {
        return {
          type: "build_failure",
          message: "Recent builds are failing",
          severity: "warning",
          details: `Last 2 workflow runs failed`,
          failedCount: failedRuns.length
        };
      }

      return null;
    } catch (error) {
      if (error.response?.status === 404) {
        return null; // No GitHub Actions
      }
      console.error(`[ALERTS] Error checking builds for ${repoName}:`, error.message);
      return null;
    }
  }
}

module.exports = new AlertsService();
