const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const trimmedName = String(name).trim();
    const normalizedEmail = String(email).trim().toLowerCase();

    if (trimmedName.length < 2) {
      return res
        .status(400)
        .json({ message: "Name must be at least 2 characters long." });
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({ message: "Please enter a valid email." });
    }

    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        message:
          "Password must be 8+ chars and include uppercase, lowercase, number, and special character.",
      });
    }

    if (!["admin", "developer"].includes(role)) {
      return res.status(400).json({ message: "Invalid role." });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists with this email." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.create({
      name: trimmedName,
      email: normalizedEmail,
      password: hashedPassword,
      role,
    });

    return res.status(201).json({ message: "Signup successful." });
  } catch (error) {
    return res.status(500).json({ message: "Server error during signup." });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: "Email, password, and role are required." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({ message: "Please enter a valid email." });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    if (user.role !== role) {
      return res.status(403).json({ message: "Role mismatch. Access denied." });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error during login." });
  }
};

const logout = async (_req, res) => {
  return res.status(200).json({ message: "Logout successful." });
};

module.exports = {
  signup,
  login,
  logout,
};
