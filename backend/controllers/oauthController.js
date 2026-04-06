const { createAppToken } = require("../utils/jwt");

const githubSuccess = async (req, res) => {
  try {
    const token = createAppToken(req.user);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    return res.redirect(`${frontendUrl}/login?oauthToken=${encodeURIComponent(token)}`);
  } catch (error) {
    return res.status(500).json({ message: "OAuth login failed." });
  }
};

const githubFailure = (_req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  return res.redirect(`${frontendUrl}/login?oauthError=1`);
};

module.exports = {
  githubSuccess,
  githubFailure,
};
