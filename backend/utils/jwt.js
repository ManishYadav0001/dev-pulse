const jwt = require("jsonwebtoken");

const createAppToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

module.exports = { createAppToken };
