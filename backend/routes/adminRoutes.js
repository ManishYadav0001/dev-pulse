const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const {
  getAdminUsers,
  getUserDashboardByAdmin,
} = require("../controllers/adminController");

const router = express.Router();

router.use(authMiddleware, roleMiddleware("admin"));
router.get("/users", getAdminUsers);
router.get("/dashboard/:userId", getUserDashboardByAdmin);

module.exports = router;
