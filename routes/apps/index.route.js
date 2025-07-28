const express = require('express');
const authenticate = require("../../middlewares/authMiddleware");

const router = express.Router();

router.use("/auth", require("./auth/auth.route"))

router.use(authenticate)

router.use("/profiles", require("./users/users.route"))
router.use("/payment-methods", require("./payment-methods/payment-methods.route"))
router.use("/organizations", require("./organizations/organizations.route"))
router.use("/promocodes", require("./promocodes/promocodes.route"))
router.use("/events", require("./events/events.route"))
router.use("/categories", require("./categories/categories.route"))

module.exports = router