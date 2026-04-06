const User = require("../models/User");
const { fetchGitHubAnalytics } = require("../services/githubAnalyticsService");

const getAdminUsers = async (_req, res) => {
  try {
    const users = await User.find({ role: "developer" })
      .select("_id name email githubUsername githubAvatar")
      .sort({ createdAt: -1 });

    return res.status(200).json(users);
  } catch (error) {
    console.error("Admin users fetch error:", error.message);
    return res.status(500).json({ message: "Failed to fetch users." });
  }
};

const getUserDashboardByAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const targetUser = await User.findById(userId).select(
      "_id name email role githubUsername githubAvatar +accessToken"
    );

    if (!targetUser || targetUser.role !== "developer") {
      return res.status(404).json({ message: "Developer not found." });
    }

    const analytics = await fetchGitHubAnalytics({
      accessToken: targetUser.accessToken,
      githubUsername: targetUser.githubUsername,
    });
    if (analytics.noData) {
      const message =
        analytics.reason === "missing_token"
          ? "This developer has not connected GitHub yet."
          : analytics.reason === "invalid_token"
            ? "Developer's GitHub token expired. Ask them to reconnect GitHub."
            : analytics.reason === "rate_limit"
              ? "GitHub API rate limit reached. Please try again shortly."
          : "Failed to fetch GitHub analytics.";
      return res.status(200).json({
        user: targetUser,
        noData: true,
        message,
      });
    }

    return res.status(200).json({
      user: targetUser,
      ...analytics,
    });
  } catch (error) {
    console.error("Admin dashboard fetch error:", error.message);
    return res.status(500).json({ message: "Failed to fetch user dashboard." });
  }
};

module.exports = {
  getAdminUsers,
  getUserDashboardByAdmin,
};
