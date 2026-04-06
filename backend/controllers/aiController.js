const { generateAIInsights } = require("../services/aiInsightsService");

const getAIInsights = async (req, res) => {
  try {
    const { stats, charts, recentActivity, force } = req.body || {};

    if (!stats || !charts || !recentActivity) {
      return res
        .status(400)
        .json({ message: "stats, charts, and recentActivity are required." });
    }

    const result = await generateAIInsights({
      userId: req.user.id,
      stats,
      charts,
      recentActivity,
      force: Boolean(force),
    });

    if (result.error) {
      return res.status(503).json({
        message: result.message || "AI service unavailable.",
        insights: [],
        suggestions: [],
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to generate insights.",
      insights: [],
      suggestions: [],
    });
  }
};

module.exports = { getAIInsights };

