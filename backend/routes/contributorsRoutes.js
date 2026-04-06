const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { getContributors } = require("../controllers/contributorsController");

const router = express.Router();

router.get("/", authMiddleware, getContributors);

module.exports = router;

