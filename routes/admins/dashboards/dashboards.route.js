const express = require("express");

const Operations = require("./dashboards.operation");

const router = express.Router();

router.get("/statistics", Operations.getDashboardStats);
router.get("/recent-event", Operations.getRecentEvents);

module.exports = router;