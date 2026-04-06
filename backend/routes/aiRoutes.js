const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { getAIInsights } = require("../controllers/aiController");

const router = express.Router();

router.post("/insights", authMiddleware, getAIInsights);

module.exports = router;

