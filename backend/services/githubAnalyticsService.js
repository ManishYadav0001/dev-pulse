const axios = require("axios");

const CACHE_TTL_MS = 5 * 60 * 1000;
const analyticsCache = new Map();

const isGithubForbidden = (error) =>
  error?.response?.status === 403 || error?.response?.status === 429;

const formatDateKey = (value) => new Date(value).toISOString().slice(0, 10);

const toArray = (value) => (Array.isArray(value) ? value : []);

const sortByDate = (items) => items.sort((a, b) => new Date(a.date) - new Date(b.date));
const dedupeByKey = (items, keySelector) => {
  const seen = new Set();
  const output = [];
  for (const item of items) {
    const key = keySelector(item);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    output.push(item);
  }
  return output;
};

const buildPRMetrics = (pullRequests) => {
  console.log(`[PR METRICS] Processing ${pullRequests.length} pull requests`);
  
  if (!pullRequests || pullRequests.length === 0) {
    console.log('[PR METRICS] No pull requests to process');
    return {
      totalPRs: 0,
      mergedPRs: 0,
      openPRs: 0,
      avgMergeTime: 0,
      avgReviewTime: 0,
      bottlenecks: [],
      mergeTimeDistribution: null
    };
  }

  // Log first PR for debugging
  if (pullRequests[0]) {
    console.log('[PR METRICS] Sample PR:', {
      state: pullRequests[0].state,
      merged_at: pullRequests[0].merged_at,
      created_at: pullRequests[0].created_at,
      updated_at: pullRequests[0].updated_at
    });
  }

  const mergedPRs = pullRequests.filter(pr => {
    const hasMergedAt = pr.merged_at && pr.merged_at !== null && pr.merged_at !== '';
    if (hasMergedAt) {
      console.log(`[PR METRICS] Found merged PR: ${pr.title || 'No title'}, merged_at: ${pr.merged_at}`);
    }
    return hasMergedAt;
  });
  
  const openPRs = pullRequests.filter(pr => pr.state === 'open');
  
  console.log(`[PR METRICS] Merged PRs: ${mergedPRs.length}, Open PRs: ${openPRs.length}`);
  
  // Calculate merge times (in hours)
  const mergeTimes = mergedPRs.map(pr => {
    try {
      const created = new Date(pr.created_at);
      const merged = new Date(pr.merged_at);
      
      if (isNaN(created.getTime()) || isNaN(merged.getTime())) {
        console.log(`[PR METRICS] Invalid dates for PR: ${pr.title}, created: ${pr.created_at}, merged: ${pr.merged_at}`);
        return null;
      }
      
      const diffHours = (merged - created) / (1000 * 60 * 60); // hours
      console.log(`[PR METRICS] Merge time for "${pr.title}": ${diffHours.toFixed(2)} hours`);
      return diffHours;
    } catch (err) {
      console.error(`[PR METRICS] Error calculating merge time: ${err.message}`);
      return null;
    }
  }).filter(time => time !== null && time > 0 && time < 30 * 24); // filter out unrealistic times (>30 days)
  
  // Calculate review times (approximate using first update or merge time)
  const reviewTimes = pullRequests.map(pr => {
    try {
      const created = new Date(pr.created_at);
      const reviewEnd = pr.merged_at ? new Date(pr.merged_at) : new Date(pr.updated_at);
      
      if (isNaN(created.getTime()) || isNaN(reviewEnd.getTime())) {
        return null;
      }
      
      return (reviewEnd - created) / (1000 * 60 * 60); // hours
    } catch (err) {
      return null;
    }
  }).filter(time => time !== null && time > 0 && time < 30 * 24);
  
  console.log(`[PR METRICS] Valid merge times: ${mergeTimes.length}, Valid review times: ${reviewTimes.length}`);
  
  const avgMergeTime = mergeTimes.length > 0 
    ? mergeTimes.reduce((sum, time) => sum + time, 0) / mergeTimes.length 
    : 0;
    
  const avgReviewTime = reviewTimes.length > 0 
    ? reviewTimes.reduce((sum, time) => sum + time, 0) / reviewTimes.length 
    : 0;
  
  console.log(`[PR METRICS] Avg merge time: ${avgMergeTime.toFixed(2)}h, Avg review time: ${avgReviewTime.toFixed(2)}h`);
  
  // Bottleneck detection
  const bottlenecks = [];
  
  if (avgMergeTime > 48) { // > 48 hours
    bottlenecks.push({
      type: 'slow_merge',
      severity: avgMergeTime > 120 ? 'critical' : 'warning',
      message: `PR merge process is slow (${avgMergeTime.toFixed(1)}h average) - possible bottleneck`,
      suggestion: 'Consider increasing reviewer availability or automating merge processes'
    });
  }
  
  if (openPRs.length > 5) {
    bottlenecks.push({
      type: 'review_backlog',
      severity: openPRs.length > 10 ? 'critical' : 'warning',
      message: `High number of pending PRs (${openPRs.length}) - review backlog detected`,
      suggestion: 'Assign more reviewers or implement PR triage process'
    });
  }
  
  if (avgReviewTime > avgMergeTime * 1.5 && avgReviewTime > 24) {
    bottlenecks.push({
      type: 'review_inefficiency',
      severity: avgReviewTime > 72 ? 'critical' : 'warning',
      message: `Review phase is taking longer than merge phase (${avgReviewTime.toFixed(1)}h vs ${avgMergeTime.toFixed(1)}h) - inefficiency detected`,
      suggestion: 'Streamline review process and provide better review guidelines'
    });
  }
  
  return {
    totalPRs: pullRequests.length,
    mergedPRs: mergedPRs.length,
    openPRs: openPRs.length,
    avgMergeTime: Math.round(avgMergeTime * 10) / 10, // 1 decimal place
    avgReviewTime: Math.round(avgReviewTime * 10) / 10,
    bottlenecks,
    mergeTimeDistribution: mergeTimes.length > 0 ? {
      min: Math.min(...mergeTimes),
      max: Math.max(...mergeTimes),
      median: mergeTimes.sort((a, b) => a - b)[Math.floor(mergeTimes.length / 2)]
    } : null
  };
};

const buildAnalytics = ({ commitEvents, pullRequests, issues }) => {
  const commitMap = new Map();
  const prMap = new Map();

  for (const commit of commitEvents) {
    const date = formatDateKey(commit.date);
    commitMap.set(date, (commitMap.get(date) || 0) + 1);
  }

  for (const pr of pullRequests) {
    const openedDate = formatDateKey(pr.created_at);
    const dateData = prMap.get(openedDate) || { opened: 0, merged: 0 };
    dateData.opened += 1;
    if (pr.merged_at) {
      dateData.merged += 1;
    }
    prMap.set(openedDate, dateData);
  }

  const commitsOverTime = sortByDate(
    [...commitMap.entries()].map(([date, count]) => ({ date, count }))
  );
  const prActivity = sortByDate(
    [...prMap.entries()].map(([date, values]) => ({
      date,
      opened: values.opened,
      merged: values.merged,
    }))
  );

  const commits = commitEvents.length;
  const pullRequestsCount = pullRequests.length;
  const issuesResolved = issues.filter((issue) => Boolean(issue.closed_at)).length;
  const productivityScore = Number(
    (commits * 0.4 + pullRequestsCount * 0.4 + issuesResolved * 0.2).toFixed(2)
  );

  // Calculate PR metrics
  const prMetrics = buildPRMetrics(pullRequests);

  const recentActivity = [
    ...commitEvents.slice(0, 6).map((item) => ({
      type: "commit",
      repo: item.repo,
      message: item.message,
      date: item.date,
      stats: item.stats || { additions: 0, deletions: 0, total: 0, files: 0 },
      previousComparison: item.previousComparison
    })),
    ...pullRequests.slice(0, 6).map((item) => ({
      type: item.merged_at ? "merge" : "pr",
      repo: item.repo,
      message: item.title,
      date: item.merged_at || item.created_at,
    })),
    ...issues.slice(0, 6).map((item) => ({
      type: "issue",
      repo: item.repo,
      message: item.title,
      date: item.closed_at || item.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

  return {
    stats: {
      commits,
      pullRequests: pullRequestsCount,
      issuesResolved,
      productivityScore,
    },
    charts: {
      commitsOverTime,
      prActivity,
    },
    prMetrics,
    recentActivity,
  };
};

const buildRepoInsights = ({ repo, commits, pullRequests, issues }) => {
  const commitsMap = new Map();
  const prMap = new Map();

  for (const commit of commits) {
    const date = formatDateKey(commit.date);
    commitsMap.set(date, (commitsMap.get(date) || 0) + 1);
  }

  for (const pr of pullRequests) {
    const date = formatDateKey(pr.created_at);
    const current = prMap.get(date) || { opened: 0, merged: 0 };
    current.opened += 1;
    if (pr.merged_at) current.merged += 1;
    prMap.set(date, current);
  }

  const commitsOverTime = sortByDate(
    [...commitsMap.entries()].map(([date, count]) => ({ date, count }))
  );
  const prActivity = sortByDate(
    [...prMap.entries()].map(([date, values]) => ({
      date,
      opened: values.opened,
      merged: values.merged,
    }))
  );

  const recentActivity = [
    ...commits.slice(0, 4).map((item) => ({
      type: "commit",
      repo: item.repo,
      message: item.message,
      date: item.date,
      stats: item.stats || { additions: 0, deletions: 0, total: 0, files: 0 },
      previousComparison: item.previousComparison
    })),
    ...pullRequests.slice(0, 4).map((item) => ({
      type: item.merged_at ? "merge" : "pr",
      repo: item.repo,
      message: item.title,
      date: item.merged_at || item.created_at,
    })),
    ...issues.slice(0, 4).map((item) => ({
      type: "issue",
      repo: item.repo,
      message: item.title,
      date: item.closed_at || item.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  return {
    name: repo.name,
    stars: repo.stargazers_count || 0,
    forks: repo.forks_count || 0,
    language: repo.language || "",
    commits: commits.length,
    pullRequests: pullRequests.length,
    issuesResolved: issues.filter((item) => Boolean(item.closed_at)).length,
    lastUpdated: repo.updated_at,
    commitsOverTime,
    prActivity,
    recentActivity,
  };
};

const getCached = (cacheKey) => {
  const cached = analyticsCache.get(cacheKey);
  if (!cached) return null;
  if (Date.now() - cached.createdAt > CACHE_TTL_MS) {
    analyticsCache.delete(cacheKey);
    return null;
  }
  return cached.data;
};

const setCached = (key, data) => {
  analyticsCache.set(key, {
    data,
    timestamp: Date.now(),
  });
};

const createGithubClient = (accessToken) =>
  axios.create({
    baseURL: "https://api.github.com",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

const fetchPaginated = async ({ githubClient, endpoint, params = {}, maxPages = 5 }) => {
  const all = [];
  for (let page = 1; page <= maxPages; page += 1) {
    const response = await githubClient.get(endpoint, {
      params: { ...params, page },
    });
    const items = toArray(response.data);
    all.push(...items);
    if (items.length < (params.per_page || 100)) {
      break;
    }
  }
  return all;
};

const fetchGitHubAnalytics = async ({ accessToken, githubUsername }) => {
  if (!accessToken) {
    return { noData: true, reason: "missing_token" };
  }

  const cacheKey = `oauth:${String(githubUsername || "unknown")}:${accessToken.slice(-8)}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return cached;
  }

  const githubClient = createGithubClient(accessToken);
  let normalizedUsername = String(githubUsername || "").trim().toLowerCase();

  try {
    const meResp = await githubClient.get("/user");
    if (!normalizedUsername) {
      normalizedUsername = String(meResp.data?.login || "").toLowerCase();
    }
  } catch (error) {
    if (isGithubForbidden(error)) {
      return { noData: true, reason: "rate_limit" };
    }
    if (error.response?.status === 401) return { noData: true, reason: "invalid_token" };
    throw error;
  }

  if (!normalizedUsername) {
    return { noData: true, reason: "invalid_profile" };
  }

  let repos = [];
  try {
    repos = await fetchPaginated({
      githubClient,
      endpoint: "/user/repos",
      params: {
        affiliation: "owner",
        sort: "updated",
        per_page: 100,
      },
      maxPages: 3,
    });
  } catch (error) {
    if (isGithubForbidden(error)) {
      return { noData: true, reason: "rate_limit" };
    }
    if (error.response?.status === 401) return { noData: true, reason: "invalid_token" };
    throw error;
  }

  if (!repos.length) {
    return {
      stats: { commits: 0, pullRequests: 0, issuesResolved: 0, productivityScore: 0 },
      charts: { commitsOverTime: [], prActivity: [] },
      recentActivity: [],
      repositories: [],
    };
  }

  const sortedRepos = [...repos].sort(
    (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
  );

  // Performance knobs:
  // - overall analytics: broader set
  // - repo cards/modal: smaller set with per-repo breakdown
  const OVERALL_REPOS_LIMIT = 25;
  const REPO_INSIGHTS_LIMIT = 12;

  const overallRepos = sortedRepos.slice(0, OVERALL_REPOS_LIMIT);
  const repoInsightsSet = new Set(
    sortedRepos.slice(0, REPO_INSIGHTS_LIMIT).map((r) => r.name)
  );

  const perRepoRequests = overallRepos.map(async (repo) => {
    const repoName = repo.name;
    const includeRepoInsights = repoInsightsSet.has(repoName);

    const commitsPages = includeRepoInsights ? 3 : 2;
    const pullsPages = includeRepoInsights ? 3 : 2;
    const issuesPages = includeRepoInsights ? 3 : 2;

    const [authorCommits, committerCommits, pullsAll, issuesAll] = await Promise.all([
      fetchPaginated({
        githubClient,
        endpoint: `/repos/${normalizedUsername}/${repoName}/commits`,
        params: { author: normalizedUsername, per_page: 100 },
        maxPages: commitsPages,
      }),
      fetchPaginated({
        githubClient,
        endpoint: `/repos/${normalizedUsername}/${repoName}/commits`,
        params: { committer: normalizedUsername, per_page: 100 },
        maxPages: commitsPages,
      }),
      fetchPaginated({
        githubClient,
        endpoint: `/repos/${normalizedUsername}/${repoName}/pulls`,
        params: { state: "all", per_page: 100 },
        maxPages: pullsPages,
      }),
      fetchPaginated({
        githubClient,
        endpoint: `/repos/${normalizedUsername}/${repoName}/issues`,
        params: { state: "all", creator: normalizedUsername, per_page: 100 },
        maxPages: issuesPages,
      }),
    ]);

    const uniqueCommits = dedupeByKey(
      [...authorCommits, ...committerCommits],
      (item) => item?.sha
    );

    // Fetch detailed commit stats for lines added/removed
    const commitsWithStats = await Promise.all(
      uniqueCommits.slice(0, 50).map(async (commit, index) => {
        try {
          const commitDetail = await githubClient.get(
            `/repos/${normalizedUsername}/${repoName}/commits/${commit.sha}`
          );
          
          const stats = commitDetail.data?.stats || {};
          const additions = stats.additions || 0;
          const deletions = stats.deletions || 0;
          const total = additions + deletions;
          
          // Calculate comparison with previous commit
          let previousComparison = null;
          if (index > 0 && uniqueCommits[index - 1]) {
            const previousCommitSha = uniqueCommits[index - 1].sha;
            try {
              const compareResponse = await githubClient.get(
                `/repos/${normalizedUsername}/${repoName}/compare/${previousCommitSha}...${commit.sha}`
              );
              
              const compareStats = compareResponse.data?.files?.reduce((acc, file) => {
                acc.additions += file.additions || 0;
                acc.deletions += file.deletions || 0;
                acc.changes += file.changes || 0;
                return acc;
              }, { additions: 0, deletions: 0, changes: 0 });
              
              previousComparison = {
                additions: compareStats.additions,
                deletions: compareStats.deletions,
                total: compareStats.additions + compareStats.deletions,
                files: compareResponse.data?.files?.length || 0,
                aheadBy: compareResponse.data?.ahead_by || 0,
                behindBy: compareResponse.data?.behind_by || 0
              };
            } catch (compareError) {
              // Fallback if comparison fails
              previousComparison = {
                additions: 0,
                deletions: 0,
                total: 0,
                files: 0,
                aheadBy: 0,
                behindBy: 0
              };
            }
          }
          
          return {
            sha: commit.sha,
            repo: repoName,
            message: commit.commit?.message || "Commit",
            date: commit.commit?.author?.date || commit.commit?.committer?.date || new Date().toISOString(),
            stats: {
              additions,
              deletions,
              total,
              files: commitDetail.data?.files?.length || 0
            },
            previousComparison
          };
        } catch (error) {
          // Fallback if detailed fetch fails
          return {
            sha: commit.sha,
            repo: repoName,
            message: commit.commit?.message || "Commit",
            date: commit.commit?.author?.date || commit.commit?.committer?.date || new Date().toISOString(),
            stats: {
              additions: 0,
              deletions: 0,
              total: 0,
              files: 0
            },
            previousComparison: null
          };
        }
      })
    );

    const pullRequests = pullsAll
      .filter((pr) => pr?.user?.login?.toLowerCase() === normalizedUsername)
      .map((pr) => ({
        id: pr.id,
        repo: repoName,
        title: pr.title || "Pull request",
        created_at: pr.created_at,
        merged_at: pr.merged_at,
        state: pr.state,
        updated_at: pr.updated_at,
        closed_at: pr.closed_at,
      }));

    const issues = issuesAll
      .filter((issue) => !issue.pull_request)
      .map((issue) => ({
        id: issue.id,
        repo: repoName,
        title: issue.title || "Issue",
        created_at: issue.created_at,
        closed_at: issue.closed_at,
      }));

    return {
      commits: commitsWithStats,
      pullRequests,
      issues,
      repository: includeRepoInsights
        ? buildRepoInsights({ repo, commits: commitsWithStats, pullRequests, issues })
        : null,
    };
  });

  const results = await Promise.allSettled(perRepoRequests);

  const commitEvents = [];
  const pullRequests = [];
  const issues = [];
  const repositories = [];
  for (const result of results) {
    if (result.status !== "fulfilled") {
      if (isGithubForbidden(result.reason)) {
        return { noData: true, reason: "rate_limit" };
      }
      continue;
    }
    commitEvents.push(...result.value.commits);
    pullRequests.push(...result.value.pullRequests);
    issues.push(...result.value.issues);
    if (result.value.repository) repositories.push(result.value.repository);
  }

  const analytics = buildAnalytics({
    commitEvents: dedupeByKey(commitEvents, (item) => item.sha || `${item.repo}:${item.date}:${item.message}`),
    pullRequests: dedupeByKey(pullRequests, (item) => item.id || `${item.repo}:${item.created_at}:${item.title}`),
    issues: dedupeByKey(issues, (item) => item.id || `${item.repo}:${item.created_at}:${item.title}`),
  });
  analytics.repositories = repositories.sort(
    (a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated)
  );
  setCached(cacheKey, analytics);
  return analytics;
};

module.exports = {
  fetchGitHubAnalytics,
};
