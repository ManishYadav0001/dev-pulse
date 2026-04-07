const User = require("../models/User");
const { fetchGitHubAnalytics } = require("../services/githubAnalyticsService");
const { generateAIInsights, generatePRInsights, generateAlertInsights } = require("../services/aiAnalyticsService");
const alertsService = require("../services/alertsService");

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

    // Generate AI insights using Python analytics
    let aiInsights = { insights: [], suggestions: [] };
    let prInsights = { prInsights: [], prSuggestions: [] };
    let alertInsights = { alertsSummary: [], alertRecommendations: [] };
    
    try {
      aiInsights = await generateAIInsights(analytics.stats);
      console.log("[DASHBOARD] AI insights generated successfully");
    } catch (error) {
      console.error("[DASHBOARD] Failed to generate AI insights:", error);
    }
    
    // Generate PR insights if prMetrics available
    if (analytics.prMetrics) {
      try {
        prInsights = await generatePRInsights(analytics.prMetrics);
        console.log("[DASHBOARD] PR insights generated successfully");
      } catch (error) {
        console.error("[DASHBOARD] Failed to generate PR insights:", error);
      }
    }
    
    // Detect alerts for repositories
    let alerts = [];
    try {
      alerts = await alertsService.detectAlertsForUser(
        currentUser.githubUsername,
        currentUser.accessToken
      );
      console.log(`[DASHBOARD] Detected alerts for ${alerts.length} repositories`);
      
      // Generate AI insights for alerts
      if (alerts.length > 0) {
        try {
          alertInsights = await generateAlertInsights({ alerts });
          console.log("[DASHBOARD] Alert insights generated successfully");
        } catch (error) {
          console.error("[DASHBOARD] Failed to generate alert insights:", error);
        }
      }
    } catch (error) {
      console.error("[DASHBOARD] Failed to detect alerts:", error);
    }

    return res.status(200).json({
      role: "developer",
      user: currentUser,
      ...analytics,
      aiInsights,
      prInsights: prInsights.prInsights || [],
      prSuggestions: prInsights.prSuggestions || [],
      alerts,
      alertsSummary: alertInsights.alertsSummary || [],
      alertRecommendations: alertInsights.alertRecommendations || [],
    });
  } catch (error) {
    console.error("Dashboard fetch error:", error.message);
    return res.status(500).json({ message: "Failed to fetch dashboard data." });
  }
};

module.exports = { getDashboard };
