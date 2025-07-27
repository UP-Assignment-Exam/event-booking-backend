const express = require('express');
const authenticate = require("../../middlewares/authMiddleware");
const { upload, uploadFileHandler } = require('.././../services/upload.service');

const router = express.Router();

router.use("/auth", require("./auth/auth.route"))

router.use(authenticate);

router.use("/users", require("./users/users.route"))
router.use("/roles", require("./roles/roles.route"))
router.use("/rights", require("./rights/rights.route"))
router.use("/organizations", require("./organizations/organizations.route"))
router.use("/user-request", require("./user-requests/admin-user-requests.route"))
router.use("/request-categories", require("./request-categories/request-categories.route"))
router.use("/categories", require("./categories/categories.route"))
router.use("/ticket-types", require("./ticket-types/ticket-types.route"))
router.use("/payment-methods", require("./payment-methods/payment-methods.route"))
router.use("/events", require("./events/events.route"))
router.use("/tickets", require("./tickets/tickets.route"))
router.use("/promo-codes", require("./promo-codes/promo-codes.route"))

router.post('/upload', upload.single('file'), uploadFileHandler);

module.exports = router