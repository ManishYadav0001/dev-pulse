const express = require("express");
const passport = require("passport");
const { githubFailure, githubSuccess } = require("../controllers/oauthController");
const authMiddleware = require("../middleware/authMiddleware");
const { login, logout, me, signup } = require("../controllers/authController");

const router = express.Router();
const oauthConfigured = Boolean(
  process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
);
const ensureOAuthConfigured = (_req, res, next) => {
  if (!oauthConfigured) {
    return res
      .status(500)
      .json({ message: "GitHub OAuth is not configured on the server." });
  }
  return next();
};

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", authMiddleware, me);

router.get(
  "/github",
  ensureOAuthConfigured,
  passport.authenticate("github", { scope: ["user", "repo"] })
);
router.get(
  "/github/reconnect",
  ensureOAuthConfigured,
  passport.authenticate("github", { scope: ["user", "repo"] })
);
router.get(
  "/github/callback",
  ensureOAuthConfigured,
  passport.authenticate("github", { failureRedirect: "/auth/github/failure", session: false }),
  githubSuccess
);
router.get("/github/failure", githubFailure);

module.exports = router;
