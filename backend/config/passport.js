const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const User = require("../models/User");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL:
          process.env.GITHUB_CALLBACK_URL || "http://127.0.0.1:5001/auth/github/callback",
        scope: ["user", "repo"],
      },
      async (accessToken, _refreshToken, profile, done) => {
        try {
          const githubId = String(profile.id);
          const githubUsername = (profile.username || "").toLowerCase();
          const primaryEmail =
            profile.emails?.[0]?.value?.toLowerCase() ||
            `${githubUsername || githubId}@users.noreply.github.com`;
          const displayName = profile.displayName || profile.username || "GitHub User";
          const githubAvatar = profile.photos?.[0]?.value || "";

          let user = await User.findOne({
            $or: [{ githubId }, { email: primaryEmail }],
          }).select("+accessToken");

          if (!user) {
            user = await User.create({
              name: displayName,
              email: primaryEmail,
              role: "developer",
              githubId,
              githubUsername,
              githubAvatar,
              accessToken,
              password: "",
            });
          } else {
            user.githubId = githubId;
            user.githubUsername = githubUsername;
            user.githubAvatar = githubAvatar;
            user.accessToken = accessToken;
            if (!user.name) user.name = displayName;
            await user.save();
          }

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
}

module.exports = passport;
