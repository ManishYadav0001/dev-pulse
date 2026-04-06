const User = require("../models/User");
const { fetchGitHubAnalytics } = require("../services/githubAnalyticsService");

const getDashboard = async (req, res) => {
  try {
    if (req.user.role === "admin") {
      const developers = await User.find({ role: "developer" })
        .select("_id name email githubUsername githubAvatar")
        .sort({ createdAt: -1 });

      return res.status(200).json({
        role: "admin",
        developers,
      });
    }

    const currentUser = await User.findById(req.user.id).select(
      "_id name email role githubUsername githubAvatar +accessToken"
    );
    if (!currentUser) {
      return res.status(404).json({ message: "User not found." });
    }

    const analytics = await fetchGitHubAnalytics({
      accessToken: currentUser.accessToken,
      githubUsername: currentUser.githubUsername,
    });

    if (analytics.noData) {
      const message =
        analytics.reason === "missing_token"
          ? "GitHub not connected. Please continue with GitHub to load analytics."
          : analytics.reason === "invalid_token"
            ? "GitHub connection expired. Please reconnect GitHub."
            : analytics.reason === "rate_limit"
              ? "GitHub API rate limit reached for your token. Please try again shortly."
          : "Failed to fetch GitHub analytics.";
      return res.status(200).json({
        role: "developer",
        user: currentUser,
        noData: true,
        message,
      });
    }

    return res.status(200).json({
      role: "developer",
      user: currentUser,
      ...analytics,
    });
  } catch (error) {
    console.error("Dashboard fetch error:", error.message);
    return res.status(500).json({ message: "Failed to fetch dashboard data." });
  }
};

module.exports = { getDashboard };
