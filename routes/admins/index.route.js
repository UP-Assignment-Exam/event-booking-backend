const express = require('express');
const authenticate = require("../../middlewares/authMiddleware");

const router = express.Router();

router.use("/auth", require("./auth/auth.route"))
router.use("/roles", authenticate, require("./roles/roles.route"))
router.use("/rights", authenticate, require("./rights/rights.route"))
router.use("/user-request", authenticate, require("./user-requests/admin-user-requests.route"))
router.use("/request-categories", authenticate, require("./request-categories/request-categories.route"))
router.use("/categories", authenticate, require("./categories/categories.route"))
router.use("/ticket-types", authenticate, require("./ticket-types/ticket-types.route"))
router.use("/payment-methods", authenticate, require("./payment-methods/payment-methods.route"))
router.use("/events", authenticate, require("./events/events.route"))
router.use("/tickets", authenticate, require("./tickets/tickets.route"))

module.exports = router