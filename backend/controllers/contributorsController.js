const User = require("../models/User");
const { fetchContributors } = require("../services/githubContributorsService");

const getContributors = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("+accessToken");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const result = await fetchContributors({ accessToken: user.accessToken });
    if (result.noData) {
      const message =
        result.reason === "missing_token"
          ? "GitHub not connected. Please continue with GitHub."
          : result.reason === "invalid_token"
            ? "GitHub connection expired. Please reconnect GitHub."
            : result.reason === "rate_limit"
              ? "GitHub API rate limit reached. Please try again shortly."
              : "Failed to fetch contributors.";
      return res.status(200).json({ contributors: [], noData: true, message });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Contributors fetch error:", error.message);
    return res.status(500).json({ message: "Failed to fetch contributors." });
  }
};

module.exports = { getContributors };

