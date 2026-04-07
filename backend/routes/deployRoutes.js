const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { getDeploymentStatus, getDeploymentStatusByRepo } = require("../controllers/deployController");

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get deployment status for all configured repositories
router.get("/status", getDeploymentStatus);

// Get deployment status for a specific repository
router.get("/status/:repoName", getDeploymentStatusByRepo);

module.exports = router;
