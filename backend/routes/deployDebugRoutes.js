const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { getDeployDebugInfo } = require("../controllers/deployDebugController");

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get debug info for all repositories
router.get("/debug", getDeployDebugInfo);

module.exports = router;
