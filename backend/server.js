const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const roleMiddleware = require("./middleware/roleMiddleware");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  throw new Error("Missing required env vars: MONGO_URI and JWT_SECRET");
}

connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).json({ message: "DevPulse backend is running." });
});

app.use("/api/auth", authRoutes);

app.get(
  "/api/admin/dashboard",
  authMiddleware,
  roleMiddleware("admin"),
  (_req, res) => {
    res.status(200).json({
      message: "Admin dashboard data fetched successfully.",
      data: {
        totalUsers: 150,
        activeDevelopers: 87,
        openTickets: 12,
      },
    });
  }
);

app.get(
  "/api/developer/dashboard",
  authMiddleware,
  roleMiddleware("developer"),
  (_req, res) => {
    res.status(200).json({
      message: "Developer dashboard data fetched successfully.",
      data: {
        assignedTasks: 7,
        completedTasks: 23,
        pendingReviews: 3,
      },
    });
  }
);

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error." });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
