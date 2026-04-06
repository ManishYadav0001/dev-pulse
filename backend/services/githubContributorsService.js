const axios = require("axios");

const CACHE_TTL_MS = 5 * 60 * 1000;
const contributorsCache = new Map();

const isGithubForbidden = (error) =>
  error?.response?.status === 403 || error?.response?.status === 429;

const createGithubClient = (accessToken) =>
  axios.create({
    baseURL: "https://api.github.com",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

const toArray = (value) => (Array.isArray(value) ? value : []);

const getCached = (cacheKey) => {
  const cached = contributorsCache.get(cacheKey);
  if (!cached) return null;
  if (Date.now() - cached.createdAt > CACHE_TTL_MS) {
    contributorsCache.delete(cacheKey);
    return null;
  }
  return cached.value;
};

const setCached = (cacheKey, value) => {
  contributorsCache.set(cacheKey, { createdAt: Date.now(), value });
};

const fetchPaginated = async ({ githubClient, endpoint, params = {}, maxPages = 2 }) => {
  const all = [];
  for (let page = 1; page <= maxPages; page += 1) {
    const response = await githubClient.get(endpoint, { params: { ...params, page } });
    const items = toArray(response.data);
    all.push(...items);
    if (items.length < (params.per_page || 100)) break;
  }
  return all;
};

const fetchContributors = async ({ accessToken }) => {
  if (!accessToken) return { noData: true, reason: "missing_token" };

  const cacheKey = `contributors:${accessToken.slice(-8)}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const githubClient = createGithubClient(accessToken);

  let login = "";
  try {
    const me = await githubClient.get("/user");
    login = String(me.data?.login || "");
  } catch (error) {
    if (isGithubForbidden(error)) return { noData: true, reason: "rate_limit" };
    if (error.response?.status === 401) return { noData: true, reason: "invalid_token" };
    throw error;
  }

  if (!login) return { noData: true, reason: "invalid_profile" };

  let repos = [];
  try {
    repos = await fetchPaginated({
      githubClient,
      endpoint: "/user/repos",
      params: { affiliation: "owner", sort: "updated", per_page: 100 },
      maxPages: 2,
    });
  } catch (error) {
    if (isGithubForbidden(error)) return { noData: true, reason: "rate_limit" };
    if (error.response?.status === 401) return { noData: true, reason: "invalid_token" };
    throw error;
  }

  const selectedRepos = [...repos]
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 12);

  const perRepo = selectedRepos.map(async (repo) => {
    try {
      const resp = await githubClient.get(`/repos/${login}/${repo.name}/contributors`, {
        params: { per_page: 5 },
      });
      const topUsers = toArray(resp.data)
        .slice(0, 5)
        .map((u) => ({
          username: u.login,
          contributions: u.contributions || 0,
          avatar: u.avatar_url || "",
        }));

      const totalContributions = topUsers.reduce((sum, u) => sum + (u.contributions || 0), 0);

      return {
        repoName: repo.name,
        totalContributions,
        topUsers,
      };
    } catch (error) {
      // Private repo restrictions or disabled contributors stats
      if (error.response?.status === 404 || error.response?.status === 403) {
        return { repoName: repo.name, totalContributions: 0, topUsers: [] };
      }
      return { repoName: repo.name, totalContributions: 0, topUsers: [] };
    }
  });

  const results = await Promise.all(perRepo);
  const value = {
    contributors: results,
  };
  setCached(cacheKey, value);
  return value;
};

module.exports = { fetchContributors };

